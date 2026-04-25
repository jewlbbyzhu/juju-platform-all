# Uni-app 完整知识库（2026最新版）

**持续更新中** - 第5批学习（最终批）

---

## 第5批：工程化、测试与发布

### 1. 工程化配置

#### 目录结构最佳实践
```
uni-app-mobile/
├── src/
│   ├── api/              # API接口
│   │   ├── party.js
│   │   ├── user.js
│   │   └── index.js
│   ├── components/       # 公共组件
│   │   ├── party-card/
│   │   ├── user-avatar/
│   │   └── loading/
│   ├── composables/      # 组合式函数
│   │   ├── useAuth.js
│   │   ├── useLocation.js
│   │   └── usePayment.js
│   ├── config/           # 配置文件
│   │   ├── index.js
│   │   └── api.config.js
│   ├── pages/            # 页面
│   │   ├── index/
│   │   ├── party-detail/
│   │   └── profile/
│   ├── static/           # 静态资源
│   ├── stores/           # Pinia状态管理
│   │   ├── user.js
│   │   ├── party.js
│   │   └── index.js
│   ├── styles/           # 全局样式
│   │   ├── variables.scss
│   │   ├── mixins.scss
│   │   └── global.scss
│   ├── utils/            # 工具函数
│   │   ├── request.js
│   │   ├── storage.js
│   │   └── validate.js
│   ├── App.vue
│   ├── main.js
│   └── manifest.json
├── cloudfunctions/       # 云函数
├── tests/                # 测试文件
├── .env.development
├── .env.production
├── package.json
└── vite.config.js
```

#### ESLint配置
```javascript
// .eslintrc.js
module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es2022: true
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-recommended'
  ],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module'
  },
  rules: {
    'vue/multi-word-component-names': 'off',
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off'
  },
  globals: {
    uni: 'readonly',
    plus: 'readonly',
    wx: 'readonly'
  }
}
```

#### Prettier配置
```javascript
// .prettierrc.js
module.exports = {
  semi: false,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'none',
  printWidth: 100,
  bracketSpacing: true,
  arrowParens: 'avoid'
}
```

---

### 2. 环境配置

#### 多环境配置
```javascript
// .env.development
NODE_ENV=development
VUE_APP_API_URL=http://localhost:3010/api
VUE_APP_WS_URL=ws://localhost:3010

// .env.production
NODE_ENV=production
VUE_APP_API_URL=https://api.juju.com/api
VUE_APP_WS_URL=wss://api.juju.com
```

#### 使用环境变量
```javascript
// 获取环境变量
const apiUrl = process.env.VUE_APP_API_URL

// vite.config.js
import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'

export default defineConfig({
  plugins: [uni()],
  define: {
    __API_URL__: JSON.stringify(process.env.VUE_APP_API_URL)
  }
})
```

---

### 3. 测试策略

#### 单元测试
```javascript
// tests/unit/party.test.js
import { describe, it, expect } from 'vitest'
import { useParty } from '@/composables/useParty'

describe('聚会功能测试', () => {
  it('应该能创建聚会', () => {
    const { createParty } = useParty()
    const result = createParty({
      title: '周末聚会',
      location: '合肥'
    })
    expect(result.success).toBe(true)
  })
})
```

#### E2E测试
```javascript
// tests/e2e/home.spec.js
describe('首页测试', () => {
  it('应该显示聚会列表', async () => {
    const page = await program.reLaunch('/pages/index/index')
    await page.waitFor(1000)
    const list = await page.$('.party-list')
    expect(list).toBeTruthy()
  })
})
```

#### 自动化测试配置
```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['js', 'json', 'vue'],
  transform: {
    '^.+\\.vue$': '@vue/vue3-jest',
    '^.+\\.js$': 'babel-jest'
  },
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  collectCoverage: true,
  coverageDirectory: 'coverage'
}
```

---

### 4. CI/CD流程

#### GitHub Actions配置
```yaml
# .github/workflows/build.yml
name: Build and Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: npm test
        
      - name: Build H5
        run: npm run build:h5
        
      - name: Build App
        run: npm run build:app
        
      - name: Upload artifacts
        uses: actions/upload-artifact@v3
        with:
          name: dist
          path: dist/
```

---

### 5. 发布流程

#### 版本管理
```bash
# 版本号规范: 主版本.次版本.修订号
# 1.0.0 -> 1.1.0 (新功能)
# 1.1.0 -> 1.1.1 (Bug修复)
# 1.1.1 -> 2.0.0 (重大更新)

# 更新版本
npm version patch  # 修订号+1
npm version minor  # 次版本+1
npm version major  # 主版本+1
```

