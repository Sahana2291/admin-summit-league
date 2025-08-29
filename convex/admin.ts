// convex/admin.ts
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// Admin authentication
export const authenticateAdmin = query({
    args: { email: v.string(), password: v.string() },
    handler: async (ctx, args) => {
        const admin = await ctx.db
            .query("admins")
            .withIndex("by_email", (q) => q.eq("email", args.email))
            .first();

        if (!admin || admin.password !== args.password || !admin.isActive) {
            return null;
        }

        return {
            id: admin._id,
            email: admin.email,
            name: admin.name,
            role: admin.role,
        };
    },
});

// Dashboard statistics
export const getDashboardStats = query({
    args: {},
    handler: async (ctx) => {
        const [users, accounts, leagues, payments, activities] = await Promise.all([
            ctx.db.query("users").collect(),
            ctx.db.query("accounts").collect(),
            ctx.db.query("leagues").collect(),
            ctx.db.query("payments").collect(),
            ctx.db.query("activities").order("desc").take(50)
        ]);

        const activeUsers = users.filter(u => u.isActive);
        const activeLeagues = leagues.filter(l => l.status === "active");
        const successfulPayments = payments.filter(p => p.status === "success");
        const totalRevenue = successfulPayments.reduce((sum, p) => sum + p.amount, 0);
        const activePrizePool = activeLeagues.reduce((sum, l) => sum + l.reward, 0);

        // Calculate growth rates (mock data - in production, compare with historical data)
        const totalUsersGrowth = 12.5;
        const participantsGrowth = 8.3;
        const accountsGrowth = 15.7;
        const revenueGrowth = 23.2;

        // Get league participants
        const leagueParticipants = accounts.filter(a =>
            a.status === "active" &&
            a.leagues &&
            activeLeagues.some(l => l._id === a.leagues)
        );

        return {
            totalUsers: users.length,
            totalUsersGrowth,
            activeUsers: activeUsers.length,
            leagueParticipants: leagueParticipants.length,
            participantsGrowth,
            totalTradingAccounts: accounts.length,
            accountsGrowth,
            activeAccounts: accounts.filter(a => a.status === "active").length,
            totalRevenue,
            revenueGrowth,
            activePrizePool,
            weeklyDistribution: activePrizePool * 0.5,
            avgAccountsPerUser: accounts.length / activeUsers.length || 0,
            avgProfitLoss: 1250.75, // Calculate from actual account data in production
            totalLeagues: leagues.length,
            activeLeagues: activeLeagues.length,
            totalPayments: payments.length,
            successfulPayments: successfulPayments.length,
            pendingPayments: payments.filter(p => p.status === "pending").length,
            failedPayments: payments.filter(p => p.status === "failed").length,
            recentActivities: activities
        };
    },
});

// Get all leagues
export const getAllLeagues = query({
    args: {},
    handler: async (ctx) => {
        const leagues = await ctx.db.query("leagues").order("desc").collect();

        const leaguesWithParticipants = await Promise.all(
            leagues.map(async (league) => {
                const accounts = await ctx.db
                    .query("accounts")
                    .withIndex("byLeague", (q) => q.eq("leagues", league._id))
                    .collect();

                return {
                    ...league,
                    participantCount: accounts.length,
                    activeParticipants: accounts.filter(a => a.status === "active").length,
                };
            })
        );

        return leaguesWithParticipants;
    },
});

// Get all payments
export const getAllPayments = query({
    args: {},
    handler: async (ctx) => {
        const payments = await ctx.db.query("payments").order("desc").collect();

        const paymentsWithDetails = await Promise.all(
            payments.map(async (payment) => {
                const user = await ctx.db.get(payment.user);
                const league = payment.league ? await ctx.db.get(payment.league) : null;

                return {
                    ...payment,
                    userName: user ? `${user.firstName} ${user.lastName}` : "Unknown",
                    userEmail: user?.email,
                    leagueName: league?.name,
                };
            })
        );

        return paymentsWithDetails;
    },
});

// Get all accounts
export const getAllAccounts = query({
    args: {},
    handler: async (ctx) => {
        const accounts = await ctx.db.query("accounts").order("desc").collect();

        const accountsWithDetails = await Promise.all(
            accounts.map(async (account) => {
                const user = await ctx.db.get(account.user);
                const league = account.leagues ? await ctx.db.get(account.leagues) : null;

                return {
                    ...account,
                    userName: user ? `${user.firstName} ${user.lastName}` : "Unknown",
                    userEmail: user?.email,
                    leagueName: league?.name,
                };
            })
        );

        return accountsWithDetails;
    },
});

