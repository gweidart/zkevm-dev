<template>
  <div class="app-container">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <ClientOnly>
      <CustomCursor />
      <FpsTracker v-if="isDev" />
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
  import { onMounted, defineAsyncComponent, computed } from 'vue'
  import { useHead, useRuntimeConfig } from '#app'

  // Type definitions for performance entries
  interface LayoutShiftEntry extends PerformanceEntry {
    value: number
  }

  // Type-safe runtime config access
  const config = useRuntimeConfig()
  const isDev = computed(() => config.public.environment === 'development')

  // Optimize components with async loading where appropriate

  // Ensure CustomCursor is also loaded async
  const CustomCursor = defineAsyncComponent(() => import('~/components/common/CustomCursor.vue'))

  // Development-only components loaded asynchronously to reduce production bundle size
  const FpsTracker = defineAsyncComponent(() => import('~/components/common/FpsTracker.vue'))

  /**
   * Configure critical fonts and metadata
   * Using modern font loading strategies for optimal performance
   */
  useHead({
    htmlAttrs: {
      lang: 'en',
      dir: 'ltr',
    },
    link: [
      // Preconnect to font providers early
      {
        rel: 'preconnect',
        href: 'https://fonts.googleapis.com',
        crossorigin: 'anonymous',
      },
      {
        rel: 'preconnect',
        href: 'https://fonts.gstatic.com',
        crossorigin: 'anonymous',
      },
      // Critical font preload with FOIT prevention strategy
      {
        rel: 'preload',
        as: 'style',
        href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=Space+Grotesk:wght@400;500;700&display=swap',
        crossorigin: 'anonymous',
      },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=Space+Grotesk:wght@400;500;700&display=swap',
        media: 'print',
        onload: "this.media='all'",
      },
    ],
    // Ensure these don't override nuxt.config.ts values but complement them
    meta: [
      // Removed redundant viewport and theme-color meta tags
      // These are already defined in nuxt.config.ts
    ],
    script: [
      // Add structured data for better SEO
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Person',
          name: 'zkEVM.dev',
          url: config.public.siteUrl,
          jobTitle: 'Web3 Security Researcher',
          sameAs: ['https://github.com/zkevm-dev', 'https://twitter.com/zkevm_dev'],
        }),
      },
    ],
  })

  /**
   * Load non-critical resources after page load is complete
   * Using modern browser APIs to optimize timing
   */
  onMounted(() => {
    if (process.client) {
      // Load additional font weights after critical content is displayed
      const loadFullFonts = () => {
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href =
          'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@300;400;500;600;700&display=swap'
        document.head.appendChild(link)
      }

      // Use requestIdleCallback for non-critical operations, with setTimeout fallback
      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(loadFullFonts, { timeout: 2000 })
      } else {
        setTimeout(loadFullFonts, 2000)
      }

      // Register performance observer if in development mode
      if (isDev.value && typeof PerformanceObserver !== 'undefined') {
        try {
          // Observe layout shifts if supported
          if (PerformanceObserver.supportedEntryTypes?.includes('layout-shift')) {
            const layoutObserver = new PerformanceObserver(list => {
              list.getEntries().forEach(entry => {
                // Type assertion for layout shift entries
                const layoutShift = entry as unknown as LayoutShiftEntry
                if (layoutShift.value > 0.1) {
                  console.warn(`Large layout shift detected: ${layoutShift.value.toFixed(2)}`)
                }
              })
            })
            layoutObserver.observe({ entryTypes: ['layout-shift'] })
          }

          // Observe long tasks if supported
          if (PerformanceObserver.supportedEntryTypes?.includes('longtask')) {
            const longTaskObserver = new PerformanceObserver(list => {
              list.getEntries().forEach(entry => {
                console.warn(`Long task detected: ${entry.duration.toFixed(2)}ms`)
              })
            })
            longTaskObserver.observe({ entryTypes: ['longtask'] })
          }
        } catch (e) {
          console.warn('Performance monitoring error:', e)
        }
      }
    }
  })
</script>

<style>
  /* Global styles are imported from assets/styles/main.css */
  .app-container {
    display: contents; /* Avoid unnecessary div wrapper impact */
  }
</style>
