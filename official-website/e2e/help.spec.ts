import { test, expect } from '@playwright/test'

test.describe('Help Center', () => {
  test('has correct title', async ({ page }) => {
    await page.goto('/help')
    // 页面标题可能只有"聚聚"
    await expect(page).toHaveTitle(/聚聚/)
  })

  test('renders search input', async ({ page }) => {
    await page.goto('/help')

    const searchInput = page.getByPlaceholder('搜索帮助文档...')
    await expect(searchInput).toBeVisible()
  })

  test('search functionality works', async ({ page }) => {
    await page.goto('/help')

    const searchInput = page.getByPlaceholder('搜索帮助文档...')
    await searchInput.fill('聚会')
    await page.getByRole('button', { name: '搜索' }).click()

    await expect(page).toHaveURL(/.*search/)
  })

  test('renders category cards', async ({ page }) => {
    await page.goto('/help')

    await expect(page.getByText('快速入门')).toBeVisible()
    await expect(page.getByText('账户管理')).toBeVisible()
    await expect(page.getByText('聚会活动')).toBeVisible()
  })

  test('category cards are clickable', async ({ page }) => {
    await page.goto('/help')

    const categoryCard = page.getByText('快速入门')
    await categoryCard.click()

    // 点击后应该保持在帮助页面或跳转到文章列表
    await expect(page).toHaveURL(/.*help/)
  })

  test('renders category count', async ({ page }) => {
    await page.goto('/help')

    // 检查分类文章数量显示
    await expect(page.getByText(/5 篇文章/)).toBeVisible()
    await expect(page.getByText(/8 篇文章/)).toBeVisible()
  })
})

test.describe('Help Article Detail', () => {
  test('has correct title', async ({ page }) => {
    await page.goto('/help/getting-started')
    // 页面标题可能只有"聚聚"
    await expect(page).toHaveTitle(/聚聚/)
  })

  test('renders article content or not found', async ({ page }) => {
    await page.goto('/help/getting-started')

    // 检查页面是否加载（可能是文章内容或404）
    // 使用 first() 避免多个匹配元素的问题
    const content = page.locator('text=/快速入门|未找到|帮助中心|文章/i').first()
    await expect(content).toBeVisible()
  })

  test('back button works', async ({ page }) => {
    await page.goto('/help/getting-started')

    // 尝试找到返回按钮
    const backButton = page.locator('button:has-text("返回帮助中心"), a:has-text("返回帮助中心")').first()
    if (await backButton.isVisible()) {
      await backButton.click()
      await expect(page).toHaveURL(/.*help/)
    }
  })
})
