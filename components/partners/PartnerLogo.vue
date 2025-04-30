<template>
  <div class="partner-logo-wrapper" role="img" :aria-label="`${formattedName} logo`">
    <div class="logo-container" :style="{ width: `${width}px`, height: `${height}px` }">
      <component :is="`svgo-${partnerName}`" :font-controlled="false" class="svg-component" />
    </div>
    <span v-if="showTooltip" class="partner-tooltip" aria-hidden="true">{{ formattedName }}</span>
  </div>
</template>

<script setup lang="ts">
  /**
   * @component PartnerLogo
   * @description Displays a partner's logo with optional tooltip and hover animations.
   * Requires SVG components to be registered globally with the naming convention 'svgo-{partnerName}'.
   */
  import { computed } from 'vue'

  /**
   * Props definition for the PartnerLogo component
   */
  const props = withDefaults(
    defineProps<{
      /**
       * Partner identifier used to determine which SVG to display.
       * The component will look for a globally registered component named 'svgo-{partnerName}'
       */
      partnerName: string

      /** Width of the logo in pixels */
      width?: number

      /** Height of the logo in pixels */
      height?: number

      /** Whether to show the tooltip on hover */
      showTooltip?: boolean
    }>(),
    {
      width: 120,
      height: 40,
      showTooltip: true,
    }
  )

  /**
   * Formats the partner name for display in the tooltip by
   * capitalizing each word and replacing hyphens with spaces
   */
  const formattedName = computed(() => {
    return props.partnerName
      .split('-')
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  })
</script>

<style scoped>
  /* Variables for animations and transitions */
  .partner-logo-wrapper {
    --partner-logo-transition-duration: 0.3s;
    --partner-logo-transition-timing: ease;
    --partner-logo-hover-y-offset: -5px;
    --partner-logo-hover-scale: 1.05;

    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    transition: transform var(--partner-logo-transition-duration)
      var(--partner-logo-transition-timing);
    will-change: transform;
  }

  .partner-logo-wrapper:hover {
    transform: translateY(var(--partner-logo-hover-y-offset)) scale(var(--partner-logo-hover-scale));
  }

  /* Logo container */
  .logo-container {
    display: flex;
    justify-content: center;
    align-items: center;
    opacity: 0.8;
    transition: opacity var(--partner-logo-transition-duration)
      var(--partner-logo-transition-timing);
  }

  .partner-logo-wrapper:hover .logo-container {
    opacity: 1;
  }

  /* SVG styling */
  .svg-component {
    width: 100%;
    height: 100%;
    object-fit: contain; /* Ensures the SVG fills the container while maintaining aspect ratio */
  }

  /* Tooltip styling */
  .partner-tooltip {
    position: absolute;
    bottom: -35px;
    left: 50%;
    transform: translateX(-50%) translateY(10px);
    background-color: var(--color-surface-variant);
    color: var(--color-text);
    padding: 5px 10px;
    border-radius: var(--radius-sm);
    font-size: 0.75rem;
    white-space: nowrap;
    opacity: 0;
    visibility: hidden;
    transition: all var(--partner-logo-transition-duration) var(--partner-logo-transition-timing);
    pointer-events: none;
    border: 1px solid var(--color-border);
    box-shadow: var(--shadow-md);
    z-index: 10;
    will-change: opacity, visibility, transform;
  }

  .partner-logo-wrapper:hover .partner-tooltip {
    opacity: 1;
    visibility: visible;
    transform: translateX(-50%) translateY(0);
  }
</style>
