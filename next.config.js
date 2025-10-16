/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove exposed environment variables for security
  // Environment variables should be accessed directly in API routes
  
  // Image optimization configuration
  images: {
    domains: ['localhost'],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },
  
  // Enable compression
  compress: true,
  
  // PoweredBy header removal
  poweredByHeader: false,
  
  // Webpack configuration
  webpack: (config, { dev, isServer }) => {
    // Fallback configuration
    config.resolve.fallback = {
      ...config.resolve.fallback,
      child_process: false,
      fs: false,
      net: false,
      tls: false,
    };
    
    // Production optimizations
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
  
  // Security headers
  async headers() {
    const { nextConfigHeaders } = require('./src/lib/securityHeaders');
    const securityHeaders = await nextConfigHeaders();
    
    return [
      ...securityHeaders,
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0',
          },
        ],
      },
    ];
  },
  
  // Redirects for security
  async redirects() {
    return [
      {
        source: '/admin',
        destination: '/admin/Dashboard',
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig;