/**
 * 管理后台自动化交互测试
 * 全面测试各种交互元素：点击、输入、选择、表单提交等
 */

export interface TestLog {
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

export interface TestResult {
  totalTests: number
  passed: number
  failed: number
  logs: TestLog[]
  coverage: {
    elements: string[]
    actions: string[]
  }
}

class AutomatedInteractionTester {
  private logs: TestLog[] = []
  private startTime: number = 0
  private testedElements: Set<string> = new Set()
  private testedActions: Set<string> = new Set()

  constructor() {
    this.startTime = Date.now()
    this.initConsoleCapture()
  }

  private initConsoleCapture() {
    const originalConsole = {
      log: console.log,
      info: console.info,
      warn: console.warn,
      error: console.error
    }

    const captureLog = (level: 'info' | 'warn' | 'error', ...args: any[]) => {
      this.logs.push({
        timestamp: new Date().toISOString(),
        level,
        action: 'console',
        details: args.join(' ')
      })
      originalConsole[level](...args)
    }

    console.log = (...args) => captureLog('info', ...args)
    console.info = (...args) => captureLog('info', ...args)
    console.warn = (...args) => captureLog('warn', ...args)
    console.error = (...args) => captureLog('error', ...args)
  }

  private log(level: TestLog['level'], action: string, target?: string, details?: any, duration?: number) {
    const logEntry: TestLog = {
      timestamp: new Date().toISOString(),
      level,
      action,
      target,
      details,
      duration
    }
    this.logs.push(logEntry)

    const emoji = { info: 'ℹ️', warn: '⚠️', error: '❌', success: '✅' }
    console.log(`[${emoji[level]}] ${action}${target ? ` - ${target}` : ''}${duration ? ` (${duration}ms)` : ''}`)
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  private recordElement(selector: string) {
    this.testedElements.add(selector)
  }

  private recordAction(action: string) {
    this.testedActions.add(action)
  }

  /**
   * 测试按钮点击
   */
  async testButtonClick(button: HTMLElement, context: string): Promise<boolean> {
    const startTime = performance.now()
    this.recordAction('click')
    this.recordElement('button')

    try {
      const label = button.innerText?.trim() || button.getAttribute('aria-label') || 'Unknown Button'
      this.log('info', 'Testing button click', `${context} > ${label}`)

      // 滚动到可视区域
      button.scrollIntoView({ behavior: 'smooth', block: 'center' })
      await this.sleep(100)

      // 检查按钮状态
      const isDisabled = (button as HTMLButtonElement).disabled ||
        button.getAttribute('aria-disabled') === 'true' ||
        button.classList.contains('is-disabled')

      if (isDisabled) {
        this.log('warn', 'Button is disabled, skipping', label)
        return false
      }

      // 执行点击
      button.click()
      await this.sleep(200)

      const duration = Math.round(performance.now() - startTime)
      this.log('success', 'Button click successful', label, undefined, duration)
      return true
    } catch (error) {
      const duration = Math.round(performance.now() - startTime)
      this.log('error', 'Button click failed', context, undefined, duration)
      this.logError('ButtonClickError', error)
      return false
    }
  }

  /**
   * 测试文本输入
   */
  async testTextInput(input: HTMLInputElement | HTMLTextAreaElement, context: string): Promise<boolean> {
    const startTime = performance.now()
    this.recordAction('input')
    this.recordElement('input')

    try {
      const placeholder = input.placeholder || 'Unknown Input'
      const type = input.type || 'text'
      this.log('info', 'Testing text input', `${context} > ${placeholder} (${type})`)

      input.scrollIntoView({ behavior: 'smooth', block: 'center' })
      await this.sleep(100)

      // 生成测试数据
      const testValue = this.generateTestValue(type)
      const originalValue = input.value

      // 聚焦输入框
      input.focus()
      input.dispatchEvent(new Event('focus', { bubbles: true }))
      await this.sleep(50)

      // 输入测试数据
      input.value = testValue
      input.dispatchEvent(new Event('input', { bubbles: true }))
      input.dispatchEvent(new Event('change', { bubbles: true }))
      await this.sleep(100)

      // 触发失焦
      input.blur()
      input.dispatchEvent(new Event('blur', { bubbles: true }))
      await this.sleep(50)

      const duration = Math.round(performance.now() - startTime)
      this.log('success', 'Text input successful', placeholder, { value: testValue, original: originalValue }, duration)
      return true
    } catch (error) {
      const duration = Math.round(performance.now() - startTime)
      this.log('error', 'Text input failed', context, undefined, duration)
      this.logError('TextInputError', error)
      return false
    }
  }

  /**
   * 测试下拉选择
   */
  async testSelect(select: HTMLElement, context: string): Promise<boolean> {
    const startTime = performance.now()
    this.recordAction('select')
    this.recordElement('select')

    try {
      this.log('info', 'Testing select dropdown', context)

      select.scrollIntoView({ behavior: 'smooth', block: 'center' })
      await this.sleep(100)

      // 打开下拉框
      select.click()
      await this.sleep(200)

      // 选择第一个选项
      const option = document.querySelector<HTMLElement>('.el-select-dropdown__item, .el-dropdown-menu__item')
      if (option) {
        option.click()
        await this.sleep(150)
        this.log('success', 'Select option chosen', option.innerText?.trim())
      } else {
        this.log('warn', 'No options found in dropdown')
        // 关闭下拉框
        document.body.click()
        await this.sleep(100)
      }

      const duration = Math.round(performance.now() - startTime)
      this.log('success', 'Select test completed', context, undefined, duration)
      return true
    } catch (error) {
      const duration = Math.round(performance.now() - startTime)
      this.log('error', 'Select test failed', context, undefined, duration)
      this.logError('SelectError', error)
      return false
    }
  }

  /**
   * 测试复选框
   */
  async testCheckbox(checkbox: HTMLElement, context: string): Promise<boolean> {
    const startTime = performance.now()
    this.recordAction('checkbox')
    this.recordElement('checkbox')

    try {
      this.log('info', 'Testing checkbox', context)

      checkbox.scrollIntoView({ behavior: 'smooth', block: 'center' })
      await this.sleep(100)

      const isChecked = checkbox.classList.contains('is-checked') ||
        checkbox.getAttribute('aria-checked') === 'true'

      // 点击切换状态
      checkbox.click()
      await this.sleep(150)

      // 再次点击恢复原状态
      checkbox.click()
      await this.sleep(150)

      const duration = Math.round(performance.now() - startTime)
      this.log('success', 'Checkbox test completed', context, { wasChecked: isChecked }, duration)
      return true
    } catch (error) {
      const duration = Math.round(performance.now() - startTime)
      this.log('error', 'Checkbox test failed', context, undefined, duration)
      this.logError('CheckboxError', error)
      return false
    }
  }

  /**
   * 测试表单提交
   */
  async testFormSubmit(form: HTMLElement, context: string): Promise<boolean> {
    const startTime = performance.now()
    this.recordAction('formSubmit')
    this.recordElement('form')

    try {
      this.log('info', 'Testing form submission', context)

      form.scrollIntoView({ behavior: 'smooth', block: 'center' })
      await this.sleep(100)

      // 填写表单字段
      const inputs = Array.from(form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('input, textarea, select'))
      for (const input of inputs.slice(0, 5)) {
        if (input.tagName === 'SELECT') {
          // 处理下拉选择
          const select = input as unknown as HTMLElement
          select.dispatchEvent(new Event('change', { bubbles: true }))
        } else {
          const inputEl = input as HTMLInputElement
          if (inputEl.type === 'checkbox' || inputEl.type === 'radio') {
            inputEl.click()
          } else {
            inputEl.value = this.generateTestValue(inputEl.type)
            inputEl.dispatchEvent(new Event('input', { bubbles: true }))
          }
        }
        await this.sleep(50)
      }

      // 查找提交按钮
      const submitBtn = form.querySelector<HTMLElement>('button[type="submit"], .el-button--primary, .el-form .el-button--primary')
      if (submitBtn) {
        submitBtn.click()
        await this.sleep(300)
        this.log('success', 'Form submitted')
      } else {
        this.log('warn', 'No submit button found in form')
      }

      const duration = Math.round(performance.now() - startTime)
      this.log('success', 'Form test completed', context, { inputsFilled: inputs.length }, duration)
      return true
    } catch (error) {
      const duration = Math.round(performance.now() - startTime)
      this.log('error', 'Form test failed', context, undefined, duration)
      this.logError('FormSubmitError', error)
      return false
    }
  }

  /**
   * 测试模态框操作
   */
  async testModalOperations(context: string): Promise<boolean> {
    const startTime = performance.now()
    this.recordAction('modal')
    this.recordElement('modal')

    try {
      this.log('info', 'Testing modal operations', context)

      // 查找打开的模态框
      const modal = document.querySelector<HTMLElement>('.el-dialog, .el-drawer, .modal')
      if (!modal) {
        this.log('info', 'No modal found, skipping modal tests')
        return false
      }

      // 测试模态框内按钮
      const buttons = Array.from(modal.querySelectorAll<HTMLElement>('.el-button'))
      for (const btn of buttons.slice(0, 3)) {
        await this.testButtonClick(btn, `${context} > Modal`)
      }

      // 关闭模态框
      const closeBtn = modal.querySelector<HTMLElement>('.el-dialog__headerbtn, .el-drawer__close-btn, .modal-close')
      if (closeBtn) {
        closeBtn.click()
        await this.sleep(200)
        this.log('success', 'Modal closed')
      }

      const duration = Math.round(performance.now() - startTime)
      this.log('success', 'Modal operations completed', context, { buttonsTested: buttons.length }, duration)
      return true
    } catch (error) {
      const duration = Math.round(performance.now() - startTime)
      this.log('error', 'Modal operations failed', context, undefined, duration)
      this.logError('ModalError', error)
      return false
    }
  }

  /**
   * 测试分页组件
   */
  async testPagination(context: string): Promise<boolean> {
    const startTime = performance.now()
    this.recordAction('pagination')
    this.recordElement('pagination')

    try {
      this.log('info', 'Testing pagination', context)

      const pagination = document.querySelector<HTMLElement>('.el-pagination')
      if (!pagination) {
        this.log('info', 'No pagination found')
        return false
      }

      // 测试下一页
      const nextBtn = pagination.querySelector<HTMLElement>('.btn-next')
      if (nextBtn && !nextBtn.classList.contains('disabled')) {
        nextBtn.click()
        await this.sleep(200)
        this.log('success', 'Next page clicked')
      }

      // 测试页码
      const pageNumber = pagination.querySelector<HTMLElement>('.el-pager li.number')
      if (pageNumber) {
        pageNumber.click()
        await this.sleep(200)
        this.log('success', 'Page number clicked')
      }

      // 测试上一页
      const prevBtn = pagination.querySelector<HTMLElement>('.btn-prev')
      if (prevBtn && !prevBtn.classList.contains('disabled')) {
        prevBtn.click()
        await this.sleep(200)
        this.log('success', 'Previous page clicked')
      }

      const duration = Math.round(performance.now() - startTime)
      this.log('success', 'Pagination test completed', context, undefined, duration)
      return true
    } catch (error) {
      const duration = Math.round(performance.now() - startTime)
      this.log('error', 'Pagination test failed', context, undefined, duration)
      this.logError('PaginationError', error)
      return false
    }
  }

  /**
   * 测试日期选择器
   */
  async testDatePicker(context: string): Promise<boolean> {
    const startTime = performance.now()
    this.recordAction('datePicker')
    this.recordElement('datePicker')

    try {
      this.log('info', 'Testing date picker', context)

      const datePicker = document.querySelector<HTMLElement>('.el-date-editor')
      if (!datePicker) {
        this.log('info', 'No date picker found')
        return false
      }

      datePicker.click()
      await this.sleep(200)

      // 选择一个日期
      const dateCell = document.querySelector<HTMLElement>('.el-date-table td.available')
      if (dateCell) {
        dateCell.click()
        await this.sleep(150)
        this.log('success', 'Date selected')
      }

      const duration = Math.round(performance.now() - startTime)
      this.log('success', 'Date picker test completed', context, undefined, duration)
      return true
    } catch (error) {
      const duration = Math.round(performance.now() - startTime)
      this.log('error', 'Date picker test failed', context, undefined, duration)
      this.logError('DatePickerError', error)
      return false
    }
  }

  /**
   * 执行页面完整测试
   */
  async testPage(): Promise<{ passed: number; failed: number }> {
    let passed = 0
    let failed = 0

    this.log('info', 'Starting page test', window.location.pathname)

    // 等待页面稳定
    await this.sleep(800)

    // 测试按钮
    const buttons = Array.from(document.querySelectorAll<HTMLElement>('button:not([disabled]), .el-button:not(.is-disabled)'))
      .filter(btn => {
        const rect = btn.getBoundingClientRect()
        return rect.width > 0 && rect.height > 0
      })
      .slice(0, 10)

    for (const btn of buttons) {
      const success = await this.testButtonClick(btn, 'Page')
      success ? passed++ : failed++
    }

    // 测试输入框
    const inputs = Array.from(document.querySelectorAll<HTMLInputElement>('input:not([type="hidden"]):not([type="file"]), textarea'))
      .filter(input => !input.disabled && !input.readOnly)
      .slice(0, 5)

    for (const input of inputs) {
      const success = await this.testTextInput(input, 'Page')
      success ? passed++ : failed++
    }

    // 测试下拉选择
    const selects = Array.from(document.querySelectorAll<HTMLElement>('.el-select'))
      .slice(0, 3)

    for (const select of selects) {
      const success = await this.testSelect(select, 'Page')
      success ? passed++ : failed++
    }

    // 测试复选框
    const checkboxes = Array.from(document.querySelectorAll<HTMLElement>('.el-checkbox'))
      .slice(0, 5)

    for (const checkbox of checkboxes) {
      const success = await this.testCheckbox(checkbox, 'Page')
      success ? passed++ : failed++
    }

    // 测试表单
    const forms = Array.from(document.querySelectorAll<HTMLElement>('.el-form'))
      .slice(0, 2)

    for (const form of forms) {
      const success = await this.testFormSubmit(form, 'Page')
      success ? passed++ : failed++
    }

    // 测试分页
    const paginationSuccess = await this.testPagination('Page')
    paginationSuccess ? passed++ : failed++

    // 测试日期选择器
    const datePickerSuccess = await this.testDatePicker('Page')
    datePickerSuccess ? passed++ : failed++

    // 测试模态框（如果存在）
    const modalSuccess = await this.testModalOperations('Page')
    if (modalSuccess) passed++

    this.log('info', 'Page test completed', window.location.pathname, { passed, failed })

    return { passed, failed }
  }

  /**
   * 生成测试数据
   */
  private generateTestValue(type: string): string {
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

  /**
   * 记录错误信息
   */
  private logError(type: string, error: any) {
    this.logs.push({
      timestamp: new Date().toISOString(),
      level: 'error',
      action: 'error',
      details: {
        errorType: type,
        message: error?.message || String(error),
        stack: error?.stack
      },
      error: {
        type,
        message: error?.message || String(error),
        stack: error?.stack
      }
    })
  }

  /**
   * 获取测试结果
   */
  getResults(): TestResult {
    const totalTests = this.logs.filter(l =>
      l.action === 'Button click successful' ||
      l.action === 'Text input successful' ||
      l.action === 'Select test completed' ||
      l.action === 'Checkbox test completed' ||
      l.action === 'Form test completed' ||
      l.action === 'Pagination test completed' ||
      l.action === 'Date picker test completed' ||
      l.action === 'Modal operations completed'
    ).length

    const passed = this.logs.filter(l => l.level === 'success').length
    const failed = this.logs.filter(l => l.level === 'error').length

    return {
      totalTests,
      passed,
      failed,
      logs: this.logs,
      coverage: {
        elements: Array.from(this.testedElements),
        actions: Array.from(this.testedActions)
      }
    }
  }

  /**
   * 导出测试报告
   */
  exportReport(): string {
    const results = this.getResults()
    const duration = Date.now() - this.startTime

    const report = {
      summary: {
        totalTests: results.totalTests,
        passed: results.passed,
        failed: results.failed,
        passRate: ((results.passed / results.totalTests) * 100).toFixed(2) + '%',
        duration: `${duration}ms`,
        timestamp: new Date().toISOString()
      },
      coverage: results.coverage,
      logs: results.logs,
      errors: results.logs.filter(l => l.level === 'error').map(l => ({
        timestamp: l.timestamp,
        action: l.action,
        target: l.target,
        error: l.error
      }))
    }

    return JSON.stringify(report, null, 2)
  }
}

// 全局暴露测试器
;(window as any).AutomatedInteractionTester = AutomatedInteractionTester

export default AutomatedInteractionTester
