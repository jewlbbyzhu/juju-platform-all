# E2E测试指南

**项目**: uni-app-mobile (聚聚平台)  
**测试框架**: Playwright  
**更新日期**: 2026-03-25

---

## 测试架构

```
e2e/
├── home.spec.ts           # 首页基础测试
├── navigation.spec.ts     # 导航和路由测试
├── performance.spec.ts    # 性能和加载测试
├── api.spec.ts            # API集成测试
└── compatibility.spec.ts  # 跨浏览器兼容性测试
```

---

## 快速开始

### 1. 安装依赖
```bash
cd ~/.openclaw/workspace/juju-platform-all/uni-app-mobile
npm install
npx playwright install
```

### 2. 运行所有测试
```bash
npm run test:e2e
```

### 3. 运行特定测试文件
```bash
npx playwright test e2e/home.spec.ts
```

### 4. 使用UI模式（可视化调试）
```bash
npm run test:e2e:ui
```

### 5. 调试模式
```bash
npm run test:e2e:debug
```

### 6. 查看测试报告
```bash
npm run test:e2e:report
```

---

## 测试分类

### 首页测试 (home.spec.ts)
- ✅ 页面标题正确
- ✅ 页面正常加载
- ✅ 响应式布局正常

### 导航测试 (navigation.spec.ts)
- ✅ 底部导航栏存在
- ✅ 页面切换正常
- ✅ 返回按钮功能

### 性能测试 (performance.spec.ts)
- ✅ 首页加载时间 (< 5秒)
- ✅ 关键资源加载
- ✅ 内存使用检查 (< 100MB)
- ✅ Web Vitals指标 (LCP, CLS)

### API集成测试 (api.spec.ts)
- ✅ API服务器可访问
- ✅ 健康检查端点
- ✅ 用户API响应
- ✅ 聚会API响应

### 兼容性测试 (compatibility.spec.ts)
- ✅ 多浏览器支持 (Chromium, WebKit, Firefox)
- ✅ 触摸事件支持
- ✅ 响应式布局 (iPhone X/11/12)
- ✅ 离线功能

---

## 浏览器配置

测试在以下浏览器中运行：

| 浏览器 | 设备模拟 | 说明 |
|--------|----------|------|
| Chromium | iPhone 13 | Chrome内核移动端 |
| WebKit | iPhone 13 | Safari内核移动端 |
| Firefox | iPhone 13 | Firefox移动端 |

---

## CI/CD集成

在GitHub Actions中使用：

```yaml
name: E2E Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install
      - run: npx playwright install
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: e2e-report/
```

---

## 编写新测试

### 基本结构
```typescript
import { test, expect } from '@playwright/test'

test('测试描述', async ({ page }) => {
  await page.goto('/')
  await page.waitForLoadState('networkidle')
  
  // 你的测试代码
  const element = await page.locator('.selector')
  await expect(element).toBeVisible()
})
```

### 常用操作
```typescript
// 点击
await page.click('.button')

// 输入文本
await page.fill('.input', '文本内容')

// 获取文本
const text = await page.textContent('.element')

// 截图
await page.screenshot({ path: 'screenshot.png' })

// 等待元素
await page.waitForSelector('.element')

// 模拟移动设备
await page.setViewportSize({ width: 375, height: 812 })
```

---

## 故障排除

### 测试失败常见原因
1. **服务器未启动** - 确保 `npm run dev` 在运行
2. **端口冲突** - 检查3000端口是否被占用
3. **浏览器未安装** - 运行 `npx playwright install`
4. **网络问题** - 检查API服务器是否可访问

### 调试技巧
```bash
# 查看浏览器窗口
npx playwright test --headed

# 慢速执行
npx playwright test --slow-mo 1000

# 单文件调试
npx playwright test e2e/home.spec.ts --debug
```

---

## 测试报告

测试完成后生成HTML报告：
- 位置: `e2e-report/`
- 包含: 截图、视频、trace文件
- 查看: `npm run test:e2e:report`

---

**配置完成！** 现在可以运行完整的E2E测试套件了。
