import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/helpers'
import { createAdminClient } from '@/lib/supabase/admin'
import { stripe } from '@/lib/stripe/client'

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const { user, error: authError } = await requireAuth()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createAdminClient()
  const { data: method } = await supabase
    .from('payment_methods')
    .select('stripe_payment_method_id')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (!method) return NextResponse.json({ error: 'Zahlungsmethode nicht gefunden.' }, { status: 404 })

  if (method.stripe_payment_method_id) {
    await stripe.paymentMethods.detach(method.stripe_payment_method_id).catch(() => null)
  }

  await supabase.from('payment_methods').delete().eq('id', params.id)
  return NextResponse.json({ success: true })
}
