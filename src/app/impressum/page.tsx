import Link from 'next/link'

export const metadata = {
  title: 'Impressum | yprint',
  description: 'Impressum von yprint – Print on Demand Streetwear',
}

export default function ImpressumPage() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', fontFamily: "'Inter', 'Roboto', sans-serif" }}>
      {/* Header */}
      <header style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '0 24px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <img src="/logo.png" alt="yprint" style={{ height: '44px', width: 'auto', display: 'block' }} />
          </Link>
          <Link href="/" style={{ fontSize: '14px', color: '#6b7280', textDecoration: 'none' }}>← Zurück zur Startseite</Link>
        </div>
      </header>

      <main style={{ maxWidth: '900px', margin: '0 auto', padding: '48px 24px 80px' }}>
        <div style={{ background: '#fff', borderRadius: '20px', padding: '48px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #e5e7eb' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#111827', margin: '0 0 40px 0' }}>Impressum</h1>

          <Section title="Angaben gemäß § 5 TMG">
            <p>
              <strong>Max Schwarz</strong><br />
              yprint<br />
              Rottendorfer Straße 35A<br />
              97070 Würzburg<br />
              Deutschland
            </p>
          </Section>

          <Section title="Kontakt">
            <p>
              E-Mail: <a href="mailto:info@yprint.de" style={{ color: '#0079FF' }}>info@yprint.de</a>
            </p>
          </Section>

          <Section title="Verantwortlicher für den Inhalt (§ 55 Abs. 2 RStV)">
            <p>
              Max Schwarz<br />
              Rottendorfer Straße 35A<br />
              97070 Würzburg
            </p>
          </Section>

          <Section title="EU-Streitschlichtung">
            <p>
              Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{' '}
              <a href="https://ec.europa.eu/consumers/odr" style={{ color: '#0079FF' }} target="_blank" rel="noopener noreferrer">
                ec.europa.eu/consumers/odr
              </a>
            </p>
            <p>
              Unsere E-Mail-Adresse finden Sie oben im Impressum. Wir sind nicht bereit und nicht verpflichtet,
              an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
            </p>
          </Section>

          <Section title="Haftungsausschluss">
            <h3 style={h3}>Haftung für Inhalte</h3>
            <p>
              Als Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG für eigene Inhalte auf diesen Seiten nach den
              allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht
              verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen
              zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
            </p>

            <h3 style={h3}>Haftung für Links</h3>
            <p>
              Unser Angebot enthält Links zu externen Webseiten Dritter, auf deren Inhalte wir keinen Einfluss
              haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte
              der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.
            </p>

            <h3 style={h3}>Urheberrecht</h3>
            <p>
              Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen
              Urheberrecht. Downloads und Kopien dieser Seite sind nur für den privaten, nicht kommerziellen Gebrauch
              gestattet. Soweit die Inhalte auf dieser Seite nicht vom Betreiber erstellt wurden, werden die
              Urheberrechte Dritter beachtet. Insbesondere werden Inhalte Dritter als solche gekennzeichnet.
              Solltest du trotzdem auf eine Urheberrechtsverletzung aufmerksam werden, bitten wir um einen
              entsprechenden Hinweis an{' '}
              <a href="mailto:info@yprint.de" style={{ color: '#0079FF' }}>info@yprint.de</a>.
            </p>
          </Section>
        </div>
      </main>
    </div>
  )
}

const h3: React.CSSProperties = { fontSize: '16px', fontWeight: 600, color: '#111827', margin: '24px 0 8px 0' }

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: '40px' }}>
      <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', margin: '0 0 16px 0', paddingBottom: '12px', borderBottom: '1px solid #e5e7eb' }}>
        {title}
      </h2>
      <div style={{ fontSize: '15px', color: '#374151', lineHeight: 1.8 }}>
        {children}
      </div>
    </section>
  )
}
