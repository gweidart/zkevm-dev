<template>
  <div
    ref="canvasContainer"
    class="hero-animation"
    :class="{ 'reduced-motion': reduceMotion }"
    :aria-hidden="true"
  ></div>
</template>

<script setup lang="ts">
  import { ref, onMounted, onBeforeUnmount, computed, reactive, watch } from 'vue'
  import * as THREE from 'three'
  import gsap from 'gsap'

  /**
   * Configuration props for the hero animation
   */
  interface Props {
    /** Whether animation should play */
    play?: boolean
    /** Particle count */
    particleCount?: number
    /** Particle size */
    particleSize?: number
    /** Primary color (hex value) */
    primaryColor?: string
    /** Secondary color (hex value) */
    secondaryColor?: string
    /** Accent color (hex value) */
    accentColor?: string
    /** Connection color (hex value) */
    connectionColor?: string
    /** Background color (hex value) */
    backgroundColor?: string
    /** How far particles spread from center */
    particleSpread?: number
    /** Camera distance */
    cameraPosition?: number
    /** Maximum distance for particle connections */
    connectionDistance?: number
    /** Whether to respect reduced motion preferences */
    respectReducedMotion?: boolean
    /** Particle reduction factor for mobile devices (0-1) */
    mobileParticleReduction?: number
    /** Whether to enable mouse interaction */
    enableMouseInteraction?: boolean
    /** Whether to enable spark effects */
    enableSparkEffects?: boolean
    /** Whether to automatically optimize performance */
    autoOptimize?: boolean
    /** Animation speed factor */
    animationSpeed?: number
  }

  // Default configuration values
  const props = withDefaults(defineProps<Props>(), {
    play: true,
    particleCount: 1500,
    particleSize: 0.03,
    primaryColor: '#16f08c', // Primary color - mint green
    secondaryColor: '#d5b2c9', // Secondary color - soft mauve
    accentColor: '#d86475', // Accent color - coral
    connectionColor: '#193642', // Color for particle connections - dark teal
    backgroundColor: '#031118', // Dark teal background
    particleSpread: 15,
    cameraPosition: 5,
    connectionDistance: 1.5,
    respectReducedMotion: true,
    mobileParticleReduction: 0.5,
    enableMouseInteraction: true,
    enableSparkEffects: true,
    autoOptimize: true,
    animationSpeed: 1.0,
  })

  /**
   * Events emitted by the component
   */
  const emit = defineEmits<{
    /** Animation has been initialized */
    (e: 'initialized'): void
    /** Animation has started playing */
    (e: 'play'): void
    /** Animation has been paused */
    (e: 'pause'): void
    /** Performance has been automatically optimized */
    (e: 'optimized', details: { particleCount: number; fps: number }): void
    /** FPS has dropped below threshold */
    (e: 'fps-warning', fps: number): void
  }>()

  // Canvas container reference
  const canvasContainer = ref<HTMLElement | null>(null)

  // Animation state
  const state = reactive({
    isActive: true,
    isInitialized: false,
    isPaused: false,
    isMobile: false,
    reduceMotion: false,
    currentFps: 0,
    particleCount: props.particleCount,
  })

  // Calculate derived values based on props
  const config = computed(() => ({
    particleCount: Math.floor(
      state.isMobile ? props.particleCount * props.mobileParticleReduction : props.particleCount
    ),
    particleSize: props.particleSize,
    particleColor: new THREE.Color(props.primaryColor),
    secondaryColor: new THREE.Color(props.secondaryColor),
    accentColor: new THREE.Color(props.accentColor),
    connectionColor: new THREE.Color(props.connectionColor),
    backgroundColor: new THREE.Color(props.backgroundColor),
    particleSpread: props.particleSpread,
    cameraPosition: props.cameraPosition,
    connectionDistance: props.connectionDistance,
    animationSpeed: props.animationSpeed,
    depthFactor: 0.4, // How much depth affects color
    connectionOpacity: 0.05, // Opacity of connections
    maxConnections: 3, // Maximum connections per particle
    sparkCount: 15, // Number of spark particles when triggered
    sparkLifetime: 2.0, // Lifetime of spark particles in seconds
    sparkTriggerThreshold: 0.05, // Mouse speed threshold to trigger sparks
    sparkSize: 0.08, // Size of spark particles
  }))

  // Scene objects
  let scene: THREE.Scene
  let camera: THREE.PerspectiveCamera
  let renderer: THREE.WebGLRenderer
  let particles: THREE.Points
  let particleConnections: THREE.LineSegments
  let sparkParticles: THREE.Points | null = null
  let clock: THREE.Clock
  let animationFrameId: number

  // Mouse/interaction state
  const mouse = reactive({
    position: new THREE.Vector2(0, 0),
    speed: new THREE.Vector2(0, 0),
    lastSparkTime: 0,
    influenceRadius: 3,
    influenceStrength: 0.05,
  })

  // Performance monitoring
  const performance = reactive({
    fpsHistory: [] as number[],
    fpsWarningThreshold: 30,
    fpsWarningCount: 0,
    lastOptimizationTime: 0,
    optimizationCooldown: 5000, // ms between optimizations
  })

  // Reduced motion detection
  const reduceMotion = computed(() => {
    return state.reduceMotion && props.respectReducedMotion
  })

  // Shader code for custom particles
  const vertexShader = `
  attribute float size;
  attribute float phase;
  attribute vec3 color;
  varying vec3 vColor;
  varying float vPhase;
  varying float vDepth;
  
  void main() {
    vColor = color;
    vPhase = phase;
    
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = size * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
    
    // Pass normalized depth to fragment shader (0 = near, 1 = far)
    vDepth = (gl_Position.z + 1.0) * 0.5;
  }
`

  const fragmentShader = `
  uniform float opacity;
  uniform float time;
  varying vec3 vColor;
  varying float vPhase;
  varying float vDepth;
  
  void main() {
    // Calculate distance from center of point
    vec2 center = gl_PointCoord - 0.5;
    float dist = length(center);
    
    // Soft circle with enhanced edge definition
    float fade = 1.0 - smoothstep(0.3, 0.5, dist);
    
    // Depth-based glow intensity - particles further away have softer glow
    float depthFactor = mix(1.0, 0.6, vDepth);
    
    // Enhanced pulsing effect for better visibility with new colors
    float pulse = 0.15 * sin(time * 0.5 + vPhase * 10.0) * (1.0 - vDepth);
    
    // Apply stronger glow effect with depth factor
    float glow = exp(-2.8 * dist * depthFactor) + pulse;
    
    // Final color with enhanced glow
    gl_FragColor = vec4(vColor, fade * glow * opacity);
  }
`

  // Spark particle shaders
  const sparkVertexShader = `
  attribute float size;
  attribute float age;
  attribute float maxAge;
  attribute vec3 velocity;
  uniform float time;
  varying float vOpacity;
  
  void main() {
    // Age factor (1.0 at creation, 0.0 at end of life)
    float ageFactor = 1.0 - (age / maxAge);
    vOpacity = ageFactor;
    
    // Position updated by velocity and time
    vec3 pos = position + velocity * age;
    
    // Slightly curved trajectory
    pos.y -= 0.5 * age * age; // Gravity effect
    
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = size * (300.0 / -mvPosition.z) * ageFactor;
    gl_Position = projectionMatrix * mvPosition;
  }
`

  const sparkFragmentShader = `
  uniform vec3 primaryColor;
  uniform vec3 accentColor;
  varying float vOpacity;
  
  void main() {
    vec2 center = gl_PointCoord - 0.5;
    float dist = length(center);
    
    // Stronger glow in center
    float fade = 1.0 - smoothstep(0.1, 0.5, dist);
    
    // Star-like shape
    float brightness = fade * 1.5;
    
    // Primary to accent color glow
    vec3 color = mix(primaryColor, accentColor, 1.0 - brightness);
    
    gl_FragColor = vec4(color, fade * vOpacity);
  }
`

  /**
   * Check if device is mobile
   */
  const checkMobileDevice = (): boolean => {
    state.isMobile = window.innerWidth < 768
    return state.isMobile
  }

  /**
   * Check if reduced motion is preferred
   */
  const checkReducedMotion = (): boolean => {
    if (typeof window === 'undefined') return false
    state.reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    return state.reduceMotion
  }

  /**
   * Initialize Three.js scene
   */
  const initScene = () => {
    // Determine if mobile device
    checkMobileDevice()
    checkReducedMotion()

    // Create scene with background
    scene = new THREE.Scene()
    scene.background = config.value.backgroundColor

    // Create camera
    const aspect = canvasContainer.value!.clientWidth / canvasContainer.value!.clientHeight
    camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000)
    camera.position.z = config.value.cameraPosition

    // Create renderer with proper settings for performance
    renderer = new THREE.WebGLRenderer({
      antialias: !state.isMobile, // Disable antialiasing on mobile for better performance
      alpha: false,
      powerPreference: 'high-performance',
    })

    renderer.setSize(canvasContainer.value!.clientWidth, canvasContainer.value!.clientHeight)
    // Set pixel ratio with cap for performance
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, state.isMobile ? 2 : 3))
    canvasContainer.value!.appendChild(renderer.domElement)

    // Create particles
    createParticles()

    // Create connections between particles
    createParticleConnections()

    // Initialize animation clock
    clock = new THREE.Clock()

    // Add event listeners only if interaction is enabled
    if (props.enableMouseInteraction) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('touchmove', handleTouchMove, { passive: true })
    }

    // Always add resize listener
    window.addEventListener('resize', handleResize)

    // Mark as initialized
    state.isInitialized = true
    emit('initialized')
  }

  /**
   * Handle touch movement (mobile)
   */
  const handleTouchMove = (event: TouchEvent) => {
    if (!props.enableMouseInteraction || reduceMotion.value) return

    if (event.touches.length > 0) {
      // Calculate normalized device coordinates (-1 to +1)
      const rect = canvasContainer.value!.getBoundingClientRect()
      const touch = event.touches[0]
      const x = ((touch.clientX - rect.left) / canvasContainer.value!.clientWidth) * 2 - 1
      const y = -((touch.clientY - rect.top) / canvasContainer.value!.clientHeight) * 2 + 1

      // Calculate touch speed
      mouse.speed.x = x - mouse.position.x
      mouse.speed.y = y - mouse.position.y

      // Update mouse position
      mouse.position.x = x
      mouse.position.y = y

      // Check if speed exceeds threshold for spark effect
      if (props.enableSparkEffects) {
        checkSparkTrigger()
      }
    }
  }

  /**
   * Handle mouse movement
   */
  const handleMouseMove = (event: MouseEvent) => {
    if (!props.enableMouseInteraction || reduceMotion.value) return

    // Calculate normalized device coordinates (-1 to +1)
    const rect = canvasContainer.value!.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / canvasContainer.value!.clientWidth) * 2 - 1
    const y = -((event.clientY - rect.top) / canvasContainer.value!.clientHeight) * 2 + 1

    // Calculate mouse speed (for influence strength)
    mouse.speed.x = x - mouse.position.x
    mouse.speed.y = y - mouse.position.y

    // Update mouse position
    mouse.position.x = x
    mouse.position.y = y

    // Check if speed exceeds threshold for spark effect
    if (props.enableSparkEffects) {
      checkSparkTrigger()
    }
  }

  /**
   * Check if we should trigger spark effect
   */
  const checkSparkTrigger = () => {
    const speed = new THREE.Vector2(mouse.speed.x, mouse.speed.y).length()
    const currentTime = clock.getElapsedTime()

    // Only trigger sparks if mouse speed is high enough and enough time has passed
    if (speed > config.value.sparkTriggerThreshold && currentTime - mouse.lastSparkTime > 0.2) {
      createSparkEffect()
      mouse.lastSparkTime = currentTime
    }
  }

  /**
   * Create particle system with adaptive count based on device
   */
  const createParticles = () => {
    // Use current config values
    const cfg = config.value

    // Create geometry
    const geometry = new THREE.BufferGeometry()
    const positions = new Float32Array(cfg.particleCount * 3)
    const colors = new Float32Array(cfg.particleCount * 3)
    const sizes = new Float32Array(cfg.particleCount)
    const phases = new Float32Array(cfg.particleCount)

    // Generate positions and colors
    for (let i = 0; i < cfg.particleCount; i++) {
      // Position with more particles toward center
      let x, y, z
      const centerBias = Math.random() < 0.7 // 70% of particles closer to center

      if (centerBias) {
        // Central cluster
        x = (Math.random() - 0.5) * cfg.particleSpread * 0.5
        y = (Math.random() - 0.5) * cfg.particleSpread * 0.5
        z = (Math.random() - 0.5) * cfg.particleSpread * 0.5
      } else {
        // Outer spread
        x = (Math.random() - 0.5) * cfg.particleSpread
        y = (Math.random() - 0.5) * cfg.particleSpread
        z = (Math.random() - 0.5) * cfg.particleSpread
      }

      positions[i * 3] = x
      positions[i * 3 + 1] = y
      positions[i * 3 + 2] = z

      // Calculate normalized depth value (-1 to 1)
      const normalizedZ = z / (cfg.particleSpread * 0.5)

      // Base color - blend between primary and secondary based on x/y position
      const xyBlend = Math.random()
      // Depth affect on color - use accent color for particles in foreground
      const depthBlend = Math.max(0, (normalizedZ + 1) * 0.5 * cfg.depthFactor)

      let color
      if (depthBlend > 0.7) {
        // Particles in foreground get accent color blend
        color = new THREE.Color().lerpColors(
          new THREE.Color().lerpColors(cfg.particleColor, cfg.secondaryColor, xyBlend),
          cfg.accentColor,
          (depthBlend - 0.7) / 0.3
        )
      } else {
        // Normal color blend
        color = new THREE.Color().lerpColors(cfg.particleColor, cfg.secondaryColor, xyBlend)
      }

      colors[i * 3] = color.r
      colors[i * 3 + 1] = color.g
      colors[i * 3 + 2] = color.b

      // Size variation based on depth - particles closer to camera are larger
      const depthSize = 1.0 + Math.max(0, -normalizedZ * 0.5)
      sizes[i] = cfg.particleSize * (0.5 + Math.random() * 1.5) * depthSize

      // Random phase
      phases[i] = Math.random() * Math.PI * 2
    }

    // Set attributes
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1))
    geometry.setAttribute('phase', new THREE.BufferAttribute(phases, 1))

    // Create custom shader material
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0.0 },
        opacity: { value: 1.0 },
      },
      vertexShader,
      fragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthTest: false,
    })

    // Create point cloud
    particles = new THREE.Points(geometry, material)
    scene.add(particles)
  }

  /**
   * Create spark effect at mouse position
   */
  const createSparkEffect = () => {
    if (reduceMotion.value) return

    // Remove previous sparks if they exist
    if (sparkParticles) {
      scene.remove(sparkParticles)
      sparkParticles.geometry.dispose()
      ;(sparkParticles.material as THREE.Material).dispose()
      sparkParticles = null
    }

    const cfg = config.value

    // Create spark geometry
    const geometry = new THREE.BufferGeometry()
    const positions = new Float32Array(cfg.sparkCount * 3)
    const velocities = new Float32Array(cfg.sparkCount * 3)
    const sizes = new Float32Array(cfg.sparkCount)
    const ages = new Float32Array(cfg.sparkCount)
    const maxAges = new Float32Array(cfg.sparkCount)

    // Convert mouse position to 3D space
    const mouseVector = new THREE.Vector3(
      (mouse.position.x * cfg.particleSpread) / 2,
      (mouse.position.y * cfg.particleSpread) / 2,
      0
    )

    // Apply rotations to match particle rotation
    mouseVector.applyAxisAngle(new THREE.Vector3(1, 0, 0), particles.rotation.x)
    mouseVector.applyAxisAngle(new THREE.Vector3(0, 1, 0), particles.rotation.y)

    // Generate spark particles
    for (let i = 0; i < cfg.sparkCount; i++) {
      // Position at mouse
      positions[i * 3] = mouseVector.x
      positions[i * 3 + 1] = mouseVector.y
      positions[i * 3 + 2] = mouseVector.z

      // Random velocity in sphere
      const speed = 0.5 + Math.random() * 1.5
      const angle1 = Math.random() * Math.PI * 2
      const angle2 = Math.random() * Math.PI * 2

      velocities[i * 3] = Math.sin(angle1) * Math.cos(angle2) * speed
      velocities[i * 3 + 1] = Math.sin(angle1) * Math.sin(angle2) * speed
      velocities[i * 3 + 2] = Math.cos(angle1) * speed

      // Add some influence from mouse movement
      velocities[i * 3] += mouse.speed.x * 2
      velocities[i * 3 + 1] += mouse.speed.y * 2

      // Random size
      sizes[i] = cfg.sparkSize * (0.5 + Math.random())

      // Initial age
      ages[i] = 0

      // Random max age for varied lifetimes
      maxAges[i] = cfg.sparkLifetime * (0.7 + Math.random() * 0.3)
    }

    // Set attributes
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3))
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1))
    geometry.setAttribute('age', new THREE.BufferAttribute(ages, 1))
    geometry.setAttribute('maxAge', new THREE.BufferAttribute(maxAges, 1))

    // Create spark material with color uniforms
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0.0 },
        primaryColor: { value: new THREE.Color(cfg.particleColor) },
        accentColor: { value: new THREE.Color(cfg.accentColor) },
      },
      vertexShader: sparkVertexShader,
      fragmentShader: sparkFragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthTest: false,
    })

    // Create sparks
    sparkParticles = new THREE.Points(geometry, material)
    scene.add(sparkParticles)
  }

  /**
   * Update spark particles
   */
  const updateSparkParticles = (deltaTime: number) => {
    if (!sparkParticles) return

    const ages = sparkParticles.geometry.attributes.age
    const maxAges = sparkParticles.geometry.attributes.maxAge
    let allExpired = true

    // Update age of each spark
    for (let i = 0; i < config.value.sparkCount; i++) {
      ages.array[i] += deltaTime

      // Check if any sparks are still alive
      if (ages.array[i] < maxAges.array[i]) {
        allExpired = false
      }
    }

    // Mark attribute as needing update
    ages.needsUpdate = true

    // If all sparks have expired, remove them
    if (allExpired) {
      scene.remove(sparkParticles)
      sparkParticles.geometry.dispose()
      ;(sparkParticles.material as THREE.Material).dispose()
      sparkParticles = null
    }
  }

  /**
   * Create connections between particles
   */
  const createParticleConnections = () => {
    const cfg = config.value

    // Calculate which particles should be connected
    const particlePositions = particles.geometry.attributes.position.array
    const indices: number[] = []
    const lineColors: number[] = []

    // Track connections per particle
    const connectionCounts = new Array(cfg.particleCount).fill(0)

    // Find particles within connection distance
    for (let i = 0; i < cfg.particleCount; i++) {
      // Skip if already at max connections
      if (connectionCounts[i] >= cfg.maxConnections) continue

      const ix = i * 3
      const x1 = particlePositions[ix]
      const y1 = particlePositions[ix + 1]
      const z1 = particlePositions[ix + 2]

      for (let j = i + 1; j < cfg.particleCount; j++) {
        // Skip if already at max connections
        if (connectionCounts[j] >= cfg.maxConnections) continue

        const jx = j * 3
        const x2 = particlePositions[jx]
        const y2 = particlePositions[jx + 1]
        const z2 = particlePositions[jx + 2]

        // Calculate distance between particles
        const dx = x1 - x2
        const dy = y1 - y2
        const dz = z1 - z2
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz)

        // Create connection if within threshold
        if (distance < cfg.connectionDistance) {
          // Add line indices
          indices.push(i, j)

          // Line color and opacity based on distance
          const alpha = 1.0 - distance / cfg.connectionDistance
          for (let k = 0; k < 2; k++) {
            lineColors.push(
              cfg.connectionColor.r,
              cfg.connectionColor.g,
              cfg.connectionColor.b,
              cfg.connectionOpacity * alpha
            )
          }

          // Increment connection counts
          connectionCounts[i]++
          connectionCounts[j]++

          // Stop if either particle reached max connections
          if (
            connectionCounts[i] >= cfg.maxConnections ||
            connectionCounts[j] >= cfg.maxConnections
          ) {
            break
          }
        }
      }
    }

    // Create line geometry
    const geometry = new THREE.BufferGeometry()

    // Convert indices to vertices
    const vertices = new Float32Array(indices.length * 3)
    for (let i = 0; i < indices.length; i++) {
      const index = indices[i]
      const ix = i * 3
      const particleIndex = index * 3

      vertices[ix] = particlePositions[particleIndex]
      vertices[ix + 1] = particlePositions[particleIndex + 1]
      vertices[ix + 2] = particlePositions[particleIndex + 2]
    }

    // Set position attribute
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(lineColors), 4))

    // Create line material
    const material = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: cfg.connectionOpacity,
      blending: THREE.AdditiveBlending,
      depthTest: false,
    })

    // Create lines
    particleConnections = new THREE.LineSegments(geometry, material)
    scene.add(particleConnections)
  }

  /**
   * Calculate FPS for performance monitoring
   */
  const calculateFPS = (deltaTime: number) => {
    if (deltaTime < 0.00001) return // Prevent division by zero

    const fps = 1 / deltaTime
    performance.fpsHistory.push(fps)

    // Keep only last 60 frames
    if (performance.fpsHistory.length > 60) {
      performance.fpsHistory.shift()
    }

    // Get average FPS
    const sum = performance.fpsHistory.reduce((a, b) => a + b, 0)
    const avgFps = sum / performance.fpsHistory.length
    state.currentFps = Math.round(avgFps)

    // If consistently below threshold, consider optimization
    if (
      props.autoOptimize &&
      avgFps < performance.fpsWarningThreshold &&
      performance.fpsHistory.length >= 30
    ) {
      performance.fpsWarningCount++

      // Emit warning after 3 consecutive low FPS readings
      if (performance.fpsWarningCount >= 3) {
        emit('fps-warning', Math.round(avgFps))
      }

      // Check if we should apply optimization
      const now = Date.now()
      if (
        performance.fpsWarningCount >= 5 &&
        now - performance.lastOptimizationTime > performance.optimizationCooldown
      ) {
        optimizePerformance(avgFps)
        performance.lastOptimizationTime = now
        performance.fpsWarningCount = 0
      }
    } else {
      performance.fpsWarningCount = 0
    }
  }

  /**
   * Optimize performance by reducing particle count
   */
  const optimizePerformance = (currentFps: number) => {
    // If we're already at a minimal particle count, don't reduce further
    if (state.particleCount <= 300) return

    // Calculate new particle count (reduce by 25%)
    const newCount = Math.floor(state.particleCount * 0.75)

    // Update state
    state.particleCount = newCount

    // Recreate particles with new count
    recreateParticlesWithCount(newCount)

    // Emit event
    emit('optimized', {
      particleCount: newCount,
      fps: Math.round(currentFps),
    })

    // Reset FPS history
    performance.fpsHistory = []
  }

  /**
   * Recreate particles with different count for performance
   */
  const recreateParticlesWithCount = (newCount: number) => {
    if (!scene) return

    // Remove existing particles
    scene.remove(particles)
    particles.geometry.dispose()
    ;(particles.material as THREE.Material).dispose()

    // Also remove connections
    if (particleConnections) {
      scene.remove(particleConnections)
      particleConnections.geometry.dispose()
      ;(particleConnections.material as THREE.Material).dispose()
    }

    // Recreate particles
    state.particleCount = newCount
    createParticles()
    createParticleConnections()
  }

  /**
   * Animation loop
   */
  const animate = () => {
    if (!state.isActive || state.isPaused) return

    // Get time delta
    const deltaTime = clock.getDelta() * config.value.animationSpeed
    const elapsedTime = clock.getElapsedTime() * config.value.animationSpeed

    // Calculate FPS and optimize if needed
    calculateFPS(deltaTime)

    // Update shader time uniform
    if (particles.material instanceof THREE.ShaderMaterial) {
      particles.material.uniforms.time.value = elapsedTime
    }

    // Update spark particles if they exist
    if (sparkParticles && sparkParticles.material instanceof THREE.ShaderMaterial) {
      sparkParticles.material.uniforms.time.value = elapsedTime
      updateSparkParticles(deltaTime)
    }

    // Skip heavy animation for reduced motion
    if (!reduceMotion.value) {
      // Rotate particles slowly with smooth camera movement
      const cameraOscillation = Math.sin(elapsedTime * 0.2) * 0.05
      particles.rotation.x =
        elapsedTime * 0.05 * config.value.animationSpeed + cameraOscillation * 0.2
      particles.rotation.y =
        elapsedTime * 0.08 * config.value.animationSpeed + cameraOscillation * 0.1

      // Subtle camera movement
      camera.position.y = Math.sin(elapsedTime * 0.2) * 0.1
      camera.position.x = Math.cos(elapsedTime * 0.3) * 0.1
      camera.lookAt(0, 0, 0)

      // Animate particle positions
      animateParticles(elapsedTime, deltaTime)
    }

    // Render scene
    renderer.render(scene, camera)

    // Request next frame
    animationFrameId = requestAnimationFrame(animate)
  }

  /**
   * Animate individual particles
   */
  const animateParticles = (elapsedTime: number, _deltaTime: number) => {
    const positions = particles.geometry.attributes.position
    const phases = particles.geometry.attributes.phase
    const sizes = particles.geometry.attributes.size

    // Convert mouse position to 3D space
    const mouseVector = new THREE.Vector3(
      (mouse.position.x * config.value.particleSpread) / 2,
      (mouse.position.y * config.value.particleSpread) / 2,
      0
    )

    // Apply mouse rotation to match particle rotation
    mouseVector.applyAxisAngle(new THREE.Vector3(1, 0, 0), particles.rotation.x)
    mouseVector.applyAxisAngle(new THREE.Vector3(0, 1, 0), particles.rotation.y)

    // Calculate mouse influence strength based on speed
    const speedMagnitude = Math.min(
      1,
      new THREE.Vector2(mouse.speed.x, mouse.speed.y).length() * 10
    )
    const currentMouseStrength = mouse.influenceStrength * speedMagnitude

    // Smoothly reduce mouse speed
    mouse.speed.x *= 0.9
    mouse.speed.y *= 0.9

    // Only process a subset of particles each frame for better performance on slower devices
    const skipFactor = state.isMobile ? 2 : 1 // Process every other particle on mobile
    const particleUpdateCount = state.isMobile ? 10 : 20 // Update fewer particles per frame on mobile

    // Only update some particles per frame for performance
    const startIdx = Math.floor((Math.random() * positions.count) / skipFactor) * skipFactor
    const endIdx = Math.min(startIdx + particleUpdateCount * skipFactor, positions.count)

    for (let i = startIdx; i < endIdx; i += skipFactor) {
      const phase = phases.array[i]
      const ix = i * 3
      const x = positions.array[ix]
      const y = positions.array[ix + 1]
      const z = positions.array[ix + 2]

      // Create a vector for this particle
      const particlePos = new THREE.Vector3(x, y, z)

      // Calculate distance to mouse position
      const distanceToMouse = particlePos.distanceTo(mouseVector)

      // Get normalized Z for depth-based motion
      const normalizedZ = z / (config.value.particleSpread * 0.5)
      const depthFactor = 1.0 + normalizedZ * 0.5

      // Apply oscillation with depth-based amplitude
      const oscillationStrength = 0.01 * depthFactor
      positions.array[ix] = x + Math.sin(elapsedTime * 0.8 + phase) * oscillationStrength
      positions.array[ix + 1] = y + Math.cos(elapsedTime * 0.7 + phase) * oscillationStrength
      positions.array[ix + 2] = z + Math.sin(elapsedTime * 0.9 + phase * 1.1) * oscillationStrength

      // Apply mouse influence if enabled and within radius
      if (props.enableMouseInteraction && distanceToMouse < mouse.influenceRadius) {
        // Calculate influence factor (stronger closer to mouse)
        const influenceFactor = 1 - distanceToMouse / mouse.influenceRadius

        // Direction from particle to mouse
        const direction = new THREE.Vector3().subVectors(mouseVector, particlePos).normalize()

        // Apply force toward mouse position with depth-based variation
        const mouseEffect = influenceFactor * currentMouseStrength * (1.0 + normalizedZ * 0.3)
        positions.array[ix] += direction.x * mouseEffect
        positions.array[ix + 1] += direction.y * mouseEffect
        positions.array[ix + 2] += direction.z * mouseEffect

        // Slightly increase particle size when affected by mouse
        const baseSize =
          config.value.particleSize *
          (0.5 + Math.random() * 1.5) *
          (1.0 + Math.max(0, -normalizedZ * 0.5))
        sizes.array[i] = baseSize * (1.0 + influenceFactor * 0.5)
      }
    }

    positions.needsUpdate = true
    sizes.needsUpdate = true
  }

  /**
   * Handle window resize
   */
  const handleResize = () => {
    if (!canvasContainer.value) return

    // Check if device type changed
    const wasMobile = state.isMobile
    checkMobileDevice()

    // If device type changed, recreate particles
    if (wasMobile !== state.isMobile) {
      // Recreate everything with proper settings
      scene.remove(particles)
      if (particleConnections) scene.remove(particleConnections)
      if (sparkParticles) scene.remove(sparkParticles)

      particles.geometry.dispose()
      ;(particles.material as THREE.Material).dispose()
      if (particleConnections) {
        particleConnections.geometry.dispose()
        ;(particleConnections.material as THREE.Material).dispose()
      }
      if (sparkParticles) {
        sparkParticles.geometry.dispose()
        ;(sparkParticles.material as THREE.Material).dispose()
      }

      // Recreate particles with new count based on mobile status
      state.particleCount = config.value.particleCount
      createParticles()
      createParticleConnections()
      sparkParticles = null
    }

    // Update camera aspect
    camera.aspect = canvasContainer.value.clientWidth / canvasContainer.value.clientHeight
    camera.updateProjectionMatrix()

    // Update renderer size
    renderer.setSize(canvasContainer.value.clientWidth, canvasContainer.value.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, state.isMobile ? 2 : 3))
  }

  /**
   * Play animation
   */
  const play = () => {
    if (state.isPaused) {
      state.isPaused = false
      state.isActive = true
      animate()
      emit('play')
    }
  }

  /**
   * Pause animation
   */
  const pause = () => {
    if (!state.isPaused) {
      state.isPaused = true
      emit('pause')
    }
  }

  /**
   * Reset animation
   */
  const reset = () => {
    // Recreate particles with original configuration
    if (state.isInitialized) {
      scene.remove(particles)
      if (particleConnections) scene.remove(particleConnections)
      if (sparkParticles) scene.remove(sparkParticles)

      particles.geometry.dispose()
      ;(particles.material as THREE.Material).dispose()
      if (particleConnections) {
        particleConnections.geometry.dispose()
        ;(particleConnections.material as THREE.Material).dispose()
      }
      if (sparkParticles) {
        sparkParticles.geometry.dispose()
        ;(sparkParticles.material as THREE.Material).dispose()
      }

      // Reset state
      state.particleCount = props.particleCount
      performance.fpsHistory = []
      performance.fpsWarningCount = 0

      // Recreate particles
      createParticles()
      createParticleConnections()
      sparkParticles = null

      // Reset camera position
      camera.position.set(0, 0, config.value.cameraPosition)
      camera.lookAt(0, 0, 0)
    }
  }

  // Watch for changes in play prop
  watch(
    () => props.play,
    newVal => {
      if (newVal && state.isPaused) {
        play()
      } else if (!newVal && !state.isPaused) {
        pause()
      }
    }
  )

  // Initialize on mounted
  onMounted(() => {
    if (canvasContainer.value) {
      initScene()

      if (props.play) {
        animate()
        emit('play')
      } else {
        state.isPaused = true
      }

      // Animate in effects
      animateInEffects()
    }
  })

  /**
   * Animate in effects when component mounts
   */
  const animateInEffects = () => {
    // Skip animation for reduced motion preference
    if (reduceMotion.value) return

    // Initial animation - fade in
    if (particles.material instanceof THREE.ShaderMaterial) {
      // Add opacity uniform to shader material
      particles.material.uniforms.opacity = { value: 0 }

      gsap.fromTo(
        particles.material.uniforms.opacity,
        { value: 0 },
        { value: 1, duration: 2, ease: 'power2.out' }
      )
    }

    // Animate camera position
    gsap.fromTo(
      camera.position,
      { z: config.value.cameraPosition + 3 },
      { z: config.value.cameraPosition, duration: 2.5, ease: 'power2.out' }
    )
  }

  // Clean up on unmount
  onBeforeUnmount(() => {
    state.isActive = false

    // Remove event listeners
    window.removeEventListener('resize', handleResize)
    if (props.enableMouseInteraction) {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('touchmove', handleTouchMove)
    }

    // Cancel animation frame
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId)
    }

    // Remove renderer
    if (renderer && canvasContainer.value) {
      canvasContainer.value.removeChild(renderer.domElement)
    }

    // Dispose resources
    if (particles) {
      particles.geometry.dispose()
      ;(particles.material as THREE.Material).dispose()
    }

    if (particleConnections) {
      particleConnections.geometry.dispose()
      ;(particleConnections.material as THREE.Material).dispose()
    }

    if (sparkParticles) {
      sparkParticles.geometry.dispose()
      ;(sparkParticles.material as THREE.Material).dispose()
    }
  })

  // Expose methods to parent component
  defineExpose({
    play,
    pause,
    reset,
    state,
    performance: {
      getCurrentFps: () => state.currentFps,
      getParticleCount: () => state.particleCount,
    },
  })
</script>

<style scoped>
  .hero-animation {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: var(--z-background, -1);
    pointer-events: none;
    overflow: hidden;
    will-change: transform;
  }

  /* When reduced motion is enabled, make the animation static */
  .hero-animation.reduced-motion canvas {
    animation: none !important;
    transition: none !important;
  }

  /* Allow pointer events when using debug mode */
  :deep(.stats) {
    pointer-events: all !important;
    position: absolute !important;
    top: 0 !important;
    left: 0 !important;
    z-index: 9999 !important;
  }

  /* High contrast mode support */
  @media (forced-colors: active) {
    .hero-animation {
      background-color: Canvas;
    }
  }
</style>
