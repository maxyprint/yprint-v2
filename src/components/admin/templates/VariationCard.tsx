'use client'

import { useState } from 'react'
import { ViewEditor, ViewData } from './ViewEditor'

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
}

const DEFAULT_VIEW: ViewData = {
  name: 'Front',
  image_url: '/templates/shirt-white-front.png',
  colorOverlayEnabled: false,
  overlayOpacity: 0,
  akd_position: 'front',
  safeZone: { left: 20, top: 26, width: 360, height: 560 },
  imageZone: { left: 0, top: 0, scaleX: 1, scaleY: 1, angle: 0 },
  printZone: { left: 30, top: 29, width: 240, height: 260, offsetX_mm: 55, offsetY_mm: 75, width_mm: 120, height_mm: 130 },
}

export function VariationCard({ varId, variation, onChange, onRemove }: Props) {
  const [collapsed, setCollapsed] = useState(false)

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

  const viewCount = Object.keys(variation.views).length

  return (
    <div className="border border-[#e5e7eb] rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 bg-white cursor-pointer" onClick={() => setCollapsed(c => !c)}>
        <div
          className="w-8 h-8 rounded-full border-2 border-[#e5e7eb] flex-shrink-0"
          style={{ background: variation.color }}
        />
        <div className="flex-1 min-w-0">
          <div className="font-medium text-[#1d1d1f] text-sm">{variation.name || 'Neue Variante'}</div>
          <div className="text-xs text-[rgba(0,0,0,0.4)]">{viewCount} View{viewCount !== 1 ? 's' : ''} · AKD: {variation.akd_color || '—'}</div>
        </div>
        <div className="flex items-center gap-2">
          {variation.is_default && (
            <span className="text-xs bg-[#0079FF] text-white px-2 py-0.5 rounded-full">Standard</span>
          )}
          <button type="button" onClick={e => { e.stopPropagation(); onRemove() }} className="text-red-400 hover:text-red-600 text-xs px-2">✕</button>
          <span className="text-[rgba(0,0,0,0.3)] text-sm">{collapsed ? '▼' : '▲'}</span>
        </div>
      </div>

      {!collapsed && (
        <div className="p-4 space-y-4 bg-[#f9fafb] border-t border-[#e5e7eb]">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[rgba(0,0,0,0.6)] mb-1">Name</label>
              <input type="text" value={variation.name} onChange={e => set('name', e.target.value)} className="yprint-input text-sm" placeholder="z.B. White" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[rgba(0,0,0,0.6)] mb-1">AKD Farbname</label>
              <input type="text" value={variation.akd_color} onChange={e => set('akd_color', e.target.value)} className="yprint-input text-sm" placeholder="z.B. White" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[rgba(0,0,0,0.6)] mb-1">Farbe (Hex)</label>
              <div className="flex items-center gap-2">
                <input type="color" value={variation.color} onChange={e => set('color', e.target.value)} className="h-10 w-12 rounded border border-[#e5e7eb] cursor-pointer p-1" />
                <input type="text" value={variation.color} onChange={e => set('color', e.target.value)} className="yprint-input flex-1 text-sm font-mono" placeholder="#ffffff" />
              </div>
            </div>
            <div className="flex flex-col gap-2 justify-center">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={variation.is_default} onChange={e => set('is_default', e.target.checked)} />
                <span className="text-sm text-[rgba(0,0,0,0.7)]">Standard-Variante</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={variation.is_dark_shirt} onChange={e => set('is_dark_shirt', e.target.checked)} />
                <span className="text-sm text-[rgba(0,0,0,0.7)]">Dunkles Shirt</span>
              </label>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-[#1d1d1f]">Views</h4>
              <button type="button" onClick={addView} className="text-sm text-[#0079FF] hover:underline">+ View hinzufügen</button>
            </div>
            <div className="space-y-3">
              {Object.entries(variation.views).map(([viewId, view]) => (
                <ViewEditor
                  key={viewId}
                  viewId={viewId}
                  view={view}
                  onChange={v => updateView(viewId, v)}
                  onRemove={() => removeView(viewId)}
                />
              ))}
              {Object.keys(variation.views).length === 0 && (
                <p className="text-sm text-[rgba(0,0,0,0.4)] italic">Kein View definiert.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
