// convex/league.ts
import { internalMutation, internalAction } from "./_generated/server";
import { query, mutation } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { v } from "convex/values";

// ===================
// LEAGUE OPERATIONS
// ===================

// Get all leagues
export const getAllLeagues = query({
    args: {},
    handler: async (ctx) => {
        const leagues = await ctx.db.query("leagues").order("desc").collect();
        const payments = await ctx.db.query("payments").collect();

        const leaguesWithDetails = await Promise.all(
            leagues.map(async (league) => {
                const leaguePayments = payments.filter(
                    p => p.league === league._id && p.status === "success"
                );

                const participantCount = leaguePayments.length;
                const prizeCalculation = calculatePrizeDistribution(participantCount);

                // Get actual accounts linked to this league
                const accounts = await ctx.db
                    .query("accounts")
                    .withIndex("byLeague", q => q.eq("leagues", league._id))
                    .collect();

                const activeParticipants = accounts.filter(a => a.status === "active").length;

                return {
                    ...league,
                    participantCount,
                    activeParticipants,
                    calculatedPrizePool: prizeCalculation.totalPool,
                    adminShare: prizeCalculation.adminShare,
                    participantPool: prizeCalculation.participantPool,
                    totalWinners: prizeCalculation.totalWinners,
                    prizeDistribution: prizeCalculation.distributions,
                };
            })
        );

        return leaguesWithDetails;
    },
});

// Get current active league (only one should exist)
export const getCurrentActiveLeague = query({
    args: {},
    handler: async (ctx) => {
        // First check and deactivate expired leagues
        const activeLeagues = await ctx.db
            .query("leagues")
            .withIndex("by_status", q => q.eq("status", "active"))
            .collect();

        const now = Date.now();
        const currentActiveLeagues = activeLeagues.filter(
            league => !league.endDate || now <= league.endDate
        );

        return currentActiveLeagues[0] || null;
    },
});

// Update league status
export const updateLeagueStatus = mutation({
    args: {
        leagueId: v.id("leagues"),
        status: v.union(v.literal("active"), v.literal("inactive"), v.literal("scheduled")),
        adminId: v.id("admins"),
    },
    handler: async (ctx, { leagueId, status, adminId }) => {
        const league = await ctx.db.get(leagueId);
        if (!league) {
            throw new Error("League not found");
        }

        // If activating, check if there's already an active league
        if (status === "active") {
            const existingActiveLeague = await ctx.runQuery(api.leagues.getCurrentActiveLeague, {});
            if (existingActiveLeague && existingActiveLeague._id !== leagueId) {
                throw new Error("There is already an active weekly competition. Please deactivate it first.");
            }
        }

        await ctx.db.patch(leagueId, {
            status,
            updatedAt: Date.now(),
        });

        await ctx.db.insert("activities", {
            type: "admin_action",
            adminId,
            entityId: leagueId,
            details: `Updated league "${league.name}" status to ${status}`,
            timestamp: Date.now(),
        });

        return { success: true };
    },
});

// Update league participant count and prize pool when new participant joins
export const updateLeagueParticipants = mutation({
    args: {
        leagueId: v.id("leagues"),
    },
    handler: async (ctx, { leagueId }) => {
        const league = await ctx.db.get(leagueId);
        if (!league) {
            throw new Error("League not found");
        }

        // Count total participants (successful payments)
        const payments = await ctx.db
            .query("payments")
            .withIndex("byLeague", q => q.eq("league", leagueId))
            .filter(q => q.eq(q.field("status"), "success"))
            .collect();

        const totalParticipants = payments.length;
        const prizeCalculation = calculatePrizeDistribution(totalParticipants);

        // Update league with calculated values
        await ctx.db.patch(leagueId, {
            totalParticipants,
            totalPrizePool: prizeCalculation.totalPool,
            adminShare: prizeCalculation.adminShare,
            participantPool: prizeCalculation.participantPool,
            updatedAt: Date.now(),
        });

        return prizeCalculation;
    },
});

// Get prize distribution details for a specific league
export const getLeaguePrizeDistribution = query({
    args: { leagueId: v.id("leagues") },
    handler: async (ctx, { leagueId }) => {
        const league = await ctx.db.get(leagueId);
        if (!league) {
            throw new Error("League not found");
        }

        const payments = await ctx.db
            .query("payments")
            .withIndex("byLeague", q => q.eq("league", leagueId))
            .filter(q => q.eq(q.field("status"), "success"))
            .collect();

        const participantCount = payments.length;
        const prizeCalculation = calculatePrizeDistribution(participantCount);

        return {
            league: {
                ...league,
                participantCount,
            },
            ...prizeCalculation
        };
    },
});

