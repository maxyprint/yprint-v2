import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/helpers'
import { createAdminClient } from '@/lib/supabase/admin'

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { user, error: authError } = await requireAuth()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createAdminClient()
  const { data: image } = await supabase
    .from('user_images').select('storage_path').eq('id', id).eq('user_id', user.id).single()
  if (!image) return NextResponse.json({ error: 'Bild nicht gefunden.' }, { status: 404 })

  await supabase.storage.from('user-images').remove([image.storage_path])
  await supabase.from('user_images').delete().eq('id', id)
  return NextResponse.json({ success: true })
}
