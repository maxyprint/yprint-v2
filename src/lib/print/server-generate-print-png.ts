import sharp from 'sharp'
import { createAdminClient } from '@/lib/supabase/admin'

const CANVAS_W = 616
const CANVAS_H = 626
const PRINT_DPI = 300
const CM_PER_INCH = 2.54

type VariationImage = {
  url: string
  transform: {
    left: number
    top: number
    scaleX: number
    scaleY: number
    angle?: number
    width: number
    height: number
  }
  visible?: boolean
}

async function ensurePrintBucket(supabase: ReturnType<typeof createAdminClient>) {
  await supabase.storage.createBucket('print-pngs', { public: true })
  await supabase.storage.updateBucket('print-pngs', { public: true })
}

async function upsertDesignPng(
  supabase: ReturnType<typeof createAdminClient>,
  row: Record<string, unknown>
) {
  await supabase.from('design_pngs')
    .delete()
    .eq('design_id', row.design_id as string)
    .eq('view_id', row.view_id as string)
  await supabase.from('design_pngs').insert(row)
}

// Build print zone top-left position in canvas px from template DB format.
// Template stores: left/top = center position as % of canvas, width/height = % of canvas.
function getPrintZonePx(pz: { left: number; top: number; width: number; height: number }) {
  const w = (pz.width / 100) * CANVAS_W
  const h = (pz.height / 100) * CANVAS_H
  return {
    left: (pz.left / 100) * CANVAS_W - w / 2,
    top: (pz.top / 100) * CANVAS_H - h / 2,
    width: w,
    height: h,
  }
}

