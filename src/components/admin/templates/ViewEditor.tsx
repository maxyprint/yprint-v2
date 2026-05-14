'use client'

import { useRef, useState } from 'react'
import { ZoneEditor, ZonePct } from './ZoneEditor'

export interface ViewData {
  name: string
  image_url: string
  colorOverlayEnabled: boolean
  overlayOpacity: number
  akd_position: string
  safeZone: { left: number; top: number; width: number; height: number }
  imageZone: { left: number; top: number; scaleX: number; scaleY: number; angle: number }
  printZone: {
    left: number; top: number; width: number; height: number
    offsetX_mm: number; offsetY_mm: number; width_mm: number; height_mm: number
  }
}

const AKD_POSITIONS = ['front', 'back', 'left', 'right', 'neck', 'sleeve_left', 'sleeve_right']

interface Props {
  viewId: string
  view: ViewData
  onChange: (v: ViewData) => void
  onRemove: () => void
}

// Convert stored format → ZonePct (needs image natural dimensions)
function toPct(zone: { left: number; top: number; width: number; height: number }, nW: number, nH: number): ZonePct {
  return {
    left: zone.left,
    top: zone.top,
    width: nW > 0 ? (zone.width / nW) * 100 : 40,
    height: nH > 0 ? (zone.height / nH) * 100 : 25,
  }
}

// Convert ZonePct → stored format
function fromPct(pct: ZonePct, nW: number, nH: number) {
  return {
    left: Math.round(pct.left * 10) / 10,
    top:  Math.round(pct.top  * 10) / 10,
    width:  Math.round((pct.width  / 100) * nW),
    height: Math.round((pct.height / 100) * nH),
  }
}

function NumInput({ label, value, onChange, unit, step = 1, min = 0 }: {
  label: string; value: number; onChange: (v: number) => void
  unit: string; step?: number; min?: number
}) {
  return (
    <div>
      <label className="block text-xs text-[rgba(0,0,0,0.5)] mb-1">{label}</label>
      <div className="relative">
        <input
          type="number"
          step={step}
          min={min}
          value={value}
          onChange={e => onChange(parseFloat(e.target.value) || 0)}
          className="yprint-input text-sm pr-9 w-full"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[rgba(0,0,0,0.35)] pointer-events-none">{unit}</span>
      </div>
    </div>
  )
}

