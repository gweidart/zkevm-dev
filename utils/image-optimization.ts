/**
 * Image Optimization Utilities
 *
 * A collection of utilities for optimizing and managing images
 * for better performance and responsive behavior.
 */

/**
 * Supported image formats
 */
export type ImageFormat = 'webp' | 'avif' | 'jpg' | 'png'

/**
 * Image loading strategy
 */
export type ImageLoading = 'lazy' | 'eager'

/**
 * Image decoding strategy
 */
export type ImageDecoding = 'async' | 'sync' | 'auto'

/**
 * Configuration options for responsive image generation
 */
export interface ResponsiveImageOptions {
  /** Base path to the image without extension */
  basePath: string
  /** Alt text for accessibility */
  alt: string
  /** Original image width in pixels */
  width: number
  /** Original image height in pixels */
  height: number
  /** Array of widths to generate for srcSet (default: [320, 640, 960, 1280, 1920]) */
  sizes?: number[]
  /** Primary image format (default: 'webp') */
  format?: ImageFormat
  /** Fallback image format for browsers without support (default: 'jpg') */
  fallbackFormat?: ImageFormat
  /** Loading strategy (default: 'lazy') */
  loading?: ImageLoading
  /** Decoding strategy (default: 'async') */
  decoding?: ImageDecoding
  /** CSS sizes attribute (default responsive strategy) */
  sizesAttr?: string
  /** Priority loading for LCP images (default: false) */
  priority?: boolean
  /** Quality of the generated images (1-100, default: 80) */
  quality?: number
  /** Force specific aspect ratio (for logos, etc.) */
  forceAspectRatio?: string
}

/**
 * Responsive image properties for use in <img> elements
 */
export interface ResponsiveImageProps {
  /** Primary image source */
  src: string
  /** Responsive source set */
  srcset: string
  /** Sizes attribute */
  sizes: string
  /** Alternative text for accessibility */
  alt: string
  /** Image width */
  width: number
  /** Image height */
  height: number
  /** Loading strategy */
  loading: ImageLoading
  /** Decoding strategy */
  decoding: ImageDecoding
  /** Style attributes */
  style: {
    /** Aspect ratio to prevent layout shifts */
    aspectRatio: string
    /** Object fit property */
    objectFit?: string
    /** Object position property */
    objectPosition?: string
  }
  /** Data-* attributes */
  'data-format'?: string
  /** Optional priority attribute for Next.js */
  priority?: boolean
}

/**
 * Generate srcset for responsive images
 *
 * @param basePath - Base path to the image without extension
 * @param sizes - Array of sizes for srcset
 * @param format - Image format (default: webp)
 * @param quality - Image quality (1-100, default: 80)
 * @returns Srcset string for responsive images
 */
export function generateSrcSet(
  basePath: string,
  sizes: number[] = [320, 640, 960, 1280, 1920],
  format: ImageFormat = 'webp',
  quality: number = 80
): string {
  // Ensure quality is within valid range
  const validQuality = Math.max(1, Math.min(100, quality))

  return sizes.map(size => `${basePath}-${size}.${format}?q=${validQuality} ${size}w`).join(', ')
}

/**
 * Generate image sources for <picture> element with multiple formats
 *
 * @param basePath - Base path to the image without extension
 * @param sizes - Array of sizes for srcset
 * @param formats - Array of formats to generate (default: ['webp', 'avif'])
 * @param quality - Image quality (1-100, default: 80)
 * @returns Array of source objects for <picture> element
 */
export function generatePictureSources(
  basePath: string,
  sizes: number[] = [320, 640, 960, 1280, 1920],
  formats: ImageFormat[] = ['webp', 'avif'],
  quality: number = 80
): Array<{ srcset: string; type: string }> {
  return formats.map(format => ({
    srcset: generateSrcSet(basePath, sizes, format, quality),
    type: `image/${format}`,
  }))
}

/**
 * Generate a placeholder image for lazy loading images
 *
 * @param width - Placeholder width
 * @param height - Placeholder height
 * @param color - Placeholder color (default: #1e2d3a)
 * @param blur - Add blur filter to placeholder (default: false)
 * @returns Data URL for SVG placeholder
 */
export function generatePlaceholder(
  width: number,
  height: number,
  color: string = '#1e2d3a',
  blur: boolean = false
): string {
  // Create a simple SVG placeholder with optional blur
  const blurFilter = blur ? '<filter id="b"><feGaussianBlur stdDeviation="10" /></filter>' : ''

  const blurAttr = blur ? 'filter="url(#b)"' : ''

  const svg = `
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="${width}" 
      height="${height}" 
      viewBox="0 0 ${width} ${height}"
    >
      ${blurFilter}
      <rect width="100%" height="100%" fill="${color}" ${blurAttr} />
    </svg>
  `

  // Convert to base64 safely for browser environments and SSR
  const base64SVG =
    typeof Buffer !== 'undefined' ? Buffer.from(svg.trim()).toString('base64') : btoa(svg.trim())

  return `data:image/svg+xml;base64,${base64SVG}`
}

