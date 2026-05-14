'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import TurnstileWidget from '@/components/TurnstileWidget'

function FormInput({
  id,
  type = 'text',
  value,
  onChange,
  placeholder,
  autoComplete,
  required,
}: {
  id: string
  type?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder: string
  autoComplete?: string
  required?: boolean
}) {
  const [focused, setFocused] = useState(false)
  return (
    <input
      id={id}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      autoComplete={autoComplete}
      required={required}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        width: '100%',
        height: '52px',
        padding: '12px 15px',
        fontFamily: 'inherit',
        fontSize: '16px',
        fontWeight: 400,
        lineHeight: 1.5,
        color: '#111827',
        backgroundColor: '#ffffff',
        border: focused ? '1px solid #0079FF' : '1px solid #e5e7eb',
        borderRadius: '10px',
        outline: 'none',
        transition: 'all 0.3s ease',
        boxSizing: 'border-box' as const,
        boxShadow: focused ? '0 0 0 3px rgba(0, 121, 255, 0.1)' : 'none',
      }}
    />
  )
}

export default function RegisterPage() {
  const router = useRouter()

  const [form, setForm] = useState({
    email: '',
    username: '',
    password: '',
    passwordConfirm: '',
  })
  const [consents, setConsents] = useState({
    terms: false,
    marketing: false,
  })
  const [turnstileToken, setTurnstileToken] = useState<string | null>(
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ? null : 'disabled'
  )
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!turnstileToken) return setError('Bitte bestätige, dass du kein Bot bist.')
    if (!consents.terms) return setError('Bitte akzeptiere die Datenschutzerklärung.')
    if (form.password !== form.passwordConfirm) return setError('Passwörter stimmen nicht überein.')
    if (form.password.length < 8) return setError('Passwort muss mindestens 8 Zeichen lang sein.')

    setError(null)
    setLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          username: form.username,
          turnstileToken,
          consents: {
            terms: consents.terms,
            privacy: consents.terms,
            marketing: consents.marketing,
          },
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Registrierung fehlgeschlagen.')
      setSuccess(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const cardStyle: React.CSSProperties = {
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
  }

  if (success) {
    return (
      <div style={cardStyle}>
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              background: '#f0fdf4',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px auto',
            }}
          >
            <svg width="32" height="32" fill="none" stroke="#16a34a" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#111827', margin: '0 0 12px 0' }}>
            Fast geschafft!
          </h2>
          <p style={{ fontSize: '15px', color: '#6b7280', margin: '0 0 28px 0', lineHeight: 1.5 }}>
            Wir haben dir eine Bestätigungs-E-Mail an{' '}
            <strong style={{ color: '#111827' }}>{form.email}</strong> gesendet.
            Klicke auf den Link in der E-Mail um dein Konto zu aktivieren.
          </p>
          <Link
            href="/login"
            className="yprint-button yprint-button-primary"
            style={{ textDecoration: 'none', display: 'inline-flex', width: '100%' }}
          >
            Zur Anmeldung
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={cardStyle}>
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
          Konto erstellen
        </h1>
        <p style={{ fontSize: '15px', color: '#6b7280', margin: 0 }}>
          Gestalte noch heute deine eigene Kollektion.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '20px' }}>
          <FormInput
            id="email"
            type="email"
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            placeholder="E-Mail-Adresse"
            autoComplete="email"
            required
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <FormInput
            id="username"
            type="text"
            value={form.username}
            onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
            placeholder="Benutzername"
            autoComplete="username"
            required
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <FormInput
            id="password"
            type="password"
            value={form.password}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            placeholder="Passwort"
            autoComplete="new-password"
            required
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <FormInput
            id="passwordConfirm"
            type="password"
            value={form.passwordConfirm}
            onChange={e => setForm(f => ({ ...f, passwordConfirm: e.target.value }))}
            placeholder="Passwort wiederholen"
            autoComplete="new-password"
            required
          />
        </div>

        {/* Turnstile */}
        <div style={{ textAlign: 'center', margin: '20px 0' }}>
          <TurnstileWidget onVerify={setTurnstileToken} onExpire={() => setTurnstileToken(null)} />
        </div>

        {/* Terms consent */}
        <label
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
            cursor: 'pointer',
            marginBottom: '15px',
            fontSize: '13px',
            color: '#6b7280',
            lineHeight: 1.5,
          }}
        >
          <input
            type="checkbox"
            checked={consents.terms}
            onChange={e => setConsents(c => ({ ...c, terms: e.target.checked }))}
            required
            style={{ marginTop: '3px', accentColor: '#0079FF', flexShrink: 0 }}
          />
          <span>
            Ich habe die{' '}
            <Link href="/datenschutz" target="_blank" style={{ color: '#0079FF', textDecoration: 'underline' }}>
              Datenschutzerklärung
            </Link>
            {' '}gelesen und stimme der darin beschriebenen Verarbeitung meiner Daten zur Erbringung des Dienstes zu.
          </span>
        </label>

        {/* Optional marketing consent */}
        <label
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
            cursor: 'pointer',
            marginBottom: '20px',
            fontSize: '13px',
            color: '#6b7280',
            lineHeight: 1.5,
          }}
        >
          <input
            type="checkbox"
            checked={consents.marketing}
            onChange={e => setConsents(c => ({ ...c, marketing: e.target.checked }))}
            style={{ marginTop: '3px', accentColor: '#0079FF', flexShrink: 0 }}
          />
          <span>Ich möchte Newsletter und Angebote per E-Mail erhalten (optional)</span>
        </label>

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
          {loading ? 'Konto wird erstellt…' : 'Konto erstellen'}
        </button>
      </form>

      {/* Login section */}
      <div
        style={{
          marginTop: '24px',
          paddingTop: '24px',
          borderTop: '1px solid #e5e7eb',
          textAlign: 'center',
        }}
      >
        <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 16px 0' }}>
          Du hast bereits ein Konto?
        </p>
        <Link
          href="/login"
          className="yprint-button yprint-button-secondary"
          style={{ width: '100%', textDecoration: 'none' }}
        >
          Jetzt anmelden
        </Link>
      </div>
    </div>
  )
}
