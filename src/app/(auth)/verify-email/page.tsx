'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function VerifyEmailPage() {
  const router = useRouter()
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Supabase sends tokens as URL hash fragment: #access_token=...&refresh_token=...&type=signup
    const hash = window.location.hash.substring(1) // strip leading #
    if (!hash) {
      setStatus('error')
      setError('Ungültiger Bestätigungslink.')
      return
    }

    const params = new URLSearchParams(hash)
    const type = params.get('type')
    const accessToken = params.get('access_token')
    const refreshToken = params.get('refresh_token')

    if ((type !== 'signup' && type !== 'magiclink') || !accessToken || !refreshToken) {
      setStatus('error')
      setError('Ungültiger oder abgelaufener Bestätigungslink.')
      return
    }

    const supabase = createClient()
    supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
      .then(({ error: sessionError }) => {
        if (sessionError) {
          setStatus('error')
          setError('Bestätigung fehlgeschlagen. Der Link ist möglicherweise abgelaufen.')
        } else {
          setStatus('success')
          setTimeout(() => router.push('/dashboard'), 2000)
        }
      })
  }, [router])

  if (status === 'verifying') return (
    <div style={cardStyle}>
      <div style={{ width: 40, height: 40, border: '3px solid #0079FF', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <p style={{ color: '#6b7280', margin: 0 }}>E-Mail wird bestätigt…</p>
    </div>
  )

  if (status === 'success') return (
    <div style={{ ...cardStyle, textAlign: 'center' }}>
      <div style={{ width: 64, height: 64, background: '#f0fdf4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
        <svg width="32" height="32" fill="none" stroke="#16a34a" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
        </svg>
      </div>
      <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', margin: '0 0 8px 0' }}>E-Mail bestätigt!</h2>
      <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>Du wirst zur Anmeldung weitergeleitet…</p>
    </div>
  )

  return (
    <div style={{ ...cardStyle, textAlign: 'center' }}>
      <div style={{ width: 64, height: 64, background: '#fef2f2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
        <svg width="32" height="32" fill="none" stroke="#dc2626" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
        </svg>
      </div>
      <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', margin: '0 0 8px 0' }}>Bestätigung fehlgeschlagen</h2>
      <p style={{ color: '#6b7280', fontSize: '14px', margin: '0 0 24px 0' }}>{error}</p>
      <Link href="/login" className="yprint-button yprint-button-primary" style={{ textDecoration: 'none' }}>
        Zur Anmeldung
      </Link>
    </div>
  )
}

const cardStyle: React.CSSProperties = {
  background: '#ffffff',
  borderRadius: '30px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
  border: '1px solid #e5e7eb',
  padding: '40px',
  width: '100%',
  maxWidth: '420px',
  boxSizing: 'border-box',
  textAlign: 'center',
  fontFamily: "'Inter', 'Roboto', sans-serif",
}
