import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright E2E测试配置
 * 针对uni-app-mobile项目的端到端测试
 */
export default defineConfig({
  testDir: './e2e',
  
  /* 测试文件匹配模式 */
  testMatch: '**/*.spec.ts',
  
  /* 完全并行运行测试 */
  fullyParallel: true,
  
  /* 禁止在CI中并行测试 */
  workers: process.env.CI ? 1 : undefined,
  
  /* 报告器配置 */
  reporter: [
    ['html', { outputFolder: 'e2e-report' }],
    ['list']
  ],
  
  /* 共享配置 */
  use: {
    /* 基础URL */
    baseURL: 'http://localhost:3000',
    
    /* 收集trace */
    trace: 'on-first-retry',
    
    /* 截图 */
    screenshot: 'only-on-failure',
    
    /* 视频 */
    video: 'on-first-retry',
    
    /* 视口大小 - 移动端 */
    viewport: { width: 375, height: 812 },
    
    /* 用户代理 - iPhone */
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1'
  },

  /* 项目配置 - 使用devices配置 */
  projects: [
    {
      name: 'chromium-mobile',
      use: {
        ...devices['iPhone 13'],
        browserName: 'chromium'
      }
    },
    {
      name: 'webkit-mobile',
      use: {
        ...devices['iPhone 13'],
        browserName: 'webkit'
      }
    },
    {
      name: 'firefox-desktop',
      use: {
        browserName: 'firefox',
        viewport: { width: 375, height: 812 }
      }
    }
  ],

  /* 本地开发服务器配置 */
  webServer: {
    command: 'npm run dev:h5',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000
  }
})
