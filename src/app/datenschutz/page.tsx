import Link from 'next/link'

export const metadata = {
  title: 'Datenschutzerklärung | yprint',
  description: 'Datenschutzerklärung von yprint – Print on Demand Streetwear',
}

export default function DatenschutzPage() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', fontFamily: "'Inter', 'Roboto', sans-serif" }}>
      {/* Header */}
      <header style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '0 24px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <img src="https://yprint.de/wp-content/uploads/2025/02/120225-logo.svg" alt="yprint" width={100} height={40} style={{ objectFit: 'contain', display: 'block' }} />
          </Link>
          <Link href="/" style={{ fontSize: '14px', color: '#6b7280', textDecoration: 'none' }}>← Zurück zur Startseite</Link>
        </div>
      </header>

      <main style={{ maxWidth: '900px', margin: '0 auto', padding: '48px 24px 80px' }}>
        <div style={{ background: '#fff', borderRadius: '20px', padding: '48px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #e5e7eb' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#111827', margin: '0 0 8px 0' }}>Datenschutzerklärung</h1>
          <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 40px 0' }}>Stand: Mai 2025</p>

          <Section title="1. Verantwortlicher">
            <p>Verantwortlicher im Sinne der Datenschutz-Grundverordnung (DSGVO) ist:</p>
            <p><strong>Max Schwarz</strong><br />
            Rottendorfer Straße 35A<br />
            97070 Würzburg<br />
            Deutschland<br />
            E-Mail: <a href="mailto:info@yprint.de" style={{ color: '#0079FF' }}>info@yprint.de</a></p>
          </Section>

          <Section title="2. Welche Daten wir erheben und warum">
            <h3 style={h3}>2.1 Registrierung und Nutzerkonto</h3>
            <p>Wenn du ein Konto bei yprint erstellst, verarbeiten wir:</p>
            <ul style={ul}>
              <li>E-Mail-Adresse (für Anmeldung, Kommunikation und Bestellbenachrichtigungen)</li>
              <li>Benutzername (für die Darstellung im Konto)</li>
              <li>Passwort (verschlüsselt, wir haben keinen Zugriff auf das Klartext-Passwort)</li>
              <li>Datum der Registrierung</li>
            </ul>
            <p><strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung – Bereitstellung des Nutzerkontos)</p>

            <h3 style={h3}>2.2 Profildaten</h3>
            <p>Optional kannst du dein Profil ergänzen um:</p>
            <ul style={ul}>
              <li>Vor- und Nachname</li>
              <li>Geburtsdatum</li>
              <li>Telefonnummer</li>
              <li>Lieferadressen</li>
            </ul>
            <p><strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung – Bestellabwicklung), Art. 6 Abs. 1 lit. a DSGVO (Einwilligung, sofern freiwillig angegeben)</p>

            <h3 style={h3}>2.3 Bestelldaten</h3>
            <p>Bei einer Bestellung verarbeiten wir:</p>
            <ul style={ul}>
              <li>Lieferadresse und Rechnungsadresse</li>
              <li>Bestellte Produkte und Designs</li>
              <li>Bestellbetrag, Bestellnummer, Bestellzeitpunkt</li>
              <li>Zahlungsstatus (nicht die vollständigen Zahlungsdaten – diese verarbeitet Stripe direkt)</li>
            </ul>
            <p><strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung), Art. 6 Abs. 1 lit. c DSGVO (gesetzliche Aufbewahrungspflichten nach §§ 147 AO, 257 HGB)</p>

            <h3 style={h3}>2.4 Design-Inhalte</h3>
            <p>Wenn du das Design-Tool nutzt, speichern wir:</p>
            <ul style={ul}>
              <li>Deine Designs (Fabric.js-Canvas-Daten, Bilddateien)</li>
              <li>Hochgeladene Bilder und Grafiken</li>
              <li>Generierte Druckdaten (Print-PNGs)</li>
            </ul>
            <p>Diese Daten werden ausschließlich zur Bereitstellung des Design-Services und zur Bestellabwicklung genutzt.</p>
            <p><strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. b DSGVO</p>

            <h3 style={h3}>2.5 Marketing-Kommunikation</h3>
            <p>Nur wenn du bei der Registrierung ausdrücklich zugestimmt hast, senden wir dir Newsletter und Angebote per E-Mail.</p>
            <p><strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. a DSGVO (Einwilligung)</p>
            <p>Diese Einwilligung kannst du jederzeit widerrufen, indem du dich in deinen Kontoeinstellungen unter „Benachrichtigungen" abmeldest oder uns eine E-Mail an <a href="mailto:info@yprint.de" style={{ color: '#0079FF' }}>info@yprint.de</a> sendest.</p>

            <h3 style={h3}>2.6 Technische Zugriffsdaten</h3>
            <p>Bei jedem Aufruf unserer Website werden technische Daten automatisch erfasst:</p>
            <ul style={ul}>
              <li>IP-Adresse (anonymisiert gespeichert)</li>
              <li>Browser-Typ und -Version</li>
              <li>Aufgerufene Seiten und Zeitpunkt des Zugriffs</li>
            </ul>
            <p><strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an der sicheren und fehlerfreien Bereitstellung des Dienstes)</p>
          </Section>

          <Section title="3. Eingesetzte Dienste und Drittanbieter">
            <h3 style={h3}>3.1 Supabase (Datenbank, Authentifizierung, Dateispeicher)</h3>
            <p>Wir nutzen Supabase (Supabase Inc., 970 Trestle Glen Rd, Oakland, CA 94610, USA) für die Speicherung von Nutzerdaten, Authentifizierung und Dateispeicherung. Supabase verarbeitet Daten auf AWS-Servern (Frankfurt, EU). Die Datenübertragung in die USA erfolgt auf Grundlage von Standardvertragsklauseln gemäß Art. 46 Abs. 2 lit. c DSGVO.</p>
            <p>Datenschutzinformationen: <a href="https://supabase.com/privacy" style={{ color: '#0079FF' }} target="_blank" rel="noopener noreferrer">supabase.com/privacy</a></p>

            <h3 style={h3}>3.2 Stripe (Zahlungsabwicklung)</h3>
            <p>Für die Zahlungsabwicklung nutzen wir Stripe (Stripe Payments Europe, Ltd., 1 Grand Canal Street Lower, Grand Canal Dock, Dublin, Irland). Stripe verarbeitet Zahlungsdaten wie Kreditkartennummern oder SEPA-Bankdaten direkt und eigenverantwortlich. Wir erhalten von Stripe lediglich eine Transaktions-ID und den Zahlungsstatus. Vollständige Zahlungsdaten speichern wir nicht.</p>
            <p>Datenschutzinformationen: <a href="https://stripe.com/de/privacy" style={{ color: '#0079FF' }} target="_blank" rel="noopener noreferrer">stripe.com/de/privacy</a></p>

            <h3 style={h3}>3.3 Resend (E-Mail-Versand)</h3>
            <p>Für den Versand von Transaktions-E-Mails (Registrierungsbestätigung, Bestellbestätigung, Passwort-Reset) nutzen wir Resend (Resend Inc., USA). Die Datenübertragung erfolgt auf Grundlage von Standardvertragsklauseln.</p>
            <p>Datenschutzinformationen: <a href="https://resend.com/legal/privacy-policy" style={{ color: '#0079FF' }} target="_blank" rel="noopener noreferrer">resend.com/legal/privacy-policy</a></p>

            <h3 style={h3}>3.4 Cloudflare Turnstile (Spam-Schutz)</h3>
            <p>Auf unseren Formularen verwenden wir Cloudflare Turnstile (Cloudflare, Inc., 101 Townsend St., San Francisco, CA 94107, USA) zum Schutz vor automatisierten Bots. Dabei wird dein Browser analysiert. Wir setzen keine sichtbaren CAPTCHAs ein.</p>
            <p>Datenschutzinformationen: <a href="https://www.cloudflare.com/de-de/privacypolicy/" style={{ color: '#0079FF' }} target="_blank" rel="noopener noreferrer">cloudflare.com/privacypolicy</a></p>

            <h3 style={h3}>3.5 HubSpot (CRM)</h3>
            <p>Für die Verwaltung von Kundenbeziehungen nutzen wir HubSpot (HubSpot, Inc., 25 First Street, 2nd Floor, Cambridge, MA 02141, USA). Bei der Registrierung wird deine E-Mail-Adresse und dein Nutzername an HubSpot übermittelt, um den Kundenkontakt zu ermöglichen. Die Datenübertragung erfolgt auf Grundlage von Standardvertragsklauseln.</p>
            <p>Datenschutzinformationen: <a href="https://legal.hubspot.com/de/privacy-policy" style={{ color: '#0079FF' }} target="_blank" rel="noopener noreferrer">legal.hubspot.com/de/privacy-policy</a></p>
          </Section>

          <Section title="4. Speicherdauer">
            <p>Wir speichern personenbezogene Daten nur so lange, wie es für den jeweiligen Zweck erforderlich ist:</p>
            <ul style={ul}>
              <li><strong>Nutzerkontodaten:</strong> Bis zur Löschung des Kontos durch den Nutzer</li>
              <li><strong>Bestelldaten:</strong> 10 Jahre (gesetzliche Aufbewahrungspflicht nach §§ 147 AO, 257 HGB)</li>
              <li><strong>Design-Inhalte:</strong> Bis zur Löschung des Kontos oder manuellen Löschung durch den Nutzer</li>
              <li><strong>Marketing-Kommunikation:</strong> Bis zum Widerruf der Einwilligung</li>
              <li><strong>Zugriffsprotokolle:</strong> Maximal 30 Tage</li>
            </ul>
          </Section>

          <Section title="5. Deine Rechte">
            <p>Du hast als betroffene Person folgende Rechte gemäß DSGVO:</p>
            <ul style={ul}>
              <li><strong>Auskunft (Art. 15 DSGVO):</strong> Du kannst jederzeit Auskunft über die zu deiner Person gespeicherten Daten verlangen.</li>
              <li><strong>Berichtigung (Art. 16 DSGVO):</strong> Du kannst die Korrektur unrichtiger Daten verlangen.</li>
              <li><strong>Löschung (Art. 17 DSGVO):</strong> Du kannst die Löschung deiner Daten verlangen, soweit keine gesetzlichen Aufbewahrungspflichten entgegenstehen. Du kannst dein Konto in den Einstellungen unter „Mein Konto" selbst löschen.</li>
              <li><strong>Einschränkung der Verarbeitung (Art. 18 DSGVO):</strong> Du kannst die Einschränkung der Verarbeitung deiner Daten verlangen.</li>
              <li><strong>Datenübertragbarkeit (Art. 20 DSGVO):</strong> Du kannst eine Kopie deiner Daten in einem maschinenlesbaren Format anfordern. Dies ist in den Einstellungen unter „Daten exportieren" möglich.</li>
              <li><strong>Widerspruch (Art. 21 DSGVO):</strong> Du kannst der Verarbeitung deiner Daten widersprechen, soweit sie auf berechtigten Interessen beruht.</li>
              <li><strong>Widerruf von Einwilligungen (Art. 7 Abs. 3 DSGVO):</strong> Du kannst Einwilligungen jederzeit mit Wirkung für die Zukunft widerrufen.</li>
            </ul>
            <p>Um diese Rechte auszuüben, sende uns eine E-Mail an <a href="mailto:info@yprint.de" style={{ color: '#0079FF' }}>info@yprint.de</a> oder nutze die Selbstverwaltungsfunktionen in deinen Kontoeinstellungen.</p>
            <p>Du hast außerdem das Recht, dich bei einer Aufsichtsbehörde zu beschweren. Die zuständige Aufsichtsbehörde ist:<br />
            Bayerisches Landesamt für Datenschutzaufsicht (BayLDA), Promenade 18, 91522 Ansbach</p>
          </Section>

          <Section title="6. Cookies und lokale Speicherung">
            <p>Wir verwenden technisch notwendige Cookies und lokalen Browser-Speicher (localStorage) für:</p>
            <ul style={ul}>
              <li>Authentifizierung und Sitzungsverwaltung (notwendig für den Login)</li>
              <li>Warenkorb-Daten (für nicht eingeloggte Nutzer im localStorage)</li>
            </ul>
            <p>Wir setzen keine Tracking-Cookies und keine Werbe-Cookies ein. Cookies von Drittanbietern werden nur von Stripe (Zahlungsabwicklung) und Cloudflare (Sicherheit) im Rahmen der oben beschriebenen Dienste gesetzt.</p>
          </Section>

          <Section title="7. Sicherheit">
            <p>Wir schützen deine Daten durch technische und organisatorische Maßnahmen, insbesondere:</p>
            <ul style={ul}>
              <li>Verschlüsselte Datenübertragung (HTTPS/TLS)</li>
              <li>Verschlüsselte Passwort-Speicherung (bcrypt)</li>
              <li>Zugriffskontrollen auf Datenbankebene (Row-Level Security)</li>
              <li>Regelmäßige Sicherheitsupdates</li>
            </ul>
          </Section>

          <Section title="8. Änderungen dieser Datenschutzerklärung">
            <p>Wir können diese Datenschutzerklärung von Zeit zu Zeit aktualisieren. Bei wesentlichen Änderungen werden wir dich per E-Mail informieren. Das Datum der letzten Aktualisierung ist oben angegeben.</p>
          </Section>

          <Section title="9. Kontakt">
            <p>Bei Fragen zum Datenschutz wende dich bitte an:<br />
            <a href="mailto:info@yprint.de" style={{ color: '#0079FF' }}>info@yprint.de</a></p>
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
