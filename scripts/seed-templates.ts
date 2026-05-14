/**
 * Seed script: Insert a demo "Shirt" template into Supabase.
 *
 * Run with:  npx tsx scripts/seed-templates.ts
 *
 * Zone values are calibrated for the 768×769 shirt mockup image from yprint.de.
 * Adjust printZone / safeZone after measuring the actual mockup.
 */

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

// ── Template mockup image ────────────────────────────────────────────────────
// We use the yprint.de shirt image (768×769 px, nearly square).
// Replace with Supabase Storage URL once images are uploaded.
const SHIRT_FRONT_URL =
  'https://yprint.de/wp-content/uploads/2025/02/kaan-freigestellt-front-Kopie-basics-2-768x769.webp'

// ── Zone data (pixels, image is 768×769) ────────────────────────────────────
// These are approximate – fine-tune in the admin panel once the designer loads.
const FRONT_VIEW = {
  name: 'Front',
  image_url: SHIRT_FRONT_URL,
  colorOverlayEnabled: false,
  overlayOpacity: 0,
  // Area where elements are visible and safe to place
  safeZone: { left: 175, top: 215, width: 420, height: 400 },
  // Fabric.js image zone: position + scale for canvas background image
  imageZone: { left: 0, top: 0, scaleX: 1, scaleY: 1, angle: 0 },
  // Exact printable area for high-res PNG export
  printZone: { left: 210, top: 230, width: 348, height: 360 },
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
    { id: 'XS', name: 'XS', order: 1 },
    { id: 'S',  name: 'S',  order: 2 },
    { id: 'M',  name: 'M',  order: 3 },
    { id: 'L',  name: 'L',  order: 4 },
    { id: 'XL', name: 'XL', order: 5 },
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
      views: {
        view_front: FRONT_VIEW,
      },
    },
    var_black: {
      id: 'var_black',
      name: 'Black',
      color: '#1a1a1a',
      is_default: false,
      is_dark_shirt: true,
      views: {
        view_front: {
          ...FRONT_VIEW,
          colorOverlayEnabled: true,
          overlayOpacity: 0.35,
        },
      },
    },
  },
}

async function seed() {
  console.log('Inserting template:', template.name)

  const { data, error } = await supabase
    .from('design_templates')
    .upsert(template, { onConflict: 'slug' })
    .select('id, name')

  if (error) {
    console.error('Error:', error.message)
    process.exit(1)
  }

  console.log('Done:', data)
}

seed()
