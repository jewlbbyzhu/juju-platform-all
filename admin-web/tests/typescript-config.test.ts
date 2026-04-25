import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

describe('TypeScript Configuration', () => {
  it('should have valid tsconfig.json', () => {
    const tsconfigPath = path.resolve(process.cwd(), 'tsconfig.json')
    expect(fs.existsSync(tsconfigPath)).toBe(true)
    
    const tsconfigContent = fs.readFileSync(tsconfigPath, 'utf-8')
    expect(tsconfigContent).toContain('"target": "ES2020"')
    expect(tsconfigContent).toContain('"module": "ESNext"')
    expect(tsconfigContent).toContain('"strict": true')
  })

  it('should have correct path mapping', () => {
    const tsconfigPath = path.resolve(process.cwd(), 'tsconfig.json')
    const tsconfigContent = fs.readFileSync(tsconfigPath, 'utf-8')
    
    expect(tsconfigContent).toContain('"baseUrl": "."')
    expect(tsconfigContent).toContain('"@/*": ["src/*"]')
  })

  it('should include correct files', () => {
    const tsconfigPath = path.resolve(process.cwd(), 'tsconfig.json')
    const tsconfigContent = fs.readFileSync(tsconfigPath, 'utf-8')
    
    expect(tsconfigContent).toContain('src/**/*.ts')
    expect(tsconfigContent).toContain('src/**/*.vue')
  })

  it('should have node config reference', () => {
    const tsconfigPath = path.resolve(process.cwd(), 'tsconfig.json')
    const tsconfigContent = fs.readFileSync(tsconfigPath, 'utf-8')
    
    expect(tsconfigContent).toContain('./tsconfig.node.json')
  })
})