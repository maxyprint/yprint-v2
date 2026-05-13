'use client'

import { useState, useEffect } from 'react'

export default function NotificationsPage() {
  const [settings, setSettings] = useState({
    email_orders: true, email_marketing: false,
    sms_orders: false, sms_marketing: false,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetch('/api/users/settings/notifications')
      .then(r => r.json())
      .then(data => { if (data.success && data.data) setSettings(data.data) })
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setSuccess(false)
    await fetch('/api/users/settings/notifications', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    })
    setSuccess(true)
    setSaving(false)
  }

  const Toggle = ({ checked, onChange, label, description }: { checked: boolean; onChange: (v: boolean) => void; label: string; description: string }) => (
    <label className="flex items-center justify-between py-3 cursor-pointer">
      <div>
        <p className="text-sm font-medium text-[#1d1d1f]">{label}</p>
        <p className="text-xs text-[rgba(0,0,0,0.5)]">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors ${checked ? 'bg-[#007aff]' : 'bg-gray-200'}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-5' : ''}`} />
      </button>
    </label>
  )

  if (loading) return <div className="animate-pulse yprint-card h-48" />

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold text-[#1d1d1f] mb-6">Benachrichtigungen</h1>
      <div className="yprint-card divide-y divide-[rgba(0,0,0,0.06)]">
        <Toggle checked={settings.email_orders} onChange={v => setSettings(s => ({ ...s, email_orders: v }))} label="Bestellbestätigungen per E-Mail" description="Erhalte Statusupdates zu deinen Bestellungen" />
        <Toggle checked={settings.email_marketing} onChange={v => setSettings(s => ({ ...s, email_marketing: v }))} label="Newsletter per E-Mail" description="Neuheiten, Angebote und Design-Tipps" />
        <Toggle checked={settings.sms_orders} onChange={v => setSettings(s => ({ ...s, sms_orders: v }))} label="Bestellupdates per SMS" description="Versandbestätigung und Lieferstatus" />
        <Toggle checked={settings.sms_marketing} onChange={v => setSettings(s => ({ ...s, sms_marketing: v }))} label="Marketing-SMS" description="Aktionen und exklusive Angebote" />
      </div>
      {success && (
        <div className="mt-3 p-3 rounded-lg bg-green-50 border border-green-200 text-green-800 text-sm">
          Einstellungen gespeichert.
        </div>
      )}
      <button onClick={handleSave} disabled={saving} className="yprint-button yprint-button-primary mt-4">
        {saving ? 'Wird gespeichert…' : 'Speichern'}
      </button>
    </div>
  )
}
