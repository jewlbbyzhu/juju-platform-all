import { test, expect } from '@playwright/test'

/**
 * 性能和加载测试
 * 测试页面加载速度和性能指标
 */

test.describe('性能测试', () => {
  
  test('首页加载时间', async ({ page }) => {
    const startTime = Date.now()
    
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    const loadTime = Date.now() - startTime
    
    // 页面加载时间应小于5秒
    expect(loadTime).toBeLessThan(5000)
    
    console.log(`首页加载时间: ${loadTime}ms`)
  })

  test('关键资源加载', async ({ page }) => {
    const resources: string[] = []
    
    // 监听资源加载
    page.on('response', response => {
      resources.push(response.url())
    })
    
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // 检查是否有JS和CSS资源
    const hasJS = resources.some(url => url.endsWith('.js'))
    const hasCSS = resources.some(url => url.endsWith('.css'))
    
    expect(hasJS || resources.some(url => url.includes('js'))).toBeTruthy()
  })

  test('内存使用检查', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // 获取性能指标
    const metrics = await page.evaluate(() => {
      return {
        memory: (performance as any).memory?.usedJSHeapSize || 0,
        timing: performance.timing
      }
    })
    
    console.log('内存使用:', metrics.memory)
    
    // 内存使用应合理（小于100MB）
    expect(metrics.memory).toBeLessThan(100 * 1024 * 1024)
  })

  test('Lighthouse性能指标', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // 获取Web Vitals指标
    const vitals = await page.evaluate(() => {
      return new Promise((resolve) => {
        let lcp = 0
        let fid = 0
        let cls = 0
        
        // LCP
        new PerformanceObserver((list) => {
          const entries = list.getEntries()
          lcp = entries[entries.length - 1].startTime
        }).observe({ entryTypes: ['largest-contentful-paint'] })
        
        // CLS
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              cls += (entry as any).value
            }
          }
        }).observe({ entryTypes: ['layout-shift'] })
        
        // 等待一段时间后返回结果
        setTimeout(() => {
          resolve({ lcp, cls })
        }, 3000)
      })
    })
    
    console.log('Web Vitals:', vitals)
  })
})
