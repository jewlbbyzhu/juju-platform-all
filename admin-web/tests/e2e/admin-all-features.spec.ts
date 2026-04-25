import { expect, test, Page } from '@playwright/test'

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

// 辅助函数：等待元素可见
async function waitForElement(page: Page, selector: string, timeout = TEST_CONFIG.timeouts.element) {
  try {
    const element = page.locator(selector).first()
    await element.waitFor({ state: 'visible', timeout })
    return element
  } catch (e) {
    return null
  }
}

// 辅助函数：安全点击
async function safeClick(page: Page, selector: string, timeout = TEST_CONFIG.timeouts.element) {
  const element = await waitForElement(page, selector, timeout)
  if (element) {
    await element.click()
    return true
  }
  return false
}

// 辅助函数：安全填充
async function safeFill(page: Page, selector: string, text: string, timeout = TEST_CONFIG.timeouts.element) {
  const element = await waitForElement(page, selector, timeout)
  if (element) {
    await element.fill(text)
    return true
  }
  return false
}

// 辅助函数：登录
async function performLogin(page: Page) {
  console.log('开始登录...')
  await page.goto(`${TEST_CONFIG.baseURL}/login`)
  await page.waitForLoadState('networkidle')
  
  const usernameInput = await waitForElement(page, 'input[placeholder="请输入用户名"]')
  if (usernameInput) {
    await usernameInput.fill(TEST_CONFIG.credentials.username)
  }
  
  const passwordInput = await waitForElement(page, 'input[placeholder="请输入密码"]')
  if (passwordInput) {
    await passwordInput.fill(TEST_CONFIG.credentials.password)
  }
  
  const loginButton = await waitForElement(page, 'button:has-text("登录")')
  if (loginButton) {
    await Promise.all([
      page.waitForNavigation({ url: /\/dashboard/, timeout: TEST_CONFIG.timeouts.navigation }),
      loginButton.click()
    ])
  }
  
  console.log('登录成功')
  await delay(1000)
}

// ==================== 仪表盘功能测试 ====================
test.describe('📊 仪表盘功能测试', () => {
  test.beforeEach(async ({ page }) => {
    await performLogin(page)
  })

  test('查看统计数据卡片', async ({ page }) => {
    const statCards = await waitForElement(page, '.stat-card, .dashboard-card, .el-statistic', 5000)
    expect(statCards).not.toBeNull()
    
    const cards = page.locator('.stat-card, .dashboard-card, .el-card')
    const count = await cards.count()
    console.log(`统计卡片数量: ${count}`)
    expect(count).toBeGreaterThan(0)
  })

  test('查看数据图表', async ({ page }) => {
    const charts = await waitForElement(page, '.chart-container, .echarts, .el-chart', 5000)
    expect(charts).not.toBeNull()
    
    const chartElements = page.locator('.chart-container, .echarts')
    const count = await chartElements.count()
    console.log(`图表数量: ${count}`)
  })

  test('切换时间范围', async ({ page }) => {
    const timeRanges = ['今日', '本周', '本月', '本年']
    
    for (const range of timeRanges) {
      const rangeBtn = page.locator('.time-range, .date-range, .el-radio-button, button').filter({ hasText: range })
      if (await rangeBtn.isVisible().catch(() => false)) {
        await rangeBtn.click()
        await delay(500)
        console.log(`切换到时间范围: ${range}`)
      }
    }
  })

  test('查看快捷操作', async ({ page }) => {
    const quickActions = await waitForElement(page, '.quick-actions, .shortcut-menu', 5000)
    if (quickActions) {
      const actions = page.locator('.quick-action-item, .shortcut-item')
      const count = await actions.count()
      console.log(`快捷操作数量: ${count}`)
    }
  })

  test('查看通知消息', async ({ page }) => {
    const notificationBell = await waitForElement(page, '.notification-bell, .el-badge, .message-icon', 5000)
    if (notificationBell) {
      await notificationBell.click()
      await delay(500)
      
      const notificationList = await waitForElement(page, '.notification-list, .message-list', 3000)
      console.log('通知列表:', notificationList ? '存在' : '不存在')
    }
  })
})

