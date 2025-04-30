<template>
  <figure
    class="responsive-image"
    :class="{
      'has-caption': !!caption,
      'is-loaded': isLoaded,
      'has-error': hasError,
      'is-rounded': rounded,
    }"
    :style="containerStyle"
  >
    <div
      ref="imageWrapperRef"
      class="image-wrapper"
      :style="wrapperStyle"
      :data-intersect="intersectionObserver ? 'true' : 'false'"
    >
      <!-- Image placeholder acting as a loading indicator -->
      <div
        v-if="usePlaceholder"
        class="image-placeholder"
        :class="{ 'is-loaded': isLoaded }"
        :style="{ backgroundColor: placeholderColor }"
      ></div>

      <!-- Blur-up tiny preview if provided -->
      <img
        v-if="blurDataURL"
        class="blur-placeholder"
        :class="{ 'is-loaded': isLoaded }"
        :src="blurDataURL"
        :alt="''"
        aria-hidden="true"
        loading="eager"
      />

      <!-- Actual image element -->
      <img
        ref="imageRef"
        :src="currentSrc"
        :srcset="currentSrcSet"
        :sizes="computedSizes"
        :alt="alt"
        :width="width"
        :height="height"
        :loading="computedLoading"
        :decoding="priority ? 'sync' : 'async'"
        :fetchpriority="priority ? 'high' : 'auto'"
        @load="onImageLoaded"
        @error="onImageError"
        :class="{ 'is-loaded': isLoaded, 'has-error': hasError }"
      />

      <!-- Optional overlay for effects -->
      <div v-if="overlay" class="image-overlay" :class="overlayClass" :aria-hidden="true"></div>
    </div>

    <!-- Optional caption -->
    <figcaption v-if="caption" class="image-caption">
      {{ caption }}
    </figcaption>
  </figure>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
  import { generateSrcSet, calculateAspectRatio } from '~/utils/image-optimization'

  // Type for object-fit values
  type ObjectFitValue = 'contain' | 'cover' | 'fill' | 'none' | 'scale-down'

  // Component props
  const props = defineProps({
    // Image source
    src: {
      type: String,
      required: true,
    },
    // Image alternative text
    alt: {
      type: String,
      required: true,
    },
    // Optional caption
    caption: {
      type: String,
      default: '',
    },
    // Original image width
    width: {
      type: Number,
      required: true,
    },
    // Original image height
    height: {
      type: Number,
      required: true,
    },
    // Custom srcset
    srcset: {
      type: String,
      default: '',
    },
    // Custom sizes attribute
    sizes: {
      type: String,
      default: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
    },
    // Priority loading (for above-the-fold images)
    priority: {
      type: Boolean,
      default: false,
    },
    // Loading mode
    loading: {
      type: String,
      default: 'lazy',
      validator: (value: string) => ['lazy', 'eager', 'intersect'].includes(value),
    },
    // Use a placeholder while loading
    usePlaceholder: {
      type: Boolean,
      default: true,
    },
    // Placeholder color
    placeholderColor: {
      type: String,
      default: '#1e2d3a',
    },
    // Base64 tiny image placeholder
    blurDataURL: {
      type: String,
      default: '',
    },
    // Optional overlay (for hover effects etc)
    overlay: {
      type: Boolean,
      default: false,
    },
    // Overlay class
    overlayClass: {
      type: String,
      default: '',
    },
    // Container object-fit
    objectFit: {
      type: String as () => ObjectFitValue,
      default: 'cover',
      validator: (value: string) => {
        return ['contain', 'cover', 'fill', 'none', 'scale-down'].includes(value)
      },
    },
    // Round corners
    rounded: {
      type: Boolean,
      default: false,
    },
    // Maximum width override
    maxWidth: {
      type: [String, Number],
      default: null,
    },
    // Maximum height override
    maxHeight: {
      type: [String, Number],
      default: null,
    },
  })

  /**
   * Emit events
   */
  const emit = defineEmits<{
    /** Emitted when the image has finished loading */
    (e: 'loaded'): void
    /** Emitted when the image failed to load */
    (e: 'error', error: Error): void
  }>()

  // Component refs
  const imageRef = ref<HTMLImageElement | null>(null)
  const imageWrapperRef = ref<HTMLDivElement | null>(null)

  // Component state
  const isLoaded = ref(false)
  const hasError = ref(false)
  const isIntersecting = ref(props.priority) // If priority, assume already in viewport
  const hasSrcSet = ref(false)

  // Intersection observer instance
  let intersectionObserver: IntersectionObserver | null = null

  /**
   * Whether to use intersection observer for loading
   */
  const useIntersectionObserver = computed(() => {
    // NOTE: There's a TypeScript error with the loading prop type that should be addressed
    // in a future refactoring. For now, we treat it as a string and validate in the props definition.
    return (
      props.loading === 'intersect' &&
      !props.priority &&
      typeof IntersectionObserver !== 'undefined'
    )
  })

  /**
   * Computed loading attribute for the image
   */
  const computedLoading = computed((): 'lazy' | 'eager' => {
    if (props.priority) return 'eager'
    // For intersection observer, we still use lazy loading as fallback
    return 'lazy' // Only return valid HTML attribute values
  })

  /**
   * Get current src based on intersection and loading strategy
   */
  const currentSrc = computed(() => {
    // If using intersection observer and not yet intersecting, return empty or blur image
    if (useIntersectionObserver.value && !isIntersecting.value) {
      return props.blurDataURL || '' // Empty src if not intersecting and no blur image
    }
    return props.src
  })

  /**
   * Get current srcset based on intersection and loading strategy
   */
  const currentSrcSet = computed(() => {
    // If using intersection observer and not yet intersecting, don't load srcset
    if (useIntersectionObserver.value && !isIntersecting.value) {
      return ''
    }

    if (props.srcset) {
      hasSrcSet.value = true
      return props.srcset
    }

    // Generate srcset if not provided
    const basePath = props.src.replace(/\.[^.]+$/, '')
    const generatedSrcSet = generateSrcSet(basePath)

    if (generatedSrcSet) {
      hasSrcSet.value = true
    }

    return generatedSrcSet
  })

  /**
   * Use provided sizes or default
   */
  const computedSizes = computed(() => props.sizes)

  /**
   * Container styling
   */
  const containerStyle = computed(() => {
    const style: Record<string, string> = {}

    // Set max width based on props or default to image width
    if (props.maxWidth) {
      style.maxWidth = typeof props.maxWidth === 'number' ? `${props.maxWidth}px` : props.maxWidth
    } else {
      style.maxWidth = `${props.width}px`
    }

    // Add max height if specified
    if (props.maxHeight) {
      style.maxHeight =
        typeof props.maxHeight === 'number' ? `${props.maxHeight}px` : props.maxHeight
    }

    return style
  })

  /**
   * Wrapper styling with aspect ratio
   */
  const wrapperStyle = computed(() => {
    const style: Record<string, string> = {
      aspectRatio: calculateAspectRatio(props.width, props.height),
    }

    return style
  })

  /**
   * Handle image loaded event
   */
  const onImageLoaded = () => {
    isLoaded.value = true
    emit('loaded')
  }

  /**
   * Handle image error event
   */
  const onImageError = () => {
    hasError.value = true
    console.error(`Failed to load image: ${props.src}`)
    emit('error', new Error(`Failed to load image: ${props.src}`))
  }

  /**
   * Initialize intersection observer for lazy loading
   */
  const setupIntersectionObserver = () => {
    if (!useIntersectionObserver.value || !imageWrapperRef.value) return

    intersectionObserver = new IntersectionObserver(
      entries => {
        // Check if our image wrapper is intersecting the viewport
        const isNowIntersecting = entries.some(entry => entry.isIntersecting)

        if (isNowIntersecting && !isIntersecting.value) {
          isIntersecting.value = true

          // Once we've started loading the image, we can disconnect the observer
          intersectionObserver?.disconnect()
          intersectionObserver = null
        }
      },
      {
        rootMargin: '200px', // Start loading when image is 200px away
        threshold: 0.01, // Trigger when 1% of the element is visible
      }
    )

    // Start observing the image wrapper
    intersectionObserver.observe(imageWrapperRef.value)
  }

  /**
   * Preload high priority images
   */
  const preloadHighPriorityImage = () => {
    if (!props.priority) return

    // If we already have a reference to the image, no need to preload
    if (imageRef.value) return

    const img = new Image()
    img.src = props.src

    if (hasSrcSet.value) {
      if (props.srcset) {
        img.srcset = props.srcset
      } else {
        // Use the computed srcset
        const basePath = props.src.replace(/\.[^.]+$/, '')
        img.srcset = generateSrcSet(basePath)
      }
    }

    img.onload = onImageLoaded
    img.onerror = onImageError
  }

  /**
   * Clean up resources
   */
  const cleanup = () => {
    if (intersectionObserver) {
      intersectionObserver.disconnect()
      intersectionObserver = null
    }
  }

  // Watch for changes in src and reset loading state
  watch(
    () => props.src,
    (newSrc, oldSrc) => {
      if (newSrc !== oldSrc) {
        isLoaded.value = false
        hasError.value = false

        // If it's a priority image or already intersecting, preload it
        if (props.priority || isIntersecting.value) {
          const img = new Image()
          img.src = newSrc
          img.onload = onImageLoaded
          img.onerror = onImageError
        }
      }
    }
  )

  // Setup on mount
  onMounted(() => {
    setupIntersectionObserver()
    preloadHighPriorityImage()
  })

  // Clean up on unmount
  onBeforeUnmount(() => {
    cleanup()
  })
