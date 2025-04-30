<!-- SectionTransition.vue - A flexible, animated section divider component -->
<template>
  <div
    ref="transitionRef"
    class="section-transition"
    :class="[`type-${type}`, { inverted: inverted, 'reduced-motion': reduceMotion }]"
    :style="containerStyles"
    aria-hidden="true"
  >
    <!-- Wave transition -->
    <svg
      v-if="type === 'wave'"
      class="transition-svg"
      preserveAspectRatio="none"
      viewBox="0 0 1440 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="presentation"
    >
      <path
        ref="wavePath"
        d="M0,50 C320,110 420,0 720,50 C1020,100 1120,20 1440,50 L1440,100 L0,100 Z"
        :fill="bottomColor"
      />
    </svg>

    <!-- ZigZag transition -->
    <svg
      v-else-if="type === 'zigzag'"
      class="transition-svg"
      preserveAspectRatio="none"
      viewBox="0 0 1440 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="presentation"
    >
      <path
        ref="zigzagPath"
        d="M0,40 L120,60 L240,40 L360,60 L480,40 L600,60 L720,40 L840,60 L960,40 L1080,60 L1200,40 L1320,60 L1440,40 L1440,100 L0,100 Z"
        :fill="bottomColor"
      />
    </svg>

    <!-- Curve transition -->
    <svg
      v-else-if="type === 'curve'"
      class="transition-svg"
      preserveAspectRatio="none"
      viewBox="0 0 1440 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="presentation"
    >
      <path
        ref="curvePath"
        d="M0,100 L1440,100 L1440,40 C1200,70 960,0 720,40 C480,80 240,10 0,40 L0,100 Z"
        :fill="bottomColor"
      />
    </svg>

    <!-- Triangle transition -->
    <svg
      v-else-if="type === 'triangle'"
      class="transition-svg"
      preserveAspectRatio="none"
      viewBox="0 0 1440 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="presentation"
    >
      <path ref="trianglePath" d="M0,100 L1440,100 L720,30 L0,100 Z" :fill="bottomColor" />
    </svg>

    <!-- Oval transition -->
    <svg
      v-else-if="type === 'oval'"
      class="transition-svg"
      preserveAspectRatio="none"
      viewBox="0 0 1440 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="presentation"
    >
      <path ref="ovalPath" d="M0,60 C480,0 960,0 1440,60 L1440,100 L0,100 Z" :fill="bottomColor" />
    </svg>

    <!-- Slope transition -->
    <svg
      v-else-if="type === 'slope'"
      class="transition-svg"
      preserveAspectRatio="none"
      viewBox="0 0 1440 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="presentation"
    >
      <path ref="slopePath" d="M0,0 L1440,60 L1440,100 L0,100 Z" :fill="bottomColor" />
    </svg>

    <!-- Bubbles transition -->
    <div v-else-if="type === 'bubbles'" class="bubbles-container">
      <div
        v-for="i in 8"
        :key="`bubble-${i}`"
        :ref="
          el => {
            if (el) bubbleRefs[i - 1] = el as HTMLElement
          }
        "
        class="bubble"
        :style="{
          backgroundColor: bottomColor,
          left: `${(i - 1) * 14 + Math.random() * 10}%`,
          width: `${30 + Math.random() * 40}px`,
          height: `${30 + Math.random() * 40}px`,
          animationDuration: `${3 + Math.random() * 3}s`,
          animationDelay: `${Math.random() * 2}s`,
        }"
      ></div>
    </div>

    <!-- Default/fallback: simple straight divider -->
    <div v-else class="straight-divider" :style="{ backgroundColor: bottomColor }"></div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
  import { gsap } from 'gsap'
  import { ScrollTrigger } from 'gsap/ScrollTrigger'

  // Register GSAP plugins
  gsap.registerPlugin(ScrollTrigger)

  /**
   * Transition types supported by the component
   */
  type TransitionType =
    | 'wave'
    | 'zigzag'
    | 'curve'
    | 'triangle'
    | 'slope'
    | 'oval'
    | 'bubbles'
    | 'straight'

  /**
   * Component properties
   */
  interface Props {
    /** Type of transition effect */
    type?: TransitionType
    /** Height of the transition in pixels */
    height?: number
    /** Color of the top section */
    topColor?: string
    /** Color of the bottom section */
    bottomColor?: string
    /** Whether to invert the transition direction */
    inverted?: boolean
    /** Animation speed multiplier (1 = normal, 2 = twice as fast) */
    speed?: number
    /** Whether the transition should animate on scroll */
    animateOnScroll?: boolean
    /** Transition horizontal offset in pixels */
    horizontalOffset?: number
    /** Easing function for animations */
    easing?: string
    /** Whether to respect reduced motion preferences */
    respectReducedMotion?: boolean
  }

  // Define component props with defaults
  const props = withDefaults(defineProps<Props>(), {
    type: 'wave',
    height: 120,
    topColor: 'var(--color-surface, #051a23)',
    bottomColor: 'var(--color-surface-variant, #072530)',
    inverted: false,
    speed: 1,
    animateOnScroll: true,
    horizontalOffset: 0,
    easing: 'sine.inOut',
    respectReducedMotion: true,
  })

  /**
   * Emitted events
   */
  const emit = defineEmits<{
    /** Animation has started */
    (e: 'animation-start'): void
    /** Animation is complete */
    (e: 'animation-complete'): void
  }>()

  // References for DOM elements
  const transitionRef = ref<HTMLElement | null>(null)
  const wavePath = ref<SVGPathElement | null>(null)
  const zigzagPath = ref<SVGPathElement | null>(null)
  const curvePath = ref<SVGPathElement | null>(null)
  const trianglePath = ref<SVGPathElement | null>(null)
  const ovalPath = ref<SVGPathElement | null>(null)
  const slopePath = ref<SVGPathElement | null>(null)
  const bubbleRefs = ref<HTMLElement[]>([])

  // Track active animations for cleanup
  const animations = ref<gsap.core.Timeline[]>([])
  const reduceMotion = ref(false)

  /**
   * Calculate animation duration based on speed
   */
  const duration = computed(() => 8 / props.speed)

  /**
   * Container styles based on props
   */
  const containerStyles = computed(() => {
    const styles: Record<string, string> = {
      height: `${props.height}px`,
      '--top-color': props.topColor,
      '--bottom-color': props.bottomColor,
      '--transition-speed': `${duration.value}s`,
    }

    if (props.horizontalOffset !== 0) {
      styles.transform = `translateX(${props.horizontalOffset}px)`
    }

    return styles
  })

  /**
   * Check if reduced motion is preferred
   */
  const checkReducedMotion = (): boolean => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }

  /**
   * Setup wave animation
   */
  const setupWaveAnimation = () => {
    if (!wavePath.value || !transitionRef.value) return

    // Skip animation for reduced motion preference
    if (reduceMotion.value && props.respectReducedMotion) return

    const tl = gsap.timeline({
      repeat: -1,
      yoyo: true,
      onStart: () => emit('animation-start'),
      onComplete: () => emit('animation-complete'),
    })

    // Add scroll trigger if animation on scroll is enabled
    if (props.animateOnScroll) {
      // Create ScrollTrigger and keep the returned instance
      const st = ScrollTrigger.create({
        trigger: transitionRef.value,
        start: 'top bottom',
        end: 'bottom top',
        toggleActions: 'play pause resume reset',
      })

      // Store the ScrollTrigger instance so we can reference it later for cleanup
      tl.vars = tl.vars || {}
      tl.vars._scrollTrigger = st
    }

    tl.to(wavePath.value, {
      duration: duration.value,
      attr: { d: 'M0,50 C320,20 420,100 720,50 C1020,0 1120,80 1440,50 L1440,100 L0,100 Z' },
      ease: props.easing,
    })

    animations.value.push(tl)
  }

  /**
   * Setup zigzag animation
   */
  const setupZigzagAnimation = () => {
    if (!zigzagPath.value || !transitionRef.value) return

    // Skip animation for reduced motion preference
    if (reduceMotion.value && props.respectReducedMotion) return

    const tl = gsap.timeline({
      repeat: -1,
      yoyo: true,
      onStart: () => emit('animation-start'),
    })

    // Add scroll trigger if animation on scroll is enabled
    if (props.animateOnScroll) {
      // Create ScrollTrigger and keep the returned instance
      const st = ScrollTrigger.create({
        trigger: transitionRef.value,
        start: 'top bottom',
        end: 'bottom top',
        toggleActions: 'play pause resume reset',
      })

      // Store the ScrollTrigger instance so we can reference it later for cleanup
      tl.vars = tl.vars || {}
      tl.vars._scrollTrigger = st
    }

    tl.to(zigzagPath.value, {
      duration: duration.value,
      attr: {
        d: 'M0,60 L120,40 L240,60 L360,40 L480,60 L600,40 L720,60 L840,40 L960,60 L1080,40 L1200,60 L1320,40 L1440,60 L1440,100 L0,100 Z',
      },
      ease: props.easing,
    })

    animations.value.push(tl)
  }

  /**
   * Setup curve animation
   */
  const setupCurveAnimation = () => {
    if (!curvePath.value || !transitionRef.value) return

    // Skip animation for reduced motion preference
    if (reduceMotion.value && props.respectReducedMotion) return

    const tl = gsap.timeline({
      repeat: -1,
      yoyo: true,
      onStart: () => emit('animation-start'),
    })

    // Add scroll trigger if animation on scroll is enabled
    if (props.animateOnScroll) {
      // Create ScrollTrigger and keep the returned instance
      const st = ScrollTrigger.create({
        trigger: transitionRef.value,
        start: 'top bottom',
        end: 'bottom top',
        toggleActions: 'play pause resume reset',
      })

      // Store the ScrollTrigger instance so we can reference it later for cleanup
      tl.vars = tl.vars || {}
      tl.vars._scrollTrigger = st
    }

    tl.to(curvePath.value, {
      duration: duration.value,
      attr: { d: 'M0,100 L1440,100 L1440,30 C1200,80 960,10 720,30 C480,50 240,0 0,30 L0,100 Z' },
      ease: props.easing,
    })

    animations.value.push(tl)
  }

  /**
   * Setup triangle animation (subtle movement)
   */
  const setupTriangleAnimation = () => {
    if (!trianglePath.value || !transitionRef.value) return

    // Skip animation for reduced motion preference
    if (reduceMotion.value && props.respectReducedMotion) return

    const tl = gsap.timeline({
      repeat: -1,
      yoyo: true,
      onStart: () => emit('animation-start'),
    })

    // Add scroll trigger if animation on scroll is enabled
    if (props.animateOnScroll) {
      // Create ScrollTrigger and keep the returned instance
      const st = ScrollTrigger.create({
        trigger: transitionRef.value,
        start: 'top bottom',
        end: 'bottom top',
        toggleActions: 'play pause resume reset',
      })

      // Store the ScrollTrigger instance so we can reference it later for cleanup
      tl.vars = tl.vars || {}
      tl.vars._scrollTrigger = st
    }

    tl.to(trianglePath.value, {
      duration: duration.value,
      attr: { d: 'M0,100 L1440,100 L720,20 L0,100 Z' },
      ease: props.easing,
    })

    animations.value.push(tl)
  }

  /**
   * Setup oval animation
   */
  const setupOvalAnimation = () => {
    if (!ovalPath.value || !transitionRef.value) return

    // Skip animation for reduced motion preference
    if (reduceMotion.value && props.respectReducedMotion) return

    const tl = gsap.timeline({
      repeat: -1,
      yoyo: true,
      onStart: () => emit('animation-start'),
    })

    // Add scroll trigger if animation on scroll is enabled
    if (props.animateOnScroll) {
      // Create ScrollTrigger and keep the returned instance
      const st = ScrollTrigger.create({
        trigger: transitionRef.value,
        start: 'top bottom',
        end: 'bottom top',
        toggleActions: 'play pause resume reset',
      })

      // Store the ScrollTrigger instance so we can reference it later for cleanup
      tl.vars = tl.vars || {}
      tl.vars._scrollTrigger = st
    }

    tl.to(ovalPath.value, {
      duration: duration.value,
      attr: { d: 'M0,40 C480,100 960,100 1440,40 L1440,100 L0,100 Z' },
      ease: props.easing,
    })

    animations.value.push(tl)
  }

  /**
   * Setup slope animation
   */
  const setupSlopeAnimation = () => {
    if (!slopePath.value || !transitionRef.value) return

    // Skip animation for reduced motion preference
    if (reduceMotion.value && props.respectReducedMotion) return

    const tl = gsap.timeline({
      repeat: -1,
      yoyo: true,
      onStart: () => emit('animation-start'),
    })

    // Add scroll trigger if animation on scroll is enabled
    if (props.animateOnScroll) {
      // Create ScrollTrigger and keep the returned instance
      const st = ScrollTrigger.create({
        trigger: transitionRef.value,
        start: 'top bottom',
        end: 'bottom top',
        toggleActions: 'play pause resume reset',
      })

      // Store the ScrollTrigger instance so we can reference it later for cleanup
      tl.vars = tl.vars || {}
      tl.vars._scrollTrigger = st
    }

    tl.to(slopePath.value, {
      duration: duration.value,
      attr: { d: 'M0,20 L1440,40 L1440,100 L0,100 Z' },
      ease: props.easing,
    })

    animations.value.push(tl)
  }

  /**
   * Setup bubbles animation
   */
  const setupBubblesAnimation = () => {
    if (bubbleRefs.value.length === 0 || !transitionRef.value) return

    // Skip animation for reduced motion preference
    if (reduceMotion.value && props.respectReducedMotion) return

    bubbleRefs.value.forEach((bubble, index) => {
      const tl = gsap.timeline({
        repeat: -1,
        onStart: index === 0 ? () => emit('animation-start') : undefined,
      })

      // Add scroll trigger if animation on scroll is enabled
      if (props.animateOnScroll) {
        // Create ScrollTrigger and keep the returned instance
        const st = ScrollTrigger.create({
          trigger: transitionRef.value,
          start: 'top bottom',
          end: 'bottom top',
          toggleActions: 'play pause resume reset',
        })

        // Store the ScrollTrigger instance so we can reference it later for cleanup
        tl.vars = tl.vars || {}
        tl.vars._scrollTrigger = st
      }

      // Random vertical movement
      tl.to(bubble, {
        y: `-${100 + Math.random() * 50}%`,
        x: `${(Math.random() - 0.5) * 20}%`,
        duration: 3 + Math.random() * 2,
        ease: 'power1.inOut',
        delay: Math.random() * 2,
      })

      animations.value.push(tl)
    })
  }

  /**
   * Initialize animations based on transition type
   */
  const initializeAnimations = () => {
    // Clear previous animations
    cleanupAnimations()

    // Set up new animations based on type
    switch (props.type) {
      case 'wave':
        setupWaveAnimation()
        break
      case 'zigzag':
        setupZigzagAnimation()
        break
      case 'curve':
        setupCurveAnimation()
        break
      case 'triangle':
        setupTriangleAnimation()
        break
      case 'oval':
        setupOvalAnimation()
        break
      case 'slope':
        setupSlopeAnimation()
        break
      case 'bubbles':
        setupBubblesAnimation()
        break
      // No animation for straight divider
    }
  }

  /**
   * Clean up animations to prevent memory leaks
   */
  const cleanupAnimations = () => {
    animations.value.forEach(animation => {
      // Access the stored ScrollTrigger instance if it exists
      if (animation.vars && animation.vars._scrollTrigger) {
        animation.vars._scrollTrigger.kill()
      }
      animation.kill()
    })
    animations.value = []
  }

  // Watch for prop changes to update animations
  watch(() => props.type, initializeAnimations)
  watch(() => props.speed, initializeAnimations)
  watch(() => props.animateOnScroll, initializeAnimations)
  watch(() => props.easing, initializeAnimations)

  onMounted(() => {
    // Check for reduced motion preference
    reduceMotion.value = checkReducedMotion()

    // Initialize bubble refs array
    if (props.type === 'bubbles') {
      bubbleRefs.value = new Array(8).fill(null)
    }

    // Set up animations after DOM is ready
    initializeAnimations()
  })

  onUnmounted(() => {
    // Clean up on component destruction
    cleanupAnimations()
  })
