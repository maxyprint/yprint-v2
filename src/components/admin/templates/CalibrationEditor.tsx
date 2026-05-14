'use client'

import { useRef, useEffect } from 'react'

export interface CalibrationData {
  chestLine: { y: number; x1: number; x2: number }  // all 0–100 % of image
  collarLine: { y: number }                           // 0–100 % of image height
  referenceSize: string
}

interface ZoneRect { left: number; top: number; width: number; height: number }

interface Props {
  imageUrl: string
  calibration: CalibrationData
  onChange: (c: CalibrationData) => void
  onNaturalSize: (w: number, h: number) => void
  availableSizes: string[]
  zoneOverlay?: { safe: ZoneRect; print: ZoneRect }
}

type DragTarget =
  | { type: 'chest-bar' }
  | { type: 'chest-left' }
  | { type: 'chest-right' }
  | { type: 'collar' }

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

export function CalibrationEditor({ imageUrl, calibration, onChange, onNaturalSize, availableSizes, zoneOverlay }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<DragState | null>(null)
  const calRef = useRef(calibration)
  const onChangeRef = useRef(onChange)
  useEffect(() => { calRef.current = calibration }, [calibration])
  useEffect(() => { onChangeRef.current = onChange }, [onChange])

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const drag = dragRef.current
      if (!drag) return
      const dxPct = ((e.clientX - drag.startMX) / drag.cW) * 100
      const dyPct = ((e.clientY - drag.startMY) / drag.cH) * 100
      const c = drag.startCal
      let next = { ...c, chestLine: { ...c.chestLine }, collarLine: { ...c.collarLine } }

      switch (drag.target.type) {
        case 'chest-bar':
          next.chestLine.y = clamp(c.chestLine.y + dyPct, 5, 95)
          break
        case 'chest-left':
          next.chestLine.x1 = clamp(c.chestLine.x1 + dxPct, 0, c.chestLine.x2 - 5)
          break
        case 'chest-right':
          next.chestLine.x2 = clamp(c.chestLine.x2 + dxPct, c.chestLine.x1 + 5, 100)
          break
        case 'collar':
          next.collarLine.y = clamp(c.collarLine.y + dyPct, 0, 60)
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
        chestLine: { ...calRef.current.chestLine },
        collarLine: { ...calRef.current.collarLine },
      },
      cW: rect.width,
      cH: rect.height,
    }
  }

  const { chestLine: cl, collarLine: col } = calibration
  const chestWidth = cl.x2 - cl.x1

  return (
    <div className="space-y-3">
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
              onNaturalSize(img.naturalWidth, img.naturalHeight)
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-64 text-sm text-[rgba(0,0,0,0.3)]">
            Bild hochladen um Kalibrierung zu starten
          </div>
        )}

        {imageUrl && zoneOverlay && (
          <>
            {/* Safe zone — dashed border overlay */}
            <div style={{
              position: 'absolute',
              left:   `${zoneOverlay.safe.left}%`,
              top:    `${zoneOverlay.safe.top}%`,
              width:  `${zoneOverlay.safe.width}%`,
              height: `${zoneOverlay.safe.height}%`,
              border: '1.5px dashed rgba(0,121,255,0.35)',
              borderRadius: 2,
              pointerEvents: 'none',
            }} />
            {/* Print zone — filled overlay */}
            <div style={{
              position: 'absolute',
              left:   `${zoneOverlay.print.left}%`,
              top:    `${zoneOverlay.print.top}%`,
              width:  `${zoneOverlay.print.width}%`,
              height: `${zoneOverlay.print.height}%`,
              background: 'rgba(0,121,255,0.12)',
              border: '1.5px solid rgba(0,121,255,0.6)',
              borderRadius: 2,
              pointerEvents: 'none',
            }} />
          </>
        )}

        {imageUrl && (
          <>
            {/* ── Collar line ── */}
            <div
              style={{ position: 'absolute', top: `${col.y}%`, left: 0, right: 0, pointerEvents: 'none' }}
            >
              {/* line */}
              <div style={{ position: 'absolute', left: 0, right: 0, height: 2, background: '#f59e0b', opacity: 0.8 }} />
              {/* drag handle */}
              <div
                style={{
                  position: 'absolute',
                  left: 8,
                  top: -10,
                  width: 20,
                  height: 20,
                  background: '#f59e0b',
                  borderRadius: 4,
                  cursor: 'ns-resize',
                  pointerEvents: 'auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onMouseDown={e => startDrag({ type: 'collar' }, e)}
              >
                <div style={{ width: 8, height: 2, background: 'white', borderRadius: 1, boxShadow: '0 3px 0 white' }} />
              </div>
              {/* label */}
              <span style={{
                position: 'absolute',
                left: 34,
                top: -9,
                background: '#f59e0b',
                color: '#fff',
                fontSize: 10,
                fontWeight: 700,
                padding: '1px 6px',
                borderRadius: 4,
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
              }}>
                Kragen-Unterkante
              </span>
            </div>

            {/* ── Chest line bar ── */}
            <div
              style={{
                position: 'absolute',
                top: `${cl.y}%`,
                left: `${cl.x1}%`,
                width: `${chestWidth}%`,
                transform: 'translateY(-50%)',
                pointerEvents: 'none',
              }}
            >
              {/* bar body — drag up/down */}
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  height: 3,
                  background: '#0079FF',
                  borderRadius: 2,
                  cursor: 'ns-resize',
                  pointerEvents: 'auto',
                }}
                onMouseDown={e => startDrag({ type: 'chest-bar' }, e)}
              />

              {/* left handle */}
              <div
                style={{
                  position: 'absolute',
                  left: -6,
                  top: -9,
                  width: 14,
                  height: 20,
                  background: '#0079FF',
                  borderRadius: '4px 0 0 4px',
                  cursor: 'ew-resize',
                  pointerEvents: 'auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onMouseDown={e => startDrag({ type: 'chest-left' }, e)}
              >
                <div style={{ width: 2, height: 10, background: 'rgba(255,255,255,0.6)', borderRadius: 1 }} />
              </div>

              {/* right handle */}
              <div
                style={{
                  position: 'absolute',
                  right: -6,
                  top: -9,
                  width: 14,
                  height: 20,
                  background: '#0079FF',
                  borderRadius: '0 4px 4px 0',
                  cursor: 'ew-resize',
                  pointerEvents: 'auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onMouseDown={e => startDrag({ type: 'chest-right' }, e)}
              >
                <div style={{ width: 2, height: 10, background: 'rgba(255,255,255,0.6)', borderRadius: 1 }} />
              </div>

              {/* label */}
              <span style={{
                position: 'absolute',
                left: '50%',
                transform: 'translateX(-50%)',
                top: -18,
                background: '#0079FF',
                color: '#fff',
                fontSize: 10,
                fontWeight: 700,
                padding: '1px 6px',
                borderRadius: 4,
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
              }}>
                Brustweite
              </span>
            </div>
          </>
        )}
      </div>

      {/* Reference size selector */}
      <div className="flex items-center gap-3 px-1">
        <div className="flex items-center gap-1.5 text-xs text-[rgba(0,0,0,0.5)]">
          <div className="w-8 h-2 rounded-sm bg-[#0079FF]" />
          Brustweite (ziehe Enden links/rechts, Balken hoch/runter)
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[rgba(0,0,0,0.5)]">
          <div className="w-8 h-0.5 bg-[#f59e0b]" />
          Kragen-Unterkante (ziehe Handle)
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <label className="text-xs text-[rgba(0,0,0,0.5)]">Referenzgröße</label>
          <select
            value={calibration.referenceSize}
            onChange={e => onChange({ ...calibration, referenceSize: e.target.value })}
            className="text-xs border border-[#e5e7eb] rounded-lg px-2 py-1 bg-white"
          >
            {availableSizes.length > 0
              ? availableSizes.map(s => <option key={s} value={s}>{s}</option>)
              : <option value="M">M</option>
            }
          </select>
        </div>
      </div>
    </div>
  )
}