// Get all users
export const getAllUsers = query({
    args: {},
    handler: async (ctx) => {
        const users = await ctx.db.query("users").order("desc").collect();

        const usersWithAccounts = await Promise.all(
            users.map(async (user) => {
                const accounts = await ctx.db
                    .query("accounts")
                    .withIndex("byUserId", (q) => q.eq("user", user._id))
                    .collect();

                const payments = await ctx.db
                    .query("payments")
                    .withIndex("byUser", (q) => q.eq("user", user._id))
                    .collect();

                return {
                    ...user,
                    accountCount: accounts.length,
                    activeAccounts: accounts.filter(a => a.status === "active").length,
                    totalPayments: payments.length,
                    totalSpent: payments
                        .filter(p => p.status === "success")
                        .reduce((sum, p) => sum + p.amount, 0),
                };
            })
        );

        return usersWithAccounts;
    },
});

// Create a new league
export const createLeague = mutation({
    args: {
        name: v.string(),
        exp: v.number(),
        reward: v.number(),
        description: v.optional(v.string()),
        maxParticipants: v.optional(v.number()),
        adminId: v.id("admins"),
    },
    handler: async (ctx, { adminId, maxParticipants, ...leagueData }) => {
        // Validation
        if (!leagueData.name.trim()) {
            throw new Error("League name is required");
        }

        if (leagueData.exp <= 0) {
            throw new Error("Entry fee must be greater than 0");
        }

        if (leagueData.reward < 0) {
            throw new Error("Prize pool cannot be negative");
        }

        // Check for duplicate names
        const existingLeague = await ctx.db
            .query("leagues")
            .filter((q) => q.eq(q.field("name"), leagueData.name.trim()))
            .first();

        if (existingLeague) {
            throw new Error("A league with this name already exists");
        }

        const leagueId = await ctx.db.insert("leagues", {
            ...leagueData,
            name: leagueData.name.trim(),
            description: leagueData.description?.trim() || "",
            status: "active",
            createdAt: Date.now(),
            updatedAt: Date.now(),
        });

        // Log the activity
        await ctx.db.insert("activities", {
            type: "league_created",
            adminId,
            entityId: leagueId,
            details: `Created league: ${leagueData.name}`,
            timestamp: Date.now(),
        });

        return leagueId;
    },
});

