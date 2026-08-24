import VueViewer from 'v-viewer'
import 'viewerjs/dist/viewer.css'

export default defineNuxtPlugin((nuxtApp) => {
  // Prevent clicks inside Viewer.js from closing parent modals (e.g. Radix Dialog / UModal)
  if (import.meta.client) {
    const stopViewerPropagation = (e: Event) => {
      const target = e.target as HTMLElement | null
      if (target?.closest('.viewer-container') || target?.classList.contains('viewer-container')) {
        e.stopPropagation()
      }
    }

    window.addEventListener('pointerdown', stopViewerPropagation, true)
    window.addEventListener('click', stopViewerPropagation, true)
    window.addEventListener('mousedown', stopViewerPropagation, true)
  }

  nuxtApp.vueApp.use(VueViewer, {
    defaultOptions: {
      toolbar: false,
      navbar: false,
      title: false,
      button: true,
      movable: true,
      zoomable: true,
      rotatable: true,
      scalable: true,
      transition: true,
      fullscreen: true,
      keyboard: true,
      backdrop: true
    }
  })
})
