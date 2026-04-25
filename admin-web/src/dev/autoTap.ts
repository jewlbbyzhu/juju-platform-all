import router from '@/router'

// 初始化自动化点击与页面遍历
export function initAutoTap() {
  // 仅在开发模式并且存在触发参数时执行
  const params = new URLSearchParams(window.location.search)
  const enable = params.get('autoTap') === 'true'
  if (!enable) return

  // 解析待遍历的路由列表，默认覆盖常见管理页面
  const routesParam = params.get('routes')
  let routes: string[] | undefined
  if (routesParam === 'all') {
    const all = router.getRoutes()
      .map(r => r.path)
      .filter(p => p && p.startsWith('/') && p !== '/login')
    // 去重与排序：优先 dashboard，其次各模块首页
    const uniq = Array.from(new Set(all))
    routes = uniq
  } else {
    routes = routesParam?.split(',').filter(Boolean) ?? [
      '/',
      '/dashboard/overview',
      '/users/list',
      '/orders/list',
      '/parties/list',
      '/parties/audit',
      '/finance/overview',
      '/finance/withdrawals',
      '/content',
      '/analytics',
      '/system'
    ]
  }

  console.info('[autoTap] 启用，目标路由：', routes)

  // 按序遍历路由并在每页触发点击
  runSequential(routes)
}

// 依次导航到每个路由并执行点击
async function runSequential(routeList: string[]) {
  for (let i = 0; i < routeList.length; i++) {
    const path = routeList[i]
    try {
      console.info('[autoTap] 导航至：', path)
      // 导航到目标页面
      await router.push(path)
      // 等待页面渲染稳定
      await waitForStability()
      // 触发当前页的“tap/click”事件集合
      await runAutoTapOnPage()
      if (path.startsWith('/analytics')) {
        try {
          const { default: request } = await import('../api/request')
          await request.post('/analytics/export', { timeRange: 'month' }, { responseType: 'blob' })
          console.info('[autoTap] 触发分析导出')
        } catch (e) {
          console.warn('[autoTap] 分析导出失败', e)
        }
      }
    } catch (e) {
      console.error('[autoTap] 页面处理失败：', path, e)
    }
  }
  console.info('[autoTap] 完成所有页面遍历与点击')
}

// 等待页面渲染稳定的简单策略
function waitForStability(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 800))
}

