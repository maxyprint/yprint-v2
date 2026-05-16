'use client'

import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { formatDate, formatPrice } from '@/lib/utils'

// ── Types ─────────────────────────────────────────────────────────────────────

interface PrintPosition {
  position: string
  width: number; height: number; unit: string
  offsetX: number; offsetY: number; offsetUnit: string
  referencePoint: string; resolution: number; colorProfile: string
  bleed: number; scaling: string; printQuality: string
  printFile: string
}
interface AkdOrderPosition {
  type: string; printMethod: string; manufacturer: string; series: string
  color: string; size: string; quantity: number
  printPositions: PrintPosition[]
}
interface AkdPayload {
  orderNumber: string; orderDate: string
  shipping: {
    recipient: { name: string; street: string; city: string; postalCode: string; country: string; company?: string }
    sender:    { name: string; street: string; city: string; postalCode: string; country: string }
  }
  orderPositions: AkdOrderPosition[]
}

interface DesignPng {
  view_id: string; view_name: string; public_url: string | null
  print_area_mm: { width: number; height: number } | null; save_type: string
}
interface OrderItem {
  id: string; design_id: string | null; template_id: string | null
  variation_id: string | null; size: string | null; quantity: number
  unit_price: number; total_price: number
  print_png_url: string | null; design_snapshot: unknown
}
interface Order {
  id: string; order_number: string; status: string; payment_status: string
  total: number; subtotal: number; shipping_cost: number; discount_amount: number
  created_at: string; shipping_address: Record<string, string> | null
  print_provider_sent_at: string | null; print_provider_response: unknown
  order_items: OrderItem[]; design_pngs: Record<string, DesignPng[]>
}

// ── Status badge colours ──────────────────────────────────────────────────────

const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800', processing: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800', cancelled: 'bg-red-100 text-red-800',
  refunded: 'bg-orange-100 text-orange-800',
}
const PAYMENT_COLOR: Record<string, string> = {
  paid: 'bg-green-100 text-green-800', unpaid: 'bg-red-100 text-red-800',
  refunded: 'bg-orange-100 text-orange-800',
}

// ── Preview modal ─────────────────────────────────────────────────────────────

