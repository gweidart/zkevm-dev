<template>
  <div class="layout">
    <header class="header" :class="{ scrolled: isScrolled }">
      <div class="container header-container">
        <div class="logo">
          <nuxt-link to="/" aria-label="zkEVM.dev Home">
            <span class="logo-text">zkEVM<span class="logo-dot">.</span>dev</span>
          </nuxt-link>
        </div>
        <button
          class="mobile-menu-toggle"
          :class="{ open: isMenuOpen }"
          @click="toggleMenu"
          aria-label="Toggle menu"
          :aria-expanded="isMenuOpen"
        >
          <span class="bar"></span>
          <span class="bar"></span>
          <span class="bar"></span>
        </button>
        <nav class="main-nav" :class="{ open: isMenuOpen }">
          <ul>
            <li><nuxt-link to="/" exact @click="closeMenu">Home</nuxt-link></li>
            <li>
              <a
                href="https://blog.zkevm.dev"
                target="_blank"
                rel="noopener noreferrer"
                @click="closeMenu"
                >Research</a
              >
            </li>
            <li>
              <a
                href="#about"
                :class="{ 'hash-link': true, active: activeSection === 'about' }"
                @click="handleHashLink('about', $event)"
                >About</a
              >
            </li>
            <li>
              <a
                href="#contact"
                :class="{ 'hash-link': true, active: activeSection === 'contact' }"
                @click="handleHashLink('contact', $event)"
                >Contact</a
              >
            </li>
          </ul>
          <div class="nav-actions">
            <a
              href="#contact"
              class="btn btn-sm btn-primary"
              @click="handleHashLink('contact', $event)"
              >Book an Audit</a
            >
          </div>
        </nav>
        <div class="header-actions">
          <a
            href="#contact"
            class="btn btn-sm btn-primary"
            @click="handleHashLink('contact', $event)"
            >Book an Audit</a
          >
        </div>
        <div
          class="menu-backdrop"
          :class="{ active: isMenuOpen }"
          @click="closeMenu"
          aria-hidden="true"
        ></div>
      </div>
    </header>

    <main>
      <slot />
      <SpeedInsights />
      <Analytics />
    </main>

    <footer class="footer">
      <div class="container">
        <div class="footer-content">
          <div class="footer-copyright">
            Built with ❤️ by
            <a href="https://github.com/gweidart" target="_blank" rel="noopener noreferrer"
              >zkEVM</a
            >
          </div>
          <div class="footer-social">
            <a
              href="https://github.com/gweidart"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path
                  d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"
                ></path>
              </svg>
            </a>
            <a
              href="https://twitter.com/utxok"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Twitter"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path
                  d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"
                ></path>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
  /**
   * @component DefaultLayout
   * @description Main layout component for the website with responsive header, navigation, and footer.
   * Handles smooth scrolling to hash sections, active link highlighting, and mobile menu functionality.
   */
  import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
  import { useRoute } from 'vue-router'
  import { SpeedInsights } from '@vercel/speed-insights/nuxt'
  import { Analytics } from '@vercel/analytics/nuxt'

  // Types
  type Section = 'about' | 'contact' | ''

  // State management
  const isMenuOpen = ref<boolean>(false)
  const isScrolled = ref<boolean>(false)
  const activeSection = ref<Section>('')

  // Route information
  const route = useRoute()
  const isHomePage = computed<boolean>(() => route.path === '/' || route.path === '')

  /**
   * Toggles the mobile menu state
   */
  const toggleMenu = (): void => {
    isMenuOpen.value = !isMenuOpen.value
  }

  /**
   * Handles the click on hash links, handling smooth scrolling and section activation
   * @param section - The section ID to scroll to
   * @param event - Optional click event to prevent default behavior
   */
  const handleHashLink = (section: Section, event?: Event): void => {
    if (event) {
      event.preventDefault()
      closeMenu()
    }

    activeSection.value = section

    // Only perform scrolling if we're on the home page
    if (isHomePage.value) {
      scrollToSection(section)
    } else {
      // If not on home page, navigate to home page with hash
      window.location.href = `/#${section}`
    }

    // Update URL history
    updateUrlHistory(section)
  }

  /**
   * Scrolls to the specified section with smooth behavior
   * @param section - The section ID to scroll to
   */
  const scrollToSection = (section: string): void => {
    const element = document.getElementById(section)
    if (element) {
      // Account for header height
      const headerHeight = document.querySelector('.header')?.clientHeight || 0
      const elementPosition = element.getBoundingClientRect().top + window.scrollY
      const offsetPosition = elementPosition - headerHeight - 20 // 20px extra padding

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      })
    }
  }

  /**
   * Updates the URL history with the section hash
   * @param section - The section to add to the URL hash
   */
  const updateUrlHistory = (section: string): void => {
    if (history.pushState) {
      history.pushState(null, '', `#${section}`)
    } else {
      window.location.hash = section
    }
  }

  /**
   * Closes the mobile menu
   */
  const closeMenu = (): void => {
    isMenuOpen.value = false
  }

  /**
   * Checks if an element is in the viewport
   * @param element - The HTML element to check
   * @returns boolean indicating if the element is in the viewport
   */
  const isInViewport = (element: HTMLElement): boolean => {
    const rect = element.getBoundingClientRect()
    const headerHeight = document.querySelector('.header')?.clientHeight || 0
    return rect.top < window.innerHeight / 2 && rect.top > headerHeight && rect.bottom > 0
  }

  /**
   * Handles scroll events to style header and update active section
   */
  const handleScroll = (): void => {
    isScrolled.value = window.scrollY > 50

    // Only track sections on the home page
    if (isHomePage.value) {
      // Use requestAnimationFrame for performance
      if (!window.requestAnimationFrame) {
        setTimeout(updateActiveSection, 100)
      } else {
        window.requestAnimationFrame(updateActiveSection)
      }
    }
  }

  /**
   * Updates which section is active based on scroll position
   */
  const updateActiveSection = (): void => {
    if (!isHomePage.value) return

    const aboutEl = document.getElementById('about')
    const contactEl = document.getElementById('contact')

    if (aboutEl && contactEl) {
      if (isInViewport(aboutEl)) {
        updateActiveSectionState('about')
      } else if (isInViewport(contactEl)) {
        updateActiveSectionState('contact')
      } else if (window.scrollY < 100) {
        updateActiveSectionState('')
      }
    }
  }

  /**
   * Updates the active section state and URL
   * @param section - The section to set as active
   */
  const updateActiveSectionState = (section: Section): void => {
    if (activeSection.value === section) return

    activeSection.value = section

    // Update URL silently
    if (history.replaceState) {
      if (section) {
        history.replaceState(null, '', `#${section}`)
      } else if (window.location.hash) {
        history.replaceState(null, '', window.location.pathname)
      }
    }
  }

  /**
   * Handles escape key press to close the mobile menu
   * @param event - Keyboard event
   */
  const handleEscKey = (event: KeyboardEvent): void => {
    if (event.key === 'Escape' && isMenuOpen.value) {
      closeMenu()
    }
  }

  /**
   * Initial hash check and handling
   */
  const checkInitialHash = (): void => {
    if (window.location.hash) {
      const hash = window.location.hash.substring(1) as Section
      if (hash === 'about' || hash === 'contact') {
        setTimeout(() => {
          handleHashLink(hash)
        }, 200)
      }
    }
  }

  // Lifecycle hooks
  onMounted(() => {
    // Set up event listeners
    window.addEventListener('scroll', handleScroll)
    window.addEventListener('keydown', handleEscKey)
    handleScroll() // Initialize on mount

    // Prevent body scroll when menu is open
    watch(isMenuOpen, newVal => {
      document.body.style.overflow = newVal ? 'hidden' : ''
    })

    // Initial check for hash in URL
    checkInitialHash()
  })

  onUnmounted(() => {
    // Clean up event listeners
    window.removeEventListener('scroll', handleScroll)
    window.removeEventListener('keydown', handleEscKey)
    document.body.style.overflow = '' // Reset overflow on unmount
  })
