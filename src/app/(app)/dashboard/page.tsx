'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuthStore } from '@/store/auth'
import { useCartStore } from '@/store/cart'
import type { UserDesign } from '@/types'
import { formatDate, formatPrice } from '@/lib/utils'

export default function DashboardPage() {
  const { user } = useAuthStore()
  const addItem = useCartStore(s => s.addItem)
  const [designs, setDesigns] = useState<UserDesign[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/designs')
      .then(r => r.json())
      .then(data => {
        if (data.success) setDesigns(data.data)
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
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
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            color: '#ffffff',
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: 600,
            textDecoration: 'none',
            transition: 'all 0.3s ease',
            boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
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
              background: 'rgba(59,130,246,0.1)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px auto',
            }}
          >
            <svg width="32" height="32" fill="none" stroke="#3b82f6" strokeWidth="1.5" viewBox="0 0 24 24">
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
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
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
                  el.style.borderColor = '#3b82f6'
                  el.style.transform = 'translateY(-2px)'
                  el.style.boxShadow = '0 4px 12px rgba(59,130,246,0.15)'
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
                  href={`/designer?design=${design.id}`}
                  style={{ flex: 1, textDecoration: 'none', display: 'block' }}
                >
                  <div style={{ position: 'relative', width: '100%', height: '160px', overflow: 'hidden' }}>
                    {design.product_images?.[0]?.url ? (
                      <img
                        src={design.product_images[0].url}
                        alt={design.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', backgroundColor: '#f9fafb' }}
                      />
                    ) : (
                      <div
                        style={{
                          width: '100%',
                          height: '100%',
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <svg width="32" height="32" fill="white" opacity={0.7} viewBox="0 0 24 24">
                          <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                    )}
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
                    onClick={() => {
                      if (design.template_id) {
                        addItem({
                          design_id: design.id,
                          variation_id: '',
                          variation_name: '',
                          size: '',
                          quantity: 1,
                          unit_price: 0,
                          design_name: design.name,
                          template_id: design.template_id!,
                          template_name: '',
                        })
                      }
                    }}
                    title="Erneut bestellen"
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
                      transition: 'all 0.2s ease',
                      fontFamily: 'inherit',
                    }}
                  >
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 512 512">
                      <path d="M500.33 0h-47.41a12 12 0 0 0-12 12.57l4 72A4 4 0 0 1 441 89a405.66 405.66 0 0 0-93.07-33.46C230.41 28.09 112 49.36 21.24 143.75A32 32 0 0 0 22 189.8L39.9 207.7a32 32 0 0 0 46.29-.39 288.86 288.86 0 0 1 88.16-67.77c52.82-23.25 109.4-32.48 167.42-27.08a304.34 304.34 0 0 1 86.58 25.81 4 4 0 0 1 1.67 5.27L411.6 183a4 4 0 0 0 3.82 5.42h84.66a12 12 0 0 0 12-12V12a12 12 0 0 0-11.75-12zM490.89 320a32 32 0 0 0-46.29.39 288.86 288.86 0 0 1-88.16 67.77c-52.82 23.25-109.4 32.48-167.42 27.08a304.34 304.34 0 0 1-86.58-25.81 4 4 0 0 1-1.67-5.27l18.42-39.48a4 4 0 0 0-3.82-5.42H30.71A12 12 0 0 0 18.63 352v120a12 12 0 0 0 12 12h47.41a12 12 0 0 0 12-12.57l-4-72a4 4 0 0 1 3.86-4.26 405.66 405.66 0 0 0 93.07 33.46c117.52 27.45 235.93 6.18 326.73-88.21a32 32 0 0 0-.81-46.42z" />
                    </svg>
                    <span>Order</span>
                  </button>

                  {/* Edit link */}
                  <Link
                    href={`/designer?design=${design.id}`}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '2px',
                      padding: '6px 8px',
                      borderRadius: '6px',
                      textDecoration: 'none',
                      fontSize: '10px',
                      fontWeight: 500,
                      color: '#374151',
                      transition: 'all 0.2s ease',
                    }}
                    title="Bearbeiten"
                  >
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                    </svg>
                    <span>Bearbeiten</span>
                  </Link>
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
                el.style.borderColor = '#3b82f6'
                el.style.color = '#3b82f6'
                el.style.background = 'rgba(59,130,246,0.04)'
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
