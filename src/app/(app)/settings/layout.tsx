'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  { href: '/settings/profile', label: 'Profil' },
  { href: '/settings/addresses', label: 'Adressen' },
  { href: '/settings/payment-methods', label: 'Zahlungsmethoden' },
  { href: '/settings/notifications', label: 'Benachrichtigungen' },
  { href: '/settings/privacy', label: 'Datenschutz' },
]

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  return (
    <div className="flex gap-6">
      <aside className="w-48 flex-shrink-0">
        <nav className="space-y-0.5">
          {NAV.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                pathname === link.href
                  ? 'bg-[#007aff] text-white font-medium'
                  : 'text-[rgba(0,0,0,0.7)] hover:bg-[rgba(0,0,0,0.04)]'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  )
}
