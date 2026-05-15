'use client'

import { useRef, useEffect, useState } from 'react'
import { MeasurementsData } from '@/lib/print/calcCoords'

export interface CalibrationData {
  referenceSize: string
  hField: string
  vField: string
  hLine: { y: number; x1: number; x2: number }   // % of image (0–100)
  vLine: { x: number; y1: number; y2: number }   // % of image (0–100)
  printCenter: { x: number; y: number }           // % of image (0–100)
}

interface Props {
  imageUrl: string
  calibration: CalibrationData
  onChange: (c: CalibrationData) => void
  onNaturalSize: (w: number, h: number) => void
  availableSizes: string[]
  availableFields: string[]
  measurements: MeasurementsData | null
  physicalWidthCm: number
  physicalHeightCm: number
}

type DragTarget =
  | { type: 'h-left' }
  | { type: 'h-right' }
  | { type: 'h-bar' }
  | { type: 'v-top' }
  | { type: 'v-bottom' }
  | { type: 'v-bar' }
  | { type: 'print-center' }

interface DragState {
  target: DragTarget
  startMX: number
  startMY: number
  startCal: CalibrationData
  cW: number
  cH: number
}

function clamp(v: number, lo = 0, hi = 100) {
  return Math.max(lo, Math.min(hi, v))
}

