'use client'

import { VariationCard, VariationData } from './VariationCard'
import { ViewData } from './ViewEditor'
import { MeasurementsData } from '@/lib/print/calcCoords'

interface Props {
  variations: Record<string, VariationData>
  onChange: (v: Record<string, VariationData>) => void
  measurements: MeasurementsData | null
  printWidthCm: number
  printHeightCm: number
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
      image_url: '',
      colorOverlayEnabled: false,
      overlayOpacity: 0,
      akd_position: 'front',
      safeZone: { left: 10, top: 5, width: 480, height: 680 },
      imageZone: { left: 0, top: 0, scaleX: 1, scaleY: 1, angle: 0 },
      printZone: { left: 30, top: 29, width: 240, height: 260 },
      calibration: { chestLine: { y: 35, x1: 10, x2: 90 }, collarLine: { y: 8 }, referenceSize: 'M' },
    } as ViewData,
  },
}

export function VariationsEditor({ variations, onChange, measurements, printWidthCm, printHeightCm }: Props) {
  const add = () => {
    const id = `var_${Date.now()}`
    const isFirst = Object.keys(variations).length === 0
    onChange({ ...variations, [id]: { ...DEFAULT_VARIATION, id, is_default: isFirst } })
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
          measurements={measurements}
          printWidthCm={printWidthCm}
          printHeightCm={printHeightCm}
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
