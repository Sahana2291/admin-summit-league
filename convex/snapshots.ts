import { v } from 'convex/values'
import { action, mutation, query, internalMutation, internalAction } from './_generated/server'
import { getCurrentUserOrThrow } from './users'
import { api, internal } from './_generated/api'

const MT5_BASE_URL = process.env.NEXT_PUBLIC_MT5_API || 'http://173.225.105.109:5001'

export const getSnapshots = query({
  args: {},
  handler: async (ctx, args) => {
    // Get snapshots ordered by rank (if available) or by realizedPnl in descending order
    const snapshots = await ctx.db.query('snapshots').withIndex('by_rank').order('asc').collect()

    // If no rankings exist, fall back to ordering by realizedPnl
    if (snapshots.length === 0 || snapshots[0].rank === undefined) {
      const unrankedSnapshots = await ctx.db
        .query('snapshots')
        .withIndex('by_realized_pnl')
        .order('desc')
        .collect()
      return unrankedSnapshots
    }

    return snapshots
  },
})

export const getSnapshotByAccountId = query({
  args: {
    accountId: v.id('accounts'),
  },
  handler: async (ctx, args) => {
    const snapshot = await ctx.db
      .query('snapshots')
      .filter(q => q.eq(q.field('account'), args.accountId))
      .unique()
    return snapshot
  },
})

export const createSnapshotAction = action({
  args: {
    login: v.number(),
    accountId: v.id('accounts'),
  },
  handler: async (ctx, args) => {
    const data = await ctx.runAction(api.snapshots.syncData, { login: args.login })
    await ctx.runMutation(api.snapshots.createSnapshot, {
      data,
      accountId: args.accountId,
    })
  },
})

export const createSnapshot = mutation({
  args: {
    accountId: v.id('accounts'),
    data: v.any(),
  },
  handler: async (ctx, args) => {
    const data = await ctx.db.insert('snapshots', {
      rawSnapshot: args.data,
      account: args.accountId,
      equity: args.data.snapshot.equity,
      totalPnl: args.data.total_pnl,
      realizedPnl: args.data.realized_pnl,
      floatingPnl: args.data.floating_pnl,
      margin: args.data.snapshot.margin,
      openPositions: args.data.snapshot.open_positions,
    })
    return data
  },
})

export const updateSnapshot = mutation({
  args: {
    accountId: v.id('accounts'),
    data: v.any(),
  },
  returns: v.id('snapshots'),
  handler: async (ctx, args) => {
    // Find the existing snapshot for this account
    const existingSnapshots = await ctx.db
      .query('snapshots')
      .filter(q => q.eq(q.field('account'), args.accountId))
      .collect()

    if (existingSnapshots.length === 0) {
      throw new Error('No snapshot found for this account')
    }

    // Get the most recent snapshot (assuming we want to update the latest one)
    const existingSnapshot = existingSnapshots[0]

    // Update the snapshot with new data
    await ctx.db.patch(existingSnapshot._id, {
      rawSnapshot: args.data,
      equity: args.data.snapshot.equity,
      totalPnl: args.data.total_pnl,
      realizedPnl: args.data.realized_pnl,
      floatingPnl: args.data.floating_pnl,
      margin: args.data.snapshot.margin,
      openPositions: args.data.snapshot.open_positions,
    })

    return existingSnapshot._id
  },
})

export const syncData = action({
  args: {
    login: v.number(),
  },
  handler: async (ctx, args) => {
    const res = await fetch(`${MT5_BASE_URL}/api/user-stats`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...args,
      }),
    })
    const data = await res.json()
    // console.log('data', data)
    return data
  },
})

/**
 * Manually trigger leadership board ranking update
 */
export const updateRankings = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx, args) => {
    // Get all snapshots with realizedPnl, ordered by realizedPnl in descending order
    const snapshots = await ctx.db
      .query('snapshots')
      .withIndex('by_realized_pnl')
      .order('desc')
      .collect()

    // Filter out snapshots without realizedPnl
    const validSnapshots = snapshots.filter(
      snapshot => snapshot.realizedPnl !== undefined && snapshot.realizedPnl !== null,
    )

    // Update rankings
    for (let i = 0; i < validSnapshots.length; i++) {
      const snapshot = validSnapshots[i]
      const rank = i + 1

      await ctx.db.patch(snapshot._id, {
        rank: rank,
        lastRankedAt: Date.now(),
      })
    }

    return null
  },
})

/**
 * Update a specific snapshot's rank
 */
export const updateSnapshotRank = mutation({
  args: {
    snapshotId: v.id('snapshots'),
    rank: v.number(),
    lastRankedAt: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.snapshotId, {
      rank: args.rank,
      lastRankedAt: args.lastRankedAt,
    })
    return null
  },
})

/**
 * Sync all accounts with MT5 data
 */
export const syncAllAccounts = internalMutation({
  args: {},
  returns: v.null(),
  handler: async (ctx, args) => {
    const accounts = await ctx.db.query('accounts').collect()

    for (const account of accounts) {
      if (account.login) {
        try {
          // This would typically call the MT5 API
          // For now, we'll just update the timestamp
          await ctx.db.patch(account._id, {
            updatedAt: Date.now(),
          })
        } catch (error) {
          console.error(`Failed to sync account ${account.name}:`, error)
        }
      }
    }

    return null
  },
})

/**
 * Clean up old snapshots
 */
export const cleanupOldSnapshots = internalMutation({
  args: {},
  returns: v.null(),
  handler: async (ctx, args) => {
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000

    const oldSnapshots = await ctx.db
      .query('snapshots')
      .filter(q => q.lt(q.field('_creationTime'), thirtyDaysAgo))
      .collect()

    for (const snapshot of oldSnapshots) {
      await ctx.db.delete(snapshot._id)
    }

    return null
  },
})

/**
 * Update all snapshots with fresh MT5 data (called by cron job every 30 minutes)
 */
export const updateAllSnapshots = internalAction({
  args: {},
  returns: v.null(),
  handler: async (ctx, args) => {
    const accounts = await ctx.runQuery(api.accounts.listAccounts, {})

    for (const account of accounts) {
      if (account.login) {
        try {
          // Get fresh data from MT5
          const data = await ctx.runAction(api.snapshots.syncData, { login: account.login })

          // Find existing snapshot for this account
          const existingSnapshots = await ctx.runQuery(api.snapshots.getSnapshotByAccountId, {
            accountId: account._id,
          })

          if (existingSnapshots) {
            // Update existing snapshot
            await ctx.runMutation(api.snapshots.updateSnapshot, {
              accountId: account._id,
              data: data,
            })
          } else {
            // Create new snapshot if none exists
            await ctx.runMutation(api.snapshots.createSnapshot, {
              accountId: account._id,
              data: data,
            })
          }
        } catch (error) {
          console.error(`Failed to update snapshot for account ${account.name}:`, error)
        }
      }
    }

    // After updating all snapshots, update rankings
    await ctx.runMutation(api.snapshots.updateRankings, {})

    return null
  },
})

export const getLastUpdateTime = query({
  args: {},
  returns: v.union(v.number(), v.null()),
  handler: async (ctx, args) => {
    const snapshots = await ctx.db
      .query('snapshots')
      .withIndex('by_realized_pnl')
      .order('desc')
      .take(1)

    if (snapshots.length === 0) {
      return null
    }

    return snapshots[0].lastRankedAt || null
  },
})
