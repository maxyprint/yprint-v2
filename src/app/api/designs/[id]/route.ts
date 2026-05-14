import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/helpers'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { user, error: authError } = await requireAuth()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('user_designs').select('*').eq('id', id).eq('user_id', user.id).single()
  if (error || !data) return NextResponse.json({ error: 'Design nicht gefunden.' }, { status: 404 })
  return NextResponse.json({ success: true, data })
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { user, error: authError } = await requireAuth()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const supabase = createAdminClient()

  const allowed = ['name', 'product_name', 'product_description', 'product_images', 'design_data', 'variations', 'product_status']
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  for (const key of allowed) {
    if (key in body) updates[key] = body[key]
  }

  const { data, error } = await supabase
    .from('user_designs').update(updates).eq('id', id).eq('user_id', user.id).select().single()
  if (error || !data) return NextResponse.json({ error: 'Design nicht gefunden.' }, { status: 404 })
  return NextResponse.json({ success: true, data })
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { user, error: authError } = await requireAuth()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createAdminClient()
  const { error } = await supabase
    .from('user_designs').update({ is_enabled: false, updated_at: new Date().toISOString() })
    .eq('id', id).eq('user_id', user.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
