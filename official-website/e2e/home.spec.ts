import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test('has correct title', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/聚聚/)
  })

  test('renders hero section', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: '让每一次聚会都充满惊喜' })).toBeVisible()
  })

  test('download button navigates to download page', async ({ page }) => {
    await page.goto('/')
    const downloadButton = page.getByRole('link', { name: '立即下载' })
    await downloadButton.click()
    await expect(page).toHaveURL(/.*download/)
  })

  test('renders features section', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: '为什么选择聚聚？' })).toBeVisible()
  })

  test('renders party preview section', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: '热门聚会' })).toBeVisible()
  })
})

test.describe('Download Page', () => {
  test('has correct title', async ({ page }) => {
    await page.goto('/download')
    await expect(page).toHaveTitle(/下载.*聚聚|聚聚/)
  })

  test('renders platform selector', async ({ page }) => {
    await page.goto('/download')
    await expect(page.getByRole('button', { name: 'Android' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'iOS' })).toBeVisible()
    await expect(page.getByRole('button', { name: '微信小程序' })).toBeVisible()
  })

  test('platform selection works', async ({ page }) => {
    await page.goto('/download')
    const androidButton = page.getByRole('button', { name: 'Android' })
    await androidButton.click()

    // 检查按钮是否有选中状态的样式类（使用实际的颜色代码）
    const buttonClass = await androidButton.getAttribute('class')
    expect(buttonClass).toMatch(/border-\[\#ff6b35\]|bg-\[\#fff5f0\]/)
  })
})

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

  test('renders category cards', async ({ page }) => {
    await page.goto('/help')
    await expect(page.getByText('快速入门')).toBeVisible()
    await expect(page.getByText('账户管理')).toBeVisible()
  })
})

test.describe('Login Page', () => {
  test('has correct title', async ({ page }) => {
    await page.goto('/login')
    await expect(page).toHaveTitle(/登录.*聚聚|聚聚/)
  })

  test('renders login form', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByPlaceholder('请输入邮箱')).toBeVisible()
    await expect(page.getByPlaceholder('请输入密码')).toBeVisible()
  })

  test('validates required fields', async ({ page }) => {
    await page.goto('/login')
    const submitButton = page.getByRole('button', { name: '登录' })
    await submitButton.click()

    // 等待HTML5验证
    await page.waitForTimeout(500)

    // 验证输入框是否有 required 属性
    const emailInput = page.getByPlaceholder('请输入邮箱')
    await expect(emailInput).toHaveAttribute('required', '')
  })
})

test.describe('Responsive Design', () => {
  test('homepage is mobile responsive', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    await expect(page.getByRole('heading', { name: '让每一次聚会都充满惊喜' })).toBeVisible()
  })

  test('homepage is tablet responsive', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto('/')
    await expect(page.getByRole('heading', { name: '让每一次聚会都充满惊喜' })).toBeVisible()
  })

  test('homepage is desktop responsive', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto('/')
    await expect(page.getByRole('heading', { name: '让每一次聚会都充满惊喜' })).toBeVisible()
  })
})

test.describe('Navigation', () => {
  test('header navigation works', async ({ page }) => {
    await page.goto('/')

    // 使用更精确的选择器 - 只选择导航栏中的第一个链接
    const homeLink = page.locator('nav >> a:has-text("首页")').first()
    await homeLink.click()
    await expect(page).toHaveURL(/\/$/)

    // 使用精确匹配避免与"立即下载"按钮冲突
    const downloadLink = page.locator('nav >> a:has-text("下载")').first()
    await downloadLink.click()
    await expect(page).toHaveURL(/.*download/)

    const helpLink = page.locator('nav >> a:has-text("帮助中心")').first()
    await helpLink.click()
    await expect(page).toHaveURL(/.*help/)
  })

  test('footer links work', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: '关于我们' }).click()
    await expect(page).toHaveURL(/.*about/)
  })
})
