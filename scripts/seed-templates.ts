/**
 * Seed script: Insert/update the demo "Shirt" template in Supabase.
 * Run with:  NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npx tsx scripts/seed-templates.ts
 *
 * Image: /public/templates/shirt-white-front.png (600×1067 px, RGBA)
 * Zones are calibrated for that image size.
 */

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

// Local image served from /public/templates/ — no CORS/hotlink issues
// Use relative URL — works on any deployment, avoids cross-origin CORS for fabric.Image.fromURL
const SHIRT_WHITE_FRONT = '/templates/shirt-white-front.png'

// Image is 600×1067 px. Zone format: left/top = PERCENT (0-100), width/height = PIXELS
// - Shirt collar at ~y=280 (26% of 1067), hem at ~y=920, side seams at x≈90 and x≈510
// - Safe zone starts at x=120 (20% of 600), y=280 (26% of 1067)
// - Print zone (front chest): x=180 (30%), y=310 (29%), w=240px, h=260px
const FRONT_VIEW_WHITE = {
  name: 'Front',
  image_url: SHIRT_WHITE_FRONT,
  colorOverlayEnabled: false,
  overlayOpacity: 0,
  safeZone:  { left: 20,  top: 26, width: 360, height: 560 },
  imageZone: { left: 0,   top: 0,  scaleX: 1, scaleY: 1, angle: 0 },
  printZone: { left: 30,  top: 29, width: 240, height: 260 },
}

// Black variation — same image with a dark overlay
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
    var_white: {
      id: 'var_white',
      name: 'White',
      color: '#ffffff',
      is_default: true,
      is_dark_shirt: false,
      views: { view_front: FRONT_VIEW_WHITE },
    },
    var_black: {
      id: 'var_black',
      name: 'Black',
      color: '#1a1a1a',
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
