import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/helpers'
import { createAdminClient } from '@/lib/supabase/admin'
import { calcPrintCoords, MeasurementsData } from '@/lib/print/calcCoords'

const AKD_API_URL = 'https://api.allesklardruck.de/order'

// Maps our internal template categories to AllesKlarDruck enum values
const PRODUCT_TYPE_MAP: Record<string, string> = {
  'T-Shirt': 'TSHIRT',
  'Tshirt':  'TSHIRT',
  'TSHIRT':  'TSHIRT',
  'Hoodie':  'HOODIE',
  'HOODIE':  'HOODIE',
  'Zip Hoodie': 'ZIPPER_JACKET',
  'ZIPPER_JACKET': 'ZIPPER_JACKET',
  'Polo':   'POLO',
  'POLO':   'POLO',
  'Long Sleeve': 'LONG_SLEEVE',
  'LONG_SLEEVE': 'LONG_SLEEVE',
}

const SENDER = {
  name: 'YPrint',
  street: 'Rottendorfer Straße 35A',
  city: 'Würzburg',
  postalCode: '97074',
  country: 'DE',
}

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { user, error } = await requireAdmin()
  if (error || !user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const APP_ID = process.env.ALLESKLARDRUCK_APP_ID
  const API_KEY = process.env.ALLESKLARDRUCK_API_KEY
  if (!APP_ID || !API_KEY) {
    return NextResponse.json({ error: 'ALLESKLARDRUCK_APP_ID / ALLESKLARDRUCK_API_KEY nicht konfiguriert.' }, { status: 500 })
  }

  const supabase = createAdminClient()

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', id)
    .single()
  if (orderError || !order) return NextResponse.json({ error: 'Bestellung nicht gefunden.' }, { status: 404 })

  const addr = order.shipping_address as Record<string, string> | null
  if (!addr) return NextResponse.json({ error: 'Lieferadresse fehlt.' }, { status: 400 })

  const orderPositions = []

  for (const item of order.order_items as Record<string, unknown>[]) {
    const { data: template } = await supabase
      .from('design_templates')
      .select('variations, physical_width_cm, physical_height_cm, category')
      .eq('id', item.template_id as string)
      .single()

    if (!template) return NextResponse.json({ error: `Template ${item.template_id} nicht gefunden.` }, { status: 400 })

    const variations  = template.variations as Record<string, unknown>
    const akdConfig   = (variations._akd  as Record<string, string>) || {}
    const measurements= variations._measurements as MeasurementsData | undefined
    const variation   = variations[item.variation_id as string] as Record<string, unknown> | undefined
    if (!variation) return NextResponse.json({ error: `Variation ${item.variation_id} nicht gefunden.` }, { status: 400 })

    const physW: number = (template as { physical_width_cm?: number }).physical_width_cm  ?? 30
    const physH: number = (template as { physical_height_cm?: number }).physical_height_cm ?? 40

    // Resolve product type enum
    const rawType = akdConfig.product_type || (template as { category?: string }).category || 'TSHIRT'
    const productType = PRODUCT_TYPE_MAP[rawType] ?? rawType

    // Load design PNGs for this item
    const { data: pngs } = await supabase
      .from('design_pngs')
      .select('view_id, public_url, print_area_mm')
      .eq('design_id', item.design_id as string)
      .neq('save_type', 'empty')

    const pngMap = Object.fromEntries((pngs ?? []).map((p) => [
      (p as { view_id: string }).view_id,
      p as { view_id: string; public_url: string; print_area_mm: { width: number; height: number } | null }
    ]))

    const printPositions = []
    for (const [viewId, view] of Object.entries(variation.views as Record<string, Record<string, unknown>> || {})) {
      const png = pngMap[viewId]
      if (!png?.public_url) continue

      let width: number, height: number, offsetX: number, offsetY: number
      const sizeMeasurement = measurements?.per_size?.[item.size as string]

      if (sizeMeasurement) {
        const coords = calcPrintCoords(sizeMeasurement, physW, physH, measurements!.print_y_offset_mm)
        width   = coords.width_mm
        height  = coords.height_mm
        offsetX = coords.offsetX_mm
        offsetY = coords.offsetY_mm
      } else if (png.print_area_mm) {
        width   = png.print_area_mm.width
        height  = png.print_area_mm.height
        // Derive offset from printZone center position
        const pz = view.printZone as Record<string, number> | undefined
        if (pz) {
          offsetX = Math.round(((pz.left / 100) * physW * 10 - (pz.width / 100) * physW * 10 / 2) * 10) / 10
          offsetY = Math.round(((pz.top  / 100) * physH * 10 - (pz.height / 100) * physH * 10 / 2) * 10) / 10
        } else {
          offsetX = Math.round(((physW * 10 - width)  / 2) * 10) / 10
          offsetY = Math.round(((physH * 10 - height) / 2) * 10) / 10
        }
      } else {
        width   = physW * 10
        height  = physH * 10
        offsetX = 0
        offsetY = 0
      }

      printPositions.push({
        position:       (view.akd_position as string) || viewId.replace('view_', ''),
        width:          Math.round(width  * 10) / 10,
        height:         Math.round(height * 10) / 10,
        unit:           'mm',
        offsetX:        Math.round(offsetX * 10) / 10,
        offsetY:        Math.round(offsetY * 10) / 10,
        offsetUnit:     'mm',
        referencePoint: 'top-left',
        resolution:     300,
        colorProfile:   'sRGB',
        bleed:          2,
        scaling:        'proportional',
        printQuality:   'standard',
        printFile:      png.public_url,
      })
    }

    if (printPositions.length === 0) {
      return NextResponse.json({ error: `Keine Print-PNG für Design ${item.design_id} vorhanden.` }, { status: 400 })
    }

    orderPositions.push({
      type:         productType,
      printMethod:  akdConfig.print_method || 'DTG',
      manufacturer: akdConfig.manufacturer || 'yprint',
      series:       akdConfig.series       || 'SS25',
      color:        (variation.akd_color as string) || (variation.name as string) || '',
      size:         item.size as string,
      quantity:     item.quantity as number,
      printPositions,
    })
  }

  const payload = {
    orderNumber: order.order_number,
    orderDate:   order.created_at,
    shipping: {
      recipient: {
        name:       [addr.first_name, addr.last_name].filter(Boolean).join(' '),
        street:     [addr.street, addr.street_nr].filter(Boolean).join(' '),
        city:       addr.city,
        postalCode: addr.zip,
        country:    addr.country || 'DE',
        ...(addr.company ? { company: addr.company } : {}),
      },
      sender: SENDER,
    },
    orderPositions,
  }

  const response = await fetch(AKD_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-App-Id':  APP_ID,
      'X-Api-Key': API_KEY,
    },
    body: JSON.stringify(payload),
  })

  const result = await response.json().catch(() => ({ message: 'Invalid response from AKD' }))

  if (!response.ok) {
    console.error('[AKD] Submission failed:', response.status, result)
    return NextResponse.json(
      { error: result.message || `AKD API Fehler: ${response.status}`, detail: result },
      { status: 502 }
    )
  }

  await supabase
    .from('orders')
    .update({
      print_provider_sent_at:  new Date().toISOString(),
      print_provider_response: result,
      status: 'processing',
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  return NextResponse.json({ success: true, data: result })
}