// Update league details
export const updateLeague = mutation({
    args: {
        leagueId: v.id("leagues"),
        updates: v.object({
            name: v.optional(v.string()),
            description: v.optional(v.string()),
            reward: v.optional(v.number()),
            exp: v.optional(v.number()),
            maxParticipants: v.optional(v.number()),
        }),
        adminId: v.id("admins"),
    },
    handler: async (ctx, { leagueId, updates, adminId }) => {
        const league = await ctx.db.get(leagueId);
        if (!league) {
            throw new Error("League not found");
        }

        // Validation
        if (updates.name !== undefined && !updates.name.trim()) {
            throw new Error("League name cannot be empty");
        }

        if (updates.exp !== undefined && updates.exp <= 0) {
            throw new Error("Entry fee must be greater than 0");
        }

        if (updates.reward !== undefined && updates.reward < 0) {
            throw new Error("Prize pool cannot be negative");
        }

        // Check for duplicate names (if name is being updated)
        if (updates.name && updates.name !== league.name) {
            const existingLeague = await ctx.db
                .query("leagues")
                .filter((q) => q.eq(q.field("name"), updates.name!.trim()))
                .first();

            if (existingLeague) {
                throw new Error("A league with this name already exists");
            }
        }

        await ctx.db.patch(leagueId, {
            ...updates,
            updatedAt: Date.now(),
        });

        // Log the activity
        await ctx.db.insert("activities", {
            type: "admin_action",
            adminId,
            entityId: leagueId,
            details: `Updated league "${league.name}"`,
            timestamp: Date.now(),
        });

        return { success: true };
    },
});

// Internal function to update all league statistics
export const updateAllLeagueStats = internalMutation({
    args: {},
    handler: async (ctx): Promise<{ updatedLeagues: number }> => {
        const leagues = await ctx.db.query("leagues").collect();
        const payments = await ctx.db.query("payments").collect();

        let updatedCount = 0;

        for (const league of leagues) {
            // Count successful payments for this league
            const leaguePayments = payments.filter(
                p => p.league === league._id && p.status === "success"
            );

            const totalParticipants = leaguePayments.length;
            const prizeCalculation = calculatePrizeDistribution(totalParticipants);

            // Only update if participant count has changed
            if (league.totalParticipants !== totalParticipants) {
                await ctx.db.patch(league._id, {
                    totalParticipants,
                    totalPrizePool: prizeCalculation.totalPool,
                    adminShare: prizeCalculation.adminShare,
                    participantPool: prizeCalculation.participantPool,
                    updatedAt: Date.now(),
                });
                updatedCount++;
            }
        }

        return { updatedLeagues: updatedCount };
    },
});

// Auto-deactivate expired leagues (public mutation)
export const checkAndDeactivateExpiredLeagues = mutation({
    args: {},
    handler: async (ctx): Promise<number> => {
        const now = Date.now();
        const activeLeagues = await ctx.db
            .query("leagues")
            .withIndex("by_status", q => q.eq("status", "active"))
            .collect();

        const deactivatedCount = await Promise.all(
            activeLeagues
                .filter(league => league.endDate && now > league.endDate)
                .map(async (league) => {
                    await ctx.db.patch(league._id, {
                        status: "inactive",
                        updatedAt: now
                    });

                    // Log the auto-deactivation
                    await ctx.db.insert("activities", {
                        type: "league_auto_ended",
                        entityId: league._id,
                        details: `Auto-ended weekly competition: ${league.name}`,
                        timestamp: now,
                    });

                    return 1;
                })
        );

        return deactivatedCount.length;
    },
});

// Internal function for daily maintenance tasks
export const dailyLeagueMaintenance = internalAction({
    args: {},
    handler: async (ctx): Promise<{
        deactivatedLeagues: number;
        updatedLeagues: number;
        timestamp: number;
    }> => {
        const now = Date.now();

        // 1. Deactivate expired leagues
        const deactivatedCount: number = await ctx.runMutation(api.leagues.checkAndDeactivateExpiredLeagues, {});

        // 2. Update all league statistics
        const statsUpdate: { updatedLeagues: number } = await ctx.runMutation(internal.leagues.updateAllLeagueStats, {});

        // 3. Log maintenance activity if any changes were made
        if (deactivatedCount > 0 || statsUpdate.updatedLeagues > 0) {
            await ctx.runMutation(internal.leagues.logMaintenanceActivity, {
                deactivatedCount,
                updatedLeagues: statsUpdate.updatedLeagues,
                timestamp: now
            });
        }

        return {
            deactivatedLeagues: deactivatedCount,
            updatedLeagues: statsUpdate.updatedLeagues,
            timestamp: now
        };
    },
});

