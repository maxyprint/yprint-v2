'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function AdminSettingsPage() {
  const [shippingCents, setShippingCents] = useState<number>(500)
  const [freeAboveCents, setFreeAboveCents] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(r => r.json())
      .then(data => {
        if (data.success && data.data.shipping) {
          const s = data.data.shipping as { standard_cents: number; free_above_cents: number | null }
          setShippingCents(s.standard_cents ?? 500)
          setFreeAboveCents(s.free_above_cents ?? null)
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        key: 'shipping',
        value: { standard_cents: shippingCents, free_above_cents: freeAboveCents },
      }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-[#1d1d1f] mb-1">Einstellungen</h1>
      <p className="text-sm text-[rgba(0,0,0,0.4)] mb-8">Globale Shop-Konfiguration</p>

      {loading ? (
        <div className="yprint-card animate-pulse h-40" />
      ) : (
        <div className="space-y-6">

          {/* Shipping */}
          <div className="yprint-card">
            <h2 className="font-semibold text-[#1d1d1f] mb-1">Versandkosten</h2>
            <p className="text-sm text-[rgba(0,0,0,0.5)] mb-4">
              Wird beim Checkout und bei der Stripe-Zahlung verwendet.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#1d1d1f] mb-1">
                  Standardversand (Cent)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    step={10}
                    value={shippingCents}
                    onChange={e => setShippingCents(Number(e.target.value))}
                    className="yprint-input pr-10"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[rgba(0,0,0,0.4)]">
                    ct
                  </span>
                </div>
                <p className="text-xs text-[rgba(0,0,0,0.4)] mt-1">
                  = {(shippingCents / 100).toFixed(2)} €
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1d1d1f] mb-1">
                  Kostenlos ab (Cent, leer = nie)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    step={100}
                    value={freeAboveCents ?? ''}
                    placeholder="—"
                    onChange={e => setFreeAboveCents(e.target.value === '' ? null : Number(e.target.value))}
                    className="yprint-input pr-10"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[rgba(0,0,0,0.4)]">
                    ct
                  </span>
                </div>
                {freeAboveCents != null && (
                  <p className="text-xs text-[rgba(0,0,0,0.4)] mt-1">
                    = ab {(freeAboveCents / 100).toFixed(2)} € kostenlos
                  </p>
                )}
              </div>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="yprint-button yprint-button-primary"
              >
                {saving ? 'Wird gespeichert…' : 'Speichern'}
              </button>
              {saved && <span className="text-sm text-green-600 font-medium">✓ Gespeichert</span>}
            </div>
          </div>

          {/* Colors / Template link */}
          <div className="yprint-card">
            <h2 className="font-semibold text-[#1d1d1f] mb-1">Farben & Variationen</h2>
            <p className="text-sm text-[rgba(0,0,0,0.5)] mb-4">
              Farben, Varianten und Produktbilder werden pro Template verwaltet.
            </p>
            <Link
              href="/admin/templates"
              className="yprint-button yprint-button-secondary inline-flex items-center gap-2"
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
              Templates & Farben bearbeiten
            </Link>
          </div>

        </div>
      )}
    </div>
  )
}
