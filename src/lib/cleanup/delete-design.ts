import { createAdminClient } from '@/lib/supabase/admin'
import type { SupabaseClient } from '@supabase/supabase-js'

type AdminClient = ReturnType<typeof createAdminClient>

// Deletes one design and every storage file / DB record that belongs to it.
// Pass an existing supabase client to reuse it across batch operations.
export async function deleteDesignCascade(
  designId: string,
  userId: string,
  supabase: AdminClient = createAdminClient()
): Promise<void> {
  // 1. Fetch print-png storage paths before deleting the records
  const { data: pngs } = await supabase
    .from('design_pngs')
    .select('storage_path')
    .eq('design_id', designId)

  const pngPaths = (pngs ?? []).map(p => p.storage_path as string).filter(Boolean)
  if (pngPaths.length > 0) {
    await supabase.storage.from('print-pngs').remove(pngPaths)
  }

  // 2. Delete canvas preview images (user-images bucket, previews/{designId}_*.png)
  const { data: previewFiles } = await supabase.storage
    .from('user-images')
    .list(`${userId}/previews`)
  const previewPaths = (previewFiles ?? [])
    .filter(f => f.name.startsWith(`${designId}_`) || f.name === designId)
    .map(f => `${userId}/previews/${f.name}`)
  if (previewPaths.length > 0) {
    await supabase.storage.from('user-images').remove(previewPaths)
  }

  // 3. Delete DB records (order matters: design_pngs before user_designs)
  await supabase.from('design_pngs').delete().eq('design_id', designId)
  await supabase.from('user_designs').delete().eq('id', designId).eq('user_id', userId)
}
