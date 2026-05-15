'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Order } from '@/types'
import { formatDate, formatPrice } from '@/lib/utils'

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: 'Ausstehend', color: 'bg-yellow-100 text-yellow-800' },
  processing: { label: 'In Bearbeitung', color: 'bg-blue-100 text-blue-800' },
  shipped: { label: 'Versendet', color: 'bg-indigo-100 text-indigo-800' },
  completed: { label: 'Abgeschlossen', color: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Storniert', color: 'bg-red-100 text-red-800' },
  refunded: { label: 'Erstattet', color: 'bg-gray-100 text-gray-800' },
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    fetch(`/api/orders/${id}`)
      .then(r => r.json())
      .then(data => {
        if (data.success) setOrder(data.data)
        else setNotFound(true)
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin w-10 h-10 border-2 border-[#007aff] border-t-transparent rounded-full" />
      </div>
    )
  }

  if (notFound || !order) {
    return (
      <div className="max-w-lg mx-auto text-center py-12">
        <div className="yprint-card">
          <p className="text-[rgba(0,0,0,0.6)] mb-4">Bestellung nicht gefunden.</p>
          <Link href="/orders" className="yprint-button yprint-button-secondary">Zu den Bestellungen</Link>
        </div>
      </div>
    )
  }

  const status = STATUS_LABELS[order.status] || { label: order.status, color: 'bg-gray-100 text-gray-800' }
  const addr = order.shipping_address
  const discountAmount = (order as unknown as Record<string, number>).discount_amount ?? 0
  const shippingCost = (order as unknown as Record<string, number>).shipping_cost ?? 0

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.push('/orders')}
          className="text-[#007aff] text-sm hover:underline flex items-center gap-1"
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Alle Bestellungen
        </button>
      </div>

      {/* Header */}
      <div className="yprint-card mb-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-[#1d1d1f]">{order.order_number}</h1>
            <p className="text-sm text-[rgba(0,0,0,0.5)] mt-1">{formatDate(order.created_at)}</p>
          </div>
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${status.color}`}>
            {status.label}
          </span>
        </div>
      </div>

      {/* Items */}
      <div className="yprint-card mb-4">
        <h2 className="font-semibold text-[#1d1d1f] mb-3">Artikel</h2>
        <div className="space-y-3">
          {order.items?.map(item => (
            <div key={item.id} className="flex justify-between items-start text-sm">
              <div>
                <p className="font-medium text-[#1d1d1f]">Design</p>
                {item.size && <p className="text-[rgba(0,0,0,0.5)]">Größe {item.size} · {item.quantity}×</p>}
              </div>
              <span className="font-medium text-[#1d1d1f]">{formatPrice(item.total_price)}</span>
            </div>
          ))}
        </div>

        <div className="border-t border-[rgba(0,0,0,0.08)] mt-4 pt-3 space-y-1.5">
          <div className="flex justify-between text-sm text-[rgba(0,0,0,0.6)]">
            <span>Zwischensumme</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Rabatt {order.coupon_code ? `(${order.coupon_code})` : ''}</span>
              <span>−{formatPrice(discountAmount)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm text-[rgba(0,0,0,0.6)]">
            <span>Versand</span>
            <span>{shippingCost === 0 ? 'Kostenlos' : formatPrice(shippingCost)}</span>
          </div>
          <div className="flex justify-between font-semibold text-[#1d1d1f] pt-2 border-t border-[rgba(0,0,0,0.08)]">
            <span>Gesamt</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>
      </div>

      {/* Shipping address */}
      {addr && (
        <div className="yprint-card">
          <h2 className="font-semibold text-[#1d1d1f] mb-3">Lieferadresse</h2>
          <div className="text-sm text-[rgba(0,0,0,0.7)] space-y-0.5">
            <p className="font-medium text-[#1d1d1f]">{addr.first_name} {addr.last_name}</p>
            {addr.company && <p>{addr.company}</p>}
            <p>{addr.street} {addr.street_nr}</p>
            <p>{addr.zip} {addr.city}</p>
            {addr.country && <p>{addr.country}</p>}
          </div>
        </div>
      )}
    </div>
  )
}
