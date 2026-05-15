// Called by designer.bundle.js after a successful save_design action.
// Generates print PNGs for ALL views of the current variation:
//   - Active view: generated from live Fabric canvas (most accurate)
//   - Other views with images: generated server-side from saved design_data
//   - Empty views: recorded as save_type='empty' in design_pngs
// Returns { success, totalGenerated, successfulUploads, failedUploads, urls, uploads }
window.generatePNGForSave = async function (designId) {
  const failed = { success: false, totalGenerated: 0, successfulUploads: 0, failedUploads: 1, urls: [], uploads: [] }

  const instance = window.designerInstance
  if (!instance || !instance.fabricCanvas) {
    console.warn('[PNG] No designer instance or fabricCanvas')
    return failed
  }

  if (typeof PrintZonePNGGenerator === 'undefined') {
    console.warn('[PNG] PrintZonePNGGenerator not loaded')
    return failed
  }

  const templateId = instance.activeTemplateId || null
  const variationId = instance.currentVariation || null
  const activeViewId = instance.currentView || 'view_front'

  // Collect all view IDs: from template structure + from variationImages keys
  const allViewIds = new Set()
  const viewNames = {}

  try {
    const tmpl = instance.templates?.get(templateId)
    const variation = tmpl?.variations?.get(variationId)
    if (variation?.views) {
      for (const [vid, vdata] of variation.views) {
        allViewIds.add(vid)
        viewNames[vid] = vdata?.name || vid
      }
    }
  } catch (_) {}

  // Also cover any view keys already in variationImages (catches views not in template map)
  const prefix = variationId ? `${variationId}_` : null
  try {
    if (prefix && instance.variationImages) {
      for (const key of instance.variationImages.keys()) {
        if (key.startsWith(prefix)) {
          const vid = key.slice(prefix.length)
          allViewIds.add(vid)
          if (!viewNames[vid]) viewNames[vid] = vid
        }
      }
    }
  } catch (_) {}

  // Fallback: if no views discovered, just process the active view
  if (allViewIds.size === 0) allViewIds.add(activeViewId)

  const results = { success: false, totalGenerated: 0, successfulUploads: 0, failedUploads: 0, urls: [], uploads: [] }

  for (const viewId of allViewIds) {
    const viewName = viewNames[viewId] || viewId

    if (viewId === activeViewId) {
      // ── Active view: generate from live Fabric canvas ──────────────────────
      const generator = new PrintZonePNGGenerator()
      const pngInfo = generator.generatePrintZonePNG(instance.fabricCanvas)

      if (!pngInfo) {
        console.log(`[PNG] Active view ${viewId} is empty (no print zone content)`)
        await postAction('yprint_record_empty_view', designId, templateId, { view_id: viewId, view_name: viewName })
        results.uploads.push({ viewId, viewName, url: null, hasContent: false })
        continue
      }

      const printAreaPx = {
        left: pngInfo.printZone.left,
        top: pngInfo.printZone.top,
        width: pngInfo.printZone.width,
        height: pngInfo.printZone.height,
      }
      const printAreaMm = {
        width: pngInfo.sizeInches.width * 25.4,
        height: pngInfo.sizeInches.height * 25.4,
      }

      const formData = new FormData()
      formData.append('action', 'yprint_save_design_print_png')
      formData.append('nonce', window.octoPrintDesigner.nonce)
      formData.append('design_id', designId)
      formData.append('view_id', viewId)
      formData.append('view_name', viewName)
      if (templateId) formData.append('template_id', templateId)
      formData.append('print_png', pngInfo.dataURL)
      formData.append('print_area_px', JSON.stringify(printAreaPx))
      formData.append('print_area_mm', JSON.stringify(printAreaMm))

      try {
        const res = await fetch(window.octoPrintDesigner.ajaxUrl, { method: 'POST', body: formData })
        const data = await res.json()
        results.totalGenerated++
        if (data.success) {
          console.log(`[PNG] Active view ${viewId} uploaded:`, data.data.png_url)
          results.successfulUploads++
          results.urls.push(data.data.png_url)
          results.uploads.push({ viewId, viewName, url: data.data.png_url, hasContent: true })
        } else {
          console.error(`[PNG] Active view ${viewId} upload failed:`, data)
          results.failedUploads++
        }
      } catch (err) {
        console.error(`[PNG] Active view ${viewId} error:`, err)
        results.failedUploads++
      }

    } else {
      // ── Non-active view: check variationImages, generate server-side ────────
      const key = variationId ? `${variationId}_${viewId}` : viewId
      const images = instance.variationImages?.get(key) || []

      if (images.length === 0) {
        console.log(`[PNG] View ${viewId} is empty`)
        await postAction('yprint_record_empty_view', designId, templateId, { view_id: viewId, view_name: viewName })
        results.uploads.push({ viewId, viewName, url: null, hasContent: false })
      } else {
        console.log(`[PNG] View ${viewId} has ${images.length} image(s) — generating server-side`)
        results.totalGenerated++
        try {
          const fd = new FormData()
          fd.append('action', 'yprint_generate_view_png')
          fd.append('nonce', window.octoPrintDesigner.nonce)
          fd.append('design_id', designId)
          fd.append('view_id', viewId)
          fd.append('view_name', viewName)
          if (templateId) fd.append('template_id', templateId)
          if (variationId) fd.append('variation_id', variationId)

          const res = await fetch(window.octoPrintDesigner.ajaxUrl, { method: 'POST', body: fd })
          const data = await res.json()
          if (data.success) {
            console.log(`[PNG] View ${viewId} server-generated:`, data.data.png_url)
            results.successfulUploads++
            results.urls.push(data.data.png_url)
            results.uploads.push({ viewId, viewName, url: data.data.png_url, hasContent: true })
          } else {
            console.error(`[PNG] View ${viewId} server generation failed:`, data)
            results.failedUploads++
            results.uploads.push({ viewId, viewName, url: null, hasContent: true, error: data.data })
          }
        } catch (err) {
          console.error(`[PNG] View ${viewId} server error:`, err)
          results.failedUploads++
        }
      }
    }
  }

  results.success = results.successfulUploads > 0 || results.failedUploads === 0
  console.log(`[PNG] Done: ${results.successfulUploads}/${results.totalGenerated} views generated`)
  return results
}

async function postAction(action, designId, templateId, extra = {}) {
  try {
    const fd = new FormData()
    fd.append('action', action)
    fd.append('nonce', window.octoPrintDesigner.nonce)
    fd.append('design_id', designId)
    if (templateId) fd.append('template_id', templateId)
    for (const [k, v] of Object.entries(extra)) fd.append(k, v)
    await fetch(window.octoPrintDesigner.ajaxUrl, { method: 'POST', body: fd })
  } catch (_) {}
}
