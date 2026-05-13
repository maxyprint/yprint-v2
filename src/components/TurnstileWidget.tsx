'use client'

import { useEffect, useRef } from 'react'

interface TurnstileWidgetProps {
  onVerify: (token: string) => void
  onExpire?: () => void
}

declare global {
  interface Window {
    turnstile: {
      render: (container: string | HTMLElement, options: object) => string
      reset: (widgetId: string) => void
    }
    onTurnstileLoad?: () => void
  }
}

export default function TurnstileWidget({ onVerify, onExpire }: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | null>(null)

  useEffect(() => {
    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

    // No key configured → auto-verify silently, widget invisible
    if (!siteKey) {
      onVerify('turnstile-disabled')
      return
    }

    if (!containerRef.current) return

    const renderWidget = () => {
      if (!containerRef.current || widgetIdRef.current) return
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        callback: onVerify,
        'expired-callback': onExpire,
        theme: 'light',
      })
    }

    if (window.turnstile) {
      renderWidget()
    } else {
      window.onTurnstileLoad = renderWidget
      const script = document.createElement('script')
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad'
      script.async = true
      script.defer = true
      document.head.appendChild(script)
    }

    return () => { widgetIdRef.current = null }
  }, [onVerify, onExpire])

  // Hidden when no key configured
  if (!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY) return null

  return <div ref={containerRef} />
}
