// convex/admin.ts
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { calculatePrizeDistribution } from './leagues';

// ===================
// ADMIN OPERATIONS
// ===================

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

// ===================
// DASHBOARD OPERATIONS
// ===================

// Dashboard statistics
export const getDashboardStats = query({
    args: {},
    handler: async (ctx) => {
        const [users, accounts, leagues, payments, activities, snapshots] = await Promise.all([
            ctx.db.query("users").collect(),
            ctx.db.query("accounts").collect(),
            ctx.db.query("leagues").collect(),
            ctx.db.query("payments").collect(),
            ctx.db.query("activities").order("desc").take(50),
            ctx.db.query("snapshots").collect()
        ]);

        const activeUsers = users.filter(u => u.isActive !== false); // Default to active
        const activeLeagues = leagues.filter(l => l.status === "active");
        const successfulPayments = payments.filter(p => p.status === "success");

        // Calculate growth rates (30 days ago vs current)
        const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
        const sixtyDaysAgo = Date.now() - (60 * 24 * 60 * 60 * 1000);

        // User growth
        const recentUsers = users.filter(u => u._creationTime > thirtyDaysAgo).length;
        const totalUsersGrowth = users.length > 0 ? (recentUsers / users.length * 100) : 0;

        // Account growth  
        const recentAccounts = accounts.filter(a => a._creationTime > thirtyDaysAgo).length;
        const accountsGrowth = accounts.length > 0 ? (recentAccounts / accounts.length * 100) : 0;

        // Revenue growth
        const recentRevenue = successfulPayments
            .filter(p => (p.updatedAt || 0) > thirtyDaysAgo)
            .reduce((sum, p) => sum + p.amount, 0);
        const totalRevenue = successfulPayments.reduce((sum, p) => sum + p.amount, 0);
        const revenueGrowth = totalRevenue > 0 ? (recentRevenue / totalRevenue * 100) : 0;

        // Calculate total participants and total prize pool from all leagues
        let totalParticipants = 0;
        let totalPrizePool = 0;

        for (const league of leagues) {
            const leaguePayments = successfulPayments.filter(p => p.league === league._id);
            const participantCount = leaguePayments.length;
            const prizeCalc = calculatePrizeDistribution(participantCount);

            totalParticipants += participantCount;
            totalPrizePool += prizeCalc.totalPool;
        }

        // Participants growth (from recent league joins)
        const recentParticipants = successfulPayments
            .filter(p => (p.updatedAt || 0) > thirtyDaysAgo).length;
        const participantsGrowth = totalParticipants > 0 ? (recentParticipants / totalParticipants * 100) : 0;

        // Average P&L from snapshots
        const avgProfitLoss = snapshots.length > 0
            ? snapshots.reduce((sum, s) => sum + (s.realizedPnl || 0), 0) / snapshots.length
            : 0;

        // Calculate current active league stats
        const currentLeague = activeLeagues[0];
        let activePrizePool = 0;
        let activeParticipants = 0;

        if (currentLeague) {
            activeParticipants = currentLeague.totalParticipants || 0;
            activePrizePool = currentLeague.participantPool || 0;
        }

        // P&L Performance calculations
        // Current month average P&L
        const currentMonthSnapshots = snapshots.filter(s => s._creationTime > thirtyDaysAgo);
        const currentMonthAvgPnL = currentMonthSnapshots.length > 0
            ? currentMonthSnapshots.reduce((sum, s) => sum + (s.realizedPnl || 0), 0) / currentMonthSnapshots.length
            : 0;

        // Previous month average P&L  
        const previousMonthSnapshots = snapshots.filter(s =>
            s._creationTime > sixtyDaysAgo && s._creationTime <= thirtyDaysAgo
        );
        const previousMonthAvgPnL = previousMonthSnapshots.length > 0
            ? previousMonthSnapshots.reduce((sum, s) => sum + (s.realizedPnl || 0), 0) / previousMonthSnapshots.length
            : 0;

        // Calculate P&L growth percentage
        const pnlGrowth = previousMonthAvgPnL !== 0
            ? ((currentMonthAvgPnL - previousMonthAvgPnL) / Math.abs(previousMonthAvgPnL)) * 100
            : 0;

        return {
            totalUsers: users.length,
            totalUsersGrowth: totalUsersGrowth || 0,
            activeUsers: activeUsers.length,

            // Updated to show total participants across all leagues
            totalParticipants,
            leagueParticipants: activeParticipants,
            participantsGrowth: participantsGrowth || 0,

            totalTradingAccounts: accounts.length,
            accountsGrowth: accountsGrowth || 0,
            activeAccounts: accounts.filter(a => a.status === "active").length,

            totalRevenue,
            revenueGrowth: revenueGrowth || 0,
            totalPrizePool, // Total prize pool across all competitions
            activePrizePool, // Current active competition prize pool

            weeklyDistribution: activePrizePool * 1.0, // 100% of participant pool distributed
            avgAccountsPerUser: activeUsers.length > 0 ? accounts.length / activeUsers.length : 0,

            totalLeagues: leagues.length,
            activeLeagues: activeLeagues.length,

            totalPayments: payments.length,
            successfulPayments: successfulPayments.length,
            pendingPayments: payments.filter(p => p.status === "pending").length,
            failedPayments: payments.filter(p => p.status === "failed").length,

            recentActivities: activities,

            // Current competition info
            currentCompetition: currentLeague ? {
                name: currentLeague.name,
                participants: activeParticipants,
                prizePool: activePrizePool,
                startDate: currentLeague.startDate,
                endDate: currentLeague.endDate,
                maxParticipants: currentLeague.maxParticipants
            } : null,

            // P&L Performance
            avgProfitLoss: avgProfitLoss || 0,
            avgProfitLossGrowth: pnlGrowth || 0,
        };
    },
});

