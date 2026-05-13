'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

interface TemplateForm {
  name: string
  slug: string
  category: string
  status: 'published' | 'draft'
  physical_width_cm: number
  physical_height_cm: number
  base_price: number
  in_stock: boolean
  sizes: any[]
  variations: Record<string, any>
  pricing: Record<string, any>
}

const DEFAULT_FORM: TemplateForm = {
  name: '',
  slug: '',
  category: '',
  status: 'draft',
  physical_width_cm: 30,
  physical_height_cm: 40,
  base_price: 24.99,
  in_stock: true,
  sizes: [],
  variations: {},
  pricing: {},
}

export default function TemplateEditorPage() {
  const params = useParams()
  const router = useRouter()
  const isNew = params.id === 'new'

  const [form, setForm] = useState<TemplateForm>(DEFAULT_FORM)
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [rawSizes, setRawSizes] = useState('[]')
  const [rawVariations, setRawVariations] = useState('{}')
  const [rawPricing, setRawPricing] = useState('{}')

  useEffect(() => {
    if (isNew) return
    fetch(`/api/admin/templates/${params.id}`)
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          const t = data.data
          setForm({
            name: t.name || '',
            slug: t.slug || '',
            category: t.category || '',
            status: t.status || 'draft',
            physical_width_cm: t.physical_width_cm || 30,
            physical_height_cm: t.physical_height_cm || 40,
            base_price: t.base_price || 0,
            in_stock: t.in_stock !== false,
            sizes: t.sizes || [],
            variations: t.variations || {},
            pricing: t.pricing || {},
          })
          setRawSizes(JSON.stringify(t.sizes || [], null, 2))
          setRawVariations(JSON.stringify(t.variations || {}, null, 2))
          setRawPricing(JSON.stringify(t.pricing || {}, null, 2))
        }
      })
      .finally(() => setLoading(false))
  }, [params.id, isNew])

  const handleSave = async () => {
    setError(null)
    setSaving(true)

    let sizes, variations, pricing
    try {
      sizes = JSON.parse(rawSizes)
      variations = JSON.parse(rawVariations)
      pricing = JSON.parse(rawPricing)
    } catch (e) {
      setError('Ungültiges JSON in Größen, Varianten oder Preisen.')
      setSaving(false)
      return
    }

    const payload = { ...form, sizes, variations, pricing }
    const url = isNew ? '/api/admin/templates' : `/api/admin/templates/${params.id}`
    const method = isNew ? 'POST' : 'PUT'

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Fehler beim Speichern.')
      if (isNew) router.push(`/admin/templates/${data.data.id}`)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="animate-pulse yprint-card h-64" />

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/templates" className="text-sm text-[rgba(0,0,0,0.5)] hover:text-[#1d1d1f]">
          ← Templates
        </Link>
        <span className="text-[rgba(0,0,0,0.3)]">/</span>
        <h1 className="text-xl font-bold text-[#1d1d1f]">{isNew ? 'Neues Template' : form.name || 'Template bearbeiten'}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main fields */}
        <div className="lg:col-span-2 space-y-4">
          <div className="yprint-card space-y-4">
            <h2 className="font-semibold text-[#1d1d1f]">Grunddaten</h2>
            <div>
              <label className="block text-sm font-medium text-[#1d1d1f] mb-1">Name *</label>
              <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="yprint-input" placeholder="z.B. Unisex T-Shirt" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-[#1d1d1f] mb-1">Slug</label>
                <input type="text" value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} className="yprint-input" placeholder="unisex-t-shirt" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1d1d1f] mb-1">Kategorie</label>
                <input type="text" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="yprint-input" placeholder="Shirts" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-[#1d1d1f] mb-1">Breite (cm)</label>
                <input type="number" step="0.1" value={form.physical_width_cm} onChange={e => setForm(f => ({ ...f, physical_width_cm: parseFloat(e.target.value) }))} className="yprint-input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1d1d1f] mb-1">Höhe (cm)</label>
                <input type="number" step="0.1" value={form.physical_height_cm} onChange={e => setForm(f => ({ ...f, physical_height_cm: parseFloat(e.target.value) }))} className="yprint-input" />
              </div>
            </div>
          </div>

          {/* Sizes JSON */}
          <div className="yprint-card">
            <h2 className="font-semibold text-[#1d1d1f] mb-3">Größen (JSON)</h2>
            <p className="text-xs text-[rgba(0,0,0,0.5)] mb-2">Format: {'[{"id":"S","name":"Small","order":1},...]'}</p>
            <textarea
              value={rawSizes}
              onChange={e => setRawSizes(e.target.value)}
              className="yprint-input font-mono text-xs"
              rows={6}
              spellCheck={false}
            />
          </div>

          {/* Variations JSON */}
          <div className="yprint-card">
            <h2 className="font-semibold text-[#1d1d1f] mb-3">Varianten (JSON)</h2>
            <p className="text-xs text-[rgba(0,0,0,0.5)] mb-2">
              Format: {'{"var_id": {"name":"White","color":"#fff","is_default":true,"is_dark_shirt":false,"views":{"front":{"name":"Front","image_url":"...","safeZone":{...},...}}}}'}
            </p>
            <textarea
              value={rawVariations}
              onChange={e => setRawVariations(e.target.value)}
              className="yprint-input font-mono text-xs"
              rows={16}
              spellCheck={false}
            />
          </div>

          {/* Pricing JSON */}
          <div className="yprint-card">
            <h2 className="font-semibold text-[#1d1d1f] mb-3">Preise (JSON)</h2>
            <p className="text-xs text-[rgba(0,0,0,0.5)] mb-2">Format: {'{"S":{"base":24.99},"M":{"base":24.99}}'}</p>
            <textarea
              value={rawPricing}
              onChange={e => setRawPricing(e.target.value)}
              className="yprint-input font-mono text-xs"
              rows={6}
              spellCheck={false}
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="yprint-card">
            <h2 className="font-semibold text-[#1d1d1f] mb-4">Status</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-[#1d1d1f] mb-1">Veröffentlichung</label>
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as any }))} className="yprint-input">
                  <option value="draft">Entwurf</option>
                  <option value="published">Veröffentlicht</option>
                </select>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.in_stock} onChange={e => setForm(f => ({ ...f, in_stock: e.target.checked }))} />
                <span className="text-sm text-[rgba(0,0,0,0.7)]">Auf Lager</span>
              </label>
              <div>
                <label className="block text-sm font-medium text-[#1d1d1f] mb-1">Grundpreis (€)</label>
                <input type="number" step="0.01" value={form.base_price} onChange={e => setForm(f => ({ ...f, base_price: parseFloat(e.target.value) }))} className="yprint-input" />
              </div>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
          )}

          <button onClick={handleSave} disabled={saving || !form.name} className="yprint-button yprint-button-primary w-full">
            {saving ? 'Wird gespeichert…' : isNew ? 'Template erstellen' : 'Änderungen speichern'}
          </button>

          {!isNew && (
            <button
              onClick={async () => {
                if (!confirm('Template wirklich löschen?')) return
                await fetch(`/api/admin/templates/${params.id}`, { method: 'DELETE' })
                router.push('/admin/templates')
              }}
              className="yprint-button yprint-button-danger w-full"
            >
              Template löschen
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
