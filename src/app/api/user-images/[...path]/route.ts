import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// Proxies user-images bucket through Next.js so fabric.Image.fromURL gets
// a same-origin URL regardless of whether the Supabase bucket is public.
export async function GET(_req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params
  const storagePath = path.join('/')
  if (!storagePath) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const supabase = createAdminClient()
  const { data, error } = await supabase.storage
    .from('user-images')
    .download(storagePath)

  if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const buf = await data.arrayBuffer()
  return new Response(buf, {
    headers: {
      'Content-Type': data.type || 'image/png',
      'Cache-Control': 'private, max-age=3600',
    },
  })
}
