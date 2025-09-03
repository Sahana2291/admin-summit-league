import { internalMutation, query, QueryCtx, mutation } from './_generated/server'
import { UserJSON } from '@clerk/backend'
import { v, Validator } from 'convex/values'

export const current = query({
  args: {},
  handler: async ctx => {
    return await getCurrentUser(ctx)
  },
})

export const upsertFromClerk = internalMutation({
  args: { data: v.any() as Validator<UserJSON> }, // no runtime validation, trust Clerk
  async handler(ctx, { data }) {
    const userAttributes = {
      firstName: data.first_name,
      lastName: data.last_name,
      email: data.email_addresses[0].email_address,
      clerkId: data.id,
      imageUrl: data.image_url,
      referralCode: '',
      country: '',
      isActive: true,
      totalReward: 0,
    }

    const user = await userByExternalId(ctx, data.id)

    // Ensure firstName and lastName are strings (not null)
    const safeUserAttributes = {
      ...userAttributes,
      firstName: userAttributes.firstName ?? '',
      lastName: userAttributes.lastName ?? '',
      referralCode: userAttributes.referralCode ?? '',
      country: userAttributes.country ?? '',
      totalReward: userAttributes.totalReward ?? 0,
    }

    if (user === null) {
      await ctx.db.insert('users', safeUserAttributes)
    } else {
      await ctx.db.patch(user._id, safeUserAttributes)
    }
  },
})

export const deleteFromClerk = internalMutation({
  args: { clerkUserId: v.string() },
  async handler(ctx, { clerkUserId }) {
    const user = await userByExternalId(ctx, clerkUserId)

    if (user !== null) {
      await ctx.db.delete(user._id)
    } else {
      console.warn(`Can't delete user, there is none for Clerk user ID: ${clerkUserId}`)
    }
  },
})

export async function getCurrentUserOrThrow(ctx: QueryCtx) {
  const userRecord = await getCurrentUser(ctx)
  if (!userRecord) throw new Error("Can't get current user")
  return userRecord
}

export async function getCurrentUser(ctx: QueryCtx) {
  const identity = await ctx.auth.getUserIdentity()
  if (identity === null) {
    return null
  }
  return await userByExternalId(ctx, identity.subject)
}

async function userByExternalId(ctx: QueryCtx, externalId: string) {
  return await ctx.db
    .query('users')
    .withIndex('byClerkId', q => q.eq('clerkId', externalId))
    .unique()
}

// Update user country and referral code
export const updateUser = mutation({
  args: {
    country: v.string(),
    referralCode: v.optional(v.string()),
    updatedAt: v.optional(v.number()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx)
    await ctx.db.patch(user._id, {
      country: args.country,
      ...(args.referralCode && { referralCode: args.referralCode }),
      updatedAt: Date.now(),
    })
    return null
  },
})

export const listUsers = query({
  args: {},
  handler: async (ctx, args) => {
    // const user = await getCurrentUserOrThrow(ctx)
    // if (user.role !== 'admin') {
    //   return null
    // }
    const users = await ctx.db.query('users').collect()
    return users
  },
})
