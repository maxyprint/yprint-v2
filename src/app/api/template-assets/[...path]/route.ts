import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// Proxies template-assets bucket images through Next.js so Fabric.js canvas
// reads them as same-origin — avoiding the SecurityError from tainted WebGL canvas.
export async function GET(_req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params
  const storagePath = path.join('/')
  if (!storagePath) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const supabase = createAdminClient()
  const { data, error } = await supabase.storage
    .from('template-assets')
    .download(storagePath)

  if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const buf = await data.arrayBuffer()
  const contentType = data.type || 'image/png'

  return new Response(buf, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Access-Control-Allow-Origin': '*',
    },
  })
}
