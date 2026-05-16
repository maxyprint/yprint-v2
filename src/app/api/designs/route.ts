import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/helpers'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  const { user, error: authError } = await requireAuth()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('user_designs')
    .select('id, name, product_name, product_images, template_id, product_status, created_at, updated_at')
    .eq('user_id', user.id)
    .eq('is_enabled', true)
    .order('updated_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const designs = data || []
  const missingImageIds = designs
    .filter(d => !d.product_images || (d.product_images as unknown[]).length === 0)
    .map(d => d.id)

  let pngFallbacks: Record<string, string> = {}
  if (missingImageIds.length > 0) {
    const { data: pngs } = await supabase
      .from('design_pngs')
      .select('design_id, public_url')
      .in('design_id', missingImageIds)
      .neq('save_type', 'empty')
      .order('generated_at', { ascending: false })
    for (const png of pngs ?? []) {
      const p = png as { design_id: string; public_url: string }
      if (!pngFallbacks[p.design_id]) pngFallbacks[p.design_id] = p.public_url
    }
  }

  const enriched = designs.map(d => ({
    ...d,
    fallback_image: pngFallbacks[d.id] ?? null,
  }))

  return NextResponse.json({ success: true, data: enriched })
}

export async function POST(request: Request) {
  const { user, error: authError } = await requireAuth()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { name, template_id, design_data, variations } = body

  if (!name || !design_data) return NextResponse.json({ error: 'Name und Design-Daten erforderlich.' }, { status: 400 })

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('user_designs')
    .insert({
      user_id: user.id,
      name,
      template_id: template_id || null,
      design_data,
      variations: variations || {},
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, data })
}
