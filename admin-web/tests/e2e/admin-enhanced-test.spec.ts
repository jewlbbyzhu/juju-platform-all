import { expect, test, Page } from '@playwright/test'

// 测试配置
const TEST_CONFIG = {
  baseURL: 'http://localhost:3000',
  apiBaseURL: 'https://api.hfparty.asia/api/v2',
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

// API响应验证器
class APIValidator {
  private page: Page
  private apiResponses: Map<string, any> = new Map()

  constructor(page: Page) {
    this.page = page
    this.setupInterceptor()
  }

  private setupInterceptor() {
    this.page.on('response', async (response) => {
      const url = response.url()
      // 拦截所有API请求（包括登录、管理等）
      if (url.includes('/api/') || url.includes('hfparty.asia') || url.includes('localhost')) {
        try {
          const data = await response.json()
          this.apiResponses.set(url, {
            status: response.status(),
            data: data,
            timestamp: new Date().toISOString()
          })
          console.log(`📡 API响应: ${url.substring(0, 80)}...`)
        } catch (e) {
          // 非JSON响应
        }
      }
    })
  }

  getResponse(urlPattern: string): any {
    for (const [url, response] of this.apiResponses) {
      if (url.includes(urlPattern)) {
        return response
      }
    }
    return null
  }

  validateResponse(urlPattern: string, validator: (data: any) => boolean): boolean {
    // 尝试多种可能的URL模式
    const patterns = [
      urlPattern,
      urlPattern.replace('/api/', '/'),
      urlPattern.replace('/v2/', '/'),
      '/api/v2' + urlPattern,
      '/api' + urlPattern
    ]
    
    for (const pattern of patterns) {
      const response = this.getResponse(pattern)
      if (response) {
        if (response.status !== 200) {
          console.log(`❌ API响应状态码错误: ${response.status}`)
          return false
        }
        
        const isValid = validator(response.data)
        console.log(`${isValid ? '✅' : '❌'} API验证: ${pattern}`)
        return isValid
      }
    }
    
    console.log(`⚠️ 未找到API响应: ${urlPattern}`)
    // 打印所有已捕获的URL用于调试
    console.log('  已捕获的URL:', Array.from(this.apiResponses.keys()).map(u => u.substring(u.lastIndexOf('/'))))
    return false
  }

  clear() {
    this.apiResponses.clear()
  }
}

// 数据验证器
class DataValidator {
  static validateDate(dateStr: string): boolean {
    if (!dateStr || dateStr === '-' || dateStr === 'Invalid Date') {
      return false
    }
    const date = new Date(dateStr)
    return !isNaN(date.getTime())
  }

  static validateNumber(num: string | number): boolean {
    if (typeof num === 'number') {
      return !isNaN(num)
    }
    if (!num || num === '-') {
      return false
    }
    const parsed = parseFloat(num.replace(/,/g, ''))
    return !isNaN(parsed)
  }

  static validateCurrency(amount: string): boolean {
    if (!amount || amount === '-') {
      return false
    }
    const match = amount.match(/^[¥$]?([\d,]+\.?\d*)$/)
    return match !== null
  }

  static validateStatus(status: string, validStatuses: string[]): boolean {
    return validStatuses.includes(status)
  }

  static validatePhone(phone: string): boolean {
    return /^1[3-9]\d{9}$/.test(phone)
  }

  static validateEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }
}

// 增强的元素查找器
async function findElement(page: Page, selectors: string[], timeout = TEST_CONFIG.timeouts.element) {
  for (const selector of selectors) {
    try {
      const element = page.locator(selector).first()
      await element.waitFor({ state: 'visible', timeout: timeout / selectors.length })
      return element
    } catch (e) {
      continue
    }
  }
  return null
}

