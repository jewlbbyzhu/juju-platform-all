import { test, expect, Page, Browser, chromium } from '@playwright/test'
import * as fs from 'fs'

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

// 获取 Chrome/Edge 可执行文件路径
function getBrowserExecutablePath(): string | undefined {
  const possiblePaths = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    process.env.LOCALAPPDATA + '\\Google\\Chrome\\Application\\chrome.exe',
    process.env.PROGRAMFILES + '\\Google\\Chrome\\Application\\chrome.exe',
    process.env['PROGRAMFILES(X86)'] + '\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    process.env.LOCALAPPDATA + '\\Microsoft\\Edge\\Application\\msedge.exe',
    process.env.PROGRAMFILES + '\\Microsoft\\Edge\\Application\\msedge.exe',
    process.env['PROGRAMFILES(X86)'] + '\\Microsoft\\Edge\\Application\\msedge.exe'
  ]

  for (const browserPath of possiblePaths) {
    if (browserPath && fs.existsSync(browserPath)) {
      console.log(`找到浏览器: ${browserPath}`)
      return browserPath
    }
  }
  return undefined
}

// 辅助函数：登录
async function performLogin(page: Page) {
  console.log('开始登录流程...')

  await page.goto(`${TEST_CONFIG.baseURL}/login`)
  await page.waitForLoadState('networkidle')

  // 填写用户名
  const usernameInput = page.locator('input[placeholder="请输入用户名"]')
  await expect(usernameInput).toBeVisible({ timeout: TEST_CONFIG.timeouts.element })
  await usernameInput.fill(TEST_CONFIG.credentials.username)
  console.log('已填写用户名')

  // 填写密码
  const passwordInput = page.locator('input[placeholder="请输入密码"]')
  await expect(passwordInput).toBeVisible({ timeout: TEST_CONFIG.timeouts.element })
  await passwordInput.fill(TEST_CONFIG.credentials.password)
  console.log('已填写密码')

  // 点击登录按钮
  const loginButton = page.locator('button:has-text("登录")')
  await expect(loginButton).toBeEnabled({ timeout: TEST_CONFIG.timeouts.element })

  // 等待导航完成
  await Promise.all([
    page.waitForNavigation({ url: /\/dashboard/, timeout: TEST_CONFIG.timeouts.navigation }),
    loginButton.click()
  ])

  console.log('登录成功，已跳转到仪表盘')
  await delay(1000)
}

