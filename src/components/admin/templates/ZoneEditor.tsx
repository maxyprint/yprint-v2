'use client'

import { useRef, useEffect } from 'react'

export interface ZonePct {
  left: number    // % of image width
  top: number     // % of image height
  width: number   // % of image width
  height: number  // % of image height
}

interface Props {
  imageUrl: string
  safeZone: ZonePct
  printZone: ZonePct
  onSafeChange: (z: ZonePct) => void
  onPrintChange: (z: ZonePct) => void
  onNaturalSize: (w: number, h: number) => void
}

type ZoneKey = 'safe' | 'print'
type Handle = 'move' | 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w'

interface Drag {
  zone: ZoneKey
  handle: Handle
  startMX: number
  startMY: number
  startRect: ZonePct
  cW: number
  cH: number
}

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v))
}

const MIN = 4 // minimum zone size in %

function applyDrag(rect: ZonePct, handle: Handle, dxPct: number, dyPct: number): ZonePct {
  let { left, top, width, height } = rect
  switch (handle) {
    case 'move':
      left = clamp(left + dxPct, 0, 100 - width)
      top  = clamp(top  + dyPct, 0, 100 - height)
      break
    case 'nw':
      { const nl = clamp(left + dxPct, 0, left + width - MIN)
        top    = clamp(top  + dyPct, 0, top + height - MIN)
        width  = clamp(width  - (nl - left), MIN, 100)
        height = clamp(height - dyPct, MIN, 100)
        left = nl }
      break
    case 'n':
      { const nt = clamp(top + dyPct, 0, top + height - MIN)
        height = clamp(height - (nt - top), MIN, 100)
        top = nt }
      break
    case 'ne':
      { const nt = clamp(top + dyPct, 0, top + height - MIN)
        height = clamp(height - (nt - top), MIN, 100)
        width  = clamp(width + dxPct, MIN, 100 - left)
        top = nt }
      break
    case 'e':
      width = clamp(width + dxPct, MIN, 100 - left)
      break
    case 'se':
      width  = clamp(width  + dxPct, MIN, 100 - left)
      height = clamp(height + dyPct, MIN, 100 - top)
      break
    case 's':
      height = clamp(height + dyPct, MIN, 100 - top)
      break
    case 'sw':
      { const nl = clamp(left + dxPct, 0, left + width - MIN)
        width  = clamp(width - (nl - left), MIN, 100)
        height = clamp(height + dyPct, MIN, 100 - top)
        left = nl }
      break
    case 'w':
      { const nl = clamp(left + dxPct, 0, left + width - MIN)
        width = clamp(width - (nl - left), MIN, 100)
        left = nl }
      break
  }
  return { left, top, width, height }
}

const HANDLES: { key: Handle; style: React.CSSProperties; cursor: string }[] = [
  { key: 'nw', style: { top: -5, left: -5 }, cursor: 'nw-resize' },
  { key: 'n',  style: { top: -5, left: 'calc(50% - 5px)' }, cursor: 'n-resize' },
  { key: 'ne', style: { top: -5, right: -5 }, cursor: 'ne-resize' },
  { key: 'e',  style: { top: 'calc(50% - 5px)', right: -5 }, cursor: 'e-resize' },
  { key: 'se', style: { bottom: -5, right: -5 }, cursor: 'se-resize' },
  { key: 's',  style: { bottom: -5, left: 'calc(50% - 5px)' }, cursor: 's-resize' },
  { key: 'sw', style: { bottom: -5, left: -5 }, cursor: 'sw-resize' },
  { key: 'w',  style: { top: 'calc(50% - 5px)', left: -5 }, cursor: 'w-resize' },
]

interface ZoneOverlayProps {
  zone: ZonePct
  color: string           // css color for border / fill tint
  label: string
  dashed?: boolean
  onDragStart: (handle: Handle, e: React.MouseEvent) => void
}

