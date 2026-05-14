'use client'

import { useRef, useState, useCallback } from 'react'
import { ZoneEditor, ZonePct } from './ZoneEditor'
import { CalibrationEditor, CalibrationData } from './CalibrationEditor'
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
  calibration: CalibrationData
}

const CANVAS_W = 616
const CANVAS_H = 626

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

// All zone values stored as % of canvas (0–100).
// left/top = CENTER position %. width/height = SIZE %.
// This matches designer.bundle.js: rect.left = zone.left * canvas.width / 100, originX:'center'
function calcZones(
  cal: CalibrationData,
  measurements: MeasurementsData,
  printWidthCm: number,
  printHeightCm: number,
  naturalW: number,
  naturalH: number,
): { safeZone: ViewData['safeZone']; printZone: ViewData['printZone'] } | null {
  const refM = measurements.per_size[cal.referenceSize]
  if (!refM) return null
  const shirtWidthPx = (cal.chestLine.x2 - cal.chestLine.x1) / 100 * naturalW
  if (shirtWidthPx <= 0) return null

  const ratio = shirtWidthPx / refM.chest_cm  // natural-image px per cm
  const shirtLeftPx  = (cal.chestLine.x1 / 100) * naturalW
  const collarTopPx  = (cal.collarLine.y  / 100) * naturalH

  const printWidthPx  = printWidthCm  * ratio
  const printHeightPx = printHeightCm * ratio
  const shirtHeightPx = refM.length_cm * ratio

  const printLeftPx = shirtLeftPx + (refM.chest_cm - printWidthCm) / 2 * ratio
  const printTopPx  = collarTopPx + (refM.rib_height_cm + measurements.print_y_offset_mm / 10) * ratio

  const printCenterX = printLeftPx  + printWidthPx  / 2
  const printCenterY = printTopPx   + printHeightPx / 2
  const shirtCenterX = shirtLeftPx  + shirtWidthPx  / 2
  const shirtCenterY = collarTopPx  + shirtHeightPx / 2

  const r = (v: number) => Math.round(v * 10) / 10

  return {
    safeZone: {
      left:   r((shirtCenterX / naturalW) * 100),
      top:    r((shirtCenterY / naturalH) * 100),
      width:  r((shirtWidthPx  / naturalW) * 100),
      height: r((shirtHeightPx / naturalH) * 100),
    },
    printZone: {
      left:   r((printCenterX  / naturalW) * 100),
      top:    r((printCenterY  / naturalH) * 100),
      width:  r((printWidthPx  / naturalW) * 100),
      height: r((printHeightPx / naturalH) * 100),
    },
  }
}

// Stored format: left/top = CENTER as %, width/height = SIZE as %.
// ZoneEditor CSS needs left-edge %, so toPct converts center→edge and fromPct converts back.
function toPct(zone: { left: number; top: number; width: number; height: number }): ZonePct {
  return {
    left:   zone.left   - zone.width  / 2,
    top:    zone.top    - zone.height / 2,
    width:  zone.width,
    height: zone.height,
  }
}

function fromPct(pct: ZonePct): { left: number; top: number; width: number; height: number } {
  const r = (v: number) => Math.round(v * 10) / 10
  return {
    left:   r(pct.left   + pct.width  / 2),
    top:    r(pct.top    + pct.height / 2),
    width:  r(pct.width),
    height: r(pct.height),
  }
}