// 测试套件：自动化浏览器点击测试
test.describe('外部管理后台自动化点击测试', () => {
  let browser: Browser
  let page: Page

  test.beforeAll(async () => {
    const executablePath = getBrowserExecutablePath()
    if (executablePath) {
      console.log(`使用系统浏览器: ${executablePath}`)
      browser = await chromium.launch({
        headless: false,
        slowMo: 100,
        executablePath
      })
    } else {
      console.log('未找到系统浏览器，测试将跳过')
      test.skip()
    }
  })

  test.afterAll(async () => {
    await browser?.close()
  })

  test.beforeEach(async () => {
    page = await browser.newPage({
      viewport: { width: 1920, height: 1080 }
    })
  })

  test.afterEach(async () => {
    await page?.close()
  })

  // ========== 登录页面测试 ==========
  test.describe('登录页面交互测试', () => {
    test('测试登录表单输入和提交', async () => {
      console.log('开始测试登录表单...')
      await page.goto(`${TEST_CONFIG.baseURL}/login`)
      await page.waitForLoadState('networkidle')
      await page.screenshot({ path: 'test-results/login-initial.png' })

      const usernameInput = page.locator('input[placeholder="请输入用户名"]')
      await expect(usernameInput).toBeVisible({ timeout: TEST_CONFIG.timeouts.element })
      await usernameInput.fill(TEST_CONFIG.credentials.username)
      await delay(300)

      const passwordInput = page.locator('input[placeholder="请输入密码"]')
      await expect(passwordInput).toBeVisible({ timeout: TEST_CONFIG.timeouts.element })
      await passwordInput.fill(TEST_CONFIG.credentials.password)
      await delay(300)

      await page.screenshot({ path: 'test-results/login-filled.png' })

      const rememberCheckbox = page.locator('.el-checkbox')
      await rememberCheckbox.click()
      await delay(200)
      await rememberCheckbox.click()
      await delay(200)

      const forgotPasswordLink = page.locator('text=忘记密码？')
      await forgotPasswordLink.click()
      await delay(300)
      await page.keyboard.press('Escape')
      await delay(200)

      await page.screenshot({ path: 'test-results/login-interactions.png' })
    })

    test('测试登录按钮状态变化', async () => {
      await page.goto(`${TEST_CONFIG.baseURL}/login`)
      await page.waitForLoadState('networkidle')

      const loginButton = page.locator('button:has-text("登录")')
      const usernameInput = page.locator('input[placeholder="请输入用户名"]')
      const passwordInput = page.locator('input[placeholder="请输入密码"]')

      await expect(loginButton).toBeDisabled()
      await usernameInput.fill('admin')
      await delay(200)
      await expect(loginButton).toBeDisabled()
      await usernameInput.clear()
      await passwordInput.fill('password')
      await delay(200)
      await expect(loginButton).toBeDisabled()
      await usernameInput.fill('admin')
      await passwordInput.fill('password')
      await delay(200)
      await expect(loginButton).toBeEnabled()

      await page.screenshot({ path: 'test-results/login-button-states.png' })
    })

    test('测试完整登录流程', async () => {
      await performLogin(page)
      await page.screenshot({ path: 'test-results/dashboard-after-login.png' })
    })
  })

  // ========== 侧边栏菜单测试 ==========
  test.describe('侧边栏菜单交互测试', () => {
    test('测试菜单展开和收起', async () => {
      await performLogin(page)
      await page.screenshot({ path: 'test-results/dashboard.png' })

      const partyMenu = page.locator('.el-sub-menu:has-text("聚会管理")')
      const systemMenu = page.locator('.el-sub-menu:has-text("系统设置")')

      await partyMenu.click()
      await delay(500)
      await expect(page.locator('text=聚会列表')).toBeVisible()
      await page.screenshot({ path: 'test-results/menu-party-expanded.png' })

      await systemMenu.click()
      await delay(500)
      await page.screenshot({ path: 'test-results/menu-system-expanded.png' })

      await partyMenu.click()
      await delay(500)
      await page.screenshot({ path: 'test-results/menu-collapsed.png' })
    })

    test('测试菜单项点击导航', async () => {
      await performLogin(page)
      await delay(1000)

      await page.click('text=用户管理')
      await page.waitForURL(/\/users/, { timeout: TEST_CONFIG.timeouts.navigation })
      await delay(500)
      await page.screenshot({ path: 'test-results/page-users.png' })

      await page.click('text=订单管理')
      await page.waitForURL(/\/orders/, { timeout: TEST_CONFIG.timeouts.navigation })
      await delay(500)
      await page.screenshot({ path: 'test-results/page-orders.png' })

      // 先返回仪表盘，确保菜单可见
      await page.goto(`${TEST_CONFIG.baseURL}/dashboard`)
      await page.waitForURL(/\/dashboard/, { timeout: TEST_CONFIG.timeouts.navigation })
      await delay(1000)

      // 测试财务管理（超级管理员有所有权限）
      console.log('尝试点击财务管理...')
      await page.waitForSelector('text=财务管理', { timeout: TEST_CONFIG.timeouts.element })
      await page.click('text=财务管理')
      await page.waitForURL(/\/finance/, { timeout: TEST_CONFIG.timeouts.navigation })
      await delay(500)
      await page.screenshot({ path: 'test-results/page-finance.png' })

      // 先返回仪表盘，确保菜单可见
      await page.goto(`${TEST_CONFIG.baseURL}/dashboard`)
      await page.waitForURL(/\/dashboard/, { timeout: TEST_CONFIG.timeouts.navigation })
      await delay(1000)

      // 测试内容管理
      console.log('尝试点击内容管理...')
      await page.waitForSelector('text=内容管理', { timeout: TEST_CONFIG.timeouts.element })
      await page.click('text=内容管理')
      await page.waitForURL(/\/content/, { timeout: TEST_CONFIG.timeouts.navigation })
      await delay(500)
      await page.screenshot({ path: 'test-results/page-content.png' })

      // 先返回仪表盘，确保菜单可见
      await page.goto(`${TEST_CONFIG.baseURL}/dashboard`)
      await page.waitForURL(/\/dashboard/, { timeout: TEST_CONFIG.timeouts.navigation })
      await delay(1000)

      await page.click('text=聚会管理')
      await delay(300)
      await page.click('text=聚会审核')
      await page.waitForURL(/\/parties\/audit/, { timeout: TEST_CONFIG.timeouts.navigation })
      await delay(500)
      await page.screenshot({ path: 'test-results/page-party-audit.png' })
    })
  })

  // ========== 表格交互测试 ==========
  test.describe('数据表格交互测试', () => {
    test.beforeEach(async () => {
      await performLogin(page)
      await delay(1000)
    })

    test('测试用户管理表格交互', async () => {
      await page.click('text=用户管理')
      await page.waitForURL(/\/users/, { timeout: TEST_CONFIG.timeouts.navigation })
      await delay(1000)
      await page.screenshot({ path: 'test-results/users-table-initial.png' })

      const searchInput = page.locator('input[placeholder*="搜索"]').first()
      if (await searchInput.isVisible().catch(() => false)) {
        await searchInput.fill('测试用户')
        await delay(500)
        await page.keyboard.press('Enter')
        await delay(1000)
        await page.screenshot({ path: 'test-results/users-table-search.png' })
      }

      const filters = page.locator('.el-select').all()
      for (let i = 0; i < Math.min(filters.length, 2); i++) {
        const filter = filters[i]
        await filter.click()
        await delay(300)
        const firstOption = page.locator('.el-select-dropdown__item').first()
        if (await firstOption.isVisible().catch(() => false)) {
          await firstOption.click()
          await delay(500)
        }
      }
      await page.screenshot({ path: 'test-results/users-table-filtered.png' })

      const paginationButtons = page.locator('.el-pagination .el-pager li')
      const pageCount = await paginationButtons.count()
      if (pageCount > 1) {
        await paginationButtons.nth(1).click()
        await delay(1000)
        await page.screenshot({ path: 'test-results/users-table-page2.png' })
      }
    })

    test('测试表格行操作按钮', async () => {
      await page.click('text=用户管理')
      await page.waitForURL(/\/users/, { timeout: TEST_CONFIG.timeouts.navigation })
      await delay(1000)

      const actionButtons = page.locator('.el-table .el-button').all()
      if (actionButtons.length > 0) {
        const firstButton = actionButtons[0]
        await firstButton.click()
        await delay(500)
        await page.screenshot({ path: 'test-results/users-table-action.png' })
        await page.keyboard.press('Escape')
        await delay(300)
      }
    })
  })

  // ========== 表单交互测试 ==========
  test.describe('表单交互测试', () => {
    test.beforeEach(async () => {
      await performLogin(page)
      await delay(1000)
    })

    test('测试各种表单元素交互', async () => {
      await page.click('text=系统设置')
      await delay(300)
      await page.click('text=系统配置')
      await delay(1000)
      await page.screenshot({ path: 'test-results/form-elements.png' })

      const textInputs = page.locator('input[type="text"]').all()
      for (let i = 0; i < Math.min(textInputs.length, 2); i++) {
        const input = textInputs[i]
        if (await input.isVisible().catch(() => false)) {
          await input.fill(`测试文本 ${i + 1}`)
          await delay(200)
        }
      }

      const selects = page.locator('.el-select').all()
      for (let i = 0; i < Math.min(selects.length, 2); i++) {
        const select = selects[i]
        if (await select.isVisible().catch(() => false)) {
          await select.click()
          await delay(300)
          const option = page.locator('.el-select-dropdown__item').first()
          if (await option.isVisible().catch(() => false)) {
            await option.click()
            await delay(300)
          }
        }
      }

      const switches = page.locator('.el-switch').all()
      for (let i = 0; i < Math.min(switches.length, 2); i++) {
        const switchEl = switches[i]
        if (await switchEl.isVisible().catch(() => false)) {
          await switchEl.click()
          await delay(300)
        }
      }

      await page.screenshot({ path: 'test-results/form-interactions.png' })
    })
  })

  // ========== 完整流程测试 ==========
  test.describe('完整业务流程测试', () => {
    test('测试完整的用户操作流程', async () => {
      await performLogin(page)
      await delay(1000)

      await page.screenshot({ path: 'test-results/flow-01-dashboard.png' })

      await page.click('text=用户管理')
      await page.waitForURL(/\/users/, { timeout: TEST_CONFIG.timeouts.navigation })
      await delay(1000)
      await page.screenshot({ path: 'test-results/flow-02-users.png' })

      await page.click('text=订单管理')
      await page.waitForURL(/\/orders/, { timeout: TEST_CONFIG.timeouts.navigation })
      await delay(1000)
      await page.screenshot({ path: 'test-results/flow-04-orders.png' })

      // 先返回仪表盘，确保菜单可见
      await page.goto(`${TEST_CONFIG.baseURL}/dashboard`)
      await page.waitForURL(/\/dashboard/, { timeout: TEST_CONFIG.timeouts.navigation })
      await delay(1000)

      // 测试财务管理（超级管理员有所有权限）
      console.log('流程测试：尝试点击财务管理...')
      await page.waitForSelector('text=财务管理', { timeout: TEST_CONFIG.timeouts.element })
      await page.click('text=财务管理')
      await page.waitForURL(/\/finance/, { timeout: TEST_CONFIG.timeouts.navigation })
      await delay(1000)
      await page.screenshot({ path: 'test-results/flow-05-finance.png' })

      // 先返回仪表盘，确保菜单可见
      await page.goto(`${TEST_CONFIG.baseURL}/dashboard`)
      await page.waitForURL(/\/dashboard/, { timeout: TEST_CONFIG.timeouts.navigation })
      await delay(1000)

      // 测试内容管理
      console.log('流程测试：尝试点击内容管理...')
      await page.waitForSelector('text=内容管理', { timeout: TEST_CONFIG.timeouts.element })
      await page.click('text=内容管理')
      await page.waitForURL(/\/content/, { timeout: TEST_CONFIG.timeouts.navigation })
      await delay(1000)
      await page.screenshot({ path: 'test-results/flow-06-content.png' })

      // 先返回仪表盘，确保菜单可见
      await page.goto(`${TEST_CONFIG.baseURL}/dashboard`)
      await page.waitForURL(/\/dashboard/, { timeout: TEST_CONFIG.timeouts.navigation })
      await delay(1000)

      await page.click('text=聚会管理')
      await delay(300)
      await page.click('text=聚会审核')
      await page.waitForURL(/\/parties\/audit/, { timeout: TEST_CONFIG.timeouts.navigation })
      await delay(1000)
      await page.screenshot({ path: 'test-results/flow-06-party-audit.png' })

      // 先返回仪表盘，确保菜单可见
      await page.goto(`${TEST_CONFIG.baseURL}/dashboard`)
      await page.waitForURL(/\/dashboard/, { timeout: TEST_CONFIG.timeouts.navigation })
      await delay(1000)

      await page.click('text=系统设置')
      await delay(300)
      await page.click('text=管理员管理')
      await delay(1000)
      await page.screenshot({ path: 'test-results/flow-07-admins.png' })

      // 使用直接导航代替点击，确保稳定性
      await page.goto(`${TEST_CONFIG.baseURL}/dashboard`)
      await page.waitForURL(/\/dashboard/, { timeout: TEST_CONFIG.timeouts.navigation })
      await delay(1000)
      await page.screenshot({ path: 'test-results/flow-08-back-to-dashboard.png' })
    })
  })

  // ========== 新增：顶部导航栏交互测试 ==========
  test.describe('顶部导航栏交互测试', () => {
    test.beforeEach(async () => {
      await performLogin(page)
      await delay(1000)
    })

    test('测试通知铃铛点击', async () => {
      const notificationBell = page.locator('.el-badge:has(.el-icon-bell), .notification-icon, [class*="notification"]').first()
      if (await notificationBell.isVisible().catch(() => false)) {
        await notificationBell.click()
        await delay(500)
        await page.screenshot({ path: 'test-results/header-notification.png' })
        await page.keyboard.press('Escape')
        await delay(300)
      }
    })

    test('测试用户头像下拉菜单', async () => {
      const userAvatar = page.locator('.user-avatar, .el-avatar, [class*="avatar"]').first()
      if (await userAvatar.isVisible().catch(() => false)) {
        await userAvatar.click()
        await delay(500)
        await page.screenshot({ path: 'test-results/header-user-menu.png' })
        await page.keyboard.press('Escape')
        await delay(300)
      }
    })

    test('测试面包屑导航点击', async () => {
      await page.click('text=用户管理')
      await page.waitForURL(/\/users/, { timeout: TEST_CONFIG.timeouts.navigation })
      await delay(500)

      const breadcrumb = page.locator('.el-breadcrumb__item, .breadcrumb-item').first()
      if (await breadcrumb.isVisible().catch(() => false)) {
        await breadcrumb.click()
        await delay(500)
        await page.screenshot({ path: 'test-results/breadcrumb-click.png' })
      }
    })

    test('测试刷新按钮', async () => {
      const refreshButton = page.locator('button:has(.el-icon-refresh), [class*="refresh"]').first()
      if (await refreshButton.isVisible().catch(() => false)) {
        await refreshButton.click()
        await delay(1000)
        await page.screenshot({ path: 'test-results/header-refresh.png' })
      }
    })

    test('测试全屏按钮', async () => {
      const fullscreenButton = page.locator('button:has(.el-icon-full-screen), [class*="fullscreen"]').first()
      if (await fullscreenButton.isVisible().catch(() => false)) {
        await fullscreenButton.click()
        await delay(500)
        await page.screenshot({ path: 'test-results/header-fullscreen.png' })
        await fullscreenButton.click()
        await delay(300)
      }
    })
  })

  // ========== 新增：仪表盘交互测试 ==========
  test.describe('仪表盘交互测试', () => {
    test.beforeEach(async () => {
      await performLogin(page)
      await delay(1000)
    })

    test('测试统计数据卡片点击', async () => {
      const statCards = page.locator('.stat-card, .dashboard-card, [class*="stat"]').all()
      for (let i = 0; i < Math.min(statCards.length, 3); i++) {
        const card = statCards[i]
        if (await card.isVisible().catch(() => false)) {
          await card.click()
          await delay(500)
          await page.screenshot({ path: `test-results/dashboard-stat-card-${i}.png` })
          await page.goto(`${TEST_CONFIG.baseURL}/dashboard`)
          await delay(500)
        }
      }
    })

    test('测试图表区域交互', async () => {
      const chartContainers = page.locator('.chart-container, .echarts, [class*="chart"]').all()
      if (chartContainers.length > 0) {
        const firstChart = chartContainers[0]
        if (await firstChart.isVisible().catch(() => false)) {
          await firstChart.click()
          await delay(500)
          await page.screenshot({ path: 'test-results/dashboard-chart-click.png' })
        }
      }
    })

    test('测试快捷操作按钮', async () => {
      const quickActions = page.locator('.quick-action, [class*="quick"]').all()
      for (let i = 0; i < Math.min(quickActions.length, 3); i++) {
        const action = quickActions[i]
        if (await action.isVisible().catch(() => false)) {
          await action.click()
          await delay(500)
          await page.screenshot({ path: `test-results/dashboard-quick-action-${i}.png` })
          await page.goto(`${TEST_CONFIG.baseURL}/dashboard`)
          await delay(500)
        }
      }
    })
  })

  // ========== 新增：对话框和弹窗交互测试 ==========
  test.describe('对话框和弹窗交互测试', () => {
    test.beforeEach(async () => {
      await performLogin(page)
      await delay(1000)
    })

    test('测试确认对话框', async () => {
      await page.click('text=用户管理')
      await page.waitForURL(/\/users/, { timeout: TEST_CONFIG.timeouts.navigation })
      await delay(1000)

      const deleteButtons = page.locator('button:has-text("删除"), button[class*="delete"]').all()
      if (deleteButtons.length > 0) {
        await deleteButtons[0].click()
        await delay(500)
        await page.screenshot({ path: 'test-results/dialog-confirm.png' })

        const cancelButton = page.locator('button:has-text("取消"), .el-button--default').first()
        if (await cancelButton.isVisible().catch(() => false)) {
          await cancelButton.click()
          await delay(300)
        }
      }
    })

    test('测试新增/编辑对话框', async () => {
      await page.click('text=用户管理')
      await page.waitForURL(/\/users/, { timeout: TEST_CONFIG.timeouts.navigation })
      await delay(1000)

      const addButton = page.locator('button:has-text("新增"), button:has-text("添加"), button[class*="add"]').first()
      if (await addButton.isVisible().catch(() => false)) {
        await addButton.click()
        await delay(500)
        await page.screenshot({ path: 'test-results/dialog-add-form.png' })

        const closeButton = page.locator('.el-dialog__close, .dialog-close').first()
        if (await closeButton.isVisible().catch(() => false)) {
          await closeButton.click()
          await delay(300)
        } else {
          await page.keyboard.press('Escape')
          await delay(300)
        }
      }
    })
  })

  // ========== 新增：搜索和筛选交互测试 ==========
  test.describe('搜索和筛选交互测试', () => {
    test.beforeEach(async () => {
      await performLogin(page)
      await delay(1000)
    })

    test('测试多条件组合筛选', async () => {
      await page.click('text=用户管理')
      await page.waitForURL(/\/users/, { timeout: TEST_CONFIG.timeouts.navigation })
      await delay(1000)

      const selects = page.locator('.el-select').all()
      for (let i = 0; i < Math.min(selects.length, 3); i++) {
        const select = selects[i]
        if (await select.isVisible().catch(() => false)) {
          await select.click()
          await delay(300)
          const options = page.locator('.el-select-dropdown__item').all()
          if (options.length > 1) {
            await options[1].click()
            await delay(500)
          }
        }
      }
      await page.screenshot({ path: 'test-results/filter-multi-condition.png' })
    })

    test('测试日期范围选择', async () => {
      await page.click('text=订单管理')
      await page.waitForURL(/\/orders/, { timeout: TEST_CONFIG.timeouts.navigation })
      await delay(1000)

      const datePickers = page.locator('.el-date-editor, [class*="date"]').all()
      if (datePickers.length > 0) {
        const datePicker = datePickers[0]
        if (await datePicker.isVisible().catch(() => false)) {
          await datePicker.click()
          await delay(500)
          await page.screenshot({ path: 'test-results/filter-date-picker.png' })
          await page.keyboard.press('Escape')
          await delay(300)
        }
      }
    })

    test('测试搜索框清除按钮', async () => {
      await page.click('text=用户管理')
      await page.waitForURL(/\/users/, { timeout: TEST_CONFIG.timeouts.navigation })
      await delay(1000)

      const searchInput = page.locator('input[placeholder*="搜索"]').first()
      if (await searchInput.isVisible().catch(() => false)) {
        await searchInput.fill('测试搜索')
        await delay(300)

        const clearButton = page.locator('.el-input__clear, .search-clear').first()
        if (await clearButton.isVisible().catch(() => false)) {
          await clearButton.click()
          await delay(300)
          await page.screenshot({ path: 'test-results/search-clear.png' })
        }
      }
    })
  })

  // ========== 新增：分页和排序交互测试 ==========
  test.describe('分页和排序交互测试', () => {
    test.beforeEach(async () => {
      await performLogin(page)
      await delay(1000)
      await page.click('text=用户管理')
      await page.waitForURL(/\/users/, { timeout: TEST_CONFIG.timeouts.navigation })
      await delay(1000)
    })

    test('测试分页大小切换', async () => {
      const sizeSelector = page.locator('.el-pagination__sizes .el-select').first()
      if (await sizeSelector.isVisible().catch(() => false)) {
        await sizeSelector.click()
        await delay(300)
        const options = page.locator('.el-select-dropdown__item').all()
        if (options.length > 1) {
          await options[1].click()
          await delay(1000)
          await page.screenshot({ path: 'test-results/pagination-size-change.png' })
        }
      }
    })

    test('测试快速跳转分页', async () => {
      const jumper = page.locator('.el-pagination__jump input').first()
      if (await jumper.isVisible().catch(() => false)) {
        await jumper.fill('2')
        await delay(300)
        await page.keyboard.press('Enter')
        await delay(1000)
        await page.screenshot({ path: 'test-results/pagination-jump.png' })
      }
    })

    test('测试表格列排序', async () => {
      const sortableHeaders = page.locator('.el-table th.is-sortable, .el-table__header-wrapper th[sortable]').all()
      if (sortableHeaders.length > 0) {
        for (let i = 0; i < Math.min(sortableHeaders.length, 3); i++) {
          const header = sortableHeaders[i]
          await header.click()
          await delay(500)
          await page.screenshot({ path: `test-results/table-sort-${i}.png` })
          await header.click()
          await delay(500)
        }
      }
    })
  })
})
