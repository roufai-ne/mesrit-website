/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    MONGODB_URI: process.env.MONGODB_URI,
    API_KEY: process.env.API_KEY,
    ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      child_process: false,
    };
    return config;
  },
};

module.exports = nextConfig;