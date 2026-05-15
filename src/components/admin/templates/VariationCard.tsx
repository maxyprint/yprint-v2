'use client'

import { useState } from 'react'
import { ViewEditor, ViewData } from './ViewEditor'
import { MeasurementsData } from '@/lib/print/calcCoords'

export interface VariationData {
  id: string
  name: string
  color: string
  akd_color: string
  is_default: boolean
  is_dark_shirt: boolean
  views: Record<string, ViewData>
}

interface Props {
  varId: string
  variation: VariationData
  onChange: (v: VariationData) => void
  onRemove: () => void
  measurements: MeasurementsData | null
  printWidthCm: number
  printHeightCm: number
}

const DEFAULT_VIEW: ViewData = {
  name: 'Front',
  image_url: '',
  colorOverlayEnabled: false,
  overlayOpacity: 0,
  akd_position: 'front',
  imageZone: { left: 50, top: 50, scaleX: 1, scaleY: 1, angle: 0 },
  printZone: { left: 50, top: 50, width: 35, height: 42 },
  calibration: {
    referenceSize: 'L',
    hField: 'chest_cm',
    vField: 'length_cm',
    hLine: { y: 42, x1: 10, x2: 90 },
    vLine: { x: 50, y1: 8, y2: 92 },
    printTopLeft: { x: 35, y: 30 },
  },
}

export function VariationCard({ varId, variation, onChange, onRemove, measurements, printWidthCm, printHeightCm }: Props) {
  const [open, setOpen] = useState(true)

  const set = <K extends keyof VariationData>(field: K, value: VariationData[K]) =>
    onChange({ ...variation, [field]: value })

  const addView = () => {
    const newId = `view_${Date.now()}`
    onChange({ ...variation, views: { ...variation.views, [newId]: { ...DEFAULT_VIEW } } })
  }

  const updateView = (viewId: string, view: ViewData) =>
    onChange({ ...variation, views: { ...variation.views, [viewId]: view } })

  const removeView = (viewId: string) => {
    const next = { ...variation.views }
    delete next[viewId]
    onChange({ ...variation, views: next })
  }

  return (
    <div className="rounded-2xl border-2 border-[#e5e7eb] overflow-hidden">
      {/* Variation header — always visible */}
      <div
        className="flex items-center gap-4 px-5 py-4 bg-white cursor-pointer hover:bg-[#fafafa] transition-colors"
        onClick={() => setOpen(o => !o)}
      >
        {/* Color swatch */}
        <div
          className="w-10 h-10 rounded-xl border-2 flex-shrink-0 shadow-sm"
          style={{
            background: variation.color,
            borderColor: variation.color === '#ffffff' || variation.color === '#fff' ? '#e5e7eb' : variation.color,
          }}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#1d1d1f]">{variation.name || 'Neue Variante'}</span>
            {variation.is_default && (
              <span className="text-xs bg-[#0079FF] text-white px-2 py-0.5 rounded-full font-medium">Standard</span>
            )}
            {variation.is_dark_shirt && (
              <span className="text-xs bg-[#1d1d1f] text-white px-2 py-0.5 rounded-full">Dunkel</span>
            )}
          </div>
          <div className="text-sm text-[rgba(0,0,0,0.4)] mt-0.5">
            {variation.color} · {Object.keys(variation.views).length} View{Object.keys(variation.views).length !== 1 ? 's' : ''}
            {variation.akd_color ? ` · AKD: ${variation.akd_color}` : ''}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={e => { e.stopPropagation(); onRemove() }}
            className="text-sm text-[rgba(0,0,0,0.3)] hover:text-red-500 transition-colors px-2 py-1"
          >
            Entfernen
          </button>
          <span className="text-[rgba(0,0,0,0.25)] text-lg">{open ? '▲' : '▼'}</span>
        </div>
      </div>

      {open && (
        <div className="border-t-2 border-[#e5e7eb] bg-[#f9fafb]">
          {/* Variation settings */}
          <div className="p-5 grid grid-cols-2 gap-4 sm:grid-cols-4 border-b border-[#e5e7eb]">
            <div>
              <label className="block text-xs font-medium text-[rgba(0,0,0,0.5)] mb-1.5">Name</label>
              <input type="text" value={variation.name} onChange={e => set('name', e.target.value)} className="yprint-input text-sm" placeholder="z.B. White" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[rgba(0,0,0,0.5)] mb-1.5">Farbe</label>
              <div className="flex items-center gap-2">
                <input type="color" value={variation.color} onChange={e => set('color', e.target.value)} className="h-10 w-10 rounded-lg border border-[#e5e7eb] cursor-pointer p-1 flex-shrink-0" />
                <input type="text" value={variation.color} onChange={e => set('color', e.target.value)} className="yprint-input flex-1 text-sm font-mono min-w-0" placeholder="#ffffff" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-[rgba(0,0,0,0.5)] mb-1.5">AKD-Farbname</label>
              <input type="text" value={variation.akd_color} onChange={e => set('akd_color', e.target.value)} className="yprint-input text-sm" placeholder="z.B. White" />
            </div>
            <div className="flex flex-col gap-2 justify-center pt-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={variation.is_default} onChange={e => set('is_default', e.target.checked)} className="w-4 h-4" />
                <span className="text-sm text-[#1d1d1f]">Standard</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={variation.is_dark_shirt} onChange={e => set('is_dark_shirt', e.target.checked)} className="w-4 h-4" />
                <span className="text-sm text-[#1d1d1f]">Dunkles Shirt</span>
              </label>
            </div>
          </div>

          {/* Views */}
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-[#1d1d1f]">
                Ansichten ({Object.keys(variation.views).length})
              </span>
              <button type="button" onClick={addView} className="text-sm text-[#0079FF] hover:underline font-medium">
                + Ansicht hinzufügen
              </button>
            </div>
            {Object.entries(variation.views).map(([viewId, view]) => (
              <ViewEditor
                key={viewId}
                viewId={viewId}
                view={view}
                onChange={v => updateView(viewId, v)}
                onRemove={() => removeView(viewId)}
                measurements={measurements}
                printWidthCm={printWidthCm}
                printHeightCm={printHeightCm}
              />
            ))}
            {Object.keys(variation.views).length === 0 && (
              <div className="text-center py-6 text-sm text-[rgba(0,0,0,0.3)] border-2 border-dashed border-[#e5e7eb] rounded-xl">
                Noch keine Ansicht — füge eine hinzu
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
