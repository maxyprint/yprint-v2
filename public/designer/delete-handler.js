;(function () {
  function attachDeleteKey(inst) {
    var canvas = inst.fabricCanvas
    if (!canvas) return

    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Delete' && e.key !== 'Backspace') return
      var tag = document.activeElement ? document.activeElement.tagName : ''
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return

      var obj = canvas.getActiveObject()
      if (!obj) return
      canvas.remove(obj)
      canvas.discardActiveObject()
      canvas.renderAll()
    })
  }

  // The bundle dispatches 'designerReady' after creating window.designerInstance
  window.addEventListener('designerReady', function (e) {
    var inst = (e.detail && e.detail.instance) || window.designerInstance
    if (inst) attachDeleteKey(inst)
  })

  // Fallback poll in case the event already fired before this script loaded
  var attempts = 0
  function poll() {
    if (attempts++ > 60) return
    if (window.designerInstance && window.designerInstance.fabricCanvas) {
      attachDeleteKey(window.designerInstance)
    } else {
      setTimeout(poll, 500)
    }
  }
  poll()
})()
