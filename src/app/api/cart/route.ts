import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/helpers'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  const { user } = await requireAuth()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createAdminClient()
  const { data } = await supabase
    .from('cart_sessions')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  return NextResponse.json({ success: true, data: data || { items: [], coupon_code: null } })
}

export async function POST(request: Request) {
  const { user } = await requireAuth()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { items, coupon_code } = body

  const supabase = createAdminClient()

  // Find existing session for this user
  const { data: existing } = await supabase
    .from('cart_sessions')
    .select('id, session_id')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const sessionId = existing?.session_id || crypto.randomUUID()
  const now = new Date().toISOString()

  const { data, error } = await supabase
    .from('cart_sessions')
    .upsert({
      ...(existing?.id ? { id: existing.id } : {}),
      user_id: user.id,
      session_id: sessionId,
      items: items || [],
      coupon_code: coupon_code || null,
      updated_at: now,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    }, { onConflict: 'session_id' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, data })
}
