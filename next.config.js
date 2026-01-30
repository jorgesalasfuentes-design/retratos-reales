/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['fal.media', 'v3.fal.media'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.fal.media',
      },
    ],
  },
}

module.exports = nextConfig
