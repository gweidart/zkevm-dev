<template>
  <DefaultLayout>
    <section class="hero">
      <HeroAnimation />
      <div class="container hero-content">
        <h1>
          <span class="text-gradient">In the dark forest, only the best survive.</span>
          <span class="subtitle">Audits fail. Even the best protocols get hit.</span>
        </h1>
        <p class="tagline">
          Demand an audit that anticipates real-world attacks, not just reports.
        </p>
        <div class="hero-cta">
          <a href="#work" class="btn btn-primary">View Audit Reports</a>
          <a href="#contact" class="btn btn-outline">Get In Touch</a>
        </div>
      </div>
    </section>
    <section id="about" class="section about">
      <div class="container">
        <ScrollAnimationWrapper type="reveal">
          <h2 class="section-title">About</h2>
        </ScrollAnimationWrapper>

        <div class="about-content">
          <ScrollAnimationWrapper type="fade" :delay="100">
            <div class="about-profile">
              <GravatarCard username="zkevm" :animationDelay="0.2" />
            </div>
          </ScrollAnimationWrapper>

          <ScrollAnimationWrapper type="fade" :delay="200">
            <div class="about-text">
              <p>
                As a PhD Game Theorist turned Web3 Security Researcher, I possess extensive
                experience in smart contract vulnerability assessment, bridge security, dApp audits,
                penetration testing, CCSS audits, DORA compliance, Layer 2 solutions (such as
                zkEVM), and developing robust Web3 security frameworks.
              </p>
              <p>
                I believe Web3 security is not just about audits, but also about conducting business
                ethically by respecting the community, being honest with partners, acting
                responsibly, and valuing reputation. Combining my background in Game Theory and
                Security, I provide a unique perspective on scaling mission-critical applications
                safely and correctly.
              </p>
            </div>
          </ScrollAnimationWrapper>
        </div>
      </div>
    </section>
    <!-- Trusted by the best section -->
    <section class="section trusted-section">
      <CircularGradients />
      <div class="container">
        <ScrollAnimationWrapper type="reveal">
          <h2 class="section-title">Trusted by the Best</h2>
        </ScrollAnimationWrapper>

        <div class="partners-description">
          <p>My clients include leading projects across the Web3 ecosystem:</p>
        </div>

        <div v-if="isLoading" class="partners-loading">
          <div class="loading-spinner"></div>
          <p>Loading partners...</p>
        </div>

        <div v-else class="partners-grid">
          <div v-for="partner in partners" :key="partner" class="partner-item">
            <ScrollAnimationWrapper type="fade" :delay="100 + getPartnerIndex(partner) * 50">
              <PartnerLogo :partner-name="partner" :width="160" :height="67" />
            </ScrollAnimationWrapper>
          </div>
        </div>
      </div>
    </section>
    <section id="work" class="section work">
      <div class="container">
        <ScrollAnimationWrapper type="reveal">
          <h2 class="section-title">Featured Work</h2>
        </ScrollAnimationWrapper>

        <div class="work-cards">
          <a
            href="https://github.com/gweidart/audit-reports"
            target="_blank"
            rel="noopener noreferrer"
            class="work-card"
          >
            <ScrollAnimationWrapper type="fade" :delay="100">
              <div class="work-card-inner">
                <div class="work-card-icon">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="feather feather-shield"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                    <path d="M12 8v4M10 10h4"></path>
                  </svg>
                </div>
                <div class="work-card-content">
                  <h3>Audit Reports</h3>
                  <p>
                    View my collection of security audit reports for various blockchain protocols,
                    smart contracts, and DeFi applications. Detailed vulnerability assessments and
                    recommendations.
                  </p>
                  <div class="work-card-footer">
                    <span class="work-card-link">View on GitHub <span class="arrow">→</span></span>
                    <div class="work-tags">
                      <span>Security</span>
                      <span>Reports</span>
                      <span>Audits</span>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollAnimationWrapper>
          </a>

          <a
            href="https://blog.zkevm.dev"
            target="_blank"
            rel="noopener noreferrer"
            class="work-card"
          >
            <ScrollAnimationWrapper type="fade" :delay="200">
              <div class="work-card-inner">
                <div class="work-card-icon">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="feather feather-book-open"
                  >
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                  </svg>
                </div>
                <div class="work-card-content">
                  <h3>Security Research</h3>
                  <p>
                    Read my latest security research on zero-knowledge proofs, Layer 2 solutions,
                    and emerging blockchain vulnerabilities. Insights, discoveries, and best
                    practices.
                  </p>
                  <div class="work-card-footer">
                    <span class="work-card-link">Visit Blog <span class="arrow">→</span></span>
                    <div class="work-tags">
                      <span>Research</span>
                      <span>ZK</span>
                      <span>Layer 2</span>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollAnimationWrapper>
          </a>
        </div>
      </div>
    </section>
    <section id="contact" class="section contact">
      <div class="container">
        <ScrollAnimationWrapper type="reveal">
          <h2 class="section-title">Get in Touch</h2>
        </ScrollAnimationWrapper>

        <ScrollAnimationWrapper type="fade" :delay="100">
          <div class="contact-content">
            <p class="contact-text">
              Interested in working together or have a security inquiry? I'm always open to
              discussing new projects, security audits, or research opportunities.
            </p>
            <a href="mailto:audits@zkevm.dev" class="btn btn-primary contact-btn">
              audits@zkevm.dev
            </a>
            <div class="contact-socials">
              <a
                href="https://twitter.com/utxok"
                target="_blank"
                rel="noopener noreferrer"
                class="social-link"
              >
                <span class="social-icon">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
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
                </span>
                Twitter
              </a>
              <a
                href="https://github.com/gweidart"
                target="_blank"
                rel="noopener noreferrer"
                class="social-link"
              >
                <span class="social-icon">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
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
                </span>
                GitHub
              </a>
            </div>
          </div>
        </ScrollAnimationWrapper>
      </div>
    </section>
    <SectionTransition
      type="wave"
      :height="120"
      topColor="var(--color-background)"
      bottomColor="var(--color-surface)"
      :speed="0.8"
    />
  </DefaultLayout>
