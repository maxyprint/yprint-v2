import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

async function verifyTurnstile(token: string, ip: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) return true
  const res = await fetch(TURNSTILE_VERIFY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ secret, response: token, remoteip: ip }),
  })
  const data = await res.json() as { success: boolean }
  return data.success
}

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || '127.0.0.1'
  const body = await request.json() as {
    email: string
    password: string
    'cf-turnstile-response'?: string
  }

  const { email, password } = body
  if (!email || !password) {
    return NextResponse.json({ error: 'E-Mail und Passwort erforderlich' }, { status: 400 })
  }

  const turnstileToken = body['cf-turnstile-response']
  if (turnstileToken) {
    const ok = await verifyTurnstile(turnstileToken, ip)
    if (!ok) return NextResponse.json({ error: 'Bot-Verifikation fehlgeschlagen' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return NextResponse.json(
      { error: 'E-Mail oder Passwort falsch' },
      { status: 401 }
    )
  }

  // Track login timestamp (non-blocking — don't fail the login if this fails)
  void createAdminClient()
    .from('user_profiles')
    .update({ last_login_at: new Date().toISOString(), last_active_at: new Date().toISOString() })
    .eq('user_id', data.user.id)

  return NextResponse.json({
    success: true,
    user: {
      id: data.user.id,
      email: data.user.email,
      role: data.user.user_metadata?.role || 'user',
    },
    access_token: data.session.access_token,
  })
}
