/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['nrcertifica.com.br'],
  },
  experimental: {
    serverComponentsExternalPackages: ['mongoose', 'puppeteer'],
  },
}

module.exports = nextConfig
