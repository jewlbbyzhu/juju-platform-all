import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

describe('ESLint Configuration', () => {
  it('should have eslint.config.js file', () => {
    const eslintConfigPath = path.resolve(process.cwd(), 'eslint.config.js')
    expect(fs.existsSync(eslintConfigPath)).toBe(true)
  })

  it('should have .prettierrc file', () => {
    const prettierConfigPath = path.resolve(process.cwd(), '.prettierrc')
    expect(fs.existsSync(prettierConfigPath)).toBe(true)
    
    const prettierContent = fs.readFileSync(prettierConfigPath, 'utf-8')
    const prettierConfig = JSON.parse(prettierContent)
    
    expect(prettierConfig.semi).toBe(false)
    expect(prettierConfig.singleQuote).toBe(true)
    expect(prettierConfig.tabWidth).toBe(2)
  })

  it('should have correct package.json scripts', () => {
    const packageJsonPath = path.resolve(process.cwd(), 'package.json')
    const packageContent = fs.readFileSync(packageJsonPath, 'utf-8')
    const packageJson = JSON.parse(packageContent)
    
    expect(packageJson.scripts.lint).toBeDefined()
    expect(packageJson.scripts.format).toBeDefined()
    expect(packageJson.scripts.lint).toContain('eslint')
    expect(packageJson.scripts.format).toContain('prettier')
  })

  it('should have required ESLint dependencies', () => {
    const packageJsonPath = path.resolve(process.cwd(), 'package.json')
    const packageContent = fs.readFileSync(packageJsonPath, 'utf-8')
    const packageJson = JSON.parse(packageContent)
    
    const devDeps = packageJson.devDependencies
    expect(devDeps.eslint).toBeDefined()
    expect(devDeps.prettier).toBeDefined()
    expect(devDeps['@typescript-eslint/parser']).toBeDefined()
    expect(devDeps['@typescript-eslint/eslint-plugin']).toBeDefined()
    expect(devDeps['eslint-plugin-vue']).toBeDefined()
  })
})