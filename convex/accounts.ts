import { v } from 'convex/values'
import { query, mutation, internalMutation } from './_generated/server'
import { statusSchema } from './schema'
import { getCurrentUserOrThrow } from './users'

export const getAccountById = query({
  args: {
    id: v.id('accounts'),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error('Not authenticated')
    }

    const user = await ctx.db
      .query('users')
      .withIndex('byClerkId', q => q.eq('clerkId', identity.subject))
      .unique()

    if (!user) {
      throw new Error('User not found')
    }

    const account = await ctx.db.get(args.id)
    if (!account) throw new Error('Account not found')
    if (account.user !== user._id) throw new Error('Forbidden')
    return account
  },
})

export const createAccount = mutation({
  args: {
    payment: v.id('payments'),
    name: v.string(),
    user: v.id('users'),
    broker: v.any(), // Store full MT5 response for debugging
    leagues: v.id('leagues'),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .insert('accounts', {
        ...args,
        deposit: args.broker.deposit_amount, // check leter
        group: args.broker.group,
        leverage: args.broker.leverage,
        status: args.broker.enabled ? 'active' : 'inactive',
        name: args.name,
        login: args.broker.login,
        password: {
          main: args.broker.password_main,
          investor: args.broker.password_investor,
        },
        leagues: args.leagues,
      })
      .then(data => {
        return ctx.db.get(data)
      })
  },
})

export const getAccounts = query({
  args: {},
  handler: async ctx => {
    const user = await getCurrentUserOrThrow(ctx)

    const accounts = await ctx.db
      .query('accounts')
      .filter(q => q.eq(q.field('user'), user._id))
      .collect()
    return accounts
  },
})

export const isNameAvailable = query({
  args: { name: v.string() },
  handler: async (ctx, { name }) => {
    const existing = await ctx.db
      .query('accounts')
      .withIndex('byName', q => q.eq('name', name))
      .take(1)
    return existing.length === 0
  },
})

export const setStatus = mutation({
  args: { id: v.id('accounts'), status: statusSchema },
  handler: async (ctx, { id, status }) => {
    const user = await getCurrentUserOrThrow(ctx)

    const account = await ctx.db.get(id)
    if (!account) throw new Error('Account not found')
    if (account.user !== user._id) throw new Error('Forbidden')
    await ctx.db.patch(id, { status, updatedAt: Date.now() })
    return null
  },
})

export const createBroker = mutation({
  args: {
    name: v.string(),
    broker: v.any(),
    group: v.string(),
    referralCode: v.optional(v.string()),
    leagues: v.id('leagues'),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx)

    // Handle case when MT5 creation fails and broker is empty
    const brokerData = args.broker && typeof args.broker === 'object' ? args.broker : {}

    return await ctx.db
      .insert('accounts', {
        name: args.name,
        broker: args.broker,
        leagues: args.leagues,
        group: args.group,
        user: user._id,
        status: 'active',
        deposit: brokerData.deposit_amount || 0,
        leverage: brokerData.leverage || 100,
        updatedAt: Date.now(),
        password: {
          main: brokerData.password_main || '',
          investor: brokerData.password_investor || '',
        },
        login: brokerData.login,
        referralCode: args.referralCode,
      })
      .then(data => {
        return ctx.db.get(data)
      })
  },
})

export const listAccounts = query({
  args: {},
  handler: async ctx => {
    const accounts = await ctx.db.query('accounts').collect()
    return accounts
  },
})
