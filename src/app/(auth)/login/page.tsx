'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import TurnstileWidget from '@/components/TurnstileWidget'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useAuthStore()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [turnstileToken, setTurnstileToken] = useState<string | null>(
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ? null : 'disabled'
  )
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const verified = searchParams.get('verified')
  const reset = searchParams.get('reset')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!turnstileToken) {
      setError('Bitte bestätige, dass du kein Bot bist.')
      return
    }
    setError(null)
    setLoading(true)
    try {
      await login(email, password, turnstileToken)
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Anmeldung fehlgeschlagen.')
    } finally {
      setLoading(false)
    }
  }

  const handleTurnstile = useCallback((token: string) => {
    setTurnstileToken(token)
  }, [])

  return (
    <div className="yprint-card">
      <h1 className="text-2xl font-bold text-[#1d1d1f] mb-2">Anmelden</h1>
      <p className="text-[rgba(0,0,0,0.6)] text-sm mb-6">
        Noch kein Konto?{' '}
        <Link href="/register" className="text-[#007aff] hover:underline font-medium">
          Jetzt registrieren
        </Link>
      </p>

      {verified && (
        <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 text-green-800 text-sm">
          E-Mail erfolgreich bestätigt. Du kannst dich jetzt anmelden.
        </div>
      )}
      {reset && (
        <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 text-green-800 text-sm">
          Passwort erfolgreich geändert. Du kannst dich jetzt anmelden.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-[#1d1d1f] mb-1.5">
            E-Mail
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="yprint-input"
            placeholder="deine@email.de"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-[#1d1d1f] mb-1.5">
            Passwort
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="yprint-input"
            placeholder="••••••••"
          />
          <div className="mt-1.5 text-right">
            <Link href="/reset-password" className="text-xs text-[rgba(0,0,0,0.6)] hover:text-[#007aff] transition-colors">
              Passwort vergessen?
            </Link>
          </div>
        </div>

        <div className="flex justify-center">
          <TurnstileWidget onVerify={handleTurnstile} onExpire={() => setTurnstileToken(null)} />
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !turnstileToken}
          className="yprint-button yprint-button-primary w-full"
        >
          {loading ? 'Wird angemeldet…' : 'Anmelden'}
        </button>
      </form>
    </div>
  )
}
