import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    uni({
      // 强制生成配置
      emitConfig: true
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/styles/variables.scss";`
      }
    }
  },
  // 开发服务器配置 - 支持IPv4/IPv6和本地IP访问
  server: {
    // 监听所有网络接口，允许外部访问
    host: true,
    port: 3000,
    strictPort: false,
    open: false,
    cors: {
      origin: '*',
      credentials: true
    },
    // HMR配置
    hmr: {
      host: '192.168.1.149',
      port: 3000,
      protocol: 'ws'
    },
    // 允许所有host访问
    allowedHosts: 'all'
  },
  // 预览配置
  preview: {
    host: true,
    port: 3000,
    cors: true,
    allowedHosts: 'all'
  },
  // 构建配置
  build: {
    sourcemap: false,
    minify: true
  }
})