// ===================
// ACCOUNT OPERATIONS
// ===================

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

// ===================
// USER OPERATIONS
// ===================

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

// ===================
// PAYMENT OPERATIONS
// ===================

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
            updatedAt: Date.now(),
        });
    },
});

// ===================
// AFFILIATE QUERIES
// ===================

// Get affiliate dashboard stats
export const getAffiliateStats = query({
    args: {},
    handler: async (ctx) => {
        const [referrals, commissions, users] = await Promise.all([
            ctx.db.query("referrals").collect(),
            ctx.db.query("affiliate_commissions").collect(),
            ctx.db.query("users").collect()
        ]);

        const activeAffiliates = users.filter(u => u.referralCode && u.referralCode.trim() !== '').length;
        const totalReferrals = referrals.length;
        const totalCommissions = commissions.reduce((sum, c) => sum + c.commissionAmount, 0);
        const pendingCommissions = commissions.filter(c => c.status === 'pending').length;
        const pendingAmount = commissions.filter(c => c.status === 'pending').reduce((sum, c) => sum + c.commissionAmount, 0);

        return {
            activeAffiliates,
            totalReferrals,
            totalCommissions,
            pendingCommissions,
            pendingAmount,
            completedReferrals: referrals.filter(r => r.status === 'completed').length,
            averageCommissionPerReferral: totalReferrals > 0 ? totalCommissions / totalReferrals : 0
        };
    },
});

