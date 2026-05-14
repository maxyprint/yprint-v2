'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  {
    href: '/settings/profile',
    label: 'Persönliche Daten',
    icon: (
      <svg width="16" height="16" fill="currentColor" viewBox="0 0 448 512">
        <path d="M224 256c70.7 0 128-57.3 128-128S294.7 0 224 0 96 57.3 96 128s57.3 128 128 128zm89.6 32h-16.7c-22.2 10.2-46.9 16-72.9 16s-50.6-5.8-72.9-16h-16.7C60.2 288 0 348.2 0 422.4V464c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48v-41.6c0-74.2-60.2-134.4-134.4-134.4z" />
      </svg>
    ),
  },
  {
    href: '/settings/addresses',
    label: 'Lieferadressen',
    icon: (
      <svg width="16" height="16" fill="currentColor" viewBox="0 0 384 512">
        <path d="M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0zM192 272c44.183 0 80-35.817 80-80s-35.817-80-80-80-80 35.817-80 80 35.817 80 80 80z" />
      </svg>
    ),
  },
  {
    href: '/settings/payment-methods',
    label: 'Zahlungsmethoden',
    icon: (
      <svg width="16" height="16" fill="currentColor" viewBox="0 0 576 512">
        <path d="M0 432c0 26.5 21.5 48 48 48h480c26.5 0 48-21.5 48-48V256H0v176zm192-68c0-6.6 5.4-12 12-12h136c6.6 0 12 5.4 12 12v40c0 6.6-5.4 12-12 12H204c-6.6 0-12-5.4-12-12v-40zm-128 0c0-6.6 5.4-12 12-12h72c6.6 0 12 5.4 12 12v40c0 6.6-5.4 12-12 12H76c-6.6 0-12-5.4-12-12v-40zM576 80v48H0V80C0 53.5 21.5 32 48 32h480c26.5 0 48 21.5 48 48z" />
      </svg>
    ),
  },
  {
    href: '/settings/notifications',
    label: 'Benachrichtigungen',
    icon: (
      <svg width="16" height="16" fill="currentColor" viewBox="0 0 448 512">
        <path d="M224 512c35.32 0 63.97-28.65 63.97-64H160.03c0 35.35 28.65 64 63.97 64zm215.39-149.71c-19.32-20.76-55.47-51.99-55.47-154.29 0-77.7-54.48-139.9-127.94-155.16V32c0-17.67-14.32-32-31.98-32s-31.98 14.33-31.98 32v20.84C118.56 68.1 64.08 130.3 64.08 208c0 102.3-36.15 133.53-55.47 154.29-6 6.45-8.66 14.16-8.61 21.71.11 16.4 12.98 32 32.1 32h383.8c19.12 0 32-15.6 32.1-32 .05-7.55-2.61-15.27-8.61-21.71z" />
      </svg>
    ),
  },
  {
    href: '/settings/privacy',
    label: 'Datenschutz',
    icon: (
      <svg width="16" height="16" fill="currentColor" viewBox="0 0 512 512">
        <path d="M466.5 83.7l-192-80a48.15 48.15 0 0 0-36.9 0l-192 80C27.7 91.1 16 108.6 16 128c0 198.5 114.5 335.7 221.5 380.3 11.8 4.9 25.1 4.9 36.9 0C360.1 472.6 496 349.3 496 128c0-19.4-11.7-36.9-29.5-44.3zM256.1 446.3l-.1-381 175.9 73.3c-3.3 151.4-82.1 261.1-175.8 307.7z" />
      </svg>
    ),
  },
]

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div>
      {/* Settings header */}
      <div style={{ marginBottom: '40px' }}>
        <h1
          style={{
            fontSize: '32px',
            fontWeight: 700,
            color: '#111827',
            margin: '0 0 10px 0',
          }}
        >
          Mein Konto
        </h1>
        <p style={{ fontSize: '16px', color: '#6b7280', margin: 0, maxWidth: '600px' }}>
          Verwalte deine Einstellungen und Checkout-Präferenzen
        </p>
      </div>

      <div style={{ display: 'flex', gap: '30px' }}>
        {/* Sidebar nav */}
        <aside
          style={{
            flex: '0 0 250px',
            position: 'sticky',
            top: '94px',
            height: 'fit-content',
            display: 'flex',
            flexDirection: 'column',
            gap: '5px',
          }}
        >
          {NAV.map(link => {
            const active = pathname === link.href || pathname.startsWith(link.href + '/')
            return (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: active ? '#edf1f7' : '#ffffff',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.02)',
                  transition: 'background-color 0.2s ease',
                  textDecoration: 'none',
                  color: 'inherit',
                  minHeight: '48px',
                  borderLeft: active ? '4px solid #3b82f6' : '4px solid transparent',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: active ? 'rgba(59,130,246,0.1)' : '#f3f4f6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: active ? '#3b82f6' : '#6b7280',
                      flexShrink: 0,
                    }}
                  >
                    {link.icon}
                  </div>
                  <span
                    style={{
                      fontSize: '14px',
                      fontWeight: active ? 600 : 400,
                      color: active ? '#111827' : '#374151',
                    }}
                  >
                    {link.label}
                  </span>
                </div>
                <svg
                  width="14"
                  height="14"
                  fill="none"
                  stroke={active ? '#3b82f6' : '#9ca3af'}
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="m9 18 6-6-6-6" />
                </svg>
              </Link>
            )
          })}
        </aside>

        {/* Content */}
        <div
          style={{
            flex: 1,
            minWidth: 0,
            position: 'relative',
            zIndex: 10,
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '32px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            border: '1px solid #e5e7eb',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
