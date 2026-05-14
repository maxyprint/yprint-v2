'use client'

import { Suspense, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

function ResetPasswordContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      setSuccess(true)
    } finally {
      setLoading(false)
    }
  }

  const handleSetNewPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== passwordConfirm) return setError('Passwörter stimmen nicht überein.')
    if (password.length < 8) return setError('Passwort muss mindestens 8 Zeichen lang sein.')
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Fehler beim Zurücksetzen.')
      router.push('/login?reset=1')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (token) return (
    <div className="yprint-card">
      <h1 className="text-2xl font-bold text-[#1d1d1f] mb-2">Neues Passwort</h1>
      <p className="text-[rgba(0,0,0,0.6)] text-sm mb-6">Wähle ein neues Passwort für dein Konto.</p>
      <form onSubmit={handleSetNewPassword} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#1d1d1f] mb-1.5">Neues Passwort</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)}
            required className="yprint-input" placeholder="Mindestens 8 Zeichen" />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#1d1d1f] mb-1.5">Passwort wiederholen</label>
          <input type="password" value={passwordConfirm} onChange={e => setPasswordConfirm(e.target.value)}
            required className="yprint-input" placeholder="••••••••" />
        </div>
        {error && <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}
        <button type="submit" disabled={loading} className="yprint-button yprint-button-primary w-full">
          {loading ? 'Wird gespeichert…' : 'Passwort speichern'}
        </button>
      </form>
    </div>
  )

  if (success) return (
    <div className="yprint-card text-center">
      <div className="w-16 h-16 bg-[#007aff]/10 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-[#007aff]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
        </svg>
      </div>
      <h2 className="text-xl font-bold text-[#1d1d1f] mb-2">E-Mail gesendet</h2>
      <p className="text-[rgba(0,0,0,0.6)] text-sm mb-6">
        Falls ein Konto mit dieser E-Mail existiert, erhältst du einen Link zum Zurücksetzen deines Passworts.
      </p>
      <Link href="/login" className="yprint-button yprint-button-secondary">Zurück zur Anmeldung</Link>
    </div>
  )

  return (
    <div className="yprint-card">
      <h1 className="text-2xl font-bold text-[#1d1d1f] mb-2">Passwort zurücksetzen</h1>
      <p className="text-[rgba(0,0,0,0.6)] text-sm mb-6">
        Gib deine E-Mail-Adresse ein. Wir senden dir einen Link zum Zurücksetzen.
      </p>
      <form onSubmit={handleRequestReset} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#1d1d1f] mb-1.5">E-Mail</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            required className="yprint-input" placeholder="deine@email.de" />
        </div>
        <button type="submit" disabled={loading} className="yprint-button yprint-button-primary w-full">
          {loading ? 'Wird gesendet…' : 'Link senden'}
        </button>
        <div className="text-center">
          <Link href="/login" className="text-sm text-[rgba(0,0,0,0.6)] hover:text-[#007aff] transition-colors">
            Zurück zur Anmeldung
          </Link>
        </div>
      </form>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="yprint-card h-48 animate-pulse" />}>
      <ResetPasswordContent />
    </Suspense>
  )
}
