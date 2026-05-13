'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuthStore } from '@/store/auth'

export default function AdminNav() {
  const pathname = usePathname()
  const { logout } = useAuthStore()

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
