import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'
import type { UserProfile } from '@/types'

type AuthState = {
  user: { id: string; email: string; role: string } | null
  profile: UserProfile | null
  loading: boolean
  accessToken: string | null
  init: () => Promise<void>
  login: (email: string, password: string, turnstileToken?: string) => Promise<void>
  logout: () => Promise<void>
  refreshToken: () => Promise<string | null>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  loading: true,
  accessToken: null,

  init: async () => {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      set({
        user: {
          id: session.user.id,
          email: session.user.email!,
          role: session.user.user_metadata?.role || session.user.app_metadata?.role || 'user',
        },
        accessToken: session.access_token,
        loading: false,
      })
    } else {
      set({ loading: false })
    }

    supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        set({
          user: {
            id: session.user.id,
            email: session.user.email!,
            role: session.user.user_metadata?.role || 'user',
          },
          accessToken: session.access_token,
        })
      } else {
        set({ user: null, profile: null, accessToken: null })
      }
    })
  },

  login: async (email, password, turnstileToken) => {
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw new Error('E-Mail oder Passwort falsch')
  },

  logout: async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    set({ user: null, profile: null, accessToken: null })
    window.location.href = '/login'
  },

  refreshToken: async () => {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.refreshSession()
    if (session) {
      set({ accessToken: session.access_token })
      return session.access_token
    }
    return null
  },
}))
