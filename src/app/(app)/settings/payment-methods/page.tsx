'use client'

import { useState, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import type { PaymentMethod } from '@/types'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

function AddPaymentForm({ onSuccess }: { onSuccess: () => void }) {
  const stripe = useStripe()
  const elements = useElements()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return
    setError(null)
    setLoading(true)
    const { error } = await stripe.confirmSetup({
      elements,
      confirmParams: { return_url: `${window.location.origin}/settings/payment-methods` },
    })
    if (error) {
      setError(error.message || 'Fehler beim Hinzufügen.')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      {error && <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}
      <div className="flex gap-3">
        <button type="submit" disabled={loading || !stripe} className="yprint-button yprint-button-primary">
          {loading ? 'Wird gespeichert…' : 'Zahlungsmethode speichern'}
        </button>
        <button type="button" onClick={onSuccess} className="yprint-button yprint-button-secondary">
          Abbrechen
        </button>
      </div>
    </form>
  )
}

const METHOD_LABELS: Record<string, string> = {
  card: 'Kreditkarte',
  sepa: 'SEPA-Lastschrift',
  paypal: 'PayPal',
}

export default function PaymentMethodsPage() {
  const [methods, setMethods] = useState<PaymentMethod[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [setupSecret, setSetupSecret] = useState<string | null>(null)

  const load = () => {
    fetch('/api/payments/methods')
      .then(r => r.json())
      .then(data => { if (data.success) setMethods(data.data) })
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleAddClick = async () => {
    const res = await fetch('/api/payments/stripe/setup-intent', { method: 'POST' })
    const data = await res.json()
    setSetupSecret(data.clientSecret)
    setShowAdd(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Zahlungsmethode entfernen?')) return
    await fetch(`/api/payments/methods/${id}`, { method: 'DELETE' })
    load()
  }

  const handleSetDefault = async (id: string) => {
    await fetch(`/api/payments/methods/${id}/default`, { method: 'PUT' })
    load()
  }

  return (
    <div className="max-w-xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#1d1d1f]">Zahlungsmethoden</h1>
        {!showAdd && (
          <button onClick={handleAddClick} className="yprint-button yprint-button-primary">
            + Hinzufügen
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="yprint-card animate-pulse h-20" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {methods.map(method => {
            const info = method.method_data as any
            return (
              <div key={method.id} className="yprint-card flex items-center justify-between">
                <div className="text-sm">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-medium text-[#1d1d1f]">
                      {METHOD_LABELS[method.method_type] || method.method_type}
                    </span>
                    {method.is_default && (
                      <span className="text-xs bg-[#007aff]/10 text-[#007aff] px-2 py-0.5 rounded-full">Standard</span>
                    )}
                  </div>
                  {info.last4 && (
                    <span className="text-[rgba(0,0,0,0.5)]">
                      {info.brand} ····{info.last4}
                      {info.exp_month && ` · ${info.exp_month}/${info.exp_year}`}
                    </span>
                  )}
                  {info.iban_last4 && (
                    <span className="text-[rgba(0,0,0,0.5)]">
                      {info.bank_name} ····{info.iban_last4}
                    </span>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1">
                  {!method.is_default && (
                    <button onClick={() => handleSetDefault(method.id)} className="text-xs text-[#007aff] hover:underline">
                      Als Standard
                    </button>
                  )}
                  <button onClick={() => handleDelete(method.id)} className="text-xs text-red-500 hover:underline">
                    Entfernen
                  </button>
                </div>
              </div>
            )
          })}
          {methods.length === 0 && !showAdd && (
            <div className="yprint-card text-center py-10">
              <p className="text-sm text-[rgba(0,0,0,0.6)] mb-4">Keine Zahlungsmethoden gespeichert.</p>
              <button onClick={handleAddClick} className="yprint-button yprint-button-primary">
                Zahlungsmethode hinzufügen
              </button>
            </div>
          )}
        </div>
      )}

      {showAdd && setupSecret && (
        <div className="yprint-card mt-4">
          <h2 className="font-semibold text-[#1d1d1f] mb-4">Neue Zahlungsmethode</h2>
          <Elements stripe={stripePromise} options={{ clientSecret: setupSecret, locale: 'de' }}>
            <AddPaymentForm onSuccess={() => { setShowAdd(false); load() }} />
          </Elements>
        </div>
      )}
    </div>
  )
}
