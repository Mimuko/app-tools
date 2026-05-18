const fs = require('fs')
const path = require('path')

const tenantId = (process.env.TENANT_ID || 'crh').trim()
const tenantConfigPath = path.join(__dirname, 'tenants', tenantId, 'config.ts')
if (!fs.existsSync(tenantConfigPath)) {
  throw new Error(
    `Unknown TENANT_ID="${tenantId}". Expected config at tenants/${tenantId}/config.ts`,
  )
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Netlify Next ランタイム（OpenNext）。静的 export は STATIC_EXPORT=true のときのみ
  ...(process.env.STATIC_EXPORT === 'true' ? { output: 'export', distDir: 'out' } : {}),
  ...(process.env.NODE_ENV === 'production' && process.env.BASE_PATH
    ? { basePath: process.env.BASE_PATH }
    : {}),
  images: {
    unoptimized: process.env.STATIC_EXPORT === 'true',
  },
  trailingSlash: true,
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  ...(process.env.NODE_ENV === 'production' && {
    swcMinify: true,
    compiler: {
      removeConsole: {
        exclude: ['error', 'warn'],
      },
    },
  }),
}

module.exports = nextConfig
