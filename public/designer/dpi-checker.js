// DPI quality check for uploaded images.
// Shows a card notification on file-select and a brief pill when image lands on canvas.
;(function () {
  const CANVAS_W = 616
  const CANVAS_H = 626
  const DPI_GREAT = 300
  const DPI_OK    = 200
  const DPI_WARN  = 150

  var lastResult   = null
  var lastUploadAt = 0
  var dismissTimer = null

  // ── helpers ──────────────────────────────────────────────────────────────────

  function getImageDimensions(file) {
    return new Promise(function (resolve) {
      var url = URL.createObjectURL(file)
      var img = new Image()
      img.onload  = function () { URL.revokeObjectURL(url); resolve({ w: img.naturalWidth,  h: img.naturalHeight  }) }
      img.onerror = function () { URL.revokeObjectURL(url); resolve({ w: 0, h: 0 }) }
      img.src = url
    })
  }

  function getPrintZonePhysical() {
    var instance = window.designerInstance
    if (!instance) return null
    var tmpl = instance.templates && instance.templates.get(instance.activeTemplateId)
    if (!tmpl || !tmpl.physical_width_cm || !tmpl.physical_height_cm) return null
    var variation = tmpl.variations && tmpl.variations.get(instance.currentVariation)
    var view      = variation && variation.views && variation.views.get(instance.currentView)
    var sz        = view && view.safeZone
    if (!sz || !sz.width || !sz.height) return null
    return {
      widthCm:  (sz.width  / CANVAS_W) * tmpl.physical_width_cm,
      heightCm: (sz.height / CANVAS_H) * tmpl.physical_height_cm,
    }
  }

  function calcDPI(imgW, imgH, zone) {
    return Math.min(imgW / (zone.widthCm / 2.54), imgH / (zone.heightCm / 2.54))
  }

  function maxPrintCm(imgW, imgH) {
    return { w: (imgW / DPI_OK) * 2.54, h: (imgH / DPI_OK) * 2.54 }
  }

  // ── UI ───────────────────────────────────────────────────────────────────────

  function removeCard() {
    clearTimeout(dismissTimer)
    var el = document.getElementById('yprint-dpi-card')
    if (!el) return
    el.style.opacity = '0'
    el.style.transform = 'translateX(-50%) translateY(6px)'
    setTimeout(function () { if (el.parentNode) el.remove() }, 220)
  }

  function removePill() {
    var el = document.getElementById('yprint-dpi-pill')
    if (!el) return
    el.style.opacity = '0'
    setTimeout(function () { if (el.parentNode) el.remove() }, 200)
  }

  // Full card — shown on file select
  function showCard(dpi, imgW, imgH) {
    removeCard()
    removePill()
    if (dpi >= DPI_GREAT) return

    var dotColor, quality, detail
    var max = maxPrintCm(imgW, imgH)

    if (dpi >= DPI_OK) {
      dotColor = '#f59e0b'
      quality  = 'Ausreichend (' + Math.round(dpi) + ' DPI)'
      detail   = 'Für optimale Druckqualität min. 300 DPI empfohlen.'
    } else if (dpi >= DPI_WARN) {
      dotColor = '#ef4444'
      quality  = 'Niedrig (' + Math.round(dpi) + ' DPI)'
      detail   = 'Empf. max. Druckgröße: ' + max.w.toFixed(1) + ' × ' + max.h.toFixed(1) + ' cm'
    } else {
      dotColor = '#b91c1c'
      quality  = 'Sehr niedrig (' + Math.round(dpi) + ' DPI)'
      detail   = 'Bild wirkt im Druck pixelig – max. ' + max.w.toFixed(1) + ' × ' + max.h.toFixed(1) + ' cm'
    }

    var el = document.createElement('div')
    el.id = 'yprint-dpi-card'
    el.style.cssText = [
      'position:fixed',
      'bottom:80px',
      'left:50%',
      'transform:translateX(-50%) translateY(6px)',
      'background:rgba(15,15,15,0.86)',
      'backdrop-filter:blur(14px)',
      '-webkit-backdrop-filter:blur(14px)',
      'color:#fff',
      'padding:11px 16px 11px 13px',
      'border-radius:13px',
      'font-size:12.5px',
      'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',
      'max-width:340px',
      'width:calc(100% - 48px)',
      'z-index:999999',
      'box-shadow:0 4px 24px rgba(0,0,0,0.3),0 0 0 1px rgba(255,255,255,0.07)',
      'cursor:pointer',
      'opacity:0',
      'transition:opacity 0.2s ease,transform 0.22s ease',
      'display:flex',
      'flex-direction:column',
      'gap:4px',
    ].join(';')

    el.innerHTML =
      '<div style="display:flex;align-items:center;gap:8px">' +
        '<span style="width:8px;height:8px;border-radius:50%;background:' + dotColor + ';flex-shrink:0;margin-top:1px"></span>' +
        '<span style="font-weight:600;line-height:1.3">Bildqualität: ' + quality + '</span>' +
        '<span style="margin-left:auto;opacity:0.35;font-size:14px;padding-left:8px">✕</span>' +
      '</div>' +
      '<div style="padding-left:16px;opacity:0.65;font-size:11.5px;line-height:1.4">' + detail + '</div>'

    el.addEventListener('click', removeCard)
    document.body.appendChild(el)

    requestAnimationFrame(function () {
      el.style.opacity = '1'
      el.style.transform = 'translateX(-50%) translateY(0)'
    })

    dismissTimer = setTimeout(removeCard, 8000)
  }

  // Small pill — shown when the image actually lands on the canvas
  function showPill(dpi) {
    removePill()
    if (dpi >= DPI_GREAT) return

    var dotColor = dpi >= DPI_OK ? '#f59e0b' : (dpi >= DPI_WARN ? '#ef4444' : '#b91c1c')
    var label    = dpi >= DPI_OK ? 'Ausreichend' : (dpi >= DPI_WARN ? 'Niedrige Auflösung' : 'Sehr niedrige Auflösung')

    var el = document.createElement('div')
    el.id = 'yprint-dpi-pill'
    el.style.cssText = [
      'position:fixed',
      'bottom:80px',
      'left:50%',
      'transform:translateX(-50%)',
      'background:rgba(15,15,15,0.80)',
      'backdrop-filter:blur(10px)',
      '-webkit-backdrop-filter:blur(10px)',
      'color:#fff',
      'padding:6px 13px',
      'border-radius:999px',
      'font-size:11.5px',
      'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',
      'white-space:nowrap',
      'z-index:999999',
      'box-shadow:0 2px 12px rgba(0,0,0,0.25),0 0 0 1px rgba(255,255,255,0.07)',
      'display:flex',
      'align-items:center',
      'gap:7px',
      'opacity:1',
      'transition:opacity 0.2s ease',
      'pointer-events:none',
    ].join(';')

    el.innerHTML =
      '<span style="width:6px;height:6px;border-radius:50%;background:' + dotColor + ';flex-shrink:0"></span>' +
      '<span style="opacity:0.7">Auflösung:</span>' +
      '<span style="font-weight:600">' + Math.round(dpi) + ' DPI – ' + label + '</span>'

    document.body.appendChild(el)
    setTimeout(function () { removePill() }, 4000)
  }

  // ── attach upload input ───────────────────────────────────────────────────────

  var inputAttached  = false
  var canvasAttached = false

  function tryAttachInput() {
    var input = document.getElementById('uploadInput')
    if (!input) return false
    input.addEventListener('change', function (e) {
      var file = e.target && e.target.files && e.target.files[0]
      if (!file || !file.type.startsWith('image/')) return
      getImageDimensions(file).then(function (dim) {
        if (!dim.w || !dim.h) return
        var zone = getPrintZonePhysical()
        if (!zone) return
        var dpi = calcDPI(dim.w, dim.h, zone)
        lastResult   = { dpi: dpi, w: dim.w, h: dim.h }
        lastUploadAt = Date.now()
        showCard(dpi, dim.w, dim.h)
      })
    })
    return true
  }

  // ── attach Fabric canvas object:added ─────────────────────────────────────────

  function tryAttachCanvas() {
    var instance = window.designerInstance
    var canvas   = instance && instance.canvas
    if (!canvas) return false
    canvas.on('object:added', function (e) {
      // Only react within 10 s of the last file-select event
      if (!lastResult || Date.now() - lastUploadAt > 10000) return
      var obj = e.target
      if (!obj || obj.type !== 'image') return
      removeCard()
      showPill(lastResult.dpi)
      lastResult = null
    })
    return true
  }

  // Retry until both are attached
  var attempts = 0
  var iv = setInterval(function () {
    if (!inputAttached)  inputAttached  = tryAttachInput()
    if (!canvasAttached) canvasAttached = tryAttachCanvas()
    if ((inputAttached && canvasAttached) || ++attempts > 60) clearInterval(iv)
  }, 300)
})()
