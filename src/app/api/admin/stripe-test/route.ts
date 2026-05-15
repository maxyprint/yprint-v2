import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/helpers'
import { stripe } from '@/lib/stripe/client'

export async function GET() {
  const { user, error } = await requireAdmin()
  if (error || !user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const results: Record<string, { ok: boolean; value?: string; error?: string }> = {}

  // 1. Env vars present & format
  const secretKey = process.env.STRIPE_SECRET_KEY || ''
  const pubKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ''

  results.secret_key_present = {
    ok: secretKey.length > 0,
    value: secretKey ? `${secretKey.slice(0, 7)}...${secretKey.slice(-4)}` : '(leer)',
  }
  results.secret_key_format = {
    ok: secretKey.startsWith('sk_live_') || secretKey.startsWith('sk_test_'),
    value: secretKey.startsWith('sk_live_') ? 'live ✓' : secretKey.startsWith('sk_test_') ? 'test ✓' : `Ungültig: "${secretKey.slice(0, 10)}..."`,
  }
  results.publishable_key_present = {
    ok: pubKey.length > 0,
    value: pubKey ? `${pubKey.slice(0, 7)}...${pubKey.slice(-4)}` : '(leer)',
  }
  results.publishable_key_format = {
    ok: pubKey.startsWith('pk_live_') || pubKey.startsWith('pk_test_'),
    value: pubKey.startsWith('pk_live_') ? 'live ✓' : pubKey.startsWith('pk_test_') ? 'test ✓' : `Ungültig: "${pubKey.slice(0, 10)}..."`,
  }
  results.webhook_secret_present = {
    ok: webhookSecret.length > 0,
    value: webhookSecret ? `${webhookSecret.slice(0, 10)}...${webhookSecret.slice(-4)}` : '(leer)',
  }
  results.webhook_secret_format = {
    ok: webhookSecret.startsWith('whsec_'),
    value: webhookSecret.startsWith('whsec_') ? 'Format OK ✓' : `Ungültig — fängt an mit: "${webhookSecret.slice(0, 10)}"`,
  }

  // 2. Stripe API connection
  try {
    const account = await stripe.accounts.retrieve('') as { id: string; email?: string }
    results.stripe_api_connection = {
      ok: true,
      value: `Verbunden — Account: ${account.id} (${account.email || 'kein Email'})`,
    }
  } catch (err: unknown) {
    results.stripe_api_connection = {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    }
  }

  // 3. List webhook endpoints registered in Stripe
  try {
    const webhooks = await stripe.webhookEndpoints.list({ limit: 10 })
    results.webhook_endpoints = {
      ok: webhooks.data.length > 0,
      value: webhooks.data.map(w => `${w.url} (${w.status})`).join(' | '),
    }
  } catch (err: unknown) {
    results.webhook_endpoints = {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    }
  }

  // 4. Test PaymentIntent creation
  try {
    const pi = await stripe.paymentIntents.create({
      amount: 100,
      currency: 'eur',
      automatic_payment_methods: { enabled: true },
      metadata: { test: 'stripe-debug' },
    })
    await stripe.paymentIntents.cancel(pi.id)
    results.payment_intent_create = {
      ok: true,
      value: `PI erstellt & storniert: ${pi.id}`,
    }
  } catch (err: unknown) {
    results.payment_intent_create = {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    }
  }

  // 5. Webhook signature test (self-test — tautologisch: signiert und verifiziert mit demselben Secret)
  try {
    const testPayload = JSON.stringify({ test: true })
    const testHeader = stripe.webhooks.generateTestHeaderString({
      payload: testPayload,
      secret: webhookSecret,
    })
    stripe.webhooks.constructEvent(testPayload, testHeader, webhookSecret)
    results.webhook_signature_verify = {
      ok: true,
      value: `Self-test OK — ACHTUNG: prüft nur ob das Secret valide ist, nicht ob es zum app.yprint.de-Endpoint passt. Secret-Prefix: ${webhookSecret.slice(0, 12)}`,
    }
  } catch (err: unknown) {
    results.webhook_signature_verify = {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    }
  }

  // 6. Endpoint-Secret Hinweis
  results.endpoint_secret_hint = {
    ok: webhookSecret.startsWith('whsec_'),
    value: webhookSecret.startsWith('whsec_')
      ? `Secret beginnt mit whsec_ ✓ (${webhookSecret.slice(0, 12)}...) — Sicherstellen dass dieser Secret vom app.yprint.de-Endpoint stammt (Stripe Dashboard → Webhooks → app.yprint.de → Signing secret → Reveal)`
      : `Secret hat kein whsec_-Prefix — in Stripe Dashboard den richtigen Endpoint-Secret kopieren`,
  }

  const allOk = Object.values(results).every(r => r.ok)
  return NextResponse.json({ success: true, allOk, results })
}
