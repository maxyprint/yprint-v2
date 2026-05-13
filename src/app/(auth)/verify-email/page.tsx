'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const tokenHash = searchParams.get('token_hash') || searchParams.get('token')
    if (!tokenHash) {
      setStatus('error')
      setError('Ungültiger Bestätigungslink.')
      return
    }

    fetch('/api/auth/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tokenHash }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setStatus('error')
          setError(data.error)
        } else {
          setStatus('success')
          setTimeout(() => router.push('/login?verified=1'), 2000)
        }
      })
      .catch(() => {
        setStatus('error')
        setError('Ein Fehler ist aufgetreten.')
      })
  }, [searchParams, router])

  if (status === 'verifying') {
    return (
      <div className="yprint-card text-center">
        <div className="animate-spin w-10 h-10 border-2 border-[#007aff] border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-[rgba(0,0,0,0.6)]">E-Mail wird bestätigt…</p>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="yprint-card text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-[#1d1d1f] mb-2">E-Mail bestätigt!</h2>
        <p className="text-[rgba(0,0,0,0.6)] text-sm">Du wirst zur Anmeldung weitergeleitet…</p>
      </div>
    )
  }

  return (
    <div className="yprint-card text-center">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
        </svg>
      </div>
      <h2 className="text-xl font-bold text-[#1d1d1f] mb-2">Bestätigung fehlgeschlagen</h2>
      <p className="text-[rgba(0,0,0,0.6)] text-sm mb-6">{error}</p>
      <Link href="/login" className="yprint-button yprint-button-primary">
        Zur Anmeldung
      </Link>
    </div>
  )
}
