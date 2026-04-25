/** @type {import('next').NextConfig} */
const nextConfig = {
  // 静态导出配置
  output: 'export',
  distDir: 'dist',
  
  // Turbopack 配置
  turbopack: {
    root: process.cwd(),
  },
  
  // 图片优化配置
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**'
      }
    ],
    minimumCacheTTL: 60,
  },
  
  // 压缩和性能
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  
  // 实验性功能
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
    webVitalsAttribution: ['CLS', 'LCP', 'FCP', 'FID', 'INP', 'TTFB'],
  },
}

export default nextConfig
