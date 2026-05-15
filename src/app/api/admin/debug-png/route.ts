import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/helpers'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { user, error } = await requireAdmin()
  if (error || !user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const supabase = createAdminClient()
  const url = new URL(request.url)
  const designId = url.searchParams.get('design_id')

  // --- overview mode (no design_id) ---
  if (!designId) {
    const { data: designs } = await supabase
      .from('user_designs')
      .select('id, name, user_id, design_data, print_file_url, updated_at')
      .order('updated_at', { ascending: false })
      .limit(10)

    const { data: pngs } = await supabase
      .from('design_pngs')
      .select('id, design_id, view_id, public_url, save_type, generated_at')
      .order('generated_at', { ascending: false })
      .limit(20)

    const { data: orderItems } = await supabase
      .from('order_items')
      .select('id, design_id, print_png_url, created_at')
      .order('created_at', { ascending: false })
      .limit(10)

    return NextResponse.json({
      hint: 'Add ?design_id=<uuid> for detailed design analysis',
      designs: designs?.map(d => ({
        id: d.id,
        name: d.name,
        has_design_data: d.design_data !== null,
        object_count: Array.isArray((d.design_data as any)?.objects)
          ? (d.design_data as any).objects.length
          : null,
        print_file_url: d.print_file_url,
        updated_at: d.updated_at,
      })),
      design_pngs: pngs,
      order_items: orderItems,
    })
  }

  // --- detailed mode (with design_id) ---
  const { data: design } = await supabase
    .from('user_designs')
    .select('*')
    .eq('id', designId)
    .single()

  if (!design) return NextResponse.json({ error: 'Design not found' }, { status: 404 })

  const dd = design.design_data as Record<string, unknown> | null
  const objects = Array.isArray(dd?.objects) ? (dd!.objects as Record<string, unknown>[]) : null
  const printZone = objects?.find(o => o.stroke === '#007cba' && o.fill === 'transparent')
  const imageObjects = objects?.filter(o =>
    o.type === 'image' && o.selectable !== false && o.stroke !== '#007cba' && !o.excludeFromExport
  )

  return NextResponse.json({
    design_id: designId,
    name: design.name,
    template_id: design.template_id,
    design_data_is_null: dd === null,
    design_data_keys: dd ? Object.keys(dd) : null,
    object_count: objects?.length ?? null,
    print_zone_found: !!printZone,
    print_zone: printZone
      ? { left: printZone.left, top: printZone.top, width: printZone.width, height: printZone.height, scaleX: printZone.scaleX, scaleY: printZone.scaleY }
      : null,
    image_objects_count: imageObjects?.length ?? null,
    image_srcs: imageObjects?.map(o => String(o.src ?? '').slice(0, 100)),
    all_object_types: objects?.map(o => ({
      type: o.type,
      stroke: o.stroke,
      fill: o.fill,
      selectable: o.selectable,
      excludeFromExport: o.excludeFromExport,
    })),
  })
}
