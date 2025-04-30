/**
 * Scroll Animation Utilities
 *
 * A collection of GSAP-powered scroll animation utilities for creating engaging
 * and performant scroll-based animations throughout the application.
 */

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Animation types
export type AnimationType = 'fadeIn' | 'fadeInUp' | 'reveal' | 'scale' | 'parallax' | 'stagger'

// Easing options
export type EasingOption =
  | 'power1'
  | 'power2'
  | 'power3'
  | 'power4'
  | 'back'
  | 'elastic'
  | 'bounce'
  | 'circ'
  | 'expo'
  | 'sine'

// Direction options
export type DirectionOption = 'up' | 'down' | 'left' | 'right'

// Toggle actions for scroll triggers
export type ToggleAction =
  | 'play'
  | 'pause'
  | 'resume'
  | 'reset'
  | 'restart'
  | 'complete'
  | 'reverse'
  | 'none'

// Stagger from options
export type StaggerFrom = 'start' | 'center' | 'end' | 'edges'

// Initialize ScrollTrigger
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

/**
 * Base configuration for scroll-triggered animations
 */
export interface ScrollAnimationOptions {
  /** Element to animate */
  element: HTMLElement | null
  /** Element that triggers the animation (defaults to element) */
  trigger?: HTMLElement | null
  /** Position of trigger and viewport where animation should start */
  start?: string
  /** Position of trigger and viewport where animation should end */
  end?: string
  /** Whether the animation should be tied to scroll position */
  scrub?: boolean | number
  /** Show debug markers (development only) */
  markers?: boolean
  /** Controls how animation behaves on enter/leave/re-enter */
  toggleActions?: string
  /** Animation duration in seconds */
  duration?: number
  /** Animation delay in seconds */
  delay?: number
  /** Easing function for the animation */
  ease?: string
  /** Callback when animation starts */
  onStart?: () => void
  /** Callback when animation completes */
  onComplete?: () => void
  /** Enable or disable the animation */
  enabled?: boolean
  /** Support for reduced motion preferences */
  respectReducedMotion?: boolean
  /** Animation refresh on resize */
  refreshOnResize?: boolean
}

/**
 * Fade animation options
 */
export interface FadeAnimationOptions extends ScrollAnimationOptions {
  /** Initial opacity (0-1) */
  fromOpacity?: number
  /** Target opacity (0-1) */
  toOpacity?: number
  /** Animation direction */
  direction?: DirectionOption
  /** Distance to move in pixels */
  distance?: number
}

/**
 * Scale animation options
 */
export interface ScaleAnimationOptions extends ScrollAnimationOptions {
  /** Initial scale value */
  fromScale?: number
  /** Target scale value */
  toScale?: number
  /** Also fade in while scaling */
  withFade?: boolean
}

/**
 * Parallax animation options
 */
export interface ParallaxOptions extends ScrollAnimationOptions {
  /** Percentage to move vertically (-100 to 100) */
  yPercent?: number
  /** Parallax speed multiplier */
  speed?: number
  /** Pin element during parallax */
  pin?: boolean
}

/**
 * Stagger animation options for multiple elements
 */
export interface StaggerOptions {
  /** Elements to animate */
  elements: HTMLElement[] | NodeListOf<Element> | null
  /** Element that triggers the animation */
  trigger?: HTMLElement | null
  /** Position of trigger and viewport where animation should start */
  start?: string
  /** Position of trigger and viewport where animation should end */
  end?: string
  /** Whether the animation should be tied to scroll position */
  scrub?: boolean | number
  /** Show debug markers (development only) */
  markers?: boolean
  /** Controls how animation behaves on enter/leave/re-enter */
  toggleActions?: string
  /** Animation duration in seconds */
  duration?: number
  /** Animation delay in seconds */
  delay?: number
  /** Easing function for the animation */
  ease?: string
  /** Callback when animation starts */
  onStart?: () => void
  /** Callback when animation completes */
  onComplete?: () => void
  /** Enable or disable the animation */
  enabled?: boolean
  /** Support for reduced motion preferences */
  respectReducedMotion?: boolean
  /** Time between each element's animation */
  staggerAmount?: number
  /** Stagger from center instead of start */
  fromCenter?: boolean
  /** Stagger from end instead of start */
  fromEnd?: boolean
}

/**
 * Helper to safely create scroll animations, checking for client-side execution
 * and reduced motion preferences
 */
