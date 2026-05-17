'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuthStore } from '@/store/auth'
import { useCartStore } from '@/store/cart'
import type { UserDesign, DesignTemplate } from '@/types'
import { formatDate, formatPrice } from '@/lib/utils'

type PrintZone = { left: number; top: number; width: number; height: number }

// UserDesign as returned by /api/designs (partial + enriched fields)
type DesignListItem = Pick<UserDesign, 'id' | 'name' | 'product_name' | 'product_images' | 'template_id' | 'created_at' | 'updated_at'> & {
  design_png:  string | null  // print PNG for overlay
  shirt_image: string | null  // base shirt photo from template
  print_zone:  PrintZone | null  // printZone percentages for positioning overlay
}

// ── Order Modal ───────────────────────────────────────────────────────────────

function OrderModal({ design, onClose }: { design: DesignListItem; onClose: () => void }) {
  const addItem = useCartStore(s => s.addItem)
  const [template, setTemplate] = useState<DesignTemplate | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedVar, setSelectedVar] = useState('')
  const [added, setAdded] = useState(false)

  useEffect(() => {
    if (!design.template_id) { setLoading(false); return }
    fetch(`/api/templates/${design.template_id}`)
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          const t: DesignTemplate = data.data
          setTemplate(t)
          const firstSize = t.sizes?.[0]?.name || ''
          const defaultVar = Object.entries(t.variations || {}).find(([, v]) => v.is_default)?.[0]
            || Object.keys(t.variations || {})[0] || ''
          setSelectedSize(firstSize)
          setSelectedVar(defaultVar)
        }
      })
      .finally(() => setLoading(false))
  }, [design.template_id])

  const unitPrice = template
    ? (template.pricing?.[selectedSize]?.base ?? template.base_price ?? 0)
    : 0

  const variation = template?.variations?.[selectedVar]

  const handleAdd = () => {
    if (!template || !selectedSize || !selectedVar) return
    addItem({
      design_id: design.id,
      design_name: design.name,
      template_id: design.template_id!,
      template_name: template.name,
      variation_id: selectedVar,
      variation_name: variation?.name || '',
      size: selectedSize,
      quantity: 1,
      unit_price: unitPrice,
    })
    setAdded(true)
    setTimeout(onClose, 800)
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
      onClick={onClose}
    >
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }} />
      <div
        style={{ position: 'relative', background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '400px', boxShadow: '0 20px 60px rgba(0,0,0,0.25)', overflow: 'hidden' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
          <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#111827' }}>Design bestellen</h2>
          <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#6b7280' }}>{design.name}</p>
        </div>

        <div style={{ padding: '20px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '24px 0', color: '#9ca3af', fontSize: '14px' }}>Lädt…</div>
          ) : !template ? (
            <p style={{ fontSize: '13px', color: '#ef4444', margin: 0 }}>Template nicht gefunden.</p>
          ) : (
            <>
              {/* Size picker */}
              <div style={{ marginBottom: '16px' }}>
                <p style={{ fontSize: '12px', fontWeight: 600, color: '#374151', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Größe</p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {template.sizes.map(sz => (
                    <button
                      key={sz.id}
                      onClick={() => setSelectedSize(sz.name)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '8px',
                        border: selectedSize === sz.name ? '2px solid #0079FF' : '1px solid #d1d5db',
                        background: selectedSize === sz.name ? 'rgba(0,121,255,0.08)' : '#fff',
                        color: selectedSize === sz.name ? '#0079FF' : '#374151',
                        fontSize: '13px',
                        fontWeight: selectedSize === sz.name ? 700 : 400,
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        transition: 'all 0.15s',
                      }}
                    >
                      {sz.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Variation picker */}
              {Object.keys(template.variations).length > 1 && (
                <div style={{ marginBottom: '20px' }}>
                  <p style={{ fontSize: '12px', fontWeight: 600, color: '#374151', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Farbe</p>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {Object.entries(template.variations).map(([key, v]) => (
                      <button
                        key={key}
                        onClick={() => setSelectedVar(key)}
                        title={v.name}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          border: selectedVar === key ? '3px solid #0079FF' : '2px solid #d1d5db',
                          background: v.color || '#e5e7eb',
                          cursor: 'pointer',
                          outline: selectedVar === key ? '2px solid rgba(0,121,255,0.3)' : 'none',
                          outlineOffset: '2px',
                          transition: 'all 0.15s',
                          padding: 0,
                        }}
                      />
                    ))}
                  </div>
                  {variation && (
                    <p style={{ fontSize: '12px', color: '#6b7280', margin: '6px 0 0' }}>{variation.name}</p>
                  )}
                </div>
              )}

              {/* Price */}
              <div style={{ marginBottom: '20px', padding: '12px 16px', background: '#f9fafb', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: '#6b7280' }}>Preis pro Stück</span>
                <span style={{ fontSize: '18px', fontWeight: 700, color: '#111827' }}>{formatPrice(unitPrice)}</span>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={onClose}
                  style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #d1d5db', background: '#fff', fontSize: '14px', fontWeight: 500, color: '#374151', cursor: 'pointer', fontFamily: 'inherit' }}
                >
                  Abbrechen
                </button>
                <button
                  onClick={handleAdd}
                  disabled={!selectedSize || !selectedVar || added}
                  style={{
                    flex: 2,
                    padding: '10px',
                    borderRadius: '10px',
                    border: 'none',
                    background: added ? '#22c55e' : '#0079FF',
                    color: '#fff',
                    fontSize: '14px',
                    fontWeight: 700,
                    cursor: added ? 'default' : 'pointer',
                    fontFamily: 'inherit',
                    transition: 'background 0.2s',
                  }}
                >
                  {added ? '✓ Hinzugefügt' : 'In den Warenkorb'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  useAuthStore(s => s.user)
  const [designs, setDesigns] = useState<DesignListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [orderTarget, setOrderTarget] = useState<DesignListItem | null>(null)

  useEffect(() => {
    fetch('/api/designs')
      .then(r => r.json())
      .then(data => {
        if (data.success) setDesigns(data.data)
      })
      .finally(() => setLoading(false))
  }, [])

  const deleteDesign = async (id: string, name: string) => {
    if (!window.confirm(`Design „${name}" wirklich löschen?`)) return
    setDeleting(id)
    try {
      const res = await fetch(`/api/designs/${id}`, { method: 'DELETE' })
      if (res.ok) setDesigns(prev => prev.filter(d => d.id !== id))
    } finally {
      setDeleting(null)
    }
  }

  // Renders the design image:
  // 1. Canvas composite (captureCanvasPreview — shirt + design, white BG) — shown directly
  // 2. CSS overlay (transparent design_png on shirt_image) — for high-res print PNGs
  // 3. Just shirt or just design_png — last resort
  const renderDesignImage = (design: DesignListItem) => {
    // product_images[0] is the 500×500 canvas composite from captureCanvasPreview(),
    // which already includes both the shirt mockup and the user's design. Display it directly.
    const savedMockup = design.product_images?.[0]?.url ?? null
    if (savedMockup) {
      return <img src={savedMockup} alt={design.name} style={{ width: '100%', height: '100%', objectFit: 'contain', background: 'white' }} />
    }

    // Fallback: CSS overlay of transparent print PNG on shirt photo
    if (design.shirt_image) {
      const pz = design.print_zone
      const overlayStyle: React.CSSProperties = pz ? {
        position: 'absolute',
        left:   `${pz.left - pz.width  / 2}%`,
        top:    `${pz.top  - pz.height / 2}%`,
        width:  `${pz.width}%`,
        pointerEvents: 'none',
      } : { position: 'absolute', inset: '10%', width: '80%' }

      return (
        <div style={{ position: 'relative', width: '100%', height: '100%', background: 'white' }}>
          <img src={design.shirt_image} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          {design.design_png && <img src={design.design_png} alt={design.name} style={overlayStyle} />}
        </div>
      )
    }

    if (design.design_png) {
      return <img src={design.design_png} alt={design.name} style={{ width: '100%', height: '100%', objectFit: 'contain', background: 'white' }} />
    }

    return (
      <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="32" height="32" fill="white" opacity={0.7} viewBox="0 0 24 24">
          <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      </div>
    )
  }

  return (
    <div>
      {orderTarget && <OrderModal design={orderTarget} onClose={() => setOrderTarget(null)} />}

      {/* Page header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          paddingBottom: '16px',
          borderBottom: '1px solid rgba(0,0,0,0.05)',
        }}
      >
        <div>
          <h2
            style={{
              fontSize: '18px',
              fontWeight: 600,
              color: '#111827',
              margin: 0,
              lineHeight: 1.2,
            }}
          >
            Deine Designs
          </h2>
          {!loading && (
            <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: 400 }}>
              {designs.length} {designs.length === 1 ? 'Design' : 'Designs'}
            </span>
          )}
        </div>
        <Link
          href="/designer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '10px 18px',
            background: '#0079FF',
            color: '#ffffff',
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: 600,
            textDecoration: 'none',
            transition: 'all 0.3s ease',
            boxShadow: '0 2px 8px rgba(0, 121, 255, 0.3)',
          }}
        >
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Neues Design
        </Link>
      </div>

      {/* Designs container */}
      {loading ? (
        <div style={{ overflowX: 'auto', paddingBottom: '8px' }}>
          <div style={{ display: 'flex', gap: '16px', minWidth: 'max-content', padding: '4px 0' }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: '200px',
                  minWidth: '200px',
                  background: '#ffffff',
                  borderRadius: '8px',
                  border: '1px solid #e5e5e5',
                  overflow: 'hidden',
                }}
              >
                <div style={{ width: '100%', height: '160px', background: '#f3f4f6', animation: 'pulse 2s infinite' }} />
                <div style={{ padding: '12px' }}>
                  <div style={{ height: '14px', background: '#f3f4f6', borderRadius: '4px', marginBottom: '8px', width: '75%' }} />
                  <div style={{ height: '12px', background: '#f3f4f6', borderRadius: '4px', width: '50%' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : designs.length === 0 ? (
        <div
          style={{
            background: '#ffffff',
            borderRadius: '20px',
            padding: '64px 40px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
            border: '1px solid #e5e7eb',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              background: 'rgba(0,121,255,0.1)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px auto',
            }}
          >
            <svg width="32" height="32" fill="none" stroke="#0079FF" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.4 2.245 4.5 4.5 0 0 0 8.4-2.245c0-.399-.078-.78-.22-1.128Zm0 0a15.998 15.998 0 0 0 3.388-1.62m-5.043-.025a15.994 15.994 0 0 1 1.622-3.395m3.42 3.42a15.995 15.995 0 0 0 4.764-4.648l3.876-5.814a1.151 1.151 0 0 0-1.597-1.597L14.146 6.32a15.996 15.996 0 0 0-4.649 4.763m3.42 3.42a6.776 6.776 0 0 0-3.42-3.42" />
            </svg>
          </div>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#111827', margin: '0 0 8px 0' }}>
            Noch keine Designs
          </h2>
          <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 28px 0', lineHeight: 1.5 }}>
            Erstelle dein erstes Design und starte deine Streetwear-Marke!
          </p>
          <Link
            href="/designer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '14px 28px',
              background: '#0079FF',
              color: '#ffffff',
              borderRadius: '12px',
              fontSize: '15px',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Design erstellen
          </Link>
        </div>
      ) : (
        <div style={{ overflowX: 'auto', paddingBottom: '8px' }}>
          <div style={{ display: 'flex', gap: '16px', minWidth: 'max-content', padding: '4px 0' }}>
            {designs.map(design => (
              <div
                key={design.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  width: '200px',
                  minWidth: '200px',
                  backgroundColor: '#ffffff',
                  borderRadius: '8px',
                  border: '1px solid #e5e5e5',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLDivElement
                  el.style.borderColor = '#0079FF'
                  el.style.transform = 'translateY(-2px)'
                  el.style.boxShadow = '0 4px 12px rgba(0,121,255,0.15)'
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLDivElement
                  el.style.borderColor = '#e5e5e5'
                  el.style.transform = 'translateY(0)'
                  el.style.boxShadow = 'none'
                }}
              >
                {/* Clickable area */}
                <Link
                  href={`/designer?design_id=${design.id}`}
                  style={{ flex: 1, textDecoration: 'none', display: 'block' }}
                >
                  <div style={{ position: 'relative', width: '100%', height: '160px', overflow: 'hidden' }}>
                    {renderDesignImage(design)}
                  </div>
                  <div style={{ padding: '12px', flex: 1 }}>
                    <h3
                      style={{
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#111827',
                        margin: '0 0 4px 0',
                        lineHeight: 1.3,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                      title={design.name}
                    >
                      {design.name}
                    </h3>
                    <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                      Erstellt am {formatDate(design.created_at)}
                    </p>
                  </div>
                </Link>

                {/* Actions bar */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 12px',
                    borderTop: '1px solid rgba(0,0,0,0.05)',
                    backgroundColor: '#f9fafb',
                  }}
                >
                  {/* Order button */}
                  <button
                    onClick={() => design.template_id && setOrderTarget(design)}
                    title="Bestellen"
                    disabled={!design.template_id}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '2px',
                      padding: '6px 8px',
                      background: 'transparent',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: design.template_id ? 'pointer' : 'not-allowed',
                      fontSize: '10px',
                      fontWeight: 500,
                      color: design.template_id ? '#374151' : '#d1d5db',
                      transition: 'all 0.2s ease',
                      fontFamily: 'inherit',
                    }}
                  >
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 512 512">
                      <path d="M500.33 0h-47.41a12 12 0 0 0-12 12.57l4 72A4 4 0 0 1 441 89a405.66 405.66 0 0 0-93.07-33.46C230.41 28.09 112 49.36 21.24 143.75A32 32 0 0 0 22 189.8L39.9 207.7a32 32 0 0 0 46.29-.39 288.86 288.86 0 0 1 88.16-67.77c52.82-23.25 109.4-32.48 167.42-27.08a304.34 304.34 0 0 1 86.58 25.81 4 4 0 0 1 1.67 5.27L411.6 183a4 4 0 0 0 3.82 5.42h84.66a12 12 0 0 0 12-12V12a12 12 0 0 0-11.75-12zM490.89 320a32 32 0 0 0-46.29.39 288.86 288.86 0 0 1-88.16 67.77c-52.82 23.25-109.4 32.48-167.42 27.08a304.34 304.34 0 0 1-86.58-25.81 4 4 0 0 1-1.67-5.27l18.42-39.48a4 4 0 0 0-3.82-5.42H30.71A12 12 0 0 0 18.63 352v120a12 12 0 0 0 12 12h47.41a12 12 0 0 0 12-12.57l-4-72a4 4 0 0 1 3.86-4.26 405.66 405.66 0 0 0 93.07 33.46c117.52 27.45 235.93 6.18 326.73-88.21a32 32 0 0 0-.81-46.42z" />
                    </svg>
                    <span>Bestellen</span>
                  </button>

                  {/* Edit button */}
                  <Link
                    href={`/designer?design_id=${design.id}`}
                    title="Bearbeiten"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '2px',
                      padding: '6px 8px',
                      background: 'transparent',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '10px',
                      fontWeight: 500,
                      color: '#374151',
                      textDecoration: 'none',
                      transition: 'all 0.2s ease',
                      fontFamily: 'inherit',
                    }}
                  >
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
                    </svg>
                    <span>Bearbeiten</span>
                  </Link>

                  {/* Delete button */}
                  <button
                    onClick={() => deleteDesign(design.id, design.name)}
                    disabled={deleting === design.id}
                    title="Löschen"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '2px',
                      padding: '6px 8px',
                      background: 'transparent',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: deleting === design.id ? 'not-allowed' : 'pointer',
                      fontSize: '10px',
                      fontWeight: 500,
                      color: deleting === design.id ? '#d1d5db' : '#ef4444',
                      transition: 'all 0.2s ease',
                      fontFamily: 'inherit',
                      opacity: deleting === design.id ? 0.5 : 1,
                    }}
                  >
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                    <span>{deleting === design.id ? '…' : 'Löschen'}</span>
                  </button>
                </div>
              </div>
            ))}

            {/* Create new card */}
            <Link
              href="/designer"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '200px',
                minWidth: '200px',
                height: '240px',
                backgroundColor: '#ffffff',
                borderRadius: '8px',
                border: '2px dashed #d1d5db',
                textDecoration: 'none',
                gap: '8px',
                transition: 'all 0.2s ease',
                color: '#6b7280',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLAnchorElement
                el.style.borderColor = '#0079FF'
                el.style.color = '#0079FF'
                el.style.background = 'rgba(0,121,255,0.04)'
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLAnchorElement
                el.style.borderColor = '#d1d5db'
                el.style.color = '#6b7280'
                el.style.background = '#ffffff'
              }}
            >
              <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              <p style={{ margin: 0, fontSize: '13px', fontWeight: 500, textAlign: 'center', lineHeight: 1.3 }}>
                Design<br />erstellen
              </p>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
