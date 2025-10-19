import type { NextConfig } from "next";


/** @type {import('next').NextConfig} */
const nextConfig : NextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: false, // - #TODO remove in production!
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'icons.llamao.fi',
        pathname: '/icons/**',
      },
      {
        protocol: 'https',
        hostname: 's2.coinmarketcap.com',
        pathname: '/static/img/**',
      },
    ],
  },
}

module.exports = nextConfig