#### 发布检查清单
| 检查项 | 状态 | 说明 |
|--------|------|------|
| 代码审查 | ☐ | 已通过Code Review |
| 测试通过 | ☐ | 单元测试覆盖率>80% |
| 性能测试 | ☐ | 启动时间<3秒 |
| 安全扫描 | ☐ | 无高危漏洞 |
| 隐私合规 | ☐ | 隐私政策已更新 |
| 文档更新 | ☐ | 更新日志已编写 |

#### 各平台发布

**H5**
```bash
# 构建
npm run build:h5

# 部署到服务器
rsync -avz dist/build/h5/ root@server:/var/www/html/
```

**微信小程序**
```bash
# 构建
npm run build:mp-weixin

# 使用微信开发者工具上传
# 或 CI/CD自动上传
```

**App（Android/iOS）**
```bash
# 使用HBuilderX云打包
# 1. 发行 -> App-Android-安心打包
# 2. 上传应用到应用商店
```

---

### 6. 热更新

#### App热更新
```javascript
// 检查更新
uni.request({
  url: 'https://api.juju.com/update/check',
  success: (res) => {
    if (res.data.hasUpdate) {
      uni.showModal({
        title: '发现新版本',
        content: res.data.note,
        success: (modalRes) => {
          if (modalRes.confirm) {
            // 下载更新
            uni.downloadFile({
              url: res.data.url,
              success: (downloadRes) => {
                // 安装更新
                plus.runtime.install(downloadRes.tempFilePath)
              }
            })
          }
        }
      })
    }
  }
})
```

---

### 7. 性能监控

#### 实时监控
```javascript
// 页面性能
uni.getPerformance({
  success: (res) => {
    // 上报到监控系统
    uni.request({
      url: 'https://monitor.juju.com/performance',
      method: 'POST',
      data: {
        appLaunchTime: res.appLaunchTime,
        pageRenderTime: res.pageRenderTime,
        timestamp: Date.now()
      }
    })
  }
})

// 错误监控
uni.onError((error) => {
  uni.request({
    url: 'https://monitor.juju.com/error',
    method: 'POST',
    data: {
      message: error.message,
      stack: error.stack,
      page: getCurrentPages()[0].route,
      timestamp: Date.now()
    }
  })
})
```

---

### 8. 最佳实践总结

#### 开发规范
1. **命名规范**
   - 组件: PascalCase (PartyCard.vue)
   - 页面: kebab-case (party-detail.vue)
   - 函数: camelCase (getPartyList)
   - 常量: UPPER_SNAKE_CASE (API_BASE_URL)

2. **代码组织**
   - 单一职责原则
   - 组件粒度适中
   - 逻辑复用composables

3. **性能优化**
   - 图片懒加载
   - 列表虚拟滚动
   - 路由懒加载
   - 分包加载

4. **安全规范**
   - HTTPS通信
   - 敏感数据加密
   - 输入验证
   - 防XSS/CSRF

#### 项目检查清单
| 阶段 | 检查项 | 状态 |
|------|--------|------|
| 开发前 | 需求评审 | ☐ |
| | 技术方案 | ☐ |
| | UI设计稿 | ☐ |
| 开发中 | 代码规范 | ☐ |
| | 单元测试 | ☐ |
| | 代码审查 | ☐ |
| 发布前 | 集成测试 | ☐ |
| | 性能测试 | ☐ |
| | 安全扫描 | ☐ |
| 发布后 | 监控告警 | ☐ |
| | 用户反馈 | ☐ |
| | 数据分析 | ☐ |

---

## 🎓 学习总结

### 已学习内容
| 批次 | 主题 | 状态 |
|------|------|------|
| 第1批 | 2025打包配置 | ✅ |
| 第2批 | 2026最新特性 | ✅ |
| 第3批 | 架构深度解析 | ✅ |
| 第4批 | 插件与云服务 | ✅ |
| 第5批 | 工程化与发布 | ✅ |

### 核心知识点
1. ✅ 渲染模式: WebView / uvue / Weex
2. ✅ 新平台: HarmonyOS深度集成
3. ✅ 新语言: uvue / uts
4. ✅ 云服务: uniCloud / uni-ai
5. ✅ 工程化: 测试 / CI/CD / 监控

### 推荐技术栈（2026）
- **框架**: uni-app x + Vue 3.4
- **渲染**: uvue（高性能）
- **状态**: Pinia
- **样式**: SCSS + CSS变量
- **云服务**: uniCloud + uni-ai
- **构建**: Vite 5.x

---

**学习完成！** 🎉

所有uni-app知识已学习完毕，涵盖:
- 基础配置与打包
- 2026最新特性
- 架构与性能
- 插件与云服务
- 工程化与发布

项目已配置完成，可以使用HBuilderX安心打包发布！
