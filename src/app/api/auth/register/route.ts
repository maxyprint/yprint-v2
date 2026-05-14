import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendVerificationEmail } from '@/lib/email/resend'

const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

async function verifyTurnstile(token: string, ip: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) return true // Skip in dev if not configured
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

  let body: {
    email: string
    password: string
    username?: string
    'cf-turnstile-response'?: string
    consents?: { essential?: boolean; analytics?: boolean; marketing?: boolean; functional?: boolean }
  }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { email, password, username } = body
  const turnstileToken = body['cf-turnstile-response']

  if (!email || !password) {
    return NextResponse.json({ error: 'E-Mail und Passwort erforderlich' }, { status: 400 })
  }
  if (password.length < 8) {
    return NextResponse.json({ error: 'Passwort muss mindestens 8 Zeichen haben' }, { status: 400 })
  }

  // Turnstile verification
  if (turnstileToken) {
    const ok = await verifyTurnstile(turnstileToken, ip)
    if (!ok) return NextResponse.json({ error: 'Bot-Verifikation fehlgeschlagen' }, { status: 400 })
  }

  const supabase = createAdminClient()

  // Create user via admin API (email not confirmed yet)
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: false,
    user_metadata: { username: username || email.split('@')[0], role: 'user' },
  })

  if (error) {
    if ((error as any).code === 'user_already_exists' || error.message.includes('already registered')) {
      return NextResponse.json({ error: 'Diese E-Mail-Adresse ist bereits registriert' }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  const userId = data.user.id

  // Create related records
  await Promise.all([
    supabase.from('user_profiles').insert({ user_id: userId }),
    supabase.from('notification_settings').insert({ user_id: userId }),
    supabase.from('privacy_settings').insert({ user_id: userId }),
  ])

  // Save consents if provided
  if (body.consents) {
    const consentEntries = Object.entries(body.consents).map(([type, granted]) => ({
      user_id: userId,
      consent_type: type,
      granted: !!granted,
      ip_address: ip,
    }))
    await supabase.from('consents').insert(consentEntries)
  }

  // Generate verification link and send via Resend
  const { data: linkData } = await supabase.auth.admin.generateLink({
    type: 'signup',
    email,
    password,
    options: { redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/verify-email` },
  })
  if (linkData?.properties?.action_link) {
    const emailResult = await sendVerificationEmail(email, linkData.properties.action_link, username).catch((err) => {
      console.error('[Resend] Verification email failed:', err?.message ?? err)
      return null
    })
    if (emailResult && 'error' in emailResult && emailResult.error) {
      console.error('[Resend] API error:', JSON.stringify(emailResult.error))
    }
  } else {
    console.error('[Register] generateLink returned no action_link for', email)
  }

  // HubSpot integration (non-blocking)
  if (process.env.HUBSPOT_ACCESS_TOKEN) {
    fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.HUBSPOT_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({ properties: { email, firstname: username || '' } }),
    }).catch(() => {})
  }

  return NextResponse.json({
    success: true,
    message: 'Registrierung erfolgreich. Bitte bestätige deine E-Mail-Adresse.',
    user_id: userId,
  })
}
