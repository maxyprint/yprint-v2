'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/auth'

export default function ProfileSettingsPage() {
  const { user } = useAuthStore()
  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '', birthdate: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/users/profile')
      .then(r => r.json())
      .then(data => {
        if (data.success && data.data) {
          setForm({
            firstName: data.data.first_name || '',
            lastName: data.data.last_name || '',
            phone: data.data.phone || '',
            birthdate: data.data.birthdate || '',
          })
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(false)
    try {
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setSuccess(true)
    } catch (err: any) {
      setError(err.message || 'Fehler beim Speichern.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="animate-pulse yprint-card h-64" />

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold text-[#1d1d1f] mb-6">Profil</h1>
      <div className="yprint-card">
        <div className="mb-4 pb-4 border-b border-[rgba(0,0,0,0.08)]">
          <p className="text-sm text-[rgba(0,0,0,0.6)]">E-Mail</p>
          <p className="font-medium text-[#1d1d1f]">{user?.email}</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-[#1d1d1f] mb-1.5">Vorname</label>
              <input
                type="text"
                value={form.firstName}
                onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
                className="yprint-input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1d1d1f] mb-1.5">Nachname</label>
              <input
                type="text"
                value={form.lastName}
                onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
                className="yprint-input"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1d1d1f] mb-1.5">Telefon</label>
            <input
              type="tel"
              value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              className="yprint-input"
              placeholder="+49 123 456789"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1d1d1f] mb-1.5">Geburtsdatum</label>
            <input
              type="date"
              value={form.birthdate}
              onChange={e => setForm(f => ({ ...f, birthdate: e.target.value }))}
              className="yprint-input"
            />
          </div>
          {success && (
            <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-green-800 text-sm">
              Profil gespeichert.
            </div>
          )}
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
          )}
          <button type="submit" disabled={saving} className="yprint-button yprint-button-primary">
            {saving ? 'Wird gespeichert…' : 'Speichern'}
          </button>
        </form>
      </div>

      <div className="yprint-card mt-4">
        <h2 className="font-semibold text-[#1d1d1f] mb-4">Konto löschen</h2>
        <p className="text-sm text-[rgba(0,0,0,0.6)] mb-4">
          Alle deine Daten werden unwiderruflich gelöscht (DSGVO Art. 17).
        </p>
        <button
          onClick={async () => {
            if (!confirm('Konto wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.')) return
            await fetch('/api/users/delete', { method: 'DELETE' })
            window.location.href = '/'
          }}
          className="yprint-button yprint-button-danger"
        >
          Konto löschen
        </button>
      </div>
    </div>
  )
}
