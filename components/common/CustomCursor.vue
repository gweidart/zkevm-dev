<template>
  <div class="custom-cursor-container" v-if="isEnabled">
    <div ref="cursor" class="cursor" :class="{ 'cursor-active': isActive }">
      <div class="cursor-dot"></div>
      <div ref="cursorRing" class="cursor-ring"></div>
    </div>
    <div ref="cursorFollower" class="cursor-follower"></div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
  import { useRuntimeConfig } from '#app'
  import gsap from 'gsap'

  /**
   * Interactive element selector types for cursor behavior changes
   */
  interface CursorSelectors {
    /** Selectors for elements that should enlarge the cursor */
    enlarge: string[]
    /** Selectors for elements that should hide the cursor */
    hide: string[]
  }

  /**
   * Custom cursor configuration
   */
  interface CursorConfig {
    /** Whether the cursor is enabled by default */
    enabled: boolean
    /** Size of the cursor dot in pixels */
    dotSize: number
    /** Size of the cursor ring in pixels */
    ringSize: number
    /** Size of the cursor follower in pixels */
    followerSize: number
    /** Animation duration for cursor movements in seconds */
    animationDuration: number
    /** Primary cursor color (override via CSS variables) */
    primaryColor: string
    /** Interactive element selectors */
    selectors: CursorSelectors
  }

  // Get config if provided, or use defaults
  const config = (useRuntimeConfig()?.public?.cursor as Partial<CursorConfig>) || {}

  // Default cursor configuration
  const cursorConfig: CursorConfig = {
    enabled: config.enabled !== undefined ? config.enabled : true,
    dotSize: config.dotSize || 6,
    ringSize: config.ringSize || 24,
    followerSize: config.followerSize || 8,
    animationDuration: config.animationDuration || 0.6,
    primaryColor: config.primaryColor || 'var(--color-primary, #6317ed)',
    selectors: {
      enlarge: config.selectors?.enlarge || [
        'a',
        'button',
        '.btn',
        '[role="button"]',
        'input',
        'textarea',
        'select',
        '.clickable',
      ],
      hide: config.selectors?.hide || [
        'input[type="text"]',
        'textarea',
        '[contenteditable="true"]',
      ],
    },
  }

  // Cursor element refs
  const cursor = ref<HTMLElement | null>(null)
  const cursorRing = ref<HTMLElement | null>(null)
  const cursorFollower = ref<HTMLElement | null>(null)

  // Position and state tracking
  const mousePosition = ref({ x: 0, y: 0 })
  const isVisible = ref(false)
  const isEnlarged = ref(false)
  const isActive = ref(false)
  const isHovered = ref(false)

  // Window size for boundary checking
  const windowSize = ref({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
  })

  // Check if reduced motion is preferred
  const prefersReducedMotion = ref(
    typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )

  // Computed property to determine if cursor should be enabled
  const isEnabled = computed(() => {
    // Disable on touch devices
    if (typeof window !== 'undefined' && window.matchMedia) {
      const touchDevice = window.matchMedia('(hover: none) and (pointer: coarse)').matches
      if (touchDevice) return false
    }

    return cursorConfig.enabled
  })

  // Compute animation settings based on reduced motion preference
  const animationSettings = computed(() => {
    return {
      duration: prefersReducedMotion.value ? 0.1 : cursorConfig.animationDuration,
      ease: prefersReducedMotion.value ? 'power1.out' : 'power3.out',
    }
  })

  /**
   * Handle mouse movement
   */
  const onMouseMove = (e: MouseEvent): void => {
    mousePosition.value = { x: e.clientX, y: e.clientY }
    isActive.value = true

    // Ensure cursor is visible when mouse moves
    if (!isVisible.value) {
      isVisible.value = true
      toggleCursorVisibility(true)
    }
  }

  /**
   * Handle mouse enter/leave viewport
   */
  const onMouseEnter = (): void => {
    isVisible.value = true
    toggleCursorVisibility(true)
  }

  const onMouseLeave = (): void => {
    isVisible.value = false
    toggleCursorVisibility(false)
  }

  /**
   * Toggle cursor visibility
   */
  const toggleCursorVisibility = (visible: boolean): void => {
    if (!cursor.value || !cursorFollower.value) return

    gsap.to([cursor.value, cursorFollower.value], {
      duration: animationSettings.value.duration / 2,
      opacity: visible ? 1 : 0,
      ease: animationSettings.value.ease,
    })
  }

  /**
   * Toggle cursor size based on hovered element
   */
  const toggleCursorSize = (enlarged: boolean): void => {
    if (enlarged === isEnlarged.value) return
    isEnlarged.value = enlarged

    if (!cursorRing.value || !cursorFollower.value) return

    if (enlarged) {
      gsap.to(cursorRing.value, {
        duration: prefersReducedMotion.value ? 0.2 : 0.5,
        scale: 1.5,
        opacity: 0.5,
        ease: prefersReducedMotion.value ? 'power2.out' : 'elastic.out(1, 0.4)',
      })

      gsap.to(cursorFollower.value, {
        duration: prefersReducedMotion.value ? 0.2 : 0.5,
        scale: 2,
        backgroundColor: `${cursorConfig.primaryColor.replace(')', ', 0.1)')}`,
        ease: prefersReducedMotion.value ? 'power2.out' : 'elastic.out(1, 0.4)',
      })
    } else {
      gsap.to(cursorRing.value, {
        duration: 0.4,
        scale: 1,
        opacity: 0.8,
        ease: animationSettings.value.ease,
      })

      gsap.to(cursorFollower.value, {
        duration: 0.4,
        scale: 1,
        backgroundColor: `${cursorConfig.primaryColor.replace(')', ', 0.05)')}`,
        ease: animationSettings.value.ease,
      })
    }
  }

  /**
   * Toggle cursor visibility on form elements
   */
  const toggleCursorOnInputs = (hide: boolean): void => {
    if (!cursor.value || !cursorFollower.value) return

    gsap.to([cursor.value, cursorFollower.value], {
      duration: 0.3,
      opacity: hide ? 0 : 1,
      ease: 'power2.out',
    })
  }

  /**
   * Track all interactive elements and apply event listeners
   */
  const trackElements = (): void => {
    // Only run in browser environment
    if (typeof document === 'undefined') return

    // Elements that should enlarge the cursor
    const enlargeSelector = cursorConfig.selectors.enlarge.join(', ')
    const enlargeElements = document.querySelectorAll<HTMLElement>(enlargeSelector)

    // Elements that should hide the cursor (text inputs, etc.)
    const hideSelector = cursorConfig.selectors.hide.join(', ')
    const hideElements = document.querySelectorAll<HTMLElement>(hideSelector)

    // Add event listeners for elements that should enlarge the cursor
    enlargeElements.forEach(el => {
      el.addEventListener('mouseenter', () => toggleCursorSize(true))
      el.addEventListener('mouseleave', () => toggleCursorSize(false))

      // Add active state detection for clicks
      el.addEventListener('mousedown', () => {
        isHovered.value = true
      })
      el.addEventListener('mouseup', () => {
        isHovered.value = false
      })
    })

    // Add event listeners for elements that should hide the cursor
    hideElements.forEach(el => {
      el.addEventListener('mouseenter', () => toggleCursorOnInputs(true))
      el.addEventListener('mouseleave', () => toggleCursorOnInputs(false))
    })

    // Apply a class to the document body to hide the default cursor
    document.body.classList.add('custom-cursor-active')
  }

  // Animation frame ID for cleanup
  let animationFrameId: number | null = null

  /**
   * Animate cursor movement
   */
  const animateCursor = (): void => {
    if (!cursor.value || !cursorFollower.value) {
      animationFrameId = requestAnimationFrame(animateCursor)
      return
    }

    // Keep cursor within viewport bounds
    const x = Math.max(0, Math.min(mousePosition.value.x, windowSize.value.width))
    const y = Math.max(0, Math.min(mousePosition.value.y, windowSize.value.height))

    // Update main cursor position immediately for sharpness
    cursor.value.style.transform = `translate(${x}px, ${y}px)`

    // Animate follower with smooth delay
    gsap.to(cursorFollower.value, {
      duration: animationSettings.value.duration,
      x: x,
      y: y,
      ease: animationSettings.value.ease,
    })

    // Continue animation loop
    animationFrameId = requestAnimationFrame(animateCursor)
  }

  /**
   * Mutation observer to dynamically track new interactive elements added to the DOM
   */
  let observer: MutationObserver | null = null

  const setupMutationObserver = (): void => {
    if (typeof MutationObserver === 'undefined') return

    observer = new MutationObserver(mutations => {
      let shouldUpdate = false

      mutations.forEach(mutation => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          shouldUpdate = true
        }
      })

      if (shouldUpdate) {
        // Slight delay to ensure DOM is ready
        setTimeout(trackElements, 100)
      }
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    })
  }

  // Update window size on resize
  const handleResize = () => {
    windowSize.value = {
      width: window.innerWidth,
      height: window.innerHeight,
    }
  }

  // Watch for window size changes to ensure cursor stays within bounds
  watch(windowSize, () => {
    // Make sure cursor stays within viewport on resize
    if (mousePosition.value.x > windowSize.value.width) {
      mousePosition.value.x = windowSize.value.width - 10
    }
    if (mousePosition.value.y > windowSize.value.height) {
      mousePosition.value.y = windowSize.value.height - 10
    }
  })

  // Setup event listeners and animations
  onMounted(() => {
    if (!isEnabled.value) return

    // Initialize cursor position to avoid initial "jump"
    if (cursor.value && cursorFollower.value) {
      cursor.value.style.opacity = '0'
      cursorFollower.value.style.opacity = '0'

      // Apply custom sizes if configured
      if (cursorConfig.dotSize !== 6) {
        const dotElement = cursor.value.querySelector('.cursor-dot')
        if (dotElement) {
          ;(dotElement as HTMLElement).style.width = `${cursorConfig.dotSize}px`
          ;(dotElement as HTMLElement).style.height = `${cursorConfig.dotSize}px`
        }
      }

      if (cursorConfig.ringSize !== 24) {
        if (cursorRing.value) {
          cursorRing.value.style.width = `${cursorConfig.ringSize}px`
          cursorRing.value.style.height = `${cursorConfig.ringSize}px`
        }
      }

      if (cursorConfig.followerSize !== 40) {
        if (cursorFollower.value) {
          cursorFollower.value.style.width = `${cursorConfig.followerSize}px`
          cursorFollower.value.style.height = `${cursorConfig.followerSize}px`
        }
      }
    }

    // Add event listeners
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseenter', onMouseEnter)
    document.addEventListener('mouseleave', onMouseLeave)

    // Start animation loop
    animateCursor()

    // Track interactive elements
    setTimeout(trackElements, 500)

    // Setup observer for dynamically added elements
    setupMutationObserver()

    // Add window resize listener
    window.addEventListener('resize', handleResize)
  })

  // Clean up event listeners and animations
  onBeforeUnmount(() => {
    // Remove event listeners
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseenter', onMouseEnter)
    document.removeEventListener('mouseleave', onMouseLeave)
    window.removeEventListener('resize', handleResize)

    // Cancel animation frame
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId)
    }

    // Disconnect mutation observer
    if (observer) {
      observer.disconnect()
    }

    // Remove custom cursor class from body
    document.body.classList.remove('custom-cursor-active')
  })
