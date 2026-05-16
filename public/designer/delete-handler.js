;(function () {
  var attempts = 0
  function init() {
    if (attempts++ > 120) return
    var inst = window.designerInstance
    if (!inst || !inst.canvas) { setTimeout(init, 300); return }

    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Delete' && e.key !== 'Backspace') return
      var tag = document.activeElement ? document.activeElement.tagName : ''
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return

      var canvas = inst.canvas
      var obj = canvas.getActiveObject()
      if (!obj) return
      canvas.remove(obj)
      canvas.discardActiveObject()
      canvas.renderAll()
    })
  }
  // Wait a bit for designerInstance to be set by the bundle
  setTimeout(init, 1000)
})()
