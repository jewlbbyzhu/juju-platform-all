/**
 * Uni-app 3 自动化测试配置文件
 * 使用 @dcloudio/hbuilderx-cli 进行自动化测试
 */

module.exports = {
  // 测试平台配置
  platform: {
    // H5 测试配置
    h5: {
      enabled: true,
      browser: 'chrome',  // 仅支持 Chrome
      headless: false,     // 是否无头模式
      devtools: false,     // 是否打开开发者工具
      viewport: {
        width: 375,        // 移动端视口宽度
        height: 812        // 移动端视口高度
      }
    },
    
    // 小程序测试配置
    'mp-weixin': {
      enabled: false,      // Windows 不支持小程序测试
      cliPath: '',         // 微信开发者工具 CLI 路径
      projectPath: ''      // 项目路径
    },
    
    // App 测试配置
    app: {
      enabled: false,      // 需要连接设备或模拟器
      android: {
        device: '',        // Android 设备 ID
        appPath: ''        // App 路径
      },
      ios: {
        enabled: false     // Windows 不支持 iOS 测试
      }
    }
  },
  
  // Jest 配置
  jest: {
    testEnvironment: 'node',
    testMatch: [
      '**/automator/**/*.test.js'
    ],
    testTimeout: 60000,
    verbose: true
  },
  
  // 测试报告配置
  reporter: {
    enabled: true,
    outputDir: './automator-report',
    format: ['html', 'json']
  },
  
  // 截图配置
  screenshot: {
    enabled: true,
    onFailure: true,     // 失败时自动截图
    onSuccess: false     // 成功时不截图
  },
  
  // 视频录制配置
  video: {
    enabled: false,
    dir: './automator-videos'
  }
}
