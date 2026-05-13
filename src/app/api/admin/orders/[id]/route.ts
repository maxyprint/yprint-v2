import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/helpers'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const { user, error } = await requireAdmin()
  if (error || !user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const supabase = createAdminClient()
  const { data, error: dbError } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', params.id)
    .single()

  if (dbError || !data) return NextResponse.json({ error: 'Bestellung nicht gefunden.' }, { status: 404 })
  return NextResponse.json({ success: true, data })
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const { user, error } = await requireAdmin()
  if (error || !user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json()
  const supabase = createAdminClient()

  const { data, error: dbError } = await supabase
    .from('orders')
    .update({ ...body, updated_at: new Date().toISOString() })
    .eq('id', params.id)
    .select()
    .single()

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })
  return NextResponse.json({ success: true, data })
}