</script>

<style scoped>
  .custom-cursor-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: var(--z-modal, 9999);
    pointer-events: none; /* Important: allows clicks to pass through */
    overflow: hidden;
    contain: strict; /* Improve performance */
  }

  .cursor {
    position: fixed;
    transform: translate(-50%, -50%);
    pointer-events: none;
    z-index: var(--z-modal, 9999);
    will-change: transform;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  .cursor-active {
    opacity: 1;
  }

  .cursor-dot {
    width: 6px;
    height: 6px;
    background-color: var(--color-primary, #6317ed);
    border-radius: 50%;
    box-shadow: 0 0 10px var(--color-primary, #6317ed);
    opacity: 0.8;
  }

  .cursor-ring {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 24px;
    height: 24px;
    border: 1px solid var(--color-primary, #6317ed);
    border-radius: 50%;
    opacity: 0.5;
    transition:
      opacity 0.3s,
      transform 0.3s;
    will-change: transform, opacity;
  }

  .cursor-follower {
    position: fixed;
    top: 0;
    left: 0;
    width: 40px;
    height: 40px;
    background-color: rgba(99, 23, 237, 0.05);
    border-radius: 50%;
    transform: translate(-50%, -50%);
    pointer-events: none;
    z-index: calc(var(--z-modal, 9999) - 1);
    will-change: transform;
    opacity: 0;
  }

  /* Hide default cursor when our component is active */
  :global(.custom-cursor-active) {
    cursor: none !important;
  }

  /* Media query for touch devices */
  @media (hover: none) and (pointer: coarse) {
    .custom-cursor-container {
      display: none;
    }
  }

  /* Reduce motion for users who prefer it */
  @media (prefers-reduced-motion: reduce) {
    .cursor-ring,
    .cursor-follower {
      transition-duration: 0.1s;
    }
  }
</style>
