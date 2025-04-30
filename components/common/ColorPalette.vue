<template>
  <div class="color-palette" :class="{ 'is-compact': compact }">
    <div class="color-palette-header">
      <h3 class="color-palette-title">{{ title }}</h3>
      <button
        v-if="copyEnabled"
        @click="copyColorsToClipboard"
        class="copy-button"
        :disabled="isCopying"
        :aria-label="isCopying ? 'Colors copied!' : 'Copy color values'"
      >
        {{ isCopying ? 'Copied!' : 'Copy Colors' }}
      </button>
    </div>

    <div v-if="showDescription && description" class="color-palette-description">
      {{ description }}
    </div>

    <div class="color-grid" :class="{ 'is-compact': compact }">
      <!-- Dynamically render color categories -->
      <div
        v-for="(category, categoryIndex) in colorCategories"
        :key="categoryIndex"
        class="color-category"
      >
        <h4>{{ category.name }}</h4>
        <div
          v-for="(color, colorIndex) in category.colors"
          :key="colorIndex"
          class="color-item"
          @click="copyColorToClipboard(color.value)"
          :title="`Click to copy: ${color.value}`"
          :tabindex="0"
          @keydown.enter="copyColorToClipboard(color.value)"
          @keydown.space="copyColorToClipboard(color.value)"
          role="button"
        >
          <div
            class="color-swatch"
            :style="{ backgroundColor: color.value }"
            :class="{ 'has-border': needsBorder(color.value) }"
          ></div>
          <div class="color-details">
            <span class="color-name">{{ color.name }}</span>
            <span class="color-var">{{ color.variable }}</span>
            <span class="color-hex" :class="{ 'is-copied': copiedColor === color.value }">
              {{ color.value }}
              <span v-if="copiedColor === color.value" class="copied-indicator"> ✓ </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, computed } from 'vue'

  /**
   * Color item interface
   */
  interface ColorItem {
    /** Color name */
    name: string
    /** CSS variable name */
    variable: string
    /** Color value (hex, rgb, etc.) */
    value: string
  }

  /**
   * Color category interface
   */
  interface ColorCategory {
    /** Category name */
    name: string
    /** Colors in this category */
    colors: ColorItem[]
  }

  /**
   * Component props
   */
  interface Props {
    /** Palette title */
    title?: string
    /** Optional description */
    description?: string
    /** Show description */
    showDescription?: boolean
    /** Use compact layout */
    compact?: boolean
    /** Enable copy functionality */
    copyEnabled?: boolean
    /** Custom color categories */
    customCategories?: ColorCategory[]
    /** Enable color extraction */
    extractColors?: boolean
  }

  // Define props with defaults
  const props = withDefaults(defineProps<Props>(), {
    title: 'Color Palette',
    description: 'Design system color palette with CSS variables',
    showDescription: false,
    compact: false,
    copyEnabled: true,
    customCategories: () => [],
    extractColors: true,
  })

  // Component state
  const isCopying = ref(false)
  const copiedColor = ref('')
  const extractedColors = ref<Record<string, string>>({})

  // Default color categories
  const defaultColorCategories: ColorCategory[] = [
    {
      name: 'Background',
      colors: [
        { name: 'Background', variable: '--color-background', value: '#031118' },
        { name: 'Surface', variable: '--color-surface', value: '#051a23' },
        { name: 'Surface Variant', variable: '--color-surface-variant', value: '#072530' },
      ],
    },
    {
      name: 'Primary',
      colors: [
        { name: 'Primary', variable: '--color-primary', value: '#16f08c' },
        { name: 'Primary Variant', variable: '--color-primary-variant', value: '#0fd67d' },
      ],
    },
    {
      name: 'Accent',
      colors: [
        { name: 'Secondary', variable: '--color-secondary', value: '#d5b2c9' },
        { name: 'Accent', variable: '--color-accent', value: '#d86475' },
      ],
    },
    {
      name: 'Text',
      colors: [
        { name: 'Text', variable: '--color-text', value: '#e6e6e6' },
        { name: 'Text Muted', variable: '--color-text-muted', value: '#a8b0b3' },
      ],
    },
  ]

  /**
   * Extract actual CSS variable colors from the DOM
   */
  const extractCssColors = (): Record<string, string> => {
    if (typeof window === 'undefined' || !props.extractColors) return {}

    const computedStyle = getComputedStyle(document.documentElement)
    const result: Record<string, string> = {}

    // Extract colors from all categories
    for (const category of [...defaultColorCategories, ...props.customCategories]) {
      for (const color of category.colors) {
        const variableName = color.variable
        const value = computedStyle.getPropertyValue(variableName).trim()

        if (value) {
          result[variableName] = value
        }
      }
    }

    return result
  }

  /**
   * Combine default and custom categories with extracted colors
   */
  const colorCategories = computed(() => {
    // If custom categories are provided and we don't want to show defaults
    if (props.customCategories.length > 0) {
      return updateColorsWithExtracted(props.customCategories)
    }

    // Otherwise use defaults
    return updateColorsWithExtracted(defaultColorCategories)
  })

  /**
   * Update color values with extracted values if available
   */
  const updateColorsWithExtracted = (categories: ColorCategory[]): ColorCategory[] => {
    if (Object.keys(extractedColors.value).length === 0) {
      return categories
    }

    return categories.map(category => ({
      name: category.name,
      colors: category.colors.map(color => ({
        ...color,
        value: extractedColors.value[color.variable] || color.value,
      })),
    }))
  }

  /**
   * Check if a color needs a border (for light colors)
   */
  const needsBorder = (colorValue: string): boolean => {
    // Simple check for light colors - more sophisticated detection could be implemented
    const isHex = colorValue.startsWith('#')

    if (isHex) {
      const hex = colorValue.replace('#', '')
      // For #rgb or #rrggbb format
      let r, g, b

      if (hex.length === 3) {
        r = parseInt(hex[0] + hex[0], 16)
        g = parseInt(hex[1] + hex[1], 16)
        b = parseInt(hex[2] + hex[2], 16)
      } else if (hex.length === 6) {
        r = parseInt(hex.substring(0, 2), 16)
        g = parseInt(hex.substring(2, 4), 16)
        b = parseInt(hex.substring(4, 6), 16)
      } else {
        return false
      }

      // Simple brightness formula
      const brightness = (r * 299 + g * 587 + b * 114) / 1000
      return brightness > 200 // Light color threshold
    }

    // For non-hex colors like white, ivory, etc.
    const lightColors = ['white', 'ivory', 'lightyellow', 'lightgray', '#fff', '#ffffff']
    return lightColors.some(c => colorValue.toLowerCase().includes(c))
  }

  /**
   * Copy a single color to clipboard
   */
  const copyColorToClipboard = (color: string) => {
    if (!props.copyEnabled) return

    navigator.clipboard.writeText(color).then(() => {
      copiedColor.value = color

      // Reset the copied status after 2 seconds
      setTimeout(() => {
        copiedColor.value = ''
      }, 2000)
    })
  }

  /**
   * Copy all colors to clipboard as a CSS snippet
   */
  const copyColorsToClipboard = () => {
    if (!props.copyEnabled) return

    // Create a CSS root variables string
    let cssText = `:root {\n`

    colorCategories.value.forEach(category => {
      cssText += `  /* ${category.name} Colors */\n`

      category.colors.forEach(color => {
        cssText += `  ${color.variable}: ${color.value};\n`
      })

      cssText += `\n`
    })

    cssText += `}`

    // Copy to clipboard
    navigator.clipboard.writeText(cssText).then(() => {
      isCopying.value = true

      // Reset the copied status after 2 seconds
      setTimeout(() => {
        isCopying.value = false
      }, 2000)
    })
  }

  // Extract actual colors on component mount
  onMounted(() => {
    extractedColors.value = extractCssColors()
  })
