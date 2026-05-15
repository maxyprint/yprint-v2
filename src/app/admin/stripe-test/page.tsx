'use client'

import { useState } from 'react'

type Result = { ok: boolean; value?: string; error?: string }
type Results = Record<string, Result>

const LABELS: Record<string, string> = {
  secret_key_present: 'STRIPE_SECRET_KEY vorhanden',
  secret_key_format: 'STRIPE_SECRET_KEY Format',
  publishable_key_present: 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY vorhanden',
  publishable_key_format: 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY Format',
  webhook_secret_present: 'STRIPE_WEBHOOK_SECRET vorhanden',
  webhook_secret_format: 'STRIPE_WEBHOOK_SECRET Format',
  stripe_api_connection: 'Stripe API Verbindung',
  webhook_endpoints: 'Registrierte Webhook-Endpoints',
  payment_intent_create: 'PaymentIntent erstellen/stornieren',
  webhook_signature_verify: 'Webhook-Signatur Verifikation',
}

export default function StripeTestPage() {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<{ allOk: boolean; results: Results } | null>(null)
  const [fetchError, setFetchError] = useState<string | null>(null)

  const runTests = async () => {
    setLoading(true)
    setFetchError(null)
    try {
      const res = await fetch('/api/admin/stripe-test')
      if (!res.ok) {
        const err = await res.json()
        setFetchError(err.error || `HTTP ${res.status}`)
        return
      }
      const json = await res.json()
      setData(json)
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : 'Unbekannter Fehler')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold text-[#1d1d1f] mb-2">Stripe Debug</h1>
      <p className="text-sm text-[rgba(0,0,0,0.5)] mb-6">Prüft alle Stripe-Verbindungen live gegen die aktuellen Env-Vars.</p>

      <button
        onClick={runTests}
        disabled={loading}
        className="yprint-button yprint-button-primary mb-6"
      >
        {loading ? 'Teste…' : 'Tests ausführen'}
      </button>

      {fetchError && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm mb-4">
          {fetchError}
        </div>
      )}

      {data && (
        <div className="space-y-2">
          <div className={`p-3 rounded-lg text-sm font-semibold mb-4 ${data.allOk ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {data.allOk ? '✅ Alles OK — Stripe ist korrekt konfiguriert' : '❌ Probleme gefunden — Details unten'}
          </div>

          {Object.entries(data.results).map(([key, result]) => (
            <div
              key={key}
              className={`p-3 rounded-lg border text-sm ${result.ok ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}
            >
              <div className="flex items-start gap-2">
                <span className="text-base leading-none mt-0.5">{result.ok ? '✅' : '❌'}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[#1d1d1f]">{LABELS[key] || key}</p>
                  {result.value && (
                    <p className={`mt-0.5 font-mono text-xs break-all ${result.ok ? 'text-green-700' : 'text-orange-700'}`}>
                      {result.value}
                    </p>
                  )}
                  {result.error && (
                    <p className="mt-0.5 font-mono text-xs break-all text-red-700">{result.error}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
