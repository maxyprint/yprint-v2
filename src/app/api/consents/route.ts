import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const body = await request.json()
  const { consents, sessionId } = body

  const supabase = createAdminClient()
  const authSupabase = await createClient()
  const { data: { user } } = await authSupabase.auth.getUser()

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || null
  const userAgent = request.headers.get('user-agent') || null

  const records = Object.entries(consents).map(([type, granted]) => ({
    user_id: user?.id || null,
    session_id: sessionId || null,
    consent_type: type,
    granted: Boolean(granted),
    ip_address: ip,
    user_agent: userAgent,
  }))

  const { error } = await supabase.from('consents').insert(records)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
