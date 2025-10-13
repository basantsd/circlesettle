import type { NextConfig } from "next";


/** @type {import('next').NextConfig} */
const nextConfig : NextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: false, // - #TODO remove in production!
  },
}

module.exports = nextConfig