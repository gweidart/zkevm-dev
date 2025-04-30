/**
 * Performance Utilities
 *
 * A collection of utilities for monitoring and optimizing the performance
 * of the application, particularly for animations and transitions.
 */

import { ref, onMounted, onUnmounted } from 'vue'
import type { Ref } from 'vue'

/**
 * Interface for FPS tracking return values
 */
interface FPSTrackingResult {
  /** Current frames per second */
  fps: Ref<number>
  /** Whether the performance is considered optimal (above threshold) */
  isOptimalPerformance: Ref<boolean>
  /** FPS history for trend analysis */
  fpsHistory: Ref<number[]>
  /** Average FPS over the sample period */
  averageFps: Ref<number>
  /** Lowest recorded FPS value */
  minFps: Ref<number>
  /** Highest recorded FPS value */
  maxFps: Ref<number>
}

/**
 * A composable for tracking the current frames per second (FPS) of the application
 *
 * @param updateInterval - Interval in ms to update the FPS count (default: 500ms)
 * @param historySize - Number of FPS samples to keep in history (default: 20)
 * @param optimalThreshold - FPS threshold for optimal performance (default: 50)
 * @returns An object with the current FPS and performance metrics
 */
export function useFPS(
  updateInterval = 500,
  historySize = 20,
  optimalThreshold = 50
): FPSTrackingResult {
  const fps = ref<number>(0)
  const isOptimalPerformance = ref<boolean>(true)
  const fpsHistory = ref<number[]>([])
  const averageFps = ref<number>(0)
  const minFps = ref<number>(60)
  const maxFps = ref<number>(0)

  const frames = ref<number>(0)
  let lastTime = performance.now()
  let animationFrameId: number | null = null
  let intervalId: number | null = null

  /**
   * Count frames for FPS calculation
   */
  const countFrames = (): void => {
    frames.value++
    animationFrameId = requestAnimationFrame(countFrames)
  }

  /**
   * Calculate and update FPS and related metrics
   */
  const calculateFPS = (): void => {
    const currentTime = performance.now()
    const elapsedTime = currentTime - lastTime

    if (elapsedTime > 0) {
      // Calculate current FPS
      const currentFps = Math.round((frames.value * 1000) / elapsedTime)
      fps.value = currentFps

      // Update FPS history
      fpsHistory.value.push(currentFps)
      if (fpsHistory.value.length > historySize) {
        fpsHistory.value.shift()
      }

      // Update min/max FPS
      minFps.value = Math.min(minFps.value, currentFps)
      maxFps.value = Math.max(maxFps.value, currentFps)

      // Calculate average FPS
      const sum = fpsHistory.value.reduce((acc, val) => acc + val, 0)
      averageFps.value = Math.round(sum / fpsHistory.value.length)

      // Update performance indicator
      isOptimalPerformance.value = currentFps >= optimalThreshold

      // Reset frame counter and update time
      frames.value = 0
      lastTime = currentTime
    }
  }

  onMounted(() => {
    if (typeof window !== 'undefined') {
      // Start counting frames
      animationFrameId = requestAnimationFrame(countFrames)

      // Set up interval to calculate FPS
      intervalId = window.setInterval(calculateFPS, updateInterval)
    }
  })

  onUnmounted(() => {
    // Clean up resources
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId)
    }

    if (intervalId !== null) {
      clearInterval(intervalId)
    }
  })

  return {
    fps,
    isOptimalPerformance,
    fpsHistory,
    averageFps,
    minFps,
    maxFps,
  }
}

/**
 * Options for debounce function
 */
interface DebounceOptions {
  /** Whether to execute immediately on the first call */
  immediate?: boolean
  /** Whether to use leading edge execution */
  leading?: boolean
  /** Whether to use trailing edge execution */
  trailing?: boolean
}