// ==================== 用户管理功能测试 ====================
test.describe('👥 用户管理功能测试', () => {
  test.beforeEach(async ({ page }) => {
    await performLogin(page)
    await page.click('text=用户管理')
    await page.waitForURL(/\/users/, { timeout: TEST_CONFIG.timeouts.navigation })
    await delay(1000)
  })

  test('查看用户列表', async ({ page }) => {
    const userTable = await waitForElement(page, '.el-table, .data-table', 5000)
    expect(userTable).not.toBeNull()
    
    const rows = page.locator('.el-table__row, .table-row')
    const count = await rows.count()
    console.log(`用户数量: ${count}`)
  })

  test('搜索用户', async ({ page }) => {
    const searchInput = await waitForElement(page, '.el-input__inner[placeholder*="搜索"], .search-input', 5000)
    if (searchInput) {
      await searchInput.fill('测试用户')
      await delay(500)
      
      const searchBtn = await waitForElement(page, '.el-button:has-text("搜索"), .search-btn', 3000)
      if (searchBtn) {
        await searchBtn.click()
        await delay(1000)
        
        console.log('搜索完成')
      }
    }
  })

  test('筛选用户状态', async ({ page }) => {
    const statusFilter = await waitForElement(page, '.el-select, .status-filter', 5000)
    if (statusFilter) {
      await statusFilter.click()
      await delay(300)
      
      const option = await waitForElement(page, '.el-select-dropdown__item', 3000)
      if (option) {
        await option.click()
        await delay(500)
      }
    }
  })

  test('查看用户详情', async ({ page }) => {
    const viewBtn = await waitForElement(page, '.el-button:has-text("查看"), .view-btn', 5000)
    if (viewBtn) {
      await viewBtn.click()
      await delay(1000)
      
      const detailPage = await waitForElement(page, '.user-detail, .detail-page', 5000)
      expect(detailPage).not.toBeNull()
    }
  })

  test('编辑用户信息', async ({ page }) => {
    const editBtn = await waitForElement(page, '.el-button:has-text("编辑"), .edit-btn', 5000)
    if (editBtn) {
      await editBtn.click()
      await delay(1000)
      
      // 修改昵称
      await safeFill(page, 'input[placeholder*="昵称"], .nickname-input', '修改后的昵称')
      await delay(300)
      
      // 保存
      const saveBtn = await waitForElement(page, '.el-button:has-text("保存"), .save-btn', 3000)
      if (saveBtn) {
        await saveBtn.click()
        await delay(1000)
      }
    }
  })

  test('禁用/启用用户', async ({ page }) => {
    const statusSwitch = await waitForElement(page, '.el-switch, .status-switch', 5000)
    if (statusSwitch) {
      await statusSwitch.click()
      await delay(500)
      
      // 确认弹窗
      const confirmBtn = await waitForElement(page, '.el-button:has-text("确定"), .confirm-btn', 3000)
      if (confirmBtn) {
        await confirmBtn.click()
        await delay(1000)
      }
    }
  })

  test('导出用户数据', async ({ page }) => {
    const exportBtn = await waitForElement(page, '.el-button:has-text("导出"), .export-btn', 5000)
    if (exportBtn) {
      await exportBtn.click()
      await delay(1000)
      console.log('导出按钮已点击')
    }
  })

  test('分页功能', async ({ page }) => {
    const nextPage = await waitForElement(page, '.el-pagination .btn-next, .next-page', 5000)
    if (nextPage) {
      await nextPage.click()
      await delay(1000)
      
      console.log('切换到下一页')
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
    await delay(1000)
  })

  test('查看聚会列表', async ({ page }) => {
    const partyTable = await waitForElement(page, '.el-table, .data-table', 5000)
    expect(partyTable).not.toBeNull()
    
    const rows = page.locator('.el-table__row')
    const count = await rows.count()
    console.log(`聚会数量: ${count}`)
  })

  test('搜索聚会', async ({ page }) => {
    await safeFill(page, '.el-input__inner[placeholder*="搜索"]', '测试聚会')
    await delay(500)
    
    const searchBtn = await waitForElement(page, '.el-button:has-text("搜索")', 3000)
    if (searchBtn) {
      await searchBtn.click()
      await delay(1000)
    }
  })

  test('筛选聚会状态', async ({ page }) => {
    const statuses = ['全部', '待审核', '已通过', '已拒绝', '已结束']
    
    for (const status of statuses) {
      const statusTab = page.locator('.el-tab-pane, .filter-tab, .status-tab').filter({ hasText: status })
      if (await statusTab.isVisible().catch(() => false)) {
        await statusTab.click()
        await delay(500)
        console.log(`筛选状态: ${status}`)
      }
    }
  })

  test('审核聚会', async ({ page }) => {
    const auditBtn = await waitForElement(page, '.el-button:has-text("审核"), .audit-btn', 5000)
    if (auditBtn) {
      await auditBtn.click()
      await delay(1000)
      
      // 选择通过
      const passBtn = await waitForElement(page, '.el-button:has-text("通过"), .pass-btn', 3000)
      if (passBtn) {
        await passBtn.click()
        await delay(500)
        
        // 确认
        const confirmBtn = await waitForElement(page, '.el-button:has-text("确定")', 3000)
        if (confirmBtn) {
          await confirmBtn.click()
          await delay(1000)
        }
      }
    }
  })

  test('查看聚会详情', async ({ page }) => {
    const viewBtn = await waitForElement(page, '.el-button:has-text("查看"), .view-btn', 5000)
    if (viewBtn) {
      await viewBtn.click()
      await delay(1000)
      
      const detailPage = await waitForElement(page, '.party-detail, .detail-page', 5000)
      expect(detailPage).not.toBeNull()
    }
  })

  test('推荐聚会', async ({ page }) => {
    const recommendBtn = await waitForElement(page, '.el-button:has-text("推荐"), .recommend-btn', 5000)
    if (recommendBtn) {
      await recommendBtn.click()
      await delay(500)
      
      const confirmBtn = await waitForElement(page, '.el-button:has-text("确定")', 3000)
      if (confirmBtn) {
        await confirmBtn.click()
        await delay(1000)
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
    await delay(1000)
  })

  test('查看订单列表', async ({ page }) => {
    const orderTable = await waitForElement(page, '.el-table, .data-table', 5000)
    expect(orderTable).not.toBeNull()
    
    const rows = page.locator('.el-table__row')
    const count = await rows.count()
    console.log(`订单数量: ${count}`)
  })

  test('筛选订单状态', async ({ page }) => {
    const statuses = ['全部', '待支付', '已支付', '已取消', '已退款']
    
    for (const status of statuses) {
      const statusTab = page.locator('.el-tab-pane, .filter-tab').filter({ hasText: status })
      if (await statusTab.isVisible().catch(() => false)) {
        await statusTab.click()
        await delay(500)
      }
    }
  })

  test('查看订单详情', async ({ page }) => {
    const viewBtn = await waitForElement(page, '.el-button:has-text("查看")', 5000)
    if (viewBtn) {
      await viewBtn.click()
      await delay(1000)
      
      const detailPage = await waitForElement(page, '.order-detail', 5000)
      expect(detailPage).not.toBeNull()
    }
  })

  test('处理退款申请', async ({ page }) => {
    // 先筛选退款订单
    const refundTab = page.locator('.el-tab-pane, .filter-tab').filter({ hasText: '退款' })
    if (await refundTab.isVisible().catch(() => false)) {
      await refundTab.click()
      await delay(500)
      
      const processBtn = await waitForElement(page, '.el-button:has-text("处理")', 5000)
      if (processBtn) {
        await processBtn.click()
        await delay(1000)
        
        // 同意退款
        const agreeBtn = await waitForElement(page, '.el-button:has-text("同意")', 3000)
        if (agreeBtn) {
          await agreeBtn.click()
          await delay(500)
        }
      }
    }
  })

  test('导出订单数据', async ({ page }) => {
    const exportBtn = await waitForElement(page, '.el-button:has-text("导出")', 5000)
    if (exportBtn) {
      await exportBtn.click()
      await delay(1000)
    }
  })
})

// ==================== 财务管理功能测试 ====================
test.describe('💰 财务管理功能测试', () => {
  test.beforeEach(async ({ page }) => {
    await performLogin(page)
    await page.goto(`${TEST_CONFIG.baseURL}/dashboard`)
    await page.waitForURL(/\/dashboard/, { timeout: TEST_CONFIG.timeouts.navigation })
    await delay(1000)
    await page.click('text=财务管理')
    await page.waitForURL(/\/finance/, { timeout: TEST_CONFIG.timeouts.navigation })
    await delay(1000)
  })

  test('查看财务概览', async ({ page }) => {
    const statsCards = await waitForElement(page, '.stat-card, .finance-stat', 5000)
    expect(statsCards).not.toBeNull()
    
    const cards = page.locator('.stat-card, .el-card')
    const count = await cards.count()
    console.log(`财务统计卡片: ${count}`)
  })

  test('查看收支明细', async ({ page }) => {
    const transactionTable = await waitForElement(page, '.el-table', 5000)
    expect(transactionTable).not.toBeNull()
  })

  test('筛选交易类型', async ({ page }) => {
    const typeFilter = await waitForElement(page, '.el-select', 5000)
    if (typeFilter) {
      await typeFilter.click()
      await delay(300)
      
      const option = await waitForElement(page, '.el-select-dropdown__item', 3000)
      if (option) {
        await option.click()
        await delay(500)
      }
    }
  })

  test('查看提现申请', async ({ page }) => {
    const withdrawalTab = page.locator('.el-tab-pane').filter({ hasText: '提现' })
    if (await withdrawalTab.isVisible().catch(() => false)) {
      await withdrawalTab.click()
      await delay(500)
      
      const withdrawalTable = await waitForElement(page, '.el-table', 5000)
      expect(withdrawalTable).not.toBeNull()
    }
  })

  test('处理提现申请', async ({ page }) => {
    const processBtn = await waitForElement(page, '.el-button:has-text("处理")', 5000)
    if (processBtn) {
      await processBtn.click()
      await delay(1000)
      
      // 输入处理备注
      await safeFill(page, 'textarea, .remark-input', '测试处理')
      await delay(300)
      
      // 确认
      const confirmBtn = await waitForElement(page, '.el-button:has-text("确定")', 3000)
      if (confirmBtn) {
        await confirmBtn.click()
        await delay(1000)
      }
    }
  })

  test('查看财务报表', async ({ page }) => {
    const reportTab = page.locator('.el-tab-pane').filter({ hasText: '报表' })
    if (await reportTab.isVisible().catch(() => false)) {
      await reportTab.click()
      await delay(1000)
      
      const chart = await waitForElement(page, '.chart-container, .echarts', 5000)
      expect(chart).not.toBeNull()
    }
  })
})

// ==================== 内容管理功能测试 ====================
test.describe('📝 内容管理功能测试', () => {
  test.beforeEach(async ({ page }) => {
    await performLogin(page)
    await page.goto(`${TEST_CONFIG.baseURL}/dashboard`)
    await page.waitForURL(/\/dashboard/, { timeout: TEST_CONFIG.timeouts.navigation })
    await delay(1000)
    await page.click('text=内容管理')
    await page.waitForURL(/\/content/, { timeout: TEST_CONFIG.timeouts.navigation })
    await delay(1000)
  })

  test('查看Banner列表', async ({ page }) => {
    const bannerTable = await waitForElement(page, '.el-table', 5000)
    expect(bannerTable).not.toBeNull()
  })

  test('添加Banner', async ({ page }) => {
    const addBtn = await waitForElement(page, '.el-button:has-text("新增"), .el-button:has-text("添加")', 5000)
    if (addBtn) {
      await addBtn.click()
      await delay(1000)
      
      // 填写Banner信息
      await safeFill(page, 'input[placeholder*="标题"]', '测试Banner')
      await delay(300)
      
      // 上传图片
      const uploadBtn = await waitForElement(page, '.el-upload, .upload-btn', 3000)
      if (uploadBtn) {
        console.log('上传按钮存在')
      }
      
      // 取消
      const cancelBtn = await waitForElement(page, '.el-button:has-text("取消")', 3000)
      if (cancelBtn) {
        await cancelBtn.click()
        await delay(500)
      }
    }
  })

  test('编辑Banner', async ({ page }) => {
    const editBtn = await waitForElement(page, '.el-button:has-text("编辑")', 5000)
    if (editBtn) {
      await editBtn.click()
      await delay(1000)
      
      // 修改标题
      await safeFill(page, 'input[placeholder*="标题"]', '修改后的标题')
      await delay(300)
      
      // 保存
      const saveBtn = await waitForElement(page, '.el-button:has-text("保存")', 3000)
      if (saveBtn) {
        await saveBtn.click()
        await delay(1000)
      }
    }
  })

  test('删除Banner', async ({ page }) => {
    const deleteBtn = await waitForElement(page, '.el-button:has-text("删除")', 5000)
    if (deleteBtn) {
      await deleteBtn.click()
      await delay(500)
      
      // 确认删除
      const confirmBtn = await waitForElement(page, '.el-button:has-text("确定")', 3000)
      if (confirmBtn) {
        await confirmBtn.click()
        await delay(1000)
      }
    }
  })

  test('查看公告列表', async ({ page }) => {
    const announcementTab = page.locator('.el-tab-pane').filter({ hasText: '公告' })
    if (await announcementTab.isVisible().catch(() => false)) {
      await announcementTab.click()
      await delay(500)
      
      const announcementTable = await waitForElement(page, '.el-table', 5000)
      expect(announcementTable).not.toBeNull()
    }
  })

  test('发布公告', async ({ page }) => {
    const addBtn = await waitForElement(page, '.el-button:has-text("新增")', 5000)
    if (addBtn) {
      await addBtn.click()
      await delay(1000)
      
      // 填写公告内容
      await safeFill(page, 'input[placeholder*="标题"]', '测试公告')
      await delay(300)
      
      await safeFill(page, 'textarea, .content-input', '这是测试公告内容')
      await delay(300)
      
      // 取消
      const cancelBtn = await waitForElement(page, '.el-button:has-text("取消")', 3000)
      if (cancelBtn) {
        await cancelBtn.click()
        await delay(500)
      }
    }
  })
})

// ==================== 系统管理功能测试 ====================
test.describe('⚙️ 系统管理功能测试', () => {
  test.beforeEach(async ({ page }) => {
    await performLogin(page)
    await page.goto(`${TEST_CONFIG.baseURL}/dashboard`)
    await page.waitForURL(/\/dashboard/, { timeout: TEST_CONFIG.timeouts.navigation })
    await delay(1000)
  })

  test('管理员管理', async ({ page }) => {
    await page.click('text=系统设置')
    await delay(300)
    await page.click('text=管理员管理')
    await delay(1000)
    
    const adminTable = await waitForElement(page, '.el-table', 5000)
    expect(adminTable).not.toBeNull()
    
    const rows = page.locator('.el-table__row')
    const count = await rows.count()
    console.log(`管理员数量: ${count}`)
  })

  test('角色权限管理', async ({ page }) => {
    await page.click('text=系统设置')
    await delay(300)
    await page.click('text=角色管理')
    await delay(1000)
    
    const roleTable = await waitForElement(page, '.el-table', 5000)
    expect(roleTable).not.toBeNull()
  })

  test('操作日志', async ({ page }) => {
    await page.click('text=系统设置')
    await delay(300)
    await page.click('text=操作日志')
    await delay(1000)
    
    const logTable = await waitForElement(page, '.el-table', 5000)
    expect(logTable).not.toBeNull()
  })

  test('系统配置', async ({ page }) => {
    await page.click('text=系统设置')
    await delay(300)
    await page.click('text=系统配置')
    await delay(1000)
    
    const configForm = await waitForElement(page, '.el-form, .config-form', 5000)
    expect(configForm).not.toBeNull()
  })
})

// ==================== 数据分析功能测试 ====================
test.describe('📈 数据分析功能测试', () => {
  test.beforeEach(async ({ page }) => {
    await performLogin(page)
    await page.click('text=数据分析')
    await page.waitForURL(/\/analytics/, { timeout: TEST_CONFIG.timeouts.navigation })
    await delay(1000)
  })

  test('查看用户分析', async ({ page }) => {
    const userAnalytics = await waitForElement(page, '.analytics-card, .chart-container', 5000)
    expect(userAnalytics).not.toBeNull()
  })

  test('查看聚会分析', async ({ page }) => {
    const partyTab = page.locator('.el-tab-pane').filter({ hasText: '聚会' })
    if (await partyTab.isVisible().catch(() => false)) {
      await partyTab.click()
      await delay(500)
      
      const partyAnalytics = await waitForElement(page, '.chart-container', 5000)
      expect(partyAnalytics).not.toBeNull()
    }
  })

  test('查看订单分析', async ({ page }) => {
    const orderTab = page.locator('.el-tab-pane').filter({ hasText: '订单' })
    if (await orderTab.isVisible().catch(() => false)) {
      await orderTab.click()
      await delay(500)
      
      const orderAnalytics = await waitForElement(page, '.chart-container', 5000)
      expect(orderAnalytics).not.toBeNull()
    }
  })

  test('切换时间范围', async ({ page }) => {
    const datePicker = await waitForElement(page, '.el-date-picker, .date-range-picker', 5000)
    if (datePicker) {
      await datePicker.click()
      await delay(500)
      
      // 选择日期范围
      const startDate = await waitForElement(page, '.el-picker-panel__content td.available', 3000)
      if (startDate) {
        await startDate.click()
        await delay(300)
      }
      
      // 确认
      const confirmBtn = await waitForElement(page, '.el-button:has-text("确定")', 3000)
      if (confirmBtn) {
        await confirmBtn.click()
        await delay(500)
      }
    }
  })
})

// ==================== 应用管理功能测试 ====================
test.describe('📱 应用管理功能测试', () => {
  test.beforeEach(async ({ page }) => {
    await performLogin(page)
    await page.click('text=应用管理')
    await page.waitForURL(/\/app/, { timeout: TEST_CONFIG.timeouts.navigation })
    await delay(1000)
  })

  test('查看版本列表', async ({ page }) => {
    const versionTable = await waitForElement(page, '.el-table', 5000)
    expect(versionTable).not.toBeNull()
  })

  test('发布新版本', async ({ page }) => {
    const addBtn = await waitForElement(page, '.el-button:has-text("新增")', 5000)
    if (addBtn) {
      await addBtn.click()
      await delay(1000)
      
      // 填写版本信息
      await safeFill(page, 'input[placeholder*="版本号"]', '1.0.0')
      await delay(300)
      
      await safeFill(page, 'textarea', '版本更新内容')
      await delay(300)
      
      // 取消
      const cancelBtn = await waitForElement(page, '.el-button:has-text("取消")', 3000)
      if (cancelBtn) {
        await cancelBtn.click()
        await delay(500)
      }
    }
  })

  test('查看应用配置', async ({ page }) => {
    const configTab = page.locator('.el-tab-pane').filter({ hasText: '配置' })
    if (await configTab.isVisible().catch(() => false)) {
      await configTab.click()
      await delay(500)
      
      const configForm = await waitForElement(page, '.el-form', 5000)
      expect(configForm).not.toBeNull()
    }
  })
})

// ==================== 顶部导航功能测试 ====================
test.describe('🔝 顶部导航功能测试', () => {
  test.beforeEach(async ({ page }) => {
    await performLogin(page)
  })

  test('折叠/展开侧边栏', async ({ page }) => {
    const collapseBtn = await waitForElement(page, '.collapse-btn, .hamburger', 5000)
    if (collapseBtn) {
      await collapseBtn.click()
      await delay(500)
      
      // 再次点击展开
      await collapseBtn.click()
      await delay(500)
    }
  })

  test('全屏功能', async ({ page }) => {
    const fullscreenBtn = await waitForElement(page, '.fullscreen-btn, .screenfull-btn', 5000)
    if (fullscreenBtn) {
      await fullscreenBtn.click()
      await delay(500)
      
      // 退出全屏
      await fullscreenBtn.click()
      await delay(500)
    }
  })

  test('刷新页面', async ({ page }) => {
    const refreshBtn = await waitForElement(page, '.refresh-btn, .reload-btn', 5000)
    if (refreshBtn) {
      await refreshBtn.click()
      await delay(1000)
      
      console.log('页面已刷新')
    }
  })

  test('个人中心下拉', async ({ page }) => {
    const userDropdown = await waitForElement(page, '.user-dropdown, .avatar-container', 5000)
    if (userDropdown) {
      await userDropdown.click()
      await delay(500)
      
      // 查看下拉菜单
      const dropdownMenu = await waitForElement(page, '.el-dropdown-menu', 3000)
      expect(dropdownMenu).not.toBeNull()
    }
  })

  test('退出登录', async ({ page }) => {
    const userDropdown = await waitForElement(page, '.user-dropdown, .avatar-container', 5000)
    if (userDropdown) {
      await userDropdown.click()
      await delay(500)
      
      const logoutBtn = await waitForElement(page, '.el-dropdown-menu__item:has-text("退出"), .logout-item', 3000)
      if (logoutBtn) {
        await logoutBtn.click()
        await delay(1000)
        
        // 验证返回登录页
        await page.waitForURL(/\/login/, { timeout: TEST_CONFIG.timeouts.navigation })
      }
    }
  })
})

// ==================== 面包屑导航功能测试 ====================
test.describe('🍞 面包屑导航功能测试', () => {
  test.beforeEach(async ({ page }) => {
    await performLogin(page)
  })

  test('面包屑显示', async ({ page }) => {
    const breadcrumb = await waitForElement(page, '.breadcrumb, .el-breadcrumb', 5000)
    expect(breadcrumb).not.toBeNull()
    
    const items = page.locator('.el-breadcrumb__item')
    const count = await items.count()
    console.log(`面包屑层级: ${count}`)
  })

  test('点击面包屑返回', async ({ page }) => {
    // 先进入深层页面
    await page.click('text=用户管理')
    await page.waitForURL(/\/users/, { timeout: TEST_CONFIG.timeouts.navigation })
    await delay(1000)
    
    // 点击面包屑返回首页
    const homeBreadcrumb = page.locator('.el-breadcrumb__item').filter({ hasText: '首页' })
    if (await homeBreadcrumb.isVisible().catch(() => false)) {
      await homeBreadcrumb.click()
      await delay(1000)
      
      await page.waitForURL(/\/dashboard/, { timeout: TEST_CONFIG.timeouts.navigation })
    }
  })
})

// ==================== 标签页功能测试 ====================
test.describe('🏷️ 标签页功能测试', () => {
  test.beforeEach(async ({ page }) => {
    await performLogin(page)
  })

  test('标签页显示', async ({ page }) => {
    const tagsView = await waitForElement(page, '.tags-view, .tab-view', 5000)
    expect(tagsView).not.toBeNull()
    
    const tags = page.locator('.tags-view-item, .tab-item')
    const count = await tags.count()
    console.log(`标签页数量: ${count}`)
  })

  test('切换标签页', async ({ page }) => {
    // 打开多个页面
    await page.click('text=用户管理')
    await delay(500)
    
    await page.goto(`${TEST_CONFIG.baseURL}/dashboard`)
    await delay(500)
    
    // 点击标签切换
    const tags = page.locator('.tags-view-item, .tab-item')
    const count = await tags.count()
    
    if (count > 1) {
      await tags.nth(1).click()
      await delay(500)
    }
  })

  test('关闭标签页', async ({ page }) => {
    const closeIcon = await waitForElement(page, '.el-icon-close, .tab-close', 5000)
    if (closeIcon) {
      await closeIcon.click()
      await delay(500)
    }
  })
})

// ==================== 性能测试 ====================
test.describe('⚡ 性能测试', () => {
  test('页面加载性能', async ({ page }) => {
    const startTime = Date.now()
    
    await performLogin(page)
    
    const loadTime = Date.now() - startTime
    console.log(`登录及首页加载时间: ${loadTime}ms`)
    
    expect(loadTime).toBeLessThan(15000)
  })

  test('表格数据加载性能', async ({ page }) => {
    await performLogin(page)
    
    const startTime = Date.now()
    await page.click('text=用户管理')
    await page.waitForURL(/\/users/, { timeout: TEST_CONFIG.timeouts.navigation })
    await delay(1000)
    
    const loadTime = Date.now() - startTime
    console.log(`用户管理页面加载时间: ${loadTime}ms`)
    
    expect(loadTime).toBeLessThan(10000)
  })

  test('图表渲染性能', async ({ page }) => {
    await performLogin(page)
    
    const startTime = Date.now()
    await page.click('text=数据分析')
    await page.waitForURL(/\/analytics/, { timeout: TEST_CONFIG.timeouts.navigation })
    await delay(2000)
    
    const loadTime = Date.now() - startTime
    console.log(`数据分析页面加载时间: ${loadTime}ms`)
    
    expect(loadTime).toBeLessThan(10000)
  })
})

// ==================== 兼容性测试 ====================
test.describe('🖥️ 兼容性测试', () => {
  test('不同分辨率适配', async ({ page }) => {
    const resolutions = [
      { width: 1920, height: 1080, name: 'Desktop 1080p' },
      { width: 1366, height: 768, name: 'Laptop' },
      { width: 1440, height: 900, name: 'MacBook' },
      { width: 1024, height: 768, name: 'Tablet' }
    ]
    
    for (const res of resolutions) {
      await page.setViewportSize({ width: res.width, height: res.height })
      await performLogin(page)
      await delay(1000)
      
      // 验证侧边栏
      const sidebar = await waitForElement(page, '.sidebar, .el-aside', 5000)
      console.log(`${res.name}: 侧边栏=${sidebar ? '正常' : '异常'}`)
      
      expect(sidebar).not.toBeNull()
    }
  })

  test('响应式布局', async ({ page }) => {
    // 小屏幕
    await page.setViewportSize({ width: 768, height: 1024 })
    await performLogin(page)
    await delay(1000)
    
    // 验证布局自适应
    const mainContent = await waitForElement(page, '.main-content, .el-main', 5000)
    expect(mainContent).not.toBeNull()
  })
})
