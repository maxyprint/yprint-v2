'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { SizesPricingEditor } from '@/components/admin/templates/SizesPricingEditor'
import { VariationsEditor } from '@/components/admin/templates/VariationsEditor'
import { VariationData } from '@/components/admin/templates/VariationCard'
import { MeasurementsEditor, MeasurementsData } from '@/components/admin/templates/MeasurementsEditor'

interface Size { id: string; name: string; order: number }
interface Pricing { [sizeId: string]: { base: number } }
interface AkdConfig { product_type: string; manufacturer: string; series: string; print_method: string }

const DEFAULT_MEASUREMENTS: MeasurementsData = { per_size: {}, print_y_offset_mm: 60 }

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
  measurements: MeasurementsData
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
  measurements: DEFAULT_MEASUREMENTS,
  sizes: [],
  variations: {},
  pricing: {},
}

const AKD_PRODUCT_TYPES = ['TSHIRT', 'HOODIE', 'LONGSLEEVE', 'SWEATSHIRT', 'TANKTOP', 'POLO']
const AKD_PRINT_METHODS = ['DTG', 'DTF', 'Screen', 'Embroidery']

function Section({ number, title, description, children }: {
  number: number; title: string; description?: string; children: React.ReactNode
}) {
  return (
    <div className="py-8 border-b border-[#e5e7eb] last:border-0">
      <div className="flex items-start gap-4 mb-6">
        <div className="w-8 h-8 rounded-full bg-[#0079FF] text-white text-sm font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
          {number}
        </div>
        <div>
          <h2 className="text-lg font-bold text-[#1d1d1f]">{title}</h2>
          {description && <p className="text-sm text-[rgba(0,0,0,0.5)] mt-0.5">{description}</p>}
        </div>
      </div>
      {children}
    </div>
  )
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
          const measurementsRaw = rawVariations._measurements || DEFAULT_MEASUREMENTS
          const variations = Object.fromEntries(
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
            measurements: {
              per_size: measurementsRaw.per_size || {},
              print_y_offset_mm: measurementsRaw.print_y_offset_mm ?? 60,
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

  const setAkd = (field: keyof AkdConfig, value: string) =>
    setForm(f => ({ ...f, akd: { ...f.akd, [field]: value } }))

  const handleSave = async () => {
    setError(null)
    setSaving(true)
    setSaved(false)
    const { akd, measurements, variations, ...rest } = form
    const payload = {
      ...rest,
      variations: { _akd: akd, _measurements: measurements, ...variations },
    }
    try {
      const res = await fetch(
        isNew ? '/api/admin/templates' : `/api/admin/templates/${params.id}`,
        { method: isNew ? 'POST' : 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }
      )
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

  if (loading) return (
    <div className="max-w-3xl mx-auto space-y-4 animate-pulse">
      <div className="h-16 bg-[#f3f4f6] rounded-2xl" />
      <div className="h-48 bg-[#f3f4f6] rounded-2xl" />
      <div className="h-32 bg-[#f3f4f6] rounded-2xl" />
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto pb-16">

      {/* ── Sticky top bar ── */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-[#e5e7eb] -mx-6 px-6 py-3 mb-2 flex items-center gap-4">
        <Link href="/admin/templates" className="text-sm text-[rgba(0,0,0,0.5)] hover:text-[#1d1d1f] flex-shrink-0">
          ← Templates
        </Link>
        <span className="text-[rgba(0,0,0,0.2)]">/</span>
        <span className="font-semibold text-[#1d1d1f] flex-1 truncate min-w-0">
          {form.name || (isNew ? 'Neues Template' : '…')}
        </span>

        <select
          value={form.status}
          onChange={e => set('status', e.target.value as 'published' | 'draft')}
          className={`text-sm px-3 py-1.5 rounded-lg border font-medium flex-shrink-0 ${
            form.status === 'published'
              ? 'border-green-200 bg-green-50 text-green-700'
              : 'border-[#e5e7eb] bg-[#f3f4f6] text-[rgba(0,0,0,0.6)]'
          }`}
        >
          <option value="draft">Entwurf</option>
          <option value="published">Veröffentlicht</option>
        </select>

        {saved && <span className="text-sm text-green-600 font-medium flex-shrink-0">Gespeichert ✓</span>}
        {error && <span className="text-sm text-red-500 flex-shrink-0 max-w-48 truncate">{error}</span>}

        <button
          onClick={handleSave}
          disabled={saving || !form.name}
          className="yprint-button yprint-button-primary px-5 flex-shrink-0"
        >
          {saving ? 'Speichert…' : isNew ? 'Erstellen' : 'Speichern'}
        </button>
      </div>

      {/* ── 1: Produktinfo ── */}
      <Section number={1} title="Produktinfo" description="Name, Kategorie und URL-Slug des Produkts">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#1d1d1f] mb-2">Produktname *</label>
            <input
              type="text"
              value={form.name}
              onChange={e => set('name', e.target.value)}
              className="yprint-input text-lg font-semibold"
              placeholder="z.B. Oversized T-Shirt"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#1d1d1f] mb-2">Kategorie</label>
              <input type="text" value={form.category} onChange={e => set('category', e.target.value)} className="yprint-input" placeholder="z.B. Shirts" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1d1d1f] mb-2">URL-Slug</label>
              <input type="text" value={form.slug} onChange={e => set('slug', e.target.value)} className="yprint-input font-mono text-sm" placeholder="oversized-t-shirt" />
            </div>
          </div>
          <div className="flex items-center gap-6 pt-1">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input type="checkbox" checked={form.in_stock} onChange={e => set('in_stock', e.target.checked)} className="w-4 h-4" />
              <span className="text-sm font-medium text-[#1d1d1f]">Auf Lager</span>
            </label>
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-[#1d1d1f]">Grundpreis</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[rgba(0,0,0,0.4)]">€</span>
                <input type="number" step="0.01" value={form.base_price} onChange={e => set('base_price', parseFloat(e.target.value))} className="yprint-input pl-7 w-28" />
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ── 2: Größen & Preise ── */}
      <Section number={2} title="Größen & Preise" description="Welche Größen gibt es und was kosten sie?">
        <SizesPricingEditor
          sizes={form.sizes}
          pricing={form.pricing}
          onSizesChange={v => set('sizes', v)}
          onPricingChange={v => set('pricing', v)}
        />
      </Section>

      {/* ── 3: Druckbereich ── */}
      <Section number={3} title="Physischer Druckbereich" description="Wie groß ist die bedruckbare Fläche auf dem Produkt?">
        <div className="flex items-end gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-[#1d1d1f] mb-2">Breite</label>
            <div className="relative">
              <input type="number" step="0.1" value={form.physical_width_cm} onChange={e => set('physical_width_cm', parseFloat(e.target.value))} className="yprint-input pr-10" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[rgba(0,0,0,0.4)]">cm</span>
            </div>
          </div>
          <div className="pb-3 text-2xl text-[rgba(0,0,0,0.2)]">×</div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-[#1d1d1f] mb-2">Höhe</label>
            <div className="relative">
              <input type="number" step="0.1" value={form.physical_height_cm} onChange={e => set('physical_height_cm', parseFloat(e.target.value))} className="yprint-input pr-10" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[rgba(0,0,0,0.4)]">cm</span>
            </div>
          </div>
          <div className="pb-3 flex-1 text-sm text-[rgba(0,0,0,0.4)]">
            = {form.physical_width_cm * 10} × {form.physical_height_cm * 10} mm
          </div>
        </div>
      </Section>

      {/* ── 4: Maßtabelle ── */}
      <Section number={4} title="Maßtabelle" description="Shirt-Abmessungen pro Größe — das System berechnet daraus präzise Druckkoordinaten für jede Bestellung">
        <MeasurementsEditor
          value={form.measurements}
          onChange={v => set('measurements', v)}
          printWidthCm={form.physical_width_cm}
          printHeightCm={form.physical_height_cm}
        />
      </Section>

      {/* ── 5: Farben & Designs ── */}
      <Section number={5} title="Farben & Ansichten" description="Jede Farbe kann mehrere Ansichten haben (z.B. Front, Rücken). Hier stellst du auch die Druckzonen ein.">
        <VariationsEditor
          variations={form.variations}
          onChange={v => set('variations', v as Record<string, VariationData>)}
        />
      </Section>

      {/* ── 6: Druckpartner ── */}
      <Section number={6} title="Druckpartner-Konfiguration" description="Technische Einstellungen für die Übergabe an AllesKlarDruck — ändert sich selten">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <label className="block text-sm font-medium text-[#1d1d1f] mb-2">Produkttyp</label>
            <select value={form.akd.product_type} onChange={e => setAkd('product_type', e.target.value)} className="yprint-input">
              {AKD_PRODUCT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1d1d1f] mb-2">Druckmethode</label>
            <select value={form.akd.print_method} onChange={e => setAkd('print_method', e.target.value)} className="yprint-input">
              {AKD_PRINT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1d1d1f] mb-2">Hersteller</label>
            <input type="text" value={form.akd.manufacturer} onChange={e => setAkd('manufacturer', e.target.value)} className="yprint-input" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1d1d1f] mb-2">Kollektion</label>
            <input type="text" value={form.akd.series} onChange={e => setAkd('series', e.target.value)} className="yprint-input" placeholder="z.B. SS25" />
          </div>
        </div>
      </Section>

      {/* ── Danger zone ── */}
      {!isNew && (
        <div className="pt-4 flex justify-end">
          <button
            onClick={async () => {
              if (!confirm(`"${form.name}" wirklich löschen? Das kann nicht rückgängig gemacht werden.`)) return
              await fetch(`/api/admin/templates/${params.id}`, { method: 'DELETE' })
              router.push('/admin/templates')
            }}
            className="text-sm text-red-400 hover:text-red-600 hover:underline transition-colors"
          >
            Template löschen
          </button>
        </div>
      )}
    </div>
  )
}
