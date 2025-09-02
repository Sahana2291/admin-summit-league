'use node'

import { action } from './_generated/server'
import { v } from 'convex/values'

const MT5_BASE_URL = process.env.NEXT_PUBLIC_MT5_API || 'http://173.225.105.109:5001'

export const createUser = action({
  args: {
    first_name: v.string(),
    last_name: v.string(),
    group: v.optional(v.string()),
    leverage: v.optional(v.number()),
    email: v.optional(v.string()),
    password: v.optional(v.string()),
    investor_password: v.optional(v.string()),
    deposit_amount: v.optional(v.number()),
  },
  // Return the upstream JSON payload as-is (unknown shape)
  returns: v.any(),
  handler: async (ctx, args) => {
    const payload = {
      first_name: args.first_name,
      last_name: args.last_name,
      email: args.email ?? undefined,
    }

    const res = await fetch(`${MT5_BASE_URL}/api/create-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const text = await res.text()
    // Try JSON first, fall back to raw text
    try {
      const json = JSON.parse(text)
      if (!res.ok) {
        return { ok: false, status: res.status, error: json }
      }
      return { ok: true, status: res.status, data: json }
    } catch (_err) {
      if (!res.ok) {
        return { ok: false, status: res.status, error: text }
      }
      return { ok: true, status: res.status, data: text }
    }
  },
})

export const getUserStats = action({
  args: {
    login: v.number(),
    from: v.optional(v.string()),
    to: v.optional(v.string()),
  },
  returns: v.any(),
  handler: async (ctx, args) => {
    const payload = {
      login: args.login,
      ...(args.from && { from: args.from }),
      ...(args.to && { to: args.to }),
    }

    const res = await fetch(`${MT5_BASE_URL}/api/user-stats`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const text = await res.text()
    // Try JSON first, fall back to raw text
    try {
      const json = JSON.parse(text)
      if (!res.ok) {
        return { ok: false, status: res.status, error: json }
      }
      return { ok: true, status: res.status, data: json }
    } catch (_err) {
      if (!res.ok) {
        return { ok: false, status: res.status, error: text }
      }
      return { ok: true, status: res.status, data: text }
    }
  },
})