// Update league status
export const updateLeagueStatus = mutation({
    args: {
        leagueId: v.id("leagues"),
        status: v.union(v.literal("active"), v.literal("inactive")),
        adminId: v.id("admins"),
    },
    handler: async (ctx, { leagueId, status, adminId }) => {
        const league = await ctx.db.get(leagueId);
        if (!league) {
            throw new Error("League not found");
        }

        await ctx.db.patch(leagueId, {
            status,
            updatedAt: Date.now(),
        });

        // Log the activity
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
                .filter((q) => q.eq(q.field("name"), updates.name.trim()))
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

// Process payment refund
export const processRefund = mutation({
    args: {
        paymentId: v.id("payments"),
        adminId: v.id("admins"),
        reason: v.optional(v.string()),
    },
    handler: async (ctx, { paymentId, adminId, reason }) => {
        const payment = await ctx.db.get(paymentId);
        if (!payment) {
            throw new Error("Payment not found");
        }

        if (payment.status !== "success") {
            throw new Error("Can only refund successful payments");
        }

        // Update payment status
        await ctx.db.patch(paymentId, {
            status: "failed", // Using failed as refunded status
            updatedAt: Date.now(),
        });

        // Find and update associated account status
        const account = await ctx.db
            .query("accounts")
            .withIndex("byUserId", (q) => q.eq("user", payment.user))
            .filter((q) => q.eq(q.field("payment"), paymentId))
            .first();

        if (account) {
            await ctx.db.patch(account._id, {
                status: "inactive",
                updatedAt: Date.now(),
            });
        }

        // Log the refund activity
        await ctx.db.insert("activities", {
            type: "admin_action",
            adminId,
            userId: payment.user,
            entityId: paymentId,
            amount: payment.amount,
            details: `Processed refund: ${reason || "Admin initiated refund"}`,
            timestamp: Date.now(),
        });

        return { success: true };
    },
});

// Get payment statistics
export const getPaymentStatistics = query({
    args: {
        leagueId: v.optional(v.id("leagues")),
        timeframe: v.optional(v.union(
            v.literal("today"),
            v.literal("week"),
            v.literal("month"),
            v.literal("all")
        )),
    },
    handler: async (ctx, { leagueId, timeframe = "all" }) => {
        let payments = await ctx.db.query("payments").collect();

        // Filter by league if specified
        if (leagueId) {
            payments = payments.filter(p => p.league === leagueId);
        }

        // Filter by timeframe
        if (timeframe !== "all") {
            const now = new Date();
            const cutoffDate = new Date();

            switch (timeframe) {
                case "today":
                    cutoffDate.setHours(0, 0, 0, 0);
                    break;
                case "week":
                    cutoffDate.setDate(now.getDate() - 7);
                    break;
                case "month":
                    cutoffDate.setDate(now.getDate() - 30);
                    break;
            }

            payments = payments.filter(p =>
                (p.updatedAt || 0) > cutoffDate.getTime()
            );
        }

        const total = payments.length;
        const successful = payments.filter(p => p.status === "success").length;
        const pending = payments.filter(p => p.status === "pending").length;
        const failed = payments.filter(p => p.status === "failed").length;
        const revenue = payments
            .filter(p => p.status === "success")
            .reduce((sum, p) => sum + p.amount, 0);

        return {
            total,
            successful,
            pending,
            failed,
            revenue,
            successRate: total > 0 ? (successful / total) * 100 : 0,
        };
    },
});

// Get recent activities
export const getRecentActivities = query({
    args: {
        limit: v.optional(v.number()),
        offset: v.optional(v.number()),
        type: v.optional(v.string()),
    },
    handler: async (ctx, { limit = 50, offset = 0, type }) => {
        let query = ctx.db
            .query("activities")
            .withIndex("by_timestamp")
            .order("desc");

        if (type) {
            // Filter by activity type (this would need a compound index in production)
            const activities = await query.collect();
            const filtered = activities.filter(a => a.type === type);
            return filtered.slice(offset, offset + limit);
        }

        // Skip and take for pagination
        const activities = await query.collect();
        return activities.slice(offset, offset + limit);
    },
});

// Update user status
export const updateUserStatus = mutation({
    args: {
        userId: v.id("users"),
        isActive: v.boolean(),
        adminId: v.id("admins"),
        reason: v.optional(v.string()),
    },
    handler: async (ctx, { userId, isActive, adminId, reason }) => {
        const user = await ctx.db.get(userId);
        if (!user) throw new Error("User not found");

        await ctx.db.patch(userId, {
            isActive,
            updatedAt: Date.now(),
        });

        // Log the activity with more details
        await ctx.db.insert("activities", {
            type: "user_suspended",
            adminId,
            userId,
            userEmail: user.email,
            details: `${isActive ? "Activated" : "Suspended"} user${reason ? `: ${reason}` : ""}`,
            timestamp: Date.now(),
        });

        return { success: true };
    },
});

// Log user activity
export const logActivity = mutation({
    args: {
        type: v.union(
            v.literal("registration"),
            v.literal("league_join"),
            v.literal("account_link"),
            v.literal("prize_claim"),
            v.literal("payment_processed"),
            v.literal("account_created"),
            v.literal("league_created"),
            v.literal("user_suspended"),
            v.literal("admin_action")
        ),
        adminId: v.optional(v.id("admins")),
        userId: v.optional(v.id("users")),
        userEmail: v.optional(v.string()),
        entityId: v.optional(v.string()),
        amount: v.optional(v.number()),
        details: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("activities", {
            ...args,
            timestamp: Date.now(),
        });
    },
});

// Create a sample admin
export const createSampleAdmin = mutation({
    args: {},
    handler: async (ctx) => {
        const existingAdmin = await ctx.db
            .query("admins")
            .withIndex("by_email", (q) => q.eq("email", "admin@leadershipleague.com"))
            .first();

        if (existingAdmin) {
            return existingAdmin._id;
        }

        return await ctx.db.insert("admins", {
            email: "admin@leadershipleague.com",
            password: "admin123", // In production, use proper hashing
            name: "System Administrator",
            role: "super_admin",
            isActive: true,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        });
    },
});