</script>

<style scoped>
  .color-palette {
    margin: 2rem 0;
    padding: 1.5rem;
    background-color: var(--color-surface, #051a23);
    border-radius: var(--radius-md, 8px);
    box-shadow: var(--shadow-md, 0 4px 6px rgba(0, 0, 0, 0.1));
    color: var(--color-text, #e6e6e6);
    transition: all 0.3s ease;
  }

  .color-palette.is-compact {
    padding: 1rem;
  }

  .color-palette-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }

  .color-palette-title {
    margin: 0;
    font-size: 1.75rem;
    font-weight: 600;
    color: var(--color-primary, #16f08c);
  }

  .color-palette-description {
    margin-bottom: 1.5rem;
    color: var(--color-text-muted, #a8b0b3);
    font-size: 0.875rem;
    line-height: 1.5;
  }

  .copy-button {
    background-color: var(--color-primary, #16f08c);
    color: var(--color-background, #031118);
    border: none;
    padding: 0.5rem 1rem;
    border-radius: var(--radius-sm, 4px);
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 0.875rem;
  }

  .copy-button:hover {
    background-color: var(--color-primary-variant, #0fd67d);
    transform: translateY(-1px);
  }

  .copy-button:active {
    transform: translateY(1px);
  }

  .copy-button:disabled {
    opacity: 0.8;
    cursor: default;
  }

  .color-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 2rem;
  }

  .color-grid.is-compact {
    gap: 1rem;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  }

  .color-category h4 {
    margin-bottom: 1rem;
    font-size: 1.25rem;
    color: var(--color-secondary, #d5b2c9);
    font-weight: 500;
  }

  .color-item {
    display: flex;
    align-items: center;
    margin-bottom: 1rem;
    padding: 0.5rem;
    border-radius: var(--radius-sm, 4px);
    transition: all 0.2s ease;
    cursor: pointer;
  }

  .color-item:hover {
    background-color: rgba(255, 255, 255, 0.05);
  }

  .color-item:focus {
    outline: 2px solid var(--color-primary, #16f08c);
    outline-offset: 2px;
  }

  .color-swatch {
    width: 3rem;
    height: 3rem;
    border-radius: var(--radius-sm, 4px);
    box-shadow: var(--shadow-sm, 0 2px 4px rgba(0, 0, 0, 0.1));
    margin-right: 0.75rem;
    transition: transform 0.2s ease;
  }

  .color-swatch.has-border {
    border: 1px solid rgba(0, 0, 0, 0.1);
  }

  .color-item:hover .color-swatch {
    transform: scale(1.05);
  }

  .color-details {
    display: flex;
    flex-direction: column;
    flex: 1;
  }

  .color-name {
    font-weight: 600;
    margin-bottom: 0.25rem;
  }

  .color-var {
    font-family: monospace;
    font-size: 0.75rem;
    color: var(--color-text-muted, #a8b0b3);
    margin-bottom: 0.25rem;
  }

  .color-hex {
    font-family: monospace;
    font-size: 0.875rem;
    color: var(--color-text-muted, #a8b0b3);
    display: flex;
    align-items: center;
    justify-content: space-between;
    transition: color 0.2s ease;
  }

  .color-hex.is-copied {
    color: var(--color-primary, #16f08c);
    font-weight: bold;
  }

  .copied-indicator {
    margin-left: 0.5rem;
    font-size: 0.75rem;
  }

  @media (max-width: 640px) {
    .color-grid {
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 1rem;
    }

    .color-palette {
      padding: 1rem;
    }

    .color-palette-title {
      font-size: 1.5rem;
    }

    .color-swatch {
      width: 2.5rem;
      height: 2.5rem;
    }
  }

  /* High contrast mode */
  @media (forced-colors: active) {
    .color-swatch {
      border: 1px solid CanvasText;
    }

    .copy-button {
      border: 1px solid CanvasText;
    }
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .color-palette,
    .color-item,
    .color-swatch,
    .copy-button {
      transition: none;
    }

    .color-item:hover .color-swatch {
      transform: none;
    }
  }
</style>
