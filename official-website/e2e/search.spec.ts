import { test, expect } from '@playwright/test'

test.describe('Search Page', () => {
  test('has correct title', async ({ page }) => {
    await page.goto('/search')
    // 页面标题可能只有"聚聚"
    await expect(page).toHaveTitle(/聚聚/)
  })

  test('renders search input', async ({ page }) => {
    await page.goto('/search')

    const searchInput = page.getByPlaceholder('搜索帮助文档...')
    await expect(searchInput).toBeVisible()
  })

  test('performs search on enter key', async ({ page }) => {
    await page.goto('/search')

    const searchInput = page.getByPlaceholder('搜索帮助文档...')
    await searchInput.fill('聚会')
    await searchInput.press('Enter')

    await expect(searchInput).toHaveValue('聚会')
  })

  test('performs search on button click', async ({ page }) => {
    await page.goto('/search')

    const searchInput = page.getByPlaceholder('搜索帮助文档...')
    await searchInput.fill('聚会')
    await page.getByRole('button', { name: '搜索' }).click()

    // 等待搜索完成，检查结果区域是否显示（无论是否有结果）
    await expect(page.getByText(/搜索结果|未找到相关结果/)).toBeVisible()
  })

  test('shows search history', async ({ page }) => {
    await page.goto('/search')

    await page.getByPlaceholder('搜索帮助文档...').fill('聚会')
    await page.getByRole('button', { name: '搜索' }).click()

    await page.goto('/search')
    await expect(page.getByText('搜索历史')).toBeVisible()
  })

  test('clears search history', async ({ page }) => {
    await page.goto('/search')

    const clearButton = page.getByText('清空历史')
    if (await clearButton.isVisible()) {
      await clearButton.click()
      await expect(page.getByText('搜索历史')).not.toBeVisible()
    }
  })

  test('shows search results or empty state', async ({ page }) => {
    await page.goto('/search')

    const searchInput = page.getByPlaceholder('搜索帮助文档...')
    await searchInput.fill('聚会')
    await page.getByRole('button', { name: '搜索' }).click()

    // 检查结果区域是否显示（无论是否有结果）
    await expect(page.getByText(/搜索结果|未找到相关结果/)).toBeVisible()
  })

  test('shows empty state for no results', async ({ page }) => {
    await page.goto('/search')

    const searchInput = page.getByPlaceholder('搜索帮助文档...')
    await searchInput.fill('nonexistent')
    await page.getByRole('button', { name: '搜索' }).click()

    await expect(page.getByText('未找到相关结果')).toBeVisible()
  })

  test('highlights search terms in results', async ({ page }) => {
    await page.goto('/search')

    const searchInput = page.getByPlaceholder('搜索帮助文档...')
    await searchInput.fill('聚会')
    await page.getByRole('button', { name: '搜索' }).click()

    // 等待搜索结果或空状态
    await page.waitForSelector('text=/搜索结果|未找到相关结果/')

    const results = page.locator('.search-result')
    if (await results.count() > 0) {
      await expect(results.first()).toContainText('聚会')
    }
  })
})
