import { test, expect, Page } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'

// 测试日志接口
interface TestLog {
  timestamp: string
  level: 'info' | 'warn' | 'error' | 'success'
  action: string
  target?: string
  details?: any
  url?: string
}

interface PageTestResult {
  page: string
  passed: number
  failed: number
  consoleErrors: string[]
  networkErrors: string[]
  logs: TestLog[]
}

// 全局测试结果
const testResults: PageTestResult[] = []
const allConsoleLogs: { type: string; message: string; url: string }[] = []

// 辅助函数：记录日志
function log(level: TestLog['level'], action: string, target?: string, details?: any, url?: string): TestLog {
  const logEntry: TestLog = {
    timestamp: new Date().toISOString(),
    level,
    action,
    target,
    details,
    url
  }
  console.log(`[${level.toUpperCase()}] ${action}${target ? ` - ${target}` : ''}`)
  return logEntry
}

// 辅助函数：等待
async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// 设置页面错误监控
async function setupErrorMonitoring(page: Page, pageName: string): Promise<PageTestResult> {
  const result: PageTestResult = {
    page: pageName,
    passed: 0,
    failed: 0,
    consoleErrors: [],
    networkErrors: [],
    logs: []
  }

  // 监听控制台消息
  page.on('console', msg => {
    const logEntry = {
      type: msg.type(),
      message: msg.text(),
      url: page.url()
    }
    allConsoleLogs.push(logEntry)

    if (msg.type() === 'error') {
      result.consoleErrors.push(msg.text())
      result.logs.push(log('error', 'Console Error', msg.text(), undefined, page.url()))
    } else if (msg.type() === 'warning') {
      result.logs.push(log('warn', 'Console Warning', msg.text(), undefined, page.url()))
    }
  })

  // 监听页面错误
  page.on('pageerror', error => {
    result.consoleErrors.push(error.message)
    result.logs.push(log('error', 'Page Error', error.message, undefined, page.url()))
  })

  // 监听请求失败
  page.on('requestfailed', request => {
    const errorText = `${request.method()} ${request.url()} - ${request.failure()?.errorText || 'Unknown error'}`
    result.networkErrors.push(errorText)
    result.logs.push(log('error', 'Request Failed', errorText, undefined, page.url()))
  })

  // 监听响应错误
  page.on('response', response => {
    if (response.status() >= 400) {
      const errorText = `${response.request().method()} ${response.url()} - ${response.status()}`
      result.networkErrors.push(errorText)
      result.logs.push(log('error', 'HTTP Error', errorText, undefined, page.url()))
    }
  })

  return result
}

// 测试按钮点击
async function testButtons(page: Page, result: PageTestResult): Promise<void> {
  const buttons = await page.locator('button:not([disabled]), .el-button:not(.is-disabled)').all()
  result.logs.push(log('info', 'Found buttons', undefined, { count: buttons.length }, page.url()))

  for (let i = 0; i < Math.min(buttons.length, 5); i++) {
    const button = buttons[i]
    const startTime = Date.now()

    try {
      const text = await button.textContent() || 'Unknown'
      const isVisible = await button.isVisible()
      const isEnabled = await button.isEnabled()

      if (!isVisible || !isEnabled) {
        result.logs.push(log('warn', 'Button not interactable', text, { isVisible, isEnabled }, page.url()))
        continue
      }

      await button.scrollIntoViewIfNeeded()
      await sleep(100)
      await button.click()
      await sleep(200)

      const duration = Date.now() - startTime
      result.logs.push(log('success', 'Button clicked', text, undefined, page.url()))
      result.passed++
    } catch (error: any) {
      result.logs.push(log('error', 'Button click failed', `Button ${i}`, error.message, page.url()))
      result.failed++
    }
  }
}

// 测试链接点击
async function testLinks(page: Page, result: PageTestResult): Promise<void> {
  const links = await page.locator('a[href^="/"]:not([href="/"]):not([href^="//"])').all()
  result.logs.push(log('info', 'Found links', undefined, { count: links.length }, page.url()))

  for (let i = 0; i < Math.min(links.length, 3); i++) {
    const link = links[i]
    const startTime = Date.now()

    try {
      const href = await link.getAttribute('href') || 'Unknown'
      const isVisible = await link.isVisible()

      if (!isVisible) continue

      await link.scrollIntoViewIfNeeded()
      await sleep(100)

      // 检查是否会跳转
      const currentUrl = page.url()
      await link.click()
      await sleep(500)

      const newUrl = page.url()
      if (newUrl !== currentUrl) {
        result.logs.push(log('info', 'Link navigated', href, { from: currentUrl, to: newUrl }, page.url()))
        // 返回原页面
        await page.goBack()
        await sleep(300)
      }

      result.passed++
    } catch (error: any) {
      result.logs.push(log('error', 'Link click failed', `Link ${i}`, error.message, page.url()))
      result.failed++
    }
  }
}

