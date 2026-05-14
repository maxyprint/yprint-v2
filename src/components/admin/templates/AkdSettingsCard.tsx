'use client'

export interface AkdSettings {
  akd_product_type: string
  akd_manufacturer: string
  akd_series: string
  akd_print_method: string
}

interface Props {
  value: AkdSettings
  onChange: (v: AkdSettings) => void
}

const PRODUCT_TYPES = ['TSHIRT', 'HOODIE', 'LONGSLEEVE', 'SWEATSHIRT', 'TANKTOP', 'POLO']
const PRINT_METHODS = ['DTG', 'DTF', 'Screen', 'Embroidery']

export function AkdSettingsCard({ value, onChange }: Props) {
  const set = (field: keyof AkdSettings, v: string) => onChange({ ...value, [field]: v })

  return (
    <div className="yprint-card">
      <h2 className="font-semibold text-[#1d1d1f] mb-1">AllesKlarDruck</h2>
      <p className="text-xs text-[rgba(0,0,0,0.4)] mb-4">Druckdaten-Übergabe an den Druckpartner</p>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-[rgba(0,0,0,0.6)] mb-1">Produkttyp</label>
          <select value={value.akd_product_type} onChange={e => set('akd_product_type', e.target.value)} className="yprint-input text-sm">
            {PRODUCT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-[rgba(0,0,0,0.6)] mb-1">Druckmethode</label>
          <select value={value.akd_print_method} onChange={e => set('akd_print_method', e.target.value)} className="yprint-input text-sm">
            {PRINT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-[rgba(0,0,0,0.6)] mb-1">Hersteller</label>
          <input
            type="text"
            value={value.akd_manufacturer}
            onChange={e => set('akd_manufacturer', e.target.value)}
            className="yprint-input text-sm"
            placeholder="z.B. yprint"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[rgba(0,0,0,0.6)] mb-1">Serie</label>
          <input
            type="text"
            value={value.akd_series}
            onChange={e => set('akd_series', e.target.value)}
            className="yprint-input text-sm"
            placeholder="z.B. SS25"
          />
        </div>
      </div>
    </div>
  )
}
