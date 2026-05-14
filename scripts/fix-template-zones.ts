/**
 * Migration: fix zone coordinates + merge duplicate black variation.
 *
 * Problems fixed:
 *   1. imageZone was contain-fit → black gaps. Now fill-width top-anchored.
 *   2. safeZone/printZone y-coordinates were % of image, not % of canvas.
 *   3. var_1778776407440 is a duplicate black variation — its view_front becomes
 *      var_black/view_back so the designer shows Front/Back tabs on one swatch.
 *
 * Correct zone format (matching designer.bundle.js renderTemplateView):
 *   imageZone.scaleX/Y = CANVAS_W / naturalW  (fill-width)
 *   imageZone.top = (naturalH * scale / 2) / CANVAS_H * 100  (top-anchored)
 *   zone.left/top = CENTER as % of canvas (0–100)
 *   zone.width/height = SIZE as % of canvas (0–100)
 *   y_canvas_pct = naturalY * CANVAS_W / (naturalW * CANVAS_H) * 100
 *
 * Run: npx tsx scripts/fix-template-zones.ts
 */

import { readFileSync } from 'fs'
import { resolve } from 'path'
import { createClient } from '@supabase/supabase-js'

// Load .env.local
try {
  const lines = readFileSync(resolve(process.cwd(), '.env.local'), 'utf8').split('\n')
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

const r  = (v: number) => Math.round(v * 10)  / 10
const r3 = (v: number) => Math.round(v * 1000) / 1000

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
  if (!refM) throw new Error(`Size ${cal.referenceSize} not in measurements`)

  const shirtWidthPx  = (cal.chestLine.x2 - cal.chestLine.x1) / 100 * naturalW
  if (shirtWidthPx <= 0) throw new Error('Invalid chest calibration')

  const ratio        = shirtWidthPx / refM.chest_cm
  const shirtLeftPx  = (cal.chestLine.x1 / 100) * naturalW
  const collarTopPx  = (cal.collarLine.y  / 100) * naturalH
  const printWidthPx  = printWidthCm  * ratio
  const printHeightPx = printHeightCm * ratio
  const shirtHeightPx = refM.length_cm * ratio
  const printLeftPx  = shirtLeftPx + (refM.chest_cm - printWidthCm) / 2 * ratio
  const printTopPx   = collarTopPx + (refM.rib_height_cm + measurements.print_y_offset_mm / 10) * ratio

  const scale = CANVAS_W / naturalW
  const xPct  = (px: number) => r(px / naturalW * 100)
  const yPct  = (px: number) => r(px * scale / CANVAS_H * 100)

  return {
    imageZone: {
      left: 50,
      top: r((naturalH * scale / 2) / CANVAS_H * 100),
      scaleX: r3(scale),
      scaleY: r3(scale),
      angle: 0,
    },
    safeZone: {
      left:   xPct(shirtLeftPx + shirtWidthPx  / 2),
      top:    yPct(collarTopPx  + shirtHeightPx / 2),
      width:  xPct(shirtWidthPx),
      height: yPct(shirtHeightPx),
    },
    printZone: {
      left:   xPct(printLeftPx + printWidthPx  / 2),
      top:    yPct(printTopPx  + printHeightPx / 2),
      width:  xPct(printWidthPx),
      height: yPct(printHeightPx),
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

    // ── Step 1: Merge var_1778776407440 into var_black ──────────────────────
    const DUPE_KEY = 'var_1778776407440'
    const TARGET_KEY = 'var_black'
    if (variations[DUPE_KEY] && variations[TARGET_KEY]) {
      const dupeViews = (variations[DUPE_KEY].views ?? {}) as Record<string, any>
      const firstDupeView = Object.values(dupeViews)[0] as any

      if (firstDupeView) {
        // Rename view to 'Back' and add to var_black
        const backView = { ...firstDupeView, name: 'Back', akd_position: firstDupeView.akd_position ?? 'back' }
        variations[TARGET_KEY].views = variations[TARGET_KEY].views ?? {}
        variations[TARGET_KEY].views['view_back'] = backView
        console.log(`  ✓ Merged ${DUPE_KEY}/view into ${TARGET_KEY}/view_back`)
      }
      delete variations[DUPE_KEY]
      console.log(`  ✓ Deleted ${DUPE_KEY}`)
      changed = true
    }

    // ── Step 2: Fix imageZone + zones for every view ─────────────────────────
    for (const [varKey, variation] of Object.entries(variations)) {
      if (varKey.startsWith('_')) continue
      const views = (variation as any).views as Record<string, any>
      if (!views) continue

      for (const [viewKey, view] of Object.entries(views)) {
        console.log(`  Variation ${varKey} / View ${viewKey}:`)

        // Natural size for OG Shirt images (896×1200). If image dimensions differ,
        // the admin can re-upload in the admin UI to trigger auto-recalculation.
        const naturalW = 896
        const naturalH = 1200

        // Fix imageZone (fill-width top-anchored)
        const scale = CANVAS_W / naturalW
        view.imageZone = {
          left: 50,
          top: r((naturalH * scale / 2) / CANVAS_H * 100),
          scaleX: r3(scale),
          scaleY: r3(scale),
          angle: 0,
        }
        console.log(`    imageZone → ${JSON.stringify(view.imageZone)}`)

        // Recalculate zones from calibration + measurements
        if (measurements && view.calibration) {
          try {
            const zones = calcZones(
              view.calibration as CalibrationData,
              measurements,
              tmpl.physical_width_cm,
              tmpl.physical_height_cm,
              naturalW,
              naturalH,
            )
            view.safeZone  = zones.safeZone
            view.printZone = zones.printZone
            console.log(`    safeZone  → ${JSON.stringify(zones.safeZone)}`)
            console.log(`    printZone → ${JSON.stringify(zones.printZone)}`)
          } catch (e: any) {
            console.warn(`    Could not recalculate zones: ${e.message}`)
          }
        } else {
          console.warn(`    Missing measurements or calibration — skipping zone recalculation`)
        }
        changed = true
      }
    }

    if (changed) {
      const { error: updateError } = await supabase
        .from('design_templates')
        .update({ variations })
        .eq('id', tmpl.id)

      if (updateError) {
        console.error(`  ✗ Update failed: ${updateError.message}`)
      } else {
        console.log(`  ✓ Template ${tmpl.id} updated`)
      }
    } else {
      console.log(`  — No changes`)
    }
    console.log()
  }

  console.log('Migration complete.')
}

main().catch(e => { console.error(e); process.exit(1) })
