// Called by designer.bundle.js after a successful save_design action.
// Must return { success, totalGenerated, successfulUploads, failedUploads, urls, uploads }
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

  const generator = new PrintZonePNGGenerator()
  const pngInfo = generator.generatePrintZonePNG(instance.fabricCanvas)
  if (!pngInfo) {
    console.warn('[PNG] No print zone found on canvas')
    return failed
  }

  // Resolve view name from template map
  const templateId = instance.activeTemplateId || null
  const viewId = instance.currentView || 'front'
  let viewName = 'Front'
  try {
    const template = instance.templates.get(templateId)
    const variation = template?.variations.get(instance.currentVariation)
    const view = variation?.views.get(viewId)
    if (view?.name) viewName = view.name
  } catch (_) {}

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

    if (data.success) {
      console.log('[PNG] Uploaded:', data.data.png_url)
      return {
        success: true,
        totalGenerated: 1,
        successfulUploads: 1,
        failedUploads: 0,
        urls: [data.data.png_url],
        uploads: [data.data],
      }
    } else {
      console.error('[PNG] Upload failed:', data)
      return { ...failed, totalGenerated: 1 }
    }
  } catch (err) {
    console.error('[PNG] Upload error:', err)
    return { ...failed, totalGenerated: 1 }
  }
}
