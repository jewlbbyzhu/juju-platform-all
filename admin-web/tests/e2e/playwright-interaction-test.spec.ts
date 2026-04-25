import { test, expect, Page, Locator } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'

// 测试日志接口
interface TestLog {
  timestamp: string
  level: 'info' | 'warn' | 'error' | 'success'
  action: string
  target?: string
  details?: any
  duration?: number
  error?: {
    type: string
    message: string
    stack?: string
  }
}

interface TestResult {
  page: string
  passed: number
  failed: number
  logs: TestLog[]
}

// 全局测试结果
const testResults: TestResult[] = []
let consoleLogs: { type: string; message: string; timestamp: string }[] = []

// 辅助函数：记录日志
function log(level: TestLog['level'], action: string, target?: string, details?: any, duration?: number): TestLog {
  const logEntry: TestLog = {
    timestamp: new Date().toISOString(),
    level,
    action,
    target,
    details,
    duration
  }
  console.log(`[${level.toUpperCase()}] ${action}${target ? ` - ${target}` : ''}`)
  return logEntry
}

// 辅助函数：等待
async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// 辅助函数：生成测试数据
function generateTestValue(type: string): string {
  switch (type) {
    case 'email':
      return `test${Date.now()}@example.com`
    case 'tel':
    case 'phone':
      return '13800138000'
    case 'number':
      return '100'
    case 'password':
      return 'TestPass123!'
    case 'date':
      return new Date().toISOString().split('T')[0]
    case 'url':
      return 'https://example.com'
    default:
      return `Test Value ${Date.now()}`
  }
}

// 测试按钮点击
test.describe('按钮交互测试', () => {
  test('测试登录页按钮', async ({ page }) => {
    const logs: TestLog[] = []
    let passed = 0
    let failed = 0

    await page.goto('http://localhost:3000/login')
    await page.waitForLoadState('networkidle')
    await sleep(1000)

    // 获取所有按钮
    const buttons = await page.locator('button:not([disabled]), .el-button:not(.is-disabled)').all()
    logs.push(log('info', '开始按钮测试', undefined, { totalButtons: buttons.length }))

    for (let i = 0; i < Math.min(buttons.length, 5); i++) {
      const button = buttons[i]
      const startTime = Date.now()

      try {
        // 获取按钮文本
        const text = await button.textContent() || 'Unknown'
        logs.push(log('info', '测试按钮点击', text))

        // 检查按钮是否可见和可用
        const isVisible = await button.isVisible()
        const isEnabled = await button.isEnabled()

        if (!isVisible || !isEnabled) {
          logs.push(log('warn', '按钮不可用', text, { isVisible, isEnabled }))
          continue
        }

        // 滚动到视图并点击
        await button.scrollIntoViewIfNeeded()
        await sleep(100)
        await button.click()
        await sleep(200)

        const duration = Date.now() - startTime
        logs.push(log('success', '按钮点击成功', text, undefined, duration))
        passed++
      } catch (error) {
        const duration = Date.now() - startTime
        logs.push(log('error', '按钮点击失败', `Button ${i}`, error, duration))
        failed++
      }
    }

    testResults.push({ page: '登录页-按钮', passed, failed, logs })
    expect(failed).toBe(0)
  })
})

// 测试文本输入
test.describe('文本输入测试', () => {
  test('测试登录表单输入', async ({ page }) => {
    const logs: TestLog[] = []
    let passed = 0
    let failed = 0

    await page.goto('http://localhost:3000/login')
    await page.waitForLoadState('networkidle')
    await sleep(1000)

    // 测试用户名输入
    const usernameInput = page.locator('input[name="username"], input[placeholder*="用户名"]').first()
    if (await usernameInput.count() > 0) {
      const startTime = Date.now()
      try {
        logs.push(log('info', '测试用户名输入'))
        await usernameInput.scrollIntoViewIfNeeded()
        await usernameInput.fill('admin')
        await sleep(100)

        const duration = Date.now() - startTime
        logs.push(log('success', '用户名输入成功', undefined, { value: 'admin' }, duration))
        passed++
      } catch (error) {
        const duration = Date.now() - startTime
        logs.push(log('error', '用户名输入失败', undefined, error, duration))
        failed++
      }
    }

    // 测试密码输入
    const passwordInput = page.locator('input[name="password"], input[type="password"]').first()
    if (await passwordInput.count() > 0) {
      const startTime = Date.now()
      try {
        logs.push(log('info', '测试密码输入'))
        await passwordInput.scrollIntoViewIfNeeded()
        await passwordInput.fill('admin123')
        await sleep(100)

        const duration = Date.now() - startTime
        logs.push(log('success', '密码输入成功', undefined, { value: '***' }, duration))
        passed++
      } catch (error) {
        const duration = Date.now() - startTime
        logs.push(log('error', '密码输入失败', undefined, error, duration))
        failed++
      }
    }

    testResults.push({ page: '登录页-输入', passed, failed, logs })
    expect(failed).toBe(0)
  })
})

