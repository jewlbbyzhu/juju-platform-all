import { test, expect } from '@playwright/test'

/**
 * 跨浏览器兼容性测试
 * 测试不同浏览器下的表现
 */

test.describe('兼容性测试', () => {
  
  test('页面在不同浏览器中加载', async ({ page, browserName }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // 检查页面是否正常加载
    const body = await page.locator('body')
    await expect(body).toBeVisible()
    
    console.log(`✅ ${browserName} 浏览器测试通过`)
  })

  test('触摸事件支持', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // 模拟触摸事件
    const element = await page.locator('body').first()
    
    // 模拟触摸开始
    await element.dispatchEvent('touchstart', {
      touches: [{ clientX: 100, clientY: 100 }]
    })
    
    // 模拟触摸结束
    await element.dispatchEvent('touchend')
    
    // 页面应该仍然正常
    await expect(element).toBeVisible()
  })

  test('响应式布局', async ({ page }) => {
    // 测试不同屏幕尺寸
    const viewports = [
      { width: 375, height: 812, name: 'iPhone X' },
      { width: 414, height: 896, name: 'iPhone 11' },
      { width: 390, height: 844, name: 'iPhone 12' }
    ]
    
    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height })
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      
      // 检查页面是否正常显示
      const body = await page.locator('body')
      await expect(body).toBeVisible()
      
      console.log(`✅ ${viewport.name} (${viewport.width}x${viewport.height}) 测试通过`)
    }
  })

  test('离线功能', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // 模拟离线状态
    await page.context().setOffline(true)
    
    // 刷新页面
    await page.reload()
    await page.waitForTimeout(1000)
    
    // 恢复网络
    await page.context().setOffline(false)
    
    // 页面应该仍然可见（如果有离线缓存）
    const body = await page.locator('body')
    await expect(body).toBeVisible()
  })
})