// Get top performing affiliates
export const getTopAffiliates = query({
    args: { limit: v.optional(v.number()) },
    handler: async (ctx, { limit = 10 }) => {
        const users = await ctx.db.query("users").collect();
        const affiliateUsers = users.filter(u => u.referralCode && u.referralCode.trim() !== '');

        const affiliateStats = await Promise.all(
            affiliateUsers.map(async (user) => {
                const referrals = await ctx.db
                    .query("referrals")
                    .withIndex("by_referrer", (q) => q.eq("referrerUserId", user._id))
                    .collect();

                const commissions = await ctx.db
                    .query("affiliate_commissions")
                    .withIndex("by_affiliate", (q) => q.eq("affiliateUserId", user._id))
                    .collect();

                const totalEarned = commissions.reduce((sum, c) => sum + c.commissionAmount, 0);
                const pendingEarnings = commissions.filter(c => c.status === 'pending').reduce((sum, c) => sum + c.commissionAmount, 0);

                return {
                    userId: user._id,
                    fullName: `${user.firstName} ${user.lastName}`,
                    email: user.email,
                    affiliateCode: user.referralCode,
                    referralCount: referrals.length,
                    completedReferrals: referrals.filter(r => r.status === 'completed').length,
                    totalEarned,
                    pendingEarnings,
                    averageCommission: referrals.length > 0 ? totalEarned / referrals.length : 0,
                    lastReferralAt: referrals.length > 0 ? Math.max(...referrals.map(r => r.referredAt)) : null
                };
            })
        );

        return affiliateStats
            .sort((a, b) => b.totalEarned - a.totalEarned)
            .slice(0, limit);
    },
});

// Get all affiliate commissions with details
export const getAllCommissions = query({
    args: {
        status: v.optional(v.union(v.literal("pending"), v.literal("paid"), v.literal("cancelled"))),
        limit: v.optional(v.number())
    },
    handler: async (ctx, { status, limit = 100 }) => {
        const commissions = status
            ? await ctx.db
                .query("affiliate_commissions")
                .withIndex("by_status", (q) => q.eq("status", status))
                .order("desc")
                .take(limit)
            : await ctx.db
                .query("affiliate_commissions")
                .order("desc")
                .take(limit);

        const commissionsWithDetails = await Promise.all(
            commissions.map(async (commission) => {
                const [affiliate, referred, referral, payment, league] = await Promise.all([
                    ctx.db.get(commission.affiliateUserId),
                    ctx.db.get(commission.referredUserId),
                    ctx.db.get(commission.referralId),
                    ctx.db.get(commission.paymentId),
                    commission.leagueId ? ctx.db.get(commission.leagueId) : null
                ]);

                return {
                    ...commission,
                    affiliate: affiliate ? {
                        fullName: `${affiliate.firstName} ${affiliate.lastName}`,
                        email: affiliate.email,
                        affiliateCode: affiliate.referralCode
                    } : null,
                    referred: referred ? {
                        fullName: `${referred.firstName} ${referred.lastName}`,
                        email: referred.email
                    } : null,
                    leagueName: league?.name,
                    referralCode: referral?.referralCode,
                    paymentStatus: payment?.status
                };
            })
        );

        return commissionsWithDetails;
    },
});

// Get affiliate commissions by league
export const getCommissionsByLeague = query({
    args: { leagueId: v.id("leagues") },
    handler: async (ctx, { leagueId }) => {
        const commissions = await ctx.db
            .query("affiliate_commissions")
            .withIndex("by_league", (q) => q.eq("leagueId", leagueId))
            .collect();

        const totalCommissions = commissions.reduce((sum, c) => sum + c.commissionAmount, 0);
        const pendingCommissions = commissions.filter(c => c.status === 'pending');

        return {
            totalCommissions: commissions.length,
            totalAmount: totalCommissions,
            pendingCount: pendingCommissions.length,
            pendingAmount: pendingCommissions.reduce((sum, c) => sum + c.commissionAmount, 0),
            paidCount: commissions.filter(c => c.status === 'paid').length,
            paidAmount: commissions.filter(c => c.status === 'paid').reduce((sum, c) => sum + c.commissionAmount, 0)
        };
    },
});

// ===================
// AFFILIATE MUTATIONS
// ===================

// Generate unique referral code for user
export const generateReferralCode = mutation({
    args: { userId: v.id("users") },
    handler: async (ctx, { userId }) => {
        const user = await ctx.db.get(userId);
        if (!user) throw new Error("User not found");

        if (user.referralCode && user.referralCode.trim() !== '') {
            return user.referralCode; // Already has a code
        }

        // Generate unique code based on name + random
        const baseName = (user.firstName + user.lastName).replace(/[^a-zA-Z]/g, '').toUpperCase();
        const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
        const referralCode = `${baseName.substring(0, 4)}${randomSuffix}`;

        // Check for uniqueness
        const existingUser = await ctx.db
            .query("users")
            .filter((q) => q.eq(q.field("referralCode"), referralCode))
            .first();

        if (existingUser) {
            // If collision, try again with different suffix
            const newSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
            const newCode = `${baseName.substring(0, 4)}${newSuffix}`;

            await ctx.db.patch(userId, { referralCode: newCode });
            return newCode;
        }

        await ctx.db.patch(userId, { referralCode });
        return referralCode;
    },
});