// Create new weekly league with auto-scheduling
export const createWeeklyLeague = mutation({
    args: {
        name: v.string(),
        description: v.optional(v.string()),
        maxParticipants: v.optional(v.number()),
        adminId: v.id("admins"),
    },
    handler: async (ctx, { adminId, ...leagueData }) => {
        // First deactivate any expired leagues
        await ctx.runMutation(api.leagues.checkAndDeactivateExpiredLeagues);

        // Check if there's already an active league
        const existingActiveLeague = await ctx.runQuery(api.leagues.getCurrentActiveLeague, {});
        if (existingActiveLeague) {
            throw new Error("There is already an active weekly competition. Only one competition can be active at a time.");
        }

        // Validation
        if (!leagueData.name.trim()) {
            throw new Error("Competition name is required");
        }

        // Auto-schedule: Monday to Friday
        const mondayStart = getNextMondayStart();
        const fridayEnd = getFridayEnd(mondayStart);

        const leagueId = await ctx.db.insert("leagues", {
            ...leagueData,
            name: leagueData.name.trim(),
            description: leagueData.description?.trim() || "",
            exp: 100, // Fixed $100 entry fee
            status: "active",
            startDate: mondayStart.getTime(),
            endDate: fridayEnd.getTime(),
            createdBy: adminId,
            totalParticipants: 0,
            totalPrizePool: 0,
            adminShare: 0,
            participantPool: 0,
            updatedAt: Date.now(),
        });

        // Log the activity
        await ctx.db.insert("activities", {
            type: "league_created",
            adminId,
            entityId: leagueId,
            details: `Created weekly competition: ${leagueData.name} (${mondayStart.toDateString()} - ${fridayEnd.toDateString()})`,
            timestamp: Date.now(),
        });

        return leagueId;
    },
});

// Log maintenance activity
export const logMaintenanceActivity = internalMutation({
    args: {
        deactivatedCount: v.number(),
        updatedLeagues: v.number(),
        timestamp: v.number()
    },
    handler: async (ctx, { deactivatedCount, updatedLeagues, timestamp }): Promise<void> => {
        let details = "Daily maintenance: ";
        const activities = [];

        if (deactivatedCount > 0) {
            activities.push(`${deactivatedCount} expired leagues deactivated`);
        }

        if (updatedLeagues > 0) {
            activities.push(`${updatedLeagues} league statistics updated`);
        }

        details += activities.join(", ");

        await ctx.db.insert("activities", {
            type: "admin_action",
            details,
            timestamp,
        });
    },
});

// Allow creating leagues for specific future weeks
export const createScheduledLeague = mutation({
    args: {
        name: v.string(),
        description: v.optional(v.string()),
        maxParticipants: v.optional(v.number()),
        weekOffset: v.optional(v.number()), // 0 = this week, 1 = next week, etc.
        adminId: v.id("admins"),
    },
    handler: async (ctx, { weekOffset = 1, adminId, ...args }) => {
        // Calculate target Monday
        const now = new Date();
        const targetMonday = new Date(now);

        const daysUntilMonday = (8 - now.getDay()) % 7;
        targetMonday.setDate(now.getDate() + daysUntilMonday + (weekOffset * 7));
        targetMonday.setHours(9, 0, 0, 0);

        const fridayEnd = new Date(targetMonday);
        fridayEnd.setDate(targetMonday.getDate() + 4);
        fridayEnd.setHours(17, 0, 0, 0);

        // Check if league already exists for this week
        const existingLeague = await ctx.db
            .query("leagues")
            .withIndex("by_start_date", q => q.eq("startDate", targetMonday.getTime()))
            .first();

        if (existingLeague) {
            throw new Error(`Competition already exists for week of ${targetMonday.toDateString()}`);
        }

        // If creating for current week and there's already an active league
        const isCurrentWeek = weekOffset === 0;
        if (isCurrentWeek) {
            const existingActiveLeague = await ctx.runQuery(api.leagues.getCurrentActiveLeague, {});
            if (existingActiveLeague) {
                throw new Error("There is already an active weekly competition.");
            }
        }

        // Determine status - active if current week, scheduled if future
        const status = isCurrentWeek ? "active" : "scheduled";

        const leagueId = await ctx.db.insert("leagues", {
            name: args.name.trim(),
            description: args.description?.trim() || "",
            exp: 100,
            status,
            startDate: targetMonday.getTime(),
            endDate: fridayEnd.getTime(),
            maxParticipants: args.maxParticipants,
            createdBy: adminId,
            totalParticipants: 0,
            totalPrizePool: 0,
            adminShare: 0,
            participantPool: 0,
            updatedAt: Date.now(),
        });

        await ctx.db.insert("activities", {
            type: "league_created",
            adminId,
            entityId: leagueId,
            details: `${status === 'active' ? 'Created active' : 'Pre-scheduled'} weekly competition: ${args.name} (${targetMonday.toDateString()} - ${fridayEnd.toDateString()})`,
            timestamp: Date.now(),
        });

        return leagueId;
    },
});

