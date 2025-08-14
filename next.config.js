/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Allow production builds to successfully complete even if there are ESLint errors/warnings
    ignoreDuringBuilds: true,
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
}

module.exports = nextConfig