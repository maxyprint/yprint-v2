'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { useCartStore } from '@/store/cart'
import { useAuthStore } from '@/store/auth'
import { formatPrice } from '@/lib/utils'
import type { UserAddress } from '@/types'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

function CheckoutForm({ clientSecret, onSuccess }: { clientSecret: string; onSuccess: () => void }) {
  const stripe = useStripe()
  const elements = useElements()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return
    setError(null)
    setLoading(true)
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: `${window.location.origin}/checkout/success` },
    })
    if (error) {
      setError(error.message || 'Zahlung fehlgeschlagen.')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
      )}
      <button type="submit" disabled={loading || !stripe} className="yprint-button yprint-button-primary w-full">
        {loading ? 'Wird verarbeitet…' : 'Jetzt bezahlen'}
      </button>
    </form>
  )
}

export default function CheckoutPage() {
  const router = useRouter()
  const { items, total, couponCode } = useCartStore()
  const { user } = useAuthStore()
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [addresses, setAddresses] = useState<UserAddress[]>([])
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const cartTotal = total()
  const shipping = cartTotal > 0 ? 5 : 0
  const orderTotal = cartTotal + shipping

  useEffect(() => {
    if (items.length === 0) {
      router.push('/dashboard')
      return
    }

    Promise.all([
      fetch('/api/users/addresses').then(r => r.json()),
      fetch('/api/payments/stripe/intent', { method: 'POST' }).then(r => r.json()),
    ]).then(([addrData, intentData]) => {
      if (addrData.success) {
        setAddresses(addrData.data)
        const def = addrData.data.find((a: UserAddress) => a.is_default)
        if (def) setSelectedAddress(def.id)
      }
      if (intentData.clientSecret) setClientSecret(intentData.clientSecret)
    }).finally(() => setLoading(false))
  }, [items.length, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin w-10 h-10 border-2 border-[#007aff] border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-[#1d1d1f] mb-6">Checkout</h1>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: Address + Payment */}
        <div className="lg:col-span-3 space-y-6">
          {/* Shipping Address */}
          <div className="yprint-card">
            <h2 className="font-semibold text-[#1d1d1f] mb-4">Lieferadresse</h2>
            {addresses.length > 0 ? (
              <div className="space-y-2">
                {addresses.map(addr => (
                  <label key={addr.id} className="flex items-start gap-3 p-3 rounded-lg border border-[rgba(0,0,0,0.08)] cursor-pointer hover:border-[#007aff] transition-colors">
                    <input
                      type="radio"
                      name="address"
                      value={addr.id}
                      checked={selectedAddress === addr.id}
                      onChange={() => setSelectedAddress(addr.id)}
                      className="mt-0.5"
                    />
                    <div className="text-sm">
                      <p className="font-medium text-[#1d1d1f]">{addr.first_name} {addr.last_name}</p>
                      <p className="text-[rgba(0,0,0,0.6)]">{addr.street} {addr.street_nr}</p>
                      <p className="text-[rgba(0,0,0,0.6)]">{addr.zip} {addr.city}</p>
                    </div>
                  </label>
                ))}
                <a href="/settings/addresses" className="text-sm text-[#007aff] hover:underline block mt-2">
                  + Neue Adresse hinzufügen
                </a>
              </div>
            ) : (
              <div>
                <p className="text-sm text-[rgba(0,0,0,0.6)] mb-3">Keine Adressen gespeichert.</p>
                <a href="/settings/addresses" className="text-sm text-[#007aff] hover:underline">
                  Adresse hinzufügen
                </a>
              </div>
            )}
          </div>

          {/* Payment */}
          {clientSecret && (
            <div className="yprint-card">
              <h2 className="font-semibold text-[#1d1d1f] mb-4">Zahlung</h2>
              <Elements stripe={stripePromise} options={{ clientSecret, locale: 'de' }}>
                <CheckoutForm
                  clientSecret={clientSecret}
                  onSuccess={() => router.push('/checkout/success')}
                />
              </Elements>
            </div>
          )}
        </div>

        {/* Right: Order Summary */}
        <div className="lg:col-span-2">
          <div className="yprint-card sticky top-24">
            <h2 className="font-semibold text-[#1d1d1f] mb-4">Bestellübersicht</h2>
            <div className="space-y-3 mb-4">
              {items.map(item => (
                <div key={`${item.design_id}-${item.variation_id}-${item.size}`} className="flex justify-between text-sm">
                  <div>
                    <p className="font-medium text-[#1d1d1f]">{item.design_name || 'Design'}</p>
                    <p className="text-[rgba(0,0,0,0.5)]">Größe {item.size} · {item.quantity}×</p>
                  </div>
                  <span className="font-medium">{formatPrice(item.unit_price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-[rgba(0,0,0,0.08)] pt-3 space-y-2">
              <div className="flex justify-between text-sm text-[rgba(0,0,0,0.6)]">
                <span>Zwischensumme</span>
                <span>{formatPrice(cartTotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-[rgba(0,0,0,0.6)]">
                <span>Versand</span>
                <span>{formatPrice(shipping)}</span>
              </div>
              <div className="flex justify-between font-semibold text-[#1d1d1f] pt-2 border-t border-[rgba(0,0,0,0.08)]">
                <span>Gesamt</span>
                <span>{formatPrice(orderTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