/**
 * Calculate aspect ratio for images
 *
 * @param width - Image width
 * @param height - Image height
 * @param simplify - Whether to simplify the ratio (default: true)
 * @param isLogo - Whether the image is a logo (forces 1:1 aspect for consistency)
 * @returns Aspect ratio string (e.g., "16/9")
 */
export function calculateAspectRatio(
  width: number,
  height: number,
  simplify: boolean = true,
  isLogo: boolean = false
): string {
  // For logos, typically we want to maintain consistent sizing
  if (isLogo) {
    return '1/1' // Force square aspect ratio for logos
  }

  if (!simplify) {
    return `${width}/${height}`
  }

  // Find greatest common divisor (GCD)
  const gcd = (a: number, b: number): number => {
    return b === 0 ? a : gcd(b, a % b)
  }

  const divisor = gcd(width, height)

  // Calculate simplified ratio
  const simplifiedWidth = width / divisor
  const simplifiedHeight = height / divisor

  // Only simplify if the resulting numbers are reasonable
  // (avoiding complex fractions like 1920/1080 -> 16/9)
  return simplifiedWidth <= 16 && simplifiedHeight <= 16
    ? `${simplifiedWidth}/${simplifiedHeight}`
    : `${width}/${height}`
}

/**
 * Generate responsive image properties for a given image path
 *
 * @param options - Configuration options for the responsive image
 * @returns Object with responsive image properties
 */
export function getResponsiveImageProps(options: ResponsiveImageOptions): ResponsiveImageProps {
  const {
    basePath,
    alt,
    width,
    height,
    sizes = [320, 640, 960, 1280, 1920],
    format = 'webp',
    loading = 'lazy',
    decoding = 'async',
    sizesAttr = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
    priority = false,
    quality = 80,
    forceAspectRatio,
  } = options

  // Determine if this is likely a logo (for partner logos)
  const isLogo =
    alt.toLowerCase().includes('logo') ||
    basePath.toLowerCase().includes('logo') ||
    basePath.toLowerCase().includes('partner')

  // Generate responsive image properties
  return {
    src: `${basePath}.${format}${quality < 100 ? `?q=${quality}` : ''}`,
    srcset: generateSrcSet(basePath, sizes, format, quality),
    sizes: sizesAttr,
    alt,
    width,
    height,
    loading: priority ? 'eager' : loading,
    decoding,
    style: {
      aspectRatio: forceAspectRatio || calculateAspectRatio(width, height, true, isLogo),
      // For logos, ensure they maintain their original appearance
      ...(isLogo
        ? {
            objectFit: 'contain',
            objectPosition: 'center',
          }
        : {}),
    },
    'data-format': format,
    ...(priority ? { priority: true } : {}),
  }
}

/**
 * Build a complete <picture> element with multiple formats and fallbacks
 *
 * @param options - Configuration options for the responsive image
 * @returns Object with source elements and img properties
 */
export function getPictureElementProps(options: ResponsiveImageOptions): {
  sources: Array<{ srcset: string; type: string; sizes: string }>
  imgProps: ResponsiveImageProps
} {
  const {
    basePath,
    alt,
    width,
    height,
    sizes = [320, 640, 960, 1280, 1920],
    fallbackFormat = 'jpg',
    loading = 'lazy',
    decoding = 'async',
    sizesAttr = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
    priority = false,
    quality = 80,
    forceAspectRatio,
  } = options

  // Modern formats in preferred order
  const modernFormats: ImageFormat[] = ['avif', 'webp']

  // Filter out the fallback format if it's in the formats list
  const usableFormats = modernFormats.filter(f => f !== fallbackFormat)

  // Generate sources for <picture> element
  const sources = usableFormats.map(imageFormat => ({
    srcset: generateSrcSet(basePath, sizes, imageFormat, quality),
    type: `image/${imageFormat}`,
    sizes: sizesAttr,
  }))

  // Generate fallback image properties
  const imgProps = getResponsiveImageProps({
    basePath,
    alt,
    width,
    height,
    sizes,
    format: fallbackFormat,
    loading,
    decoding,
    sizesAttr,
    priority,
    quality,
    forceAspectRatio,
  })

  return {
    sources,
    imgProps,
  }
}