</script>

<style scoped>
  /* Layout variables */
  .layout {
    --header-height: 70px;
    --header-padding-normal: var(--spacing-md);
    --header-padding-scrolled: var(--spacing-sm);
    --header-background: rgba(6, 34, 46, 0.85);
    --header-background-scrolled: rgba(12, 35, 45, 0.95);
    --menu-transition: var(--transition-normal);
    --bar-height: 2px;
    --bar-spacing: 5px;
    --mobile-nav-width: 75%;
    --mobile-nav-max-width: 300px;

    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }

  /* ========== Header Styles ========== */
  .header {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    padding: var(--header-padding-normal) 0;
    background-color: var(--header-background);
    backdrop-filter: blur(10px);
    z-index: var(--z-header);
    border-bottom: 1px solid rgba(22, 240, 140, 0.1);
    transition: all var(--transition-normal);
    will-change: padding, background-color, box-shadow;
  }

  .header::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 1px;
    background: linear-gradient(
      90deg,
      rgba(22, 240, 140, 0) 0%,
      rgba(22, 240, 140, 0.3) 25%,
      rgba(22, 240, 140, 0.5) 50%,
      rgba(22, 240, 140, 0.3) 75%,
      rgba(22, 240, 140, 0) 100%
    );
  }

  .header.scrolled {
    padding: var(--header-padding-scrolled) 0;
    background-color: var(--header-background-scrolled);
    box-shadow: var(--shadow-md);
  }

  .header.scrolled::before {
    opacity: 0.7;
  }

  .header-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  /* ========== Logo Styles ========== */
  .logo {
    font-family: var(--font-family-heading);
    font-size: 1.5rem;
    font-weight: 700;
    position: relative;
    z-index: 2;
  }

  .logo a {
    color: var(--color-text);
    text-decoration: none;
    transition: color var(--transition-fast);
  }

  .logo-text {
    position: relative;
    display: inline-block;
    background: linear-gradient(90deg, var(--color-text) 70%, var(--color-primary) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-fill-color: transparent;
    transition: all var(--transition-normal);
  }

  .header.scrolled .logo-text {
    background: linear-gradient(90deg, var(--color-text) 50%, var(--color-primary) 100%);
    -webkit-background-clip: text;
    background-clip: text;
  }

  .logo-dot {
    color: var(--color-primary);
    opacity: 0.9;
    -webkit-text-fill-color: var(--color-primary);
  }

  .logo a:hover {
    color: var(--color-primary);
  }

  .logo a:hover .logo-dot {
    animation: pulseDot 1.5s infinite;
  }

  @keyframes pulseDot {
    0%,
    100% {
      opacity: 0.9;
    }
    50% {
      opacity: 0.5;
    }
  }

  /* ========== Mobile Menu Toggle ========== */
  .mobile-menu-toggle {
    display: none;
    background: transparent;
    border: none;
    cursor: pointer;
    padding: var(--spacing-xs);
    z-index: var(--z-overlay);
  }

  .mobile-menu-toggle .bar {
    display: block;
    width: 24px;
    height: var(--bar-height);
    margin: var(--bar-spacing) 0;
    background: var(--color-text);
    transition: all var(--transition-fast);
    will-change: transform, opacity;
  }

  /* ========== Navigation Styles ========== */
  .main-nav ul {
    display: flex;
    list-style: none;
    gap: var(--spacing-lg);
    position: relative;
  }

  .main-nav a {
    color: var(--color-text);
    text-decoration: none;
    font-weight: 500;
    transition: color var(--transition-fast);
    position: relative;
    font-size: 1rem;
    letter-spacing: 0.5px;
    padding: 0.25rem 0;
  }

  .main-nav a:hover,
  .main-nav a.router-link-exact-active,
  .main-nav a.active {
    color: var(--color-primary);
  }

  /* Active indicator with glow effect */
  .main-nav a::before,
  .main-nav a::after {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 0;
    width: 100%;
    height: 2px;
    transform: scaleX(0);
    transform-origin: right;
    transition:
      transform var(--transition-normal),
      opacity var(--transition-normal);
    opacity: 0;
    will-change: transform, opacity;
  }

  .main-nav a::before {
    background-color: var(--color-primary);
  }

  .main-nav a::after {
    background-color: var(--color-primary);
    filter: blur(4px);
  }

  .main-nav a:hover::before,
  .main-nav a.router-link-exact-active::before,
  .main-nav a.active::before,
  .main-nav a:hover::after,
  .main-nav a.router-link-exact-active::after,
  .main-nav a.active::after {
    transform: scaleX(1);
    transform-origin: left;
    opacity: 1;
  }

  .main-nav a:hover::after,
  .main-nav a.router-link-exact-active::after,
  .main-nav a.active::after {
    opacity: 0.6;
  }

  /* Special handling for hash links */
  .main-nav a.hash-link {
    color: var(--color-text);
  }

  .main-nav a.hash-link:hover {
    color: var(--color-primary);
  }

  .main-nav a.hash-link::before,
  .main-nav a.hash-link::after {
    transform: scaleX(0);
    opacity: 0;
  }

  .main-nav a.hash-link:hover::before,
  .main-nav a.hash-link:hover::after,
  .main-nav a.hash-link.active::before,
  .main-nav a.hash-link.active::after {
    transform: scaleX(1);
    opacity: 1;
  }

  .main-nav a.hash-link:hover::after,
  .main-nav a.hash-link.active::after {
    opacity: 0.6;
  }

  .main-nav a.hash-link.active {
    color: var(--color-primary);
  }

  /* ========== Main Content ========== */
  main {
    flex: 1;
    margin-top: var(--header-height);
  }

  /* ========== Footer Styles ========== */
  .footer {
    background-color: var(--color-surface);
    padding: var(--spacing-lg) 0;
    border-top: 1px solid var(--color-border);
  }

  .footer-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .footer-copyright {
    color: var(--color-text-muted);
  }

  .footer-social {
    display: flex;
    gap: var(--spacing-md);
  }

  .footer-social a {
    color: var(--color-text-muted);
    transition: color var(--transition-fast);
  }

  .footer-social a:hover {
    color: var(--color-primary);
  }

  /* ========== Menu Backdrop ========== */
  .menu-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(3px);
    z-index: calc(var(--z-overlay) - 1);
    opacity: 0;
    visibility: hidden;
    transition:
      opacity var(--transition-normal),
      visibility var(--transition-normal);
    will-change: opacity, visibility;
  }

  .menu-backdrop.active {
    opacity: 1;
    visibility: visible;
  }

  /* ========== Button Styles ========== */
  .btn-sm {
    padding: 0.4rem 0.8rem;
    font-size: 0.875rem;
  }

  .header-actions {
    display: flex;
    align-items: center;
  }

  .nav-actions {
    display: none;
    margin-top: var(--spacing-lg);
  }

  /* ========== Responsive Styles ========== */
  @media (max-width: 768px) {
    .mobile-menu-toggle {
      display: block;
    }

    .mobile-menu-toggle.open .bar:nth-child(1) {
      transform: translateY(7px) rotate(45deg);
    }

    .mobile-menu-toggle.open .bar:nth-child(2) {
      opacity: 0;
    }

    .mobile-menu-toggle.open .bar:nth-child(3) {
      transform: translateY(-7px) rotate(-45deg);
    }

    .main-nav {
      position: fixed;
      top: 0;
      right: 0;
      height: 100vh;
      width: var(--mobile-nav-width);
      max-width: var(--mobile-nav-max-width);
      background-color: var(--color-surface);
      padding: 5rem var(--spacing-lg) var(--spacing-lg);
      transform: translateX(100%);
      transition: transform var(--menu-transition);
      box-shadow: var(--shadow-lg);
      z-index: var(--z-overlay);
      will-change: transform;
    }

    .main-nav.open {
      transform: translateX(0);
    }

    .main-nav ul {
      flex-direction: column;
      gap: var(--spacing-lg);
      align-items: flex-start;
    }

    .main-nav a {
      font-size: 1.25rem;
      font-weight: 600;
    }

    .header-container {
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
    }

    .footer-content {
      flex-direction: column;
      gap: var(--spacing-md);
      text-align: center;
    }

    /* Improve the animation of menu items */
    .main-nav ul li {
      opacity: 0;
      transform: translateX(20px);
      transition:
        opacity var(--transition-normal),
        transform var(--transition-normal);
      transition-delay: calc(0.05s * var(--i, 0));
      will-change: opacity, transform;
    }

    .main-nav.open ul li {
      opacity: 1;
      transform: translateX(0);
    }

    .main-nav ul li:nth-child(1) {
      --i: 1;
    }
    .main-nav ul li:nth-child(2) {
      --i: 2;
    }
    .main-nav ul li:nth-child(3) {
      --i: 3;
    }
    .main-nav ul li:nth-child(4) {
      --i: 4;
    }
    .main-nav ul li:nth-child(5) {
      --i: 5;
    }

    .header-actions {
      display: none;
    }

    .nav-actions {
      display: block;
    }

    .main-nav a::before,
    .main-nav a::after {
      bottom: -2px;
      height: 1px;
    }
  }
</style>
