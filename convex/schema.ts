import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export const statusSchema = v.union(
  v.literal('active'),
  v.literal('inactive'),
  v.literal('scheduled')
)

const payments = defineTable({
  user: v.id('users'),
  league: v.optional(v.id('leagues')),
  status: v.optional(v.union(v.literal('pending'), v.literal('success'), v.literal('failed'))),
  amount: v.number(),
  updatedAt: v.optional(v.number()),
  paymentIntent: v.optional(v.any()),
})
  .index('byUser', ['user'])
  .index('byLeague', ['league'])
  .index('byStatus', ['status']);

const snapshots = defineTable({
  account: v.id('accounts'),
  equity: v.optional(v.number()),
  totalPnl: v.optional(v.number()),
  realizedPnl: v.optional(v.number()),
  floatingPnl: v.optional(v.number()),
  margin: v.optional(v.number()),
  openPositions: v.optional(v.number()),
  rawSnapshot: v.optional(v.any()),
  rank: v.optional(v.number()),
  lastRankedAt: v.optional(v.number()),
})
  .index('by_realized_pnl', ['realizedPnl'])
  .index('by_rank', ['rank'])

// The schema is entirely optional.
// You can delete this file (schema.ts) and the
// app will continue to work.
// The schema provides more precise TypeScript types.
export default defineSchema({
  admins: defineTable({
    email: v.string(),
    password: v.string(), // In production, use proper hashing
    name: v.string(),
    role: v.union(v.literal("super_admin"), v.literal("admin")),
    isActive: v.boolean(),
    updatedAt: v.number(),
  }).index("by_email", ["email"]),

  users: defineTable({
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
    clerkId: v.string(),
    imageUrl: v.optional(v.string()),
    // isActive: v.boolean(), default true
    isActive: v.optional(v.boolean()),
    referralCode: v.optional(v.string()),
    country: v.optional(v.string()),
    updatedAt: v.optional(v.number()),
  }).index('byClerkId', ['clerkId']),

  payments,

  snapshots,

  accounts: defineTable({
    user: v.id('users'),
    leagues: v.optional(v.id('leagues')),
    status: statusSchema,
    broker: v.optional(v.any()), // Store full MT5 response for debugging
    name: v.string(),
    deposit: v.number(),
    leverage: v.number(),
    group: v.string(),
    login: v.optional(v.number()), // Make login optional since it might not be available
    password: v.object({
      investor: v.string(),
      main: v.string(),
    }),
    payment: v.optional(v.id('payments')),
    updatedAt: v.optional(v.number()),
    referralCode: v.optional(v.string()),
  })
    .index('byUserId', ['user'])
    .index('byName', ['name'])
    .index('byStatus', ['status'])
    .index('byLeague', ['leagues']),

  leagues: defineTable({
    name: v.string(),
    exp: v.number(), // Fixed at $100
    status: statusSchema,
    description: v.optional(v.string()),

    startDate: v.number(), // Always Monday
    endDate: v.number(),   // Always Friday
    maxParticipants: v.optional(v.number()),

    // Auto-calculated fields
    totalParticipants: v.optional(v.number()),
    totalPrizePool: v.optional(v.number()),
    adminShare: v.optional(v.number()),
    participantPool: v.optional(v.number()),

    createdBy: v.id('admins'),
    updatedAt: v.optional(v.number()),
  })
    .index('by_status', ['status'])
    .index('by_exp', ['exp'])
    .index('by_start_date', ['startDate']),

  // Affiliate referrals tracking
  referrals: defineTable({
    referrerUserId: v.id("users"), // User who referred
    referredUserId: v.id("users"), // User who was referred  
    referralCode: v.string(), // Code used
    paymentId: v.optional(v.id("payments")), // Associated payment
    leagueId: v.optional(v.id("leagues")), // Which competition
    status: v.union(v.literal("pending"), v.literal("completed"), v.literal("cancelled")),
    referredAt: v.number(), // When referral happened
    completedAt: v.optional(v.number()), // When payment was successful
  })
    .index("by_referrer", ["referrerUserId"])
    .index("by_referred", ["referredUserId"])
    .index("by_code", ["referralCode"])
    .index("by_status", ["status"]),

  // Affiliate commission tracking
  affiliate_commissions: defineTable({
    affiliateUserId: v.id("users"), // Who gets the commission
    referredUserId: v.id("users"), // Who was referred
    referralId: v.id("referrals"), // Link to referral record
    paymentId: v.id("payments"), // Associated payment
    leagueId: v.optional(v.id("leagues")), // Competition
    entryFeeAmount: v.number(), // Original entry fee
    commissionRate: v.number(), // Percentage (0.1 = 10%)
    commissionAmount: v.number(), // Calculated commission
    status: v.union(v.literal("pending"), v.literal("paid"), v.literal("cancelled")),
    calculatedAt: v.number(),
    paidAt: v.optional(v.number()),
    payoutMethod: v.optional(v.string()),
  })
    .index("by_affiliate", ["affiliateUserId"])
    .index("by_referred", ["referredUserId"])
    .index("by_status", ["status"])
    .index("by_league", ["leagueId"]),

  // Admin Activity Logs
  activities: defineTable({
    type: v.union(
      v.literal("registration"),
      v.literal("league_join"),
      v.literal("account_link"),
      v.literal("prize_claim"),
      v.literal("payment_processed"),
      v.literal("account_created"),
      v.literal("league_created"),
      v.literal("league_auto_ended"),
      v.literal("user_suspended"),
      v.literal("admin_action")
    ),
    userId: v.optional(v.id("users")),
    adminId: v.optional(v.id("admins")),
    userEmail: v.optional(v.string()),
    entityId: v.optional(v.string()), // Generic ID for related entities
    amount: v.optional(v.number()),
    details: v.optional(v.string()), // Additional context
    timestamp: v.number(),
  }).index("by_timestamp", ["timestamp"])
    .index("by_type", ["type"])
    .index("by_user", ["userId"])
    .index("by_admin", ["adminId"]),

  // System Settings
  settings: defineTable({
    key: v.string(),
    value: v.any(),
    description: v.optional(v.string()),
    updatedBy: v.id('admins'),
    updatedAt: v.number(),
  }).index('by_key', ['key']),
})
