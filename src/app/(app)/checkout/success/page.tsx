'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useCartStore } from '@/store/cart'

function CheckoutSuccessContent() {
  const searchParams = useSearchParams()
  const clearCart = useCartStore(s => s.clearCart)
  const [orderNumber, setOrderNumber] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const paymentIntentId = searchParams.get('payment_intent')
    if (!paymentIntentId) { setLoading(false); return }

    let attempts = 0

    const poll = async () => {
      attempts++
      try {
        const data = await fetch(
          `/api/payments/stripe/verify-return?payment_intent_id=${paymentIntentId}`
        ).then(r => r.json())

        if (data.orderNumber) {
          setOrderNumber(data.orderNumber)
          clearCart()
          setLoading(false)
        } else if (attempts < 8) {
          setTimeout(poll, 800)
        } else {
          // Payment succeeded but webhook hasn't created the order yet — still show success
          clearCart()
          setLoading(false)
        }
      } catch {
        if (attempts < 8) {
          setTimeout(poll, 800)
        } else {
          clearCart()
          setLoading(false)
        }
      }
    }

    poll()
  }, [searchParams, clearCart])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin w-10 h-10 border-2 border-[#007aff] border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto text-center py-12">
      <div className="yprint-card">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-[#1d1d1f] mb-2">Bestellung aufgegeben!</h1>
        {orderNumber && (
          <p className="text-[rgba(0,0,0,0.6)] text-sm mb-2">
            Bestellnummer: <strong className="text-[#1d1d1f]">{orderNumber}</strong>
          </p>
        )}
        <p className="text-[rgba(0,0,0,0.6)] text-sm mb-8">
          Du erhältst eine Bestätigung per E-Mail. Dein Design wird jetzt gedruckt!
        </p>
        <div className="flex flex-col gap-3">
          <Link href="/orders" className="yprint-button yprint-button-primary">Bestellungen ansehen</Link>
          <Link href="/dashboard" className="yprint-button yprint-button-secondary">Zurück zu meinen Designs</Link>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin w-10 h-10 border-2 border-[#007aff] border-t-transparent rounded-full" />
      </div>
    }>
      <CheckoutSuccessContent />
    </Suspense>
  )
}
