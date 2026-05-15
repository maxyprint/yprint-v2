// DPI quality check for uploaded images.
// Fires when the user selects a file in the upload input — before the upload completes.
// Calculates the effective print DPI if the image were to fill the entire print zone.
// (If filling the zone already falls below threshold, any smaller placement will be worse.)
;(function () {
  const CANVAS_W = 616
  const CANVAS_H = 626

  // Thresholds for T-shirt DTG / screen printing
  const DPI_GREAT  = 300   // ideal
  const DPI_OK     = 200   // acceptable
  const DPI_WARN   = 150   // noticeable at large sizes
  // below 150 = clearly pixelated

  // ── helpers ──────────────────────────────────────────────────────────────────

  function getImageDimensions(file) {
    return new Promise(function (resolve) {
      var url = URL.createObjectURL(file)
      var img = new Image()
      img.onload = function () {
        URL.revokeObjectURL(url)
        resolve({ w: img.naturalWidth, h: img.naturalHeight })
      }
      img.onerror = function () {
        URL.revokeObjectURL(url)
        resolve({ w: 0, h: 0 })
      }
      img.src = url
    })
  }

  // Returns { widthCm, heightCm } of the current view's print zone, or null.
  function getPrintZonePhysical() {
    var instance = window.designerInstance
    if (!instance) return null

    var templateId  = instance.activeTemplateId
    var variationId = instance.currentVariation
    var viewId      = instance.currentView

    var tmpl = instance.templates && instance.templates.get(templateId)
    if (!tmpl) return null

    var physW = tmpl.physical_width_cm
    var physH = tmpl.physical_height_cm
    if (!physW || !physH) return null

    var variation = tmpl.variations && tmpl.variations.get(variationId)
    var view      = variation && variation.views && variation.views.get(viewId)
    var sz        = view && view.safeZone
    if (!sz || !sz.width || !sz.height) return null

    return {
      widthCm:  (sz.width  / CANVAS_W) * physW,
      heightCm: (sz.height / CANVAS_H) * physH,
    }
  }

  // Effective DPI if the image were sized to fill the print zone exactly.
  function calcDPI(imgW, imgH, zoneCm) {
    var dpiX = imgW / (zoneCm.widthCm  / 2.54)
    var dpiY = imgH / (zoneCm.heightCm / 2.54)
    return Math.min(dpiX, dpiY)
  }

  // Max size (cm) the image can be printed at the given minimum DPI.
  function maxPrintSize(imgW, imgH, minDPI) {
    return {
      w: (imgW / minDPI) * 2.54,
      h: (imgH / minDPI) * 2.54,
    }
  }

  // ── UI ───────────────────────────────────────────────────────────────────────

  function removeWarning() {
    var el = document.getElementById('yprint-dpi-warning')
    if (el) el.remove()
  }

  function showWarning(dpi, imgW, imgH) {
    removeWarning()

    var bg, emoji, headline, sub
    var max = maxPrintSize(imgW, imgH, DPI_OK)

    if (dpi >= DPI_GREAT) {
      return // silent — great quality
    } else if (dpi >= DPI_OK) {
      bg = '#f59e0b'
      emoji = '⚠️'
      headline = 'Bildqualität ausreichend (' + Math.round(dpi) + ' DPI)'
      sub = 'Für beste Druckergebnisse empfehlen wir min. 300 DPI. ' +
            'Bei voller Druckzonengröße kann das Bild leicht unscharf wirken.'
    } else if (dpi >= DPI_WARN) {
      bg = '#ef4444'
      emoji = '⚠️'
      headline = 'Niedrige Auflösung (' + Math.round(dpi) + ' DPI)'
      sub = 'Das Bild kann im Druck pixelig wirken. ' +
            'Empfohlene max. Druckgröße: ' +
            max.w.toFixed(1) + ' × ' + max.h.toFixed(1) + ' cm.'
    } else {
      bg = '#b91c1c'
      emoji = '🚨'
      headline = 'Sehr niedrige Auflösung (' + Math.round(dpi) + ' DPI)'
      sub = 'Das Bild wird im Druck stark pixelig erscheinen. ' +
            'Bitte eine Datei mit höherer Auflösung verwenden. ' +
            'Empfohlene max. Druckgröße: ' +
            max.w.toFixed(1) + ' × ' + max.h.toFixed(1) + ' cm.'
    }

    var el = document.createElement('div')
    el.id = 'yprint-dpi-warning'
    el.style.cssText = [
      'position:fixed',
      'bottom:90px',
      'left:50%',
      'transform:translateX(-50%)',
      'background:' + bg,
      'color:#fff',
      'padding:14px 20px',
      'border-radius:10px',
      'font-size:13px',
      'font-family:sans-serif',
      'max-width:380px',
      'width:calc(100% - 40px)',
      'text-align:center',
      'z-index:999999',
      'box-shadow:0 4px 20px rgba(0,0,0,0.35)',
      'line-height:1.45',
      'cursor:pointer',
    ].join(';')

    el.innerHTML =
      '<div style="font-weight:700;margin-bottom:5px">' + emoji + ' ' + headline + '</div>' +
      '<div style="opacity:.92">' + sub + '</div>' +
      '<div style="margin-top:8px;font-size:11px;opacity:.75">Zum Schließen tippen</div>'

    el.addEventListener('click', removeWarning)
    document.body.appendChild(el)

    // Auto-dismiss after 10 s
    setTimeout(removeWarning, 10000)
  }

  // ── attach ────────────────────────────────────────────────────────────────────

  function tryAttach() {
    var input = document.getElementById('uploadInput')
    if (!input || input._dpiCheckerAttached) return false

    input._dpiCheckerAttached = true
    input.addEventListener('change', function (e) {
      var file = e.target && e.target.files && e.target.files[0]
      if (!file || !file.type.startsWith('image/')) return

      getImageDimensions(file).then(function (dim) {
        if (!dim.w || !dim.h) return
        var zone = getPrintZonePhysical()
        if (!zone) return
        var dpi = calcDPI(dim.w, dim.h, zone)
        showWarning(dpi, dim.w, dim.h)
      })
    })
    return true
  }

  // Retry until the upload input exists in the DOM
  var attempts = 0
  var iv = setInterval(function () {
    if (tryAttach() || ++attempts > 40) clearInterval(iv)
  }, 300)
})()