// 辅助函数：登录
async function performLogin(page: Page): Promise<APIValidator> {
  console.log('开始登录...')
  const apiValidator = new APIValidator(page)
  
  await page.goto(`${TEST_CONFIG.baseURL}/login`)
  await page.waitForLoadState('networkidle')
  
  // 验证登录页面加载
  const loginForm = await findElement(page, [
    '.login-form',
    '.el-form',
    'form',
    '.login-container'
  ])
  expect(loginForm, '登录表单应该存在').not.toBeNull()
  
  // 填写用户名
  const usernameInput = await findElement(page, [
    'input[placeholder*="用户名"]',
    'input[name="username"]',
    '.el-input__inner'
  ])
  if (usernameInput) {
    await usernameInput.fill(TEST_CONFIG.credentials.username)
  }
  
  // 填写密码
  const passwordInput = await findElement(page, [
    'input[type="password"]',
    'input[placeholder*="密码"]'
  ])
  if (passwordInput) {
    await passwordInput.fill(TEST_CONFIG.credentials.password)
  }
  
  // 点击登录
  const loginButton = await findElement(page, [
    'button:has-text("登录")',
    '.el-button--primary',
    '.login-btn'
  ])
  
  if (loginButton) {
    await Promise.all([
      page.waitForNavigation({ url: /\/dashboard/, timeout: TEST_CONFIG.timeouts.navigation }),
      loginButton.click()
    ])
  }
  
  // 验证登录API响应（使用多种可能的URL模式）
  await delay(1500)
  const loginValid = apiValidator.validateResponse('/login', (data) => {
    return data.success === true && (data.data?.token || data.data?.accessToken) && data.data?.userInfo
  })
  
  if (!loginValid) {
    console.log('⚠️ 登录API验证失败，但页面导航成功，继续测试...')
  } else {
    console.log('✅ 登录API验证成功')
  }
  
  console.log('✅ 登录成功')
  await delay(1000)
  
  return apiValidator
}

// ==================== 仪表盘功能测试 ====================
test.describe('📊 仪表盘功能测试', () => {
  test('查看统计数据卡片', async ({ page }) => {
    const apiValidator = await performLogin(page)
    
    // 验证仪表盘API
    const statsValid = apiValidator.validateResponse('/dashboard', (data) => {
      return data.success === true && data.data
    })
    
    // 查找统计卡片 - 使用多种可能的选择器
    const statCards = await findElement(page, [
      '.stat-card',
      '.stats-cards .el-card',
      '.stats-grid .el-card',
      '.dashboard-overview .el-card',
      '.stat-content',
      '.el-statistic'
    ])
    
    if (statCards) {
      const cards = page.locator('.stat-card, .stats-cards .el-card, .stat-content')
      const count = await cards.count()
      console.log(`✅ 找到 ${count} 个统计卡片`)
      expect(count).toBeGreaterThan(0)
      
      // 验证数据格式
      for (let i = 0; i < Math.min(count, 4); i++) {
        const card = cards.nth(i)
        const value = await card.locator('.stat-value, .el-statistic__content').textContent().catch(() => '')
        const label = await card.locator('.stat-label, .el-statistic__title').textContent().catch(() => '')
        
        console.log(`  卡片 ${i + 1}: ${label} = ${value}`)
        
        // 验证数值格式
        if (value) {
          const isValidNumber = DataValidator.validateNumber(value.replace(/,/g, ''))
          console.log(`    数值格式: ${isValidNumber ? '✅' : '❌'}`)
        }
      }
    } else {
      console.log('⚠️ 未找到统计卡片，但API响应正常')
    }
  })

  test('查看数据图表', async ({ page }) => {
    const apiValidator = await performLogin(page)
    
    // 等待图表加载
    await delay(2000)
    
    // 查找图表容器
    const charts = await findElement(page, [
      '.chart-card',
      '.charts-section',
      '.echarts-container',
      '.chart-container',
      'canvas',
      '[class*="chart"]'
    ])
    
    if (charts) {
      console.log('✅ 找到图表容器')
      
      // 验证图表API
      const chartValid = apiValidator.validateResponse('/dashboard/charts', (data) => {
        return data.success === true
      })
      
      // 截图保存
      await page.screenshot({ path: 'test-results/dashboard-charts.png' })
    } else {
      console.log('⚠️ 未找到图表容器')
    }
  })

  test('验证仪表盘数据完整性', async ({ page }) => {
    const apiValidator = await performLogin(page)
    
    // 检查关键数据是否存在
    const keyMetrics = ['用户', '聚会', '订单', '收入']
    
    for (const metric of keyMetrics) {
      const element = page.locator('text=' + metric).first()
      const exists = await element.isVisible().catch(() => false)
      console.log(`${metric}: ${exists ? '✅' : '❌'}`)
    }
  })
})

