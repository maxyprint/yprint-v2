'use client'

import { useState } from 'react'
import Link from 'next/link'
import HeroSlider from '@/components/HeroSlider'

const TICKER_ITEMS = [
  'Volle Gestaltungsfreiheit',
  'Dropshipping friendly',
  'Keine Mindestbestellmengen',
  'Schnelle Lieferung',
  'Premium Qualität',
  'Kostenlos starten',
  'Volle Gestaltungsfreiheit',
  'Dropshipping friendly',
  'Keine Mindestbestellmengen',
  'Schnelle Lieferung',
  'Premium Qualität',
  'Kostenlos starten',
]

const BENEFITS = [
  {
    icon: (
      <svg width="28" height="28" fill="none" stroke="#0079FF" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
    ),
    title: 'Du sparst Zeit',
    desc: 'Unser intuitives Design-Tool ermöglicht es dir, in Minuten professionelle Streetwear zu gestalten — ohne Vorkenntnisse, ohne Software-Download.',
  },
  {
    icon: (
      <svg width="28" height="28" fill="none" stroke="#0079FF" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
      </svg>
    ),
    title: 'Kein Risiko',
    desc: 'Durch unser Print-on-Demand-Modell ermöglichen wir es dir, bereits ab einem Stück zu bestellen — keine Mindestbestellmengen, keine hohen Vorabinvestitionen.',
  },
  {
    icon: (
      <svg width="28" height="28" fill="none" stroke="#0079FF" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
      </svg>
    ),
    title: 'Gute Kleidung',
    desc: 'Wir legen größten Wert auf Qualität. Unsere T-Shirts werden aus hochwertigen Materialien gefertigt und entsprechen höchsten Standards.',
  },
]

const FAQ_ITEMS = [
  {
    q: 'Wie lange dauert die Produktion und Lieferung?',
    a: 'Nach der Bestellung wird dein Produkt speziell für dich angefertigt. Die Produktionszeit beträgt in der Regel 2 Werktage. Die anschließende Lieferzeit innerhalb Deutschlands liegt bei 2 Werktagen.',
  },
  {
    q: 'Bietet ihr auch B2B-Lösungen an?',
    a: 'Ja, wir bieten maßgeschneiderte Lösungen für Unternehmen jeder Größe. Ob Firmenkleidung, Merchandise für Events oder Geschenke für Kunden — wir setzen deine individuellen Wünsche um und bieten attraktive Mengenrabatte.',
  },
  {
    q: 'Welche Qualität haben die Produkte?',
    a: 'Wir legen größten Wert auf Qualität. Unsere T-Shirts und anderen Produkte werden aus hochwertigen Materialien gefertigt und entsprechen den höchsten Standards in Bezug auf Verarbeitung, Passform und Haltbarkeit.',
  },
  {
    q: 'Ist yprint nachhaltig?',
    a: 'Nachhaltigkeit ist ein zentraler Aspekt unseres Geschäftsmodells. Durch Print-on-Demand vermeiden wir Überproduktion, da jedes Produkt erst nach der Bestellung gefertigt wird. Zudem planen wir, personalisierbare Vintage-Kleidung anzubieten.',
  },
  {
    q: 'Wie bleibe ich über neue Produkte und Features informiert?',
    a: 'Folge uns auf unseren Social-Media-Kanälen, um keine Neuigkeiten zu verpassen. Wir informieren regelmäßig über neue Produkte, Features und spezielle Angebote.',
  },
]