// Process referral when someone uses a referral code
export const processReferral = mutation({
    args: {
        referralCode: v.string(),
        referredUserId: v.id("users"),
        paymentId: v.optional(v.id("payments")),
        leagueId: v.optional(v.id("leagues"))
    },
    handler: async (ctx, { referralCode, referredUserId, paymentId, leagueId }) => {
        // Find user with this referral code
        const referrer = await ctx.db
            .query("users")
            .filter((q) => q.eq(q.field("referralCode"), referralCode))
            .first();

        if (!referrer) {
            throw new Error("Invalid referral code");
        }

        if (referrer._id === referredUserId) {
            throw new Error("Cannot refer yourself");
        }

        // Check if referral already exists
        const existingReferral = await ctx.db
            .query("referrals")
            .filter((q) =>
                q.and(
                    q.eq(q.field("referrerUserId"), referrer._id),
                    q.eq(q.field("referredUserId"), referredUserId)
                )
            )
            .first();

        if (existingReferral) {
            return existingReferral._id; // Already referred
        }

        // Create referral record
        const referralId = await ctx.db.insert("referrals", {
            referrerUserId: referrer._id,
            referredUserId,
            referralCode,
            paymentId,
            leagueId,
            status: paymentId ? "completed" : "pending",
            referredAt: Date.now(),
            completedAt: paymentId ? Date.now() : undefined
        });

        return referralId;
    },
});

// Calculate and create commission when payment is successful
export const calculateCommission = mutation({
    args: {
        referralId: v.id("referrals"),
        paymentId: v.id("payments"),
        entryFeeAmount: v.number()
    },
    handler: async (ctx, { referralId, paymentId, entryFeeAmount }) => {
        const referral = await ctx.db.get(referralId);
        if (!referral) throw new Error("Referral not found");

        // Check if commission already exists
        const existingCommission = await ctx.db
            .query("affiliate_commissions")
            .filter((q) => q.eq(q.field("referralId"), referralId))
            .first();

        if (existingCommission) {
            return existingCommission._id; // Already calculated
        }

        // Get commission rate (default 10%)
        const commissionRate = 0.10; // You can make this configurable via settings
        const commissionAmount = entryFeeAmount * commissionRate;

        // Create commission record
        const commissionId = await ctx.db.insert("affiliate_commissions", {
            affiliateUserId: referral.referrerUserId,
            referredUserId: referral.referredUserId,
            referralId,
            paymentId,
            leagueId: referral.leagueId,
            entryFeeAmount,
            commissionRate,
            commissionAmount,
            status: "pending",
            calculatedAt: Date.now()
        });

        // Update referral status
        await ctx.db.patch(referralId, {
            status: "completed",
            completedAt: Date.now(),
            paymentId
        });

        return commissionId;
    },
});

// Pay pending commissions
export const payCommissions = mutation({
    args: {
        commissionIds: v.array(v.id("affiliate_commissions")),
        payoutMethod: v.optional(v.string())
    },
    handler: async (ctx, { commissionIds, payoutMethod = "manual" }) => {
        const results = await Promise.all(
            commissionIds.map(async (commissionId) => {
                const commission = await ctx.db.get(commissionId);
                if (!commission) return { id: commissionId, success: false, error: "Not found" };

                if (commission.status !== "pending") {
                    return { id: commissionId, success: false, error: "Already processed" };
                }

                await ctx.db.patch(commissionId, {
                    status: "paid",
                    paidAt: Date.now(),
                    payoutMethod
                });

                return { id: commissionId, success: true };
            })
        );

        const successful = results.filter(r => r.success).length;
        const failed = results.filter(r => !r.success).length;

        return { successful, failed, results };
    },
});

