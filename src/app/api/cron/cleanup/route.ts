import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { cleanupUserContent } from '@/lib/cleanup/user-cleanup'

// Runs weekly (see vercel.json). Needs CRON_SECRET env var set in Vercel project settings.
// Max 20 users per run to stay within serverless timeout limits.
export const runtime = 'nodejs'
export const maxDuration = 300

export async function GET(request: Request) {
  const auth = request.headers.get('authorization')
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()

  const cutoff = new Date()
  cutoff.setMonth(cutoff.getMonth() - 12)

  // Find users inactive for 12+ months who haven't been cleaned yet
  const { data: inactiveUsers, error } = await supabase
    .from('user_profiles')
    .select('user_id')
    .eq('account_status', 'active')
    .lt('last_login_at', cutoff.toISOString())
    .limit(20)

  if (error) {
    console.error('[Cron] Query failed:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!inactiveUsers?.length) {
    return NextResponse.json({ success: true, cleaned: 0, message: 'No inactive users found' })
  }

  let cleaned = 0
  let failed = 0
  const failedIds: string[] = []

  for (const { user_id } of inactiveUsers) {
    try {
      await cleanupUserContent(user_id)
      cleaned++
      console.log(`[Cron] Cleaned up user ${user_id}`)
    } catch (err) {
      failed++
      failedIds.push(user_id)
      console.error(`[Cron] Cleanup failed for ${user_id}:`, err)
    }
  }

  return NextResponse.json({
    success: true,
    cleaned,
    failed,
    failedIds: failedIds.length > 0 ? failedIds : undefined,
  })
}
