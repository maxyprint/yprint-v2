'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { DesignTemplate } from '@/types'

export default function AdminTemplatesPage() {
  const [templates, setTemplates] = useState<DesignTemplate[]>([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    fetch('/api/admin/templates')
      .then(r => r.json())
      .then(data => { if (data.success) setTemplates(data.data) })
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const toggleStock = async (id: string, current: boolean) => {
    await fetch(`/api/admin/templates/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ in_stock: !current }),
    })
    load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#1d1d1f]">Templates</h1>
        <Link href="/admin/templates/new" className="yprint-button yprint-button-primary">
          + Neues Template
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="yprint-card animate-pulse h-20" />
          ))}
        </div>
      ) : templates.length === 0 ? (
        <div className="yprint-card text-center py-12">
          <p className="text-[rgba(0,0,0,0.6)] mb-4">Noch keine Templates angelegt.</p>
          <Link href="/admin/templates/new" className="yprint-button yprint-button-primary">
            Erstes Template erstellen
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {templates.map(t => (
            <div key={t.id} className="yprint-card flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[#1d1d1f]">{t.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${t.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                    {t.status === 'published' ? 'Veröffentlicht' : 'Entwurf'}
                  </span>
                  {!t.in_stock && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700">Nicht verfügbar</span>
                  )}
                </div>
                <p className="text-sm text-[rgba(0,0,0,0.5)]">
                  {t.physical_width_cm}×{t.physical_height_cm} cm · {(t.sizes as any[])?.length || 0} Größen
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleStock(t.id, t.in_stock)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${t.in_stock ? 'border-red-300 text-red-600 hover:bg-red-50' : 'border-green-300 text-green-700 hover:bg-green-50'}`}
                >
                  {t.in_stock ? 'Deaktivieren' : 'Aktivieren'}
                </button>
                <Link
                  href={`/admin/templates/${t.id}`}
                  className="yprint-button yprint-button-secondary text-sm py-1.5 px-3"
                >
                  Bearbeiten
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
