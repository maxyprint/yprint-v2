import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// Phase 1: Request reset email
export async function POST(request: Request) {
  const { email } = await request.json() as { email: string }
  if (!email) return NextResponse.json({ error: 'E-Mail erforderlich' }, { status: 400 })

  const supabase = await createClient()
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
  })

  // Always return success to prevent email enumeration
  return NextResponse.json({ success: true, message: 'Falls diese E-Mail existiert, erhältst du einen Reset-Link.' })
}

// Phase 2: Set new password (user arrives via email link, has valid session)
export async function PUT(request: Request) {
  const { password } = await request.json() as { password: string }
  if (!password || password.length < 8) {
    return NextResponse.json({ error: 'Passwort muss mindestens 8 Zeichen haben' }, { status: 400 })
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ password })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ success: true })
}
