import VueViewer from 'v-viewer'
import 'viewerjs/dist/viewer.css'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(VueViewer, {
    defaultOptions: {
      inline: false,
      button: true,
      navbar: false,
      title: false,
      toolbar: true,
      tooltip: true,
      movable: true,
      zoomable: true,
      rotatable: true,
      scalable: true,
      transition: true,
      fullscreen: true,
      keyboard: true,
      zoomOnWheel: true,
      zoomOnTouch: true,
      toggleOnDblclick: true,
      backdrop: true
    }
  })
})
