/**
 * 自动化交互测试入口
 * 用于在浏览器中执行全面的交互测试
 */

import { AutomatedInteractionTester, TestLog } from '../../tests/e2e/automated-interaction-test'

export interface TestPageConfig {
  path: string
  name: string
  requiredElements?: string[]
}

// 测试页面配置
const testPages: TestPageConfig[] = [
  { path: '/login', name: '登录页' },
  { path: '/dashboard', name: '仪表盘' },
  { path: '/users', name: '用户列表' },
  { path: '/parties', name: '聚会列表' },
  { path: '/parties/audit', name: '聚会审核' },
  { path: '/orders', name: '订单管理' },
  { path: '/finance', name: '财务管理' },
  { path: '/system/admins', name: '管理员管理' },
  { path: '/system/roles', name: '角色管理' },
  { path: '/app/versions', name: '版本管理' }
]

// 全局测试结果
let globalTestResults: {
  pageResults: Array<{
    page: string
    passed: number
    failed: number
    logs: TestLog[]
  }>
  totalPassed: number
  totalFailed: number
  startTime: number
  endTime: number
} = {
  pageResults: [],
  totalPassed: 0,
  totalFailed: 0,
  startTime: 0,
  endTime: 0
}

/**
 * 执行单页面测试
 */
async function testSinglePage(tester: AutomatedInteractionTester, pageConfig: TestPageConfig): Promise<void> {
  console.log(`\n========== 测试页面: ${pageConfig.name} (${pageConfig.path}) ==========`)

  try {
    // 等待页面加载
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 执行页面测试
    const result = await tester.testPage()

    // 记录结果
    globalTestResults.pageResults.push({
      page: pageConfig.name,
      passed: result.passed,
      failed: result.failed,
      logs: (tester as any).logs || []
    })

    globalTestResults.totalPassed += result.passed
    globalTestResults.totalFailed += result.failed

    console.log(`✅ ${pageConfig.name} 测试完成: 通过 ${result.passed}, 失败 ${result.failed}`)
  } catch (error) {
    console.error(`❌ ${pageConfig.name} 测试失败:`, error)
    globalTestResults.pageResults.push({
      page: pageConfig.name,
      passed: 0,
      failed: 1,
      logs: [{
        timestamp: new Date().toISOString(),
        level: 'error',
        action: 'page_test_failed',
        details: { error: String(error) }
      }]
    })
    globalTestResults.totalFailed++
  }
}

/**
 * 执行全量自动化交互测试
 */
export async function runAutomatedInteractionTest(): Promise<void> {
  console.log('\n🚀 启动管理后台自动化交互测试...\n')

  globalTestResults = {
    pageResults: [],
    totalPassed: 0,
    totalFailed: 0,
    startTime: Date.now(),
    endTime: 0
  }

  const tester = new AutomatedInteractionTester()

  // 检查是否在登录页
  if (window.location.pathname === '/login') {
    console.log('检测到登录页，执行登录测试...')
    await testSinglePage(tester, { path: '/login', name: '登录页' })

    // 模拟登录（如果需要）
    const usernameInput = document.querySelector<HTMLInputElement>('input[name="username"], input[placeholder*="用户名"]')
    const passwordInput = document.querySelector<HTMLInputElement>('input[name="password"], input[type="password"]')
    const loginBtn = document.querySelector<HTMLButtonElement>('button[type="submit"], .el-button--primary')

    if (usernameInput && passwordInput && loginBtn) {
      console.log('自动填充登录信息...')
      usernameInput.value = 'admin'
      usernameInput.dispatchEvent(new Event('input', { bubbles: true }))
      passwordInput.value = 'admin123'
      passwordInput.dispatchEvent(new Event('input', { bubbles: true }))
      await new Promise(resolve => setTimeout(resolve, 200))
      loginBtn.click()
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
  }

  // 测试当前页面
  const currentPage = testPages.find(p => window.location.pathname.startsWith(p.path))
  if (currentPage) {
    await testSinglePage(tester, currentPage)
  } else {
    console.log('当前页面不在测试列表中，执行通用测试...')
    await testSinglePage(tester, { path: window.location.pathname, name: '当前页面' })
  }

  globalTestResults.endTime = Date.now()

  // 生成测试报告
  generateTestReport()
}

/**
 * 生成测试报告
 */
function generateTestReport(): void {
  const duration = globalTestResults.endTime - globalTestResults.startTime
  const totalTests = globalTestResults.totalPassed + globalTestResults.totalFailed
  const passRate = totalTests > 0 ? ((globalTestResults.totalPassed / totalTests) * 100).toFixed(2) : '0.00'

  console.log('\n' + '='.repeat(60))
  console.log('📊 自动化交互测试报告')
  console.log('='.repeat(60))
  console.log(`总测试数: ${totalTests}`)
  console.log(`通过: ${globalTestResults.totalPassed} ✅`)
  console.log(`失败: ${globalTestResults.totalFailed} ❌`)
  console.log(`通过率: ${passRate}%`)
  console.log(`总耗时: ${duration}ms (${(duration / 1000).toFixed(2)}s)`)
  console.log('='.repeat(60))

  // 页面详情
  console.log('\n📄 各页面测试结果:')
  globalTestResults.pageResults.forEach(result => {
    const status = result.failed === 0 ? '✅' : '⚠️'
    console.log(`  ${status} ${result.page}: 通过 ${result.passed}, 失败 ${result.failed}`)
  })

  // 错误详情
  const errors = globalTestResults.pageResults.flatMap(r =>
    r.logs.filter(l => l.level === 'error')
  )

  if (errors.length > 0) {
    console.log('\n❌ 错误详情:')
    errors.forEach((error, index) => {
      console.log(`\n[错误 ${index + 1}]`)
      console.log(`  时间: ${error.timestamp}`)
      console.log(`  操作: ${error.action}`)
      console.log(`  目标: ${error.target || 'N/A'}`)
      console.log(`  详情:`, error.details || error.error)
    })
  } else {
    console.log('\n✅ 未发现错误')
  }

  // 导出详细报告到全局
  ;(window as any).__testReport = {
    summary: {
      totalTests,
      passed: globalTestResults.totalPassed,
      failed: globalTestResults.totalFailed,
      passRate: `${passRate}%`,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString()
    },
    pageResults: globalTestResults.pageResults,
    errors: errors.map(e => ({
      timestamp: e.timestamp,
      action: e.action,
      target: e.target,
      message: e.error?.message || e.details,
      stack: e.error?.stack
    }))
  }

  console.log('\n📋 详细报告已导出到 window.__testReport')
  console.log('='.repeat(60))
}

/**
 * 初始化自动测试（当URL包含 autoTest=true 时自动启动）
 */
export function initAutoInteractionTest(): void {
  const urlParams = new URLSearchParams(window.location.search)

  if (urlParams.get('autoTest') === 'true') {
    console.log('🤖 自动测试模式已启用')

    // 等待页面完全加载
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        setTimeout(runAutomatedInteractionTest, 1500)
      })
    } else {
      setTimeout(runAutomatedInteractionTest, 1500)
    }
  }

  // 暴露全局测试函数
  ;(window as any).runInteractionTest = runAutomatedInteractionTest
  ;(window as any).getTestReport = () => (window as any).__testReport
}

// 自动初始化
initAutoInteractionTest()
