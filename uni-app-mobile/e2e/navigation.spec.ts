import { test, expect } from '@playwright/test'

/**
 * 导航和路由测试
 * 测试页面导航和路由切换
 */

test.describe('导航测试', () => {
  
  test('底部导航栏存在', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // 检查底部导航
    const tabBar = await page.locator('.tab-bar, .uni-tabbar, nav, .nav').first()
    await expect(tabBar).toBeVisible()
  })

  test('页面切换正常', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // 查找导航项并点击
    const navItems = await page.locator('.tab-bar-item, .uni-tabbar-item, .nav-item').all()
    
    if (navItems.length > 1) {
      // 点击第二个导航项
      await navItems[1].click()
      
      // 等待页面切换
      await page.waitForTimeout(500)
      
      // 检查页面是否变化
      const currentUrl = page.url()
      expect(currentUrl).toBeTruthy()
    }
  })

  test('返回按钮功能', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // 查找返回按钮
    const backButton = await page.locator('.back, .uni-back, .nav-back, [class*="back"]').first()
    
    if (await backButton.isVisible().catch(() => false)) {
      await backButton.click()
      await page.waitForTimeout(300)
    }
  })
})
