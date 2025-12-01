import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable compression for faster transfers
  compress: true,

  // PoweredByHeader - Remove X-Powered-By header for security
  poweredByHeader: false,

  // Enable SWR (Stale-While-Revalidate) on all pages
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 5,
  },

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Turbopack configuration (Next.js 16 uses Turbopack by default)
  turbopack: {},

  // Experimental optimizations
  experimental: {
    optimizePackageImports: ['@heroui/react'],
  },

  // Headers for caching
  async headers() {
    return [
      {
        source: '/api/freelancer/dashboard/overview',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=60, s-maxage=300, stale-while-revalidate=600'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          }
        ]
      },
      {
        source: '/api/freelancer/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=30, s-maxage=120, stale-while-revalidate=300'
          }
        ]
      }
    ];
  }
};

export default nextConfig;
