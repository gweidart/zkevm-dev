<template>
  <div
    ref="container"
    class="scroll-animation-wrapper"
    :class="[wrapperClasses, `animation-${type}`]"
    :data-animation="type"
    :data-initialized="initialized"
    :data-threshold="threshold"
    :data-animated="animated"
    :aria-hidden="reduceMotion ? 'false' : !animated"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, onBeforeUnmount, computed, nextTick, watch } from 'vue'
  import {
    fadeInUpOnScroll,
    revealTextOnScroll,
    scaleOnScroll,
    staggerElementsOnScroll,
    parallaxOnScroll,
  } from '~/utils/scrollAnimation'

  /**
   * Available animation types
   */
  type AnimationType =
    | 'fade' // Simple fade in and up
    | 'scale' // Scale up from smaller size
    | 'reveal' // Text reveal effect
    | 'stagger' // Stagger children animations
    | 'parallax' // Parallax scrolling effect
    | 'slide-left' // Slide in from left
    | 'slide-right' // Slide in from right
    | 'flip' // Flip element in on scroll
    | 'rotate' // Rotate element in on scroll
    | 'bounce' // Bounce element in on scroll
    | 'custom' // Custom animation with provided class

  /**
   * Component Props
   */
  interface Props {
    /** Type of animation to apply */
    type?: AnimationType
    /** Delay in ms before starting animation */
    delay?: number
    /** Intersection threshold for triggering animation */
    threshold?: string
    /** CSS selector for children to animate (for stagger) */
    childrenSelector?: string
    /** GSAP ScrollTrigger start position */
    startPosition?: string
    /** GSAP ScrollTrigger end position */
    endPosition?: string
    /** Duration of the animation in seconds */
    duration?: number
    /** Custom ease string for GSAP */
    ease?: string
    /** Amount of Y translation for fade/slide animations */
    translateY?: number
    /** Amount of X translation for slide animations */
    translateX?: number
    /** Starting scale value for scale animations */
    startScale?: number
    /** Starting rotation for rotate animations (in degrees) */
    startRotation?: number
    /** Stagger delay between children animations (seconds) */
    staggerDelay?: number
    /** Custom class to add to wrapper */
    customClass?: string
    /** Do not animate on mount, wait for manual trigger */
    animateOnView?: boolean
    /** Markers for development (shows ScrollTrigger markers) */
    markers?: boolean
    /** Play the animation this many times (0 = infinite) */
    repeat?: number
    /** Whether to play animation in reverse when scrolling up */
    scrub?: boolean | number
    /** Whether to disable animation for users who prefer reduced motion */
    respectReducedMotion?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    type: 'fade',
    delay: 0,
    threshold: '80%',
    childrenSelector: '',
    startPosition: 'top 80%',
    endPosition: 'bottom 20%',
    duration: 0.8,
    ease: 'power2.out',
    translateY: 40,
    translateX: 60,
    startScale: 0.9,
    startRotation: 15,
    staggerDelay: 0.1,
    customClass: '',
    animateOnView: true,
    markers: false,
    repeat: 0,
    scrub: false,
    respectReducedMotion: true,
  })

  /**
   * Event emitters
   */
  const emit = defineEmits<{
    /** Animation entered view and triggered */
    (e: 'enter'): void
    /** Animation completed */
    (e: 'complete'): void
    /** Animation left viewport */
    (e: 'leave'): void
  }>()

  // Refs and state
  const container = ref<HTMLElement | null>(null)
  const scrollTrigger = ref<any>(null)
  const tween = ref<any>(null)
  const initialized = ref(false)
  const animated = ref(false)
  const reduceMotion = ref(false)

  /**
   * Computed class list based on props
   */
  const wrapperClasses = computed(() => {
    const classes = []

    if (props.customClass) {
      classes.push(props.customClass)
    }

    if (reduceMotion.value && props.respectReducedMotion) {
      classes.push('reduced-motion')
    }

    if (animated.value) {
      classes.push('animated')
    }

    return classes
  })

  /**
   * Check for reduced motion preference
   */
  const checkReducedMotion = (): boolean => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }

  /**
   * Apply the appropriate animation based on type
   */
  const applyAnimation = () => {
    if (!container.value || !process.client) return

    // Check for reduced motion preference
    if (reduceMotion.value && props.respectReducedMotion) {
      initialized.value = true
      animated.value = true
      return
    }

    // Animation options common to all types
    const animationOptions: any = {
      element: container.value,
      trigger: container.value,
      start: props.startPosition,
      end: props.endPosition,
      markers: props.markers,
      duration: props.duration,
      ease: props.ease,
      scrub: props.scrub,
      repeat: props.repeat,
      onEnter: () => {
        animated.value = true
        emit('enter')
      },
      onLeave: () => {
        if (!props.scrub) return
        animated.value = false
        emit('leave')
      },
      onComplete: () => {
        emit('complete')
      },
    }

    // Apply different animations based on type
    let result: any

    switch (props.type) {
      case 'fade':
        result = fadeInUpOnScroll({
          ...animationOptions,
          translateY: props.translateY,
        })
        break

      case 'scale':
        result = scaleOnScroll({
          ...animationOptions,
          startScale: props.startScale,
        })
        break

      case 'reveal':
        result = revealTextOnScroll({
          ...animationOptions,
        })
        break

      case 'stagger':
        // Stagger children if selector is provided
        if (props.childrenSelector && container.value) {
          const children = container.value.querySelectorAll(props.childrenSelector)
          if (children.length) {
            result = staggerElementsOnScroll({
              ...animationOptions,
              elements: children,
              staggerDelay: props.staggerDelay,
            })
          }
        }
        break

      case 'parallax':
        result = parallaxOnScroll({
          ...animationOptions,
          start: 'top bottom',
          end: 'bottom top',
        })
        break

      case 'slide-left':
        result = createSlideAnimation({
          ...animationOptions,
          direction: 'left',
          translateX: props.translateX,
        })
        break

      case 'slide-right':
        result = createSlideAnimation({
          ...animationOptions,
          direction: 'right',
          translateX: props.translateX,
        })
        break

      case 'flip':
        result = createFlipAnimation(animationOptions)
        break

      case 'rotate':
        result = createRotateAnimation({
          ...animationOptions,
          startRotation: props.startRotation,
        })
        break

      case 'bounce':
        result = createBounceAnimation(animationOptions)
        break

      case 'custom':
        // For custom animations, we just initialize with fade but devs can add their own CSS
        result = fadeInUpOnScroll({
          ...animationOptions,
          translateY: props.translateY,
        })
        break
    }

    if (result) {
      scrollTrigger.value = result.scrollTrigger || null
      tween.value = result.tween || null
    }

    initialized.value = true
  }

  /**
   * Create slide animation from left or right
   */
  const createSlideAnimation = (options: any) => {
    const { gsap } = window as any
    const direction = options.direction || 'left'
    const translateX = options.translateX || 60
    const duration = options.duration || 0.8
    const element = options.element

    // Set initial state
    gsap.set(element, {
      autoAlpha: 0,
      x: direction === 'left' ? -translateX : translateX,
    })

    // Create the animation
    const tween = gsap.to(element, {
      duration,
      autoAlpha: 1,
      x: 0,
      ease: options.ease || 'power2.out',
      scrollTrigger: {
        trigger: options.trigger || element,
        start: options.start || 'top 80%',
        end: options.end || 'bottom 20%',
        toggleActions: 'play none none reverse',
        markers: options.markers || false,
        scrub: options.scrub || false,
        onEnter: options.onEnter,
        onLeave: options.onLeave,
        onComplete: options.onComplete,
      },
    })

    return { scrollTrigger: tween.scrollTrigger, tween }
  }

  /**
   * Create flip animation
   */
  const createFlipAnimation = (options: any) => {
    const { gsap } = window as any
    const element = options.element
    const duration = options.duration || 0.8

    // Set initial state
    gsap.set(element, {
      autoAlpha: 0,
      rotationY: 90,
      transformPerspective: 800,
    })

    // Create the animation
    const tween = gsap.to(element, {
      duration,
      autoAlpha: 1,
      rotationY: 0,
      ease: options.ease || 'power3.out',
      scrollTrigger: {
        trigger: options.trigger || element,
        start: options.start || 'top 80%',
        end: options.end || 'bottom 20%',
        toggleActions: 'play none none reverse',
        markers: options.markers || false,
        scrub: options.scrub || false,
        onEnter: options.onEnter,
        onLeave: options.onLeave,
        onComplete: options.onComplete,
      },
    })

    return { scrollTrigger: tween.scrollTrigger, tween }
  }

  /**
   * Create rotation animation
   */
  const createRotateAnimation = (options: any) => {
    const { gsap } = window as any
    const element = options.element
    const duration = options.duration || 0.8
    const startRotation = options.startRotation || 15

    // Set initial state
    gsap.set(element, {
      autoAlpha: 0,
      rotation: startRotation,
      transformOrigin: 'center center',
    })

    // Create the animation
    const tween = gsap.to(element, {
      duration,
      autoAlpha: 1,
      rotation: 0,
      ease: options.ease || 'power2.out',
      scrollTrigger: {
        trigger: options.trigger || element,
        start: options.start || 'top 80%',
        end: options.end || 'bottom 20%',
        toggleActions: 'play none none reverse',
        markers: options.markers || false,
        scrub: options.scrub || false,
        onEnter: options.onEnter,
        onLeave: options.onLeave,
        onComplete: options.onComplete,
      },
    })

    return { scrollTrigger: tween.scrollTrigger, tween }
  }

  /**
   * Create bounce animation
   */
  const createBounceAnimation = (options: any) => {
    const { gsap } = window as any
    const element = options.element
    const duration = options.duration || 1.2

    // Set initial state
    gsap.set(element, {
      autoAlpha: 0,
      y: 30,
      scale: 0.9,
    })

    // Create the animation
    const tween = gsap.to(element, {
      duration,
      autoAlpha: 1,
      y: 0,
      scale: 1,
      ease: 'elastic.out(1, 0.5)',
      scrollTrigger: {
        trigger: options.trigger || element,
        start: options.start || 'top 80%',
        end: options.end || 'bottom 20%',
        toggleActions: 'play none none reverse',
        markers: options.markers || false,
        scrub: options.scrub || false,
        onEnter: options.onEnter,
        onLeave: options.onLeave,
        onComplete: options.onComplete,
      },
    })

    return { scrollTrigger: tween.scrollTrigger, tween }
  }

  /**
   * Manually trigger animation (useful for programmatic control)
   */
  const triggerAnimation = () => {
    if (!tween.value) return

    tween.value.play()
    animated.value = true
    emit('enter')
  }

  /**
   * Reset animation to initial state
   */
  const resetAnimation = () => {
    if (!tween.value) return

    tween.value.pause(0)
    animated.value = false
  }

  // Setup animations on mount
  onMounted(() => {
    // Check for reduced motion preference
    reduceMotion.value = checkReducedMotion()

    // Apply animations after component has fully mounted
    nextTick(() => {
      if (props.animateOnView) {
        setTimeout(() => {
          applyAnimation()
        }, props.delay)
      } else {
        // Initialize but don't trigger the animation yet
        initialized.value = true
      }
    })
  })

  // Watch for changes in key props and re-initialize if needed
  watch(
    () => [props.type, props.startPosition, props.endPosition, props.threshold],
    () => {
      // Clean up existing animations
      cleanup()

      // Re-apply animations
      nextTick(() => {
        applyAnimation()
      })
    }
  )

  /**
   * Clean up animations and event listeners
   */
  const cleanup = () => {
    if (scrollTrigger.value) {
      scrollTrigger.value.kill()
      scrollTrigger.value = null
    }

    if (tween.value) {
      tween.value.kill()
      tween.value = null
    }
  }

  // Clean up on unmount
  onBeforeUnmount(() => {
    cleanup()
  })

  // Expose methods to parent component
  defineExpose({
    triggerAnimation,
    resetAnimation,
    animated,
    initialized,
  })
