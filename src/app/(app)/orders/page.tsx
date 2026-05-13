'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { Order } from '@/types'
import { formatDate, formatPrice } from '@/lib/utils'

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: 'Ausstehend', color: 'bg-yellow-100 text-yellow-800' },
  processing: { label: 'In Bearbeitung', color: 'bg-blue-100 text-blue-800' },
  completed: { label: 'Abgeschlossen', color: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Storniert', color: 'bg-red-100 text-red-800' },
  refunded: { label: 'Erstattet', color: 'bg-gray-100 text-gray-800' },
  failed: { label: 'Fehlgeschlagen', color: 'bg-red-100 text-red-800' },
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/orders')
      .then(r => r.json())
      .then(data => { if (data.success) setOrders(data.data) })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1d1d1f] mb-6">Bestellungen</h1>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="yprint-card animate-pulse h-24" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="yprint-card text-center py-16">
          <div className="w-16 h-16 bg-[#f5f5f7] rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-[rgba(0,0,0,0.3)]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-[#1d1d1f] mb-2">Noch keine Bestellungen</h2>
          <p className="text-[rgba(0,0,0,0.6)] text-sm mb-6">Deine Bestellungen erscheinen hier.</p>
          <Link href="/dashboard" className="yprint-button yprint-button-primary">
            Designs ansehen
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(order => {
            const status = STATUS_LABELS[order.status] || { label: order.status, color: 'bg-gray-100 text-gray-800' }
            return (
              <div key={order.id} className="yprint-card flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-semibold text-[#1d1d1f]">{order.order_number}</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${status.color}`}>
                      {status.label}
                    </span>
                  </div>
                  <p className="text-sm text-[rgba(0,0,0,0.6)]">{formatDate(order.created_at)}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-[#1d1d1f]">{formatPrice(order.total)}</p>
                  <Link
                    href={`/orders/${order.id}`}
                    className="text-xs text-[#007aff] hover:underline"
                  >
                    Details
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
