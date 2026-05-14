'use client'

import { useState, useEffect, useRef } from 'react'
import { SizeMeasurement, MeasurementsData, calcPrintCoords } from '@/lib/print/calcCoords'

export type { SizeMeasurement, MeasurementsData }

const TEMPLATE_JSON = `{
  "XS":  { "chest_cm": 59, "length_cm": 67, "rib_height_cm": 2 },
  "S":   { "chest_cm": 60, "length_cm": 68, "rib_height_cm": 2 },
  "M":   { "chest_cm": 61, "length_cm": 69, "rib_height_cm": 2 },
  "L":   { "chest_cm": 62, "length_cm": 70, "rib_height_cm": 2 },
  "XL":  { "chest_cm": 64, "length_cm": 71, "rib_height_cm": 2 },
  "XXL": { "chest_cm": 66, "length_cm": 72, "rib_height_cm": 2 }
}`

interface Props {
  value: MeasurementsData
  onChange: (v: MeasurementsData) => void
  printWidthCm: number
  printHeightCm: number
}

interface Row {
  size: string
  chestCm: number
  offsetX_mm: number
  offsetY_mm: number
  width_mm: number
  height_mm: number
}

export function MeasurementsEditor({ value, onChange, printWidthCm, printHeightCm }: Props) {
  const [rawJson, setRawJson] = useState(() =>
    Object.keys(value.per_size).length > 0
      ? JSON.stringify(value.per_size, null, 2)
      : ''
  )
  const [jsonError, setJsonError] = useState<string | null>(null)
  const [yOffset, setYOffset] = useState(value.print_y_offset_mm)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (Object.keys(value.per_size).length > 0) {
      setRawJson(JSON.stringify(value.per_size, null, 2))
    }
    setYOffset(value.print_y_offset_mm)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleJsonChange = (text: string) => {
    setRawJson(text)
    if (!text.trim()) {
      setJsonError(null)
      onChange({ ...value, per_size: {} })
      return
    }
    try {
      const parsed = JSON.parse(text)
      setJsonError(null)
      onChange({ per_size: parsed, print_y_offset_mm: yOffset })
    } catch (e: any) {
      setJsonError(e.message)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      try {
        const parsed = JSON.parse(text)
        // Support both { per_size: {...}, print_y_offset_mm: 60 } and bare { "S": {...}, ... }
        const perSize = parsed.per_size ?? parsed
        const newYOffset = typeof parsed.print_y_offset_mm === 'number' ? parsed.print_y_offset_mm : yOffset
        setRawJson(JSON.stringify(perSize, null, 2))
        setJsonError(null)
        setYOffset(newYOffset)
        onChange({ per_size: perSize, print_y_offset_mm: newYOffset })
      } catch (err: any) {
        setJsonError(`Datei konnte nicht gelesen werden: ${err.message}`)
      }
    }
    reader.readAsText(file)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleYOffsetChange = (v: number) => {
    setYOffset(v)
    onChange({ ...value, print_y_offset_mm: v })
  }

  const rows: Row[] = Object.entries(value.per_size).map(([size, m]) => {
    const coords = calcPrintCoords(m, printWidthCm, printHeightCm, yOffset)
    return { size, chestCm: m.chest_cm, ...coords }
  })

  return (
    <div className="space-y-5">
      {/* JSON input */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-[#1d1d1f]">Maßtabelle (JSON)</label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs text-[#0079FF] hover:underline"
            >
              JSON-Datei hochladen
            </button>
            <span className="text-[rgba(0,0,0,0.2)] text-xs">·</span>
            <button
              type="button"
              onClick={() => handleJsonChange(TEMPLATE_JSON)}
              className="text-xs text-[rgba(0,0,0,0.4)] hover:text-[#1d1d1f] hover:underline"
            >
              Vorlage einfügen
            </button>
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          className="hidden"
          onChange={handleFileUpload}
        />
        <p className="text-xs text-[rgba(0,0,0,0.4)] mb-2">
          Pflichtfelder pro Größe:{' '}
          <code className="bg-[#f3f4f6] px-1 rounded">chest_cm</code>{' '}
          <code className="bg-[#f3f4f6] px-1 rounded">length_cm</code>{' '}
          <code className="bg-[#f3f4f6] px-1 rounded">rib_height_cm</code>
          {' '}· optional: shoulder_cm, sleeve_cm, hem_cm, neck_cm, biceps_cm
        </p>
        <textarea
          value={rawJson}
          onChange={e => handleJsonChange(e.target.value)}
          className={`yprint-input font-mono text-xs w-full resize-y ${jsonError ? 'border-red-300 bg-red-50' : ''}`}
          rows={10}
          spellCheck={false}
          placeholder={TEMPLATE_JSON}
        />
        {jsonError && (
          <p className="text-xs text-red-500 mt-1.5">JSON-Fehler: {jsonError}</p>
        )}
      </div>

      {/* Y offset */}
      <div className="flex items-center gap-4 flex-wrap">
        <label className="text-sm font-medium text-[#1d1d1f] whitespace-nowrap">
          Abstand Kragen → Druckbeginn
        </label>
        <div className="relative w-28">
          <input
            type="number"
            step={1}
            min={0}
            value={yOffset}
            onChange={e => handleYOffsetChange(parseFloat(e.target.value) || 0)}
            className="yprint-input pr-9"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[rgba(0,0,0,0.4)]">mm</span>
        </div>
        <span className="text-xs text-[rgba(0,0,0,0.4)]">
          = {(yOffset / 10).toFixed(1)} cm unterhalb Kragen-Unterkante
        </span>
      </div>

      {/* Calculated table */}
      {rows.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-[#1d1d1f] mb-1">Berechnete Druckkoordinaten per Größe</p>
          <p className="text-xs text-[rgba(0,0,0,0.4)] mb-3">
            Diese Werte werden bei jeder Bestellung automatisch berechnet und an AllesKlarDruck übergeben — kein manuelles Eintragen nötig.
          </p>
          <div className="overflow-x-auto rounded-xl border border-[#e5e7eb]">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#f3f4f6] text-xs text-[rgba(0,0,0,0.5)] uppercase tracking-wide">
                  <th className="text-left px-4 py-2.5 font-medium">Größe</th>
                  <th className="text-right px-4 py-2.5 font-medium">Brust</th>
                  <th className="text-right px-4 py-2.5 font-medium text-[#0079FF]">Offset X</th>
                  <th className="text-right px-4 py-2.5 font-medium text-[#0079FF]">Offset Y</th>
                  <th className="text-right px-4 py-2.5 font-medium">Breite</th>
                  <th className="text-right px-4 py-2.5 font-medium">Höhe</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f3f4f6]">
                {rows.map(r => (
                  <tr key={r.size} className="bg-white hover:bg-[#fafafa]">
                    <td className="px-4 py-2.5 font-bold text-[#1d1d1f]">{r.size}</td>
                    <td className="px-4 py-2.5 text-right text-[rgba(0,0,0,0.5)]">{r.chestCm} cm</td>
                    <td className="px-4 py-2.5 text-right font-mono font-semibold text-[#0079FF]">{r.offsetX_mm} mm</td>
                    <td className="px-4 py-2.5 text-right font-mono font-semibold text-[#0079FF]">{r.offsetY_mm} mm</td>
                    <td className="px-4 py-2.5 text-right text-[rgba(0,0,0,0.5)]">{r.width_mm} mm</td>
                    <td className="px-4 py-2.5 text-right text-[rgba(0,0,0,0.5)]">{r.height_mm} mm</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-[rgba(0,0,0,0.35)] mt-2">
            Offset X = (Brust − Druckbreite) ÷ 2 &nbsp;·&nbsp; Offset Y = Kragenhöhe + {yOffset} mm
          </p>
        </div>
      )}
    </div>
  )
}
