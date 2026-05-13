'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Stats {
  orders: number
  revenue: number
  designs: number
  users: number
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(r => r.json())
      .then(data => { if (data.success) setStats(data.data) })
  }, [])

  const cards = [
    { label: 'Bestellungen', value: stats?.orders ?? '–', href: '/admin/orders' },
    { label: 'Umsatz (EUR)', value: stats?.revenue != null ? `${stats.revenue.toFixed(2)} €` : '–', href: '/admin/orders' },
    { label: 'Designs', value: stats?.designs ?? '–', href: null },
    { label: 'Nutzer', value: stats?.users ?? '–', href: null },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1d1d1f] mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map(card => (
          <div key={card.label} className="yprint-card">
            <p className="text-sm text-[rgba(0,0,0,0.5)] mb-1">{card.label}</p>
            <p className="text-2xl font-bold text-[#1d1d1f]">{card.value}</p>
            {card.href && (
              <Link href={card.href} className="text-xs text-[#007aff] hover:underline mt-1 block">
                Ansehen →
              </Link>
            )}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/admin/templates" className="yprint-card hover:shadow-md transition-shadow block">
          <h2 className="font-semibold text-[#1d1d1f] mb-1">Templates verwalten</h2>
          <p className="text-sm text-[rgba(0,0,0,0.6)]">Produkte, Varianten, Druckzonen, Preise</p>
        </Link>
        <Link href="/admin/orders" className="yprint-card hover:shadow-md transition-shadow block">
          <h2 className="font-semibold text-[#1d1d1f] mb-1">Bestellungen verwalten</h2>
          <p className="text-sm text-[rgba(0,0,0,0.6)]">Status, Druckaufträge, AllesKlarDruck</p>
        </Link>
      </div>
    </div>
  )
}
