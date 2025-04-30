// https://nuxt.com/docs/api/configuration/nuxt-config
import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  /**
   * Development settings
   * Control developer tools and debugging features
   */
  devtools: {
    enabled: process.env.NODE_ENV === 'development',

    timeline: {
      enabled: true,
    },
  },

  /**
   * TypeScript compatibility
   * Ensure strong type checking during development
   */
  typescript: {
    strict: true,
    typeCheck: true,
    shim: false, // Reduces build time in production
  },

  /**
   * Compatibility date for Nuxt features
   * Sets a specific date-based compatibility level
   */
  compatibilityDate: '2024-11-01',

  /**
   * App configuration
   * Meta information, page transitions, and general app settings
   */
  app: {
    head: {
      title: 'zkEVM.dev | Web3 Security Researcher',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=5' },
        {
          name: 'description',
          content:
            'Portfolio of a Web3 Security Researcher. In the dark forest, only the best survive.',
        },
        { name: 'format-detection', content: 'telephone=no' },
        { name: 'theme-color', content: '#031118' },
        // Open Graph / Social media meta tags
        { name: 'og:title', content: 'zkEVM.dev | Web3 Security Researcher' },
        {
          name: 'og:description',
          content:
            'Portfolio of a Web3 Security Researcher. In the dark forest, only the best survive.',
        },
        { name: 'og:type', content: 'website' },
        { name: 'og:url', content: 'https://zkevm.dev' },
        { name: 'og:image', content: 'https://zkevm.dev/images/social-card.png' },
        // Twitter specific tags
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'zkEVM.dev | Web3 Security Researcher' },
        {
          name: 'twitter:description',
          content:
            'Portfolio of a Web3 Security Researcher. In the dark forest, only the best survive.',
        },
        { name: 'twitter:image', content: 'https://zkevm.dev/images/social-card.png' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
        { rel: 'mask-icon', href: '/safari-pinned-tab.svg', color: '#031118' },
      ],
    },
    // Page transition effects
    pageTransition: {
      name: 'page',
      mode: 'out-in',
      appear: true,
    },
    // Default layout
    layoutTransition: {
      name: 'layout',
      mode: 'out-in',
    },
  },

  /**
   * CSS global styles
   * Import global CSS files
   */
  css: ['~/assets/styles/main.css'],

  /**
   * Auto-import components configuration
   * Component discovery and naming conventions
   */
  components: [
    // Common components without prefix
    {
      path: '~/components/common',
      prefix: '',
      pathPrefix: false,
      global: true,
    },
    // Layout components with 'Layout' prefix
    {
      path: '~/components/layout',
      prefix: 'Layout',
      pathPrefix: false,
    },
    // Animation components without prefix
    {
      path: '~/components/animations',
      prefix: '',
      pathPrefix: false,
    },
    // Partner components with 'Partner' prefix
    {
      path: '~/components/partners',
      prefix: 'Partner',
      pathPrefix: false,
    },
    // Profile components with 'Profile' prefix
    {
      path: '~/components/profile',
      prefix: 'Profile',
      pathPrefix: false,
    },
  ],

  /**
   * Build modules configuration
   * External modules with custom configuration
   */
  modules: [
    // SVG optimization and auto-import
    [
      'nuxt-svgo',
      {
        defaultImport: 'component',
        autoImportPath: './assets/partners/',
        componentPrefix: 'svgo',
        svgoConfig: {
          plugins: [
            'preset-default',
            'prefixIds',
            {
              name: 'sortAttrs',
              params: {
                xmlnsOrder: 'alphabetical',
              },
            },
          ],
        },
      },
    ],
    // Sitemap generation
    [
      '@nuxtjs/sitemap',
      {
        autoLastmod: true,
        xslStyles: true,
        exclude: ['/admin/**'],
        defaults: {
          changefreq: 'weekly',
          priority: 0.8,
          lastmod: new Date(),
        },
        cacheTtl: 1000 * 60 * 60 * 24, // 24 hours
      },
    ],
    // UI component library
    'reka-ui/nuxt',
    // Tailwind CSS integration
    '@nuxtjs/tailwindcss',
    // Image optimization
    [
      '@nuxt/image',
      {
        provider: 'ipx',
        domains: ['zkevm.dev'],
        format: ['webp', 'avif', 'jpeg', 'png'],
        quality: 80,
        screens: {
          xs: 320,
          sm: 640,
          md: 768,
          lg: 1024,
          xl: 1280,
          xxl: 1536,
        },
        presets: {
          avatar: {
            modifiers: {
              format: 'webp',
              width: 50,
              height: 50,
            },
          },
          thumbnail: {
            modifiers: {
              format: 'webp',
              width: 320,
              height: 180,
            },
          },
        },
      },
    ],
    // Font optimization
    '@nuxt/fonts',
  ],

  /**
   * Performance optimization with Nitro
   * Server and rendering configurations
   */
  nitro: {
    preset: 'vercel',
    prerender: {
      crawlLinks: true,
      routes: ['/'],
      ignore: [/\.(js|css|svg|png|jpe?g|gif|webp|avif|ico|json)$/],
    },
    compressPublicAssets: {
      gzip: true,
      brotli: true,
    },
    minify: true,
    timing: process.env.NODE_ENV === 'development',
    // Cache configuration
    storage: {
      redis: {
        driver: process.env.REDIS_URL ? 'redis' : 'memory',
        /* @ts-ignore */
        url: process.env.REDIS_URL,
      },
    },
    devStorage: {
      redis: {
        driver: 'memory',
      },
    },
  },

  /**
   * Runtime configurations
   * Environment-specific settings
   */
  runtimeConfig: {
    public: {
      siteUrl: process.env.SITE_URL || 'https://zkevm.dev',
      gaId: process.env.GA_ID,
      environment: process.env.NODE_ENV || 'development',
    },
  },

  /**
   * Webpack build configuration
   * Bundling and transpilation settings
   */
  build: {
    transpile: ['gsap', 'three'],
  },

  /**
   * PostCSS configuration
   * CSS processing tools and plugins
   */
  postcss: {
    plugins: {
      'postcss-preset-env': {
        stage: 3,
        features: {
          'nesting-rules': true,
          'custom-media-queries': true,
          'media-query-ranges': true,
        },
      },
      autoprefixer: {},
      ...(process.env.NODE_ENV === 'production' ? { cssnano: { preset: 'default' } } : {}),
    },
  },

  /**
   * Enable experimental features
   * Opt-in to cutting-edge Nuxt capabilities
   */
  experimental: {
    payloadExtraction: true,
    renderJsonPayloads: true,
    viewTransition: true,
    componentIslands: true,
    treeshakeClientOnly: true,
    asyncContext: true,
    headNext: true,
  },

  /**
   * Development performance optimization
   * Vite-specific settings for improved DX
   */
  vite: {
    build: {
      cssMinify: 'lightningcss',
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: process.env.NODE_ENV === 'production',
          drop_debugger: process.env.NODE_ENV === 'production',
        },
      },
      rollupOptions: {
        output: {
          manualChunks: {
            gsap: ['gsap'],
            three: ['three'],
          },
        },
      },
    },
    css: {
      devSourcemap: true,
    },
    optimizeDeps: {
      include: ['gsap', 'three/src/Three.js'],
    },
    // Define default environment variables
    define: {
      'process.env.NUXT_PUBLIC_SITE_URL': JSON.stringify(
        process.env.SITE_URL || 'https://zkevm.dev'
      ),
    },
  },
})
