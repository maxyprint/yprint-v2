'use client'

import { useState, useEffect } from 'react'

export default function PrivacyPage() {
  const [settings, setSettings] = useState({ data_sharing: false, personalized_ads: false })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetch('/api/users/settings/privacy')
      .then(r => r.json())
      .then(data => { if (data.success && data.data) setSettings(data.data) })
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setSuccess(false)
    await fetch('/api/users/settings/privacy', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    })
    setSuccess(true)
    setSaving(false)
  }

  const Toggle = ({ checked, onChange, label, description }: { checked: boolean; onChange: (v: boolean) => void; label: string; description: string }) => (
    <label className="flex items-center justify-between py-3 cursor-pointer">
      <div className="pr-6">
        <p className="text-sm font-medium text-[#1d1d1f]">{label}</p>
        <p className="text-xs text-[rgba(0,0,0,0.5)]">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative flex-shrink-0 w-11 h-6 rounded-full transition-colors ${checked ? 'bg-[#007aff]' : 'bg-gray-200'}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-5' : ''}`} />
      </button>
    </label>
  )

  if (loading) return <div className="animate-pulse yprint-card h-32" />

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold text-[#1d1d1f] mb-6">Datenschutz</h1>
      <div className="yprint-card divide-y divide-[rgba(0,0,0,0.06)]">
        <Toggle checked={settings.data_sharing} onChange={v => setSettings(s => ({ ...s, data_sharing: v }))} label="Daten für Analysen teilen" description="Hilft uns, den Service zu verbessern (anonymisiert)" />
        <Toggle checked={settings.personalized_ads} onChange={v => setSettings(s => ({ ...s, personalized_ads: v }))} label="Personalisierte Werbung" description="Auf deinen Interessen basierende Anzeigen" />
      </div>
      {success && (
        <div className="mt-3 p-3 rounded-lg bg-green-50 border border-green-200 text-green-800 text-sm">
          Einstellungen gespeichert.
        </div>
      )}
      <div className="flex gap-3 mt-4">
        <button onClick={handleSave} disabled={saving} className="yprint-button yprint-button-primary">
          {saving ? 'Wird gespeichert…' : 'Speichern'}
        </button>
        <a
          href="/api/users/export"
          className="yprint-button yprint-button-secondary"
        >
          Daten exportieren (DSGVO)
        </a>
      </div>
    </div>
  )
}