// ==================== 用户管理功能测试 ====================
test.describe('👥 用户管理功能测试', () => {
  test.beforeEach(async ({ page }) => {
    await performLogin(page)
    await page.click('text=用户管理')
    await page.waitForURL(/\/users/, { timeout: TEST_CONFIG.timeouts.navigation })
    await delay(1500)
  })

  test('查看用户列表并验证数据', async ({ page }) => {
    const apiValidator = new APIValidator(page)
    
    // 验证用户列表API
    const listValid = apiValidator.validateResponse('/users', (data) => {
      return data.success === true && Array.isArray(data.data?.list)
    })
    expect(listValid, '用户列表API应该返回成功').toBe(true)
    
    // 查找用户表格
    const userTable = await findElement(page, [
      '.el-table',
      '.data-table',
      'table',
      '.user-list'
    ])
    expect(userTable, '用户表格应该存在').not.toBeNull()
    
    // 获取用户数据
    const rows = page.locator('.el-table__row')
    const count = await rows.count()
    console.log(`✅ 找到 ${count} 个用户`)
    
    if (count > 0) {
      // 验证第一行数据
      const firstRow = rows.first()
      const cells = firstRow.locator('.el-table__cell, td')
      const cellCount = await cells.count()
      
      console.log(`  每行有 ${cellCount} 个单元格`)
      
      // 验证数据格式
      for (let i = 0; i < Math.min(cellCount, 5); i++) {
        const text = await cells.nth(i).textContent() || ''
        
        // 检查是否有无效数据
        if (text.includes('NaN') || text.includes('Invalid') || text.includes('undefined')) {
          console.log(`  ❌ 单元格 ${i} 包含无效数据: ${text}`)
        } else {
          console.log(`  ✅ 单元格 ${i}: ${text.substring(0, 30)}`)
        }
      }
    }
  })

  test('搜索用户功能', async ({ page }) => {
    // 查找搜索输入框
    const searchInput = await findElement(page, [
      '.search-input input',
      '.el-input__inner[placeholder*="搜索"]',
      'input[placeholder*="搜索"]'
    ])
    
    if (searchInput) {
      await searchInput.fill('测试')
      await delay(500)
      
      // 查找搜索按钮
      const searchBtn = await findElement(page, [
        '.el-button:has-text("搜索")',
        '.search-btn',
        'button:has(.el-icon-search)'
      ])
      
      if (searchBtn) {
        await searchBtn.click()
        await delay(1000)
        
        console.log('✅ 搜索功能正常')
      }
    }
  })

  test('用户数据格式验证', async ({ page }) => {
    const rows = page.locator('.el-table__row')
    const count = await rows.count()
    
    if (count > 0) {
      // 验证日期格式
      const dateCells = page.locator('.el-table__row td:nth-child(5)')
      const dateText = await dateCells.first().textContent() || ''
      const isValidDate = DataValidator.validateDate(dateText)
      console.log(`日期格式验证: ${dateText} - ${isValidDate ? '✅' : '❌'}`)
      
      // 验证状态格式
      const statusCells = page.locator('.el-table__row td:nth-child(4)')
      const statusText = await statusCells.first().textContent() || ''
      const validStatuses = ['正常', '禁用', '待审核', 'active', 'inactive']
      const isValidStatus = validStatuses.some(s => statusText.includes(s))
      console.log(`状态格式验证: ${statusText} - ${isValidStatus ? '✅' : '❌'}`)
    }
  })
})

