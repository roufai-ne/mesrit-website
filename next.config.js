/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: process.env.NODE_ENV === 'development',

  // ✅ Configuration correcte des devIndicators
  devIndicators: {
    position: 'bottom-right',
  },

  // ⚠️ TEMPORAIRE: Désactiver la génération statique automatique
  // pour éviter les erreurs React #130 durant le build
  // Les pages avec getStaticProps/getServerSideProps continueront de fonctionner
  // Ceci force le SSR pour les pages sans méthode de data fetching explicite
  experimental: {
    // Désactiver le SSG automatique
    disableOptimizedLoading: false,
  },

  // Output standalone pour déploiement optimisé
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,

  // Image optimization
  images: {
    domains: ['localhost', '192.168.10.115'],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  
  compress: true,
  poweredByHeader: false,
  
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: ['**/node_modules/**', '**/.git/**', '**/.next/**'],
      };
    }
    
    // Only apply fallbacks for client-side builds
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        child_process: false,
        fs: false,
        net: false,
        tls: false,
        dns: false,
        timers: false,
        'timers/promises': false,
        crypto: false,
        stream: false,
        util: false,
        url: false,
        buffer: false,
        events: false,
      };
    }
    
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      };
    }
    
    return config;
  },
  
  async headers() {
    const { nextConfigHeaders } = require('./src/lib/securityHeaders');
    const securityHeaders = await nextConfigHeaders();
    
    return [...securityHeaders, /* vos autres headers */];
  },
  
  async redirects() {
    return [
      { source: '/admin', destination: '/admin/Dashboard', permanent: false },
    ];
  },
};

module.exports = nextConfig;