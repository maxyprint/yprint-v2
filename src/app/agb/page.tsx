import Link from 'next/link'

export const metadata = {
  title: 'AGB | yprint',
  description: 'Allgemeine Geschäftsbedingungen von yprint – Print on Demand Streetwear',
}

export default function AgbPage() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', fontFamily: "'Inter', 'Roboto', sans-serif" }}>
      {/* Header */}
      <header style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '0 24px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <img src="/logo.png" alt="yprint" width={100} height={40} style={{ objectFit: 'contain', display: 'block' }} />
          </Link>
          <Link href="/" style={{ fontSize: '14px', color: '#6b7280', textDecoration: 'none' }}>← Zurück zur Startseite</Link>
        </div>
      </header>

      <main style={{ maxWidth: '900px', margin: '0 auto', padding: '48px 24px 80px' }}>
        <div style={{ background: '#fff', borderRadius: '20px', padding: '48px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #e5e7eb' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#111827', margin: '0 0 8px 0' }}>Allgemeine Geschäftsbedingungen</h1>
          <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 40px 0' }}>Stand: Mai 2025</p>

          <Section title="§ 1 Geltungsbereich">
            <p>Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für alle Verträge zwischen</p>
            <p><strong>Max Schwarz (yprint)</strong><br />
            Rottendorfer Straße 35A<br />
            97070 Würzburg<br />
            E-Mail: <a href="mailto:info@yprint.de" style={{ color: '#0079FF' }}>info@yprint.de</a><br />
            (nachfolgend „yprint" oder „wir")</p>
            <p>und Kunden, die die Plattform yprint.de nutzen (nachfolgend „Nutzer" oder „Kunde").</p>
            <p>Abweichende AGB des Kunden gelten nicht, es sei denn, wir haben ihrer Geltung ausdrücklich schriftlich zugestimmt.</p>
            <p>Diese AGB gelten sowohl für Verbraucher (§ 13 BGB) als auch für Unternehmer (§ 14 BGB).</p>
          </Section>

          <Section title="§ 2 Leistungsbeschreibung">
            <p>yprint bietet eine Online-Plattform für Print-on-Demand Streetwear mit folgenden Kernleistungen:</p>
            <ul style={ul}>
              <li><strong>Design-Tool:</strong> Ein browserbasiertes Werkzeug zur Erstellung individueller Bekleidungsdesigns. Das Tool ermöglicht die Bearbeitung von Texten, Bildern und Grafiken auf verschiedenen Kleidungsstücken.</li>
              <li><strong>Print on Demand:</strong> Individuelle Bedruckung von Kleidungsstücken auf Bestellung, ohne Mindestbestellmenge.</li>
              <li><strong>Nutzerkonto:</strong> Persönlicher Bereich zur Verwaltung von Designs, Bestellungen und Kontoeinstellungen.</li>
            </ul>
            <p>Die Nutzung des Design-Tools und die Erstellung eines Kontos sind kostenlos. Kosten entstehen ausschließlich durch die Bestellung von Produkten.</p>
          </Section>

          <Section title="§ 3 Vertragsschluss">
            <h3 style={h3}>3.1 Registrierung</h3>
            <p>Die Registrierung auf yprint.de begründet keinen Kaufvertrag, sondern ist Voraussetzung für die Nutzung des Design-Tools und die Aufgabe von Bestellungen. Mit der Registrierung stimmst du diesen AGB und unserer <Link href="/datenschutz" style={{ color: '#0079FF' }}>Datenschutzerklärung</Link> zu.</p>

            <h3 style={h3}>3.2 Bestellung</h3>
            <p>Die Darstellung von Produkten auf unserer Plattform ist kein verbindliches Angebot, sondern eine Einladung zur Bestellung (invitatio ad offerendum).</p>
            <p>Mit Abschluss des Bestellvorgangs und Bestätigung der Zahlung gibst du ein verbindliches Kaufangebot ab. Der Kaufvertrag kommt zustande, wenn wir deine Bestellung per E-Mail bestätigen oder mit der Produktion beginnen.</p>
            <p>Wir behalten uns vor, Bestellungen ohne Angabe von Gründen abzulehnen, insbesondere wenn der Zahlungseingang nicht bestätigt wird oder die Bestellung inhaltlich gegen diese AGB oder geltendes Recht verstößt (z.B. urheberrechtsverletzende Designs).</p>

            <h3 style={h3}>3.3 Minderjährige</h3>
            <p>Die Nutzung von yprint ist Personen ab 16 Jahren gestattet. Für rechtsverbindliche Bestellungen ist eine Volljährigkeit (18 Jahre) oder die Zustimmung eines Erziehungsberechtigten erforderlich.</p>
          </Section>

          <Section title="§ 4 Preise und Zahlung">
            <h3 style={h3}>4.1 Preise</h3>
            <p>Alle Preise sind Endpreise inklusive der gesetzlichen Umsatzsteuer. Versandkosten werden im Bestellprozess separat ausgewiesen.</p>

            <h3 style={h3}>4.2 Zahlungsmethoden</h3>
            <p>Wir akzeptieren folgende Zahlungsmethoden:</p>
            <ul style={ul}>
              <li>Kreditkarte (Visa, Mastercard)</li>
              <li>SEPA-Lastschrift</li>
              <li>Weitere von Stripe unterstützte Zahlungsmethoden</li>
            </ul>
            <p>Die Zahlung wird über unseren Zahlungsdienstleister Stripe abgewickelt. Bei Bestellung wird der Betrag sofort belastet.</p>

            <h3 style={h3}>4.3 Fälligkeit</h3>
            <p>Der Rechnungsbetrag ist mit Bestellabschluss sofort fällig. Die Produktion beginnt erst nach vollständigem Zahlungseingang.</p>
          </Section>

          <Section title="§ 5 Produktion und Lieferung">
            <h3 style={h3}>5.1 Produktionszeit</h3>
            <p>Da jedes Produkt individuell auf Bestellung gefertigt wird, beträgt die Produktionszeit in der Regel <strong>1–3 Werktage</strong> nach Zahlungseingang.</p>

            <h3 style={h3}>5.2 Lieferzeit</h3>
            <p>Die Lieferzeit innerhalb Deutschlands beträgt nach Produktion <strong>2–5 Werktage</strong>. Für Lieferungen ins Ausland (EU) sind 5–10 Werktage einzuplanen.</p>
            <p>Genannte Fristen sind unverbindliche Richtwerte. Bei unvorhergesehenen Ereignissen (höhere Gewalt, Lieferengpässe) können Verzögerungen auftreten. In diesem Fall informieren wir dich schnellstmöglich.</p>

            <h3 style={h3}>5.3 Versandkosten</h3>
            <p>Die jeweils aktuellen Versandkosten werden dir vor Abschluss der Bestellung angezeigt.</p>

            <h3 style={h3}>5.4 Eigentumsvorbehalt</h3>
            <p>Die gelieferte Ware bleibt bis zur vollständigen Bezahlung unser Eigentum.</p>
          </Section>

          <Section title="§ 6 Widerrufsrecht">
            <div style={{ background: '#fef9ec', border: '1px solid #fcd34d', borderRadius: '10px', padding: '16px 20px', marginBottom: '16px' }}>
              <p style={{ fontWeight: 600, color: '#92400e', margin: '0 0 8px 0' }}>⚠ Wichtiger Hinweis</p>
              <p style={{ color: '#78350f', margin: 0 }}>Das gesetzliche Widerrufsrecht ist für individuell angefertigte Produkte gemäß § 312g Abs. 2 Nr. 1 BGB <strong>ausgeschlossen</strong>.</p>
            </div>
            <p>Da alle Produkte bei yprint individuell auf Bestellung und nach deinen persönlichen Gestaltungsvorgaben (deinem Design) gefertigt werden, sind diese nach § 312g Abs. 2 Nr. 1 BGB vom Widerrufsrecht ausgenommen. Ein Widerruf ist nach Produktionsbeginn nicht möglich.</p>
            <p>Ausnahmen gelten bei:</p>
            <ul style={ul}>
              <li>Fehlerhafter Lieferung (falsches Produkt, Druckfehler die nicht in deinem Design lagen)</li>
              <li>Beschädigter Ware bei Lieferung</li>
              <li>Erheblichen Qualitätsmängeln</li>
            </ul>
            <p>In diesen Fällen kontaktiere uns bitte innerhalb von <strong>14 Tagen</strong> nach Erhalt mit Fotos der Mängel an <a href="mailto:info@yprint.de" style={{ color: '#0079FF' }}>info@yprint.de</a>.</p>
          </Section>

          <Section title="§ 7 Nutzungsrechte und erlaubte Inhalte">
            <h3 style={h3}>7.1 Deine Designs</h3>
            <p>Du bist für die rechtliche Zulässigkeit deiner Designs selbst verantwortlich. Mit der Bestellung sicherst du uns zu, dass:</p>
            <ul style={ul}>
              <li>du Inhaber aller notwendigen Rechte an den verwendeten Bildern, Texten und Grafiken bist,</li>
              <li>dein Design keine Urheberrechte, Markenrechte oder sonstige Rechte Dritter verletzt,</li>
              <li>dein Design keine volksverhetzenden, pornographischen, gewaltverherrlichenden oder anderweitig rechtswidrigen Inhalte enthält,</li>
              <li>dein Design keine Kennzeichen verfassungswidriger Organisationen enthält.</li>
            </ul>
            <p>Du stellst uns von allen Ansprüchen Dritter frei, die aufgrund einer Verletzung dieser Zusicherungen entstehen.</p>

            <h3 style={h3}>7.2 Unsere Rechte</h3>
            <p>Wir behalten uns vor, Bestellungen mit rechtswidrigen oder gegen diese AGB verstoßenden Designs abzulehnen und entsprechende Konten zu sperren.</p>

            <h3 style={h3}>7.3 Plattform-Nutzungsrecht</h3>
            <p>yprint räumt dir ein nicht-exklusives, nicht-übertragbares Recht zur Nutzung der Plattform für private und gewerbliche Zwecke ein. Das Reverse Engineering, Kopieren oder anderweitige Nutzung unserer Software ist nicht gestattet.</p>
          </Section>

          <Section title="§ 8 Gewährleistung">
            <p>Es gelten die gesetzlichen Gewährleistungsrechte. Mängel musst du uns unverzüglich, spätestens innerhalb von <strong>14 Tagen</strong> nach Lieferung, schriftlich mitteilen.</p>
            <p>Kein Mangel liegt vor, wenn:</p>
            <ul style={ul}>
              <li>die Abweichung in deinem Design angelegt war (z.B. Pixelation durch niedrige Bildauflösung),</li>
              <li>du über eine mögliche Qualitätseinschränkung vor der Bestellung informiert wurdest,</li>
              <li>es sich um natürliche Farbabweichungen zwischen Bildschirmdarstellung und Druckergebnis handelt (Monitore sind keine geeichten Farbwiedergabegeräte).</li>
            </ul>
          </Section>

          <Section title="§ 9 Haftungsbeschränkung">
            <p>Wir haften unbeschränkt für Vorsatz und grobe Fahrlässigkeit sowie bei Verletzung von Leben, Körper oder Gesundheit.</p>
            <p>Bei leichter Fahrlässigkeit haften wir nur bei Verletzung wesentlicher Vertragspflichten (Kardinalpflichten), und dann nur in Höhe des typischen, vorhersehbaren Schadens.</p>
            <p>Eine weitergehende Haftung ist ausgeschlossen. Dies gilt insbesondere für entgangenen Gewinn und mittelbare Schäden.</p>
            <p>Die Haftungsbeschränkung gilt nicht für Ansprüche nach dem Produkthaftungsgesetz oder soweit eine Haftung zwingend gesetzlich vorgeschrieben ist.</p>
          </Section>

          <Section title="§ 10 Datenschutz">
            <p>Informationen zur Verarbeitung deiner personenbezogenen Daten findest du in unserer <Link href="/datenschutz" style={{ color: '#0079FF' }}>Datenschutzerklärung</Link>.</p>
          </Section>

          <Section title="§ 11 Streitbeilegung">
            <p>Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: <a href="https://ec.europa.eu/consumers/odr" style={{ color: '#0079FF' }} target="_blank" rel="noopener noreferrer">ec.europa.eu/consumers/odr</a></p>
            <p>Wir sind nicht bereit und nicht verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen. Bei Problemen wende dich bitte direkt an uns: <a href="mailto:info@yprint.de" style={{ color: '#0079FF' }}>info@yprint.de</a></p>
          </Section>

          <Section title="§ 12 Anwendbares Recht und Gerichtsstand">
            <p>Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des UN-Kaufrechts (CISG).</p>
            <p>Bei Verträgen mit Verbrauchern gilt abweichend das zwingende Recht des Staates, in dem der Verbraucher seinen gewöhnlichen Aufenthalt hat.</p>
            <p>Gerichtsstand für Kaufleute und juristische Personen des öffentlichen Rechts ist Würzburg.</p>
          </Section>

          <Section title="§ 13 Schlussbestimmungen">
            <p>Sollten einzelne Bestimmungen dieser AGB unwirksam oder undurchführbar sein, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt. An die Stelle unwirksamer Bestimmungen tritt die gesetzliche Regelung.</p>
            <p>yprint behält sich das Recht vor, diese AGB mit angemessener Ankündigungsfrist (mindestens 30 Tage per E-Mail) zu ändern. Widersprichst du der Änderung nicht innerhalb dieser Frist, gelten die neuen AGB als akzeptiert.</p>
          </Section>
        </div>
      </main>
    </div>
  )
}

const h3: React.CSSProperties = { fontSize: '16px', fontWeight: 600, color: '#111827', margin: '24px 0 8px 0' }
const ul: React.CSSProperties = { paddingLeft: '20px', margin: '8px 0 16px 0', lineHeight: 1.8 }

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
