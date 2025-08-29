import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export const statusSchema = v.union(v.literal('active'), v.literal('inactive'))

const payments = defineTable({
  user: v.id('users'),
  league: v.optional(v.id('leagues')),
  status: v.optional(v.union(v.literal('pending'), v.literal('success'), v.literal('failed'))),
  amount: v.number(),
  updatedAt: v.optional(v.number()),
  paymentIntent: v.optional(v.any()),
})
  .index('byUser', ['user'])
  // .index('byLeague', ['league'])
  .index('byStatus', ['status']);

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
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_email", ["email"]),

  users: defineTable({
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
    clerkId: v.string(),
    imageUrl: v.optional(v.string()),
    isActive: v.boolean(),
    referralCode: v.optional(v.string()),
    country: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index('byClerkId', ['clerkId']),

  payments,

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
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index('byUserId', ['user'])
    .index('byName', ['name'])
    .index('byStatus', ['status'])
    .index('byLeague', ['leagues']),

  leagues: defineTable({
    name: v.string(),
    exp: v.number(),
    status: statusSchema,
    reward: v.number(),
    description: v.optional(v.string()),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  })
    .index('by_status', ['status'])
    .index('by_exp', ['exp']),

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