// Cancel commission
export const cancelCommission = mutation({
    args: {
        commissionId: v.id("affiliate_commissions"),
        reason: v.optional(v.string())
    },
    handler: async (ctx, { commissionId, reason }) => {
        const commission = await ctx.db.get(commissionId);
        if (!commission) throw new Error("Commission not found");

        if (commission.status === "paid") {
            throw new Error("Cannot cancel already paid commission");
        }

        await ctx.db.patch(commissionId, {
            status: "cancelled"
        });

        // You might want to log this action
        return { success: true };
    },
});

// Get affiliate settings
// export const getAffiliateSettings = query({
//     args: {},
//     handler: async (ctx) => {
//         const settings = await ctx.db.query("affiliate_settings").collect();

//         const settingsMap: Record<string, any> = {};
//         settings.forEach(setting => {
//             settingsMap[setting.key] = setting.value;
//         });

//         // Return defaults if not set
//         return {
//             commissionRate: settingsMap.commission_rate || 0.10,
//             minPayout: settingsMap.min_payout || 50,
//             payoutSchedule: settingsMap.payout_schedule || "weekly",
//             ...settingsMap
//         };
//     },
// });

// ===================
// ADMIN SETTINGS
// ===================

// Get all system settings
export const getSystemSettings = query({
    args: {},
    handler: async (ctx) => {
        const settings = await ctx.db.query("settings").collect();

        const settingsMap: Record<string, any> = {};
        settings.forEach(setting => {
            settingsMap[setting.key] = setting.value;
        });

        return {
            system: {
                platformName: settingsMap.platform_name || "Leadership League",
                supportEmail: settingsMap.support_email || "support@leadershipleague.com",
                maintenanceMode: settingsMap.maintenance_mode || false,
                registrationEnabled: settingsMap.registration_enabled ?? true,
                maxAccountsPerUser: settingsMap.max_accounts_per_user || 5,
                defaultEntryFee: settingsMap.default_entry_fee || 50,
            },
            affiliate: {
                commissionRate: settingsMap.affiliate_commission_rate || 0.10,
                minPayout: settingsMap.affiliate_min_payout || 50,
                payoutSchedule: settingsMap.affiliate_payout_schedule || "weekly",
                autoPayoutEnabled: settingsMap.affiliate_auto_payout_enabled || false,
                referralCodeLength: settingsMap.affiliate_referral_code_length || 8,
            }
        };
    },
});

// Individual setting updates
export const saveSystemSettings = mutation({
    args: {
        settings: v.object({
            platformName: v.string(),
            supportEmail: v.string(),
            maintenanceMode: v.boolean(),
            registrationEnabled: v.boolean(),
            maxAccountsPerUser: v.number(),
            defaultEntryFee: v.number(),
        }),
        adminId: v.id("admins"),
    },
    handler: async (ctx, { settings, adminId }) => {
        const settingsToUpdate = [
            { key: "platform_name", value: settings.platformName },
            { key: "support_email", value: settings.supportEmail },
            { key: "maintenance_mode", value: settings.maintenanceMode },
            { key: "registration_enabled", value: settings.registrationEnabled },
            { key: "max_accounts_per_user", value: settings.maxAccountsPerUser },
            { key: "default_entry_fee", value: settings.defaultEntryFee },
        ];

        const results = await Promise.all(
            settingsToUpdate.map(async (setting) => {
                const existing = await ctx.db
                    .query("settings")
                    .withIndex("by_key", (q) => q.eq("key", setting.key))
                    .first();

                if (existing) {
                    await ctx.db.patch(existing._id, {
                        value: setting.value,
                        updatedBy: adminId,
                        updatedAt: Date.now(),
                    });
                } else {
                    await ctx.db.insert("settings", {
                        key: setting.key,
                        value: setting.value,
                        updatedBy: adminId,
                        updatedAt: Date.now(),
                    });
                }
            })
        );

        await ctx.db.insert("activities", {
            type: "admin_action",
            adminId,
            details: "Updated system settings",
            timestamp: Date.now(),
        });

        return { success: true, updated: settingsToUpdate.length };
    },
});

