import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd(), '')
  const apiBaseUrl = env.VITE_API_BASE_URL

  // 解析API基础URL
  // 从完整URL中提取origin，例如: https://api.hfparty.asia/api/v2 -> https://api.hfparty.asia
  let apiOrigin = 'https://api.hfparty.asia'
  if (apiBaseUrl) {
    const match = apiBaseUrl.match(/^(https?:\/\/[^\/]+)/)
    if (match) {
      apiOrigin = match[1]
    }
  }

  console.log('API Origin:', apiOrigin)
  
  return {
    plugins: [vue()],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
      },
    },
    server: {
      port: 3000,
      open: true,
      cors: true,
      proxy: {
        '/api': {
          target: apiOrigin,
          changeOrigin: true,
          rewrite: (path) => path,
        },
      },
    },
    build: {
      target: 'es2015',
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false,
      rollupOptions: {
        output: {
          chunkFileNames: 'js/[name]-[hash].js',
          entryFileNames: 'js/[name]-[hash].js',
          assetFileNames: '[ext]/[name]-[hash].[ext]',
        },
      },
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./tests/setup.ts'],
      threads: false,
      isolate: true,
      pool: 'forks',
      poolOptions: {
        forks: {
          singleFork: false,
        },
      },
      maxConcurrency: 4,
      testTimeout: 10000,
      hookTimeout: 10000,
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
        exclude: [
          'node_modules/',
          'tests/',
          '**/*.test.ts',
          '**/*.spec.ts',
          'dist/',
        ],
      },
    },
  }
})
