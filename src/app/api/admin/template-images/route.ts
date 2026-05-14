import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/helpers'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  const { user, error } = await requireAdmin()
  if (error || !user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  let body: FormData
  try {
    body = await request.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })
  }

  const file = body.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'Keine Datei übergeben.' }, { status: 400 })

  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: 'Datei zu groß (max. 10 MB).' }, { status: 400 })
  }
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    return NextResponse.json({ error: 'Nur PNG, JPG oder WebP erlaubt.' }, { status: 400 })
  }

  const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg'
  const filename = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`
  const storagePath = `mockups/${filename}`
  const buffer = Buffer.from(await file.arrayBuffer())

  const supabase = createAdminClient()

  // Ensure the template-assets bucket exists (public)
  const { error: uploadError } = await supabase.storage
    .from('template-assets')
    .upload(storagePath, buffer, { contentType: file.type, upsert: false })

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 })
  }

  const { data: { publicUrl } } = supabase.storage
    .from('template-assets')
    .getPublicUrl(storagePath)

  return NextResponse.json({ url: publicUrl, path: storagePath })
}
