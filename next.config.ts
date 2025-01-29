/** @type {import('next').NextConfig} */
interface WebpackConfig {
  resolve: {
    fallback: {
      [key: string]: boolean;
    };
  };
}

interface NextConfig {
  webpack: (config: WebpackConfig) => WebpackConfig;
}

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      child_process: false,
    };
    return config;
  },
};

module.exports = nextConfig;