import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/helpers'
import { stripe, getOrCreateStripeCustomer } from '@/lib/stripe/client'

export async function POST() {
  const { user, error: authError } = await requireAuth()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const customerId = await getOrCreateStripeCustomer(user.id, user.email ?? '')
  const setupIntent = await stripe.setupIntents.create({
    customer: customerId,
    payment_method_types: ['card', 'sepa_debit'],
  })

  return NextResponse.json({ clientSecret: setupIntent.client_secret })
}
