<template>
  <DefaultLayout>
    <div class="research-page">
      <section class="hero research-hero">
        <div class="container">
          <h1 class="section-title">Research</h1>
          <p class="hero-text">
            Exploring the cutting edge of Web3 security, zkEVM vulnerabilities, and the evolving
            landscape of blockchain protocol security.
          </p>
        </div>
      </section>

      <section class="section">
        <div class="container">
          <ScrollAnimationWrapper type="stagger" childrenSelector=".research-item">
            <div class="research-grid">
              <div class="research-item">
                <div class="research-content">
                  <span class="research-date">March 2024</span>
                  <h2>Vulnerabilities in zkEVM State Transition Proofs</h2>
                  <p>
                    An analysis of potential attack vectors in zkEVM implementations, focusing on
                    the verification of state transition proofs and the implications for cross-chain
                    security.
                  </p>
                  <div class="research-tags">
                    <span>zkEVM</span>
                    <span>Zero Knowledge</span>
                    <span>L2 Security</span>
                  </div>
                  <a href="#" class="btn btn-outline research-btn">Read Paper</a>
                </div>
              </div>

              <div class="research-item">
                <div class="research-content">
                  <span class="research-date">January 2024</span>
                  <h2>MEV Protection Strategies for ZK-Rollups</h2>
                  <p>
                    A comprehensive guide to mitigating Maximal Extractable Value (MEV) in the
                    context of ZK-Rollups, with practical solutions for protocol designers and
                    implementers.
                  </p>
                  <div class="research-tags">
                    <span>MEV</span>
                    <span>ZK-Rollups</span>
                    <span>DeFi</span>
                  </div>
                  <a href="#" class="btn btn-outline research-btn">Read Paper</a>
                </div>
              </div>

              <div class="research-item">
                <div class="research-content">
                  <span class="research-date">November 2023</span>
                  <h2>Secure Bridge Architectures for Cross-Chain Communication</h2>
                  <p>
                    An evaluation of bridge security architectures with a focus on zk-based
                    approaches, highlighting best practices and emerging patterns for secure
                    cross-chain communication.
                  </p>
                  <div class="research-tags">
                    <span>Bridges</span>
                    <span>Interoperability</span>
                    <span>Security</span>
                  </div>
                  <a href="#" class="btn btn-outline research-btn">Read Paper</a>
                </div>
              </div>

              <div class="research-item">
                <div class="research-content">
                  <span class="research-date">September 2023</span>
                  <h2>Formal Verification Methods for Smart Contracts</h2>
                  <p>
                    A deep dive into formal verification techniques for smart contracts, with a
                    special focus on their application to zkEVM-compatible contracts and the unique
                    challenges they present.
                  </p>
                  <div class="research-tags">
                    <span>Formal Verification</span>
                    <span>Smart Contracts</span>
                    <span>zkEVM</span>
                  </div>
                  <a href="#" class="btn btn-outline research-btn">Read Paper</a>
                </div>
              </div>

              <div class="research-item">
                <div class="research-content">
                  <span class="research-date">July 2023</span>
                  <h2>Dark Forest Game Theory in Web3 Security</h2>
                  <p>
                    An exploration of game-theoretic approaches to Web3 security, drawing parallels
                    with the "dark forest" metaphor and its implications for security researchers
                    and protocol designers.
                  </p>
                  <div class="research-tags">
                    <span>Game Theory</span>
                    <span>Web3</span>
                    <span>Security</span>
                  </div>
                  <a href="#" class="btn btn-outline research-btn">Read Paper</a>
                </div>
              </div>
            </div>
          </ScrollAnimationWrapper>
        </div>
      </section>

      <section class="section cta-section">
        <div class="container">
          <ScrollAnimationWrapper type="fade">
            <div class="cta-content">
              <h2>Collaborate on Research</h2>
              <p>
                Interested in collaborating on cutting-edge Web3 security research? I'm always open
                to partnerships with researchers, protocols, and organizations working to advance
                the state of blockchain security.
              </p>
              <a href="mailto:research@zkevm.dev" class="btn btn-primary">Get in Touch</a>
            </div>
          </ScrollAnimationWrapper>
        </div>
      </section>
    </div>
  </DefaultLayout>
</template>

<script setup lang="ts">
  import DefaultLayout from '~/components/layout/DefaultLayout.vue'
  import ScrollAnimationWrapper from '~/components/common/ScrollAnimationWrapper.vue'
  import { useSeoMeta, useRuntimeConfig } from '#app'

  // SEO Meta for the Research Page
  const siteUrl = useRuntimeConfig().public.siteUrl as string;
  const pageTitle = 'Security Research';
  const pageDescription = 'Explore cutting-edge Web3 security research on zkEVM, MEV protection, secure bridge architectures, and formal verification by zkEVM.dev.';

  useSeoMeta({
    title: pageTitle,
    description: pageDescription,
    ogTitle: `${pageTitle} - zkEVM.dev`,
    ogDescription: pageDescription,
    ogUrl: `${siteUrl}/research`,
    twitterTitle: `${pageTitle} - zkEVM.dev`,
    twitterDescription: pageDescription,
    ogImage: `${siteUrl}/og.png`,
    twitterImage: `${siteUrl}/og.png`,
    twitterCard: 'summary_large_image',
  });
</script>

<style scoped>
  .research-page {
    padding-bottom: var(--spacing-xl);
  }

  .research-hero {
    padding: var(--spacing-xl) 0;
    background-color: var(--color-surface);
    border-bottom: 1px solid var(--color-border);
  }

  .hero-text {
    max-width: 800px;
    font-size: 1.25rem;
    margin-top: var(--spacing-md);
    color: var(--color-text-muted);
  }

  .research-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--spacing-xl);
  }

  .research-item {
    background-color: var(--color-surface);
    border-radius: var(--radius-md);
    overflow: hidden;
    transition:
      transform var(--transition-normal),
      box-shadow var(--transition-normal);
    box-shadow: var(--shadow-sm);
  }

  .research-item:hover {
    transform: translateY(-5px);
    box-shadow: var(--shadow-md);
  }

  .research-content {
    padding: var(--spacing-lg);
  }

  .research-date {
    display: inline-block;
    font-size: 0.875rem;
    color: var(--color-text-muted);
    margin-bottom: var(--spacing-sm);
  }

  .research-content h2 {
    font-size: 1.5rem;
    margin-bottom: var(--spacing-md);
    color: var(--color-primary);
  }

  .research-content p {
    margin-bottom: var(--spacing-md);
  }

  .research-tags {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-xs);
    margin-bottom: var(--spacing-md);
  }

  .research-tags span {
    background-color: var(--color-surface-variant);
    color: var(--color-secondary);
    padding: 0.25rem 0.5rem;
    border-radius: var(--radius-sm);
    font-size: 0.875rem;
  }

  .research-btn {
    margin-top: var(--spacing-sm);
  }

  .cta-section {
    background-color: var(--color-surface);
    border-radius: var(--radius-lg);
    margin-top: var(--spacing-xl);
  }

  .cta-content {
    text-align: center;
    max-width: 800px;
    margin: 0 auto;
    padding: var(--spacing-lg) 0;
  }

  .cta-content h2 {
    margin-bottom: var(--spacing-md);
    color: var(--color-primary);
  }

  .cta-content p {
    margin-bottom: var(--spacing-lg);
    color: var(--color-text-muted);
    font-size: 1.125rem;
  }

  @media (min-width: 768px) {
    .research-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (min-width: 1200px) {
    .research-grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }
</style>
