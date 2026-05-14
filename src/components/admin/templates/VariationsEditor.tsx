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

      {count === 0 && (
        <div className="text-center py-10 text-[rgba(0,0,0,0.3)] border-2 border-dashed border-[#e5e7eb] rounded-2xl">
          <p className="text-base mb-1">Noch keine Farben / Varianten</p>
          <p className="text-sm">Füge z.B. White und Black hinzu</p>
        </div>
      )}

      <button
        type="button"
        onClick={add}
        className="w-full py-3 text-sm font-medium text-[#0079FF] border-2 border-dashed border-[#0079FF]/30 rounded-2xl hover:border-[#0079FF]/60 hover:bg-[#0079FF]/5 transition-colors"
      >
        + Farbe / Variante hinzufügen
      </button>
    </div>
  )
}
