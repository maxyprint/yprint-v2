'use client'

import { useRef, useState, useCallback } from 'react'
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

// Designer canvas fixed dimensions (from designer.bundle.js)
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
// left/top = CENTER position %, width/height = SIZE %.
// Matching designer.bundle.js: rect.left = zone.left * canvas.width / 100, originX:'center'
//
// imageZone uses centered contain-fit:
//   scale = min(CANVAS_W/naturalW, CANVAS_H/naturalH)
//   imageZone = {left:50, top:50, scaleX:scale, scaleY:scale}
//
// Zone positions must account for the centering offset (gaps around the image):
//   offsetX = (CANVAS_W - naturalW * scale) / 2
//   offsetY = (CANVAS_H - naturalH * scale) / 2
//   x_pct = (offsetX + naturalX * scale) / CANVAS_W * 100  ← center position
//   y_pct = (offsetY + naturalY * scale) / CANVAS_H * 100
//   width_pct  = naturalW_px * scale / CANVAS_W * 100      ← size (no offset)
//   height_pct = naturalH_px * scale / CANVAS_H * 100
function calcZones(
  cal: CalibrationData,
  measurements: MeasurementsData,
  printWidthCm: number,
  printHeightCm: number,
  naturalW: number,
  naturalH: number,
): { imageZone: ViewData['imageZone']; safeZone: ViewData['safeZone']; printZone: ViewData['printZone'] } | null {
  const refM = measurements.per_size[cal.referenceSize]
  if (!refM) return null
  const shirtWidthPx = (cal.chestLine.x2 - cal.chestLine.x1) / 100 * naturalW
  if (shirtWidthPx <= 0) return null

  const ratio        = shirtWidthPx / refM.chest_cm
  const shirtLeftPx  = (cal.chestLine.x1 / 100) * naturalW
  const collarTopPx  = (cal.collarLine.y  / 100) * naturalH
  const printWidthPx  = printWidthCm  * ratio
  const printHeightPx = printHeightCm * ratio
  const shirtHeightPx = refM.length_cm * ratio
  const printLeftPx  = shirtLeftPx + (refM.chest_cm - printWidthCm) / 2 * ratio
  const printTopPx   = collarTopPx + (refM.rib_height_cm + measurements.print_y_offset_mm / 10) * ratio

  const scale   = Math.min(CANVAS_W / naturalW, CANVAS_H / naturalH)
  const offsetX = (CANVAS_W - naturalW * scale) / 2
  const offsetY = (CANVAS_H - naturalH * scale) / 2

  const r  = (v: number) => Math.round(v * 10)  / 10
  const r3 = (v: number) => Math.round(v * 1000) / 1000
  // Center position as % of canvas (accounts for centering offset)
  const xPos = (px: number) => r((offsetX + px * scale) / CANVAS_W * 100)
  const yPos = (py: number) => r((offsetY + py * scale) / CANVAS_H * 100)
  // Size as % of canvas (no offset)
  const xSz  = (px: number) => r(px * scale / CANVAS_W * 100)
  const ySz  = (py: number) => r(py * scale / CANVAS_H * 100)

  return {
    imageZone: {
      left: 50, top: 50,  // contain-fit centered always lands at 50/50
      scaleX: r3(scale), scaleY: r3(scale), angle: 0,
    },
    safeZone: {
      left:   xPos(shirtLeftPx + shirtWidthPx  / 2),
      top:    yPos(collarTopPx  + shirtHeightPx / 2),
      width:  xSz(shirtWidthPx),
      height: ySz(shirtHeightPx),
    },
    printZone: {
      left:   xPos(printLeftPx + printWidthPx  / 2),
      top:    yPos(printTopPx  + printHeightPx / 2),
      width:  xSz(printWidthPx),
      height: ySz(printHeightPx),
    },
  }
}

export function ViewEditor({ viewId, view, onChange, onRemove, measurements, printWidthCm, printHeightCm }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [naturalSize, setNaturalSize] = useState<{ w: number; h: number } | null>(null)

  const applyCalc = useCallback((cal: CalibrationData, ns: { w: number; h: number } | null) => {
    if (!ns || !measurements) return
    const result = calcZones(cal, measurements, printWidthCm, printHeightCm, ns.w, ns.h)
    if (result) {
      onChange({ ...view, calibration: cal, imageZone: result.imageZone, safeZone: result.safeZone, printZone: result.printZone })
    } else {
      onChange({ ...view, calibration: cal })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [measurements, printWidthCm, printHeightCm, view])

  const handleCalibrationChange = (cal: CalibrationData) => applyCalc(cal, naturalSize)

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
        const ns = { w: img.naturalWidth, h: img.naturalHeight }
        setNaturalSize(ns)
        const imageZone = {
          left: 50,
          top: 50,
          scaleX: Math.round(scale * 1000) / 1000,
          scaleY: Math.round(scale * 1000) / 1000,
          angle: 0 as const,
        }
        // If calibration is already set, recompute zones with new image size
        const result = measurements
          ? calcZones(view.calibration, measurements, printWidthCm, printHeightCm, ns.w, ns.h)
          : null
        if (result) {
          onChange({ ...view, image_url: data.url, imageZone: result.imageZone, safeZone: result.safeZone, printZone: result.printZone })
        } else {
          onChange({ ...view, image_url: data.url, imageZone })
        }
      }
      img.onerror = () => onChange({ ...view, image_url: data.url })
      img.src = data.url
    } catch (err: any) {
      setUploadError(err.message)
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const set = <K extends keyof ViewData>(field: K, value: ViewData[K]) =>
    onChange({ ...view, [field]: value })

  const availableSizes = measurements ? Object.keys(measurements.per_size) : []
  const calOk = (view.calibration.chestLine.x2 - view.calibration.chestLine.x1) > 0

  // Zone overlays for CalibrationEditor (convert center-% to CSS left-edge %)
  const sz = view.safeZone
  const pz = view.printZone
  const safeOverlay  = calOk ? { left: sz.left - sz.width  / 2, top: sz.top - sz.height / 2, width: sz.width,  height: sz.height  } : null
  const printOverlay = calOk ? { left: pz.left - pz.width  / 2, top: pz.top - pz.height / 2, width: pz.width,  height: pz.height  } : null

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
                placeholder="/api/template-assets/..."
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

        {/* Calibration + zone preview */}
        <div>
          <div className="mb-3">
            <p className="text-sm font-semibold text-[#1d1d1f]">Kalibrierung &amp; Zonenvorschau</p>
            <p className="text-xs text-[rgba(0,0,0,0.4)] mt-0.5">
              Ziehe den blauen Balken auf die Brustbreite des Shirts und den orangen Strich auf die Kragen-Unterkante.
              Print Zone und Safe Zone werden automatisch berechnet und als Overlay dargestellt.
            </p>
          </div>
          <CalibrationEditor
            imageUrl={view.image_url}
            calibration={view.calibration}
            onChange={handleCalibrationChange}
            onNaturalSize={(w, h) => setNaturalSize({ w, h })}
            availableSizes={availableSizes}
            zoneOverlay={safeOverlay && printOverlay ? { safe: safeOverlay, print: printOverlay } : undefined}
          />
          {!measurements && (
            <p className="text-xs text-amber-500 mt-2">
              Maßtabelle noch nicht gesetzt (Section 4) — Zonen können erst berechnet werden wenn Maße vorhanden.
            </p>
          )}
          {measurements && !calOk && (
            <p className="text-xs text-[rgba(0,0,0,0.4)] mt-2">
              Kalibrierungslinien setzen um Zonen zu berechnen.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
