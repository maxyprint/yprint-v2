import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/helpers'
import { stripe, getOrCreateStripeCustomer } from '@/lib/stripe/client'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  const { user, error } = await requireAuth()
  if (error) return error

  const { cart_session_id, payment_method_types = ['card'] } = await request.json() as {
    cart_session_id: string
    payment_method_types?: string[]
  }

  const supabase = createAdminClient()

  // Load cart
  const { data: cart } = await supabase
    .from('cart_sessions')
    .select('*')
    .eq('id', cart_session_id)
    .single()

  if (!cart || !cart.items?.length) {
    return NextResponse.json({ error: 'Warenkorb ist leer' }, { status: 400 })
  }

  // Calculate total
  const items = cart.items as Array<{ unit_price: number; quantity: number }>
  const subtotalCents = items.reduce((sum, i) => sum + Math.round(i.unit_price * 100 * i.quantity), 0)
  const shippingCents = 500 // €5.00 flat rate
  const totalCents = subtotalCents + shippingCents

  // Get Supabase user email
  const { data: { user: sbUser } } = await supabase.auth.admin.getUserById(user!.id)
  const customerId = await getOrCreateStripeCustomer(
    user!.id,
    sbUser?.email || '',
    `${sbUser?.user_metadata?.username || ''}`
  )

  const paymentIntent = await stripe.paymentIntents.create({
    amount: totalCents,
    currency: 'eur',
    customer: customerId,
    payment_method_types,
    metadata: {
      user_id: user!.id,
      cart_session_id,
    },
  })

  return NextResponse.json({
    success: true,
    client_secret: paymentIntent.client_secret,
    payment_intent_id: paymentIntent.id,
    amount: totalCents,
  })
}
