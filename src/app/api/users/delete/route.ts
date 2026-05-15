import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/helpers'
import { createAdminClient } from '@/lib/supabase/admin'
import { cleanupUserContent } from '@/lib/cleanup/user-cleanup'

export async function DELETE() {
  const { user, error: authError } = await requireAuth()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createAdminClient()

  // 1. Anonymise orders and delete all storage files / content records.
  //    This must happen before deleteUser so we don't lose order data via cascade.
  await cleanupUserContent(user.id)

  // 2. Delete auth user — DB ON DELETE CASCADE removes user_profiles, user_addresses,
  //    notification_settings, privacy_settings, consents, etc.
  const { error } = await supabase.auth.admin.deleteUser(user.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
