import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/helpers'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { user, error } = await requireAdmin()
  if (error || !user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const supabase = createAdminClient()
  const { data: order, error: dbError } = await supabase
    .from('orders').select('*, order_items(*)').eq('id', id).single()
  if (dbError || !order) return NextResponse.json({ error: 'Bestellung nicht gefunden.' }, { status: 404 })

  // Attach design PNGs per item so the UI can show print files per view
  const designIds = (order.order_items as { design_id: string | null }[])
    .map(i => i.design_id).filter(Boolean) as string[]

  const pngsByDesign: Record<string, unknown[]> = {}
  if (designIds.length > 0) {
    const { data: pngs } = await supabase
      .from('design_pngs')
      .select('design_id, view_id, view_name, public_url, print_area_mm, save_type')
      .in('design_id', designIds)
    for (const png of pngs ?? []) {
      const did = (png as { design_id: string }).design_id
      if (!pngsByDesign[did]) pngsByDesign[did] = []
      pngsByDesign[did].push(png)
    }
  }

  return NextResponse.json({ success: true, data: { ...order, design_pngs: pngsByDesign } })
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { user, error } = await requireAdmin()
  if (error || !user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json()
  const supabase = createAdminClient()
  const allowed = ['status', 'payment_status']
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  for (const k of allowed) {
    if (k in body) updates[k] = body[k]
  }
  const { data, error: dbError } = await supabase
    .from('orders').update(updates).eq('id', id).select().single()
  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })
  return NextResponse.json({ success: true, data })
}
