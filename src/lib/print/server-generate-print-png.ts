import sharp from 'sharp'
import { createAdminClient } from '@/lib/supabase/admin'

const SCALE = 300 / 72
const CANVAS_W = 616
const CANVAS_H = 626

async function ensurePrintBucket(supabase: ReturnType<typeof createAdminClient>) {
  await supabase.storage.createBucket('print-pngs', { public: true })
  await supabase.storage.updateBucket('print-pngs', { public: true })
}

async function compositeImages(
  images: Array<{
    url: string
    transform: { left: number; top: number; scaleX: number; scaleY: number; angle?: number; width: number; height: number }
    visible?: boolean
  }>,
  printZone: { left: number; top: number; width: number; height: number },
  supabase: ReturnType<typeof createAdminClient>
): Promise<Buffer | null> {
  const outW = Math.round(printZone.width * SCALE)
  const outH = Math.round(printZone.height * SCALE)
  const composites: sharp.OverlayOptions[] = []

  for (const img of images) {
    if (img.visible === false) continue
    const pathMatch = (img.url ?? '').match(/\/api\/user-images\/(.+)/)
    if (!pathMatch) continue

    const { data, error } = await supabase.storage.from('user-images').download(pathMatch[1])
    if (error || !data) continue

    const buf = Buffer.from(await data.arrayBuffer())
    const t = img.transform
    const displayW = t.width * t.scaleX
    const displayH = t.height * t.scaleY
    // variationImages always uses originX/originY='center'
    const cx = t.left
    const cy = t.top

    const outImgW = Math.round(displayW * SCALE)
    const outImgH = Math.round(displayH * SCALE)
    const left = Math.round((cx - printZone.left) * SCALE - outImgW / 2)
    const top = Math.round((cy - printZone.top) * SCALE - outImgH / 2)

    let s = sharp(buf).resize(outImgW, outImgH, { fit: 'fill' })
    if (t.angle && t.angle !== 0) {
      s = s.rotate(t.angle, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
    }
    composites.push({ input: await s.png().toBuffer(), left, top })
  }

  if (composites.length === 0) return null

  return sharp({
    create: { width: outW, height: outH, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite(composites)
    .png()
    .toBuffer()
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

// ─── Fallback: generate from old Fabric.js canvas JSON (design_data.objects) ──────

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

  type OldImageObj = Record<string, unknown>
  const imageObjs = (objects as OldImageObj[]).filter(
    (o) => o.type === 'image' && o.selectable !== false && o.stroke !== '#007cba' && !o.excludeFromExport
  )

  const legacyImages = imageObjs.map((obj) => ({
    url: (obj.src as string) ?? '',
    visible: true,
    transform: {
      left: (obj.originX as string) === 'center'
        ? (obj.left as number)
        : (obj.left as number) + ((obj.width as number) * ((obj.scaleX as number) || 1)) / 2,
      top: (obj.originY as string) === 'center'
        ? (obj.top as number)
        : (obj.top as number) + ((obj.height as number) * ((obj.scaleY as number) || 1)) / 2,
      scaleX: (obj.scaleX as number) || 1,
      scaleY: (obj.scaleY as number) || 1,
      angle: (obj.angle as number) || 0,
      width: obj.width as number,
      height: obj.height as number,
    },
  }))

  const outputBuffer = await compositeImages(legacyImages, printZone, supabase)
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
    print_area_px: printZone,
    print_area_mm: { width: (printZone.width / 72) * 25.4, height: (printZone.height / 72) * 25.4 },
    save_type: 'auto',
    generated_at: new Date().toISOString(),
  })

  await supabase.from('user_designs').update({ print_file_url: publicUrl }).eq('id', designId)
  return publicUrl
}

// ─── New: generate from variationImages format (current designer save format) ────

type VariationImage = {
  url: string
  transform: { left: number; top: number; scaleX: number; scaleY: number; angle?: number; width: number; height: number }
  visible?: boolean
}

function getPrintZonePx(
  pz: { left: number; top: number; width: number; height: number }
): { left: number; top: number; width: number; height: number } {
  // Template DB stores all as % of canvas. Designer uses center-based positioning:
  // left_px = (centerPct/100)*canvasW - (widthPct/100*canvasW)/2
  const w = (pz.width / 100) * CANVAS_W
  const h = (pz.height / 100) * CANVAS_H
  return {
    left: (pz.left / 100) * CANVAS_W - w / 2,
    top: (pz.top / 100) * CANVAS_H - h / 2,
    width: w,
    height: h,
  }
}

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
    supabase.from('design_templates').select('variations').eq('id', templateId).single(),
  ])

  const designData = designRes.data?.design_data as Record<string, unknown> | null
  if (!designData) return null

  const key = `${variationId}_${viewId}`
  const images = ((designData.variationImages as Record<string, VariationImage[]>)?.[key]) ?? []
  if (images.length === 0) return null

  const variations = tmplRes.data?.variations as Record<string, {
    views: Record<string, { printZone: { left: number; top: number; width: number; height: number } }>
  }> | null
  const rawPz = variations?.[variationId]?.views?.[viewId]?.printZone
  if (!rawPz) return null

  const printZone = getPrintZonePx(rawPz)
  const outputBuffer = await compositeImages(images, printZone, supabase)
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
    print_area_px: printZone,
    print_area_mm: { width: (printZone.width / 72) * 25.4, height: (printZone.height / 72) * 25.4 },
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
