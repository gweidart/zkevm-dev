/**
 * Color Utility Module
 *
 * This module provides color constants, helper functions, and type definitions
 * for working with the application's color scheme consistently.
 */

// Type for RGB color value
export interface RGB {
  r: number
  g: number
  b: number
}

// Type for RGBA color value
export interface RGBA extends RGB {
  a: number
}

// Type for HSL color value
export interface HSL {
  h: number
  s: number
  l: number
}

// Type for HSLA color value
export interface HSLA extends HSL {
  a: number
}

// Color palette constants
export const COLORS = {
  // Main background colors
  background: '#031118',
  surface: '#051a23',
  surfaceVariant: '#072530',

  // Brand/accent colors
  primary: '#16f08c',
  primaryVariant: '#0fd67d',
  secondary: '#d5b2c9',
  accent: '#d86475',

  // Text colors
  text: '#e6e6e6',
  textMuted: '#a8b0b3',

  // Border color
  border: '#193642',

  // Additional semantic colors
  success: '#4caf50',
  warning: '#ff9800',
  error: '#f44336',
  info: '#2196f3',
} as const

// Type definition for the color palette
export type ColorKey = keyof typeof COLORS

// Type definition for color formats
export type ColorFormat = 'hex' | 'rgb' | 'rgba' | 'hsl' | 'hsla'

/**
 * Gets a color value by its key
 *
 * @param key - The color key
 * @returns The color hex value
 */
export function getColor(key: ColorKey): string {
  return COLORS[key]
}

/**
 * Validates a hex color code
 *
 * @param color - The hex color code to validate
 * @returns Boolean indicating if the color is valid
 */
export function isValidHex(color: string): boolean {
  const hex = color.replace('#', '')
  return /^[0-9A-F]{6}$/i.test(hex) || /^[0-9A-F]{3}$/i.test(hex)
}

/**
 * Converts a hex color to RGB values
 *
 * @param color - The hex color code
 * @returns RGB object with r, g, b properties
 */
export function hexToRgb(color: string): RGB {
  // Validate and normalize hex
  if (!color.startsWith('#')) {
    color = `#${color}`
  }

  let hex = color.replace('#', '')

  // Convert shorthand hex (#RGB) to full form (#RRGGBB)
  if (hex.length === 3) {
    hex = hex
      .split('')
      .map(h => h + h)
      .join('')
  }

  if (!isValidHex(color)) {
    console.warn(`Invalid color hex code: ${color}`)
    return { r: 0, g: 0, b: 0 }
  }

  // Convert hex to RGB
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)

  return { r, g, b }
}

/**
 * Creates a semi-transparent version of a color
 *
 * @param color - The hex color code
 * @param opacity - Opacity value between 0 and 1
 * @returns RGBA color string
 */
export function hexToRgba(color: string, opacity: number): string {
  const { r, g, b } = hexToRgb(color)

  // Clamp opacity between 0 and 1
  const clampedOpacity = Math.max(0, Math.min(1, opacity))

  // Return rgba value
  return `rgba(${r}, ${g}, ${b}, ${clampedOpacity})`
}

/**
 * Converts RGB values to a hex color
 *
 * @param r - Red component (0-255)
 * @param g - Green component (0-255)
 * @param b - Blue component (0-255)
 * @returns Hex color string
 */
export function rgbToHex(r: number, g: number, b: number): string {
  // Clamp RGB values
  const clampedR = Math.max(0, Math.min(255, Math.round(r)))
  const clampedG = Math.max(0, Math.min(255, Math.round(g)))
  const clampedB = Math.max(0, Math.min(255, Math.round(b)))

  // Convert to hex
  const hex = ((clampedR << 16) | (clampedG << 8) | clampedB).toString(16).padStart(6, '0')

  return `#${hex}`
}

/**
 * Converts RGB to HSL
 *
 * @param r - Red component (0-255)
 * @param g - Green component (0-255)
 * @param b - Blue component (0-255)
 * @returns HSL object with h, s, l properties
 */
export function rgbToHsl(r: number, g: number, b: number): HSL {
  const normalizedR = r / 255
  const normalizedG = g / 255
  const normalizedB = b / 255

  const max = Math.max(normalizedR, normalizedG, normalizedB)
  const min = Math.min(normalizedR, normalizedG, normalizedB)

  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

    switch (max) {
      case normalizedR:
        h = (normalizedG - normalizedB) / d + (normalizedG < normalizedB ? 6 : 0)
        break
      case normalizedG:
        h = (normalizedB - normalizedR) / d + 2
        break
      case normalizedB:
        h = (normalizedR - normalizedG) / d + 4
        break
    }

    h /= 6
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  }
}

/**
 * Returns a CSS variable string for the named color
 *
 * @param key - The color key
 * @returns CSS variable string (e.g., "var(--color-primary)")
 */
export function cssVar(key: ColorKey): string {
  // Convert camelCase to kebab-case
  const kebabKey = key.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase()
  return `var(--color-${kebabKey})`
}

/**
 * Creates a gradient string from two colors
 *
 * @param startColor - Starting color key or hex
 * @param endColor - Ending color key or hex
 * @param direction - Direction of gradient (default: "to right")
 * @returns CSS linear gradient string
 */
export function createGradient(
  startColor: ColorKey | string,
  endColor: ColorKey | string,
  direction: string = 'to right'
): string {
  const start = startColor in COLORS ? COLORS[startColor as ColorKey] : startColor
  const end = endColor in COLORS ? COLORS[endColor as ColorKey] : endColor

  return `linear-gradient(${direction}, ${start}, ${end})`
}

/**
 * Adjusts the brightness of a color
 *
 * @param color - Hex color code or color key
 * @param amount - Amount to adjust brightness (-100 to 100)
 * @returns Adjusted hex color
 */
export function adjustBrightness(color: ColorKey | string, amount: number): string {
  const hexColor = color in COLORS ? COLORS[color as ColorKey] : color
  const { r, g, b } = hexToRgb(hexColor)

  // Adjust brightness
  const adjustment = Math.round(amount * 2.55) // Convert percent to RGB value

  return rgbToHex(r + adjustment, g + adjustment, b + adjustment)
}

/**
 * Creates a color with adjusted opacity
 *
 * @param color - Hex color code or color key
 * @param opacity - Opacity value (0-1)
 * @returns RGBA color string
 */
export function withOpacity(color: ColorKey | string, opacity: number): string {
  const hexColor = color in COLORS ? COLORS[color as ColorKey] : color
  return hexToRgba(hexColor, opacity)
}

/**
 * Generates a contrasting text color (white or black) for a background color
 *
 * @param backgroundColor - Background color (hex or color key)
 * @returns '#ffffff' or '#000000' based on contrast calculation
 */
export function getContrastTextColor(backgroundColor: ColorKey | string): string {
  const hexColor = backgroundColor in COLORS ? COLORS[backgroundColor as ColorKey] : backgroundColor
  const { r, g, b } = hexToRgb(hexColor)

  // Calculate luminance using the sRGB color space formula
  const luminance = 0.299 * r + 0.587 * g + 0.114 * b

  // Use white text on dark backgrounds, black text on light backgrounds
  return luminance < 128 ? '#ffffff' : '#000000'
}
