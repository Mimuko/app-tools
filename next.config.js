/** @type {import('next').NextConfig} */
const isStaticExport = process.env.NODE_ENV === 'production' || process.env.STATIC_EXPORT === 'true'

const nextConfig = {
  // 静的エクスポートを有効化（ビルド時に静的ファイルを生成）
  // 開発環境では無効化するため、環境変数で制御
  ...(isStaticExport ? { output: 'export' } : {}),
  // サブディレクトリに配置する場合のベースパス（環境変数で指定可能）
  ...(isStaticExport && process.env.BASE_PATH ? { basePath: process.env.BASE_PATH } : {}),
  images: {
    unoptimized: true, // 静的エクスポートでは画像最適化は無効
  },
  trailingSlash: true, // 静的ホスティングとの互換性のため
  // 静的エクスポート時は out ディレクトリに出力
  ...(isStaticExport ? { distDir: 'out' } : {}),
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
