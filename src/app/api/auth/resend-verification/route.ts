import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendVerificationEmail } from '@/lib/email/resend'

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

  const supabase = createAdminClient()

  // For existing unconfirmed users, generateLink(signup) generates a new
  // confirmation token without updating the password — safe to call with a placeholder.
  const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
    type: 'signup',
    email,
    password: crypto.randomUUID(),
    options: { redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/verify-email` },
  })

  if (linkError || !linkData?.properties?.action_link) {
    console.error('[ResendVerification] generateLink error:', linkError?.message)
    return NextResponse.json({ success: true })
  }

  await sendVerificationEmail(email, linkData.properties.action_link).catch(err => {
    console.error('[ResendVerification] Email send error:', err?.message ?? err)
  })

  return NextResponse.json({ success: true })
}
