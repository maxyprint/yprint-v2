/**
 * AJAX-Dispatcher-Shim
 * Empfängt POST-Requests von designer.bundle.js (action=xxx Format)
 * und routet sie zu den entsprechenden Handlers — ohne das Bundle anfassen zu müssen.
 */
import { NextResponse } from 'next/server'
import { requireAuthFromNonce } from '@/lib/auth/helpers'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  let body: FormData
  try {
    body = await request.formData()
  } catch {
    return NextResponse.json({ success: false, data: 'Invalid form data' }, { status: 400 })
  }

  const action = body.get('action') as string
  const nonce = body.get('nonce') as string | null

  switch (action) {
    // ── Templates ──────────────────────────────────────────
    case 'get_templates':
      return handleGetTemplates()

    // ── User Images ─────────────────────────────────────────
    case 'upload_user_image': {
      const { user, error } = await requireAuthFromNonce(nonce)
      if (error) return error
      return handleUploadUserImage(user!.id, body)
    }
    case 'delete_user_image': {
      const { user, error } = await requireAuthFromNonce(nonce)
      if (error) return error
      return handleDeleteUserImage(user!.id, body)
    }
    case 'get_user_images': {
      const { user, error } = await requireAuthFromNonce(nonce)
      if (error) return error
      return handleGetUserImages(user!.id)
    }

    // ── Designs ─────────────────────────────────────────────
    case 'save_design': {
      const { user, error } = await requireAuthFromNonce(nonce)
      if (error) return error
      return handleSaveDesign(user!.id, body)
    }
    case 'load_design': {
      const { user, error } = await requireAuthFromNonce(nonce)
      if (error) return error
      return handleLoadDesign(user!.id, body)
    }
    case 'get_user_designs': {
      const { user, error } = await requireAuthFromNonce(nonce)
      if (error) return error
      return handleGetUserDesigns(user!.id)
    }

    // ── PNG Storage ─────────────────────────────────────────
    case 'yprint_save_design_print_png': {
      const { user, error } = await requireAuthFromNonce(nonce)
      if (error) return error
      return handleSaveDesignPNG(user!.id, body)
    }
    case 'yprint_get_existing_png': {
      const { user, error } = await requireAuthFromNonce(nonce)
      if (error) return error
      return handleGetExistingPNG(user!.id, body)
    }

    // ── Template Metadata ────────────────────────────────────
    case 'yprint_get_template_metadata':
      return handleGetTemplateMetadata(body)
    case 'yprint_get_template_print_area':
      return handleGetTemplatePrintArea(body)

    // ── Auth / Session ───────────────────────────────────────
    case 'yprint_refresh_nonce':
      return NextResponse.json({ success: true, data: { nonce: 'valid' } })

    default:
      return NextResponse.json(
        { success: false, data: `Unknown action: ${action}` },
        { status: 400 }
      )
  }
}

// ─── Handler implementations ──────────────────────────────────────────────────

async function handleGetTemplates() {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('design_templates')
    .select('*')
    .eq('status', 'published')
    .order('name')

  if (error) return NextResponse.json({ success: false, data: error.message }, { status: 500 })

  // Transform to format Designer.js expects: { "template_id": { id, name, variations, ... } }
  const result: Record<string, unknown> = {}
  for (const t of data ?? []) {
    result[t.id] = {
      id: t.id,
      name: t.name,
      category: t.category,
      physical_width_cm: t.physical_width_cm,
      physical_height_cm: t.physical_height_cm,
      sizes: t.sizes,
      variations: t.variations,
      base_price: t.base_price,
      pricing: t.pricing,
      in_stock: t.in_stock,
    }
  }
  return NextResponse.json({ success: true, data: result })
}