// 在当前页面触发常见可点击元素的点击
async function runAutoTapOnPage() {
  // 定义可点击元素选择器集合（Element Plus 优先）
  const selectors = [
    'button',
    '.el-button',
    '.el-tabs__item',
    '.el-menu-item',
    '.el-pagination button',
    'a[href]:not([href="#"])',
    '.el-select',
    '.el-dialog__footer .el-button--primary',
    '.el-upload',
    'input[type="file"]',
    '.el-checkbox',
    '.el-radio',
    '.el-switch',
    '.el-dropdown'
  ]

  // 每类最多点击数量，避免过度触发
  const maxPerSelector = 5

  for (const sel of selectors) {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>(sel))
      // 过滤不可见或禁用元素
      .filter((el) => {
        const style = window.getComputedStyle(el)
        const rect = el.getBoundingClientRect()
        const visible = style.visibility !== 'hidden' && style.display !== 'none' && rect.width > 0 && rect.height > 0
        const disabled = (el as HTMLButtonElement).disabled === true || el.getAttribute('aria-disabled') === 'true'
        return visible && !disabled
      })
      .slice(0, maxPerSelector)

    console.info(`[autoTap] 选择器 ${sel} 命中 ${nodes.length} 个元素，开始点击`)

    for (let i = 0; i < nodes.length; i++) {
      const el = nodes[i]
      try {
        // 滚动到元素可视区域
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        // 轻微等待，避免连续点击造成抖动
        await sleep(120)
        // 特殊处理下拉选择框：先打开，再选择第一项
        if (el.classList.contains('el-select')) {
          el.click()
          await sleep(150)
          const item = document.querySelector<HTMLElement>('.el-select-dropdown__item')
          if (item) {
            item.click()
          }
        } else if (el.classList.contains('el-dropdown')) {
          el.click()
          await sleep(150)
          const item = document.querySelector<HTMLElement>('.el-dropdown-menu__item')
          if (item) {
            item.click()
          }
        } else if ((el as HTMLInputElement).type === 'file') {
          el.click()
        } else if (el.classList.contains('el-upload')) {
          el.click()
        } else {
          // 普通点击
          el.click()
        }
        // 输出点击信息（文本或aria标签）
        const label = el.innerText?.trim() || el.getAttribute('aria-label') || el.getAttribute('title') || el.tagName
        console.info('[autoTap] 点击：', label)
        // 点击后稍作等待，用于捕获可能的控制台报错
        await sleep(180)
      } catch (e) {
        console.warn('[autoTap] 点击失败：', e)
      }
    }
  }

  const primaryInDialog = document.querySelector<HTMLElement>('.el-dialog__footer .el-button--primary')
  if (primaryInDialog) {
    try {
      primaryInDialog.click()
      await sleep(180)
    } catch (e) {
      
    }
  }

  const headerSelectAll = document.querySelector<HTMLElement>('.el-table thead .el-checkbox')
  if (headerSelectAll) {
    try {
      headerSelectAll.click()
      await sleep(120)
    } catch {}
  }
  const rowCheckboxes = Array.from(document.querySelectorAll<HTMLElement>('.el-table tbody .el-checkbox')).slice(0, 3)
  for (const cb of rowCheckboxes) {
    try {
      cb.click()
      await sleep(100)
    } catch {}
  }

  const pagerNext = document.querySelector<HTMLElement>('.el-pagination .btn-next')
  const pagerPrev = document.querySelector<HTMLElement>('.el-pagination .btn-prev')
  const pagerNumber = document.querySelector<HTMLElement>('.el-pagination .el-pager li.number')
  if (pagerNext) {
    try { pagerNext.click(); await sleep(150) } catch {}
  }
  if (pagerPrev) {
    try { pagerPrev.click(); await sleep(150) } catch {}
  }
  if (pagerNumber) {
    try { pagerNumber.click(); await sleep(150) } catch {}
  }

  const dateEditor = document.querySelector<HTMLElement>('.el-date-editor')
  if (dateEditor) {
    try {
      dateEditor.click()
      await sleep(150)
      const dateCell = document.querySelector<HTMLElement>('.el-date-table td.available')
      if (dateCell) { dateCell.click(); await sleep(120) }
    } catch {}
  }

  const dateRange = document.querySelector<HTMLElement>('.el-date-editor--daterange')
  if (dateRange) {
    try {
      dateRange.click()
      await sleep(150)
      const cells = Array.from(document.querySelectorAll<HTMLElement>('.el-date-range-picker .el-date-table td.available')).slice(0, 2)
      for (const c of cells) { c.click(); await sleep(100) }
    } catch {}
  }

  const forms = Array.from(document.querySelectorAll<HTMLElement>('.el-form'))
  for (const f of forms.slice(0, 2)) {
    const inputs = Array.from(f.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('input, textarea'))
    for (const i of inputs.slice(0, 3)) {
      i.dispatchEvent(new FocusEvent('blur', { bubbles: true }))
      await sleep(60)
    }
    const submitBtn = f.querySelector<HTMLElement>('.el-button--primary')
    if (submitBtn) { submitBtn.click(); await sleep(150) }
  }

  const uploadInputs = Array.from(document.querySelectorAll<HTMLInputElement>('input.el-upload__input, input[type="file"]')).slice(0, 2)
  if (uploadInputs.length > 0) {
    try {
      const blob = new Blob(['test'], { type: 'text/plain' })
      const file = new File([blob], 'test.txt', { type: 'text/plain' })
      const dt = new DataTransfer()
      dt.items.add(file)
      for (const input of uploadInputs) {
        try {
          Object.defineProperty(input, 'files', { value: dt.files })
          input.dispatchEvent(new Event('change', { bubbles: true }))
          await sleep(120)
        } catch {}
      }
    } catch {}
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
