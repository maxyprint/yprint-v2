import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/helpers'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  const { user, error: authError } = await requireAuth()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createAdminClient()
  const [profile, addresses, orders, designs, images] = await Promise.all([
    supabase.from('user_profiles').select('*').eq('user_id', user.id).single(),
    supabase.from('user_addresses').select('*').eq('user_id', user.id),
    supabase.from('orders').select('*, order_items(*)').eq('user_id', user.id),
    supabase.from('user_designs').select('id, name, created_at, updated_at').eq('user_id', user.id),
    supabase.from('user_images').select('filename, public_url, created_at').eq('user_id', user.id),
  ])

  const exportData = {
    exported_at: new Date().toISOString(),
    user: { id: user.id, email: user.email },
    profile: profile.data,
    addresses: addresses.data || [],
    orders: orders.data || [],
    designs: designs.data || [],
    images: images.data || [],
  }

  return new NextResponse(JSON.stringify(exportData, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="yprint-daten-${user.id.slice(0, 8)}.json"`,
    },
  })
}
