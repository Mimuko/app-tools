/** @type {import('next').NextConfig} */
const nextConfig = {
  // 開発環境では output: 'export' を無効化（静的エクスポートはビルド時のみ）
  ...(process.env.NODE_ENV === 'production' && { output: 'export' }),
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  // 開発環境では標準の .next ディレクトリを使用
  ...(process.env.NODE_ENV === 'production' && { distDir: 'out' }),
  // パフォーマンス最適化
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  // 本番環境での最適化
  ...(process.env.NODE_ENV === 'production' && {
    swcMinify: true,
    compiler: {
      removeConsole: process.env.NODE_ENV === 'production' ? {
        exclude: ['error', 'warn'],
      } : false,
    },
  }),
}

module.exports = nextConfig

