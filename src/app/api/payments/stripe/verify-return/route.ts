import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/client'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: Request) {
  const paymentIntentId = new URL(request.url).searchParams.get('payment_intent_id')
  if (!paymentIntentId) return NextResponse.json({ error: 'payment_intent_id fehlt.' }, { status: 400 })

  const pi = await stripe.paymentIntents.retrieve(paymentIntentId)
  if (pi.status !== 'succeeded') {
    return NextResponse.json({ error: 'Zahlung nicht abgeschlossen.' }, { status: 400 })
  }

  const supabase = createAdminClient()
  const { data: order } = await supabase
    .from('orders')
    .select('order_number')
    .eq('stripe_payment_intent_id', paymentIntentId)
    .maybeSingle()

  return NextResponse.json({ success: true, orderNumber: order?.order_number || null })
}
