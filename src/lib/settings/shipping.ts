import { createAdminClient } from '@/lib/supabase/admin'

export async function getShippingCents(): Promise<number> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('app_settings')
    .select('value')
    .eq('key', 'shipping')
    .single()

  return (data?.value as { standard_cents?: number } | null)?.standard_cents ?? 500
}
