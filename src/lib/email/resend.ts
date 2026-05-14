import { Resend } from 'resend'

export const resend = new Resend(process.env.RESEND_API_KEY)

// Falls yprint.de noch nicht in Resend verifiziert: Fallback auf Resend-Testdomain
const FROM = process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev'
const FROM_VERIFIED = process.env.RESEND_DOMAIN_VERIFIED === 'true'

async function send(payload: Parameters<typeof resend.emails.send>[0]) {
  // Ersten Versuch mit konfigurierter FROM-Adresse
  const result = await resend.emails.send(payload)
  if (!result.error || FROM_VERIFIED) return result

  // Fallback auf Resend-eigene Domain (funktioniert ohne Verifikation)
  console.warn('[Resend] Domain nicht verifiziert, nutze Fallback-Sender')
  return resend.emails.send({ ...payload, from: 'yprint <onboarding@resend.dev>' })
}

export async function sendVerificationEmail(email: string, verificationUrl: string, firstName?: string) {
  return send({
    from: FROM,
    to: email,
    subject: 'Bestätige deine yprint E-Mail-Adresse',
    html: `
      <div style="font-family: Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #007aff;">Willkommen bei yprint${firstName ? `, ${firstName}` : ''}!</h2>
        <p>Bitte bestätige deine E-Mail-Adresse um loszulegen.</p>
        <a href="${verificationUrl}" style="display:inline-block;background:#007aff;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">
          E-Mail bestätigen
        </a>
        <p style="color:#666;font-size:14px;margin-top:24px;">
          Dieser Link ist 24 Stunden gültig. Falls du kein Konto bei yprint erstellt hast, kannst du diese E-Mail ignorieren.
        </p>
      </div>
    `,
  })
}

export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  return send({
    from: FROM,
    to: email,
    subject: 'yprint — Passwort zurücksetzen',
    html: `
      <div style="font-family: Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #007aff;">Passwort zurücksetzen</h2>
        <p>Du hast eine Anfrage zum Zurücksetzen deines Passworts gestellt.</p>
        <a href="${resetUrl}" style="display:inline-block;background:#007aff;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">
          Neues Passwort setzen
        </a>
        <p style="color:#666;font-size:14px;margin-top:24px;">
          Dieser Link ist 1 Stunde gültig. Falls du diese Anfrage nicht gestellt hast, kannst du sie ignorieren.
        </p>
      </div>
    `,
  })
}

export async function sendOrderConfirmationEmail(
  email: string,
  orderNumber: string,
  items: { name: string; quantity: number; price: number }[],
  total: number
) {
  const itemsHtml = items.map(i =>
    `<tr><td>${i.name}</td><td>${i.quantity}x</td><td style="text-align:right">${i.price.toFixed(2)} €</td></tr>`
  ).join('')

  return send({
    from: FROM,
    to: email,
    subject: `yprint — Bestellbestätigung #${orderNumber}`,
    html: `
      <div style="font-family: Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #007aff;">Bestellung bestätigt!</h2>
        <p>Danke für deine Bestellung. Wir bearbeiten sie so schnell wie möglich.</p>
        <p><strong>Bestellnummer:</strong> ${orderNumber}</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0">
          <thead>
            <tr style="background:#f5f5f5">
              <th style="text-align:left;padding:8px">Produkt</th>
              <th style="padding:8px">Menge</th>
              <th style="text-align:right;padding:8px">Preis</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
          <tfoot>
            <tr>
              <td colspan="2" style="padding:8px;font-weight:bold">Gesamt</td>
              <td style="text-align:right;padding:8px;font-weight:bold">${total.toFixed(2)} €</td>
            </tr>
          </tfoot>
        </table>
        <p>Bei Fragen erreichst du uns unter <a href="mailto:info@yprint.de">info@yprint.de</a></p>
      </div>
    `,
  })
}
