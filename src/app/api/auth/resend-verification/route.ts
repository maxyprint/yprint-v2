import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const { email } = await request.json()
  if (!email) return NextResponse.json({ error: 'E-Mail fehlt.' }, { status: 400 })

  const supabase = await createClient()
  await supabase.auth.resend({ type: 'signup', email })

  // Always return success to prevent email enumeration
  return NextResponse.json({ success: true })
}