function PreviewModal({ payload, onClose, onConfirm, sending }: {
  payload: AkdPayload; onClose: () => void; onConfirm: () => void; sending: boolean
}) {
  const r = payload.shipping.recipient
  const s = payload.shipping.sender
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(0,0,0,0.08)]">
          <div>
            <h2 className="font-semibold text-[#1d1d1f] text-lg">Vorschau: AKD-Übermittlung</h2>
            <p className="text-sm text-[rgba(0,0,0,0.5)]">Bestellung {payload.orderNumber}</p>
          </div>
          <button onClick={onClose} className="text-[rgba(0,0,0,0.4)] hover:text-[#1d1d1f] text-xl leading-none">✕</button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">

          {/* Versand */}
          <section>
            <h3 className="text-xs font-semibold text-[rgba(0,0,0,0.4)] uppercase tracking-wide mb-2">Versand</h3>
            <div className="grid grid-cols-2 gap-3">
              {[{ label: 'Empfänger', a: r }, { label: 'Absender', a: s }].map(({ label, a }) => (
                <div key={label} className="bg-[#f5f5f7] rounded-xl p-3">
                  <p className="text-xs font-medium text-[rgba(0,0,0,0.45)] mb-1">{label}</p>
                  {(a as Record<string, string>).company && <p className="text-sm font-medium">{(a as Record<string, string>).company}</p>}
                  <p className="text-sm">{a.name}</p>
                  <p className="text-sm">{a.street}</p>
                  <p className="text-sm">{a.postalCode} {a.city}</p>
                  <p className="text-sm text-[rgba(0,0,0,0.5)]">{a.country}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Bestellpositionen */}
          <section>
            <h3 className="text-xs font-semibold text-[rgba(0,0,0,0.4)] uppercase tracking-wide mb-2">
              Positionen ({payload.orderPositions.length})
            </h3>
            <div className="space-y-3">
              {payload.orderPositions.map((pos, i) => (
                <div key={i} className="border border-[rgba(0,0,0,0.08)] rounded-xl overflow-hidden">
                  {/* Item header */}
                  <div className="bg-[#f5f5f7] px-4 py-2.5 flex items-center gap-3 flex-wrap">
                    <span className="font-mono text-xs bg-[#1d1d1f] text-white px-2 py-0.5 rounded">{pos.type}</span>
                    <span className="text-sm font-medium">{pos.color} · {pos.size} · {pos.quantity}×</span>
                    <span className="text-xs text-[rgba(0,0,0,0.45)]">{pos.printMethod} · {pos.manufacturer} {pos.series}</span>
                  </div>
                  {/* Print positions */}
                  <div className="divide-y divide-[rgba(0,0,0,0.06)]">
                    {pos.printPositions.map((pp, j) => (
                      <div key={j} className="px-4 py-3 flex gap-4 items-start">
                        {/* Thumbnail */}
                        <div
                          className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border border-[rgba(0,0,0,0.06)]"
                          style={{ backgroundImage: 'repeating-conic-gradient(#e0e0e0 0% 25%,#fff 0% 50%) 0 0/12px 12px' }}
                        >
                          <img src={pp.printFile} alt="" className="w-full h-full object-contain" loading="lazy" />
                        </div>
                        {/* Metadata */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-[#1d1d1f] capitalize mb-1">{pp.position}</p>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs text-[rgba(0,0,0,0.6)]">
                            <span>Größe: <b>{pp.width} × {pp.height} {pp.unit}</b></span>
                            <span>Offset: <b>X {pp.offsetX} / Y {pp.offsetY} {pp.offsetUnit}</b></span>
                            <span>Bezug: <b>{pp.referencePoint}</b></span>
                            <span>Auflösung: <b>{pp.resolution} DPI</b></span>
                            <span>Farbraum: <b>{pp.colorProfile}</b></span>
                            <span>Beschnitt: <b>{pp.bleed} mm</b></span>
                            <span>Skalierung: <b>{pp.scaling}</b></span>
                            <span>Qualität: <b>{pp.printQuality}</b></span>
                          </div>
                          <a
                            href={pp.printFile} target="_blank" rel="noopener noreferrer"
                            className="text-xs text-[#007aff] hover:underline mt-1 inline-block truncate max-w-full"
                          >
                            {pp.printFile.split('/').pop()} ↗
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Raw JSON toggle */}
          <section>
            <details>
              <summary className="text-xs text-[rgba(0,0,0,0.4)] cursor-pointer hover:text-[#1d1d1f]">Raw JSON anzeigen</summary>
              <pre className="mt-2 text-xs bg-[#f5f5f7] rounded-xl p-3 overflow-auto max-h-64 text-[#1d1d1f] font-mono leading-relaxed">
                {JSON.stringify(payload, null, 2)}
              </pre>
            </details>
          </section>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[rgba(0,0,0,0.08)] flex items-center justify-between gap-3">
          <button onClick={onClose} className="text-sm px-4 py-2 rounded-lg border border-[rgba(0,0,0,0.12)] hover:bg-[#f5f5f7] transition-colors">
            Abbrechen
          </button>
          <button
            onClick={onConfirm}
            disabled={sending}
            className="text-sm px-5 py-2 rounded-lg bg-[#1d1d1f] text-white font-semibold hover:bg-black transition-colors disabled:opacity-50"
          >
            {sending ? 'Wird gesendet…' : '🖨 Jetzt an AllesKlarDruck senden'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [preview, setPreview] = useState<AkdPayload | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [statusUpdating, setStatusUpdating] = useState(false)

  useEffect(() => {
    fetch(`/api/admin/orders/${id}`)
      .then(r => r.json())
      .then(d => { if (d.success) setOrder(d.data) })
      .finally(() => setLoading(false))
  }, [id])

  const openPreview = async () => {
    setPreviewLoading(true)
    try {
      const res  = await fetch(`/api/admin/orders/${id}/print-provider`)
      const data = await res.json()
      if (data.success) setPreview(data.data)
      else alert(`Fehler beim Laden der Vorschau: ${data.error}`)
    } finally {
      setPreviewLoading(false)
    }
  }

  const confirmSend = async () => {
    setSending(true)
    try {
      const res  = await fetch(`/api/admin/orders/${id}/print-provider`, { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        setOrder(prev => prev ? { ...prev, print_provider_sent_at: new Date().toISOString(), print_provider_response: data.data, status: 'processing' } : prev)
        setPreview(null)
        alert('✅ Druckauftrag erfolgreich übermittelt.')
      } else {
        alert(`Fehler: ${data.error}`)
      }
    } finally {
      setSending(false)
    }
  }

  const updateStatus = async (newStatus: string) => {
    setStatusUpdating(true)
    try {
      const res  = await fetch(`/api/admin/orders/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: newStatus }) })
      const data = await res.json()
      if (data.success) setOrder(prev => prev ? { ...prev, status: newStatus } : prev)
    } finally {
      setStatusUpdating(false)
    }
  }

  if (loading) return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => <div key={i} className="yprint-card animate-pulse h-32" />)}
    </div>
  )

  if (!order) return (
    <div className="yprint-card text-center py-16">
      <p className="text-[rgba(0,0,0,0.6)]">Bestellung nicht gefunden.</p>
      <Link href="/admin/orders" className="text-[#007aff] text-sm mt-2 inline-block">← Zurück</Link>
    </div>
  )

  const addr = order.shipping_address

  return (
    <>
      {preview && (
        <PreviewModal
          payload={preview}
          onClose={() => setPreview(null)}
          onConfirm={confirmSend}
          sending={sending}
        />
      )}

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <Link href="/admin/orders" className="text-sm text-[#007aff] hover:underline mb-1 inline-block">← Alle Bestellungen</Link>
            <h1 className="text-2xl font-bold text-[#1d1d1f]">Bestellung {order.order_number}</h1>
            <p className="text-sm text-[rgba(0,0,0,0.5)] mt-0.5">{formatDate(order.created_at)}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-sm px-3 py-1 rounded-full font-medium ${STATUS_COLOR[order.status] || 'bg-gray-100 text-gray-600'}`}>{order.status}</span>
            <span className={`text-sm px-3 py-1 rounded-full font-medium ${PAYMENT_COLOR[order.payment_status] || 'bg-gray-100 text-gray-600'}`}>{order.payment_status}</span>
            {order.print_provider_sent_at && <span className="text-sm px-3 py-1 rounded-full font-medium bg-purple-100 text-purple-800">Gesendet an AKD</span>}
          </div>
        </div>

        {/* AKD Action banner */}
        <div className={`yprint-card border-2 ${order.print_provider_sent_at ? 'border-purple-200 bg-purple-50' : 'border-[#007aff]/30 bg-blue-50'}`}>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              {order.print_provider_sent_at ? (
                <>
                  <p className="font-semibold text-purple-900">Druckauftrag übermittelt</p>
                  <p className="text-sm text-purple-700 mt-0.5">{formatDate(order.print_provider_sent_at)}</p>
                  {order.print_provider_response && (
                    <details className="mt-2">
                      <summary className="text-xs text-purple-600 cursor-pointer">AKD-Antwort anzeigen</summary>
                      <pre className="text-xs bg-white rounded p-2 mt-1 overflow-auto max-h-40 text-gray-700">{JSON.stringify(order.print_provider_response, null, 2)}</pre>
                    </details>
                  )}
                </>
              ) : (
                <>
                  <p className="font-semibold text-[#1d1d1f]">Noch nicht an AllesKlarDruck gesendet</p>
                  <p className="text-sm text-[rgba(0,0,0,0.6)] mt-0.5">Vorschau prüfen, dann übermitteln.</p>
                </>
              )}
            </div>
            {!order.print_provider_sent_at && (
              <button
                onClick={openPreview}
                disabled={previewLoading}
                className="px-5 py-2.5 rounded-xl bg-[#1d1d1f] text-white font-semibold text-sm hover:bg-black transition-colors disabled:opacity-50 whitespace-nowrap"
              >
                {previewLoading ? 'Lade Vorschau…' : '🔍 Vorschau & Senden'}
              </button>
            )}
          </div>
        </div>

        {/* Shipping + financials */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addr && (
            <div className="yprint-card">
              <h2 className="font-semibold text-[#1d1d1f] mb-3">Lieferadresse</h2>
              <address className="not-italic text-sm text-[rgba(0,0,0,0.7)] leading-6">
                {addr.company && <div className="font-medium">{addr.company}</div>}
                <div>{[addr.first_name, addr.last_name].filter(Boolean).join(' ')}</div>
                <div>{[addr.street, addr.street_nr].filter(Boolean).join(' ')}</div>
                <div>{[addr.zip, addr.city].filter(Boolean).join(' ')}</div>
                <div>{addr.country || 'DE'}</div>
              </address>
            </div>
          )}
          <div className="yprint-card">
            <h2 className="font-semibold text-[#1d1d1f] mb-3">Bestellwert</h2>
            <dl className="space-y-1 text-sm">
              <div className="flex justify-between"><dt className="text-[rgba(0,0,0,0.5)]">Zwischensumme</dt><dd>{formatPrice(order.subtotal)}</dd></div>
              {order.discount_amount > 0 && <div className="flex justify-between text-green-700"><dt>Rabatt</dt><dd>−{formatPrice(order.discount_amount)}</dd></div>}
              <div className="flex justify-between"><dt className="text-[rgba(0,0,0,0.5)]">Versand</dt><dd>{formatPrice(order.shipping_cost)}</dd></div>
              <div className="flex justify-between font-semibold text-[15px] border-t border-[rgba(0,0,0,0.06)] pt-2 mt-1"><dt>Gesamt</dt><dd>{formatPrice(order.total)}</dd></div>
            </dl>
            <div className="mt-4 pt-3 border-t border-[rgba(0,0,0,0.06)]">
              <label className="text-xs font-medium text-[rgba(0,0,0,0.5)] block mb-1">Status ändern</label>
              <select
                value={order.status}
                onChange={e => updateStatus(e.target.value)}
                disabled={statusUpdating}
                className="w-full text-sm border border-[rgba(0,0,0,0.12)] rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#007aff]/30"
              >
                {['pending', 'processing', 'completed', 'cancelled', 'refunded'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Order items */}
        <div>
          <h2 className="font-semibold text-[#1d1d1f] mb-3">Bestellpositionen</h2>
          <div className="space-y-4">
            {order.order_items.map(item => {
              const pngs = item.design_id ? (order.design_pngs[item.design_id] ?? []) : []
              const printPngs = pngs.filter(p => p.save_type !== 'empty' && p.public_url)
              return (
                <div key={item.id} className="yprint-card">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <p className="font-medium text-[#1d1d1f]">{item.variation_id || '—'} · Größe {item.size || '—'}</p>
                      <p className="text-sm text-[rgba(0,0,0,0.5)] mt-0.5">{item.quantity}× · {formatPrice(item.unit_price)} = {formatPrice(item.total_price)}</p>
                      {item.template_id && <p className="text-xs text-[rgba(0,0,0,0.4)] mt-0.5">Template: {item.template_id}</p>}
                    </div>
                    {item.design_id && <p className="text-xs text-[rgba(0,0,0,0.4)] font-mono">Design: {item.design_id.slice(0, 8)}…</p>}
                  </div>
                  {printPngs.length > 0 ? (
                    <div>
                      <p className="text-xs font-medium text-[rgba(0,0,0,0.5)] mb-2">Print-Dateien ({printPngs.length} Views)</p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {printPngs.map(png => (
                          <div key={png.view_id} className="border border-[rgba(0,0,0,0.08)] rounded-xl overflow-hidden bg-[#f5f5f7]">
                            <div
                              className="h-28 flex items-center justify-center"
                              style={{ backgroundImage: 'repeating-conic-gradient(#e0e0e0 0% 25%,#fff 0% 50%) 0 0/16px 16px' }}
                            >
                              <img src={png.public_url!} alt={png.view_name} className="max-h-28 max-w-full object-contain" loading="lazy" />
                            </div>
                            <div className="px-2 py-1.5">
                              <p className="text-xs font-medium text-[#1d1d1f]">{png.view_name || png.view_id}</p>
                              {png.print_area_mm && <p className="text-xs text-[rgba(0,0,0,0.4)]">{png.print_area_mm.width.toFixed(0)} × {png.print_area_mm.height.toFixed(0)} mm</p>}
                              <a href={png.public_url!} target="_blank" rel="noopener noreferrer" className="text-xs text-[#007aff] hover:underline">Datei öffnen ↗</a>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-[rgba(0,0,0,0.4)] italic">
                      {item.design_id ? 'Keine Print-PNGs vorhanden.' : 'Kein Design verknüpft.'}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </>
  )
}
