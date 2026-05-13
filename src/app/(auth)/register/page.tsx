'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import TurnstileWidget from '@/components/TurnstileWidget'

export default function RegisterPage() {
  const router = useRouter()

  const [form, setForm] = useState({
    email: '',
    password: '',
    passwordConfirm: '',
    firstName: '',
    lastName: '',
  })
  const [consents, setConsents] = useState({
    terms: false,
    privacy: false,
    marketing: false,
  })
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!turnstileToken) return setError('Bitte bestätige, dass du kein Bot bist.')
    if (!consents.terms || !consents.privacy) return setError('Bitte akzeptiere die Nutzungsbedingungen und Datenschutzerklärung.')
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
          firstName: form.firstName,
          lastName: form.lastName,
          turnstileToken,
          consents: {
            terms: consents.terms,
            privacy: consents.privacy,
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

  if (success) {
    return (
      <div className="yprint-card text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-[#1d1d1f] mb-2">Fast geschafft!</h2>
        <p className="text-[rgba(0,0,0,0.6)] text-sm mb-6">
          Wir haben dir eine Bestätigungs-E-Mail an <strong>{form.email}</strong> gesendet.
          Klicke auf den Link in der E-Mail um dein Konto zu aktivieren.
        </p>
        <Link href="/login" className="yprint-button yprint-button-primary">
          Zur Anmeldung
        </Link>
      </div>
    )
  }

  return (
    <div className="yprint-card">
      <h1 className="text-2xl font-bold text-[#1d1d1f] mb-2">Konto erstellen</h1>
      <p className="text-[rgba(0,0,0,0.6)] text-sm mb-6">
        Bereits registriert?{' '}
        <Link href="/login" className="text-[#007aff] hover:underline font-medium">
          Jetzt anmelden
        </Link>
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-[#1d1d1f] mb-1.5">Vorname</label>
            <input
              id="firstName"
              type="text"
              value={form.firstName}
              onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
              required
              className="yprint-input"
              placeholder="Max"
            />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-[#1d1d1f] mb-1.5">Nachname</label>
            <input
              id="lastName"
              type="text"
              value={form.lastName}
              onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
              required
              className="yprint-input"
              placeholder="Muster"
            />
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-[#1d1d1f] mb-1.5">E-Mail</label>
          <input
            id="email"
            type="email"
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            required
            autoComplete="email"
            className="yprint-input"
            placeholder="deine@email.de"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-[#1d1d1f] mb-1.5">Passwort</label>
          <input
            id="password"
            type="password"
            value={form.password}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            required
            autoComplete="new-password"
            className="yprint-input"
            placeholder="Mindestens 8 Zeichen"
          />
        </div>

        <div>
          <label htmlFor="passwordConfirm" className="block text-sm font-medium text-[#1d1d1f] mb-1.5">Passwort wiederholen</label>
          <input
            id="passwordConfirm"
            type="password"
            value={form.passwordConfirm}
            onChange={e => setForm(f => ({ ...f, passwordConfirm: e.target.value }))}
            required
            autoComplete="new-password"
            className="yprint-input"
            placeholder="••••••••"
          />
        </div>

        <div className="space-y-2.5 pt-1">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={consents.terms}
              onChange={e => setConsents(c => ({ ...c, terms: e.target.checked }))}
              className="mt-0.5 rounded border-gray-300 text-[#007aff]"
            />
            <span className="text-sm text-[rgba(0,0,0,0.7)]">
              Ich akzeptiere die{' '}
              <Link href="/agb" target="_blank" className="text-[#007aff] hover:underline">Nutzungsbedingungen</Link>
              {' '}*
            </span>
          </label>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={consents.privacy}
              onChange={e => setConsents(c => ({ ...c, privacy: e.target.checked }))}
              className="mt-0.5 rounded border-gray-300 text-[#007aff]"
            />
            <span className="text-sm text-[rgba(0,0,0,0.7)]">
              Ich habe die{' '}
              <Link href="/datenschutz" target="_blank" className="text-[#007aff] hover:underline">Datenschutzerklärung</Link>
              {' '}gelesen und akzeptiert *
            </span>
          </label>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={consents.marketing}
              onChange={e => setConsents(c => ({ ...c, marketing: e.target.checked }))}
              className="mt-0.5 rounded border-gray-300 text-[#007aff]"
            />
            <span className="text-sm text-[rgba(0,0,0,0.7)]">
              Ich möchte Newsletter und Angebote per E-Mail erhalten (optional)
            </span>
          </label>
        </div>

        <div className="flex justify-center">
          <TurnstileWidget onVerify={setTurnstileToken} onExpire={() => setTurnstileToken(null)} />
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
          {loading ? 'Konto wird erstellt…' : 'Konto erstellen'}
        </button>
      </form>
    </div>
  )
}