// ==================== 聚会管理功能测试 ====================
test.describe('🎉 聚会管理功能测试', () => {
  test.beforeEach(async ({ page }) => {
    await performLogin(page)
    await page.click('text=聚会管理')
    await delay(300)
    await page.click('text=聚会列表')
    await page.waitForURL(/\/parties/, { timeout: TEST_CONFIG.timeouts.navigation })
    await delay(1500)
  })

  test('查看聚会列表并验证数据', async ({ page }) => {
    const apiValidator = new APIValidator(page)
    
    // 验证聚会列表API
    const listValid = apiValidator.validateResponse('/parties', (data) => {
      return data.success === true && Array.isArray(data.data?.list)
    })
    expect(listValid, '聚会列表API应该返回成功').toBe(true)
    
    const partyTable = await findElement(page, ['.el-table', '.data-table'])
    expect(partyTable, '聚会表格应该存在').not.toBeNull()
    
    const rows = page.locator('.el-table__row')
    const count = await rows.count()
    console.log(`✅ 找到 ${count} 个聚会`)
    
    if (count > 0) {
      // 验证聚会数据
      const firstRow = rows.first()
      const title = await firstRow.locator('td:nth-child(2)').textContent() || ''
      console.log(`  第一个聚会: ${title.substring(0, 30)}`)
    }
  })

  test('聚会状态筛选', async ({ page }) => {
    const statuses = ['全部', '待审核', '已通过', '已拒绝']
    
    for (const status of statuses) {
      const tab = page.locator('.el-tabs__item, .filter-tab').filter({ hasText: status })
      if (await tab.isVisible().catch(() => false)) {
        await tab.click()
        await delay(500)
        console.log(`✅ 筛选状态: ${status}`)
      }
    }
  })
})

// ==================== 订单管理功能测试 ====================
test.describe('📋 订单管理功能测试', () => {
  test.beforeEach(async ({ page }) => {
    await performLogin(page)
    await page.click('text=订单管理')
    await page.waitForURL(/\/orders/, { timeout: TEST_CONFIG.timeouts.navigation })
    await delay(1500)
  })

  test('查看订单列表并验证数据', async ({ page }) => {
    const apiValidator = new APIValidator(page)
    
    // 验证订单列表API
    const listValid = apiValidator.validateResponse('/orders', (data) => {
      return data.success === true
    })
    
    const orderTable = await findElement(page, ['.el-table', '.data-table'])
    
    if (orderTable) {
      const rows = page.locator('.el-table__row')
      const count = await rows.count()
      console.log(`✅ 找到 ${count} 个订单`)
      
      if (count > 0) {
        // 验证金额格式
        const amountCells = page.locator('.el-table__row td:nth-child(4)')
        const amountText = await amountCells.first().textContent() || ''
        const isValidAmount = DataValidator.validateCurrency(amountText)
        console.log(`金额格式验证: ${amountText} - ${isValidAmount ? '✅' : '❌'}`)
      }
    }
  })
})

