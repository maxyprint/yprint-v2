'use client'

import { useState, useEffect } from 'react'
import type { UserAddress } from '@/types'

const EMPTY_FORM = {
  first_name: '', last_name: '', company: '',
  street: '', street_nr: '', zip: '', city: '', country: 'DE', is_default: false,
}

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<UserAddress[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  const load = () => {
    fetch('/api/users/addresses')
      .then(r => r.json())
      .then(data => { if (data.success) setAddresses(data.data) })
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    await fetch('/api/users/addresses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setForm(EMPTY_FORM)
    setShowForm(false)
    setSaving(false)
    load()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Adresse löschen?')) return
    await fetch(`/api/users/addresses/${id}`, { method: 'DELETE' })
    load()
  }

  const handleSetDefault = async (id: string) => {
    await fetch(`/api/users/addresses/${id}/default`, { method: 'PUT' })
    load()
  }

  return (
    <div className="max-w-xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#1d1d1f]">Adressen</h1>
        <button onClick={() => setShowForm(true)} className="yprint-button yprint-button-primary">
          + Adresse hinzufügen
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="yprint-card animate-pulse h-24" />
          ))}
        </div>
      ) : addresses.length === 0 && !showForm ? (
        <div className="yprint-card text-center py-10">
          <p className="text-[rgba(0,0,0,0.6)] text-sm mb-4">Keine Adressen gespeichert.</p>
          <button onClick={() => setShowForm(true)} className="yprint-button yprint-button-primary">
            Erste Adresse hinzufügen
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {addresses.map(addr => (
            <div key={addr.id} className="yprint-card">
              <div className="flex items-start justify-between">
                <div className="text-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-[#1d1d1f]">{addr.first_name} {addr.last_name}</p>
                    {addr.is_default && (
                      <span className="text-xs bg-[#007aff]/10 text-[#007aff] px-2 py-0.5 rounded-full font-medium">Standard</span>
                    )}
                  </div>
                  {addr.company && <p className="text-[rgba(0,0,0,0.6)]">{addr.company}</p>}
                  <p className="text-[rgba(0,0,0,0.6)]">{addr.street} {addr.street_nr}</p>
                  <p className="text-[rgba(0,0,0,0.6)]">{addr.zip} {addr.city}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {!addr.is_default && (
                    <button
                      onClick={() => handleSetDefault(addr.id)}
                      className="text-xs text-[#007aff] hover:underline"
                    >
                      Als Standard
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(addr.id)}
                    className="text-xs text-red-500 hover:underline"
                  >
                    Löschen
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="yprint-card mt-4">
          <h2 className="font-semibold text-[#1d1d1f] mb-4">Neue Adresse</h2>
          <form onSubmit={handleSave} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-[#1d1d1f] mb-1">Vorname *</label>
                <input type="text" required value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} className="yprint-input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1d1d1f] mb-1">Nachname *</label>
                <input type="text" required value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} className="yprint-input" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1d1d1f] mb-1">Firma (optional)</label>
              <input type="text" value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} className="yprint-input" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-[#1d1d1f] mb-1">Straße *</label>
                <input type="text" required value={form.street} onChange={e => setForm(f => ({ ...f, street: e.target.value }))} className="yprint-input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1d1d1f] mb-1">Nr. *</label>
                <input type="text" required value={form.street_nr} onChange={e => setForm(f => ({ ...f, street_nr: e.target.value }))} className="yprint-input" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-[#1d1d1f] mb-1">PLZ *</label>
                <input type="text" required value={form.zip} onChange={e => setForm(f => ({ ...f, zip: e.target.value }))} className="yprint-input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1d1d1f] mb-1">Stadt *</label>
                <input type="text" required value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} className="yprint-input" />
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.is_default} onChange={e => setForm(f => ({ ...f, is_default: e.target.checked }))} />
              <span className="text-sm text-[rgba(0,0,0,0.7)]">Als Standardadresse setzen</span>
            </label>
            <div className="flex gap-3 pt-1">
              <button type="submit" disabled={saving} className="yprint-button yprint-button-primary">
                {saving ? 'Wird gespeichert…' : 'Speichern'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="yprint-button yprint-button-secondary">
                Abbrechen
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
