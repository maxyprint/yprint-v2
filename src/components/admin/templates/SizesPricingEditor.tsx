'use client'

interface Size { id: string; name: string; order: number }
interface Pricing { [sizeId: string]: { base: number } }

interface Props {
  sizes: Size[]
  pricing: Pricing
  onSizesChange: (s: Size[]) => void
  onPricingChange: (p: Pricing) => void
}

export function SizesPricingEditor({ sizes, pricing, onSizesChange, onPricingChange }: Props) {
  const addSize = () => {
    onSizesChange([...sizes, { id: '', name: '', order: sizes.length + 1 }])
  }

  const removeSize = (i: number) => {
    const removed = sizes[i]
    onSizesChange(sizes.filter((_, idx) => idx !== i))
    if (removed.id) {
      const next = { ...pricing }
      delete next[removed.id]
      onPricingChange(next)
    }
  }

  const updateSize = (i: number, field: keyof Size, value: string | number) => {
    const prev = sizes[i]
    const next = sizes.map((s, idx) => idx === i ? { ...s, [field]: value } : s)
    onSizesChange(next)
    // Keep pricing in sync when ID changes
    if (field === 'id' && prev.id && value !== prev.id) {
      const p = { ...pricing, [value as string]: pricing[prev.id] ?? { base: 0 } }
      delete p[prev.id]
      onPricingChange(p)
    }
  }

  const setPrice = (sizeId: string, value: number) => {
    onPricingChange({ ...pricing, [sizeId]: { base: value } })
  }

  return (
    <div>
      {/* Column headers */}
      {sizes.length > 0 && (
        <div className="flex items-center gap-3 px-1 mb-2">
          <span className="text-xs text-[rgba(0,0,0,0.4)] w-20">Kürzel</span>
          <span className="text-xs text-[rgba(0,0,0,0.4)] flex-1">Anzeigename</span>
          <span className="text-xs text-[rgba(0,0,0,0.4)] w-28">Preis (€)</span>
          <span className="w-8" />
        </div>
      )}

      <div className="space-y-2">
        {sizes.map((size, i) => (
          <div key={i} className="flex items-center gap-3 p-3 bg-[#f9fafb] rounded-xl border border-[#e5e7eb]">
            <input
              type="text"
              value={size.id}
              onChange={e => updateSize(i, 'id', e.target.value)}
              className="yprint-input w-20 text-sm font-mono"
              placeholder="XL"
            />
            <input
              type="text"
              value={size.name}
              onChange={e => updateSize(i, 'name', e.target.value)}
              className="yprint-input flex-1 text-sm"
              placeholder="XL"
            />
            <div className="relative w-28">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[rgba(0,0,0,0.4)]">€</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={pricing[size.id]?.base ?? ''}
                onChange={e => size.id && setPrice(size.id, parseFloat(e.target.value) || 0)}
                className="yprint-input pl-7 text-sm w-full"
                placeholder="0.00"
              />
            </div>
            <button
              type="button"
              onClick={() => removeSize(i)}
              className="w-8 h-8 flex items-center justify-center text-[rgba(0,0,0,0.3)] hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {sizes.length === 0 && (
        <div className="text-center py-8 text-[rgba(0,0,0,0.3)] text-sm border-2 border-dashed border-[#e5e7eb] rounded-xl">
          Noch keine Größen — füge welche hinzu
        </div>
      )}

      <button
        type="button"
        onClick={addSize}
        className="mt-3 w-full py-2.5 text-sm text-[#0079FF] border-2 border-dashed border-[#0079FF]/30 rounded-xl hover:border-[#0079FF]/60 hover:bg-[#0079FF]/5 transition-colors"
      >
        + Größe hinzufügen
      </button>
    </div>
  )
}