export const saveAffiliateSettings = mutation({
    args: {
        settings: v.object({
            commissionRate: v.number(),
            minPayout: v.number(),
            payoutSchedule: v.string(),
            autoPayoutEnabled: v.boolean(),
            referralCodeLength: v.number(),
        }),
        adminId: v.id("admins"),
    },
    handler: async (ctx, { settings, adminId }) => {
        const settingsToUpdate = [
            { key: "affiliate_commission_rate", value: settings.commissionRate },
            { key: "affiliate_min_payout", value: settings.minPayout },
            { key: "affiliate_payout_schedule", value: settings.payoutSchedule },
            { key: "affiliate_auto_payout_enabled", value: settings.autoPayoutEnabled },
            { key: "affiliate_referral_code_length", value: settings.referralCodeLength },
        ];

        await Promise.all(
            settingsToUpdate.map(async (setting) => {
                const existing = await ctx.db
                    .query("settings")
                    .withIndex("by_key", (q) => q.eq("key", setting.key))
                    .first();

                if (existing) {
                    await ctx.db.patch(existing._id, {
                        value: setting.value,
                        updatedBy: adminId,
                        updatedAt: Date.now(),
                    });
                } else {
                    await ctx.db.insert("settings", {
                        key: setting.key,
                        value: setting.value,
                        updatedBy: adminId,
                        updatedAt: Date.now(),
                    });
                }
            })
        );

        await ctx.db.insert("activities", {
            type: "admin_action",
            adminId,
            details: "Updated affiliate settings",
            timestamp: Date.now(),
        });

        return { success: true, updated: settingsToUpdate.length };
    },
});

// Update system setting
export const updateSystemSetting = mutation({
    args: {
        key: v.string(),
        value: v.union(v.number(), v.string(), v.boolean()),
        description: v.optional(v.string()),
        adminId: v.id("admins"),
    },
    handler: async (ctx, { key, value, description, adminId }) => {
        const existingSetting = await ctx.db
            .query("settings")
            .withIndex("by_key", (q) => q.eq("key", key))
            .first();

        if (existingSetting) {
            await ctx.db.patch(existingSetting._id, {
                value,
                description,
                updatedBy: adminId,
                updatedAt: Date.now(),
            });
            return existingSetting._id;
        } else {
            return await ctx.db.insert("settings", {
                key,
                value,
                description,
                updatedBy: adminId,
                updatedAt: Date.now(),
            });
        }
    },
});

// Bulk update settings
export const bulkUpdateSettings = mutation({
    args: {
        settings: v.array(v.object({
            key: v.string(),
            value: v.union(v.number(), v.string(), v.boolean()),
            description: v.optional(v.string()),
        })),
        adminId: v.id("admins"),
    },
    handler: async (ctx, { settings, adminId }) => {
        const results = await Promise.all(
            settings.map(async (setting) => {
                try {
                    const existingSetting = await ctx.db
                        .query("settings")
                        .withIndex("by_key", (q) => q.eq("key", setting.key))
                        .first();

                    if (existingSetting) {
                        await ctx.db.patch(existingSetting._id, {
                            value: setting.value,
                            description: setting.description,
                            updatedBy: adminId,
                            updatedAt: Date.now(),
                        });
                        return { success: true, key: setting.key };
                    } else {
                        await ctx.db.insert("settings", {
                            key: setting.key,
                            value: setting.value,
                            description: setting.description,
                            updatedBy: adminId,
                            updatedAt: Date.now(),
                        });
                        return { success: true, key: setting.key };
                    }
                } catch (error) {
                    return {
                        success: false,
                        key: setting.key,
                        error: (error as Error).message
                    };
                }
            })
        );

        const successful = results.filter(r => r.success).length;

        await ctx.db.insert("activities", {
            type: "admin_action",
            adminId,
            details: `Bulk updated ${successful} settings`,
            timestamp: Date.now(),
        });

        return { updated: successful, failed: results.length - successful };
    },
});

