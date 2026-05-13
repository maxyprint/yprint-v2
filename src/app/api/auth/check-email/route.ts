import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  const { email } = await request.json() as { email: string }
  if (!email) return NextResponse.json({ available: false })

  const supabase = createAdminClient()
  const { data } = await supabase.auth.admin.listUsers()
  const exists = data.users.some(u => u.email === email.toLowerCase())

  return NextResponse.json({ available: !exists })
}
