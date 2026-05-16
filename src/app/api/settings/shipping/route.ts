import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('app_settings')
    .select('value')
    .eq('key', 'shipping')
    .single()

  const value = data?.value as { standard_cents?: number; free_above_cents?: number | null } | null
  return NextResponse.json({
    standard_cents:   value?.standard_cents   ?? 500,
    free_above_cents: value?.free_above_cents ?? null,
  })
}