export default function HomePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const primary = '#0079FF'
  const dark = '#1d1d1f'
  const gray = '#6b7280'
  const lightGray = '#f3f4f6'

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', fontFamily: "'Inter', 'Roboto', 'Helvetica Neue', Arial, sans-serif" }}>

      {/* ── Header ── */}
      <header style={{
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid #e5e7eb',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 24px',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <a href="/" style={{ textDecoration: 'none' }}>
            <img
              src="https://yprint.de/wp-content/uploads/2025/02/120225-logo.svg"
              alt="yprint"
              width={100}
              height={40}
              style={{ objectFit: 'contain', display: 'block' }}
            />
          </a>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link href="/login" style={{
              fontSize: '14px', fontWeight: 500, color: dark,
              textDecoration: 'none', padding: '8px 16px', borderRadius: '8px',
            }}>
              login
            </Link>
            <Link href="/register" style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              padding: '10px 22px', background: primary, color: '#fff',
              borderRadius: '10px', fontSize: '14px', fontWeight: 600, textDecoration: 'none',
            }}>
              join yprint
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 24px 40px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)',
          gap: '60px',
          alignItems: 'center',
        }}>
          {/* Left: Slider */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <HeroSlider />
          </div>

          {/* Right: Text */}
          <div>
            <h1 style={{
              fontSize: 'clamp(28px, 4vw, 48px)',
              fontWeight: 700,
              color: dark,
              lineHeight: 1.15,
              margin: '0 0 20px 0',
            }}>
              Gestalte hochwertige, moderne Kleidung in Minuten kostenlos.
            </h1>
            <p style={{
              fontSize: '18px',
              color: gray,
              lineHeight: 1.6,
              margin: '0 0 36px 0',
            }}>
              Fange jetzt an, erstelle deinen Account und sichere dir 5€ Rabatt auf dein erstes Shirt, überzeuge dich selbst!
            </p>

            {/* CTA buttons */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', marginBottom: '24px' }}>
              <Link href="/register" style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                padding: '14px 32px', background: primary, color: '#fff',
                borderRadius: '10px', fontSize: '16px', fontWeight: 600, textDecoration: 'none',
                boxShadow: '0 4px 15px rgba(0,121,255,0.35)',
              }}>
                join yprint
              </Link>
            </div>

            {/* Trust badges */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
              {['Keine Kosten', 'Super einfach!'].map(label => (
                <div key={label} style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  fontSize: '14px', color: gray, fontWeight: 500,
                }}>
                  <svg width="18" height="18" fill="none" stroke="#0079FF" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Ticker ── */}
      <section style={{ backgroundColor: primary, padding: '16px 0', overflow: 'hidden' }}>
        <style>{`
          @keyframes ticker {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .ticker-track {
            display: flex;
            width: max-content;
            animation: ticker 30s linear infinite;
          }
        `}</style>
        <div className="ticker-track">
          {TICKER_ITEMS.map((item, i) => (
            <span key={i} style={{
              display: 'inline-flex', alignItems: 'center', gap: '12px',
              color: '#fff', fontSize: '14px', fontWeight: 600,
              padding: '0 32px', whiteSpace: 'nowrap',
            }}>
              <span style={{ opacity: 0.6 }}>✦</span>
              {item}
            </span>
          ))}
        </div>
      </section>

      {/* ── Benefits ── */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '80px 24px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
        }}>
          {BENEFITS.map(b => (
            <div key={b.title} style={{
              background: '#fff',
              borderRadius: '20px',
              padding: '32px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
              border: '1px solid #e5e7eb',
            }}>
              <div style={{
                width: '52px', height: '52px',
                background: 'rgba(0,121,255,0.08)',
                borderRadius: '14px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '20px',
              }}>
                {b.icon}
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 600, color: dark, margin: '0 0 12px 0' }}>
                {b.title}
              </h3>
              <p style={{ fontSize: '15px', color: gray, lineHeight: 1.6, margin: 0 }}>
                {b.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Produkt-Showcase ── */}
      <section style={{ backgroundColor: lightGray, padding: '80px 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: 700, color: dark, margin: '0 0 16px 0' }}>
            Starte mit deinem ersten Shirt
          </h2>
          <p style={{ fontSize: '18px', color: gray, margin: '0 auto 48px', maxWidth: '520px', lineHeight: 1.6 }}>
            Fang jetzt mit deinem ersten Shirt an.
          </p>

          <div style={{
            display: 'inline-flex', flexDirection: 'column', alignItems: 'center',
            background: '#fff', borderRadius: '20px', overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)', maxWidth: '320px',
          }}>
            <img
              src="https://yprint.de/wp-content/uploads/2025/02/kaan-freigestellt-front-Kopie-basics-2-768x769.webp"
              alt="Oversized T-Shirt"
              style={{ width: '100%', height: '320px', objectFit: 'cover' }}
            />
            <div style={{ padding: '20px', width: '100%', textAlign: 'left', boxSizing: 'border-box' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: dark, margin: '0 0 6px 0' }}>Shirt</h3>
              <p style={{ fontSize: '14px', color: gray, margin: '0 0 16px 0' }}>ab 17 €</p>
              <Link href="/register" style={{
                display: 'block', textAlign: 'center', padding: '12px',
                background: primary, color: '#fff', borderRadius: '10px',
                fontSize: '14px', fontWeight: 600, textDecoration: 'none',
              }}>
                Jetzt gestalten
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Mission ── */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: 700, color: dark, margin: '0 0 24px 0' }}>
          Unsere Mission
        </h2>
        <p style={{ fontSize: '18px', color: gray, maxWidth: '640px', margin: '0 auto 40px', lineHeight: 1.7 }}>
          yprint verändert die Modebranche als deutsche Streetwear-on-Demand-Plattform. Wir bieten dir die einzigartige Möglichkeit, ohne aufwendige Planung direkt in die Modeindustrie einzusteigen und personalisierte Streetwear zu entwerfen, die dir sonst niemand bieten kann.
        </p>
        <Link href="/register" style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          padding: '14px 32px', background: primary, color: '#fff',
          borderRadius: '10px', fontSize: '16px', fontWeight: 600, textDecoration: 'none',
          boxShadow: '0 4px 15px rgba(0,121,255,0.35)',
        }}>
          join yprint
        </Link>
      </section>

      {/* ── Warum yprint? ── */}
      <section style={{ backgroundColor: dark, padding: '80px 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: 700, color: '#fff', margin: '0 0 48px 0', textAlign: 'center' }}>
            Warum yprint?
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' }}>
            {[
              { title: 'Komplett kostenlos', desc: 'Keine Abo-Kosten, keine versteckten Gebühren. Du zahlst nur, wenn du bestellst.' },
              { title: 'Dein Design, deine Marke', desc: 'Volle kreative Freiheit. Eigene Logos, Texte, Bilder — alles im professionellen Editor.' },
              { title: 'Print on Demand', desc: 'Jedes Stück wird auf Bestellung gefertigt. Kein Lager, kein Risiko, keine Mindestmengen.' },
            ].map(p => (
              <div key={p.title} style={{ padding: '28px', borderRadius: '16px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#fff', margin: '0 0 12px 0' }}>{p.title}</h3>
                <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.6, margin: 0 }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ maxWidth: '800px', margin: '0 auto', padding: '80px 24px' }}>
        <h2 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 700, color: dark, margin: '0 0 40px 0', textAlign: 'center' }}>
          Häufig gestellte Fragen (FAQ)
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {FAQ_ITEMS.map((item, i) => (
            <div key={i} style={{
              border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden',
              background: '#fff',
            }}>
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '20px 24px', background: 'none', border: 'none', cursor: 'pointer',
                  textAlign: 'left', gap: '16px',
                }}
              >
                <span style={{ fontSize: '16px', fontWeight: 600, color: dark }}>{item.q}</span>
                <svg
                  width="20" height="20" fill="none" stroke={primary} strokeWidth="2" viewBox="0 0 24 24"
                  style={{ flexShrink: 0, transform: openFaq === i ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="m19 9-7 7-7-7" />
                </svg>
              </button>
              {openFaq === i && (
                <div style={{ padding: '0 24px 20px', fontSize: '15px', color: gray, lineHeight: 1.6 }}>
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer CTA ── */}
      <section style={{ backgroundColor: primary, padding: '60px 24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: 700, color: '#fff', margin: '0 0 24px 0' }}>
          Von dir entworfen, von yprint vollendet.
        </h2>
        <Link href="/register" style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          padding: '14px 36px', background: '#fff', color: primary,
          borderRadius: '10px', fontSize: '16px', fontWeight: 600, textDecoration: 'none',
        }}>
          Kostenlos starten
        </Link>
      </section>

      {/* ── Footer ── */}
      <footer style={{ borderTop: '1px solid #e5e7eb', background: '#fff', padding: '32px 24px' }}>
        <div style={{
          maxWidth: '1200px', margin: '0 auto',
          display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between',
          gap: '16px', fontSize: '14px', color: 'rgba(0,0,0,0.5)',
        }}>
          <span>© 2025 yprint. Alle Rechte vorbehalten.</span>
          <div style={{ display: 'flex', gap: '24px' }}>
            <Link href="/datenschutz" style={{ color: 'inherit', textDecoration: 'none' }}>Datenschutz</Link>
            <Link href="/agb" style={{ color: 'inherit', textDecoration: 'none' }}>AGB</Link>
            <Link href="/impressum" style={{ color: 'inherit', textDecoration: 'none' }}>Impressum</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