export function ViewEditor({ viewId, view, onChange, onRemove, measurements, printWidthCm, printHeightCm }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [naturalSize, setNaturalSize] = useState<{ w: number; h: number } | null>(null)

  const set = <K extends keyof ViewData>(field: K, value: ViewData[K]) =>
    onChange({ ...view, [field]: value })

  const applyCalc = useCallback((cal: CalibrationData, ns: { w: number; h: number } | null) => {
    if (!ns || !measurements) return
    const result = calcZones(cal, measurements, printWidthCm, printHeightCm, ns.w, ns.h)
    if (result) onChange({ ...view, calibration: cal, safeZone: result.safeZone, printZone: result.printZone })
    else onChange({ ...view, calibration: cal })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [measurements, printWidthCm, printHeightCm, view.safeZone, view.printZone])

  const handleCalibrationChange = (cal: CalibrationData) => {
    applyCalc(cal, naturalSize)
  }

  const handleRecalc = () => {
    applyCalc(view.calibration, naturalSize)
  }

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

      const img = new window.Image()
      img.onload = () => {
        const scale = Math.min(CANVAS_W / img.naturalWidth, CANVAS_H / img.naturalHeight)
        onChange({
          ...view,
          image_url: data.url,
          imageZone: { left: 50, top: 50, scaleX: scale, scaleY: scale, angle: 0 },
        })
        setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight })
      }
      img.onerror = () => {
        set('image_url', data.url)
      }
      img.src = data.url
    } catch (err: any) {
      setUploadError(err.message)
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const safeZonePct  = toPct(view.safeZone)
  const printZonePct = toPct(view.printZone)

  const handleSafeChange  = (pct: ZonePct) => onChange({ ...view, safeZone:  fromPct(pct) })
  const handlePrintChange = (pct: ZonePct) => onChange({ ...view, printZone: fromPct(pct) })

  const availableSizes = measurements ? Object.keys(measurements.per_size) : []
  const calOk = (view.calibration.chestLine.x2 - view.calibration.chestLine.x1) > 0
  const canRecalc = !!measurements && !!naturalSize && calOk
  const recalcHint = !measurements
    ? 'Maßtabelle fehlt (Section 4)'
    : !naturalSize
    ? 'Bild noch nicht geladen'
    : !calOk
    ? 'Kalibrierungslinien setzen'
    : ''

  return (
    <div className="rounded-2xl border border-[#e5e7eb] overflow-hidden">
      {/* Header */}
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

        {/* Image upload */}
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
            <span className="text-sm font-medium text-[#1d1d1f]">Farboverlay aktivieren</span>
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

        {/* Calibration */}
        <div>
          <div className="mb-3">
            <p className="text-sm font-semibold text-[#1d1d1f]">Kalibrierung</p>
            <p className="text-xs text-[rgba(0,0,0,0.4)] mt-0.5">
              Ziehe den blauen Balken auf die Brustbreite des Shirts und den orangen Strich auf die Kragen-Unterkante.
              Safe Zone und Print Zone berechnen sich automatisch.
            </p>
          </div>
          <CalibrationEditor
            imageUrl={view.image_url}
            calibration={view.calibration}
            onChange={handleCalibrationChange}
            onNaturalSize={(w, h) => setNaturalSize({ w, h })}
            availableSizes={availableSizes}
          />
          {!measurements && (
            <p className="text-xs text-amber-500 mt-2">
              Maßtabelle noch nicht gesetzt (Section 4) — Zonen können erst berechnet werden wenn Maße vorhanden.
            </p>
          )}
        </div>

        {/* Zone editor — fine-tuning */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-semibold text-[#1d1d1f]">Zonenvorschau &amp; Feinabstimmung</p>
              <p className="text-xs text-[rgba(0,0,0,0.4)] mt-0.5">Ziehe die Zonen für manuelle Korrekturen. Zonen werden mit dem Template gespeichert.</p>
            </div>
            <button
              type="button"
              onClick={handleRecalc}
              disabled={!canRecalc}
              title={recalcHint}
              className="text-xs font-medium flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed text-[#0079FF] hover:underline disabled:no-underline"
            >
              ↺ Neu berechnen{recalcHint ? ` (${recalcHint})` : ''}
            </button>
          </div>
          <ZoneEditor
            imageUrl={view.image_url}
            safeZone={safeZonePct}
            printZone={printZonePct}
            onSafeChange={handleSafeChange}
            onPrintChange={handlePrintChange}
            onNaturalSize={(w, h) => setNaturalSize({ w, h })}
          />
        </div>
      </div>
    </div>
  )
}
