'use client'

import { useRef, useState, useMemo } from 'react'
import { CalibrationEditor, CalibrationData } from './CalibrationEditor'
import { MeasurementsData } from '@/lib/print/calcCoords'

export interface ViewData {
  name: string
  image_url: string
  colorOverlayEnabled: boolean
  overlayOpacity: number
  akd_position: string
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
// imageZone uses centered contain-fit:
//   scale = min(CANVAS_W/naturalW, CANVAS_H/naturalH)
//   imageZone = {left:50, top:50, scaleX:scale, scaleY:scale}
//
// printZone size comes from physical dimensions × pxPerCm derived from
// the two calibration lines (H-line = X scale, V-line = Y scale).
// printZone position comes from cal.printCenter (image-%) mapped to canvas-%.
// There is no automatic position — admin places it manually via drag.
function calcPrintZone(
  cal: CalibrationData,
  measurements: MeasurementsData,
  physW_cm: number,
  physH_cm: number,
  naturalW: number,
  naturalH: number,
): { imageZone: ViewData['imageZone']; printZone: ViewData['printZone'] } | null {
  const refM = measurements.per_size[cal.referenceSize]
  if (!refM) return null
  const hRefCm = (refM as unknown as Record<string, number>)[cal.hField]
  const vRefCm = (refM as unknown as Record<string, number>)[cal.vField]
  if (!hRefCm || !vRefCm) return null

  const hPx = (cal.hLine.x2 - cal.hLine.x1) / 100 * naturalW
  const vPx = (cal.vLine.y2 - cal.vLine.y1) / 100 * naturalH
  if (hPx <= 0 || vPx <= 0) return null

  const pxPerCmX = hPx / hRefCm
  const pxPerCmY = vPx / vRefCm

  const printW_px = physW_cm * pxPerCmX
  const printH_px = physH_cm * pxPerCmY

  const scale   = Math.min(CANVAS_W / naturalW, CANVAS_H / naturalH)
  const offsetX = (CANVAS_W - naturalW * scale) / 2
  const offsetY = (CANVAS_H - naturalH * scale) / 2

  const r  = (v: number) => Math.round(v * 10)  / 10
  const r3 = (v: number) => Math.round(v * 1000) / 1000

  // Derive canvas center from printTopLeft (image-%) + half of print size
  const widthImgPct   = printW_px / naturalW * 100
  const heightImgPct  = printH_px / naturalH * 100
  const centerX_img   = cal.printTopLeft.x + widthImgPct  / 2
  const centerY_img   = cal.printTopLeft.y + heightImgPct / 2

  const cx = r((offsetX + centerX_img / 100 * naturalW * scale) / CANVAS_W * 100)
  const cy = r((offsetY + centerY_img / 100 * naturalH * scale) / CANVAS_H * 100)

  return {
    imageZone: { left: 50, top: 50, scaleX: r3(scale), scaleY: r3(scale), angle: 0 },
    printZone: {
      left:   cx,
      top:    cy,
      width:  r(printW_px * scale / CANVAS_W * 100),
      height: r(printH_px * scale / CANVAS_H * 100),
    },
  }
}

export function ViewEditor({ viewId, view, onChange, onRemove, measurements, printWidthCm, printHeightCm }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [naturalSize, setNaturalSize] = useState<{ w: number; h: number } | null>(null)

  // Only update calibration data — size is recalculated explicitly via the button below
  const handleCalibrationChange = (cal: CalibrationData) => onChange({ ...view, calibration: cal })

  // One-shot calculation: pxPerCm from calibration lines → printZone dimensions
  const applyCalibration = () => {
    if (!naturalSize || !measurements) return
    const result = calcPrintZone(view.calibration, measurements, printWidthCm, printHeightCm, naturalSize.w, naturalSize.h)
    if (result) onChange({ ...view, imageZone: result.imageZone, printZone: result.printZone })
  }

  // Convert stored printZone canvas-% back to image-% for the CalibrationEditor overlay
  const printZoneSizePct = useMemo(() => {
    if (!naturalSize || view.printZone.width <= 0 || view.printZone.height <= 0) return null
    const scale = Math.min(CANVAS_W / naturalSize.w, CANVAS_H / naturalSize.h)
    return {
      w: view.printZone.width  / 100 * CANVAS_W / scale / naturalSize.w * 100,
      h: view.printZone.height / 100 * CANVAS_H / scale / naturalSize.h * 100,
    }
  }, [view.printZone.width, view.printZone.height, naturalSize])

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
        const result = measurements
          ? calcPrintZone(view.calibration, measurements, printWidthCm, printHeightCm, ns.w, ns.h)
          : null
        if (result) {
          onChange({ ...view, image_url: data.url, imageZone: result.imageZone, printZone: result.printZone })
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
  const availableFields = measurements
    ? Object.keys(measurements.per_size[view.calibration.referenceSize] ?? measurements.per_size[availableSizes[0]] ?? {})
    : []

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

        {/* Calibration + print zone */}
        <div>
          <div className="mb-3">
            <p className="text-sm font-semibold text-[#1d1d1f]">Kalibrierung &amp; Print Zone</p>
            <p className="text-xs text-[rgba(0,0,0,0.4)] mt-0.5">
              1. H-Linie auf die Referenzbreite ziehen, V-Linie auf die Referenzhöhe. &nbsp;
              2. "Kalibrierung anwenden" klicken → Größe wird einmalig aus physischen Maßen berechnet. &nbsp;
              3. Print Zone auf die gewünschte Druckposition ziehen.
            </p>
          </div>
          <CalibrationEditor
            imageUrl={view.image_url}
            calibration={view.calibration}
            onChange={handleCalibrationChange}
            onNaturalSize={(w, h) => setNaturalSize({ w, h })}
            availableSizes={availableSizes}
            availableFields={availableFields}
            measurements={measurements}
            physicalWidthCm={printWidthCm}
            physicalHeightCm={printHeightCm}
            printZoneSizePct={printZoneSizePct}
          />
          <div className="mt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={applyCalibration}
              disabled={!measurements || !naturalSize}
              className="px-4 py-2 text-sm font-medium bg-[#0079FF] text-white rounded-xl hover:bg-[#0066dd] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Kalibrierung anwenden
            </button>
            {!measurements && (
              <p className="text-xs text-amber-500">
                Maßtabelle fehlt (Abschnitt 4) — erst eintragen, dann kalibrieren.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