export function CalibrationEditor({
  imageUrl,
  calibration,
  onChange,
  onNaturalSize,
  availableSizes,
  availableFields,
  measurements,
  physicalWidthCm,
  physicalHeightCm,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<DragState | null>(null)
  const calRef = useRef(calibration)
  const onChangeRef = useRef(onChange)
  const [naturalSize, setNaturalSize] = useState<{ w: number; h: number } | null>(null)

  useEffect(() => { calRef.current = calibration }, [calibration])
  useEffect(() => { onChangeRef.current = onChange }, [onChange])

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const drag = dragRef.current
      if (!drag) return
      const dxPct = ((e.clientX - drag.startMX) / drag.cW) * 100
      const dyPct = ((e.clientY - drag.startMY) / drag.cH) * 100
      const c = drag.startCal
      const next = {
        ...c,
        hLine: { ...c.hLine },
        vLine: { ...c.vLine },
        printCenter: { ...c.printCenter },
      }
      switch (drag.target.type) {
        case 'h-left':
          next.hLine.x1 = clamp(c.hLine.x1 + dxPct, 0, c.hLine.x2 - 2)
          break
        case 'h-right':
          next.hLine.x2 = clamp(c.hLine.x2 + dxPct, c.hLine.x1 + 2, 100)
          break
        case 'h-bar':
          next.hLine.y = clamp(c.hLine.y + dyPct, 5, 95)
          break
        case 'v-top':
          next.vLine.y1 = clamp(c.vLine.y1 + dyPct, 0, c.vLine.y2 - 2)
          break
        case 'v-bottom':
          next.vLine.y2 = clamp(c.vLine.y2 + dyPct, c.vLine.y1 + 2, 100)
          break
        case 'v-bar':
          next.vLine.x = clamp(c.vLine.x + dxPct, 5, 95)
          break
        case 'print-center':
          next.printCenter.x = clamp(c.printCenter.x + dxPct, 0, 100)
          next.printCenter.y = clamp(c.printCenter.y + dyPct, 0, 100)
          break
      }
      onChangeRef.current(next)
    }
    const onUp = () => { dragRef.current = null }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [])

  const startDrag = (target: DragTarget, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const container = containerRef.current
    if (!container) return
    const rect = container.getBoundingClientRect()
    dragRef.current = {
      target,
      startMX: e.clientX,
      startMY: e.clientY,
      startCal: {
        ...calRef.current,
        hLine: { ...calRef.current.hLine },
        vLine: { ...calRef.current.vLine },
        printCenter: { ...calRef.current.printCenter },
      },
      cW: rect.width,
      cH: rect.height,
    }
  }

  // Actual cm values for the selected reference size + fields
  const refM = measurements?.per_size[calibration.referenceSize] ?? null
  const hRefCm = refM ? (refM as unknown as Record<string, number>)[calibration.hField] ?? null : null
  const vRefCm = refM ? (refM as unknown as Record<string, number>)[calibration.vField] ?? null : null

  // Print zone overlay size in image-% (purely for visual representation)
  const printZoneOverlay = (() => {
    if (!naturalSize || !measurements) return null
    if (!refM) return null
    if (!hRefCm || !vRefCm) return null
    const hPx = (calibration.hLine.x2 - calibration.hLine.x1) / 100 * naturalSize.w
    const vPx = (calibration.vLine.y2 - calibration.vLine.y1) / 100 * naturalSize.h
    if (hPx <= 0 || vPx <= 0) return null
    const widthPct  = physicalWidthCm  * (hPx / hRefCm) / naturalSize.w * 100
    const heightPct = physicalHeightCm * (vPx / vRefCm) / naturalSize.h * 100
    return {
      left:   calibration.printCenter.x - widthPct  / 2,
      top:    calibration.printCenter.y - heightPct / 2,
      width:  widthPct,
      height: heightPct,
    }
  })()

  const { hLine: hl, vLine: vl, printCenter: pc } = calibration
  const hWidth  = hl.x2 - hl.x1
  const vHeight = vl.y2 - vl.y1

  return (
    <div className="space-y-3">

      {/* ── Reference Measurements Panel ── */}
      <div className="p-4 bg-[#f9fafb] rounded-xl border border-[#e5e7eb]">
        <p className="text-xs font-semibold text-[#1d1d1f] mb-3">Referenzmaße</p>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-[rgba(0,0,0,0.5)] mb-1">Referenzgröße</label>
            <select
              value={calibration.referenceSize}
              onChange={e => onChange({ ...calibration, referenceSize: e.target.value })}
              className="w-full text-xs border border-[#e5e7eb] rounded-lg px-2 py-1.5 bg-white"
            >
              {availableSizes.length > 0
                ? availableSizes.map(s => <option key={s} value={s}>{s}</option>)
                : <option value="L">L</option>}
            </select>
          </div>
          <div>
            <label className="block text-xs text-[rgba(0,0,0,0.5)] mb-1">H-Referenz (Breite)</label>
            <select
              value={calibration.hField}
              onChange={e => onChange({ ...calibration, hField: e.target.value })}
              className="w-full text-xs border border-[#e5e7eb] rounded-lg px-2 py-1.5 bg-white"
            >
              {availableFields.length > 0
                ? availableFields.map(f => <option key={f} value={f}>{f}</option>)
                : <option value="chest_cm">chest_cm</option>}
            </select>
            {hRefCm != null && (
              <span className="text-xs font-mono text-[#0079FF] mt-0.5 block">{hRefCm} cm</span>
            )}
          </div>
          <div>
            <label className="block text-xs text-[rgba(0,0,0,0.5)] mb-1">V-Referenz (Höhe)</label>
            <select
              value={calibration.vField}
              onChange={e => onChange({ ...calibration, vField: e.target.value })}
              className="w-full text-xs border border-[#e5e7eb] rounded-lg px-2 py-1.5 bg-white"
            >
              {availableFields.length > 0
                ? availableFields.map(f => <option key={f} value={f}>{f}</option>)
                : <option value="length_cm">length_cm</option>}
            </select>
            {vRefCm != null && (
              <span className="text-xs font-mono text-amber-500 mt-0.5 block">{vRefCm} cm</span>
            )}
          </div>
        </div>
        {hRefCm != null && vRefCm != null && (
          <p className="text-xs text-[rgba(0,0,0,0.35)] mt-2.5">
            H-Linie auf genau <strong>{hRefCm} cm</strong> strecken ·
            V-Linie auf genau <strong>{vRefCm} cm</strong> strecken ·
            Blauer Punkt = Print Zone Position (verschieben)
          </p>
        )}
        {(!measurements || !refM) && (
          <p className="text-xs text-amber-500 mt-2">Maßtabelle fehlt — bitte in Abschnitt 4 eintragen.</p>
        )}
      </div>

      <div
        ref={containerRef}
        className="relative w-full rounded-xl border border-[#e5e7eb] bg-[#f3f4f6] select-none overflow-hidden"
      >
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt=""
            className="w-full h-auto block pointer-events-none rounded-xl"
            draggable={false}
            onLoad={e => {
              const img = e.currentTarget
              const ns = { w: img.naturalWidth, h: img.naturalHeight }
              setNaturalSize(ns)
              onNaturalSize(img.naturalWidth, img.naturalHeight)
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-64 text-sm text-[rgba(0,0,0,0.3)]">
            Bild hochladen um Kalibrierung zu starten
          </div>
        )}

        {imageUrl && (
          <>
            {/* ── Print Zone Rectangle (visual, pointerEvents:none) ── */}
            {printZoneOverlay && (
              <div style={{
                position: 'absolute',
                left:   `${printZoneOverlay.left}%`,
                top:    `${printZoneOverlay.top}%`,
                width:  `${printZoneOverlay.width}%`,
                height: `${printZoneOverlay.height}%`,
                background: 'rgba(0,121,255,0.08)',
                border: '1.5px solid rgba(0,121,255,0.55)',
                borderRadius: 2,
                pointerEvents: 'none',
              }}>
                <span style={{
                  position: 'absolute',
                  top: 4, left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'rgba(0,121,255,0.85)',
                  color: '#fff',
                  fontSize: 9,
                  fontWeight: 700,
                  padding: '1px 5px',
                  borderRadius: 3,
                  whiteSpace: 'nowrap',
                }}>
                  {physicalWidthCm}×{physicalHeightCm} cm
                </span>
              </div>
            )}

            {/* ── Print Zone Center Drag Handle ── */}
            <div
              style={{
                position: 'absolute',
                left: `${pc.x}%`,
                top:  `${pc.y}%`,
                width: 22, height: 22,
                transform: 'translate(-50%, -50%)',
                background: '#0079FF',
                border: '2.5px solid white',
                borderRadius: '50%',
                cursor: 'move',
                pointerEvents: 'auto',
                zIndex: 10,
                boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
              onMouseDown={e => startDrag({ type: 'print-center' }, e)}
            >
              <div style={{ width: 4, height: 4, background: 'white', borderRadius: '50%' }} />
            </div>

            {/* ── H-Line (blue horizontal, X-scale reference) ── */}
            <div style={{
              position: 'absolute',
              top: `${hl.y}%`,
              left: `${hl.x1}%`,
              width: `${hWidth}%`,
              transform: 'translateY(-50%)',
              pointerEvents: 'none',
            }}>
              {/* Bar */}
              <div
                style={{
                  position: 'absolute', left: 0, right: 0,
                  height: 3, background: '#0079FF', borderRadius: 2,
                  cursor: 'ns-resize', pointerEvents: 'auto',
                }}
                onMouseDown={e => startDrag({ type: 'h-bar' }, e)}
              />
              {/* Left handle */}
              <div
                style={{
                  position: 'absolute', left: -6, top: -9,
                  width: 14, height: 20, background: '#0079FF',
                  borderRadius: '4px 0 0 4px', cursor: 'ew-resize',
                  pointerEvents: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
                onMouseDown={e => startDrag({ type: 'h-left' }, e)}
              >
                <div style={{ width: 2, height: 10, background: 'rgba(255,255,255,0.6)', borderRadius: 1 }} />
              </div>
              {/* Right handle */}
              <div
                style={{
                  position: 'absolute', right: -6, top: -9,
                  width: 14, height: 20, background: '#0079FF',
                  borderRadius: '0 4px 4px 0', cursor: 'ew-resize',
                  pointerEvents: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
                onMouseDown={e => startDrag({ type: 'h-right' }, e)}
              >
                <div style={{ width: 2, height: 10, background: 'rgba(255,255,255,0.6)', borderRadius: 1 }} />
              </div>
              {/* Label */}
              <span style={{
                position: 'absolute', left: '50%',
                transform: 'translateX(-50%)', top: -18,
                background: '#0079FF', color: '#fff',
                fontSize: 10, fontWeight: 700,
                padding: '1px 6px', borderRadius: 4,
                whiteSpace: 'nowrap', pointerEvents: 'none',
              }}>
                {calibration.hField}{hRefCm != null ? ` = ${hRefCm} cm` : ''}
              </span>
            </div>

            {/* ── V-Line (orange vertical, Y-scale reference) ── */}
            <div style={{
              position: 'absolute',
              left: `${vl.x}%`,
              top: `${vl.y1}%`,
              height: `${vHeight}%`,
              transform: 'translateX(-50%)',
              pointerEvents: 'none',
            }}>
              {/* Bar */}
              <div
                style={{
                  position: 'absolute', top: 0, bottom: 0,
                  width: 3, background: '#f59e0b', borderRadius: 2,
                  cursor: 'ew-resize', pointerEvents: 'auto',
                }}
                onMouseDown={e => startDrag({ type: 'v-bar' }, e)}
              />
              {/* Top handle */}
              <div
                style={{
                  position: 'absolute', top: -6, left: -9,
                  width: 20, height: 14, background: '#f59e0b',
                  borderRadius: '4px 4px 0 0', cursor: 'ns-resize',
                  pointerEvents: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
                onMouseDown={e => startDrag({ type: 'v-top' }, e)}
              >
                <div style={{ width: 10, height: 2, background: 'rgba(255,255,255,0.6)', borderRadius: 1 }} />
              </div>
              {/* Bottom handle */}
              <div
                style={{
                  position: 'absolute', bottom: -6, left: -9,
                  width: 20, height: 14, background: '#f59e0b',
                  borderRadius: '0 0 4px 4px', cursor: 'ns-resize',
                  pointerEvents: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
                onMouseDown={e => startDrag({ type: 'v-bottom' }, e)}
              >
                <div style={{ width: 10, height: 2, background: 'rgba(255,255,255,0.6)', borderRadius: 1 }} />
              </div>
              {/* Label */}
              <span style={{
                position: 'absolute', top: '50%',
                transform: 'translateY(-50%)', left: 10,
                background: '#f59e0b', color: '#fff',
                fontSize: 10, fontWeight: 700,
                padding: '1px 6px', borderRadius: 4,
                whiteSpace: 'nowrap', pointerEvents: 'none',
              }}>
                {calibration.vField}{vRefCm != null ? ` = ${vRefCm} cm` : ''}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-1">
        <div className="flex items-center gap-1.5 text-xs text-[rgba(0,0,0,0.45)]">
          <div className="w-7 h-2 rounded-sm bg-[#0079FF]" />
          H-Linie = X-Maßstab
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[rgba(0,0,0,0.45)]">
          <div className="w-2 h-7 rounded-sm bg-[#f59e0b]" />
          V-Linie = Y-Maßstab
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[rgba(0,0,0,0.45)]">
          <div className="w-3.5 h-3.5 rounded-full bg-[#0079FF] border-2 border-white shadow" />
          Punkt = Print Zone Position
        </div>
      </div>
    </div>
  )
}
