'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { formatDate, formatPrice } from '@/lib/utils'

interface AdminOrder {
  id: string
  order_number: string
  status: string
  payment_status: string
  total: number
  created_at: string
  user_id: string
  print_provider_sent_at: string | null
}

const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  failed: 'bg-red-100 text-red-800',
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetch(`/api/admin/orders${filter !== 'all' ? `?status=${filter}` : ''}`)
      .then(r => r.json())
      .then(data => { if (data.success) setOrders(data.data) })
      .finally(() => setLoading(false))
  }, [filter])

  const sendToPrintProvider = async (orderId: string) => {
    if (!confirm('Druckauftrag an AllesKlarDruck senden?')) return
    const res = await fetch(`/api/admin/orders/${orderId}/print-provider`, { method: 'POST' })
    const data = await res.json()
    if (data.success) {
      alert('Druckauftrag erfolgreich gesendet.')
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, print_provider_sent_at: new Date().toISOString() } : o))
    } else {
      alert(`Fehler: ${data.error}`)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1d1d1f] mb-6">Bestellungen</h1>

      <div className="flex gap-2 mb-4 flex-wrap">
        {['all', 'pending', 'processing', 'completed', 'cancelled'].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === s ? 'bg-[#007aff] text-white' : 'bg-white text-[rgba(0,0,0,0.6)] border border-[rgba(0,0,0,0.08)] hover:bg-[#f5f5f7]'}`}
          >
            {s === 'all' ? 'Alle' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="yprint-card animate-pulse h-20" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {orders.map(order => (
            <div key={order.id} className="yprint-card flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-[#1d1d1f]">{order.order_number}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLOR[order.status] || 'bg-gray-100 text-gray-600'}`}>
                    {order.status}
                  </span>
                  {order.print_provider_sent_at && (
                    <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">Gesendet</span>
                  )}
                </div>
                <p className="text-sm text-[rgba(0,0,0,0.5)]">
                  {formatDate(order.created_at)} · {formatPrice(order.total)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {order.status === 'processing' && !order.print_provider_sent_at && (
                  <button
                    onClick={() => sendToPrintProvider(order.id)}
                    className="text-xs px-3 py-1.5 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors"
                  >
                    An Drucker senden
                  </button>
                )}
                <Link
                  href={`/admin/orders/${order.id}`}
                  className="text-xs px-3 py-1.5 rounded-lg border border-[rgba(0,0,0,0.08)] hover:bg-[#f5f5f7] transition-colors"
                >
                  Details
                </Link>
              </div>
            </div>
          ))}
          {orders.length === 0 && (
            <div className="yprint-card text-center py-10">
              <p className="text-[rgba(0,0,0,0.6)]">Keine Bestellungen gefunden.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
