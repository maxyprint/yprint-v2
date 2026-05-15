// Called by designer.bundle.js after a successful save_design action.
// Generates print PNGs for ALL views server-side from the saved design_data.variationImages.
// This avoids dependency on instance.currentView (which may have changed during save).
//
// Results stored in design_pngs:
//   - Views with images  → save_type='designer', public_url = PNG URL
//   - Views without images → save_type='empty',    public_url = null
//
// Returns { success, totalGenerated, successfulUploads, failedUploads, urls, uploads }
window.generatePNGForSave = async function (designId) {
  const failed = { success: false, totalGenerated: 0, successfulUploads: 0, failedUploads: 1, urls: [], uploads: [] }

  const instance = window.designerInstance
  if (!instance) {
    console.warn('[PNG] No designer instance')
    return failed
  }

  const templateId = instance.activeTemplateId || null
  const variationId = instance.currentVariation || null

  // Collect all views for this variation from the template map
  const allViews = [] // [{ viewId, viewName }]
  try {
    const tmpl = instance.templates?.get(templateId)
    const variation = tmpl?.variations?.get(variationId)
    if (variation?.views) {
      for (const [vid, vdata] of variation.views) {
        allViews.push({ viewId: vid, viewName: vdata?.name || vid })
      }
    }
  } catch (_) {}

  // Fallback: at least process whatever keys are in variationImages
  if (allViews.length === 0 && variationId) {
    const prefix = `${variationId}_`
    try {
      for (const key of (instance.variationImages?.keys() || [])) {
        if (key.startsWith(prefix)) {
          const vid = key.slice(prefix.length)
          allViews.push({ viewId: vid, viewName: vid })
        }
      }
    } catch (_) {}
  }

  if (allViews.length === 0) {
    console.warn('[PNG] No views found for template', templateId, 'variation', variationId)
    return failed
  }

  const results = { success: false, totalGenerated: 0, successfulUploads: 0, failedUploads: 0, urls: [], uploads: [] }

  for (const { viewId, viewName } of allViews) {
    const key = variationId ? `${variationId}_${viewId}` : viewId
    const images = instance.variationImages?.get(key) || []

    if (images.length === 0) {
      // Empty view — record it so design_pngs is complete
      console.log(`[PNG] View ${viewId} is empty — recording`)
      await post('yprint_record_empty_view', { design_id: designId, template_id: templateId, view_id: viewId, view_name: viewName })
      results.uploads.push({ viewId, viewName, url: null, hasContent: false })
    } else {
      // View has images — generate server-side from saved design_data
      console.log(`[PNG] View ${viewId} has ${images.length} image(s) — generating server-side`)
      results.totalGenerated++
      const data = await post('yprint_generate_view_png', {
        design_id: designId,
        template_id: templateId,
        variation_id: variationId,
        view_id: viewId,
        view_name: viewName,
      })
      if (data?.success) {
        console.log(`[PNG] View ${viewId} uploaded:`, data.data.png_url)
        results.successfulUploads++
        results.urls.push(data.data.png_url)
        results.uploads.push({ viewId, viewName, url: data.data.png_url, hasContent: true })
      } else {
        console.error(`[PNG] View ${viewId} failed:`, data)
        results.failedUploads++
        results.uploads.push({ viewId, viewName, url: null, hasContent: true, error: data?.data })
      }
    }
  }

  results.success = results.successfulUploads > 0 || (results.totalGenerated === 0 && results.failedUploads === 0)
  console.log(`[PNG] Done — ${results.successfulUploads}/${results.totalGenerated} generated, ${results.uploads.filter(u => !u.hasContent).length} empty views recorded`)
  return results
}

async function post(action, fields) {
  try {
    const fd = new FormData()
    fd.append('action', action)
    fd.append('nonce', window.octoPrintDesigner.nonce)
    for (const [k, v] of Object.entries(fields)) {
      if (v != null) fd.append(k, v)
    }
    const res = await fetch(window.octoPrintDesigner.ajaxUrl, { method: 'POST', body: fd })
    return await res.json()
  } catch (err) {
    console.error('[PNG] post error:', action, err)
    return null
  }
}
