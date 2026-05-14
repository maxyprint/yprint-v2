'use client'

interface Size {
  id: string
  name: string
  order: number
}

interface Props {
  sizes: Size[]
  onChange: (sizes: Size[]) => void
}

export function SizesEditor({ sizes, onChange }: Props) {
  const add = () => {
    onChange([...sizes, { id: '', name: '', order: sizes.length + 1 }])
  }

  const remove = (i: number) => {
    onChange(sizes.filter((_, idx) => idx !== i))
  }

  const update = (i: number, field: keyof Size, value: string | number) => {
    const next = sizes.map((s, idx) => idx === i ? { ...s, [field]: value } : s)
    onChange(next)
  }

  return (
    <div className="yprint-card">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-[#1d1d1f]">Größen</h2>
        <button type="button" onClick={add} className="text-sm text-[#0079FF] hover:underline">+ Größe hinzufügen</button>
      </div>
      {sizes.length === 0 && (
        <p className="text-sm text-[rgba(0,0,0,0.4)] italic">Noch keine Größen definiert.</p>
      )}
      <div className="space-y-2">
        {sizes.map((size, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              type="text"
              value={size.id}
              onChange={e => update(i, 'id', e.target.value)}
              className="yprint-input w-20 text-sm"
              placeholder="ID (z.B. M)"
            />
            <input
              type="text"
              value={size.name}
              onChange={e => update(i, 'name', e.target.value)}
              className="yprint-input flex-1 text-sm"
              placeholder="Name (z.B. Medium)"
            />
            <input
              type="number"
              value={size.order}
              onChange={e => update(i, 'order', parseInt(e.target.value) || 0)}
              className="yprint-input w-16 text-sm"
              placeholder="Order"
              min={1}
            />
            <button
              type="button"
              onClick={() => remove(i)}
              className="text-red-500 hover:text-red-700 text-sm px-2"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
