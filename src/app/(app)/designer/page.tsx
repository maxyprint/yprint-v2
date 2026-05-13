'use client'

import { useEffect, useState } from 'react'
import Script from 'next/script'
import { useAuthStore } from '@/store/auth'

declare global {
  interface Window {
    octoPrintDesigner: {
      ajaxUrl: string
      nonce: string
      isLoggedIn: boolean
      userId: string
      uploadsUrl: string
      pluginUrl: string
      siteUrl: string
    }
  }
}

export default function DesignerPage() {
  const { user, accessToken } = useAuthStore()
  const [vendorReady, setVendorReady] = useState(false)
  const [configSet, setConfigSet] = useState(false)

  // Set config as soon as token is available, before designer bundle loads
  useEffect(() => {
    if (!accessToken || configSet) return
    window.octoPrintDesigner = {
      ajaxUrl: '/api',
      nonce: accessToken,
      isLoggedIn: !!user,
      userId: user?.id || '',
      uploadsUrl: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/`,
      pluginUrl: '/designer/',
      siteUrl: process.env.NEXT_PUBLIC_APP_URL || window.location.origin,
    }
    setConfigSet(true)
  }, [accessToken, user, configSet])

  return (
    <>
      {/* Load vendor+common first; designer bundle only after config is set */}
      <Script
        src="/designer/vendor.bundle.js"
        strategy="afterInteractive"
        onReady={() => setVendorReady(true)}
      />
      {vendorReady && (
        <Script src="/designer/common.bundle.js" strategy="afterInteractive" />
      )}
      {vendorReady && configSet && (
        <Script src="/designer/designer.bundle.js" strategy="afterInteractive" />
      )}

      <div
        id="octo-print-designer"
        className="w-full"
        style={{ minHeight: 'calc(100vh - 56px)' }}
      />
    </>
  )
}
