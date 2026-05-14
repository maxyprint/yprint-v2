'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { SizesEditor } from '@/components/admin/templates/SizesEditor'
import { PricingEditor } from '@/components/admin/templates/PricingEditor'
import { VariationsEditor } from '@/components/admin/templates/VariationsEditor'
import { AkdSettingsCard, AkdSettings } from '@/components/admin/templates/AkdSettingsCard'
import { VariationData } from '@/components/admin/templates/VariationCard'

interface Size {
  id: string
  name: string
  order: number
}

interface Pricing {
  [sizeId: string]: { base: number }
}

interface AkdConfig {
  product_type: string
  manufacturer: string
  series: string
  print_method: string
}

interface TemplateForm {
  name: string
  slug: string
  category: string
  status: 'published' | 'draft'
  physical_width_cm: number
  physical_height_cm: number
  base_price: number
  in_stock: boolean
  akd: AkdConfig
  sizes: Size[]
  variations: Record<string, VariationData>
  pricing: Pricing
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
  akd: { product_type: 'TSHIRT', manufacturer: 'yprint', series: 'SS25', print_method: 'DTG' },
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
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (isNew) return
    fetch(`/api/admin/templates/${params.id}`)
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          const t = data.data
          const rawVariations = t.variations || {}
          const akdRaw = rawVariations._akd || {}
          // Strip internal _akd key — managed separately in the form
          const variations: Record<string, VariationData> = Object.fromEntries(
            Object.entries(rawVariations).filter(([k]) => !k.startsWith('_'))
          ) as Record<string, VariationData>

          setForm({
            name: t.name || '',
            slug: t.slug || '',
            category: t.category || '',
            status: t.status || 'draft',
            physical_width_cm: t.physical_width_cm ?? 30,
            physical_height_cm: t.physical_height_cm ?? 40,
            base_price: t.base_price ?? 0,
            in_stock: t.in_stock !== false,
            akd: {
              product_type: akdRaw.product_type || 'TSHIRT',
              manufacturer: akdRaw.manufacturer || 'yprint',
              series: akdRaw.series || 'SS25',
              print_method: akdRaw.print_method || 'DTG',
            },
            sizes: t.sizes || [],
            variations,
            pricing: t.pricing || {},
          })
        }
      })
      .finally(() => setLoading(false))
  }, [params.id, isNew])

  const set = <K extends keyof TemplateForm>(field: K, value: TemplateForm[K]) =>
    setForm(f => ({ ...f, [field]: value }))

  const akdSettings: AkdSettings = {
    akd_product_type: form.akd.product_type,
    akd_manufacturer: form.akd.manufacturer,
    akd_series: form.akd.series,
    akd_print_method: form.akd.print_method,
  }

  const handleSave = async () => {
    setError(null)
    setSaving(true)
    setSaved(false)

    const url = isNew ? '/api/admin/templates' : `/api/admin/templates/${params.id}`
    const method = isNew ? 'POST' : 'PUT'

    // Merge _akd config back into variations for storage
    const { akd, variations, ...rest } = form
    const payload = {
      ...rest,
      variations: { _akd: akd, ...variations },
    }

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Fehler beim Speichern.')
      if (isNew) {
        router.push(`/admin/templates/${data.data.id}`)
      } else {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
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
        <h1 className="text-xl font-bold text-[#1d1d1f]">
          {isNew ? 'Neues Template' : form.name || 'Template bearbeiten'}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Grunddaten */}
          <div className="yprint-card space-y-4">
            <h2 className="font-semibold text-[#1d1d1f]">Grunddaten</h2>
            <div>
              <label className="block text-sm font-medium text-[#1d1d1f] mb-1">Name *</label>
              <input type="text" value={form.name} onChange={e => set('name', e.target.value)} className="yprint-input" placeholder="z.B. Oversized T-Shirt" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-[#1d1d1f] mb-1">Slug</label>
                <input type="text" value={form.slug} onChange={e => set('slug', e.target.value)} className="yprint-input" placeholder="oversized-t-shirt" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1d1d1f] mb-1">Kategorie</label>
                <input type="text" value={form.category} onChange={e => set('category', e.target.value)} className="yprint-input" placeholder="Shirts" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-[#1d1d1f] mb-1">Druckbreite (cm)</label>
                <input type="number" step="0.1" value={form.physical_width_cm} onChange={e => set('physical_width_cm', parseFloat(e.target.value))} className="yprint-input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1d1d1f] mb-1">Druckhöhe (cm)</label>
                <input type="number" step="0.1" value={form.physical_height_cm} onChange={e => set('physical_height_cm', parseFloat(e.target.value))} className="yprint-input" />
              </div>
            </div>
          </div>

          <SizesEditor sizes={form.sizes} onChange={v => set('sizes', v)} />
          <PricingEditor sizes={form.sizes} pricing={form.pricing} onChange={v => set('pricing', v)} />
          <VariationsEditor variations={form.variations} onChange={v => set('variations', v as Record<string, VariationData>)} />
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="yprint-card">
            <h2 className="font-semibold text-[#1d1d1f] mb-4">Status</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-[#1d1d1f] mb-1">Veröffentlichung</label>
                <select value={form.status} onChange={e => set('status', e.target.value as 'published' | 'draft')} className="yprint-input">
                  <option value="draft">Entwurf</option>
                  <option value="published">Veröffentlicht</option>
                </select>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.in_stock} onChange={e => set('in_stock', e.target.checked)} />
                <span className="text-sm text-[rgba(0,0,0,0.7)]">Auf Lager</span>
              </label>
              <div>
                <label className="block text-sm font-medium text-[#1d1d1f] mb-1">Grundpreis (€)</label>
                <input type="number" step="0.01" value={form.base_price} onChange={e => set('base_price', parseFloat(e.target.value))} className="yprint-input" />
              </div>
            </div>
          </div>

          <AkdSettingsCard
            value={akdSettings}
            onChange={v => setForm(f => ({
              ...f,
              akd: {
                product_type: v.akd_product_type,
                manufacturer: v.akd_manufacturer,
                series: v.akd_series,
                print_method: v.akd_print_method,
              },
            }))}
          />

          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
          )}
          {saved && (
            <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">Gespeichert ✓</div>
          )}

          <button
            onClick={handleSave}
            disabled={saving || !form.name}
            className="yprint-button yprint-button-primary w-full"
          >
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
