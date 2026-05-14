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

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#1d1d1f] mb-1">{label}</label>
      {hint && <p className="text-xs text-[rgba(0,0,0,0.4)] mb-1.5">{hint}</p>}
      {children}
    </div>
  )
}

function NumInput({ value, onChange, unit, step = 1, min }: {
  value: number; onChange: (v: number) => void; unit: string; step?: number; min?: number
}) {
  return (
    <div className="relative">
      <input
        type="number"
        step={step}
        min={min ?? 0}
        value={value}
        onChange={e => onChange(parseFloat(e.target.value) || 0)}
        className="yprint-input text-sm pr-10 w-full"
      />
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[rgba(0,0,0,0.35)] pointer-events-none">{unit}</span>
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
    <div className="rounded-2xl border border-[#e5e7eb] overflow-hidden">
      {/* View header */}
      <div className="flex items-center justify-between px-5 py-3 bg-[#f3f4f6] border-b border-[#e5e7eb]">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-[#1d1d1f]">{view.name || 'Neuer View'}</span>
          <span className="text-xs bg-[#1d1d1f]/10 text-[#1d1d1f] px-2 py-0.5 rounded-full font-mono">{viewId}</span>
        </div>
        <button type="button" onClick={onRemove} className="text-xs text-[rgba(0,0,0,0.4)] hover:text-red-500 transition-colors">
          View entfernen
        </button>
      </div>

      <div className="p-5 space-y-6 bg-white">
        {/* Basic info */}
        <div className="grid grid-cols-2 gap-4">
          <Field label="View-Name">
            <input type="text" value={view.name} onChange={e => set('name', e.target.value)} className="yprint-input" placeholder="z.B. Front" />
          </Field>
          <Field label="Druckposition" hint="Wird an AllesKlarDruck übergeben">
            <select value={view.akd_position} onChange={e => set('akd_position', e.target.value)} className="yprint-input">
              {AKD_POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </Field>
        </div>

        {/* Mockup image */}
        <Field label="Mockup-Bild" hint="Pfad zur Shirt-Vorlage (wird im Designer als Hintergrund angezeigt)">
          <div className="flex items-center gap-3">
            {view.image_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={view.image_url} alt="" className="w-12 h-12 object-contain rounded-lg border border-[#e5e7eb] bg-[#f9fafb]" />
            )}
            <input type="text" value={view.image_url} onChange={e => set('image_url', e.target.value)} className="yprint-input flex-1 font-mono text-sm" placeholder="/templates/shirt-white-front.png" />
          </div>
        </Field>

        {/* Color overlay */}
        <div className="flex items-center gap-4 py-3 px-4 bg-[#f9fafb] rounded-xl">
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input type="checkbox" checked={view.colorOverlayEnabled} onChange={e => set('colorOverlayEnabled', e.target.checked)} className="w-4 h-4" />
            <span className="text-sm font-medium text-[#1d1d1f]">Farboverlay aktiv</span>
          </label>
          {view.colorOverlayEnabled && (
            <>
              <span className="text-[rgba(0,0,0,0.3)]">·</span>
              <div className="flex items-center gap-3 flex-1">
                <span className="text-sm text-[rgba(0,0,0,0.5)]">Deckkraft</span>
                <input type="range" min={0} max={1} step={0.05} value={view.overlayOpacity} onChange={e => set('overlayOpacity', parseFloat(e.target.value))} className="flex-1 max-w-40" />
                <span className="text-sm font-mono text-[#1d1d1f] w-10 text-right">{Math.round(view.overlayOpacity * 100)}%</span>
              </div>
            </>
          )}
        </div>

        {/* Zones */}
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 rounded-sm border-2 border-[#0079FF]/50" />
              <span className="text-sm font-semibold text-[#1d1d1f]">Safe Zone</span>
              <span className="text-xs text-[rgba(0,0,0,0.4)]">— Bereich in dem User designen darf</span>
            </div>
            <div className="grid grid-cols-4 gap-3">
              <div><label className="block text-xs text-[rgba(0,0,0,0.5)] mb-1">Links</label><NumInput value={view.safeZone.left} onChange={v => setSz('left', v)} unit="%" /></div>
              <div><label className="block text-xs text-[rgba(0,0,0,0.5)] mb-1">Oben</label><NumInput value={view.safeZone.top} onChange={v => setSz('top', v)} unit="%" /></div>
              <div><label className="block text-xs text-[rgba(0,0,0,0.5)] mb-1">Breite</label><NumInput value={view.safeZone.width} onChange={v => setSz('width', v)} unit="px" /></div>
              <div><label className="block text-xs text-[rgba(0,0,0,0.5)] mb-1">Höhe</label><NumInput value={view.safeZone.height} onChange={v => setSz('height', v)} unit="px" /></div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 rounded-sm border-2 border-dashed border-[#f59e0b]" />
              <span className="text-sm font-semibold text-[#1d1d1f]">Print Zone — Designer-Vorschau</span>
              <span className="text-xs text-[rgba(0,0,0,0.4)]">— gepunkteter Rahmen im Editor</span>
            </div>
            <div className="grid grid-cols-4 gap-3">
              <div><label className="block text-xs text-[rgba(0,0,0,0.5)] mb-1">Links</label><NumInput value={view.printZone.left} onChange={v => setPz('left', v)} unit="%" /></div>
              <div><label className="block text-xs text-[rgba(0,0,0,0.5)] mb-1">Oben</label><NumInput value={view.printZone.top} onChange={v => setPz('top', v)} unit="%" /></div>
              <div><label className="block text-xs text-[rgba(0,0,0,0.5)] mb-1">Breite</label><NumInput value={view.printZone.width} onChange={v => setPz('width', v)} unit="px" /></div>
              <div><label className="block text-xs text-[rgba(0,0,0,0.5)] mb-1">Höhe</label><NumInput value={view.printZone.height} onChange={v => setPz('height', v)} unit="px" /></div>
            </div>
          </div>

          <div className="pt-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 rounded-sm bg-[#10b981]/20 border border-[#10b981]" />
              <span className="text-sm font-semibold text-[#1d1d1f]">Print Zone — Druckdaten</span>
              <span className="text-xs text-[rgba(0,0,0,0.4)]">— physische mm-Koordinaten für AllesKlarDruck</span>
            </div>
            <div className="grid grid-cols-4 gap-3 p-4 bg-[#f0fdf4] rounded-xl border border-[#10b981]/20">
              <div><label className="block text-xs text-[rgba(0,0,0,0.5)] mb-1">Start X</label><NumInput value={view.printZone.offsetX_mm} onChange={v => setPz('offsetX_mm', v)} unit="mm" step={0.5} /></div>
              <div><label className="block text-xs text-[rgba(0,0,0,0.5)] mb-1">Start Y</label><NumInput value={view.printZone.offsetY_mm} onChange={v => setPz('offsetY_mm', v)} unit="mm" step={0.5} /></div>
              <div><label className="block text-xs text-[rgba(0,0,0,0.5)] mb-1">Breite</label><NumInput value={view.printZone.width_mm} onChange={v => setPz('width_mm', v)} unit="mm" step={0.5} /></div>
              <div><label className="block text-xs text-[rgba(0,0,0,0.5)] mb-1">Höhe</label><NumInput value={view.printZone.height_mm} onChange={v => setPz('height_mm', v)} unit="mm" step={0.5} /></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
