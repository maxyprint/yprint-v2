import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth/helpers'

export async function POST() {
  const { user, error } = await requireAdmin()
  if (error || !user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  // Invalidate all cached pages and layouts from the root down
  revalidatePath('/', 'layout')

  return NextResponse.json({ success: true })
}
