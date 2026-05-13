import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const { tokenHash } = await request.json()
  if (!tokenHash) return NextResponse.json({ error: 'Token fehlt.' }, { status: 400 })

  const supabase = await createClient()
  const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: 'email' })
  if (error) return NextResponse.json({ error: 'Ungültiger oder abgelaufener Link.' }, { status: 400 })

  return NextResponse.json({ success: true })
}
