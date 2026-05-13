import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/helpers'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(_: Request, { params }: { params: { id: string } }) {
  const { user, error } = await requireAdmin()
  if (error || !user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const supabase = createAdminClient()
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', params.id)
    .single()

  if (orderError || !order) return NextResponse.json({ error: 'Bestellung nicht gefunden.' }, { status: 404 })

  const APP_ID = process.env.ALLESKLARDRUCK_APP_ID
  const API_KEY = process.env.ALLESKLARDRUCK_API_KEY

  if (!APP_ID || !API_KEY) {
    return NextResponse.json({ error: 'AllesKlarDruck API nicht konfiguriert.' }, { status: 500 })
  }

  const payload = {
    order_id: order.order_number,
    shipping_address: order.shipping_address,
    items: order.order_items.map((item: any) => ({
      template_id: item.template_id,
      variation_id: item.variation_id,
      size: item.size,
      quantity: item.quantity,
      print_file_url: item.print_png_url,
    })),
  }

  const response = await fetch('https://api.allesklardruck.de/v1/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-App-ID': APP_ID,
      'X-API-Key': API_KEY,
    },
    body: JSON.stringify(payload),
  })

  const result = await response.json()

  if (!response.ok) {
    return NextResponse.json({ error: result.message || 'AllesKlarDruck API Fehler.' }, { status: 502 })
  }

  await supabase
    .from('orders')
    .update({
      print_provider_sent_at: new Date().toISOString(),
      print_provider_response: result,
      status: 'processing',
      updated_at: new Date().toISOString(),
    })
    .eq('id', params.id)

  return NextResponse.json({ success: true, data: result })
}
