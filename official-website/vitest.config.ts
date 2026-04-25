import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    css: true,
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['e2e/**', '.next/**', 'node_modules/**']
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
