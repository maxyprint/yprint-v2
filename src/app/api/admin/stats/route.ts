import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/helpers'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  const { user, error } = await requireAdmin()
  if (error || !user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const supabase = createAdminClient()

  const [ordersResult, designsResult, usersResult] = await Promise.all([
    supabase.from('orders').select('total', { count: 'exact' }),
    supabase.from('user_designs').select('id', { count: 'exact', head: true }).eq('is_enabled', true),
    supabase.from('user_profiles').select('user_id', { count: 'exact', head: true }),
  ])

  const revenue = (ordersResult.data || []).reduce((sum: number, o: any) => sum + Number(o.total), 0)

  return NextResponse.json({
    success: true,
    data: {
      orders: ordersResult.count || 0,
      revenue,
      designs: designsResult.count || 0,
      users: usersResult.count || 0,
    }
  })
}
