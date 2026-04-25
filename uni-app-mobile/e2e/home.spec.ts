import { test, expect } from '@playwright/test'

/**
 * 首页基础测试
 * 测试应用是否正常加载和基本功能
 */

test.describe('首页测试', () => {
  
  test('页面标题正确', async ({ page }) => {
    await page.goto('/')
    
    // 等待页面加载
    await page.waitForLoadState('networkidle')
    
    // 检查页面标题
    const title = await page.title()
    expect(title).toContain('聚聚')
  })

  test('页面正常加载', async ({ page }) => {
    await page.goto('/')
    
    // 等待页面加载完成
    await page.waitForLoadState('networkidle')
    
    // 检查页面内容是否存在
    const body = await page.locator('body')
    await expect(body).toBeVisible()
    
    // 检查是否有主要内容区域
    const mainContent = await page.locator('#app, .app, main, .main').first()
    await expect(mainContent).toBeVisible()
  })

  test('响应式布局正常', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // 检查视口设置
    const viewport = page.viewportSize()
    expect(viewport?.width).toBe(375)
    expect(viewport?.height).toBe(812)
  })
})