// 测试表单提交
test.describe('表单提交测试', () => {
  test('测试登录表单提交', async ({ page }) => {
    const logs: TestLog[] = []
    let passed = 0
    let failed = 0

    await page.goto('http://localhost:3000/login')
    await page.waitForLoadState('networkidle')
    await sleep(1000)

    const startTime = Date.now()
    try {
      logs.push(log('info', '测试登录表单提交'))

      // 填写表单
      const usernameInput = page.locator('input[name="username"], input[placeholder*="用户名"]').first()
      const passwordInput = page.locator('input[name="password"], input[type="password"]').first()

      if (await usernameInput.count() > 0) {
        await usernameInput.fill('admin')
      }
      if (await passwordInput.count() > 0) {
        await passwordInput.fill('admin123')
      }

      await sleep(200)

      // 提交表单
      const submitBtn = page.locator('button[type="submit"], .el-button--primary').first()
      if (await submitBtn.count() > 0) {
        await submitBtn.click()
        await sleep(2000)

        // 检查是否跳转
        const currentUrl = page.url()
        logs.push(log('info', '提交后URL', currentUrl))

        const duration = Date.now() - startTime
        logs.push(log('success', '表单提交成功', undefined, { url: currentUrl }, duration))
        passed++
      } else {
        logs.push(log('warn', '未找到提交按钮'))
      }
    } catch (error) {
      const duration = Date.now() - startTime
      logs.push(log('error', '表单提交失败', undefined, error, duration))
      failed++
    }

    testResults.push({ page: '登录页-表单提交', passed, failed, logs })
  })
})

// 测试复选框
test.describe('复选框测试', () => {
  test('测试复选框交互', async ({ page }) => {
    const logs: TestLog[] = []
    let passed = 0
    let failed = 0

    await page.goto('http://localhost:3000/login')
    await page.waitForLoadState('networkidle')
    await sleep(1000)

    const checkboxes = await page.locator('.el-checkbox').all()
    logs.push(log('info', '发现复选框数量', undefined, { count: checkboxes.length }))

    for (let i = 0; i < Math.min(checkboxes.length, 3); i++) {
      const checkbox = checkboxes[i]
      const startTime = Date.now()

      try {
        logs.push(log('info', `测试复选框 ${i + 1}`))

        const isVisible = await checkbox.isVisible()
        if (!isVisible) {
          logs.push(log('warn', `复选框 ${i + 1} 不可见`))
          continue
        }

        await checkbox.scrollIntoViewIfNeeded()
        await sleep(100)

        // 获取初始状态
        const isChecked = await checkbox.evaluate(el => el.classList.contains('is-checked'))
        logs.push(log('info', `复选框 ${i + 1} 初始状态`, undefined, { isChecked }))

        // 点击切换
        await checkbox.click()
        await sleep(150)

        // 再次点击恢复
        await checkbox.click()
        await sleep(150)

        const duration = Date.now() - startTime
        logs.push(log('success', `复选框 ${i + 1} 测试成功`, undefined, { wasChecked: isChecked }, duration))
        passed++
      } catch (error) {
        const duration = Date.now() - startTime
        logs.push(log('error', `复选框 ${i + 1} 测试失败`, undefined, error, duration))
        failed++
      }
    }

    testResults.push({ page: '登录页-复选框', passed, failed, logs })
  })
})

