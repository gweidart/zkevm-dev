/**
 * Performance Monitoring Plugin
 *
 * This plugin runs only on the client side (due to .client.ts suffix)
 * and tracks performance metrics to help optimize the application.
 */
import { defineNuxtPlugin } from '#app'

export default defineNuxtPlugin(() => {
  // Listen for page load
  window.addEventListener('load', () => {
    setTimeout(() => {
      try {
        if (window.performance && 'getEntriesByType' in window.performance) {
          const navEntries = performance.getEntriesByType('navigation')

          if (navEntries && navEntries.length > 0) {
            const timing = navEntries[0] as PerformanceNavigationTiming

            // Log basic performance metrics
            console.log('Page load performance:', {
              'DNS lookup': `${timing.domainLookupEnd - timing.domainLookupStart}ms`,
              'Connection time': `${timing.connectEnd - timing.connectStart}ms`,
              'First byte': `${timing.responseStart - timing.requestStart}ms`,
              'DOM loaded': `${timing.domContentLoadedEventEnd - timing.domContentLoadedEventStart}ms`,
              'Total time': `${timing.loadEventEnd - timing.startTime}ms`,
            })

            // Report to analytics if performance is poor
            const totalTime = timing.loadEventEnd - timing.startTime
            if (totalTime > 3000) {
              console.warn('Page load performance is poor. Consider optimizations.')
            }
          }
        }
      } catch (error) {
        console.warn('Performance measurement error:', error)
      }
    }, 0)
  })

  // Track First Input Delay (FID) - An important Core Web Vital
  let firstInputDelay = -1
  const onFirstInput = (event: PerformanceEventTiming) => {
    if (firstInputDelay < 0) {
      firstInputDelay = event.processingStart - event.startTime
      console.log(`First Input Delay: ${firstInputDelay.toFixed(1)}ms`)

      // Report poor FID (>100ms is considered poor)
      if (firstInputDelay > 100) {
        console.warn('First Input Delay is poor (>100ms).')
      }
    }
  }

  // Use PerformanceObserver if available
  if ('PerformanceObserver' in window) {
    try {
      // Observe first-input events
      const po = new PerformanceObserver(entryList => {
        entryList.getEntries().forEach(entry => {
          // Skip any entries that aren't first-input
          if (entry.entryType !== 'first-input') return

          onFirstInput(entry as PerformanceEventTiming)

          // Disconnect since we only need the first input
          po.disconnect()
        })
      })

      // Register observer for first-input
      po.observe({ type: 'first-input', buffered: true })
    } catch (e) {
      console.warn('PerformanceObserver for FID not supported', e)
    }
  }
})
