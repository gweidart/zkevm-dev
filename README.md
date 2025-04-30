# zkEVM.dev - Web3 Security Researcher Portfolio

An immersive and interactive portfolio website showcasing Web3 security research, audits, and professional services. Built with Nuxt 3, Three.js, and GSAP for exceptional animation and user experience.

![zkEVM.dev Preview](https://zkevm.dev/images/social-card.png)

## 🚀 Features

- **WebGL-Powered 3D Hero Animation** - Immersive particle system with interactive elements
- **Performance-Optimized SPA** - 60+ FPS animations with FPS monitoring
- **Responsive Design** - Optimized for all device sizes with adaptive performance settings
- **Custom Cursor** - Interactive GSAP-powered cursor effects
- **Scroll-Based Animations** - Smooth, optimized reveal animations as you scroll
- **Modern Web Technologies** - Built with TypeScript, Nuxt 3, Vue 3, GSAP, and Three.js

## 🛠️ Tech Stack

- **Frontend Framework**: [Nuxt 3](https://nuxt.com) with Vue 3 Composition API
- **Styling**: Custom CSS with responsive design principles
- **Animation**: [GSAP](https://greensock.com/gsap/) for UI animations
- **3D Graphics**: [Three.js](https://threejs.org/) for WebGL animations
- **Development**: TypeScript for type safety and better developer experience
- **Performance**: Optimized assets, adaptive rendering, and FPS monitoring

## 📂 Project Structure

```
zkevm-dev/
│
├── assets/              # Static assets (images, styles, fonts)
│   ├── icons/           # SVG icons and UI elements
│   ├── images/          # Image assets
│   ├── partners/        # Partner logos
│   └── styles/          # Global CSS styles
│
├── components/          # Vue components
│   ├── animations/      # Three.js and GSAP animations
│   ├── common/          # Shared UI components
│   ├── layout/          # Layout components
│   ├── partners/        # Partner-related components
│   └── profile/         # Profile-specific components
│
├── pages/               # Application pages
│   ├── index.vue        # Home page
│   ├── research.vue     # Research page
│   └── theme.vue        # Theme showcase
│
├── plugins/             # Nuxt plugins
├── public/              # Public static files
├── server/              # Server-side code (API routes)
└── utils/               # Utility functions
```

## 📋 Prerequisites

- Node.js 16.x or higher
- PNPM 7.x or higher (recommended) or NPM/Yarn

## 🚀 Setup and Installation

1. Clone the repository:

```bash
git clone https://github.com/placeholder-username/zkevm.dev.git
cd zkevm.dev/zkevm-dev
```

2. Install dependencies:

```bash
# Using pnpm (recommended)
pnpm install

# Using npm
npm install

# Using yarn
yarn install
```

3. Start the development server:

```bash
# Using pnpm
pnpm dev

# Using npm
npm run dev

# Using yarn
yarn dev
```

The site will be available at `http://localhost:3000`.

## 🔧 Available Scripts

- `pnpm dev` - Start the development server
- `pnpm build` - Build for production
- `pnpm preview` - Preview the production build locally
- `pnpm generate` - Generate static site
- `pnpm lint` - Run ESLint code linting
- `pnpm lint:fix` - Fix linting issues automatically
- `pnpm typecheck` - Run TypeScript type checking
- `pnpm analyze` - Analyze the bundle size

## 🌐 Deployment

This site is built with Nuxt 3 and optimized for static hosting or Node.js environments. Vercel provides zero-configuration deployment for Nuxt projects.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fplaceholder-username%2Fzkevm.dev)

For detailed deployment instructions on other platforms, see the [Nuxt deployment documentation](https://nuxt.com/docs/getting-started/deployment).

## 🧪 Performance Optimization

The site includes a built-in FPS tracker (visible in development mode) to monitor animation performance. All animations are designed to maintain 60+ FPS on modern devices with adaptive rendering for lower-powered devices.

## 📄 License

[MIT](LICENSE)