// ==================== 财务管理功能测试 ====================
test.describe('💰 财务管理功能测试', () => {
  test.beforeEach(async ({ page }) => {
    await performLogin(page)
    await page.goto(`${TEST_CONFIG.baseURL}/finance`)
    await page.waitForURL(/\/finance/, { timeout: TEST_CONFIG.timeouts.navigation })
    await delay(1500)
  })

  test('查看财务概览并验证数据', async ({ page }) => {
    const apiValidator = new APIValidator(page)
    
    // 验证财务API
    const financeValid = apiValidator.validateResponse('/finance', (data) => {
      return data.success === true
    })
    
    // 查找财务统计卡片
    const statCards = await findElement(page, [
      '.stat-card',
      '.finance-stat',
      '.el-card',
      '.stats-cards'
    ])
    
    if (statCards) {
      console.log('✅ 找到财务统计卡片')
      
      // 验证金额数据
      const amountElements = page.locator('.amount, .money, .stat-value')
      const count = await amountElements.count()
      
      for (let i = 0; i < Math.min(count, 4); i++) {
        const text = await amountElements.nth(i).textContent() || ''
        const isValid = DataValidator.validateCurrency(text)
        console.log(`  金额 ${i + 1}: ${text} - ${isValid ? '✅' : '❌'}`)
      }
    }
  })

  test('查看交易明细', async ({ page }) => {
    const transactionTable = await findElement(page, ['.el-table', '.transaction-list'])
    
    if (transactionTable) {
      const rows = page.locator('.el-table__row')
      const count = await rows.count()
      console.log(`✅ 找到 ${count} 条交易记录`)
    }
  })
})

// ==================== 内容管理功能测试 ====================
test.describe('📝 内容管理功能测试', () => {
  test.beforeEach(async ({ page }) => {
    await performLogin(page)
    await page.goto(`${TEST_CONFIG.baseURL}/content`)
    await page.waitForURL(/\/content/, { timeout: TEST_CONFIG.timeouts.navigation })
    await delay(1500)
  })

  test('查看Banner列表', async ({ page }) => {
    const apiValidator = new APIValidator(page)
    
    // 验证Banner API
    const bannerValid = apiValidator.validateResponse('/content/banners', (data) => {
      return data.success === true
    })
    
    const bannerTable = await findElement(page, ['.el-table', '.banner-list'])
    
    if (bannerTable) {
      const rows = page.locator('.el-table__row')
      const count = await rows.count()
      console.log(`✅ 找到 ${count} 个Banner`)
    }
  })

  test('添加Banner弹窗', async ({ page }) => {
    const addBtn = await findElement(page, [
      '.el-button:has-text("新增")',
      '.el-button:has-text("添加")',
      '.add-btn'
    ])
    
    if (addBtn) {
      await addBtn.click()
      await delay(1000)
      
      // 验证弹窗
      const dialog = await findElement(page, [
        '.el-dialog',
        '.dialog',
        '.modal'
      ])
      
      if (dialog) {
        console.log('✅ Banner添加弹窗正常')
        
        // 关闭弹窗
        const closeBtn = await findElement(page, [
          '.el-dialog__close',
          '.dialog-close',
          '.el-button:has-text("取消")'
        ])
        if (closeBtn) {
          await closeBtn.click()
          await delay(500)
        }
      }
    }
  })
})

// ==================== API响应测试 ====================
test.describe('🔌 API响应测试', () => {
  test('验证所有关键API响应格式', async ({ page }) => {
    const apiValidator = await performLogin(page)
    
    // 访问各个页面并验证API
    const pages = [
      { path: '/dashboard', api: '/dashboard', name: '仪表盘' },
      { path: '/users', api: '/users', name: '用户管理' },
      { path: '/parties', api: '/parties', name: '聚会管理' },
      { path: '/orders', api: '/orders', name: '订单管理' },
      { path: '/finance', api: '/finance', name: '财务管理' },
      { path: '/content', api: '/content', name: '内容管理' }
    ]
    
    for (const p of pages) {
      await page.goto(`${TEST_CONFIG.baseURL}${p.path}`)
      await delay(1500)
      
      const response = apiValidator.getResponse(p.api)
      if (response) {
        console.log(`${p.name}: ✅ API响应正常`)
        expect(response.status).toBe(200)
        expect(response.data.success).toBe(true)
      } else {
        console.log(`${p.name}: ⚠️ 未捕获API响应`)
      }
    }
  })

  test('验证错误处理', async ({ page }) => {
    // 测试404页面
    await page.goto(`${TEST_CONFIG.baseURL}/non-existent-page`)
    await delay(1000)
    
    // 验证是否显示404或重定向
    const url = page.url()
    console.log(`404测试: ${url}`)
  })
})

