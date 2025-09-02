import { v } from 'convex/values'
import { api } from './_generated/api'
import { action, mutation, query } from './_generated/server'

export const createPaymentIntent = action({
  args: {
    accountName: v.string(),
    league: v.optional(v.id('leagues')),
  },
  handler: async (ctx, args) => {
    const AMOUNT = 1
    const user = await ctx.runQuery(api.users.current)
    if (user === null) {
      return null
    }

    const doc = await ctx.runMutation(api.payments.upsertPayment, {
      league: args.league!,
      amount: AMOUNT,
      user: user._id,
    })

    let isPaymentCreated = false
    let data: any
    try {
      const congif = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `tenants API-Key ${process.env.PAYMENT_CORE_API_KEY}`,
        },
        body: JSON.stringify({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          amount: AMOUNT.toString(),
          crm: 'traders-arena',
          metadata: { orderId: doc, name: args.accountName },
          redirects: {
            success_url: 'https://yourapp.com/payment/success',
            fail_url: 'https://yourapp.com/payment/fail',
            back_url: 'https://yourapp.com/dashboard',
          },
        }),
      }
      const res: Response = await fetch(
        `${process.env.PAYMENT_CORE_URL}/api/invoices/create`,
        congif,
      )
      data = await res.json()
      if (data.success) {
        isPaymentCreated = true
      }
    } catch (error) {
      isPaymentCreated = false
    }

    await ctx.runMutation(api.payments.upsertPayment, {
      id: doc,
      status: isPaymentCreated ? 'pending' : 'failed',
      paymentIntent: data.data,
      updatedAt: new Date().getTime(),
      user: user._id,
    })

    return data
  },
})

export const upsertPayment = mutation({
  args: {
    user: v.id('users'),
    id: v.optional(v.id('payments')),
    status: v.optional(v.union(v.literal('pending'), v.literal('success'), v.literal('failed'))),
    paymentIntent: v.optional(v.any()),
    league: v.optional(v.id('leagues')),
    amount: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  },
  handler: async (ctx, { id, ...args }) => {
    if (id) {
      await ctx.db.patch(id, { ...args })
    } else {
      return await ctx.db.insert('payments', {
        ...args,
        amount: args.amount!,
      })
    }
    return id
  },
})

// Get payment by ID
export const getPaymentById = query({
  args: {
    paymentId: v.id('payments'),
  },
  handler: async (ctx, args) => {
    const payment = await ctx.db.get(args.paymentId)
    const user = await ctx.db.get(payment?.user!)
    return {
      ...payment,
      user,
    }
  },
})