// 测试输入框
async function testInputs(page: Page, result: PageTestResult): Promise<void> {
  const inputs = await page.locator('input[type="text"]:not([disabled]), input[type="email"]:not([disabled]), .el-input__inner:not([disabled])').all()
  result.logs.push(log('info', 'Found inputs', undefined, { count: inputs.length }, page.url()))

  for (let i = 0; i < Math.min(inputs.length, 3); i++) {
    const input = inputs[i]
    const startTime = Date.now()

    try {
      const isVisible = await input.isVisible()
      if (!isVisible) continue

      await input.scrollIntoViewIfNeeded()
      await input.fill(`Test value ${Date.now()}`)
      await sleep(100)
      await input.clear()

      result.logs.push(log('success', 'Input tested', `Input ${i}`, undefined, page.url()))
      result.passed++
    } catch (error: any) {
      result.logs.push(log('error', 'Input test failed', `Input ${i}`, error.message, page.url()))
      result.failed++
    }
  }
}

// 测试表格
async function testTables(page: Page, result: PageTestResult): Promise<void> {
  const tables = await page.locator('.el-table').all()
  result.logs.push(log('info', 'Found tables', undefined, { count: tables.length }, page.url()))

  for (const table of tables) {
    try {
      const rows = await table.locator('.el-table__row').all()
      result.logs.push(log('info', 'Table rows', undefined, { count: rows.length }, page.url()))

      // 测试点击表头排序
      const headers = await table.locator('.el-table__header-wrapper th').all()
      for (let i = 0; i < Math.min(headers.length, 2); i++) {
        const header = headers[i]
        if (await header.isVisible()) {
          await header.click()
          await sleep(200)
        }
      }

      result.passed++
    } catch (error: any) {
      result.logs.push(log('error', 'Table test failed', undefined, error.message, page.url()))
      result.failed++
    }
  }
}

// 测试标签页
async function testTabs(page: Page, result: PageTestResult): Promise<void> {
  const tabs = await page.locator('.el-tabs__item').all()
  result.logs.push(log('info', 'Found tabs', undefined, { count: tabs.length }, page.url()))

  for (const tab of tabs) {
    try {
      if (await tab.isVisible()) {
        await tab.click()
        await sleep(300)
        result.passed++
      }
    } catch (error: any) {
      result.logs.push(log('error', 'Tab click failed', undefined, error.message, page.url()))
      result.failed++
    }
  }
}

// 测试下拉菜单
async function testDropdowns(page: Page, result: PageTestResult): Promise<void> {
  const dropdowns = await page.locator('.el-dropdown').all()
  result.logs.push(log('info', 'Found dropdowns', undefined, { count: dropdowns.length }, page.url()))

  for (const dropdown of dropdowns) {
    try {
      if (await dropdown.isVisible()) {
        await dropdown.click()
        await sleep(300)
        // 点击其他地方关闭下拉
        await page.keyboard.press('Escape')
        await sleep(100)
        result.passed++
      }
    } catch (error: any) {
      result.logs.push(log('error', 'Dropdown test failed', undefined, error.message, page.url()))
      result.failed++
    }
  }
}

// 测试菜单
async function testMenu(page: Page, result: PageTestResult): Promise<void> {
  const menuItems = await page.locator('.el-menu-item, .el-sub-menu__title').all()
  result.logs.push(log('info', 'Found menu items', undefined, { count: menuItems.length }, page.url()))

  for (let i = 0; i < Math.min(menuItems.length, 5); i++) {
    const item = menuItems[i]
    try {
      if (await item.isVisible()) {
        await item.click()
        await sleep(300)
        result.passed++
      }
    } catch (error: any) {
      result.logs.push(log('error', 'Menu item click failed', undefined, error.message, page.url()))
      result.failed++
    }
  }
}

// 测试页面
async function testPage(page: Page, route: string, pageName: string): Promise<PageTestResult> {
  console.log(`\n========== Testing: ${pageName} (${route}) ==========`)

  const result = await setupErrorMonitoring(page, pageName)

  try {
    // 导航到页面
    await page.goto(route)
    await page.waitForLoadState('networkidle')
    await sleep(1000)

    result.logs.push(log('info', 'Page loaded', undefined, { url: page.url() }, page.url()))

    // 执行各种测试
    await testButtons(page, result)
    await testInputs(page, result)
    await testTables(page, result)
    await testTabs(page, result)
    await testDropdowns(page, result)
    await testMenu(page, result)

    // 检查页面标题
    const title = await page.title()
    result.logs.push(log('info', 'Page title', title, undefined, page.url()))

  } catch (error: any) {
    result.logs.push(log('error', 'Page test failed', undefined, error.message, page.url()))
    result.failed++
  }

  testResults.push(result)
  return result
}

