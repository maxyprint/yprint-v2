import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/helpers'
import { createAdminClient } from '@/lib/supabase/admin'
import { calcPrintCoords, MeasurementsData } from '@/lib/print/calcCoords'

const AKD_API_URL = 'https://api.allesklardruck.de/order'

interface AkdPrint {
  position: string
  file_url: string
  offsetX: number
  offsetY: number
  width: number
  height: number
}

interface AkdItem {
  product_type: string
  manufacturer: string
  series: string
  color: string
  size: string
  quantity: number
  print_method: string
  prints: AkdPrint[]
}

interface AkdPayload {
  order_id: string
  shipping_address: {
    name: string
    street: string
    zip: string
    city: string
    country: string
    company?: string
  }
  items: AkdItem[]
}

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { user, error } = await requireAdmin()
  if (error || !user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const APP_ID = process.env.ALLESKLARDRUCK_APP_ID
  const API_KEY = process.env.ALLESKLARDRUCK_API_KEY
  if (!APP_ID || !API_KEY) {
    return NextResponse.json({ error: 'AllesKlarDruck API nicht konfiguriert.' }, { status: 500 })
  }

  const supabase = createAdminClient()

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', id)
    .single()
  if (orderError || !order) {
    return NextResponse.json({ error: 'Bestellung nicht gefunden.' }, { status: 404 })
  }

  const addr = order.shipping_address as Record<string, string> | null
  if (!addr) {
    return NextResponse.json({ error: 'Lieferadresse fehlt.' }, { status: 400 })
  }

  const items: AkdItem[] = []

  for (const item of order.order_items as any[]) {
    // Load template to get AKD product config + variations + dimensions
    const { data: template } = await supabase
      .from('design_templates')
      .select('variations, physical_width_cm, physical_height_cm')
      .eq('id', item.template_id)
      .single()

    if (!template) {
      return NextResponse.json({ error: `Template ${item.template_id} nicht gefunden.` }, { status: 400 })
    }

    const variations = template.variations as Record<string, any>
    const akdConfig = variations._akd || {}
    const measurements = variations._measurements as MeasurementsData | undefined
    const printWidthCm: number = (template as any).physical_width_cm ?? 30
    const printHeightCm: number = (template as any).physical_height_cm ?? 40

    // Resolve variation → AKD color + views
    const variation = variations[item.variation_id]
    if (!variation) {
      return NextResponse.json({ error: `Variation ${item.variation_id} nicht gefunden.` }, { status: 400 })
    }

    // Load design PNGs for this order item's design
    const { data: pngs } = await supabase
      .from('design_pngs')
      .select('view_id, public_url')
      .eq('design_id', item.design_id)

    const pngByView = Object.fromEntries((pngs ?? []).map((p: any) => [p.view_id, p.public_url]))

    // Build prints array from all views that have a PNG
    const prints: AkdPrint[] = []
    for (const [viewId, view] of Object.entries(variation.views as Record<string, any>)) {
      const fileUrl = pngByView[viewId]
      if (!fileUrl) continue

      // Prefer per-size calculation from measurements table; fall back to stored mm fields
      let offsetX: number, offsetY: number, width: number, height: number
      const sizeMeasurement = measurements?.per_size?.[item.size]
      if (sizeMeasurement) {
        const coords = calcPrintCoords(sizeMeasurement, printWidthCm, printHeightCm, measurements!.print_y_offset_mm)
        offsetX = coords.offsetX_mm
        offsetY = coords.offsetY_mm
        width   = coords.width_mm
        height  = coords.height_mm
      } else {
        const pz = view.printZone || {}
        offsetX = pz.offsetX_mm ?? 0
        offsetY = pz.offsetY_mm ?? 0
        width   = pz.width_mm ?? (printWidthCm * 10)
        height  = pz.height_mm ?? (printHeightCm * 10)
      }

      prints.push({
        position: view.akd_position || 'front',
        file_url: fileUrl,
        offsetX,
        offsetY,
        width,
        height,
      })
    }

    if (prints.length === 0) {
      return NextResponse.json({ error: `Keine Print-PNG für Design ${item.design_id} vorhanden.` }, { status: 400 })
    }

    items.push({
      product_type: akdConfig.product_type || 'TSHIRT',
      manufacturer: akdConfig.manufacturer || 'yprint',
      series: akdConfig.series || 'SS25',
      color: variation.akd_color || variation.name,
      size: item.size,
      quantity: item.quantity,
      print_method: akdConfig.print_method || 'DTG',
      prints,
    })
  }

  const payload: AkdPayload = {
    order_id: order.order_number,
    shipping_address: {
      name: [addr.first_name, addr.last_name].filter(Boolean).join(' '),
      street: [addr.street, addr.street_nr].filter(Boolean).join(' '),
      zip: addr.zip,
      city: addr.city,
      country: addr.country || 'DE',
      ...(addr.company ? { company: addr.company } : {}),
    },
    items,
  }

  const response = await fetch(AKD_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-App-Id': APP_ID,
      'X-Api-Key': API_KEY,
    },
    body: JSON.stringify(payload),
  })

  const result = await response.json().catch(() => ({ message: 'Invalid response' }))
  if (!response.ok) {
    return NextResponse.json(
      { error: result.message || `AKD API error: ${response.status}` },
      { status: 502 }
    )
  }

  await supabase
    .from('orders')
    .update({
      print_provider_sent_at: new Date().toISOString(),
      print_provider_response: result,
      status: 'processing',
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  return NextResponse.json({ success: true, data: result })
}