// Auto-activate scheduled leagues when Monday arrives
export const activateScheduledLeagues = internalMutation({
    args: {},
    handler: async (ctx): Promise<number> => {
        const now = Date.now();

        // Deactivate expired leagues first
        await ctx.runMutation(api.leagues.checkAndDeactivateExpiredLeagues, {});

        // Find scheduled leagues that should start now
        const scheduledLeagues = await ctx.db
            .query("leagues")
            .withIndex("by_status", q => q.eq("status", "scheduled"))
            .collect();

        let activatedCount = 0;
        for (const league of scheduledLeagues) {
            if (league.startDate && now >= league.startDate) {
                await ctx.db.patch(league._id, {
                    status: "active",
                    updatedAt: now
                });

                await ctx.db.insert("activities", {
                    type: "league_created",
                    entityId: league._id,
                    details: `Auto-activated scheduled competition: ${league.name}`,
                    timestamp: now,
                });

                activatedCount++;
            }
        }

        return activatedCount;
    },
});



// Helper functions

// Prize pool calculation logic
export const calculatePrizeDistribution = (totalParticipants: number) => {
    const entryFee = 100; // Fixed $100 entry fee
    const totalPool = totalParticipants * entryFee;
    const adminShare = totalPool * 0.5; // 50% to admin
    const participantPool = totalPool - adminShare;

    const prizeStructure = [
        { position: 1, percentage: 30, cap: 4000 },
        { position: 2, percentage: 25, cap: 3000 },
        { position: 3, percentage: 20, cap: 2000 },
        { position: 4, percentage: 15, cap: 1500 },
        { position: 5, percentage: 10, cap: 1000 },
    ];

    let remainingBalance = participantPool;
    const distributions = [];

    // Calculate top 1-5 positions
    for (const prize of prizeStructure) {
        const calculatedAmount = (participantPool * prize.percentage) / 100;
        const finalAmount = Math.min(calculatedAmount, prize.cap);
        distributions.push({
            position: prize.position,
            percentage: prize.percentage,
            amount: finalAmount,
            capped: calculatedAmount > prize.cap
        });
        remainingBalance -= finalAmount;
    }

    // Calculate 6th to 10th positions ($200 each)
    const positions6to10 = 5;
    const fixedAmount6to10 = 200;
    const total6to10 = positions6to10 * fixedAmount6to10;

    let additionalWinners = 0;
    if (remainingBalance >= total6to10) {
        remainingBalance -= total6to10;
        // Calculate additional winners (11th onwards) - $100 each
        additionalWinners = Math.floor(remainingBalance / 100);
        remainingBalance -= (additionalWinners * 100);
    }

    return {
        totalParticipants,
        entryFee,
        totalPool,
        adminShare,
        participantPool,
        distributions,
        additionalWinners,
        totalWinners: Math.min(5 + (remainingBalance >= total6to10 ? 5 : 0) + additionalWinners, totalParticipants),
        remainingBalance
    };
};

// Get next Monday at 9 AM UTC
const getNextMondayStart = () => {
    const now = new Date();
    const nextMonday = new Date(now);

    // Find next Monday
    const daysUntilMonday = (8 - now.getDay()) % 7;
    if (daysUntilMonday === 0 && now.getDay() === 1) {
        // If it's already Monday, check if it's before 9 AM
        const nineAM = new Date(now);
        nineAM.setHours(9, 0, 0, 0);
        if (now >= nineAM) {
            // It's already past 9 AM Monday, so next Monday
            nextMonday.setDate(now.getDate() + 7);
        }
    } else {
        nextMonday.setDate(now.getDate() + daysUntilMonday);
    }

    nextMonday.setHours(9, 0, 0, 0); // 9 AM start
    return nextMonday;
};

// Get Friday end time (Friday 5 PM UTC same week as Monday)
const getFridayEnd = (mondayStart: Date) => {
    const fridayEnd = new Date(mondayStart);
    fridayEnd.setDate(mondayStart.getDate() + 4); // Add 4 days to Monday to get Friday
    fridayEnd.setHours(17, 0, 0, 0); // 5 PM end
    return fridayEnd;
};