/**
 * One-time migration: fix stale zone data in design_templates.
 *
 * Problems fixed:
 *   - imageZone {left:0,top:0} → image off-screen (should be {left:50,top:50})
 *   - safeZone/printZone stored as natural pixels, not % of canvas
 *
 * Correct format (matching designer.bundle.js renderTemplateView):
 *   left/top   = CENTER position as % of canvas (0–100)
 *   width/height = SIZE as % of canvas (0–100)
 *   originX/Y:'center' in Fabric.js → rect.left = zone.left * canvas.width / 100
 *
 * Run: npx tsx scripts/fix-template-zones.ts
 */

import { readFileSync } from 'fs'
import { resolve } from 'path'
import { createClient } from '@supabase/supabase-js'

// Load .env.local (Next.js convention, not auto-loaded by Node)
try {
  const envPath = resolve(process.cwd(), '.env.local')
  const lines = readFileSync(envPath, 'utf8').split('\n')
  for (const line of lines) {
    const m = line.match(/^([^#=]+)=(.*)$/)
    if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '')
  }
} catch { /* file may not exist */ }

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

const CANVAS_W = 616
const CANVAS_H = 626

function r(v: number) { return Math.round(v * 10) / 10 }

interface CalibrationData {
  chestLine: { y: number; x1: number; x2: number }
  collarLine: { y: number }
  referenceSize: string
}

interface Measurements {
  per_size: Record<string, { chest_cm: number; length_cm: number; rib_height_cm: number }>
  print_y_offset_mm: number
}

function calcZones(
  cal: CalibrationData,
  measurements: Measurements,
  printWidthCm: number,
  printHeightCm: number,
  naturalW: number,
  naturalH: number,
) {
  const refM = measurements.per_size[cal.referenceSize]
  if (!refM) throw new Error(`Size ${cal.referenceSize} not found in measurements`)

  const shirtWidthPx = (cal.chestLine.x2 - cal.chestLine.x1) / 100 * naturalW
  if (shirtWidthPx <= 0) throw new Error('Invalid chest line calibration')

  const ratio = shirtWidthPx / refM.chest_cm
  const shirtLeftPx  = (cal.chestLine.x1 / 100) * naturalW
  const collarTopPx  = (cal.collarLine.y  / 100) * naturalH

  const printWidthPx  = printWidthCm  * ratio
  const printHeightPx = printHeightCm * ratio
  const shirtHeightPx = refM.length_cm * ratio

  const printLeftPx = shirtLeftPx + (refM.chest_cm - printWidthCm) / 2 * ratio
  const printTopPx  = collarTopPx + (refM.rib_height_cm + measurements.print_y_offset_mm / 10) * ratio

  return {
    safeZone: {
      left:   r((shirtLeftPx  + shirtWidthPx  / 2) / naturalW * 100),
      top:    r((collarTopPx  + shirtHeightPx / 2) / naturalH * 100),
      width:  r(shirtWidthPx  / naturalW * 100),
      height: r(shirtHeightPx / naturalH * 100),
    },
    printZone: {
      left:   r((printLeftPx  + printWidthPx  / 2) / naturalW * 100),
      top:    r((printTopPx   + printHeightPx / 2) / naturalH * 100),
      width:  r(printWidthPx  / naturalW * 100),
      height: r(printHeightPx / naturalH * 100),
    },
  }
}

async function main() {
  const { data: templates, error } = await supabase
    .from('design_templates')
    .select('id, name, physical_width_cm, physical_height_cm, variations')

  if (error) throw error

  console.log(`Found ${templates.length} template(s)\n`)

  for (const tmpl of templates) {
    console.log(`--- Template: ${tmpl.name} (${tmpl.id})`)
    const variations = tmpl.variations as Record<string, any>
    const measurements: Measurements | null = variations._measurements ?? null
    let changed = false

    for (const [varKey, variation] of Object.entries(variations)) {
      if (varKey.startsWith('_')) continue
      const views = (variation as any).views as Record<string, any>
      if (!views) continue

      for (const [viewKey, view] of Object.entries(views)) {
        console.log(`  Variation ${varKey} / View ${viewKey}:`)

        // Fix imageZone — must have left:50,top:50 for centered placement
        const iz = view.imageZone
        if (!iz || iz.left === 0 || iz.top === 0) {
          // We need the image's natural size to compute contain-fit scale.
          // Default to scale 1 — admin should re-upload or recalibrate if wrong.
          // For known template 8abb3aa4: naturalW=896, naturalH=1200
          const naturalW = 896
          const naturalH = 1200
          const scale = Math.min(CANVAS_W / naturalW, CANVAS_H / naturalH)
          view.imageZone = { left: 50, top: 50, scaleX: Math.round(scale * 1000) / 1000, scaleY: Math.round(scale * 1000) / 1000, angle: 0 }
          console.log(`    imageZone → ${JSON.stringify(view.imageZone)}`)
          changed = true
        } else {
          console.log(`    imageZone OK: ${JSON.stringify(iz)}`)
        }

        // Fix safeZone/printZone if they look like pixel values (width > 200 suggests pixels not %)
        const sz = view.safeZone
        const pz = view.printZone
        const looksLikePixels = (sz && sz.width > 200) || (pz && pz.width > 200)
        if (looksLikePixels && measurements && view.calibration) {
          const cal = view.calibration as CalibrationData
          // Natural size for existing template — hardcoded since we can't fetch at migration time
          const naturalW = 896
          const naturalH = 1200
          try {
            const zones = calcZones(cal, measurements, tmpl.physical_width_cm, tmpl.physical_height_cm, naturalW, naturalH)
            view.safeZone  = zones.safeZone
            view.printZone = zones.printZone
            console.log(`    safeZone  → ${JSON.stringify(zones.safeZone)}`)
            console.log(`    printZone → ${JSON.stringify(zones.printZone)}`)
            changed = true
          } catch (e: any) {
            console.warn(`    Could not recalculate zones: ${e.message}`)
          }
        } else if (!looksLikePixels) {
          console.log(`    zones already in % format, skipping`)
        } else {
          console.warn(`    Missing measurements or calibration — cannot recalculate zones`)
        }
      }
    }

    if (changed) {
      const { error: updateError } = await supabase
        .from('design_templates')
        .update({ variations })
        .eq('id', tmpl.id)

      if (updateError) {
        console.error(`  ✗ Failed to update: ${updateError.message}`)
      } else {
        console.log(`  ✓ Updated template ${tmpl.id}`)
      }
    } else {
      console.log(`  — No changes needed`)
    }
    console.log()
  }

  console.log('Migration complete.')
}

main().catch(e => { console.error(e); process.exit(1) })
