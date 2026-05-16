import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/helpers'
import { stripe, getOrCreateStripeCustomer } from '@/lib/stripe/client'
import { createAdminClient } from '@/lib/supabase/admin'
import { getShippingCents } from '@/lib/settings/shipping'

export async function POST(request: Request) {
  const { user, error } = await requireAuth()
  if (error) return error

  const { cart_session_id, address_id } = await request.json() as {
    cart_session_id: string
    address_id?: string
  }

  const supabase = createAdminClient()

  const { data: cart } = await supabase
    .from('cart_sessions')
    .select('*')
    .eq('id', cart_session_id)
    .single()

  if (!cart || !cart.items?.length) {
    return NextResponse.json({ error: 'Warenkorb ist leer' }, { status: 400 })
  }

  const items = cart.items as Array<{ unit_price: number; quantity: number }>
  const subtotalCents = items.reduce((sum, i) => sum + Math.round(i.unit_price * 100 * i.quantity), 0)
  const shippingCents = await getShippingCents()

  let discountCents = 0
  if (cart.coupon_code) {
    const { data: coupon } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', cart.coupon_code)
      .eq('active', true)
      .single()
    if (coupon) {
      const raw = coupon.discount_type === 'percent'
        ? Math.round(subtotalCents * coupon.discount_value / 100)
        : Math.round(coupon.discount_value * 100)
      discountCents = Math.min(raw, subtotalCents)
    }
  }

  const totalCents = subtotalCents - discountCents + shippingCents

  const { data: { user: sbUser } } = await supabase.auth.admin.getUserById(user!.id)
  const customerId = await getOrCreateStripeCustomer(
    user!.id,
    sbUser?.email || '',
    sbUser?.user_metadata?.username || ''
  )

  const paymentIntent = await stripe.paymentIntents.create({
    amount: totalCents,
    currency: 'eur',
    customer: customerId,
    automatic_payment_methods: { enabled: true },
    metadata: {
      user_id: user!.id,
      cart_session_id,
      address_id: address_id || '',
      discount_cents: String(discountCents),
      shipping_cents: String(shippingCents),
    },
  })

  return NextResponse.json({
    success: true,
    client_secret: paymentIntent.client_secret,
    payment_intent_id: paymentIntent.id,
    amount: totalCents,
  })
}

export async function PATCH(request: Request) {
  const { user, error } = await requireAuth()
  if (error) return error

  const { payment_intent_id, address_id } = await request.json() as {
    payment_intent_id: string
    address_id: string
  }

  if (!payment_intent_id) {
    return NextResponse.json({ error: 'payment_intent_id fehlt' }, { status: 400 })
  }

  const pi = await stripe.paymentIntents.retrieve(payment_intent_id)
  if (pi.metadata?.user_id !== user!.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  await stripe.paymentIntents.update(payment_intent_id, {
    metadata: { ...pi.metadata, address_id: address_id || '' },
  })

  return NextResponse.json({ success: true })
}
