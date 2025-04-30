<template>
  <div
    ref="trackerRef"
    class="fps-tracker"
    :class="{
      'is-warning': isWarning,
      'is-danger': isDanger,
      'is-expanded': showDetails,
    }"
    @click="toggleDetails"
    :title="showDetails ? 'Click to hide details' : 'Click to show performance details'"
  >
    <div class="fps-value">{{ fps }} FPS</div>
    <div class="performance-indicator">
      <div
        class="performance-bar"
        :style="{
          width: `${performancePercentage}%`,
          backgroundColor: performanceColor,
        }"
      ></div>
    </div>
    <transition name="fade">
      <div v-if="showDetails" class="details">
        <div class="detail-row">
          <span class="detail-label">Status:</span>
          <span class="detail-value" :style="{ color: performanceColor }">{{
            performanceStatus
          }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Average:</span>
          <span class="detail-value">{{ averageFps }} FPS</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Min:</span>
          <span class="detail-value">{{ minFps }} FPS</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Max:</span>
          <span class="detail-value">{{ maxFps }} FPS</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">History:</span>
          <div class="history-chart">
            <div
              v-for="(value, index) in fpsHistory"
              :key="index"
              class="history-bar"
              :style="{
                height: `${Math.min(100, (value / 60) * 100)}%`,
                backgroundColor: getColorForFps(value),
              }"
            ></div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
  import { useFPS } from '~/utils/performance'

  /**
   * FPS performance thresholds
   */
  interface PerformanceThresholds {
    /** FPS below this value is considered a warning */
    warning: number
    /** FPS below this value is considered a danger/poor performance */
    danger: number
    /** Target FPS to consider 100% performance */
    target: number
  }

  // Performance settings
  const thresholds: PerformanceThresholds = {
    warning: 45,
    danger: 30,
    target: 60,
  }

  // Track component reference for event handling (Removed: Unused)
  // const trackerRef = ref<HTMLElement | null>(null);

  // Get performance metrics from enhanced useFPS utility
  const { fps, fpsHistory, averageFps, minFps, maxFps } = useFPS(300, 20, thresholds.warning)

  // Toggle for detailed view
  const showDetails = ref(false)

  // Computed properties for styling and display
  const isWarning = computed(() => fps.value < thresholds.warning && fps.value >= thresholds.danger)

  const isDanger = computed(() => fps.value < thresholds.danger)

  const performancePercentage = computed(() => {
    const percentage = Math.min(100, (fps.value / thresholds.target) * 100)
    return Math.max(0, percentage)
  })

  const performanceColor = computed(() => {
    if (isDanger.value) return 'var(--color-error, #ff4c4c)'
    if (isWarning.value) return 'var(--color-warning, #ffff00)'
    return 'var(--color-success, #4cff4c)'
  })

  const performanceStatus = computed(() => {
    if (isDanger.value) return 'Poor'
    if (isWarning.value) return 'Moderate'
    return 'Good'
  })

  /**
   * Get color for a specific FPS value
   */
  function getColorForFps(value: number): string {
    if (value < thresholds.danger) return 'var(--color-error, #ff4c4c)'
    if (value < thresholds.warning) return 'var(--color-warning, #ffff00)'
    return 'var(--color-success, #4cff4c)'
  }

  /**
   * Toggle details view
   */
  function toggleDetails(): void {
    showDetails.value = !showDetails.value
  }

  // Event handling for component
  onMounted(() => {
    // Add escape key handler to close details
    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showDetails.value) {
        showDetails.value = false
      }
    }

    // Register event listeners
    window.addEventListener('keydown', handleKeydown)

    // Clean up on unmount
    onBeforeUnmount(() => {
      window.removeEventListener('keydown', handleKeydown)
    })
  })
</script>

<style scoped>
  .fps-tracker {
    position: fixed;
    top: 10px;
    right: 10px;
    background-color: rgba(0, 0, 0, 0.8);
    color: var(--color-success, #4cff4c);
    padding: 8px 12px;
    font-family: monospace;
    font-size: 12px;
    border-radius: 6px;
    z-index: 9999;
    min-width: 80px;
    cursor: pointer;
    transition: all 0.3s ease;
    user-select: none;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(4px);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .fps-tracker:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  }

  .fps-tracker.is-expanded {
    min-width: 180px;
  }

  .fps-value {
    font-weight: bold;
    text-align: center;
    margin-bottom: 4px;
    font-size: 14px;
  }

  .fps-tracker.is-warning {
    color: var(--color-warning, #ffff00);
  }

  .fps-tracker.is-danger {
    color: var(--color-error, #ff4c4c);
  }

  .performance-indicator {
    width: 100%;
    height: 4px;
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 2px;
    overflow: hidden;
    margin-bottom: 2px;
  }

  .performance-bar {
    height: 100%;
    transition:
      width 0.3s ease,
      background-color 0.3s ease;
  }

  /* Details section */
  .details {
    margin-top: 8px;
    font-size: 11px;
    color: rgba(255, 255, 255, 0.85);
    line-height: 1.5;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    padding-top: 8px;
  }

  .detail-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px;
  }

  .detail-label {
    font-weight: 500;
    opacity: 0.8;
  }

  .detail-value {
    font-weight: bold;
  }

  /* FPS History chart */
  .history-chart {
    display: flex;
    align-items: flex-end;
    height: 30px;
    width: 100%;
    gap: 1px;
    margin-top: 4px;
    background-color: rgba(0, 0, 0, 0.2);
    border-radius: 2px;
    overflow: hidden;
  }

  .history-bar {
    flex: 1;
    min-width: 3px;
    border-radius: 1px 1px 0 0;
    transition: height 0.2s ease;
  }

  /* Animations */
  .fade-enter-active,
  .fade-leave-active {
    transition:
      opacity 0.3s ease,
      transform 0.3s ease;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
    transform: translateY(-10px);
  }

  /* Make component more subtle on small screens */
  @media (max-width: 768px) {
    .fps-tracker {
      top: 5px;
      right: 5px;
      padding: 6px 8px;
      font-size: 10px;
      min-width: 60px;
    }

    .fps-value {
      font-size: 12px;
    }

    .performance-indicator {
      height: 3px;
    }
  }
</style>
