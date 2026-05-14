import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  return NextResponse.json({
    id: user?.id,
    email: user?.email,
    user_metadata: user?.user_metadata,
    app_metadata: user?.app_metadata,
    role_check: user?.user_metadata?.role || user?.app_metadata?.role,
  })
}