function ZoneOverlay({ zone, color, label, dashed, onDragStart }: ZoneOverlayProps) {
  return (
    <div
      style={{
        position: 'absolute',
        left: `${zone.left}%`,
        top: `${zone.top}%`,
        width: `${zone.width}%`,
        height: `${zone.height}%`,
        border: `2px ${dashed ? 'dashed' : 'solid'} ${color}`,
        background: `${color}18`,
        boxSizing: 'border-box',
        cursor: 'move',
        userSelect: 'none',
      }}
      onMouseDown={e => onDragStart('move', e)}
    >
      {/* Label */}
      <span style={{
        position: 'absolute',
        top: 4,
        left: 4,
        background: color,
        color: '#fff',
        fontSize: 10,
        fontWeight: 600,
        padding: '1px 6px',
        borderRadius: 4,
        whiteSpace: 'nowrap',
        pointerEvents: 'none',
      }}>
        {label}
      </span>

      {/* Handles */}
      {HANDLES.map(({ key, style, cursor }) => (
        <div
          key={key}
          style={{
            position: 'absolute',
            width: 10,
            height: 10,
            background: '#fff',
            border: `2px solid ${color}`,
            borderRadius: 2,
            cursor,
            ...style,
          }}
          onMouseDown={e => { e.stopPropagation(); onDragStart(key, e) }}
        />
      ))}
    </div>
  )
}

export function ZoneEditor({ imageUrl, safeZone, printZone, onSafeChange, onPrintChange, onNaturalSize }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<Drag | null>(null)
  // Keep latest callbacks and zones in refs so the stable event listener can access them
  const safeRef  = useRef(safeZone)
  const printRef = useRef(printZone)
  const onSafeRef  = useRef(onSafeChange)
  const onPrintRef = useRef(onPrintChange)

  useEffect(() => { safeRef.current  = safeZone },  [safeZone])
  useEffect(() => { printRef.current = printZone }, [printZone])
  useEffect(() => { onSafeRef.current  = onSafeChange },  [onSafeChange])
  useEffect(() => { onPrintRef.current = onPrintChange }, [onPrintChange])

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const drag = dragRef.current
      if (!drag) return
      const dxPct = ((e.clientX - drag.startMX) / drag.cW) * 100
      const dyPct = ((e.clientY - drag.startMY) / drag.cH) * 100
      const newRect = applyDrag(drag.startRect, drag.handle, dxPct, dyPct)
      if (drag.zone === 'safe') onSafeRef.current(newRect)
      else onPrintRef.current(newRect)
    }
    const onUp = () => { dragRef.current = null }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, []) // mount once — callbacks accessed via refs

  const startDrag = (zone: ZoneKey, handle: Handle, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const container = containerRef.current
    if (!container) return
    const rect = container.getBoundingClientRect()
    dragRef.current = {
      zone, handle,
      startMX: e.clientX,
      startMY: e.clientY,
      startRect: zone === 'safe' ? { ...safeRef.current } : { ...printRef.current },
      cW: rect.width,
      cH: rect.height,
    }
  }

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget
    onNaturalSize(img.naturalWidth, img.naturalHeight)
  }

  return (
    <div className="space-y-2">
      {/* Image + overlays */}
      <div
        ref={containerRef}
        className="relative w-full overflow-hidden rounded-xl border border-[#e5e7eb] bg-[#f3f4f6] select-none"
        style={{ cursor: 'default' }}
      >
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt=""
            className="w-full h-auto block pointer-events-none"
            onLoad={handleImageLoad}
            draggable={false}
          />
        ) : (
          <div className="flex items-center justify-center h-64 text-sm text-[rgba(0,0,0,0.3)]">
            Kein Bild — lade ein Mockup hoch
          </div>
        )}

        {imageUrl && (
          <>
            <ZoneOverlay
              zone={safeZone}
              color="#0079FF"
              label="Safe Zone"
              onDragStart={(h, e) => startDrag('safe', h, e)}
            />
            <ZoneOverlay
              zone={printZone}
              color="#f59e0b"
              label="Print Zone"
              dashed
              onDragStart={(h, e) => startDrag('print', h, e)}
            />
          </>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 px-1">
        <div className="flex items-center gap-1.5 text-xs text-[rgba(0,0,0,0.5)]">
          <div className="w-4 h-3 rounded-sm border-2 border-solid border-[#0079FF] bg-[#0079FF]/10" />
          Safe Zone — Designbereich
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[rgba(0,0,0,0.5)]">
          <div className="w-4 h-3 rounded-sm border-2 border-dashed border-[#f59e0b] bg-[#f59e0b]/10" />
          Print Zone — Vorschaurahmen
        </div>
      </div>
    </div>
  )
}
