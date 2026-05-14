import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/helpers'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { user, error: authError } = await requireAuth()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('orders').select('*, order_items(*)').eq('id', id).eq('user_id', user.id).single()
  if (error || !data) return NextResponse.json({ error: 'Bestellung nicht gefunden.' }, { status: 404 })
  return NextResponse.json({ success: true, data })
}
