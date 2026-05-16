import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/helpers'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  const { user, error } = await requireAdmin()
  if (error || !user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const supabase = createAdminClient()
  const { data, error: dbError } = await supabase
    .from('app_settings')
    .select('key, value')

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })

  const settings: Record<string, unknown> = {}
  for (const row of data ?? []) settings[row.key] = row.value

  return NextResponse.json({ success: true, data: settings })
}

export async function PUT(request: Request) {
  const { user, error } = await requireAdmin()
  if (error || !user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json() as { key: string; value: unknown }
  if (!body.key) return NextResponse.json({ error: 'key fehlt' }, { status: 400 })

  const supabase = createAdminClient()
  const { error: dbError } = await supabase
    .from('app_settings')
    .upsert({ key: body.key, value: body.value })

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
