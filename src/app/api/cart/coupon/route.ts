import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/helpers'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  const { user } = await requireAuth()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { code, cartTotal } = await request.json()
  if (!code) return NextResponse.json({ error: 'Code fehlt.' }, { status: 400 })

  const supabase = createAdminClient()
  const { data: coupon } = await supabase
    .from('coupons')
    .select('*')
    .eq('code', code.toUpperCase())
    .eq('active', true)
    .single()

  if (!coupon) return NextResponse.json({ error: 'Ungültiger Gutscheincode.' }, { status: 400 })
  if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
    return NextResponse.json({ error: 'Gutschein abgelaufen.' }, { status: 400 })
  }
  if (coupon.max_uses && coupon.used_count >= coupon.max_uses) {
    return NextResponse.json({ error: 'Gutschein bereits vollständig eingelöst.' }, { status: 400 })
  }
  if (cartTotal < coupon.min_order_value) {
    return NextResponse.json({
      error: `Mindestbestellwert von ${coupon.min_order_value.toFixed(2)} € nicht erreicht.`
    }, { status: 400 })
  }

  const discount = coupon.discount_type === 'percent'
    ? (cartTotal * coupon.discount_value) / 100
    : coupon.discount_value

  return NextResponse.json({
    success: true,
    data: {
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      discount_amount: Math.min(discount, cartTotal),
    }
  })
}
