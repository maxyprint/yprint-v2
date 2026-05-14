'use client'

import { Suspense, useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import TurnstileWidget from '@/components/TurnstileWidget'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useAuthStore()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ? null : 'disabled'
  )
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const verified = searchParams.get('verified')
  const reset = searchParams.get('reset')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!turnstileToken) { setError('Bitte bestätige, dass du kein Bot bist.'); return }
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

  const handleTurnstile = useCallback((token: string) => setTurnstileToken(token), [])

  return (
    <div
      style={{
        background: '#ffffff',
        borderRadius: '30px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
        border: '1px solid #e5e7eb',
        padding: '40px',
        width: '100%',
        maxWidth: '420px',
        position: 'relative',
        boxSizing: 'border-box',
        fontFamily: "'Inter', 'Roboto', 'Helvetica Neue', Arial, sans-serif",
      }}
    >
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h1
          style={{
            fontSize: '26px',
            fontWeight: 700,
            color: '#111827',
            margin: '0 0 8px 0',
          }}
        >
          Willkommen zurück!
        </h1>
        <p style={{ fontSize: '15px', color: '#6b7280', margin: 0 }}>
          Logge dich ein &amp; bringe deine Kunst auf die Straße.
        </p>
      </div>

      {verified && (
        <div
          style={{
            marginBottom: '20px',
            padding: '12px 16px',
            borderRadius: '8px',
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            color: '#166534',
            fontSize: '14px',
          }}
        >
          E-Mail erfolgreich bestätigt. Du kannst dich jetzt anmelden.
        </div>
      )}
      {reset && (
        <div
          style={{
            marginBottom: '20px',
            padding: '12px 16px',
            borderRadius: '8px',
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            color: '#166534',
            fontSize: '14px',
          }}
        >
          Passwort erfolgreich geändert. Du kannst dich jetzt anmelden.
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Email field */}
        <div style={{ marginBottom: '24px' }}>
          <input
            id="email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoComplete="email"
            placeholder="E-Mail-Adresse"
            className="yprint-input"
          />
        </div>

        {/* Password field */}
        <div style={{ marginBottom: '24px', position: 'relative' }}>
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            placeholder="Passwort"
            className="yprint-input"
            style={{ paddingRight: '52px' }}
          />
          <button
            type="button"
            onClick={() => setShowPassword(v => !v)}
            aria-label="Passwort anzeigen/verstecken"
            style={{
              position: 'absolute',
              right: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              borderRadius: '4px',
              color: '#6b7280',
              transition: 'color 0.2s ease',
              padding: 0,
            }}
          >
            {showPassword ? (
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
              </svg>
            ) : (
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
            )}
          </button>
        </div>

        {/* Forgot password */}
        <div style={{ textAlign: 'right', marginTop: '-16px', marginBottom: '24px' }}>
          <Link
            href="/reset-password"
            style={{ fontSize: '13px', color: '#6b7280', textDecoration: 'none' }}
          >
            Passwort vergessen?
          </Link>
        </div>

        {/* Turnstile */}
        <div style={{ textAlign: 'center', margin: '20px 0' }}>
          <TurnstileWidget onVerify={handleTurnstile} onExpire={() => setTurnstileToken(null)} />
        </div>

        {error && (
          <div
            style={{
              padding: '12px 16px',
              borderRadius: '8px',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#dc2626',
              fontSize: '14px',
              marginBottom: '16px',
            }}
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !turnstileToken}
          className="yprint-button yprint-button-primary"
          style={{ width: '100%' }}
        >
          {loading ? 'Wird angemeldet…' : 'Anmelden'}
        </button>
      </form>

      {/* Register section */}
      <div
        style={{
          marginTop: '24px',
          paddingTop: '24px',
          borderTop: '1px solid #e5e7eb',
          textAlign: 'center',
        }}
      >
        <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 16px 0' }}>
          Du hast noch kein Konto?
        </p>
        <Link
          href="/register"
          className="yprint-button yprint-button-secondary"
          style={{ width: '100%', textDecoration: 'none' }}
        >
          Jetzt registrieren
        </Link>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ width: '100%', maxWidth: '420px', height: '480px', background: '#fff', borderRadius: '20px', border: '1px solid #e5e7eb' }} />}>
      <LoginForm />
    </Suspense>
  )
}
