import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-[rgba(0,0,0,0.06)] sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="text-2xl font-bold text-[#007aff]">yprint</span>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-[rgba(0,0,0,0.7)] hover:text-[#1d1d1f] transition-colors">
              Anmelden
            </Link>
            <Link href="/register" className="yprint-button yprint-button-primary text-sm py-2 px-4">
              Kostenlos starten
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-24 text-center">
        <h1 className="text-5xl sm:text-6xl font-bold text-[#1d1d1f] leading-tight mb-6">
          Deine eigene<br />
          <span className="text-[#007aff]">Streetwear-Marke</span>
        </h1>
        <p className="text-xl text-[rgba(0,0,0,0.6)] max-w-2xl mx-auto mb-10">
          Erstelle, drucke und verkaufe dein eigenes Streetwear-Design — komplett kostenlos.
          Die All-in-One Print-on-Demand Lösung für kreative Menschen.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/register" className="yprint-button yprint-button-primary text-base px-8 py-3.5">
            Jetzt kostenlos starten
          </Link>
          <Link href="/login" className="yprint-button yprint-button-secondary text-base px-8 py-3.5">
            Bereits registriert
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            {
              title: 'Design-Tool',
              description: 'Professioneller Editor mit Fabric.js. Texte, Bilder, Formen — alles direkt im Browser.',
              icon: (
                <svg className="w-7 h-7 text-[#007aff]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.4 2.245 4.5 4.5 0 0 0 8.4-2.245c0-.399-.078-.78-.22-1.128Zm0 0a15.998 15.998 0 0 0 3.388-1.62m-5.043-.025a15.994 15.994 0 0 1 1.622-3.395m3.42 3.42a15.995 15.995 0 0 0 4.764-4.648l3.876-5.814a1.151 1.151 0 0 0-1.597-1.597L14.146 6.32a15.996 15.996 0 0 0-4.649 4.763m3.42 3.42a6.776 6.776 0 0 0-3.42-3.42" />
                </svg>
              ),
            },
            {
              title: 'Print on Demand',
              description: 'Kein Lager, keine Mindestmengen. Jedes Stück wird auf Bestellung für dich gedruckt.',
              icon: (
                <svg className="w-7 h-7 text-[#007aff]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M6.34 18H5.25A2.25 2.25 0 0 1 3 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 0 1 1.913-.247m10.5 0a48.536 48.536 0 0 0-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5Zm-3 0h.008v.008H15V10.5Z" />
                </svg>
              ),
            },
            {
              title: 'Sichere Zahlung',
              description: 'Stripe-Integration mit Kreditkarte, SEPA-Lastschrift und mehr. Vollständig DSGVO-konform.',
              icon: (
                <svg className="w-7 h-7 text-[#007aff]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                </svg>
              ),
            },
          ].map(f => (
            <div key={f.title} className="yprint-card">
              <div className="w-12 h-12 bg-[#007aff]/10 rounded-xl flex items-center justify-center mb-4">
                {f.icon}
              </div>
              <h3 className="font-semibold text-[#1d1d1f] mb-2">{f.title}</h3>
              <p className="text-sm text-[rgba(0,0,0,0.6)] leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-[rgba(0,0,0,0.06)] bg-white py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[rgba(0,0,0,0.5)]">
          <span>© 2025 yprint. Alle Rechte vorbehalten.</span>
          <div className="flex gap-6">
            <Link href="/datenschutz" className="hover:text-[#1d1d1f] transition-colors">Datenschutz</Link>
            <Link href="/agb" className="hover:text-[#1d1d1f] transition-colors">AGB</Link>
            <Link href="/impressum" className="hover:text-[#1d1d1f] transition-colors">Impressum</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
