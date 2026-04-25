import { test, expect, Page } from '@playwright/test'

// 测试配置
const TEST_CONFIG = {
  baseURL: 'http://localhost:3000',
  credentials: {
    username: 'eros1101',
    password: 'zaqzzh.521'
  },
  timeouts: {
    navigation: 30000,
    element: 10000,
    action: 5000
  }
}

// 延迟函数
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// 辅助函数：登录
async function performLogin(page: Page) {
  console.log('开始登录流程...')
  await page.goto(`${TEST_CONFIG.baseURL}/login`)
  await page.waitForLoadState('networkidle')
  const usernameInput = page.locator('input[placeholder="请输入用户名"]')
  await expect(usernameInput).toBeVisible({ timeout: TEST_CONFIG.timeouts.element })
  await usernameInput.fill(TEST_CONFIG.credentials.username)
  const passwordInput = page.locator('input[placeholder="请输入密码"]')
  await expect(passwordInput).toBeVisible({ timeout: TEST_CONFIG.timeouts.element })
  await passwordInput.fill(TEST_CONFIG.credentials.password)
  const loginButton = page.locator('button:has-text("登录")')
  await expect(loginButton).toBeEnabled({ timeout: TEST_CONFIG.timeouts.element })
  await Promise.all([
    page.waitForNavigation({ url: /\/dashboard/, timeout: TEST_CONFIG.timeouts.navigation }),
    loginButton.click()
  ])
  console.log('登录成功')
  await delay(1000)
}

// 检查页面上的数据问题
async function checkDataIssues(page: Page, pageName: string) {
  const issues: string[] = []
  
  // 1. 检查 NaN 值
  const nanElements = await page.locator('text=/NaN/i').count()
  if (nanElements > 0) {
    issues.push(`发现 ${nanElements} 个 NaN 值`)
  }
  
  // 2. 检查 Invalid Date
  const invalidDateElements = await page.locator('text=/Invalid Date/i').count()
  if (invalidDateElements > 0) {
    issues.push(`发现 ${invalidDateElements} 个 Invalid Date`)
  }
  
  // 3. 检查 undefined
  const undefinedElements = await page.locator('text=/undefined/i').count()
  if (undefinedElements > 0) {
    issues.push(`发现 ${undefinedElements} 个 undefined`)
  }
  
  // 4. 检查 null
  const nullElements = await page.locator('text=/^null$/i').count()
  if (nullElements > 0) {
    issues.push(`发现 ${nullElements} 个 null`)
  }
  
  // 5. 检查空值（仅包含空格）
  const emptyElements = await page.locator('text=/^\\s*$/').count()
  if (emptyElements > 0) {
    issues.push(`发现 ${emptyElements} 个空值`)
  }
  
  // 6. 检查数字格式（如 0.00, -0.00）
  const zeroElements = await page.locator('text=/^-?0\\.00$/').count()
  if (zeroElements > 0) {
    issues.push(`发现 ${zeroElements} 个 0.00 值`)
  }
  
  if (issues.length > 0) {
    console.log(`\n[${pageName}] 数据问题:`)
    issues.forEach(issue => console.log(`  - ${issue}`))
    await page.screenshot({ path: `test-results/data-issues-${pageName}.png` })
  }
  
  return issues
}

test.describe('数据格式验证测试', () => {
  let page: Page

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage({ viewport: { width: 1920, height: 1080 } })
    await performLogin(page)
  })

  test.afterEach(async () => {
    await page?.close()
  })

  test('验证仪表盘数据格式', async () => {
    const issues = await checkDataIssues(page, 'dashboard')
    expect(issues).toHaveLength(0)
  })

  test('验证用户管理页面数据格式', async () => {
    await page.click('text=用户管理')
    await page.waitForURL(/\/users/, { timeout: TEST_CONFIG.timeouts.navigation })
    await delay(1000)
    const issues = await checkDataIssues(page, 'users')
    expect(issues).toHaveLength(0)
  })

  test('验证订单管理页面数据格式', async () => {
    await page.click('text=订单管理')
    await page.waitForURL(/\/orders/, { timeout: TEST_CONFIG.timeouts.navigation })
    await delay(1000)
    const issues = await checkDataIssues(page, 'orders')
    expect(issues).toHaveLength(0)
  })

  test('验证财务管理页面数据格式', async () => {
    await page.goto(`${TEST_CONFIG.baseURL}/dashboard`)
    await page.waitForURL(/\/dashboard/, { timeout: TEST_CONFIG.timeouts.navigation })
    await delay(1000)
    await page.click('text=财务管理')
    await page.waitForURL(/\/finance/, { timeout: TEST_CONFIG.timeouts.navigation })
    await delay(1000)
    const issues = await checkDataIssues(page, 'finance')
    expect(issues).toHaveLength(0)
  })

  test('验证内容管理页面数据格式', async () => {
    await page.goto(`${TEST_CONFIG.baseURL}/dashboard`)
    await page.waitForURL(/\/dashboard/, { timeout: TEST_CONFIG.timeouts.navigation })
    await delay(1000)
    await page.click('text=内容管理')
    await page.waitForURL(/\/content/, { timeout: TEST_CONFIG.timeouts.navigation })
    await delay(1000)
    const issues = await checkDataIssues(page, 'content')
    expect(issues).toHaveLength(0)
  })

  test('验证聚会审核页面数据格式', async () => {
    await page.goto(`${TEST_CONFIG.baseURL}/dashboard`)
    await page.waitForURL(/\/dashboard/, { timeout: TEST_CONFIG.timeouts.navigation })
    await delay(1000)
    await page.click('text=聚会管理')
    await delay(300)
    await page.click('text=聚会审核')
    await page.waitForURL(/\/parties\/audit/, { timeout: TEST_CONFIG.timeouts.navigation })
    await delay(1000)
    const issues = await checkDataIssues(page, 'party-audit')
    expect(issues).toHaveLength(0)
  })

  test('验证管理员管理页面数据格式', async () => {
    await page.goto(`${TEST_CONFIG.baseURL}/dashboard`)
    await page.waitForURL(/\/dashboard/, { timeout: TEST_CONFIG.timeouts.navigation })
    await delay(1000)
    await page.click('text=系统设置')
    await delay(300)
    await page.click('text=管理员管理')
    await delay(1000)
    const issues = await checkDataIssues(page, 'admins')
    expect(issues).toHaveLength(0)
  })
})
