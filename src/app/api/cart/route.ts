import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/helpers'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: Request) {
  const { user } = await requireAuth()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sessionId = new URL(request.url).searchParams.get('session_id')
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
  const { items, coupon_code, session_id } = body

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('cart_sessions')
    .upsert({
      user_id: user.id,
      session_id: session_id || crypto.randomUUID(),
      items: items || [],
      coupon_code: coupon_code || null,
      updated_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    }, { onConflict: 'user_id' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, data })
}