function createScrollAnimation<T extends ScrollAnimationOptions>(
  options: T,
  createAnimation: (options: T) => ScrollTrigger | null
): ScrollTrigger | null {
  // Server-side rendering check
  if (typeof window === 'undefined') return null

  // Check for null/undefined element
  if (!options.element) return null

  // Check for reduced motion preference if enabled
  if (
    options.respectReducedMotion !== false &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    // If reduced motion is preferred, set final state without animation
    gsap.set(options.element, {
      opacity: 1,
      y: 0,
      x: 0,
      scale: 'toScale' in options ? Number(options.toScale) : 1,
    })
    return null
  }

  // Create the animation
  return createAnimation(options)
}

/**
 * Helper to safely create stagger animations
 */
function createStaggerAnimation(
  options: StaggerOptions,
  createAnimation: (options: StaggerOptions) => ScrollTrigger | null
): ScrollTrigger | null {
  // Server-side rendering check
  if (typeof window === 'undefined') return null

  // Check for null/undefined elements
  if (!options.elements || !options.elements.length) return null

  // Check for reduced motion preference if enabled
  if (
    options.respectReducedMotion !== false &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    // If reduced motion is preferred, set final state without animation
    gsap.set(options.elements, { opacity: 1, y: 0, x: 0 })
    return null
  }

  // Create the animation
  return createAnimation(options)
}

/**
 * Create a fade animation that triggers on scroll
 */
export function fadeOnScroll(options: FadeAnimationOptions): ScrollTrigger | null {
  return createScrollAnimation(options, opts => {
    const {
      element,
      trigger = element,
      start = 'top 80%',
      end = 'bottom 20%',
      scrub = false,
      markers = false,
      toggleActions = 'play none none none',
      duration = 1,
      delay = 0,
      ease = 'power2.out',
      fromOpacity = 0,
      toOpacity = 1,
      direction,
      distance = 50,
      onStart,
      onComplete,
    } = opts

    // Configure direction-based properties
    const directionProps: Record<string, number> = {}
    if (direction) {
      switch (direction) {
        case 'up':
          directionProps.y = distance
          break
        case 'down':
          directionProps.y = -distance
          break
        case 'left':
          directionProps.x = distance
          break
        case 'right':
          directionProps.x = -distance
          break
      }
    }

    // Create the animation
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger,
        start,
        end,
        scrub,
        markers,
        toggleActions,
      },
      delay,
      onStart,
      onComplete,
    })

    // Add the fade animation
    tl.fromTo(
      element,
      {
        opacity: fromOpacity,
        ...directionProps,
      },
      {
        opacity: toOpacity,
        x: 0,
        y: 0,
        duration,
        ease,
      }
    )

    return tl.scrollTrigger || null
  })
}

/**
 * Create a fade-in-up animation that triggers on scroll
 */
export function fadeInUpOnScroll(
  options: Omit<FadeAnimationOptions, 'direction'>
): ScrollTrigger | null {
  return fadeOnScroll({
    ...options,
    direction: 'up',
  })
}

/**
 * Create a reveal text animation that triggers on scroll
 */
export function revealTextOnScroll(options: ScrollAnimationOptions): ScrollTrigger | null {
  return createScrollAnimation(options, opts => {
    const {
      element,
      trigger = element,
      start = 'top 80%',
      end = 'bottom 20%',
      scrub = false,
      markers = false,
      toggleActions = 'play none none none',
      duration = 1,
      delay = 0,
      ease = 'power3.out',
      onStart,
      onComplete,
    } = opts

    // Ensure element has overflow hidden parent
    const parent = element?.parentElement
    if (parent && element) {
      // Create a wrapper if needed
      if (window.getComputedStyle(parent).overflow !== 'hidden') {
        const wrapper = document.createElement('div')
        wrapper.style.overflow = 'hidden'
        parent.insertBefore(wrapper, element)
        wrapper.appendChild(element)
      }
    }

    // Create the animation
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger,
        start,
        end,
        scrub,
        markers,
        toggleActions,
      },
      delay,
      onStart,
      onComplete,
    })

    // Add the text reveal animation
    tl.fromTo(
      element,
      {
        y: '100%',
        opacity: 0,
      },
      {
        y: '0%',
        opacity: 1,
        duration,
        ease,
      }
    )

    return tl.scrollTrigger || null
  })
}

/**
 * Create a scale animation that triggers on scroll
 */