export function ViewEditor({ viewId, view, onChange, onRemove }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [naturalSize, setNaturalSize] = useState<{ w: number; h: number } | null>(null)

  const set = <K extends keyof ViewData>(field: K, value: ViewData[K]) =>
    onChange({ ...view, [field]: value })

  const setSz = (field: keyof ViewData['safeZone'], value: number) =>
    onChange({ ...view, safeZone: { ...view.safeZone, [field]: value } })

  const setPz = (field: keyof ViewData['printZone'], value: number) =>
    onChange({ ...view, printZone: { ...view.printZone, [field]: value } })

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadError(null)
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/admin/template-images', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload fehlgeschlagen.')
      set('image_url', data.url)
    } catch (err: any) {
      setUploadError(err.message)
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  // Derive ZonePct from stored zones + natural image size
  const nW = naturalSize?.w ?? 0
  const nH = naturalSize?.h ?? 0
  const safeZonePct  = nW > 0 ? toPct(view.safeZone,  nW, nH) : { left: view.safeZone.left,  top: view.safeZone.top,  width: 60, height: 52 }
  const printZonePct = nW > 0 ? toPct(view.printZone, nW, nH) : { left: view.printZone.left, top: view.printZone.top, width: 40, height: 24 }

  const handleSafeChange = (pct: ZonePct) => {
    if (nW === 0) return
    const { left, top, width, height } = fromPct(pct, nW, nH)
    onChange({ ...view, safeZone: { left, top, width, height } })
  }

  const handlePrintChange = (pct: ZonePct) => {
    if (nW === 0) return
    const { left, top, width, height } = fromPct(pct, nW, nH)
    onChange({ ...view, printZone: { ...view.printZone, left, top, width, height } })
  }

  return (
    <div className="rounded-2xl border border-[#e5e7eb] overflow-hidden">
      {/* View header */}
      <div className="flex items-center justify-between px-5 py-3 bg-[#f3f4f6] border-b border-[#e5e7eb]">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-[#1d1d1f]">{view.name || 'Neuer View'}</span>
          <span className="text-xs bg-[#1d1d1f]/10 text-[#1d1d1f] px-2 py-0.5 rounded-full font-mono">{viewId}</span>
        </div>
        <button type="button" onClick={onRemove} className="text-xs text-[rgba(0,0,0,0.4)] hover:text-red-500 transition-colors">
          View entfernen
        </button>
      </div>

      <div className="p-5 space-y-6 bg-white">
        {/* Basic info row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#1d1d1f] mb-1.5">View-Name</label>
            <input type="text" value={view.name} onChange={e => set('name', e.target.value)} className="yprint-input" placeholder="z.B. Front" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1d1d1f] mb-1.5">Druckposition <span className="font-normal text-[rgba(0,0,0,0.4)]">→ AKD</span></label>
            <select value={view.akd_position} onChange={e => set('akd_position', e.target.value)} className="yprint-input">
              {AKD_POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>

        {/* Mockup image upload */}
        <div>
          <label className="block text-sm font-medium text-[#1d1d1f] mb-1.5">Mockup-Bild</label>
          <div className="flex items-center gap-3">
            <div
              className="w-16 h-16 flex-shrink-0 rounded-xl border-2 border-dashed border-[#e5e7eb] bg-[#f9fafb] flex items-center justify-center overflow-hidden cursor-pointer hover:border-[#0079FF]/40 transition-colors relative group"
              onClick={() => fileInputRef.current?.click()}
            >
              {view.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={view.image_url} alt="" className="w-full h-full object-contain" />
              ) : (
                <span className="text-xl text-[rgba(0,0,0,0.2)]">+</span>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
                <span className="text-white text-xs font-medium">Upload</span>
              </div>
              {uploading && (
                <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-xl">
                  <div className="w-4 h-4 border-2 border-[#0079FF] border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
            <div className="flex-1 space-y-1.5">
              <input type="text" value={view.image_url} onChange={e => set('image_url', e.target.value)} className="yprint-input font-mono text-sm w-full" placeholder="/templates/shirt-white-front.png" />
              <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="text-sm text-[#0079FF] hover:underline disabled:opacity-50">
                {uploading ? 'Wird hochgeladen…' : '↑ Bild hochladen (PNG, JPG, WebP)'}
              </button>
              {uploadError && <p className="text-xs text-red-500">{uploadError}</p>}
            </div>
          </div>
          <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleFileUpload} />
        </div>

        {/* Color overlay */}
        <div className="flex items-center gap-4 py-3 px-4 bg-[#f9fafb] rounded-xl">
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input type="checkbox" checked={view.colorOverlayEnabled} onChange={e => set('colorOverlayEnabled', e.target.checked)} className="w-4 h-4" />
            <span className="text-sm font-medium text-[#1d1d1f]">Farboverlay</span>
          </label>
          {view.colorOverlayEnabled && (
            <>
              <span className="text-[rgba(0,0,0,0.3)]">·</span>
              <div className="flex items-center gap-3 flex-1">
                <span className="text-sm text-[rgba(0,0,0,0.5)]">Deckkraft</span>
                <input type="range" min={0} max={1} step={0.05} value={view.overlayOpacity} onChange={e => set('overlayOpacity', parseFloat(e.target.value))} className="flex-1 max-w-40" />
                <span className="text-sm font-mono w-10 text-right">{Math.round(view.overlayOpacity * 100)}%</span>
              </div>
            </>
          )}
        </div>

        {/* ── Visual Zone Editor ── */}
        <div>
          <p className="text-sm font-semibold text-[#1d1d1f] mb-3">
            Zonen{!naturalSize && view.image_url && <span className="text-xs font-normal text-[rgba(0,0,0,0.4)] ml-2">Bild wird geladen…</span>}
          </p>
          <ZoneEditor
            imageUrl={view.image_url}
            safeZone={safeZonePct}
            printZone={printZonePct}
            onSafeChange={handleSafeChange}
            onPrintChange={handlePrintChange}
            onNaturalSize={(w, h) => setNaturalSize({ w, h })}
          />

          {/* Number inputs — synced with visual editor */}
          {naturalSize && (
            <div className="mt-4 space-y-3">
              <div>
                <p className="text-xs font-medium text-[rgba(0,0,0,0.5)] uppercase tracking-wide mb-2">Safe Zone (Canvas)</p>
                <div className="grid grid-cols-4 gap-2">
                  <NumInput label="Links"  value={view.safeZone.left}   onChange={v => setSz('left', v)}   unit="%" />
                  <NumInput label="Oben"   value={view.safeZone.top}    onChange={v => setSz('top', v)}    unit="%" />
                  <NumInput label="Breite" value={view.safeZone.width}  onChange={v => setSz('width', v)}  unit="px" />
                  <NumInput label="Höhe"   value={view.safeZone.height} onChange={v => setSz('height', v)} unit="px" />
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-[rgba(0,0,0,0.5)] uppercase tracking-wide mb-2">Print Zone — Vorschau (Canvas)</p>
                <div className="grid grid-cols-4 gap-2">
                  <NumInput label="Links"  value={view.printZone.left}   onChange={v => setPz('left', v)}   unit="%" />
                  <NumInput label="Oben"   value={view.printZone.top}    onChange={v => setPz('top', v)}    unit="%" />
                  <NumInput label="Breite" value={view.printZone.width}  onChange={v => setPz('width', v)}  unit="px" />
                  <NumInput label="Höhe"   value={view.printZone.height} onChange={v => setPz('height', v)} unit="px" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* mm coordinates auto-calculated from measurements per size — no manual inputs needed */}
      </div>
    </div>
  )
}