// Composite user images onto a transparent canvas.
// outW / outH drive the output resolution (should come from physical dimensions at 300 DPI).
// Images are scaled by (outW / printZone.width) and (outH / printZone.height) independently
// so the physical proportions of the shirt are preserved regardless of canvas aspect ratio.
// Images that extend beyond the canvas are clipped correctly (sharp requires left/top >= 0).
async function compositeImages(
  images: VariationImage[],
  printZone: { left: number; top: number; width: number; height: number },
  outW: number,
  outH: number,
  supabase: ReturnType<typeof createAdminClient>
): Promise<Buffer | null> {
  const scaleX = outW / printZone.width
  const scaleY = outH / printZone.height
  const composites: sharp.OverlayOptions[] = []

  for (const img of images) {
    if (img.visible === false) continue

    const pathMatch = (img.url ?? '').match(/\/api\/user-images\/(.+)/)
    if (!pathMatch) continue

    const { data, error } = await supabase.storage.from('user-images').download(pathMatch[1])
    if (error || !data) continue

    const buf = Buffer.from(await data.arrayBuffer())
    const t = img.transform

    // Fabric.js width/height = natural image size; scaleX/Y = display scale.
    // variationImages always stores originX/Y='center', so t.left/top is the center point.
    const displayW = t.width * (t.scaleX || 1)
    const displayH = t.height * (t.scaleY || 1)
    const cx = t.left
    const cy = t.top

    const outImgW = Math.max(1, Math.round(displayW * scaleX))
    const outImgH = Math.max(1, Math.round(displayH * scaleY))

    let imgLeft = Math.round((cx - printZone.left) * scaleX - outImgW / 2)
    let imgTop = Math.round((cy - printZone.top) * scaleY - outImgH / 2)

    // Clip to canvas bounds — sharp requires left >= 0 and top >= 0, and the overlay
    // must not extend beyond the base canvas. Negative values cause broken output.
    const clipL = Math.max(0, -imgLeft)
    const clipT = Math.max(0, -imgTop)
    const clipR = Math.max(0, imgLeft + outImgW - outW)
    const clipB = Math.max(0, imgTop + outImgH - outH)
    const clippedW = outImgW - clipL - clipR
    const clippedH = outImgH - clipT - clipB

    if (clippedW <= 0 || clippedH <= 0) continue

    imgLeft = Math.max(0, imgLeft)
    imgTop = Math.max(0, imgTop)

    let s = sharp(buf).resize(outImgW, outImgH, { fit: 'fill' })
    if (t.angle && t.angle !== 0) {
      s = s.rotate(t.angle, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
    }
    if (clipL > 0 || clipT > 0 || clipR > 0 || clipB > 0) {
      s = s.extract({ left: clipL, top: clipT, width: clippedW, height: clippedH })
    }

    composites.push({ input: await s.png().toBuffer(), left: imgLeft, top: imgTop })
  }

  if (composites.length === 0) return null

  return sharp({
    create: { width: outW, height: outH, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite(composites)
    .png()
    .toBuffer()
}

// ─── New format: variationImages (current designer save format) ───────────────

export async function generateViewPNGFromDesignData(
  designId: string,
  userId: string,
  templateId: string,
  variationId: string,
  viewId: string,
  viewName: string
): Promise<string | null> {
  const supabase = createAdminClient()

  const [designRes, tmplRes] = await Promise.all([
    supabase.from('user_designs').select('design_data').eq('id', designId).single(),
    supabase.from('design_templates')
      .select('variations, physical_width_cm, physical_height_cm')
      .eq('id', templateId)
      .single(),
  ])

  const designData = designRes.data?.design_data as Record<string, unknown> | null
  if (!designData) return null

  const key = `${variationId}_${viewId}`
  const images = ((designData.variationImages as Record<string, VariationImage[]>)?.[key]) ?? []
  if (images.length === 0) return null

  const tmpl = tmplRes.data
  const variations = tmpl?.variations as Record<string, {
    views: Record<string, { printZone: { left: number; top: number; width: number; height: number } }>
  }> | null

  // Require a printZone entry to exist (confirms the view is configured), but don't use
  // the zone percentage for output dimensions — the canvas always represents the full
  // physical print area, so we export at physical_width_cm × physical_height_cm at 300 DPI.
  if (!variations?.[variationId]?.views?.[viewId]?.printZone) return null

  // Full physical dimensions → output pixel size at 300 DPI
  const physW = tmpl?.physical_width_cm ?? 45
  const physH = tmpl?.physical_height_cm ?? 55
  const outW = Math.round((physW / CM_PER_INCH) * PRINT_DPI)
  const outH = Math.round((physH / CM_PER_INCH) * PRINT_DPI)

  // Image positions in variationImages are in canvas coords (0..CANVAS_W × 0..CANVAS_H).
  // Map the full canvas to the full physical output so positions scale correctly.
  const fullCanvas = { left: 0, top: 0, width: CANVAS_W, height: CANVAS_H }
  const outputBuffer = await compositeImages(images, fullCanvas, outW, outH, supabase)
  if (!outputBuffer) return null

  await ensurePrintBucket(supabase)
  const storagePath = `${userId}/${designId}/${viewId}_print.png`
  const { error } = await supabase.storage
    .from('print-pngs')
    .upload(storagePath, outputBuffer, { contentType: 'image/png', upsert: true })
  if (error) return null

  const { data: { publicUrl } } = supabase.storage.from('print-pngs').getPublicUrl(storagePath)

  await upsertDesignPng(supabase, {
    design_id: designId,
    view_id: viewId,
    view_name: viewName,
    storage_path: storagePath,
    public_url: publicUrl,
    template_id: templateId,
    print_area_px: { width: outW, height: outH },
    print_area_mm: { width: physW * 10, height: physH * 10 },
    save_type: 'designer',
    generated_at: new Date().toISOString(),
  })

  return publicUrl
}

export async function recordEmptyViewPNG(
  designId: string,
  templateId: string | null,
  viewId: string,
  viewName: string
): Promise<void> {
  const supabase = createAdminClient()
  await supabase.from('design_pngs').delete().eq('design_id', designId).eq('view_id', viewId)
  await supabase.from('design_pngs').insert({
    design_id: designId,
    view_id: viewId,
    view_name: viewName,
    storage_path: null,
    public_url: null,
    template_id: templateId || null,
    save_type: 'empty',
    metadata: { has_content: false },
    generated_at: new Date().toISOString(),
  })
}

// ─── Legacy fallback: old Fabric.js canvas JSON format (design_data.objects) ──

export async function generatePrintPNG(
  designId: string,
  userId: string,
  templateId: string | null,
  designData: Record<string, unknown>
): Promise<string | null> {
  const supabase = createAdminClient()
  const objects = (designData.objects as unknown[]) ?? []

  const pzObj = (objects as Record<string, unknown>[]).find(
    (o) => o.stroke === '#007cba' && o.fill === 'transparent'
  )
  if (!pzObj) return null

  const printZone = {
    left: pzObj.left as number,
    top: pzObj.top as number,
    width: (pzObj.width as number) * ((pzObj.scaleX as number) || 1),
    height: (pzObj.height as number) * ((pzObj.scaleY as number) || 1),
  }

  const imageObjs = (objects as Record<string, unknown>[]).filter(
    (o) => o.type === 'image' && o.selectable !== false && o.stroke !== '#007cba' && !o.excludeFromExport
  )

  const legacyImages: VariationImage[] = imageObjs.map((obj) => {
    const originX = (obj.originX as string) ?? 'left'
    const originY = (obj.originY as string) ?? 'top'
    const displayW = (obj.width as number) * ((obj.scaleX as number) || 1)
    const displayH = (obj.height as number) * ((obj.scaleY as number) || 1)
    return {
      url: (obj.src as string) ?? '',
      visible: true,
      transform: {
        left: originX === 'center' ? (obj.left as number) : (obj.left as number) + displayW / 2,
        top: originY === 'center' ? (obj.top as number) : (obj.top as number) + displayH / 2,
        scaleX: (obj.scaleX as number) || 1,
        scaleY: (obj.scaleY as number) || 1,
        angle: (obj.angle as number) || 0,
        width: obj.width as number,
        height: obj.height as number,
      },
    }
  })

  // Legacy format has no physical dimensions — fall back to canvas-DPI scale.
  const outW = Math.round(printZone.width * (PRINT_DPI / 72))
  const outH = Math.round(printZone.height * (PRINT_DPI / 72))

  const outputBuffer = await compositeImages(legacyImages, printZone, outW, outH, supabase)
  if (!outputBuffer) return null

  await ensurePrintBucket(supabase)
  const storagePath = `${userId}/${designId}/front_print.png`
  const { error } = await supabase.storage
    .from('print-pngs')
    .upload(storagePath, outputBuffer, { contentType: 'image/png', upsert: true })
  if (error) return null

  const { data: { publicUrl } } = supabase.storage.from('print-pngs').getPublicUrl(storagePath)

  await upsertDesignPng(supabase, {
    design_id: designId,
    view_id: 'front',
    view_name: 'Front',
    storage_path: storagePath,
    public_url: publicUrl,
    template_id: templateId,
    print_area_px: { width: outW, height: outH },
    print_area_mm: {
      width: (printZone.width / 72) * 25.4,
      height: (printZone.height / 72) * 25.4,
    },
    save_type: 'auto',
    generated_at: new Date().toISOString(),
  })

  await supabase.from('user_designs').update({ print_file_url: publicUrl }).eq('id', designId)
  return publicUrl
}