export function scaleOnScroll(options: ScaleAnimationOptions): ScrollTrigger | null {
  return createScrollAnimation(options, opts => {
    const {
      element,
      trigger = element,
      start = 'top 80%',
      end = 'bottom 20%',
      scrub = false,
      markers = false,
      toggleActions = 'play none none none',
      duration = 1,
      delay = 0,
      ease = 'power2.out',
      fromScale = 0.9,
      toScale = 1,
      withFade = true,
      onStart,
      onComplete,
    } = opts

    // Create the animation
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger,
        start,
        end,
        scrub,
        markers,
        toggleActions,
      },
      delay,
      onStart,
      onComplete,
    })

    // Add the scale animation
    tl.fromTo(
      element,
      {
        scale: fromScale,
        opacity: withFade ? 0 : 1,
      },
      {
        scale: toScale,
        opacity: 1,
        duration,
        ease,
      }
    )

    return tl.scrollTrigger || null
  })
}

/**
 * Create a stagger animation for multiple elements
 */
export function staggerElementsOnScroll(options: StaggerOptions): ScrollTrigger | null {
  return createStaggerAnimation(options, opts => {
    const {
      elements,
      trigger = elements && elements.length > 0 ? (elements[0] as HTMLElement) : null,
      start = 'top 80%',
      end = 'bottom 20%',
      scrub = false,
      markers = false,
      toggleActions = 'play none none none',
      duration = 1,
      delay = 0,
      ease = 'power2.out',
      staggerAmount = 0.1,
      fromCenter = false,
      fromEnd = false,
      onStart,
      onComplete,
    } = opts

    if (!elements || !elements.length || !trigger) return null

    // Create the animation
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger,
        start,
        end,
        scrub,
        markers,
        toggleActions,
      },
      delay,
      onStart,
      onComplete,
    })

    // Determine stagger starting position
    let from: StaggerFrom = 'start'
    if (fromEnd) from = 'end'
    else if (fromCenter) from = 'center'

    // Add the staggered animation
    tl.fromTo(
      elements,
      {
        y: 30,
        opacity: 0,
      },
      {
        y: 0,
        opacity: 1,
        duration,
        stagger: {
          amount: staggerAmount,
          from,
        },
        ease,
      }
    )

    return tl.scrollTrigger || null
  })
}

/**
 * Create a parallax effect on scroll
 */
export function parallaxOnScroll(options: ParallaxOptions): ScrollTrigger | null {
  return createScrollAnimation(options, opts => {
    const {
      element,
      trigger = element?.parentElement || element,
      start = 'top bottom',
      end = 'bottom top',
      scrub = true,
      markers = false,
      yPercent = -20,
      speed = 1,
      pin = false,
      refreshOnResize = true,
    } = opts

    if (!element || !trigger) return null

    // Create the parallax effect
    const st = ScrollTrigger.create({
      trigger,
      start,
      end,
      scrub,
      markers,
      pin,
      refreshPriority: 1,
      invalidateOnRefresh: refreshOnResize,
      onUpdate: self => {
        const progress = self.progress * speed
        gsap.to(element, {
          y: yPercent * progress,
          ease: 'none',
          overwrite: 'auto',
        })
      },
    })

    return st
  })
}

/**
 * Kill and clean up all ScrollTrigger instances when no longer needed
 */
export function killAllScrollTriggers(): void {
  if (typeof window !== 'undefined') {
    ScrollTrigger.getAll().forEach(st => st.kill())
  }
}

/**
 * Refresh all ScrollTrigger instances (useful after DOM changes)
 */
export function refreshAllScrollTriggers(): void {
  if (typeof window !== 'undefined') {
    ScrollTrigger.refresh()
  }
}

/**
 * Create a batch of animations with same configuration
 */
export function batchScrollAnimations(
  elements: NodeListOf<Element> | HTMLElement[] | null,
  type: AnimationType = 'fadeInUp',
  options: Partial<ScrollAnimationOptions> = {}
): ScrollTrigger[] {
  if (!elements || !elements.length || typeof window === 'undefined') return []

  // Array to store created triggers
  const triggers: ScrollTrigger[] = []

  // Process each element
  Array.from(elements).forEach(el => {
    const element = el as HTMLElement
    let trigger: ScrollTrigger | null = null

    // Apply the correct animation type
    switch (type) {
      case 'fadeIn':
        trigger = fadeOnScroll({ element, ...options } as FadeAnimationOptions)
        break
      case 'fadeInUp':
        trigger = fadeInUpOnScroll({ element, ...options } as FadeAnimationOptions)
        break
      case 'reveal':
        trigger = revealTextOnScroll({ element, ...options })
        break
      case 'scale':
        trigger = scaleOnScroll({ element, ...options } as ScaleAnimationOptions)
        break
      case 'parallax':
        trigger = parallaxOnScroll({ element, ...options } as ParallaxOptions)
        break
    }

    // Store the created trigger
    if (trigger) {
      triggers.push(trigger)
    }
  })

  return triggers
}