test.describe('管理后台全面审计', () => {
  test('登录页面测试', async ({ page }) => {
    const result = await testPage(page, '/login', '登录页')

    // 测试登录表单
    await page.fill('input[placeholder="请输入用户名"]', 'admin')
    await page.fill('input[placeholder="请输入密码"]', 'admin123')
    await sleep(200)

    // 检查是否有错误提示
    const errorAlert = await page.locator('.el-alert--error').first()
    if (await errorAlert.isVisible().catch(() => false)) {
      const errorText = await errorAlert.textContent()
      result.logs.push(log('warn', 'Login error visible', errorText || '', undefined, page.url()))
    }

    expect(result.consoleErrors).toHaveLength(0)
  })

  test('仪表板页面测试', async ({ page }) => {
    // 先登录
    await page.goto('/login')
    await page.fill('input[placeholder="请输入用户名"]', 'admin')
    await page.fill('input[placeholder="请输入密码"]', 'admin123')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/dashboard**', { timeout: 10000 }).catch(() => {})

    const result = await testPage(page, '/dashboard', '仪表板')
    expect(result.consoleErrors).toHaveLength(0)
  })

  test('用户管理页面测试', async ({ page }) => {
    const result = await testPage(page, '/users/list', '用户列表')
    expect(result.consoleErrors).toHaveLength(0)
  })

  test('聚会管理页面测试', async ({ page }) => {
    const result = await testPage(page, '/parties/list', '聚会列表')
    expect(result.consoleErrors).toHaveLength(0)
  })

  test('聚会审核页面测试', async ({ page }) => {
    const result = await testPage(page, '/parties/audit', '聚会审核')
    expect(result.consoleErrors).toHaveLength(0)
  })

  test('订单管理页面测试', async ({ page }) => {
    const result = await testPage(page, '/orders/list', '订单列表')
    expect(result.consoleErrors).toHaveLength(0)
  })

  test('财务管理页面测试', async ({ page }) => {
    const result = await testPage(page, '/finance/withdrawals', '提现管理')
    expect(result.consoleErrors).toHaveLength(0)
  })

  test('系统设置页面测试', async ({ page }) => {
    const result = await testPage(page, '/system/admins', '管理员管理')
    expect(result.consoleErrors).toHaveLength(0)
  })

  test('内容管理页面测试', async ({ page }) => {
    const result = await testPage(page, '/content/banners', 'Banner管理')
    expect(result.consoleErrors).toHaveLength(0)
  })

  test.afterAll(async () => {
    console.log('\n========== 生成测试报告 ==========\n')

    const totalPassed = testResults.reduce((sum, r) => sum + r.passed, 0)
    const totalFailed = testResults.reduce((sum, r) => sum + r.failed, 0)
    const totalConsoleErrors = testResults.reduce((sum, r) => sum + r.consoleErrors.length, 0)
    const totalNetworkErrors = testResults.reduce((sum, r) => sum + r.networkErrors.length, 0)

    const report = {
      summary: {
        totalPages: testResults.length,
        totalInteractions: totalPassed + totalFailed,
        passed: totalPassed,
        failed: totalFailed,
        consoleErrors: totalConsoleErrors,
        networkErrors: totalNetworkErrors,
        passRate: totalPassed + totalFailed > 0 ? ((totalPassed / (totalPassed + totalFailed)) * 100).toFixed(2) + '%' : '0%',
        timestamp: new Date().toISOString()
      },
      results: testResults,
      allConsoleLogs: allConsoleLogs.filter(log => log.type === 'error' || log.type === 'warning')
    }

    // 保存报告
    const reportPath = path.join(process.cwd(), 'audit-report.json')
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))

    console.log('测试摘要:')
    console.log(`  测试页面数: ${report.summary.totalPages}`)
    console.log(`  交互测试数: ${report.summary.totalInteractions}`)
    console.log(`  通过: ${report.summary.passed} ✅`)
    console.log(`  失败: ${report.summary.failed} ❌`)
    console.log(`  控制台错误: ${report.summary.consoleErrors} ⚠️`)
    console.log(`  网络错误: ${report.summary.networkErrors} 🌐`)
    console.log(`  通过率: ${report.summary.passRate}`)
    console.log(`\n详细报告已保存: ${reportPath}`)

    // 打印所有错误
    if (totalConsoleErrors > 0 || totalNetworkErrors > 0) {
      console.log('\n❌ 发现的错误:')
      testResults.forEach(r => {
        if (r.consoleErrors.length > 0 || r.networkErrors.length > 0) {
          console.log(`\n[${r.page}]`)
          r.consoleErrors.forEach(e => console.log(`  Console: ${e}`))
          r.networkErrors.forEach(e => console.log(`  Network: ${e}`))
        }
      })
    }
  })
})