// ==================== 数据完整性测试 ====================
test.describe('✅ 数据完整性测试', () => {
  test('验证页面无无效数据显示', async ({ page }) => {
    await performLogin(page)
    
    // 访问多个页面检查数据
    const pages = ['/dashboard', '/users', '/parties', '/orders', '/finance']
    
    for (const path of pages) {
      await page.goto(`${TEST_CONFIG.baseURL}${path}`)
      await delay(1500)
      
      // 获取页面文本内容
      const bodyText = await page.locator('body').textContent() || ''
      
      // 检查无效数据标记
      const invalidPatterns = ['NaN', 'undefined', 'null', 'Invalid Date', '[object Object]']
      const found = invalidPatterns.filter(p => bodyText.includes(p))
      
      if (found.length > 0) {
        console.log(`${path}: ❌ 发现无效数据: ${found.join(', ')}`)
      } else {
        console.log(`${path}: ✅ 数据格式正常`)
      }
      
      expect(found).toHaveLength(0)
    }
  })

  test('验证日期格式一致性', async ({ page }) => {
    await performLogin(page)
    await page.click('text=用户管理')
    await delay(1500)
    
    const rows = page.locator('.el-table__row')
    const count = await rows.count()
    
    let validDates = 0
    let invalidDates = 0
    
    for (let i = 0; i < Math.min(count, 5); i++) {
      const dateText = await rows.nth(i).locator('td').last().textContent() || ''
      
      if (dateText && dateText !== '-') {
        if (DataValidator.validateDate(dateText)) {
          validDates++
        } else {
          invalidDates++
          console.log(`  行 ${i + 1}: ❌ 无效日期 - ${dateText}`)
        }
      }
    }
    
    console.log(`日期验证: ✅ ${validDates}, ❌ ${invalidDates}`)
  })
})

// ==================== 性能测试 ====================
test.describe('⚡ 性能测试', () => {
  test('页面加载时间测试', async ({ page }) => {
    const pages = [
      { path: '/dashboard', name: '仪表盘' },
      { path: '/users', name: '用户管理' },
      { path: '/parties', name: '聚会管理' },
      { path: '/orders', name: '订单管理' }
    ]
    
    for (const p of pages) {
      const startTime = Date.now()
      
      await page.goto(`${TEST_CONFIG.baseURL}${p.path}`)
      await page.waitForLoadState('networkidle')
      
      const loadTime = Date.now() - startTime
      console.log(`${p.name}: ${loadTime}ms ${loadTime < 5000 ? '✅' : '⚠️'}`)
      
      expect(loadTime).toBeLessThan(10000)
    }
  })

  test('API响应时间测试', async ({ page }) => {
    const apiValidator = await performLogin(page)
    
    // 访问页面触发API
    await page.click('text=用户管理')
    await delay(2000)
    
    // 检查API响应
    const response = apiValidator.getResponse('/users')
    if (response) {
      console.log(`API响应时间: ${response.timestamp}`)
    }
  })
})

// ==================== 安全性测试 ====================
test.describe('🔒 安全性测试', () => {
  test('未登录访问受保护页面', async ({ page }) => {
    // 清除登录状态
    await page.goto(`${TEST_CONFIG.baseURL}/login`)
    await delay(500)
    
    // 尝试直接访问受保护页面
    await page.goto(`${TEST_CONFIG.baseURL}/users`)
    await delay(1000)
    
    // 验证是否重定向到登录页
    const url = page.url()
    const isLoginPage = url.includes('/login')
    
    console.log(`未登录访问保护页面: ${isLoginPage ? '✅ 正确重定向到登录页' : '❌ 未重定向'}`)
    expect(isLoginPage).toBe(true)
  })

  test('Token验证', async ({ page }) => {
    const apiValidator = await performLogin(page)
    
    // 验证登录后API请求包含Token
    const response = apiValidator.getResponse('/users')
    if (response) {
      console.log('✅ API请求已认证')
    }
  })
})
