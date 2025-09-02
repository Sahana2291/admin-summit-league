import { httpRouter } from 'convex/server'
import { httpAction } from './_generated/server'
import { internal, api } from './_generated/api'
import type { WebhookEvent } from '@clerk/backend'
import { Webhook } from 'svix'
import { Id } from './_generated/dataModel'

const http = httpRouter()

http.route({
  path: '/clerk-users-webhook',
  method: 'POST',
  handler: httpAction(async (ctx, request) => {
    const event = await validateRequest(request)
    if (!event) {
      return new Response('Error occured', { status: 400 })
    }
    switch (event.type) {
      case 'user.created': // intentional fallthrough
      case 'user.updated':
        await ctx.runMutation(internal.users.upsertFromClerk, {
          data: event.data,
        })
        break

      case 'user.deleted': {
        const clerkUserId = event.data.id!
        await ctx.runMutation(internal.users.deleteFromClerk, { clerkUserId })
        break
      }
      default:
        console.log('Ignored Clerk webhook event', event.type)
    }

    return new Response(null, { status: 200 })
  }),
})

http.route({
  path: '/payment-webhook',
  method: 'POST',
  handler: httpAction(async (ctx, request) => {
    const body = await request.json()
    if (body?.request?.crm !== 'traders-arena') return new Response(null, { status: 200 })

    const id = (body?.request?.metadata?.orderId as Id<'payments'>) || null

    if (!id) {
      return new Response(null, { status: 404 })
    }

    const payment = await ctx.runQuery(api.payments.getPaymentById, {
      paymentId: id,
    })

    if (!payment || !payment.user) {
      return new Response(null, { status: 404 })
    }

    switch (body.status) {
      case 'successful':
        const broker = await ctx.runAction(api.broker.createTradingAccount, {
          email: payment.user.email,
          first_name: payment.user.firstName,
          last_name: payment.user.lastName,
        })
        await ctx.runMutation(api.accounts.createAccount, {
          user: payment.user._id!,
          broker: broker,
          leagues: payment.league,
          name: body?.request?.metadata?.name,
          payment: id,
        })
        break
      default:
        break
    }

    await ctx.runMutation(api.payments.upsertPayment, {
      id,
      user: payment.user._id,
      ...(body.status === 'successful' ? { status: 'success' } : {}),
    })

    return new Response(null, { status: 200 })
  }),
})

async function validateRequest(req: Request): Promise<WebhookEvent | null> {
  const payloadString = await req.text()
  const svixHeaders = {
    'svix-id': req.headers.get('svix-id')!,
    'svix-timestamp': req.headers.get('svix-timestamp')!,
    'svix-signature': req.headers.get('svix-signature')!,
  }
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!)
  try {
    return wh.verify(payloadString, svixHeaders) as unknown as WebhookEvent
  } catch (error) {
    console.error('Error verifying webhook event', error)
    return null
  }
}

export default http
