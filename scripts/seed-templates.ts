/**
 * Seed script: Insert/update the demo "Shirt" template in Supabase.
 * Run with:  NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npx tsx scripts/seed-templates.ts
 *
 * Image: /public/templates/shirt-white-front.png (600×1067 px, RGBA)
 * Zones are calibrated for that image size.
 *
 * Zone format:
 *   left/top   = PERCENT (0-100) of canvas dimensions
 *   width/height = PIXELS on canvas
 *   offsetX/Y, width_mm/height_mm = millimeters for AKD print API
 *
 * Physical print area: 30cm wide × 40cm tall
 * Print zone (front chest): starts at x=180px (30%), y=310px (29%), size 240×260px on a 600px canvas
 * mm conversion: printZone.width / 600 * 300mm ≈ 120mm wide, 130mm tall
 * Offset from top-left of shirt: ~55mm from left edge, ~75mm from top
 */

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

const SHIRT_WHITE_FRONT = '/templates/shirt-white-front.png'

const FRONT_VIEW_WHITE = {
  name: 'Front',
  image_url: SHIRT_WHITE_FRONT,
  colorOverlayEnabled: false,
  overlayOpacity: 0,
  safeZone:  { left: 20, top: 26, width: 360, height: 560 },
  imageZone: { left: 0,  top: 0,  scaleX: 1, scaleY: 1, angle: 0 },
  printZone: {
    left: 30, top: 29, width: 240, height: 260,
    // AKD print API coordinates (mm), relative to garment top-left
    offsetX_mm: 55.0,
    offsetY_mm: 75.0,
    width_mm: 120.0,
    height_mm: 130.0,
  },
  // Allesklardruck position identifier
  akd_position: 'front',
}

const FRONT_VIEW_BLACK = {
  ...FRONT_VIEW_WHITE,
  colorOverlayEnabled: true,
  overlayOpacity: 0.85,
}

const template = {
  name: 'Oversized T-Shirt',
  slug: 'oversized-t-shirt',
  category: 'shirts',
  status: 'published',
  physical_width_cm: 30,
  physical_height_cm: 40,
  base_price: 17.0,
  in_stock: true,
  sizes: [
    { id: 'XS',  name: 'XS',  order: 1 },
    { id: 'S',   name: 'S',   order: 2 },
    { id: 'M',   name: 'M',   order: 3 },
    { id: 'L',   name: 'L',   order: 4 },
    { id: 'XL',  name: 'XL',  order: 5 },
    { id: 'XXL', name: 'XXL', order: 6 },
  ],
  pricing: {
    XS:  { base: 17.0 },
    S:   { base: 17.0 },
    M:   { base: 17.0 },
    L:   { base: 18.0 },
    XL:  { base: 19.0 },
    XXL: { base: 20.0 },
  },
  variations: {
    // AKD product config — filtered out before sending to designer.bundle.js
    _akd: {
      product_type: 'TSHIRT',
      manufacturer: 'yprint',
      series: 'SS25',
      print_method: 'DTG',
    },
    _measurements: {
      per_size: {
        XS:  { chest_cm: 59, length_cm: 67, rib_height_cm: 2 },
        S:   { chest_cm: 60, length_cm: 68, rib_height_cm: 2 },
        M:   { chest_cm: 61, length_cm: 69, rib_height_cm: 2 },
        L:   { chest_cm: 62, length_cm: 70, rib_height_cm: 2 },
        XL:  { chest_cm: 64, length_cm: 71, rib_height_cm: 2 },
        XXL: { chest_cm: 66, length_cm: 72, rib_height_cm: 2 },
      },
      print_y_offset_mm: 60,
    },
    var_white: {
      id: 'var_white',
      name: 'White',
      color: '#ffffff',
      akd_color: 'White',
      is_default: true,
      is_dark_shirt: false,
      views: { view_front: FRONT_VIEW_WHITE },
    },
    var_black: {
      id: 'var_black',
      name: 'Black',
      color: '#1a1a1a',
      akd_color: 'Black',
      is_default: false,
      is_dark_shirt: true,
      views: { view_front: FRONT_VIEW_BLACK },
    },
  },
}

async function seed() {
  console.log('Upserting template:', template.name)
  const { data, error } = await supabase
    .from('design_templates')
    .upsert(template, { onConflict: 'slug' })
    .select('id, name')

  if (error) { console.error('Error:', error.message); process.exit(1) }
  console.log('Done:', data)
}

seed()