</script>

<style scoped>
  .section-transition {
    position: relative;
    width: 100%;
    overflow: hidden;
    z-index: 1;
    background-color: var(--top-color, var(--color-surface, #051a23));
  }

  /* SVG styling */
  .transition-svg {
    position: absolute;
    width: 100%;
    height: 100%;
    bottom: 0;
    left: 0;
    display: block;
    transform-origin: center;
    will-change: transform;
  }

  /* Inverted transitions - flip vertically */
  .section-transition.inverted .transition-svg {
    transform: scaleY(-1);
  }

  .section-transition.inverted .bubbles-container {
    transform: scaleY(-1);
    bottom: auto;
    top: 0;
  }

  /* Simple straight divider */
  .straight-divider {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 50%;
  }

  /* Bubbles animation */
  .bubbles-container {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  .bubble {
    position: absolute;
    bottom: -50px;
    border-radius: 50%;
    transform: translateY(0);
    opacity: 0.8;
  }

  /* Reduced motion */
  .section-transition.reduced-motion .transition-svg,
  .section-transition.reduced-motion .bubble {
    transition: none !important;
    animation: none !important;
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    .section-transition {
      height: calc(v-bind('props.height') * 0.7px) !important;
    }

    .bubble {
      transform: scale(0.7);
    }
  }

  @media (max-width: 480px) {
    .section-transition {
      height: calc(v-bind('props.height') * 0.5px) !important;
    }

    .bubble {
      transform: scale(0.5);
    }
  }

  /* High contrast mode support */
  @media (forced-colors: active) {
    .section-transition {
      forced-color-adjust: none;
    }

    .transition-svg path,
    .straight-divider,
    .bubble {
      fill: CanvasText !important;
      background-color: CanvasText !important;
    }
  }

  /* Prefers reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    .transition-svg,
    .bubble {
      transition: none !important;
      animation: none !important;
    }
  }
</style>
