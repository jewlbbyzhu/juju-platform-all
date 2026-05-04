import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

describe('Project Structure', () => {
  const requiredDirectories = [
    'src',
    'src/api',
    'src/api/modules',
    'src/assets',
    'src/assets/styles',
    'src/components',
    'src/components/common',
    'src/components/charts',
    'src/components/forms',
    'src/composables',
    'src/layouts',
    'src/router',
    'src/router/modules',
    'src/stores',
    'src/stores/modules',
    'src/types',
    'src/utils',
    'src/views',
    'src/views/dashboard',
    'src/views/users',
    'src/views/parties',
    'src/views/orders',
    'src/views/finance',
    'src/views/content',
    'src/views/analytics',
    'src/views/system',
    'src/views/app',
  ]

  const requiredFiles = [
    'src/main.ts',
    'src/App.vue',
    'src/router/index.ts',
    'src/stores/index.ts',
    'src/api/index.ts',
    'src/api/request.ts',
    'src/types/auth.ts',
    'src/types/global.ts',
    'src/utils/auth.ts',
    'src/utils/format.ts',
    'vite.config.ts',
    'tsconfig.json',
    'tsconfig.node.json',
    'package.json',
    'index.html',
  ]

  it.each(requiredDirectories)('should have directory: %s', (dir) => {
    const dirPath = path.resolve(process.cwd(), dir)
    expect(fs.existsSync(dirPath)).toBe(true)
    expect(fs.statSync(dirPath).isDirectory()).toBe(true)
  })

  it.each(requiredFiles)('should have file: %s', (file) => {
    const filePath = path.resolve(process.cwd(), file)
    expect(fs.existsSync(filePath)).toBe(true)
    expect(fs.statSync(filePath).isFile()).toBe(true)
  })

  it('should have correct package.json configuration', () => {
    const packageJsonPath = path.resolve(process.cwd(), 'package.json')
    const packageContent = fs.readFileSync(packageJsonPath, 'utf-8')
    const packageJson = JSON.parse(packageContent)
    
    expect(packageJson.name).toBe('admin-web')
    expect(packageJson.type).toBe('module')
    expect(packageJson.dependencies.vue).toBeDefined()
    expect(packageJson.dependencies['element-plus']).toBeDefined()
    expect(packageJson.dependencies.pinia).toBeDefined()
    expect(packageJson.dependencies['vue-router']).toBeDefined()
    expect(packageJson.devDependencies.vite).toBeDefined()
    expect(packageJson.devDependencies.typescript).toBeDefined()
  })
})