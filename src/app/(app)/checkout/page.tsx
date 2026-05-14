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

function CheckoutForm({ clientSecret }: { clientSecret: string }) {
  const stripe = useStripe()
  const elements = useElements()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return
    setError(null)
    setLoading(true)
    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: `${window.location.origin}/checkout/success` },
    })
    if (stripeError) {
      setError(stripeError.message || 'Zahlung fehlgeschlagen.')
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
  const [initError, setInitError] = useState<string | null>(null)

  const cartTotal = total()
  const shipping = cartTotal > 0 ? 5 : 0
  const orderTotal = cartTotal + shipping

  useEffect(() => {
    if (items.length === 0) {
      router.push('/dashboard')
      return
    }

    async function init() {
      try {
        // Step 1: sync cart to Supabase to get a session id
        const cartRes = await fetch('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: items.map(i => ({
              design_id: i.design_id,
              template_id: i.template_id,
              variation_id: i.variation_id,
              size: i.size,
              quantity: i.quantity,
              unit_price: i.unit_price,
              design_name: i.design_name,
            })),
            coupon_code: couponCode || null,
          }),
        })
        const cartData = await cartRes.json()
        const cartSessionId = cartData.data?.id
        if (!cartSessionId) throw new Error('Warenkorb konnte nicht gespeichert werden.')

        // Step 2: load addresses and create payment intent in parallel
        const [addrRes, intentRes] = await Promise.all([
          fetch('/api/users/addresses').then(r => r.json()),
          fetch('/api/payments/stripe/intent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cart_session_id: cartSessionId }),
          }).then(r => r.json()),
        ])

        if (addrRes.success) {
          setAddresses(addrRes.data)
          const def = addrRes.data.find((a: UserAddress) => a.is_default)
          if (def) setSelectedAddress(def.id)
        }

        if (intentRes.client_secret) {
          setClientSecret(intentRes.client_secret)
        } else {
          throw new Error(intentRes.error || 'Payment Intent konnte nicht erstellt werden.')
        }
      } catch (err: unknown) {
        setInitError(err instanceof Error ? err.message : 'Fehler beim Laden des Checkouts.')
      } finally {
        setLoading(false)
      }
    }

    init()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin w-10 h-10 border-2 border-[#007aff] border-t-transparent rounded-full" />
      </div>
    )
  }

  if (initError) {
    return (
      <div className="max-w-md mx-auto text-center py-12">
        <div className="yprint-card">
          <p className="text-red-600 mb-4">{initError}</p>
          <button onClick={() => router.push('/dashboard')} className="yprint-button yprint-button-secondary">
            Zurück
          </button>
        </div>
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
                <CheckoutForm clientSecret={clientSecret} />
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
                <span>{shipping === 0 ? 'Kostenlos' : formatPrice(shipping)}</span>
              </div>
              <div className="flex justify-between font-semibold text-[#1d1d1f] pt-2 border-t border-[rgba(0,0,0,0.08)]">
                <span>Gesamt</span>
                <span>{formatPrice(orderTotal)}</span>
              </div>
            </div>
            {couponCode && (
              <p className="text-xs text-green-600 mt-2">Gutschein: {couponCode}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
