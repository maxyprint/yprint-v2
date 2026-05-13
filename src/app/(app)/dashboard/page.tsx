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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1d1d1f]">Meine Designs</h1>
          <p className="text-[rgba(0,0,0,0.6)] text-sm mt-0.5">
            Willkommen zurück{user?.email ? `, ${user.email.split('@')[0]}` : ''}!
          </p>
        </div>
        <Link href="/designer" className="yprint-button yprint-button-primary">
          + Neues Design
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="yprint-card animate-pulse">
              <div className="aspect-square bg-[#f5f5f7] rounded-lg mb-3" />
              <div className="h-4 bg-[#f5f5f7] rounded w-3/4 mb-2" />
              <div className="h-3 bg-[#f5f5f7] rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : designs.length === 0 ? (
        <div className="yprint-card text-center py-16">
          <div className="w-16 h-16 bg-[#007aff]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-[#007aff]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.4 2.245 4.5 4.5 0 0 0 8.4-2.245c0-.399-.078-.78-.22-1.128Zm0 0a15.998 15.998 0 0 0 3.388-1.62m-5.043-.025a15.994 15.994 0 0 1 1.622-3.395m3.42 3.42a15.995 15.995 0 0 0 4.764-4.648l3.876-5.814a1.151 1.151 0 0 0-1.597-1.597L14.146 6.32a15.996 15.996 0 0 0-4.649 4.763m3.42 3.42a6.776 6.776 0 0 0-3.42-3.42" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-[#1d1d1f] mb-2">Noch keine Designs</h2>
          <p className="text-[rgba(0,0,0,0.6)] text-sm mb-6">
            Erstelle dein erstes Design und starte deine Streetwear-Marke!
          </p>
          <Link href="/designer" className="yprint-button yprint-button-primary">
            Design erstellen
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {designs.map(design => (
            <div key={design.id} className="yprint-card group hover:shadow-md transition-shadow">
              <div className="aspect-square bg-[#f5f5f7] rounded-lg mb-3 overflow-hidden relative">
                {design.product_images?.[0]?.url ? (
                  <img
                    src={design.product_images[0].url}
                    alt={design.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[rgba(0,0,0,0.2)]">
                    <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                    </svg>
                  </div>
                )}
              </div>
              <h3 className="font-semibold text-[#1d1d1f] text-sm truncate">{design.name}</h3>
              <p className="text-xs text-[rgba(0,0,0,0.5)] mt-0.5 mb-3">{formatDate(design.created_at)}</p>
              <div className="flex gap-2">
                <Link
                  href={`/designer?design=${design.id}`}
                  className="flex-1 text-center py-1.5 text-xs font-medium text-[#007aff] border border-[#007aff] rounded-lg hover:bg-[#007aff]/5 transition-colors"
                >
                  Bearbeiten
                </Link>
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
                  className="flex-1 py-1.5 text-xs font-medium bg-[#007aff] text-white rounded-lg hover:bg-[#0066d6] transition-colors"
                >
                  Bestellen
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
