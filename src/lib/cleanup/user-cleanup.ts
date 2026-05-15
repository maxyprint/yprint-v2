import { createAdminClient } from '@/lib/supabase/admin'
import { deleteDesignCascade } from './delete-design'

// Deletes all user-generated content and anonymises orders.
// Does NOT delete the auth.users row — call supabase.auth.admin.deleteUser() after if needed.
// Keeps: user_profiles (phone/name), user_addresses (shipping info), orders (anonymised).
export async function cleanupUserContent(userId: string): Promise<void> {
  const supabase = createAdminClient()

  // ── 1. Designs + their PNGs + preview images ────────────────────────────────
  const { data: designs } = await supabase
    .from('user_designs')
    .select('id')
    .eq('user_id', userId)

  for (const design of designs ?? []) {
    await deleteDesignCascade(design.id, userId, supabase)
  }

  // ── 2. Gallery images (user_images table + user-images bucket) ───────────────
  const { data: images } = await supabase
    .from('user_images')
    .select('storage_path')
    .eq('user_id', userId)

  const imagePaths = (images ?? []).map(i => i.storage_path as string).filter(Boolean)
  if (imagePaths.length > 0) {
    await supabase.storage.from('user-images').remove(imagePaths)
  }

  // Clean up any remaining files in the user's previews folder
  const { data: previewFiles } = await supabase.storage
    .from('user-images')
    .list(`${userId}/previews`)
  if (previewFiles?.length) {
    await supabase.storage.from('user-images').remove(
      previewFiles.map(f => `${userId}/previews/${f.name}`)
    )
  }

  await supabase.from('user_images').delete().eq('user_id', userId)

  // ── 3. Cart sessions ─────────────────────────────────────────────────────────
  await supabase.from('cart_sessions').delete().eq('user_id', userId)

  // ── 4. Payment methods ───────────────────────────────────────────────────────
  await supabase.from('payment_methods').delete().eq('user_id', userId)

  // ── 5. Anonymise orders (legal: Buchführungspflicht 10 Jahre) ────────────────
  // Set user_id → null so order/invoice data is preserved without the personal link.
  await supabase
    .from('orders')
    .update({ user_id: null })
    .eq('user_id', userId)

  // ── 6. Mark profile as cleaned (keeps phone, name, birthdate, addresses) ─────
  await supabase
    .from('user_profiles')
    .update({
      account_status: 'inactive_cleaned',
      cleaned_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
}
