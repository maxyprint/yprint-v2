import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'yprint | Streetwear On Demand',
  description: 'Starte deine eigene Streetwear-Marke mit yprint komplett kostenlos. Die All-in-One Print on Demand Lösung für Kreative Menschen!',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://yprint.de'),
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body className="min-h-full bg-[#f5f5f7] text-[#1d1d1f] antialiased">{children}</body>
    </html>
  )
}
