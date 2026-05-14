import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createAdminClient()
  const { data, error } = await supabase.from('design_templates').select('*').eq('id', id).single()
  if (error || !data) return NextResponse.json({ error: 'Template nicht gefunden.' }, { status: 404 })
  return NextResponse.json({ success: true, data })
}
