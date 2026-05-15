'use client'

import { useEffect, useState, Suspense } from 'react'
import Script from 'next/script'
import { useSearchParams } from 'next/navigation'
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

function DesignerInner() {
  const searchParams = useSearchParams()
  // design_id → load existing design; template_id → open specific template
  const urlDesignId = searchParams.get('design_id') || searchParams.get('design') || ''
  const urlTemplateId = searchParams.get('template_id') || ''

  const { user, accessToken } = useAuthStore()
  const [fabricReady, setFabricReady] = useState(false)
  const [configSet, setConfigSet] = useState(false)
  const [defaultTemplateId, setDefaultTemplateId] = useState(urlTemplateId)

  // Set window config once we have the access token
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

  // If no template_id in URL, fetch templates and use the first one as default
  useEffect(() => {
    if (urlTemplateId || urlDesignId || defaultTemplateId) return
    fetch('/api', { method: 'POST', body: (() => { const f = new FormData(); f.append('action', 'get_templates'); return f })() })
      .then(r => r.json())
      .then(data => {
        if (data.success && data.data) {
          const firstId = Object.keys(data.data)[0]
          if (firstId) setDefaultTemplateId(firstId)
        }
      })
      .catch(() => {})
  }, [urlTemplateId, urlDesignId, defaultTemplateId])

  // React doesn't populate <template>.content — inject them via DOM so the bundle's
  // template.content.cloneNode() works correctly.
  useEffect(() => {
    const defs: { id: string; html: string }[] = [
      {
        id: 'octo-print-designer-view-button-template',
        html: '<button class="designer-view-button">View Name</button>',
      },
      {
        id: 'octo-print-designer-library-image-template',
        html: `<div class="library-image-item">
          <img class="image-preview" src="" alt="" />
          <button><img src="/designer/img/close.svg" alt="Close Icon" /></button>
        </div>`,
      },
      {
        id: 'octo-print-designer-library-item-template',
        html: `<div class="library-item">
          <img class="image-preview" src="" alt="" />
          <span>Template Name</span>
        </div>`,
      },
      {
        id: 'designer-image-toolbar-template',
        html: `<div class="designer-image-toolbar">
          <button type="button" class="toolbar-btn center-image" title="Center Image">
            <img src="/designer/img/center.svg" alt="Center" />
          </button>
          <div class="toolbar-dimension">
            <input type="number" class="width-input" title="Width in pixels" placeholder="W" />
            <span>×</span>
            <input type="number" class="height-input" title="Height in pixels" placeholder="H" />
            <span class="pixel-to-cm"></span>
          </div>
        </div>`,
      },
    ]
    defs.forEach(({ id, html }) => {
      document.getElementById(id)?.remove()
      const tmpl = document.createElement('template')
      tmpl.id = id
      tmpl.innerHTML = html
      document.body.appendChild(tmpl)
    })
  }, [])

  const readyToLoad = configSet && (urlDesignId || defaultTemplateId)

  return (
    <>
      {/* Designer CSS */}
      <link rel="stylesheet" href="/designer/css/octo-print-designer-designer.css" />
      <link rel="stylesheet" href="/designer/css/octo-print-designer-toast.css" />

      {/*
        Full designer HTML — bundle does querySelector('.octo-print-designer') on init.
        data-default-template-id tells the bundle which template to auto-load.
      */}
      <main
        className="octo-print-designer"
        data-default-template-id={defaultTemplateId}
        style={{ minHeight: 'calc(100vh - 64px)' }}
      >
        <aside>
          <nav className="designer-nav">
            <ul>
              <li className="designer-nav-item active" data-type="upload">
                <img src="/designer/img/upload.svg" alt="Upload Icon" />Library
              </li>
              <li className="designer-nav-item" data-type="library">
                <img src="/designer/img/library.svg" alt="Library Icon" />Change Product
              </li>
              <li className="designer-nav-item" data-type="fiverr">
                <img src="/designer/img/fiverr.svg" alt="Fiverr Upload Icon" />Fiverr
              </li>
            </ul>
            <img className="designer-nav-logo" src="/designer/img/y-icon.svg" alt="YDesign Logo" />
          </nav>

          <div className="designer-item-sections">
            <div className="designer-item-section-content" data-section="upload">
              <div className="upload-zone" id="uploadZone">
                <div className="upload-zone-content">
                  <img src="/designer/img/upload.svg" alt="Upload Icon" />
                  <div className="upload-zone-text">Drop your image here or click to upload</div>
                  <div className="upload-zone-subtext">Supported formats: PNG, JPG – Max size: 5MB</div>
                </div>
                <input type="file" id="uploadInput" className="upload-input" accept=".jpg,.jpeg,.png" />
              </div>
              <div className="images-grid-limit">0/<b>25</b></div>
              <div className="images-grid" />
            </div>

            <div className="designer-item-section-content hidden" data-section="library">
              <div className="images-grid" />
            </div>
          </div>
        </aside>

        <section className="designer-editor">
          <div className="designer-canvas-container">
            <canvas id="octo-print-designer-canvas" />
            <div className="views-toolbar" />
            <aside className="designer-toolbar">
              <button className="toolbar-btn" id="toggle-print-zone">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <g>
                    <path d="M0 0h24v24H0z" fill="none" />
                    <path d="M4 3h16a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm1 2v14h14V5H5zm4 2h3.5a3.5 3.5 0 0 1 0 7H11v3H9V7zm2 2v3h1.5a1.5 1.5 0 0 0 0-3H11z" />
                  </g>
                </svg>
              </button>
            </aside>
          </div>

          <footer>
            <div className="zoom-controls">
              <button data-zoom-type="out">-</button>
              <input type="number" defaultValue={100} min={10} max={200} step={10} />
              <button data-zoom-type="in">+</button>
            </div>
            <div className="variations-toolbar">
              <div className="variations-list" />
            </div>
            <div className="zoom-level-popup hidden">
              <input type="range" defaultValue={100} min={10} max={200} step={10} />
            </div>
            <button className="designer-action-button">Save product</button>
          </footer>
        </section>

        {/* Login Required Modal */}
        <div className="designer-modal hidden" id="loginRequiredModal">
          <div className="designer-modal-overlay" />
          <div className="designer-modal-content">
            <div className="designer-modal-header"><h3>Login Required</h3></div>
            <div className="designer-modal-body"><p>Please log in to save your product.</p></div>
            <div className="designer-modal-footer">
              <a href="/login" className="designer-action-button designer-modal-save">Go to Login</a>
            </div>
          </div>
        </div>

        {/* Save Design Modal */}
        <div className="designer-modal hidden" id="saveDesignModal">
          <div className="designer-modal-overlay" />
          <div className="designer-modal-content">
            <div className="designer-modal-header">
              <h3>Save Design</h3>
              <button type="button" className="designer-modal-close">
                <img src="/designer/img/close.svg" alt="Close Modal" />
              </button>
            </div>
            <div className="designer-modal-body">
              <div className="form-group">
                <label htmlFor="designName">Design Name</label>
                <input type="text" id="designName" name="design_name" required placeholder="Enter a name for your design" />
              </div>
              <input type="hidden" id="designId" name="design_id" defaultValue={urlDesignId} />
            </div>
            <div className="designer-modal-footer">
              <button type="button" className="designer-action-button designer-modal-cancel">Cancel</button>
              <button type="button" className="designer-action-button designer-modal-save">Save Design</button>
            </div>
          </div>
        </div>

        <div className="toast-container" />
      </main>

      {/* Load Fabric.js 5.3.0 globally (designer.bundle.js expects window.fabric) */}
      <Script
        src="/designer/fabric-5.3.0.min.js"
        strategy="afterInteractive"
        onReady={() => {
          window.dispatchEvent(new CustomEvent('fabricGlobalReady', { detail: { source: 'cdn', version: '5.3.0' } }))
          setFabricReady(true)
        }}
      />
      {fabricReady && readyToLoad && (
        <>
          <Script src="/designer/print-zone-png-generator.js" strategy="afterInteractive" />
          <Script src="/designer/generate-png-for-save.js" strategy="afterInteractive" />
          <Script src="/designer/designer.bundle.js" strategy="afterInteractive" />
          <Script src="/designer/dpi-checker.js" strategy="afterInteractive" />
        </>
      )}
    </>
  )
}

export default function DesignerPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: 'calc(100vh - 64px)', background: '#f3f4f6' }} />}>
      <DesignerInner />
    </Suspense>
  )
}