/**
 * Enhanced debounce function to limit how often a function can be called
 *
 * @param fn - Function to debounce
 * @param delay - Delay in ms
 * @param options - Additional options for controlling debounce behavior
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number,
  options: DebounceOptions = { leading: false, trailing: true }
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null
  let lastArgs: Parameters<T> | null = null

  return function (this: any, ...args: Parameters<T>): void {
    const context = this

    // Execute immediately if leading and no timer is set
    if (options.leading && !timeoutId) {
      fn.apply(context, args)
    }

    lastArgs = args

    // Clear existing timeout
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }

    // Set new timeout
    timeoutId = setTimeout(() => {
      if (options.trailing && lastArgs) {
        fn.apply(context, lastArgs)
      }
      timeoutId = null
      lastArgs = null
    }, delay)
  }
}

/**
 * Options for throttle function
 */
interface ThrottleOptions {
  /** Whether to execute on the leading edge */
  leading?: boolean
  /** Whether to execute on the trailing edge */
  trailing?: boolean
}

/**
 * Enhanced throttle function to limit how often a function can be called
 *
 * @param fn - Function to throttle
 * @param limit - Time limit in ms
 * @param options - Additional options for controlling throttle behavior
 * @returns Throttled function
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number,
  options: ThrottleOptions = { leading: true, trailing: true }
): (...args: Parameters<T>) => void {
  let lastTime = 0
  let timeoutId: ReturnType<typeof setTimeout> | null = null
  let lastArgs: Parameters<T> | null = null

  return function (this: any, ...args: Parameters<T>): void {
    const context = this
    const now = Date.now()
    const remaining = limit - (now - lastTime)

    lastArgs = args

    // Execute immediately if it's been longer than the limit or it's the first call with leading=true
    if (remaining <= 0 || remaining > limit) {
      if (timeoutId) {
        clearTimeout(timeoutId)
        timeoutId = null
      }

      if (options.leading) {
        lastTime = now
        fn.apply(context, args)
      }
    } else if (!timeoutId && options.trailing) {
      // Set timeout for trailing edge execution
      timeoutId = setTimeout(() => {
        lastTime = Date.now()
        timeoutId = null

        if (lastArgs) {
          fn.apply(context, lastArgs)
        }
      }, remaining)
    }
  }
}

/**
 * Interface for reduced motion result
 */
interface ReducedMotionResult {
  /** Whether reduced motion is preferred */
  prefersReducedMotion: Ref<boolean>
  /** Whether the device is a mobile/touch device */
  isTouchDevice: Ref<boolean>
  /** Screen width range category (xs, sm, md, lg, xl) */
  screenCategory: Ref<string>
}

/**
 * Utility to determine if reduced motion is preferred and device capabilities
 *
 * @returns Object with motion preferences and device capability information
 */
export function useReducedMotion(): ReducedMotionResult {
  const prefersReducedMotion = ref<boolean>(false)
  const isTouchDevice = ref<boolean>(false)
  const screenCategory = ref<string>('md')

  onMounted(() => {
    if (typeof window !== 'undefined') {
      // Check if the user prefers reduced motion
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
      prefersReducedMotion.value = mediaQuery.matches

      // Check if it's a touch device
      isTouchDevice.value =
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        (navigator as any).msMaxTouchPoints > 0

      // Determine screen category
      updateScreenCategory()

      // Update when the user's preference changes
      const updateMotionPreference = (event: MediaQueryListEvent): void => {
        prefersReducedMotion.value = event.matches
      }

      // Update screen category on resize
      const handleResize = throttle(() => {
        updateScreenCategory()
      }, 100)

      // Add event listeners
      mediaQuery.addEventListener('change', updateMotionPreference)
      window.addEventListener('resize', handleResize)

      // Clean up
      onUnmounted(() => {
        mediaQuery.removeEventListener('change', updateMotionPreference)
        window.removeEventListener('resize', handleResize)
      })
    }
  })

  /**
   * Update the screen category based on current viewport width
   */
  const updateScreenCategory = (): void => {
    const width = window.innerWidth

    if (width < 640) {
      screenCategory.value = 'xs'
    } else if (width < 768) {
      screenCategory.value = 'sm'
    } else if (width < 1024) {
      screenCategory.value = 'md'
    } else if (width < 1280) {
      screenCategory.value = 'lg'
    } else {
      screenCategory.value = 'xl'
    }
  }

  return {
    prefersReducedMotion,
    isTouchDevice,
    screenCategory,
  }
}
