'use client'

import { useRef, useState, useEffect } from 'react'
import { ZoneEditor, ZonePct } from './ZoneEditor'
import { MeasurementsData } from '@/lib/print/calcCoords'

export interface ViewData {
  name: string
  image_url: string
  colorOverlayEnabled: boolean
  overlayOpacity: number
  akd_position: string
  safeZone: { left: number; top: number; width: number; height: number }
  imageZone: { left: number; top: number; scaleX: number; scaleY: number; angle: number }
  printZone: { left: number; top: number; width: number; height: number }
  calibration: {
    shirtLeftPct: number   // % - left edge of shirt on image
    shirtTopPct: number    // % - top of collar on image
    shirtWidthPx: number   // px on natural image - shirt width at chest level
    referenceSize: string  // which size's measurements to use
  }
}

const AKD_POSITIONS = ['front', 'back', 'left', 'right', 'neck', 'sleeve_left', 'sleeve_right']

interface Props {
  viewId: string
  view: ViewData
  onChange: (v: ViewData) => void
  onRemove: () => void
  measurements: MeasurementsData | null
  printWidthCm: number
  printHeightCm: number
}

function calcZonesFromCalibration(
  cal: ViewData['calibration'],
  measurements: MeasurementsData,
  printWidthCm: number,
  printHeightCm: number,
  naturalW: number,
  naturalH: number,
): { safeZone: ViewData['safeZone']; printZone: ViewData['printZone'] } | null {
  const refM = measurements.per_size[cal.referenceSize]
  if (!refM || cal.shirtWidthPx <= 0 || naturalW <= 0) return null

  const ratio = cal.shirtWidthPx / refM.chest_cm  // px per cm on the image
  const shirtLeftPx = (cal.shirtLeftPct / 100) * naturalW
  const shirtTopPx  = (cal.shirtTopPct  / 100) * naturalH

  const printLeftPx = shirtLeftPx + (refM.chest_cm - printWidthCm) / 2 * ratio
  const printTopPx  = shirtTopPx  + (refM.rib_height_cm + measurements.print_y_offset_mm / 10) * ratio

  return {
    safeZone: {
      left:   cal.shirtLeftPct,
      top:    cal.shirtTopPct,
      width:  Math.round(cal.shirtWidthPx),
      height: Math.round(refM.length_cm * ratio),
    },
    printZone: {
      left:   Math.round((printLeftPx / naturalW) * 100 * 10) / 10,
      top:    Math.round((printTopPx  / naturalH) * 100 * 10) / 10,
      width:  Math.round(printWidthCm * ratio),
      height: Math.round(printHeightCm * ratio),
    },
  }
}

// Convert stored px zone → ZonePct for ZoneEditor display
function toPct(zone: { left: number; top: number; width: number; height: number }, nW: number, nH: number): ZonePct {
  return {
    left:   zone.left,
    top:    zone.top,
    width:  nW > 0 ? (zone.width  / nW) * 100 : 40,
    height: nH > 0 ? (zone.height / nH) * 100 : 25,
  }
}

