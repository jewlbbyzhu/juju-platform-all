import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

describe('Vite Configuration', () => {
  it('should have vite.config.ts file', () => {
    const viteConfigPath = path.resolve(process.cwd(), 'vite.config.ts')
    expect(fs.existsSync(viteConfigPath)).toBe(true)
    
    const configContent = fs.readFileSync(viteConfigPath, 'utf-8')
    expect(configContent).toContain('@vitejs/plugin-vue')
    expect(configContent).toContain('resolve')
    expect(configContent).toContain('@')
  })

  it('should have correct server configuration in config file', () => {
    const viteConfigPath = path.resolve(process.cwd(), 'vite.config.ts')
    const configContent = fs.readFileSync(viteConfigPath, 'utf-8')
    
    expect(configContent).toContain('port: 3000')
    expect(configContent).toContain('open: true')
    expect(configContent).toContain('cors: true')
  })

  it('should have correct build configuration in config file', () => {
    const viteConfigPath = path.resolve(process.cwd(), 'vite.config.ts')
    const configContent = fs.readFileSync(viteConfigPath, 'utf-8')
    
    expect(configContent).toContain('target: \'es2015\'')
    expect(configContent).toContain('outDir: \'dist\'')
    expect(configContent).toContain('assetsDir: \'assets\'')
  })

  it('should have test configuration in config file', () => {
    const viteConfigPath = path.resolve(process.cwd(), 'vite.config.ts')
    const configContent = fs.readFileSync(viteConfigPath, 'utf-8')
    
    expect(configContent).toContain('globals: true')
    expect(configContent).toContain('environment: \'jsdom\'')
  })
})