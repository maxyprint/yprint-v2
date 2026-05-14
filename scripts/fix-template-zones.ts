/**
 * Migration: correct zone coordinates + fix colorOverlay black background.
 *
 * Root causes fixed:
 *   1. colorOverlayEnabled=true + multiply blend on white-background image → entire image black.
 *      Fix: set colorOverlayEnabled=false (use real dark mockup images per color variant).
 *   2. Zone coordinates used fill-width scale → safeZone too wide, printZone misaligned.
 *      Fix: use contain-fit scale with proper offsetX/Y for centering.
 *   3. var_1778776407440 was duplicate black variation → merged into var_black/view_back.
 *
 * Correct coordinate mapping (contain-fit centered image):
 *   scale = min(CANVAS_W/naturalW, CANVAS_H/naturalH)
 *   offsetX = (CANVAS_W - naturalW * scale) / 2
 *   offsetY = (CANVAS_H - naturalH * scale) / 2
 *   position_x_pct = (offsetX + naturalX * scale) / CANVAS_W * 100  ← center %
 *   size_x_pct     = naturalW_px * scale / CANVAS_W * 100            ← size %
 *
 * Run: npx tsx scripts/fix-template-zones.ts
 */

import { readFileSync } from 'fs'
import { resolve } from 'path'
import { createClient } from '@supabase/supabase-js'

try {
  const lines = readFileSync(resolve(process.cwd(), '.env.local'), 'utf8').split('\n')
  for (const line of lines) {
    const m = line.match(/^([^#=]+)=(.*)$/)
    if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '')
  }
} catch { /* ok */ }

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

  const scale   = Math.min(CANVAS_W / naturalW, CANVAS_H / naturalH)
  const offsetX = (CANVAS_W - naturalW * scale) / 2
  const offsetY = (CANVAS_H - naturalH * scale) / 2

  const xPos = (px: number) => r((offsetX + px * scale) / CANVAS_W * 100)
  const yPos = (py: number) => r((offsetY + py * scale) / CANVAS_H * 100)
  const xSz  = (px: number) => r(px * scale / CANVAS_W * 100)
  const ySz  = (py: number) => r(py * scale / CANVAS_H * 100)

  return {
    imageZone: { left: 50, top: 50, scaleX: r3(scale), scaleY: r3(scale), angle: 0 },
    safeZone: {
      left:   xPos(shirtLeftPx + shirtWidthPx  / 2),
      top:    yPos(collarTopPx  + shirtHeightPx / 2),
      width:  xSz(shirtWidthPx),
      height: ySz(shirtHeightPx),
    },
    printZone: {
      left:   xPos(printLeftPx + printWidthPx  / 2),
      top:    yPos(printTopPx  + printHeightPx / 2),
      width:  xSz(printWidthPx),
      height: ySz(printHeightPx),
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

    // ── Step 1: Merge var_1778776407440 into var_black (if still present) ──
    const DUPE_KEY = 'var_1778776407440'
    const TARGET_KEY = 'var_black'
    if (variations[DUPE_KEY] && variations[TARGET_KEY]) {
      const dupeViews = (variations[DUPE_KEY].views ?? {}) as Record<string, any>
      const firstDupeView = Object.values(dupeViews)[0] as any
      if (firstDupeView) {
        const backView = { ...firstDupeView, name: 'Back', akd_position: firstDupeView.akd_position ?? 'back' }
        variations[TARGET_KEY].views = variations[TARGET_KEY].views ?? {}
        variations[TARGET_KEY].views['view_back'] = backView
        console.log(`  ✓ Merged ${DUPE_KEY}/view → ${TARGET_KEY}/view_back`)
      }
      delete variations[DUPE_KEY]
      console.log(`  ✓ Deleted ${DUPE_KEY}`)
      changed = true
    }

    // ── Step 2: Fix every view ────────────────────────────────────────────────
    for (const [varKey, variation] of Object.entries(variations)) {
      if (varKey.startsWith('_')) continue
      const views = (variation as any).views as Record<string, any>
      if (!views) continue

      for (const [viewKey, view] of Object.entries(views)) {
        console.log(`  ${varKey} / ${viewKey}:`)

        // Fix colorOverlay: multiply blend on white-background images makes everything black.
        // Correct approach: use an actual dark mockup image + no overlay.
        if ((view as any).colorOverlayEnabled) {
          ;(view as any).colorOverlayEnabled = false
          console.log(`    colorOverlayEnabled → false (multiply blend causes black bg on non-transparent images)`)
          changed = true
        }

        // Natural size — hardcoded for OG Shirt (896×1200).
        // For different images, admin re-uploads to trigger auto-recalculation.
        const naturalW = 896
        const naturalH = 1200
        const scale = Math.min(CANVAS_W / naturalW, CANVAS_H / naturalH)

        // Fix imageZone → contain-fit centered
        view.imageZone = { left: 50, top: 50, scaleX: r3(scale), scaleY: r3(scale), angle: 0 }
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
            console.warn(`    Cannot recalculate zones: ${e.message}`)
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
        console.log(`  ✓ Updated`)
      }
    } else {
      console.log(`  — No changes`)
    }
    console.log()
  }

  console.log('Done.')
}

main().catch(e => { console.error(e); process.exit(1) })