</script>

<style scoped>
  .responsive-image {
    margin: 0;
    width: 100%;
    display: block;
    position: relative;
    overflow: hidden;
    line-height: 0; /* Remove space below the image */
  }

  .responsive-image.is-rounded .image-wrapper {
    border-radius: var(--radius-md, 8px);
  }

  .image-wrapper {
    position: relative;
    width: 100%;
    overflow: hidden;
    background-color: var(--color-background-alt, #f0f0f0);
    transform: translateZ(0); /* Force GPU acceleration */
  }

  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: v-bind('objectFit');
    position: relative;
    z-index: 2;
    opacity: 0;
    transition: opacity 0.3s ease;
    will-change: opacity;
  }

  img.is-loaded {
    opacity: 1;
  }

  img.has-error {
    filter: grayscale(1);
    opacity: 0.5;
  }

  .image-placeholder {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
    transform: scale(1.05);
    filter: blur(10px);
    transition:
      opacity 0.3s ease,
      transform 0.5s ease;
  }

  .image-placeholder.is-loaded {
    opacity: 0;
    transform: scale(1);
  }

  .blur-placeholder {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
    filter: blur(20px);
    transform: scale(1.1);
    object-fit: cover;
    opacity: 1;
    transition:
      opacity 0.3s ease,
      transform 0.5s ease;
  }

  .blur-placeholder.is-loaded {
    opacity: 0;
    transform: scale(1);
  }

  .image-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 3;
    pointer-events: none;
  }

  .image-caption {
    margin-top: 0.75rem;
    font-size: var(--font-size-sm, 0.875rem);
    color: var(--color-text-muted, #666);
    text-align: center;
    line-height: 1.5;
  }

  /* Hover effects with improved performance */
  @media (hover: hover) {
    .image-wrapper:hover img:not(.blur-placeholder) {
      transform: scale(1.03);
      transition: transform 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
    }
  }

  /* Accessibility */
  @media (prefers-reduced-motion: reduce) {
    img,
    .image-placeholder,
    .blur-placeholder,
    .image-wrapper:hover img:not(.blur-placeholder) {
      transition: opacity 0.1s linear;
      transform: none;
    }
  }

  /* High contrast mode support */
  @media (forced-colors: active) {
    .image-wrapper {
      border: 1px solid CanvasText;
    }

    .image-caption {
      color: CanvasText;
    }
  }
</style>
