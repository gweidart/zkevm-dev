// Client-side plugin to initialize custom cursor
import { defineNuxtPlugin } from '#app'

// The `.client.ts` suffix ensures this only runs client-side.
export default defineNuxtPlugin(nuxtApp => {
  // Wait for app to be mounted
  nuxtApp.hook('app:mounted', () => {
    // Check if it's a device with mouse pointer (not touch-only)
    const hasPointer = window.matchMedia('(pointer: fine)').matches

    if (hasPointer) {
      // Add the custom cursor class to the body, enabling styles
      document.body.classList.add('custom-cursor-active')
    }
  })
})
