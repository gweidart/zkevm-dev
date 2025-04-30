<!-- GravatarCard.vue - Uses oEmbed API to embed a Gravatar profile card -->
<template>
  <div
    ref="gravatarContainer"
    class="gravatar-container"
    :class="{ 'has-error': hasError }"
    aria-live="polite"
  >
    <div v-if="loading" class="gravatar-loading" aria-busy="true">
      <div class="loading-spinner" aria-hidden="true"></div>
      <span>Loading profile...</span>
    </div>
    <div v-if="hasError" class="gravatar-error">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
      <p>Failed to load Gravatar profile for {{ username }}</p>
      <button
        v-if="canRetry"
        class="retry-button"
        @click="loadGravatarProfile"
        aria-label="Retry loading profile"
      >
        Retry
      </button>
    </div>
    <!-- The iframe content will be inserted here by the script -->
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, onUnmounted, watch } from 'vue'
  import { gsap } from 'gsap'

  /**
   * Interface for Gravatar oEmbed API response
   */
  interface GravatarOEmbedResponse {
    /** HTML to embed */
    html: string
    /** Provider name */
    provider_name: string
    /** Version of oEmbed spec */
    version: string
    /** Type of response */
    type: string
  }

  /**
   * Component props interface
   */
  interface Props {
    /** The Gravatar username to load */
    username: string
    /** Animation delay in seconds */
    animationDelay?: number
    /** Whether to respect reduced motion preferences */
    respectReducedMotion?: boolean
    /** Whether to allow retry on error */
    allowRetry?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    animationDelay: 0,
    respectReducedMotion: true,
    allowRetry: true,
  })

  // Emits events for component state changes
  const emit = defineEmits<{
    /** Profile has been loaded successfully */
    (e: 'loaded'): void
    /** Error occurred while loading profile */
    (e: 'error', error: Error): void
  }>()

  // Refs for component state
  const gravatarContainer = ref<HTMLElement | null>(null)
  const loading = ref<boolean>(true)
  const hasError = ref<boolean>(false)
  const canRetry = ref<boolean>(false)
  const isMounted = ref<boolean>(false)
  const isReducedMotion = ref<boolean>(false)
  const abortController = ref<AbortController | null>(null)

  /**
   * Check if reduced motion is preferred
   */
  const checkReducedMotion = (): boolean => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }

  /**
   * Clean up existing iframe or content
   */
  const cleanupExistingContent = (): void => {
    if (!gravatarContainer.value) return

    // Find and remove any existing iframes to prevent duplicates
    const existingIframe = gravatarContainer.value.querySelector('iframe')
    if (existingIframe) {
      existingIframe.remove()
    }
  }

  /**
   * Load Gravatar profile using oEmbed API
   */
  const loadGravatarProfile = async (): Promise<void> => {
    // Reset state
    loading.value = true
    hasError.value = false
    canRetry.value = false

    // Abort any previous requests
    if (abortController.value) {
      abortController.value.abort()
    }

    // Create new abort controller
    abortController.value = new AbortController()

    try {
      cleanupExistingContent()

      // Encode the Gravatar URL
      const gravatarUrl = encodeURIComponent(`https://gravatar.com/${props.username}`)

      // Fetch oEmbed data from Gravatar API with timeout
      const response = await fetch(`https://api.gravatar.com/v3/oembed?url=${gravatarUrl}`, {
        signal: abortController.value.signal,
        headers: {
          Accept: 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to load Gravatar profile: ${response.statusText}`)
      }

      const data = (await response.json()) as GravatarOEmbedResponse

      // Insert the oEmbed HTML into the container
      if (gravatarContainer.value && isMounted.value) {
        // Create a temporary div to parse the HTML
        const tempDiv = document.createElement('div')
        tempDiv.innerHTML = data.html

        // Get the iframe element
        const iframeElement = tempDiv.querySelector('iframe')

        if (iframeElement) {
          // Add title and other accessibility attributes to iframe
          iframeElement.setAttribute('title', `Gravatar profile for ${props.username}`)
          iframeElement.setAttribute('loading', 'lazy')

          // Add sandbox attributes for security
          iframeElement.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-popups')

          // Append the iframe to our container
          gravatarContainer.value.appendChild(iframeElement)

          // Apply entrance animation (with respect to reduced motion preference)
          if (!isReducedMotion.value) {
            gsap.fromTo(
              iframeElement,
              {
                opacity: 0,
                y: 20,
                boxShadow: 'none',
              },
              {
                opacity: 1,
                y: 0,
                boxShadow: 'var(--shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1))',
                duration: 0.8,
                delay: props.animationDelay,
                ease: 'power2.out',
              }
            )
          } else {
            // Immediate display without animation
            gsap.set(iframeElement, {
              opacity: 1,
              y: 0,
              boxShadow: 'var(--shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1))',
            })
          }
        }
      }

      loading.value = false
      emit('loaded')
    } catch (error) {
      // Don't show errors for aborted requests
      if (error instanceof Error && error.name === 'AbortError') {
        return
      }

      console.error('Error loading Gravatar profile:', error)
      loading.value = false
      hasError.value = true
      canRetry.value = props.allowRetry

      // Emit the error event
      if (error instanceof Error) {
        emit('error', error)
      } else {
        emit('error', new Error('Unknown error loading Gravatar profile'))
      }
    } finally {
      abortController.value = null
    }
  }

  // Watch for username changes to reload profile
  watch(
    () => props.username,
    () => {
      if (isMounted.value) {
        loadGravatarProfile()
      }
    }
  )

  // Initialize on component mount
  onMounted(() => {
    isMounted.value = true
    isReducedMotion.value = props.respectReducedMotion && checkReducedMotion()

    // Define listener function
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const motionPreferenceListener = (event: MediaQueryListEvent) => {
      isReducedMotion.value = props.respectReducedMotion && event.matches
    }

    // Listen for changes in reduced motion preference
    mediaQuery.addEventListener('change', motionPreferenceListener)

    // Load the profile
    loadGravatarProfile()

    // Store listener reference for cleanup
    onUnmounted(() => {
      mediaQuery.removeEventListener('change', motionPreferenceListener)
    })
  })

  // Clean up on component unmount
  onUnmounted(() => {
    isMounted.value = false

    // Abort any pending requests
    if (abortController.value) {
      abortController.value.abort()
    }

    // Listener is removed in the onMounted hook's cleanup function
  })

  // Expose methods for parent components
  defineExpose({
    reload: loadGravatarProfile,
    loading,
    hasError,
  })
</script>

<style scoped>
  .gravatar-container {
    position: relative;
    width: 100%;
    min-height: 415px; /* Match the iframe height */
    height: auto; /* Allow container to expand as needed */
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0;
    padding: 0;
    overflow: hidden; /* Don't clip contents */
    border-radius: var(--radius-lg, 12px);
    background: linear-gradient(145deg, rgba(5, 30, 40, 0.3), rgba(5, 30, 40, 0));
    will-change: opacity, transform;
  }

  /* Direct styling for the iframe to ensure it's applied consistently */
  :deep(iframe) {
    width: 100%;
    height: 415px;
    border-radius: var(--radius-lg, 12px);
    border: 1px solid var(--color-border, #193642);
    box-shadow:
      var(--shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1)),
      0 0 20px rgba(22, 240, 140, 0.05);
    transition: all 0.3s var(--ease-out, ease);
    overflow: hidden;
    will-change: box-shadow, border-color;
  }

  .gravatar-container:hover :deep(iframe) {
    box-shadow:
      var(--shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1)),
      0 0 25px rgba(22, 240, 138, 0.582);
    border-color: var(--color-primary, #16f08c);
  }

  .gravatar-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-md, 1rem);
    color: var(--color-text-muted, #a0aec0);
  }

  .loading-spinner {
    width: 30px;
    height: 30px;
    border: 3px solid rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    border-top-color: var(--color-primary, #16f08c);
    animation: spin 1s ease-in-out infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .gravatar-error {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--spacing-lg, 2rem);
    color: var(--color-text-muted, #a0aec0);
    text-align: center;
    gap: var(--spacing-md, 1rem);
  }

  .gravatar-error svg {
    color: var(--color-accent, #d86475);
  }

  .retry-button {
    margin-top: var(--spacing-sm, 0.5rem);
    padding: 0.5rem 1rem;
    background-color: var(--color-surface-variant, #072530);
    color: var(--color-text, #e9eef2);
    border: 1px solid var(--color-border, #193642);
    border-radius: var(--radius-sm, 4px);
    cursor: pointer;
    transition: all 0.2s var(--ease-out, ease);
  }

  .retry-button:hover {
    background-color: var(--color-primary, #16f08c);
    color: var(--color-surface, #051a23);
  }

  .retry-button:focus-visible {
    outline: 2px solid var(--color-primary, #16f08c);
    outline-offset: 2px;
  }

  /* Prefers reduced motion */
  @media (prefers-reduced-motion: reduce) {
    :deep(iframe),
    .gravatar-container:hover :deep(iframe),
    .retry-button,
    .retry-button:hover {
      transition: none;
    }

    .loading-spinner {
      animation-duration: 2s;
    }
  }

  /* High contrast mode support */
  @media (forced-colors: active) {
    .gravatar-container {
      border: 1px solid CanvasText;
    }

    :deep(iframe) {
      border: 1px solid CanvasText;
      box-shadow: none;
    }

    .gravatar-container:hover :deep(iframe) {
      border-color: Highlight;
      box-shadow: none;
    }

    .loading-spinner {
      border-color: CanvasText;
      border-top-color: Highlight;
    }

    .retry-button {
      border: 1px solid CanvasText;
    }

    .retry-button:hover,
    .retry-button:focus {
      background-color: Highlight;
      color: HighlightText;
    }
  }
</style>
