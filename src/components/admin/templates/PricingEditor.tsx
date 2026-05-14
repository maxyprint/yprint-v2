'use client'

interface Size {
  id: string
  name: string
  order: number
}

interface Pricing {
  [sizeId: string]: { base: number }
}

interface Props {
  sizes: Size[]
  pricing: Pricing
  onChange: (pricing: Pricing) => void
}

export function PricingEditor({ sizes, pricing, onChange }: Props) {
  const update = (sizeId: string, value: number) => {
    onChange({ ...pricing, [sizeId]: { base: value } })
  }

  if (sizes.length === 0) {
    return (
      <div className="yprint-card">
        <h2 className="font-semibold text-[#1d1d1f] mb-2">Preise</h2>
        <p className="text-sm text-[rgba(0,0,0,0.4)] italic">Erst Größen definieren.</p>
      </div>
    )
  }

  return (
    <div className="yprint-card">
      <h2 className="font-semibold text-[#1d1d1f] mb-3">Preise (€)</h2>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {sizes.map(size => (
          <div key={size.id}>
            <label className="block text-xs font-medium text-[rgba(0,0,0,0.6)] mb-1">{size.name || size.id}</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[rgba(0,0,0,0.4)]">€</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={pricing[size.id]?.base ?? ''}
                onChange={e => update(size.id, parseFloat(e.target.value) || 0)}
                className="yprint-input pl-7 text-sm"
                placeholder="0.00"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
