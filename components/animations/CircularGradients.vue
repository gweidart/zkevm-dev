<template>
  <div
    class="animated-background"
    :class="{ 'reduced-motion': reduceMotion }"
    :style="containerStyles"
  >
    <div
      v-for="(_, index) in circles"
      :key="`circle-${index}`"
      :ref="
        el => {
          if (el) circleRefs[index] = el as HTMLElement
        }
      "
      class="circle-gradient"
      :style="getCircleStyles(index)"
    ></div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, onBeforeUnmount, computed, watch } from 'vue'
  import gsap from 'gsap'

  /**
   * Circular gradient animation configuration
   */
  interface CircleConfig {
    /** Scale factor for the circle */
    scale: number
    /** Base opacity of the circle */
    opacity: number
    /** Animation duration in seconds */
    duration: number
    /** Animation delay in seconds */
    delay: number
    /** Color of the gradient (CSS color value) */
    color: string
    /** Inner transparent area (percentage) */
    innerTransparent: number
    /** Outer solid area (percentage) */
    outerSolid: number
  }

  /**
   * Component props
   */
  interface Props {
    /** Number of gradient circles to render */
    count?: number
    /** Base color for gradients (will be overridden by individual circle configs) */
    baseColor?: string
    /** Whether animation should play or be paused */
    play?: boolean
    /** Maximum scale factor for animations */
    maxScale?: number
    /** Minimum scale factor for animations */
    minScale?: number
    /** Z-index of the container */
    zIndex?: number
    /** Custom configurations for individual circles */
    circleConfigs?: CircleConfig[]
    /** Position offset X (percentage) */
    offsetX?: number
    /** Position offset Y (percentage) */
    offsetY?: number
    /** Whether to respect reduced motion preferences */
    respectReducedMotion?: boolean
  }

  // Default values for props
  const props = withDefaults(defineProps<Props>(), {
    count: 3,
    baseColor: 'var(--color-surface, #051a23)',
    play: true,
    maxScale: 1.2,
    minScale: 0.6,
    zIndex: 0,
    circleConfigs: () => [],
    offsetX: 0,
    offsetY: 0,
    respectReducedMotion: true,
  })

  // Define events that can be emitted
  const emit = defineEmits<{
    /** Animation has started */
    (e: 'animation-start'): void
    /** Animation has been paused */
    (e: 'animation-pause'): void
    /** Animation has been resumed */
    (e: 'animation-resume'): void
  }>()

  // References and state
  const circleRefs = ref<HTMLElement[]>([])
  const animations = ref<gsap.core.Timeline[]>([])
  const isAnimating = ref(false)
  const reduceMotion = ref(false)

  /**
   * Generate default circle configurations
   */
  const generateDefaultCircleConfigs = (): CircleConfig[] => {
    const configs: CircleConfig[] = []

    for (let i = 0; i < props.count; i++) {
      const scale =
        props.maxScale - (props.maxScale - props.minScale) * (i / Math.max(1, props.count - 1))

      configs.push({
        scale: scale,
        opacity: 0.6 - i * 0.15,
        duration: 10 + i * 2,
        delay: i * 2,
        color: props.baseColor,
        innerTransparent: 10 + i * 10,
        outerSolid: 70 - i * 10,
      })
    }

    return configs
  }

  /**
   * Computed circle configurations, combining defaults with custom configs
   */
  const circles = computed((): CircleConfig[] => {
    const defaultConfigs = generateDefaultCircleConfigs()

    if (props.circleConfigs.length === 0) {
      return defaultConfigs
    }

    // Merge custom configs with defaults for the number of circles requested
    return Array.from({ length: props.count }, (_, index) => {
      if (index < props.circleConfigs.length) {
        return { ...defaultConfigs[index], ...props.circleConfigs[index] }
      }
      return defaultConfigs[index]
    })
  })

  /**
   * Computed styles for the container
   */
  const containerStyles = computed(() => {
    return {
      '--z-index': props.zIndex.toString(),
      '--offset-x': `${props.offsetX}%`,
      '--offset-y': `${props.offsetY}%`,
    }
  })

  /**
   * Get styles for a specific circle
   */
  const getCircleStyles = (index: number): Record<string, string> => {
    const circle = circles.value[index]
    if (!circle) return {}

    const baseScale = 1 - index * 0.2
    const translateX = -50 + (index % 2 === 0 ? -2 : 2)
    const translateY = -50 + (index % 2 === 0 ? -2 : 2)

    return {
      background: `radial-gradient(circle at center, 
                 transparent ${circle.innerTransparent}%, 
                 ${circle.color} ${circle.outerSolid}%)`,
      opacity: circle.opacity.toString(),
      transform: `translate(${translateX}%, ${translateY}%) scale(${baseScale})`,
      willChange: 'transform, opacity',
    }
  }

  /**
   * Check if reduced motion is preferred
   */
  const checkReducedMotion = (): boolean => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }

  /**
   * Initialize animations
   */
  const initializeAnimations = () => {
    if (!props.play || (reduceMotion.value && props.respectReducedMotion)) {
      return
    }

    // Create and store timelines
    animations.value = circles.value.map((circle, index) => {
      const timeline = gsap.timeline({
        repeat: -1,
        yoyo: true,
        paused: !props.play,
        onStart: () => {
          if (index === 0) emit('animation-start')
        },
      })

      // Create animation for each circle
      if (circleRefs.value[index]) {
        timeline.to(circleRefs.value[index], {
          scale: circle.scale,
          opacity: circle.opacity,
          duration: circle.duration,
          ease: 'sine.inOut',
          delay: circle.delay,
        })
      }

      return timeline
    })

    isAnimating.value = props.play
  }

  /**
   * Pause all animations
   */
  const pauseAnimations = () => {
    animations.value.forEach(timeline => {
      if (timeline) {
        timeline.pause()
      }
    })

    isAnimating.value = false
    emit('animation-pause')
  }

  /**
   * Resume all animations
   */
  const resumeAnimations = () => {
    if (reduceMotion.value && props.respectReducedMotion) return

    animations.value.forEach(timeline => {
      if (timeline) {
        timeline.play()
      }
    })

    isAnimating.value = true
    emit('animation-resume')
  }

  /**
   * Clean up animations
   */
  const cleanupAnimations = () => {
    animations.value.forEach(timeline => {
      if (timeline) {
        timeline.kill()
      }
    })

    animations.value = []
    isAnimating.value = false
  }

  // Watch for changes in the play prop
  watch(
    () => props.play,
    play => {
      if (play && !isAnimating.value) {
        resumeAnimations()
      } else if (!play && isAnimating.value) {
        pauseAnimations()
      }
    }
  )

  // Watch for changes in configuration properties
  watch(
    [() => props.count, () => props.baseColor, () => props.circleConfigs],
    () => {
      cleanupAnimations()
      initializeAnimations()
    },
    { deep: true }
  )

  // Initialize animation on component mount
  onMounted(() => {
    // Check for reduced motion preference
    reduceMotion.value = checkReducedMotion()

    // Initialize the animations after a short delay to ensure DOM is ready
    setTimeout(() => {
      initializeAnimations()
    }, 100)
  })

  // Clean up GSAP animations when component is unmounted
  onBeforeUnmount(() => {
    cleanupAnimations()
  })

  // Expose methods and state for parent components
  defineExpose({
    pauseAnimations,
    resumeAnimations,
    isAnimating,
  })
</script>

<style scoped>
  .animated-background {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    z-index: var(--z-index, 0);
    pointer-events: none;
    transform: translate(var(--offset-x, 0), var(--offset-y, 0));
  }

  .circle-gradient {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 100%;
    height: 100%;
    border-radius: 50%;
    mix-blend-mode: multiply;
    transition: opacity 0.3s ease;
  }

  /* Optimize performance with will-change */
  .circle-gradient {
    will-change: transform, opacity;
    backface-visibility: hidden;
    perspective: 1000px;
    transform-style: preserve-3d;
  }

  /* Support for reduced motion */
  .reduced-motion .circle-gradient {
    transition: none !important;
    animation: none !important;
  }

  /* Better performance on Safari */
  @supports (-webkit-backdrop-filter: none) {
    .circle-gradient {
      transform: translateZ(0);
    }
  }

  /* High contrast mode */
  @media (forced-colors: active) {
    .circle-gradient {
      forced-color-adjust: none;
    }
  }

  /* Reduce animation intensity for prefers-reduced-motion */
  @media (prefers-reduced-motion: reduce) {
    .circle-gradient {
      transition-duration: 0.1s;
    }
  }
</style>
