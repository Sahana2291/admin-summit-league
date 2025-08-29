// convex/admin.ts - Updated Admin Functions
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

// Get comprehensive dashboard stats
export const getDashboardStats = query({
    args: {},
    handler: async (ctx) => {
        // const [users, accounts, leagues, payments, activities] = await Promise.all([
        const [users, accounts, leagues, activities] = await Promise.all([
            ctx.db.query("users").collect(),
            ctx.db.query("accounts").collect(),
            ctx.db.query("leagues").collect(),
            // ctx.db.query("payments").collect(),
            ctx.db.query("activities").order("desc").take(50)
        ]);

        const activeUsers = users.filter(u => u.isActive);
        const activeLeagues = leagues.filter(l => l.status === "active");
        // const successfulPayments = payments.filter(p => p.status === "success");
        // const totalRevenue = successfulPayments.reduce((sum, p) => sum + p.amount, 0);
        // const activePrizePool = activeLeagues.reduce((sum, l) => sum + l.reward, 0);

        // Get league participants (users with active accounts in active leagues)
        const leagueParticipants = accounts.filter(a =>
            a.status === "active" &&
            a.leagues &&
            activeLeagues.some(l => l._id === a.leagues)
        );

        return {
            totalUsers: users.length,
            totalUsersGrowth: 12.5, // Calculate this based on timeframe
            activeUsers: activeUsers.length,
            leagueParticipants: leagueParticipants.length,
            participantsGrowth: 8.3,
            totalTradingAccounts: accounts.length,
            accountsGrowth: 15.7,
            activeAccounts: accounts.filter(a => a.status === "active").length,
            totalRevenue: 0,
            revenueGrowth: 23.2,
            activePrizePool: 0,
            weeklyDistribution: 0, // activePrizePool * 0.5, // 50% weekly distribution
            avgAccountsPerUser: accounts.length / activeUsers.length || 0,
            avgProfitLoss: 1250.75, // Calculate from actual account data
            totalLeagues: leagues.length,
            activeLeagues: activeLeagues.length,
            totalPayments: 0, // payments.length,
            pendingPayments: 0, //payments.filter(p => p.status === "pending").length,
            recentActivities: activities
        };
    },
});

// Get recent activities with more detail
export const getRecentActivities = query({
    args: { limit: v.optional(v.number()) },
    handler: async (ctx, { limit = 10 }) => {
        const activities = await ctx.db
            .query("activities")
            .withIndex("by_timestamp")
            .order("desc")
            .take(limit);

        return activities;
    },
});

// User management queries
export const getAllUsers = query({
    args: {},
    handler: async (ctx) => {
        const users = await ctx.db.query("users").order("desc").collect();

        // Get account count for each user
        const usersWithAccounts = await Promise.all(
            users.map(async (user) => {
                const accounts = await ctx.db
                    .query("accounts")
                    .withIndex("byUserId", (q) => q.eq("user", user._id))
                    .collect();

                return {
                    ...user,
                    accountCount: accounts.length,
                    activeAccounts: accounts.filter(a => a.status === "active").length,
                };
            })
        );

        return usersWithAccounts;
    },
});

// Account management queries
export const getAllAccounts = query({
    args: {},
    handler: async (ctx) => {
        const accounts = await ctx.db.query("accounts").order("desc").collect();

        // Get user details for each account
        const accountsWithUsers = await Promise.all(
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

        return accountsWithUsers;
    },
});

// League management queries
export const getAllLeagues = query({
    args: {},
    handler: async (ctx) => {
        const leagues = await ctx.db.query("leagues").order("desc").collect();

        // Get participant count for each league
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

// Payment management queries
export const getAllPayments = query({
    args: {},
    handler: async (ctx) => {
        const payments = await ctx.db.query("payments").order("desc").collect();

        // Get user details for each payment
        const paymentsWithUsers = await Promise.all(
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

        return paymentsWithUsers;
    },
});

// Log admin activity
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

// Create sample admin (for development)
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

// Update user status
export const updateUserStatus = mutation({
    args: {
        userId: v.id("users"),
        isActive: v.boolean(),
        adminId: v.id("admins"),
    },
    handler: async (ctx, { userId, isActive, adminId }) => {
        const user = await ctx.db.get(userId);
        if (!user) throw new Error("User not found");

        await ctx.db.patch(userId, {
            isActive,
            updatedAt: Date.now(),
        });

        // Log the activity
        await ctx.db.insert("activities", {
            type: "user_suspended",
            adminId,
            userId,
            userEmail: user.email,
            details: isActive ? "User activated" : "User suspended",
            timestamp: Date.now(),
        });

        return { success: true };
    },
});

// Create new league
export const createLeague = mutation({
    args: {
        name: v.string(),
        exp: v.number(),
        reward: v.number(),
        description: v.optional(v.string()),
        maxParticipants: v.optional(v.number()),
        adminId: v.id("admins"),
    },
    handler: async (ctx, { adminId, ...leagueData }) => {
        const leagueId = await ctx.db.insert("leagues", {
            ...leagueData,
            status: "active",
            currentParticipants: 0,
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