</template>

<script setup lang="ts">
  import DefaultLayout from '~/components/layout/DefaultLayout.vue'
  import HeroAnimation from '~/components/animations/HeroAnimation.vue'
  import CircularGradients from '~/components/animations/CircularGradients.vue'
  import ScrollAnimationWrapper from '~/components/common/ScrollAnimationWrapper.vue'
  import PartnerLogo from '~/components/partners/PartnerLogo.vue'
  import SectionTransition from '~/components/animations/SectionTransition.vue'
  import { ref, onMounted } from 'vue'
  import GravatarCard from '~/components/profile/GravatarCard.vue'

  // Partners list
  const partners = ref<string[]>([])
  const isLoading = ref(true)

  // Get partner index for animation delay
  const getPartnerIndex = (partner: string): number => {
    return partners.value.indexOf(partner)
  }

  // Load partners list
  onMounted(async () => {
    isLoading.value = true

    try {
      // Default partners list
      const partnersList = [
        'zksync',
        'starknet',
        'ef',
        'chainlink',
        'lido',
        'gnosis',
        'oz',
        'solady',
        'ganache',
        'ether-fi',
        'symbiotic',
        'zerocap',
      ]

      partners.value = partnersList
    } catch (error) {
      console.error('Failed to initialize partners:', error)
    } finally {
      isLoading.value = false
    }
  })
</script>