export function ViewEditor({ viewId, view, onChange, onRemove, measurements, printWidthCm, printHeightCm }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [naturalSize, setNaturalSize] = useState<{ w: number; h: number } | null>(null)

  const set = <K extends keyof ViewData>(field: K, value: ViewData[K]) =>
    onChange({ ...view, [field]: value })

  const setCal = (field: keyof ViewData['calibration'], value: string | number) =>
    onChange({ ...view, calibration: { ...view.calibration, [field]: value } })

  // Auto-recalculate zones whenever calibration or natural size changes
  useEffect(() => {
    if (!naturalSize || !measurements) return
    const result = calcZonesFromCalibration(
      view.calibration, measurements, printWidthCm, printHeightCm,
      naturalSize.w, naturalSize.h,
    )
    if (!result) return
    onChange({ ...view, safeZone: result.safeZone, printZone: result.printZone })
  // Only run when calibration or image dimensions change — not on every view change
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view.calibration, naturalSize, printWidthCm, printHeightCm])

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
      setNaturalSize(null)  // reset so recalc fires on new image load
    } catch (err: any) {
      setUploadError(err.message)
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const nW = naturalSize?.w ?? 0
  const nH = naturalSize?.h ?? 0
  const safeZonePct  = nW > 0 ? toPct(view.safeZone,  nW, nH) : { left: view.safeZone.left,  top: view.safeZone.top,  width: 60, height: 52 }
  const printZonePct = nW > 0 ? toPct(view.printZone, nW, nH) : { left: view.printZone.left, top: view.printZone.top, width: 40, height: 24 }

  const availableSizes = measurements ? Object.keys(measurements.per_size) : []
  const hasCalibration = view.calibration.shirtWidthPx > 0

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

      <div className="p-5 space-y-5 bg-white">
        {/* Name + AKD position */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#1d1d1f] mb-1.5">View-Name</label>
            <input type="text" value={view.name} onChange={e => set('name', e.target.value)} className="yprint-input" placeholder="z.B. Front" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1d1d1f] mb-1.5">
              Druckposition <span className="font-normal text-[rgba(0,0,0,0.4)]">→ AKD</span>
            </label>
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
              <input
                type="text"
                value={view.image_url}
                onChange={e => set('image_url', e.target.value)}
                className="yprint-input font-mono text-sm w-full"
                placeholder="/templates/shirt-white-front.png"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="text-sm text-[#0079FF] hover:underline disabled:opacity-50"
              >
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
            <input
              type="checkbox"
              checked={view.colorOverlayEnabled}
              onChange={e => set('colorOverlayEnabled', e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm font-medium text-[#1d1d1f]">Farboverlay aktivieren</span>
          </label>
          {view.colorOverlayEnabled && (
            <>
              <span className="text-[rgba(0,0,0,0.3)]">·</span>
              <div className="flex items-center gap-3 flex-1">
                <span className="text-sm text-[rgba(0,0,0,0.5)]">Deckkraft</span>
                <input
                  type="range" min={0} max={1} step={0.05}
                  value={view.overlayOpacity}
                  onChange={e => set('overlayOpacity', parseFloat(e.target.value))}
                  className="flex-1 max-w-40"
                />
                <span className="text-sm font-mono w-10 text-right">{Math.round(view.overlayOpacity * 100)}%</span>
              </div>
            </>
          )}
        </div>

        {/* Calibration */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-semibold text-[#1d1d1f]">Kalibrierung</p>
              <p className="text-xs text-[rgba(0,0,0,0.4)] mt-0.5">
                Gib an wo das Shirt auf dem Bild sitzt — Safe Zone und Print Zone werden automatisch berechnet.
              </p>
            </div>
            {hasCalibration && (
              <span className="text-xs bg-green-50 text-green-600 border border-green-200 px-2 py-0.5 rounded-full font-medium">
                Aktiv
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div>
              <label className="block text-xs text-[rgba(0,0,0,0.5)] mb-1">Shirt links</label>
              <div className="relative">
                <input
                  type="number" step={0.5} min={0} max={50}
                  value={view.calibration.shirtLeftPct}
                  onChange={e => setCal('shirtLeftPct', parseFloat(e.target.value) || 0)}
                  className="yprint-input pr-6 text-sm"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[rgba(0,0,0,0.35)]">%</span>
              </div>
            </div>
            <div>
              <label className="block text-xs text-[rgba(0,0,0,0.5)] mb-1">Shirt oben</label>
              <div className="relative">
                <input
                  type="number" step={0.5} min={0} max={50}
                  value={view.calibration.shirtTopPct}
                  onChange={e => setCal('shirtTopPct', parseFloat(e.target.value) || 0)}
                  className="yprint-input pr-6 text-sm"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[rgba(0,0,0,0.35)]">%</span>
              </div>
            </div>
            <div>
              <label className="block text-xs text-[rgba(0,0,0,0.5)] mb-1">Shirt-Breite</label>
              <div className="relative">
                <input
                  type="number" step={1} min={0}
                  value={view.calibration.shirtWidthPx}
                  onChange={e => setCal('shirtWidthPx', parseFloat(e.target.value) || 0)}
                  className="yprint-input pr-7 text-sm"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[rgba(0,0,0,0.35)]">px</span>
              </div>
              {naturalSize && (
                <p className="text-xs text-[rgba(0,0,0,0.35)] mt-1">Bild: {naturalSize.w} px breit</p>
              )}
            </div>
            <div>
              <label className="block text-xs text-[rgba(0,0,0,0.5)] mb-1">Referenzgröße</label>
              <select
                value={view.calibration.referenceSize}
                onChange={e => setCal('referenceSize', e.target.value)}
                className="yprint-input text-sm"
              >
                {availableSizes.length > 0
                  ? availableSizes.map(s => <option key={s} value={s}>{s}</option>)
                  : <option value="M">M</option>
                }
              </select>
            </div>
          </div>

          {!measurements && (
            <p className="text-xs text-amber-500 mt-2">
              Maßtabelle noch nicht gesetzt — erst Section 4 ausfüllen, dann wird die Zone automatisch berechnet.
            </p>
          )}
        </div>

        {/* Zone preview */}
        <div>
          <p className="text-sm font-semibold text-[#1d1d1f] mb-3">
            Zonenvorschau
            {!naturalSize && view.image_url && (
              <span className="text-xs font-normal text-[rgba(0,0,0,0.4)] ml-2">Bild wird geladen…</span>
            )}
          </p>
          <ZoneEditor
            imageUrl={view.image_url}
            safeZone={safeZonePct}
            printZone={printZonePct}
            readOnly={hasCalibration}
            onSafeChange={() => {}}
            onPrintChange={() => {}}
            onNaturalSize={(w, h) => setNaturalSize({ w, h })}
          />
        </div>
      </div>
    </div>
  )
}