</script>

<style scoped>
  .scroll-animation-wrapper {
    /* Default initial state for animations */
    opacity: 0;
    will-change: opacity, transform;
  }

  /* For stagger animations, make sure children are visible but initially hidden */
  .scroll-animation-wrapper[data-animation='stagger'] {
    opacity: 1;
  }

  .scroll-animation-wrapper[data-animation='stagger'] > * {
    opacity: 0;
    will-change: opacity, transform;
  }

  /* For parallax, make sure the element is visible */
  .scroll-animation-wrapper[data-animation='parallax'] {
    opacity: 1;
    overflow: hidden;
  }

  /* Special case for image containers to ensure they don't hide content */
  .scroll-animation-wrapper :deep(img) {
    opacity: 1;
  }

  /* When animation is complete */
  .scroll-animation-wrapper.animated {
    opacity: 1;
  }

  /* Users with reduced motion preferences */
  .scroll-animation-wrapper.reduced-motion {
    opacity: 1;
    transform: none !important;
    transition: none !important;
  }

  .scroll-animation-wrapper.reduced-motion > * {
    opacity: 1;
    transform: none !important;
    transition: none !important;
  }

  /* Animation specific styles */
  .scroll-animation-wrapper.animation-reveal {
    opacity: 1;
    overflow: hidden;
  }

  .scroll-animation-wrapper.animation-flip {
    transform-style: preserve-3d;
    perspective: 800px;
  }

  /* Adjust for high contrast mode */
  @media (forced-colors: active) {
    .scroll-animation-wrapper {
      opacity: 1 !important;
      transform: none !important;
    }
    .scroll-animation-wrapper > * {
      opacity: 1 !important;
      transform: none !important;
    }
  }
</style>
