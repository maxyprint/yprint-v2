import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe/client'
import { createAdminClient } from '@/lib/supabase/admin'
import { generateOrderNumber } from '@/lib/utils'
import { sendOrderConfirmationEmail } from '@/lib/email/resend'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) return new Response('No signature', { status: 400 })

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return new Response('Webhook Error', { status: 400 })
  }

  const supabase = createAdminClient()

  switch (event.type) {
    case 'payment_intent.succeeded': {
      const pi = event.data.object as Stripe.PaymentIntent
      await handlePaymentSucceeded(pi, supabase)
      break
    }
    case 'payment_intent.payment_failed': {
      const pi = event.data.object as Stripe.PaymentIntent
      await supabase.from('orders')
        .update({ status: 'pending', payment_status: 'unpaid' })
        .eq('stripe_payment_intent_id', pi.id)
      break
    }
    case 'charge.refunded': {
      const charge = event.data.object as Stripe.Charge
      if (charge.payment_intent) {
        await supabase.from('orders')
          .update({ status: 'refunded', payment_status: 'refunded' })
          .eq('stripe_payment_intent_id', charge.payment_intent as string)
      }
      break
    }
    case 'setup_intent.succeeded': {
      const si = event.data.object as Stripe.SetupIntent
      await handleSetupIntentSucceeded(si, supabase)
      break
    }
  }

  return new Response('ok', { status: 200 })
}

async function handlePaymentSucceeded(pi: Stripe.PaymentIntent, supabase: ReturnType<typeof createAdminClient>) {
  const userId = pi.metadata?.user_id
  const cartSessionId = pi.metadata?.cart_session_id

  // Check if order already exists
  const { data: existing } = await supabase
    .from('orders')
    .select('id')
    .eq('stripe_payment_intent_id', pi.id)
    .single()

  if (existing) {
    await supabase.from('orders')
      .update({ status: 'processing', payment_status: 'paid' })
      .eq('id', existing.id)
    return
  }

  // Load cart session
  let cartItems: unknown[] = []
  let shippingAddress = null
  let billingAddress = null
  let couponCode = null

  if (cartSessionId) {
    const { data: cart } = await supabase
      .from('cart_sessions')
      .select('*')
      .eq('id', cartSessionId)
      .single()
    if (cart) {
      cartItems = cart.items
      couponCode = cart.coupon_code
    }
  }

  const orderNumber = generateOrderNumber()
  const totalEuros = pi.amount / 100 // Stripe amount is in cents, store as euros

  // Create order
  const { data: order } = await supabase.from('orders').insert({
    user_id: userId || null,
    order_number: orderNumber,
    status: 'processing',
    payment_status: 'paid',
    payment_method: pi.payment_method_types?.[0] || 'card',
    stripe_payment_intent_id: pi.id,
    subtotal: totalEuros,
    total: totalEuros,
    currency: pi.currency.toUpperCase(),
    coupon_code: couponCode,
    shipping_address: shippingAddress,
    billing_address: billingAddress,
  }).select('id').single()

  if (!order) return

  // Create order items from cart
  if (cartItems.length > 0) {
    const items = (cartItems as Array<{ design_id: string; template_id: string; variation_id: string; size: string; quantity: number; unit_price: number }>).map(item => ({
      order_id: order.id,
      design_id: item.design_id || null,
      template_id: item.template_id || null,
      variation_id: item.variation_id || null,
      size: item.size || null,
      quantity: item.quantity,
      unit_price: item.unit_price, // already in euros
      total_price: item.unit_price * item.quantity,
    }))
    await supabase.from('order_items').insert(items)

    // Clear cart
    if (cartSessionId) {
      await supabase.from('cart_sessions').delete().eq('id', cartSessionId)
    }
  }

  // Send confirmation email
  if (userId) {
    const { data: user } = await supabase.auth.admin.getUserById(userId)
    if (user?.user?.email) {
      await sendOrderConfirmationEmail(
        user.user.email,
        orderNumber,
        (cartItems as Array<{ design_name?: string; quantity: number; unit_price: number }>).map(i => ({
          name: i.design_name || 'Design',
          quantity: i.quantity,
          price: i.unit_price, // euros
        })),
        totalEuros
      )
    }
  }
}

async function handleSetupIntentSucceeded(si: Stripe.SetupIntent, supabase: ReturnType<typeof createAdminClient>) {
  const userId = si.metadata?.user_id
  if (!userId || !si.payment_method) return

  const pm = await stripe.paymentMethods.retrieve(si.payment_method as string)

  const methodData: Record<string, unknown> = {}
  let methodType = 'card'

  if (pm.card) {
    methodType = 'card'
    methodData.last4 = pm.card.last4
    methodData.brand = pm.card.brand
    methodData.exp_month = pm.card.exp_month
    methodData.exp_year = pm.card.exp_year
  } else if (pm.sepa_debit) {
    methodType = 'sepa'
    methodData.iban_last4 = pm.sepa_debit.last4
    methodData.bank_name = pm.sepa_debit.bank_code
  }

  await supabase.from('payment_methods').insert({
    user_id: userId,
    method_type: methodType,
    stripe_payment_method_id: si.payment_method as string,
    stripe_customer_id: si.customer as string,
    method_data: methodData,
    is_default: false,
  })
}
