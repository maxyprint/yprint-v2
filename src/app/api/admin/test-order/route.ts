import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/helpers'
import { createAdminClient } from '@/lib/supabase/admin'
import { generateOrderNumber } from '@/lib/utils'
import { sendOrderConfirmationEmail } from '@/lib/email/resend'
import { generatePrintPNG } from '@/lib/print/server-generate-print-png'

export const maxDuration = 60
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const { user, error } = await requireAdmin()
  if (error || !user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { cart_session_id, address_id } = await request.json()
  if (!cart_session_id) return NextResponse.json({ error: 'cart_session_id required' }, { status: 400 })

  const supabase = createAdminClient()

  const { data: cart } = await supabase
    .from('cart_sessions')
    .select('*')
    .eq('id', cart_session_id)
    .single()

  if (!cart) return NextResponse.json({ error: 'Cart not found' }, { status: 404 })

  let shippingAddress = null
  if (address_id) {
    const { data: addr } = await supabase
      .from('user_addresses')
      .select('*')
      .eq('id', address_id)
      .single()
    if (addr) shippingAddress = addr
  }

  const cartItems: Array<{
    design_id: string
    template_id: string
    variation_id: string
    size: string
    quantity: number
    unit_price: number
    design_name?: string
  }> = cart.items || []

  const subtotal = cartItems.reduce((s, i) => s + i.unit_price * i.quantity, 0)
  const shipping = subtotal > 0 ? 5 : 0
  const total = subtotal + shipping
  const orderNumber = generateOrderNumber()

  const { data: order } = await supabase.from('orders').insert({
    user_id: user.id,
    order_number: orderNumber,
    status: 'processing',
    payment_status: 'paid',
    payment_method: 'test',
    stripe_payment_intent_id: `test_${Date.now()}`,
    subtotal,
    discount_amount: 0,
    shipping_cost: shipping,
    total,
    currency: 'EUR',
    coupon_code: cart.coupon_code || null,
    shipping_address: shippingAddress,
    billing_address: shippingAddress,
  }).select('id').single()

  if (!order) return NextResponse.json({ error: 'Order creation failed' }, { status: 500 })

  const orderItemsWithPrint = []
  for (const item of cartItems) {
    let printPngUrl: string | null = null
    let designSnapshot: Record<string, unknown> | null = null

    if (item.design_id) {
      const { data: design } = await supabase
        .from('user_designs')
        .select('user_id, design_data, template_id')
        .eq('id', item.design_id)
        .single()

      if (design?.design_data) {
        designSnapshot = design.design_data as Record<string, unknown>
      }

      const { data: png } = await supabase
        .from('design_pngs')
        .select('public_url')
        .eq('design_id', item.design_id)
        .in('view_id', ['front', 'view_1'])
        .order('generated_at', { ascending: false })
        .limit(1)
        .single()

      if (png) {
        printPngUrl = png.public_url
      } else if (design?.design_data) {
        printPngUrl = await generatePrintPNG(
          item.design_id,
          design.user_id,
          design.template_id ?? null,
          design.design_data as Record<string, unknown>
        )
      }
    }

    orderItemsWithPrint.push({
      order_id: order.id,
      design_id: item.design_id || null,
      template_id: item.template_id || null,
      variation_id: item.variation_id || null,
      size: item.size || null,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.unit_price * item.quantity,
      print_png_url: printPngUrl,
      design_snapshot: designSnapshot,
    })
  }

  if (orderItemsWithPrint.length > 0) {
    await supabase.from('order_items').insert(orderItemsWithPrint)
  }

  await supabase.from('cart_sessions').delete().eq('id', cart_session_id)

  if (user.email) {
    await sendOrderConfirmationEmail(
      user.email,
      orderNumber,
      cartItems.map(i => ({ name: i.design_name || 'Design', quantity: i.quantity, price: i.unit_price })),
      total
    )
  }

  return NextResponse.json({ success: true, order_number: orderNumber })
}
