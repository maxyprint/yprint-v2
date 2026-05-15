import sharp from 'sharp'
import { createAdminClient } from '@/lib/supabase/admin'

const SCALE = 300 / 72 // 72 DPI canvas → 300 DPI print

export async function generatePrintPNG(
  designId: string,
  userId: string,
  templateId: string | null,
  designData: Record<string, unknown>
): Promise<string | null> {
  const supabase = createAdminClient()
  const objects = (designData.objects as unknown[]) ?? []

  // Print zone is the blue-stroked rect placed on the Fabric.js canvas by the admin
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

  const outW = Math.round(printZone.width * SCALE)
  const outH = Math.round(printZone.height * SCALE)

  const imageObjs = (objects as Record<string, unknown>[]).filter(
    (o) =>
      o.type === 'image' &&
      o.selectable !== false &&
      o.stroke !== '#007cba' &&
      !o.excludeFromExport
  )

  const composites: sharp.OverlayOptions[] = []

  for (const obj of imageObjs) {
    const src = (obj.src as string) ?? ''
    const pathMatch = src.match(/\/api\/user-images\/(.+)/)
    if (!pathMatch) continue

    const { data, error } = await supabase.storage.from('user-images').download(pathMatch[1])
    if (error || !data) continue

    const buf = Buffer.from(await data.arrayBuffer())
    const originX = (obj.originX as string) ?? 'left'
    const originY = (obj.originY as string) ?? 'top'
    const displayW = (obj.width as number) * ((obj.scaleX as number) || 1)
    const displayH = (obj.height as number) * ((obj.scaleY as number) || 1)

    // Fabric.js Image objects default to originX:'center', originY:'center' when user-placed
    const cx = originX === 'center' ? (obj.left as number) : (obj.left as number) + displayW / 2
    const cy = originY === 'center' ? (obj.top as number) : (obj.top as number) + displayH / 2

    const outImgW = Math.round(displayW * SCALE)
    const outImgH = Math.round(displayH * SCALE)
    const left = Math.round((cx - printZone.left) * SCALE - outImgW / 2)
    const top = Math.round((cy - printZone.top) * SCALE - outImgH / 2)

    let s = sharp(buf).resize(outImgW, outImgH, { fit: 'fill' })
    if (obj.angle && obj.angle !== 0) {
      s = s.rotate(obj.angle as number, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
    }

    composites.push({ input: await s.png().toBuffer(), left, top })
  }

  if (composites.length === 0) return null

  const outputBuffer = await sharp({
    create: { width: outW, height: outH, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite(composites)
    .png()
    .toBuffer()

  const storagePath = `${userId}/${designId}/front_print.png`
  await supabase.storage.createBucket('print-pngs', { public: true })
  const { error: uploadError } = await supabase.storage
    .from('print-pngs')
    .upload(storagePath, outputBuffer, { contentType: 'image/png', upsert: true })
  if (uploadError) return null

  const { data: { publicUrl } } = supabase.storage.from('print-pngs').getPublicUrl(storagePath)

  await supabase.from('design_pngs').delete().eq('design_id', designId).eq('view_id', 'front')
  await supabase.from('design_pngs').insert({
    design_id: designId,
    view_id: 'front',
    view_name: 'Front',
    storage_path: storagePath,
    public_url: publicUrl,
    template_id: templateId,
    print_area_px: printZone,
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