// Change admin password
export const changeAdminPassword = mutation({
    args: {
        currentPassword: v.string(),
        newPassword: v.string(),
        adminId: v.id("admins"),
    },
    handler: async (ctx, { currentPassword, newPassword, adminId }) => {
        const admin = await ctx.db.get(adminId);
        if (!admin) {
            throw new Error("Admin not found");
        }

        // Verify current password
        if (admin.password !== currentPassword) {
            throw new Error("Current password is incorrect");
        }

        // Validate new password
        if (newPassword.length < 6) {
            throw new Error("New password must be at least 6 characters long");
        }

        // Update password
        await ctx.db.patch(adminId, {
            password: newPassword, // In production, hash this password
            updatedAt: Date.now(),
        });

        // Log password change activity
        await ctx.db.insert("activities", {
            type: "admin_action",
            adminId,
            details: "Changed admin password",
            timestamp: Date.now(),
        });

        return { success: true };
    },
});

// Get admin profile
export const getAdminProfile = query({
    args: { adminId: v.id("admins") },
    handler: async (ctx, { adminId }) => {
        const admin = await ctx.db.get(adminId);
        if (!admin) {
            throw new Error("Admin not found");
        }

        // Don't return password
        const { password, ...adminProfile } = admin;
        return adminProfile;
    },
});

// Update admin profile
export const updateAdminProfile = mutation({
    args: {
        adminId: v.id("admins"),
        name: v.string(),
        email: v.string(),
    },
    handler: async (ctx, { adminId, name, email }) => {
        const admin = await ctx.db.get(adminId);
        if (!admin) {
            throw new Error("Admin not found");
        }

        // Check if email is already taken by another admin
        if (email !== admin.email) {
            const existingAdmin = await ctx.db
                .query("admins")
                .withIndex("by_email", (q) => q.eq("email", email))
                .first();

            if (existingAdmin && existingAdmin._id !== adminId) {
                throw new Error("Email is already taken by another admin");
            }
        }

        await ctx.db.patch(adminId, {
            name: name.trim(),
            email: email.trim(),
            updatedAt: Date.now(),
        });

        // Log profile update activity
        await ctx.db.insert("activities", {
            type: "admin_action",
            adminId,
            details: "Updated admin profile",
            timestamp: Date.now(),
        });

        return { success: true };
    },
});

// Get system statistics for settings page
export const getSystemStatistics = query({
    args: {},
    handler: async (ctx) => {
        const [users, accounts, leagues, payments, activities] = await Promise.all([
            ctx.db.query("users").collect(),
            ctx.db.query("accounts").collect(),
            ctx.db.query("leagues").collect(),
            ctx.db.query("payments").collect(),
            ctx.db.query("activities").collect()
        ]);

        const now = new Date();
        const last24Hours = now.getTime() - (24 * 60 * 60 * 1000);
        const last7Days = now.getTime() - (7 * 24 * 60 * 60 * 1000);

        return {
            users: {
                total: users.length,
                active: users.filter(u => u.isActive).length,
                recent24h: users.filter(u => u._creationTime > last24Hours).length,
                recent7d: users.filter(u => u._creationTime > last7Days).length,
            },
            accounts: {
                total: accounts.length,
                active: accounts.filter(a => a.status === "active").length,
                recent24h: accounts.filter(a => a._creationTime > last24Hours).length,
            },
            leagues: {
                total: leagues.length,
                active: leagues.filter(l => l.status === "active").length,
            },
            payments: {
                total: payments.length,
                successful: payments.filter(p => p.status === "success").length,
                revenue: payments.filter(p => p.status === "success").reduce((sum, p) => sum + p.amount, 0),
                recent24h: payments.filter(p => p._creationTime > last24Hours).length,
            },
            activities: {
                total: activities.length,
                recent24h: activities.filter(a => a.timestamp > last24Hours).length,
                recent7d: activities.filter(a => a.timestamp > last7Days).length,
            }
        };
    },
});