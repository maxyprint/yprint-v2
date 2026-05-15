import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/helpers'
import { createAdminClient } from '@/lib/supabase/admin'

// GET /api/admin/users?page=0&status=active
// Returns paginated user list with activity stats.
export async function GET(request: Request) {
  const { user, error } = await requireAdmin()
  if (error || !user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { searchParams } = new URL(request.url)
  const page   = Math.max(0, parseInt(searchParams.get('page') ?? '0'))
  const status = searchParams.get('status') ?? 'all' // 'active' | 'inactive_cleaned' | 'all'
  const PAGE_SIZE = 50

  const supabase = createAdminClient()

  let query = supabase
    .from('user_profiles')
    .select('user_id, first_name, last_name, phone, last_login_at, last_active_at, account_status, cleaned_at', { count: 'exact' })
    .order('last_login_at', { ascending: false })
    .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)

  if (status !== 'all') {
    query = query.eq('account_status', status)
  }

  const { data: profiles, count, error: profilesError } = await query
  if (profilesError) return NextResponse.json({ error: profilesError.message }, { status: 500 })

  const userIds = (profiles ?? []).map(p => p.user_id)

  // Design counts per user
  const { data: designCounts } = await supabase
    .from('user_designs')
    .select('user_id')
    .in('user_id', userIds)

  const designCountMap: Record<string, number> = {}
  for (const d of designCounts ?? []) {
    designCountMap[d.user_id] = (designCountMap[d.user_id] ?? 0) + 1
  }

  // Order counts per user
  const { data: orderCounts } = await supabase
    .from('orders')
    .select('user_id')
    .in('user_id', userIds)

  const orderCountMap: Record<string, number> = {}
  for (const o of orderCounts ?? []) {
    if (o.user_id) orderCountMap[o.user_id] = (orderCountMap[o.user_id] ?? 0) + 1
  }

  const now = Date.now()

  const users = (profiles ?? []).map(p => {
    const lastActivity = Math.max(
      new Date(p.last_login_at ?? 0).getTime(),
      new Date(p.last_active_at ?? 0).getTime()
    )
    const inactiveDays = Math.floor((now - lastActivity) / 86_400_000)

    return {
      user_id:        p.user_id,
      name:           [p.first_name, p.last_name].filter(Boolean).join(' ') || '—',
      phone:          p.phone ?? null,
      last_login_at:  p.last_login_at,
      last_active_at: p.last_active_at,
      inactive_days:  inactiveDays,
      account_status: p.account_status,
      cleaned_at:     p.cleaned_at ?? null,
      design_count:   designCountMap[p.user_id] ?? 0,
      order_count:    orderCountMap[p.user_id]  ?? 0,
    }
  })

  return NextResponse.json({
    success: true,
    data: {
      users,
      total: count ?? 0,
      page,
      page_size: PAGE_SIZE,
    },
  })
}
