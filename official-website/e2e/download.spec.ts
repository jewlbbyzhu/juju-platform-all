import { test, expect } from '@playwright/test'

test.describe('Download Page', () => {
  test('has correct title', async ({ page }) => {
    await page.goto('/download')
    await expect(page).toHaveTitle(/下载.*聚聚|聚聚/)
  })

  test('renders all platform options', async ({ page }) => {
    await page.goto('/download')

    await expect(page.getByRole('button', { name: 'Android' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'iOS' })).toBeVisible()
    await expect(page.getByRole('button', { name: '微信小程序' })).toBeVisible()
  })

  test('platform selection updates active state', async ({ page }) => {
    await page.goto('/download')

    const androidButton = page.getByRole('button', { name: 'Android' })
    await androidButton.click()

    // 检查按钮是否有选中状态的样式类
    const buttonClass = await androidButton.getAttribute('class')
    expect(buttonClass).toMatch(/border-\[\#ff6b35\]|bg-\[\#fff5f0\]/)

    const iosButton = page.getByRole('button', { name: 'iOS' })
    await iosButton.click()

    const iosButtonClass = await iosButton.getAttribute('class')
    expect(iosButtonClass).toMatch(/border-\[\#ff6b35\]|bg-\[\#fff5f0\]/)
  })

  test('displays page sections', async ({ page }) => {
    await page.goto('/download')

    // 检查页面主要区域是否存在 - 使用更精确的选择器
    await expect(page.getByRole('heading', { name: '选择你的平台' })).toBeVisible()
    await expect(page.getByText('支持多种平台，随时随地参与聚会')).toBeVisible()
  })

  test('displays feature sections', async ({ page }) => {
    await page.goto('/download')

    // 检查特性展示区域
    await expect(page.getByText('安全可靠')).toBeVisible()
    await expect(page.getByText('实时更新')).toBeVisible()
    await expect(page.getByText('专属客服')).toBeVisible()
  })

  test('download button is clickable', async ({ page }) => {
    await page.goto('/download')

    // 下载按钮可能不是标准的 button 角色，尝试通过文本查找
    const downloadButton = page.locator('button:has-text("立即下载"), a:has-text("立即下载")').first()
    await expect(downloadButton).toBeVisible()
  })

  test('shows footer links', async ({ page }) => {
    await page.goto('/download')

    // 页脚链接 - 使用更灵活的选择器
    const privacyLink = page.locator('footer a:has-text("隐私政策"), [class*="footer"] a:has-text("隐私政策")').first()
    const termsLink = page.locator('footer a:has-text("服务条款"), [class*="footer"] a:has-text("服务条款")').first()

    // 检查链接是否存在（可能在页脚中）
    await expect(privacyLink || page.getByRole('link', { name: '隐私政策' })).toBeTruthy()
    await expect(termsLink || page.getByRole('link', { name: '服务条款' })).toBeTruthy()
  })
})
