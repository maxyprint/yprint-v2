'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import { useState } from 'react'

export default function AdminNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { logout } = useAuthStore()
  const [clearing, setClearing] = useState(false)
  const [cleared, setCleared] = useState(false)

  const clearCache = async () => {
    setClearing(true)
    setCleared(false)
    try {
      await fetch('/api/admin/revalidate', { method: 'POST' })
      router.refresh()
      setCleared(true)
      setTimeout(() => setCleared(false), 2500)
    } finally {
      setClearing(false)
    }
  }

  const links = [
    { href: '/admin', label: 'Dashboard' },
    { href: '/admin/templates', label: 'Templates' },
    { href: '/admin/orders', label: 'Bestellungen' },
    { href: '/admin/settings', label: 'Einstellungen' },
  ]

  return (
    <nav className="bg-[#1d1d1f] text-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-6">
            <span className="text-lg font-bold text-[#007aff]">yprint admin</span>
            {links.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm transition-colors ${
                  pathname === link.href
                    ? 'text-white font-medium'
                    : 'text-[rgba(255,255,255,0.6)] hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={clearCache}
              disabled={clearing}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-colors font-medium ${
                cleared
                  ? 'border-green-500/40 bg-green-500/10 text-green-400'
                  : 'border-[rgba(255,255,255,0.15)] text-[rgba(255,255,255,0.5)] hover:text-white hover:border-[rgba(255,255,255,0.3)] disabled:opacity-40'
              }`}
            >
              {clearing ? '…' : cleared ? 'Cache geleert ✓' : 'Cache leeren'}
            </button>
            <Link href="/dashboard" className="text-sm text-[rgba(255,255,255,0.6)] hover:text-white transition-colors">
              Zur App
            </Link>
            <button
              onClick={() => logout()}
              className="text-sm text-[rgba(255,255,255,0.6)] hover:text-white transition-colors"
            >
              Abmelden
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