// 测试下拉选择
test.describe('下拉选择测试', () => {
  test('测试下拉选择交互', async ({ page }) => {
    const logs: TestLog[] = []
    let passed = 0
    let failed = 0

    await page.goto('http://localhost:3000/login')
    await page.waitForLoadState('networkidle')
    await sleep(1000)

    const selects = await page.locator('.el-select').all()
    logs.push(log('info', '发现下拉选择数量', undefined, { count: selects.length }))

    for (let i = 0; i < Math.min(selects.length, 2); i++) {
      const select = selects[i]
      const startTime = Date.now()

      try {
        logs.push(log('info', `测试下拉选择 ${i + 1}`))

        const isVisible = await select.isVisible()
        if (!isVisible) {
          logs.push(log('warn', `下拉选择 ${i + 1} 不可见`))
          continue
        }

        await select.scrollIntoViewIfNeeded()
        await sleep(100)

        // 打开下拉框
        await select.click()
        await sleep(300)

        // 选择第一个选项
        const firstOption = page.locator('.el-select-dropdown__item, .el-dropdown-menu__item').first()
        if (await firstOption.count() > 0) {
          const optionText = await firstOption.textContent()
          await firstOption.click()
          await sleep(150)
          logs.push(log('success', '选择选项', optionText || 'Unknown'))
        } else {
          logs.push(log('warn', '下拉框中无选项'))
          // 关闭下拉框
          await page.keyboard.press('Escape')
          await sleep(100)
        }

        const duration = Date.now() - startTime
        logs.push(log('success', `下拉选择 ${i + 1} 测试成功`, undefined, undefined, duration))
        passed++
      } catch (error) {
        const duration = Date.now() - startTime
        logs.push(log('error', `下拉选择 ${i + 1} 测试失败`, undefined, error, duration))
        failed++
      }
    }

    testResults.push({ page: '登录页-下拉选择', passed, failed, logs })
  })
})

// 测试控制台错误
test.describe('控制台错误监控', () => {
  test('监控控制台错误', async ({ page }) => {
    consoleLogs = []

    // 监听控制台消息
    page.on('console', msg => {
      consoleLogs.push({
        type: msg.type(),
        message: msg.text(),
        timestamp: new Date().toISOString()
      })
    })

    // 监听页面错误
    page.on('pageerror', error => {
      consoleLogs.push({
        type: 'pageerror',
        message: error.message,
        timestamp: new Date().toISOString()
      })
    })

    await page.goto('http://localhost:3000/login')
    await page.waitForLoadState('networkidle')
    await sleep(2000)

    // 执行一些交互
    const buttons = await page.locator('button').all()
    for (const button of buttons.slice(0, 3)) {
      try {
        if (await button.isVisible() && await button.isEnabled()) {
          await button.click()
          await sleep(200)
        }
      } catch (e) {
        // 忽略点击错误
      }
    }

    await sleep(1000)

    // 分析控制台日志
    const errors = consoleLogs.filter(log => log.type === 'error' || log.type === 'pageerror')
    const warnings = consoleLogs.filter(log => log.type === 'warning')

    console.log('控制台错误:', errors)
    console.log('控制台警告:', warnings)

    // 保存结果
    testResults.push({
      page: '控制台监控',
      passed: errors.length === 0 ? 1 : 0,
      failed: errors.length,
      logs: [
        log('info', '控制台监控完成', undefined, {
          totalLogs: consoleLogs.length,
          errors: errors.length,
          warnings: warnings.length
        })
      ]
    })

    // 不应该有错误
    expect(errors).toHaveLength(0)
  })
})

// 生成测试报告
test.afterAll(async () => {
  console.log('\n========== 生成测试报告 ==========\n')

  const totalPassed = testResults.reduce((sum, r) => sum + r.passed, 0)
  const totalFailed = testResults.reduce((sum, r) => sum + r.failed, 0)
  const totalTests = totalPassed + totalFailed

  const report = {
    summary: {
      totalTests,
      passed: totalPassed,
      failed: totalFailed,
      passRate: totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(2) + '%' : '0%',
      timestamp: new Date().toISOString()
    },
    results: testResults,
    consoleLogs: consoleLogs.filter(log => log.type === 'error' || log.type === 'warning')
  }

  // 保存报告到文件
  const reportPath = path.join(__dirname, '..', '..', 'e2e-test-report.json')
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))

  console.log('测试摘要:')
  console.log(`  总测试数: ${totalTests}`)
  console.log(`  通过: ${totalPassed} ✅`)
  console.log(`  失败: ${totalFailed} ❌`)
  console.log(`  通过率: ${report.summary.passRate}`)
  console.log(`\n详细报告已保存到: ${reportPath}`)

  // 打印错误详情
  const allErrors = testResults.flatMap(r =>
    r.logs.filter(l => l.level === 'error')
  )

  if (allErrors.length > 0) {
    console.log('\n❌ 错误详情:')
    allErrors.forEach((error, index) => {
      console.log(`\n[错误 ${index + 1}]`)
      console.log(`  时间: ${error.timestamp}`)
      console.log(`  操作: ${error.action}`)
      console.log(`  目标: ${error.target || 'N/A'}`)
      console.log(`  详情:`, error.details || error.error)
    })
  }
})
