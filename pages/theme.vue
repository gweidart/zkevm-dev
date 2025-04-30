<template>
  <div class="theme-showcase">
    <section class="hero">
      <div class="container text-center">
        <h1>Color Scheme Showcase</h1>
        <p class="subtitle">Demonstrating the new color palette across various UI elements</p>
      </div>
    </section>

    <section class="container section">
      <h2>Color Palette</h2>
      <p>
        This website uses a carefully selected color palette to create a cohesive and visually
        stunning experience.
      </p>

      <ColorPalette />

      <div class="theme-details mb-xl">
        <h3>Color Harmony</h3>
        <p>
          The dark teal background (#031118) creates a sophisticated foundation, while the bright
          mint green primary color (#16f08c) provides vibrant contrast for interactive elements. The
          soft mauve (#d5b2c9) and coral (#d86475) accent colors add warmth and visual interest
          throughout the interface.
        </p>
      </div>
    </section>

    <section class="container section">
      <h2>UI Elements</h2>

      <div class="ui-section mb-xl">
        <h3>Buttons</h3>
        <div class="button-grid">
          <div>
            <h4>Primary</h4>
            <button class="btn btn-primary">Primary Button</button>
          </div>

          <div>
            <h4>Outline</h4>
            <button class="btn btn-outline">Outline Button</button>
          </div>

          <div>
            <h4>Hover States</h4>
            <p class="small-text">Hover over the buttons to see state changes</p>
          </div>
        </div>
      </div>

      <div class="ui-section mb-xl">
        <h3>Text & Background</h3>
        <div class="background-demo">
          <div class="bg-block bg-surface mb-md">
            <p>Surface Background (#051a23)</p>
            <p class="small-text">Standard text on surface</p>
            <p class="small-text text-muted">Muted text on surface</p>
            <a href="#" class="demo-link">Link on surface</a>
          </div>

          <div class="bg-block bg-surface-variant">
            <p>Surface Variant Background (#072530)</p>
            <p class="small-text">Standard text on surface variant</p>
            <p class="small-text text-muted">Muted text on surface variant</p>
            <a href="#" class="demo-link">Link on surface variant</a>
          </div>
        </div>
      </div>

      <div class="ui-section mb-xl">
        <h3>Accent Colors in Action</h3>
        <div class="accent-demo">
          <div class="accent-card" style="border-color: var(--color-secondary)">
            <div class="accent-header" style="background-color: var(--color-secondary)">
              <h4>Secondary Accent</h4>
            </div>
            <div class="accent-content">
              <p>This card uses the secondary color (#d5b2c9) for its header and border.</p>
            </div>
          </div>

          <div class="accent-card" style="border-color: var(--color-accent)">
            <div class="accent-header" style="background-color: var(--color-accent)">
              <h4>Tertiary Accent</h4>
            </div>
            <div class="accent-content">
              <p>This card uses the accent color (#d86475) for its header and border.</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="container section">
      <h2>Implementation</h2>
      <p>
        This color scheme is implemented using CSS variables for consistency and ease of
        maintenance:
      </p>

      <div class="code-block">
        <pre>
:root {
  --color-background: #031118;
  --color-surface: #051a23;
  --color-surface-variant: #072530;
  --color-primary: #16f08c;
  --color-primary-variant: #0fd67d;
  --color-secondary: #d5b2c9;
  --color-accent: #d86475;
  --color-text: #e6e6e6;
  --color-text-muted: #a8b0b3;
}</pre
        >
      </div>

      <p class="mb-lg">
        A TypeScript utility module is also available for programmatic access to these colors:
      </p>

      <div class="code-block">
        <pre>
import { getColor, hexToRgba, createGradient } from '~/utils/colors';

// Get a color value
const primaryColor = getColor('primary'); // #16f08c

// Create a semi-transparent version
const overlayBg = hexToRgba('#031118', 0.8); // rgba(3, 17, 24, 0.8)

// Create a gradient
const gradient = createGradient('primary', 'accent'); // linear-gradient(to right, #16f08c, #d86475)</pre
        >
      </div>
    </section>
  </div>
</template>

<script setup>
  /**
   * Theme Showcase Page
   *
   * A demonstration page that showcases the site's color palette and how it's applied
   * to various UI elements. This page helps maintain design consistency and serves as
   * a reference for developers.
   */
</script>

<style scoped>
  .hero {
    padding: 6rem 0 3rem;
    background: linear-gradient(to bottom, var(--color-surface-variant), var(--color-background));
  }

  .subtitle {
    font-size: 1.25rem;
    color: var(--color-text-muted);
    max-width: 800px;
    margin: 0 auto;
  }

  .theme-details,
  .ui-section {
    margin-top: 3rem;
  }

  .button-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 2rem;
    margin-top: 1.5rem;
  }

  .small-text {
    font-size: 0.875rem;
    margin-top: 0.5rem;
  }

  .text-muted {
    color: var(--color-text-muted);
  }

  .background-demo {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 2rem;
    margin-top: 1.5rem;
  }

  .bg-block {
    padding: 1.5rem;
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-md);
  }

  .demo-link {
    display: inline-block;
    margin-top: 1rem;
  }

  .accent-demo {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 2rem;
    margin-top: 1.5rem;
  }

  .accent-card {
    border-radius: var(--radius-md);
    overflow: hidden;
    border: 1px solid;
    box-shadow: var(--shadow-md);
  }

  .accent-header {
    padding: 1rem;
    color: var(--color-background);
  }

  .accent-content {
    padding: 1.5rem;
    background-color: var(--color-surface);
  }

  .code-block {
    background-color: var(--color-surface-variant);
    padding: 1.5rem;
    border-radius: var(--radius-md);
    overflow-x: auto;
    margin: 1.5rem 0;
  }

  pre {
    font-family: monospace;
    font-size: 0.875rem;
    color: var(--color-text);
  }

  @media (max-width: 768px) {
    .hero {
      padding: 4rem 0 2rem;
    }

    .button-grid,
    .background-demo,
    .accent-demo {
      grid-template-columns: 1fr;
    }
  }
</style>