async function handleUploadUserImage(userId: string, body: FormData) {
  const supabase = createAdminClient()

  // Image count quota: max 20
  const { count } = await supabase
    .from('user_images')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
  if ((count ?? 0) >= 20) {
    return NextResponse.json({ success: false, data: 'Image limit reached (max 20)' }, { status: 400 })
  }

  const file = body.get('file') as File | null
  if (!file) return NextResponse.json({ success: false, data: 'No file' }, { status: 400 })
  if (file.size > 5 * 1024 * 1024)
    return NextResponse.json({ success: false, data: 'File too large (max 5MB)' }, { status: 400 })
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type))
    return NextResponse.json({ success: false, data: 'Invalid file type' }, { status: 400 })

  const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg'
  const imageId = crypto.randomUUID().replace(/-/g, '')
  const storagePath = `${userId}/gallery/${imageId}.${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())

  const { error: uploadError } = await supabase.storage
    .from('user-images')
    .upload(storagePath, buffer, { contentType: file.type })

  if (uploadError)
    return NextResponse.json({ success: false, data: uploadError.message }, { status: 500 })

  const { data: { publicUrl } } = supabase.storage.from('user-images').getPublicUrl(storagePath)

  await supabase.from('user_images').insert({
    user_id: userId, image_id: imageId,
    filename: file.name, storage_path: storagePath,
    public_url: publicUrl, image_type: 'gallery',
  })

  return NextResponse.json({ success: true, data: { id: imageId, url: publicUrl, filename: file.name } })
}

async function handleDeleteUserImage(userId: string, body: FormData) {
  const supabase = createAdminClient()
  const imageId = body.get('image_id') as string

  const { data } = await supabase
    .from('user_images')
    .select('storage_path')
    .eq('image_id', imageId)
    .eq('user_id', userId)
    .single()

  if (!data) return NextResponse.json({ success: false, data: 'Not found' }, { status: 404 })

  await supabase.storage.from('user-images').remove([data.storage_path])
  await supabase.from('user_images').delete().eq('image_id', imageId).eq('user_id', userId)

  return NextResponse.json({ success: true, data: {} })
}

async function handleGetUserImages(userId: string) {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('user_images')
    .select('image_id, public_url, filename, image_type, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  return NextResponse.json({
    success: true,
    data: (data ?? []).map(img => ({ id: img.image_id, url: img.public_url, filename: img.filename }))
  })
}

async function handleSaveDesign(userId: string, body: FormData) {
  const supabase = createAdminClient()
  const designId = body.get('design_id') as string | null
  const templateId = body.get('template_id') as string
  const designDataRaw = body.get('design_data') as string
  const name = (body.get('design_name') as string) || 'Mein Design'
  const productName = (body.get('product_name') as string) || ''
  const variationsRaw = (body.get('variations') as string) || '{}'
  const productImagesRaw = (body.get('product_images') as string) || '[]'

  let designData: unknown
  try { designData = JSON.parse(designDataRaw) } catch { designData = {} }

  const payload = {
    user_id: userId,
    template_id: templateId || null,
    name,
    product_name: productName,
    design_data: designData,
    variations: JSON.parse(variationsRaw),
    product_images: JSON.parse(productImagesRaw),
    updated_at: new Date().toISOString(),
  }

  if (designId && designId !== '0') {
    const { data, error } = await supabase
      .from('user_designs')
      .update(payload)
      .eq('id', designId)
      .eq('user_id', userId)
      .select('id, created_at')
      .single()
    if (error) return NextResponse.json({ success: false, data: error.message }, { status: 500 })
    return NextResponse.json({ success: true, data: { design_id: data.id, created_at: data.created_at } })
  } else {
    const { data, error } = await supabase
      .from('user_designs')
      .insert(payload)
      .select('id, created_at')
      .single()
    if (error) return NextResponse.json({ success: false, data: error.message }, { status: 500 })
    return NextResponse.json({ success: true, data: { design_id: data.id, created_at: data.created_at } })
  }
}

async function handleLoadDesign(userId: string, body: FormData) {
  const supabase = createAdminClient()
  const designId = body.get('design_id') as string

  const { data, error } = await supabase
    .from('user_designs')
    .select('*')
    .eq('id', designId)
    .eq('user_id', userId)
    .single()

  if (error || !data) return NextResponse.json({ success: false, data: 'Not found' }, { status: 404 })

  return NextResponse.json({
    success: true,
    data: {
      design_data: data.design_data,
      template_id: data.template_id,
      variations: data.variations,
      name: data.name,
    }
  })
}

async function handleGetUserDesigns(userId: string) {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('user_designs')
    .select('id, name, template_id, product_status, inventory_status, print_file_url, product_images, created_at, updated_at')
    .eq('user_id', userId)
    .eq('is_enabled', true)
    .order('updated_at', { ascending: false })

  return NextResponse.json({ success: true, data: data ?? [] })
}

async function handleSaveDesignPNG(userId: string, body: FormData) {
  const supabase = createAdminClient()
  const designId = body.get('design_id') as string
  const printPngDataUrl = body.get('print_png') as string
  const viewId = (body.get('view_id') as string) || 'front'
  const viewName = (body.get('view_name') as string) || 'Front'
  const templateId = body.get('template_id') as string | null
  const printAreaPxRaw = (body.get('print_area_px') as string) || '{}'
  const printAreaMmRaw = (body.get('print_area_mm') as string) || '{}'
  const metadataRaw = (body.get('metadata') as string) || '{}'

  if (!printPngDataUrl?.startsWith('data:image/png;base64,')) {
    return NextResponse.json({ success: false, data: 'Invalid PNG data' }, { status: 400 })
  }

  const base64 = printPngDataUrl.replace(/^data:image\/png;base64,/, '')
  const buffer = Buffer.from(base64, 'base64')
  const storagePath = `${userId}/${designId}/${viewId}_print.png`

  const { error: uploadError } = await supabase.storage
    .from('print-pngs')
    .upload(storagePath, buffer, { contentType: 'image/png', upsert: true })

  if (uploadError)
    return NextResponse.json({ success: false, data: uploadError.message }, { status: 500 })

  const { data: { publicUrl } } = supabase.storage.from('print-pngs').getPublicUrl(storagePath)

  await supabase.from('design_pngs').upsert({
    design_id: designId,
    view_id: viewId,
    view_name: viewName,
    storage_path: storagePath,
    public_url: publicUrl,
    template_id: templateId,
    print_area_px: JSON.parse(printAreaPxRaw),
    print_area_mm: JSON.parse(printAreaMmRaw),
    metadata: JSON.parse(metadataRaw),
    save_type: 'designer',
  }, { onConflict: 'design_id,view_id' })

  // Update print_file_url on the design (primary view)
  if (viewId === 'front' || viewId === 'view_1') {
    await supabase.from('user_designs')
      .update({ print_file_url: publicUrl })
      .eq('id', designId)
      .eq('user_id', userId)
  }

  return NextResponse.json({ success: true, data: { png_url: publicUrl, png_path: storagePath, design_id: designId } })
}

async function handleGetExistingPNG(userId: string, body: FormData) {
  const supabase = createAdminClient()
  const identifier = body.get('identifier') as string

  const { data } = await supabase
    .from('design_pngs')
    .select('public_url')
    .eq('design_id', identifier)
    .order('generated_at', { ascending: false })
    .limit(1)
    .single()

  return NextResponse.json({
    success: true,
    data: { png: data?.public_url || null, found: !!data }
  })
}

async function handleGetTemplateMetadata(body: FormData) {
  const supabase = createAdminClient()
  const templateId = body.get('template_id') as string

  const { data } = await supabase
    .from('design_templates')
    .select('id, name, physical_width_cm, physical_height_cm, sizes, variations, pricing')
    .eq('id', templateId)
    .single()

  if (!data) return NextResponse.json({ success: false, data: 'Not found' }, { status: 404 })

  // Extract first variation's first view's printZone for backwards compat
  const firstVariation = Object.values(data.variations as Record<string, { views: Record<string, { printZone: unknown }> }>)[0]
  const firstView = firstVariation ? Object.values(firstVariation.views)[0] : null

  return NextResponse.json({
    success: true,
    data: {
      id: data.id,
      name: data.name,
      physical_width_cm: data.physical_width_cm,
      physical_height_cm: data.physical_height_cm,
      printable_area_mm: { width: data.physical_width_cm * 10, height: data.physical_height_cm * 10 },
      printable_area_px: firstView?.printZone || {},
      sizes: data.sizes,
      pricing: data.pricing,
    }
  })
}

async function handleGetTemplatePrintArea(body: FormData) {
  const supabase = createAdminClient()
  const templateId = body.get('template_id') as string

  const { data } = await supabase
    .from('design_templates')
    .select('physical_width_cm, physical_height_cm, variations')
    .eq('id', templateId)
    .single()

  if (!data) return NextResponse.json({ success: false, data: 'Not found' }, { status: 404 })

  const firstVariation = Object.values(data.variations as Record<string, { views: Record<string, { printZone: unknown }> }>)[0]
  const firstView = firstVariation ? Object.values(firstVariation.views)[0] : null

  return NextResponse.json({
    success: true,
    data: {
      printable_area_px: firstView?.printZone || { left: 100, top: 100, width: 800, height: 600 },
      printable_area_mm: { width: data.physical_width_cm * 10, height: data.physical_height_cm * 10 },
    }
  })
}
