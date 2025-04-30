/**
 * Theme Plugin
 *
 * This plugin initializes the application's theme system, applying the default
 * dark theme and providing utilities for theme management.
 */

import { defineNuxtPlugin } from '#app'
import { COLORS } from '~/utils/colors'

export default defineNuxtPlugin({
  name: 'theme-plugin',
  setup() {
    // Set theme on initialization
    setDefaultTheme()

    // Return theme utility functions
    return {
      provide: {
        // Function to apply the theme programmatically
        applyTheme: () => {
          setDefaultTheme()
        },
        // Get theme colors
        themeColors: COLORS,
      },
    }
  },
})

/**
 * Sets up the default theme by ensuring CSS variables are properly applied
 */
function setDefaultTheme() {
  // Access document only in client-side context
  if (process.client) {
    // Apply theme name attribute to document
    document.documentElement.setAttribute('data-theme', 'dark')

    // Ensure all CSS variables are properly applied
    // This is mostly handled by CSS, but can be useful for dynamic theme switching

    // Set meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]')
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', COLORS.background)
    } else {
      const meta = document.createElement('meta')
      meta.name = 'theme-color'
      meta.content = COLORS.background
      document.head.appendChild(meta)
    }
  }
}
