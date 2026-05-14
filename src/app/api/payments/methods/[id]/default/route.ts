import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/helpers'
import { createAdminClient } from '@/lib/supabase/admin'

export async function PUT(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { user, error: authError } = await requireAuth()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createAdminClient()
  await supabase.from('payment_methods').update({ is_default: false }).eq('user_id', user.id)
  const { error } = await supabase
    .from('payment_methods').update({ is_default: true }).eq('id', id).eq('user_id', user.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
