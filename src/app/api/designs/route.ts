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
  const allDesignIds   = designs.map(d => d.id)
  const templateIds    = [...new Set(designs.filter(d => d.template_id).map(d => d.template_id!))]

  // Fetch design PNGs for all designs (used as overlay in mockup)
  const pngUrlByDesign: Record<string, string> = {}
  if (allDesignIds.length > 0) {
    const { data: pngs } = await supabase
      .from('design_pngs')
      .select('design_id, public_url')
      .in('design_id', allDesignIds)
      .neq('save_type', 'empty')
      .order('generated_at', { ascending: false })
    for (const png of pngs ?? []) {
      const p = png as { design_id: string; public_url: string }
      if (!pngUrlByDesign[p.design_id]) pngUrlByDesign[p.design_id] = p.public_url
    }
  }

  // Fetch templates to get shirt base image + print zone for CSS mockup
  type PrintZone = { left: number; top: number; width: number; height: number }
  type ShirtInfo = { shirt_url: string; print_zone: PrintZone | null }
  const shirtByTemplate: Record<string, ShirtInfo> = {}
  if (templateIds.length > 0) {
    const { data: templates } = await supabase
      .from('design_templates')
      .select('id, variations')
      .in('id', templateIds)
    for (const t of templates ?? []) {
      const vars = t.variations as Record<string, unknown>
      const varEntries = Object.entries(vars).filter(([k]) => !k.startsWith('_'))
      const defEntry = varEntries.find(([, v]) => (v as { is_default?: boolean }).is_default) || varEntries[0]
      if (!defEntry) continue
      const views = (defEntry[1] as { views?: Record<string, unknown> }).views || {}
      const view = (views['view_front'] || Object.values(views)[0]) as { image_url?: string; printZone?: PrintZone } | undefined
      if (view?.image_url) {
        shirtByTemplate[t.id] = { shirt_url: view.image_url, print_zone: view.printZone ?? null }
      }
    }
  }

  const enriched = designs.map(d => ({
    ...d,
    design_png:  pngUrlByDesign[d.id]  ?? null,
    shirt_image: d.template_id ? (shirtByTemplate[d.template_id]?.shirt_url  ?? null) : null,
    print_zone:  d.template_id ? (shirtByTemplate[d.template_id]?.print_zone ?? null) : null,
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
