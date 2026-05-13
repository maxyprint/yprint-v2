import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/helpers'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: Request) {
  const { user, error } = await requireAdmin()
  if (error || !user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const status = new URL(request.url).searchParams.get('status')
  const supabase = createAdminClient()

  let query = supabase
    .from('orders')
    .select('id, order_number, status, payment_status, total, created_at, user_id, print_provider_sent_at')
    .order('created_at', { ascending: false })

  if (status) query = query.eq('status', status)

  const { data, error: dbError } = await query
  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })
  return NextResponse.json({ success: true, data: data || [] })
}
