/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Allow production builds to successfully complete even if there are ESLint errors/warnings
    ignoreDuringBuilds: true,
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  // Force dynamic rendering to avoid stale cache
  generateBuildId: async () => {
    // Use timestamp as build ID to force cache invalidation
    return Date.now().toString()
  },
  // Disable static optimization for problematic pages
  async headers() {
    return [
      {
        source: '/dashboard/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, must-revalidate',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig