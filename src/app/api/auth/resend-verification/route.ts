import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  let body: { email?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { email } = body
  if (!email) {
    return NextResponse.json({ error: 'E-Mail erforderlich' }, { status: 400 })
  }

  const supabase = await createClient()

  // Uses Supabase's own verified mailer — works without custom domain setup
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
    options: { emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/verify-email` },
  })

  if (error) {
    console.error('[ResendVerification] resend error:', error.message)
  }

  // Always return success to prevent email enumeration
  return NextResponse.json({ success: true })
}
