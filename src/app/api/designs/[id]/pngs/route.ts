import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/helpers'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { user, error: authError } = await requireAuth()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createAdminClient()
  const { data: design } = await supabase
    .from('user_designs').select('id').eq('id', id).eq('user_id', user.id).single()
  if (!design) return NextResponse.json({ error: 'Design nicht gefunden.' }, { status: 404 })

  const { data, error } = await supabase
    .from('design_pngs').select('*').eq('design_id', id).order('generated_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, data: data || [] })
}
