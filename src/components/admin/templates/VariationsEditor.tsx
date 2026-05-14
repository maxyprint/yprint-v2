'use client'

import { VariationCard, VariationData } from './VariationCard'
import { ViewData } from './ViewEditor'

interface Props {
  variations: Record<string, VariationData>
  onChange: (v: Record<string, VariationData>) => void
}

const DEFAULT_VARIATION: VariationData = {
  id: '',
  name: '',
  color: '#ffffff',
  akd_color: '',
  is_default: false,
  is_dark_shirt: false,
  views: {
    view_front: {
      name: 'Front',
      image_url: '/templates/shirt-white-front.png',
      colorOverlayEnabled: false,
      overlayOpacity: 0,
      akd_position: 'front',
      safeZone: { left: 20, top: 26, width: 360, height: 560 },
      imageZone: { left: 0, top: 0, scaleX: 1, scaleY: 1, angle: 0 },
      printZone: { left: 30, top: 29, width: 240, height: 260, offsetX_mm: 55, offsetY_mm: 75, width_mm: 120, height_mm: 130 },
    } as ViewData,
  },
}

export function VariationsEditor({ variations, onChange }: Props) {
  const add = () => {
    const id = `var_${Date.now()}`
    onChange({ ...variations, [id]: { ...DEFAULT_VARIATION, id } })
  }

  const update = (varId: string, variation: VariationData) =>
    onChange({ ...variations, [varId]: variation })

  const remove = (varId: string) => {
    const next = { ...variations }
    delete next[varId]
    onChange(next)
  }

  const count = Object.keys(variations).length

  return (
    <div className="yprint-card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-[#1d1d1f]">Varianten ({count})</h2>
        <button type="button" onClick={add} className="text-sm text-[#0079FF] hover:underline">+ Variante hinzufügen</button>
      </div>
      {count === 0 && (
        <p className="text-sm text-[rgba(0,0,0,0.4)] italic">Noch keine Varianten definiert.</p>
      )}
      <div className="space-y-3">
        {Object.entries(variations).map(([varId, variation]) => (
          <VariationCard
            key={varId}
            varId={varId}
            variation={variation}
            onChange={v => update(varId, v)}
            onRemove={() => remove(varId)}
          />
        ))}
      </div>
    </div>
  )
}
