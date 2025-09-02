import { v } from 'convex/values'
import { action } from './_generated/server'

const MT5_BASE_URL = process.env.NEXT_PUBLIC_MT5_API || 'http://173.225.105.109:5001'

export const createTradingAccount = action({
  args: {
    first_name: v.string(),
    last_name: v.string(),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const res = await fetch(`${MT5_BASE_URL}/api/create-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...args,
      }),
    })
    const data = await res.json()
    console.log('data', data)
    return data
  },
})
