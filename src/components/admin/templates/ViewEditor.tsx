'use client'

export interface ViewData {
  name: string
  image_url: string
  colorOverlayEnabled: boolean
  overlayOpacity: number
  akd_position: string
  safeZone: { left: number; top: number; width: number; height: number }
  imageZone: { left: number; top: number; scaleX: number; scaleY: number; angle: number }
  printZone: {
    left: number; top: number; width: number; height: number
    offsetX_mm: number; offsetY_mm: number; width_mm: number; height_mm: number
  }
}

const AKD_POSITIONS = ['front', 'back', 'left', 'right', 'neck', 'sleeve_left', 'sleeve_right']

interface Props {
  viewId: string
  view: ViewData
  onChange: (v: ViewData) => void
  onRemove: () => void
}

function NumField({ label, value, onChange, unit = '', step = 1, min }: {
  label: string; value: number; onChange: (v: number) => void
  unit?: string; step?: number; min?: number
}) {
  return (
    <div>
      <label className="block text-xs text-[rgba(0,0,0,0.5)] mb-1">{label}{unit ? ` (${unit})` : ''}</label>
      <input
        type="number"
        step={step}
        min={min}
        value={value}
        onChange={e => onChange(parseFloat(e.target.value) || 0)}
        className="yprint-input text-xs w-full"
      />
    </div>
  )
}

export function ViewEditor({ viewId, view, onChange, onRemove }: Props) {
  const set = <K extends keyof ViewData>(field: K, value: ViewData[K]) =>
    onChange({ ...view, [field]: value })

  const setPz = (field: keyof ViewData['printZone'], value: number) =>
    onChange({ ...view, printZone: { ...view.printZone, [field]: value } })

  const setSz = (field: keyof ViewData['safeZone'], value: number) =>
    onChange({ ...view, safeZone: { ...view.safeZone, [field]: value } })

  return (
    <div className="border border-[#e5e7eb] rounded-xl p-4 space-y-4 bg-[#fafafa]">
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono text-[rgba(0,0,0,0.4)]">{viewId}</span>
        <button type="button" onClick={onRemove} className="text-red-400 hover:text-red-600 text-xs">View entfernen</button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-[rgba(0,0,0,0.6)] mb-1">View-Name</label>
          <input type="text" value={view.name} onChange={e => set('name', e.target.value)} className="yprint-input text-sm" placeholder="z.B. Front" />
        </div>
        <div>
          <label className="block text-xs font-medium text-[rgba(0,0,0,0.6)] mb-1">AKD Position</label>
          <select value={view.akd_position} onChange={e => set('akd_position', e.target.value)} className="yprint-input text-sm">
            {AKD_POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-[rgba(0,0,0,0.6)] mb-1">Mockup-Bild URL</label>
        <input type="text" value={view.image_url} onChange={e => set('image_url', e.target.value)} className="yprint-input text-sm font-mono" placeholder="/templates/shirt-white-front.png" />
      </div>

      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={view.colorOverlayEnabled} onChange={e => set('colorOverlayEnabled', e.target.checked)} />
          <span className="text-xs text-[rgba(0,0,0,0.7)]">Farboverlay</span>
        </label>
        {view.colorOverlayEnabled && (
          <div className="flex items-center gap-2">
            <label className="text-xs text-[rgba(0,0,0,0.5)]">Deckkraft</label>
            <input
              type="range" min={0} max={1} step={0.05}
              value={view.overlayOpacity}
              onChange={e => set('overlayOpacity', parseFloat(e.target.value))}
              className="w-24"
            />
            <span className="text-xs text-[rgba(0,0,0,0.5)]">{Math.round(view.overlayOpacity * 100)}%</span>
          </div>
        )}
      </div>

      <div>
        <p className="text-xs font-semibold text-[rgba(0,0,0,0.5)] uppercase tracking-wide mb-2">Safe Zone (Canvas)</p>
        <div className="grid grid-cols-4 gap-2">
          <NumField label="Links" unit="%" value={view.safeZone.left} onChange={v => setSz('left', v)} min={0} />
          <NumField label="Oben" unit="%" value={view.safeZone.top} onChange={v => setSz('top', v)} min={0} />
          <NumField label="Breite" unit="px" value={view.safeZone.width} onChange={v => setSz('width', v)} min={0} />
          <NumField label="Höhe" unit="px" value={view.safeZone.height} onChange={v => setSz('height', v)} min={0} />
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-[rgba(0,0,0,0.5)] uppercase tracking-wide mb-2">Print Zone (Canvas)</p>
        <div className="grid grid-cols-4 gap-2 mb-3">
          <NumField label="Links" unit="%" value={view.printZone.left} onChange={v => setPz('left', v)} min={0} />
          <NumField label="Oben" unit="%" value={view.printZone.top} onChange={v => setPz('top', v)} min={0} />
          <NumField label="Breite" unit="px" value={view.printZone.width} onChange={v => setPz('width', v)} min={0} />
          <NumField label="Höhe" unit="px" value={view.printZone.height} onChange={v => setPz('height', v)} min={0} />
        </div>
        <p className="text-xs font-semibold text-[rgba(0,0,0,0.5)] uppercase tracking-wide mb-2">Print Zone (Druckdaten mm)</p>
        <div className="grid grid-cols-4 gap-2">
          <NumField label="Offset X" unit="mm" value={view.printZone.offsetX_mm} onChange={v => setPz('offsetX_mm', v)} step={0.5} min={0} />
          <NumField label="Offset Y" unit="mm" value={view.printZone.offsetY_mm} onChange={v => setPz('offsetY_mm', v)} step={0.5} min={0} />
          <NumField label="Breite" unit="mm" value={view.printZone.width_mm} onChange={v => setPz('width_mm', v)} step={0.5} min={0} />
          <NumField label="Höhe" unit="mm" value={view.printZone.height_mm} onChange={v => setPz('height_mm', v)} step={0.5} min={0} />
        </div>
      </div>
    </div>
  )
}