<style scoped>
  .hero {
    position: relative;
    height: 100vh;
    min-height: 600px;
    display: flex;
    align-items: center;
    overflow: hidden;
  }

  .hero-content {
    position: relative;
    z-index: var(--z-default);
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    max-width: 900px;
    margin: 0 auto;
  }

  h1 {
    font-size: 2.7rem;
    line-height: 1;
    margin-bottom: var(--spacing-md);
    display: flex;
    flex-direction: column;
  }

  .subtitle {
    font-size: 2rem;
    font-weight: 500;
    margin-top: var(--spacing-lg);
    opacity: 0.8;
    color: var(--color-text-muted);
  }

  .text-gradient {
    background: linear-gradient(to right, var(--color-primary), var(--color-secondary));
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    display: inline-block;
  }

  .tagline {
    font-size: 1.5rem;
    margin-bottom: var(--spacing-lg);
    max-width: 600px;
    color: var(--color-accent);
    font-weight: 500;
  }

  .hero-cta {
    display: flex;
    gap: var(--spacing-md);
    justify-content: center;
  }

  .section-title {
    position: relative;
    margin-bottom: var(--spacing-xl);
    display: inline-block;
  }

  .section-title::after {
    content: '';
    position: absolute;
    left: 0;
    bottom: -10px;
    width: 60%;
    height: 4px;
    background: var(--color-primary);
    border-radius: 2px;
  }

  /* About Section */
  .about {
    background-color: var(--color-surface);
    position: relative;
    padding: var(--spacing-xl) 0;
  }

  .about-content {
    display: grid;
    grid-template-columns: minmax(415px, 1fr) 2fr;
    gap: var(--spacing-xl);
    align-items: start;
  }

  .about-profile {
    position: relative;
    height: auto;
    width: 100%;
    overflow: visible;
  }

  .about-text {
    padding: var(--spacing-md) 0;
  }

  .about-text p {
    margin-bottom: var(--spacing-md);
    font-size: 1.2rem;
    line-height: 1.7;
    color: var(--color-text);
    text-shadow: 0 1px 1px rgba(0, 0, 0, 0.2);
  }

  .about-text p:last-child {
    margin-bottom: 0;
  }

  /* Trusted by the best section */
  .trusted-section {
    background-color: var(--color-surface);
    padding-top: var(--spacing-xl);
    padding-bottom: var(--spacing-xl);
    border-top: 1px solid var(--color-border);
    border-bottom: 1px solid var(--color-border);
    position: relative;
    overflow: hidden;
  }

  .partners-description {
    text-align: center;
    margin-bottom: var(--spacing-xl);
    color: var(--color-text-muted);
    font-size: 1.4rem;
    position: relative;
    z-index: 1;
  }

  .partners-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: var(--spacing-xl) var(--spacing-xl);
    justify-items: center;
    align-items: center;
    position: relative;
    z-index: 1;
  }

  .partner-item {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: var(--spacing-lg);
    border-radius: var(--radius-md);
    transition: background-color var(--transition-normal);
  }

  .partner-item:hover {
    background-color: rgba(255, 255, 255, 0.03);
  }

  /* Partner logo styles are now in PartnerLogo.vue component */

  /* Add loading spinner styles */
  .partners-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--spacing-xl) 0;
  }

  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid var(--color-surface-variant);
    border-top: 3px solid var(--color-primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: var(--spacing-md);
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  /* Work Section - Updated */
  .work-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
    gap: var(--spacing-lg);
  }

  .work-card {
    text-decoration: none;
    color: var(--color-text);
    display: block;
    border-radius: var(--radius-md);
    overflow: hidden;
    height: 100%;
    transition: transform var(--transition-normal);
  }

  .work-card:hover {
    transform: translateY(-5px);
  }

  .work-card-inner {
    background-color: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: var(--spacing-lg);
    display: flex;
    flex-direction: column;
    height: 100%;
    transition:
      box-shadow var(--transition-normal),
      border-color var(--transition-normal);
  }

  .work-card:hover .work-card-inner {
    box-shadow: var(--shadow-md);
    border-color: var(--color-primary);
  }

  .work-card-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: var(--spacing-md);
    color: var(--color-primary);
  }

  .work-card-content {
    flex: 1;
  }

  .work-card-content h3 {
    margin-bottom: var(--spacing-sm);
    color: var(--color-primary);
    transition: color var(--transition-normal);
  }

  .work-card:hover .work-card-content h3 {
    color: var(--color-primary-variant);
  }

  .work-card-footer {
    margin-top: var(--spacing-md);
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
  }

  .work-card-link {
    display: inline-flex;
    align-items: center;
    color: var(--color-primary);
    font-weight: 500;
  }

  .arrow {
    transition: transform var(--transition-normal);
    margin-left: var(--spacing-xs);
  }

  .work-card:hover .arrow {
    transform: translateX(5px);
  }

  .work-tags {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-xs);
    margin-top: var(--spacing-sm);
  }

  .work-tags span {
    background-color: var(--color-surface-variant);
    color: var(--color-secondary);
    padding: 0.25rem 0.5rem;
    border-radius: var(--radius-sm);
    font-size: 0.875rem;
  }

  /* Media queries for work section */
  @media (max-width: 992px) {
    h1 {
      font-size: 3.5rem;
    }

    .about-content {
      grid-template-columns: 1fr;
      gap: var(--spacing-lg);
    }

    .about-profile {
      order: 1; /* Move profile to top on mobile */
      margin-bottom: var(--spacing-lg);
    }

    .about-text {
      order: 2;
    }

    .partners-grid {
      grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
    }

    .work-cards {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 768px) {
    h1 {
      font-size: 3rem;
    }

    .tagline {
      font-size: 1.25rem;
    }

    .hero-cta {
      flex-direction: column;
      width: 100%;
      max-width: 300px;
    }

    .hero-cta .btn {
      width: 100%;
    }

    .contact-socials {
      flex-direction: column;
      align-items: center;
      gap: var(--spacing-md);
    }

    .partners-grid {
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: var(--spacing-lg);
    }

    .text-gradient {
      font-size: 2.7rem;
    }

    .subtitle {
      font-size: 2rem;
    }

    .tagline {
      font-size: 1.5rem;
    }

    .work-card-inner {
      padding: var(--spacing-md);
    }

    .work-card-icon svg {
      width: 36px;
      height: 36px;
    }
  }

  @media (max-width: 576px) {
    h1 {
      font-size: 2.7rem;
    }

    .section-title {
      font-size: 2rem;
    }

    .partners-grid {
      grid-template-columns: repeat(1, 1fr);
      max-width: 220px;
      margin: 0 auto;
    }
  }

  /* Contact Section */
  .contact-content {
    max-width: 600px;
    margin: 0 auto;
    text-align: center;
  }

  .contact-text {
    font-size: 1.25rem;
    margin-bottom: var(--spacing-lg);
  }

  .contact-btn {
    margin-bottom: var(--spacing-lg);
    padding: var(--spacing-md) var(--spacing-lg);
  }

  .contact-socials {
    display: flex;
    justify-content: center;
    gap: var(--spacing-xl);
  }

  .social-link {
    position: relative;
    color: var(--color-text);
    transition: color var(--transition-normal);
    display: flex;
    align-items: center;
    padding: 0.5rem;
  }

  .social-icon {
    display: inline-flex;
    margin-right: 0.5rem;
    color: var(--color-primary);
  }

  .social-link:hover {
    color: var(--color-primary);
  }

  .social-link::after {
    content: '';
    position: absolute;
    bottom: -5px;
    left: 0;
    width: 0;
    height: 2px;
    background-color: var(--color-primary);
    transition: width var(--transition-normal);
  }

  .social-link:hover::after {
    width: 100%;
  }
</style>
