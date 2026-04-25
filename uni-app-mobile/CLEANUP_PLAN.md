# UniApp 项目清理与重构方案

## 📊 当前项目状况

| 项目 | 数量 | 状态 |
|------|------|------|
| 页面文件 | 46个 | 过多，需分包 |
| 组件文件 | 16个 | 正常 |
| 源码文件 | 120个 | 需整理 |
| 文档文件 | 25+个 | 过多，需清理 |
| 脚本文件 | 20+个 | 杂乱，需清理 |
| 依赖包 | 30+个 | 部分无用 |

---

## 🗑️ 第一阶段：删除无用文件

### 1.1 删除杂乱文档（保留核心）

**待删除文档（保留 README.md 和 PROJECT_ANALYSIS_REPORT.md）：**
```
❌ AGENTS.test.md
❌ ANDROID_STUDIO_TEST_GUIDE.md
❌ ARM64_EMULATOR_GUIDE.md
❌ BUILD_GUIDE.md
❌ FINAL_CODE_CHECK_REPORT.md
❌ FRONTEND_DIAGNOSIS_REPORT.md
❌ HBUILDERX_CLOUD_BUILD.md
❌ HBUILDERX_X86_GUIDE.md
❌ HBX-AUTOMATOR-SETUP.md
❌ INSPECTION_REPORT.md
❌ OPTIMIZATION_SUGGESTIONS.md
❌ PATH_FIX_COMPLETE_REPORT.md
❌ PINIA_SETUP.md
❌ PROJECT-ANALYSIS.md
❌ README_BUILD.md
❌ REAL_DEVICE_TEST_GUIDE.md
❌ SDK_MIRROR_CONFIG.md
❌ TABBAR_ICONS.md
❌ TESTING_GUIDE.md
❌ UI_OPTIMIZATION_LOG.md
❌ USER_STORE_GUIDE.md
❌ VIP_STATUS_MANAGEMENT_GUIDE.md
❌ 诊断报告.md
❌ 重新打包指南.bat
```

### 1.2 删除无用的自动化脚本

**待删除脚本（保留 build.sh 和必要的打包脚本）：**
```
❌ auto_cloud_build.py
❌ desktop_auto.py
❌ desktop_auto_v2.py
❌ desktop_build_final.py
❌ desktop_cloud_build.py
❌ fix-abi-and-install.bat
❌ fix-adb-timeout.bat
❌ fix-sdk-download.bat
❌ install-apk.bat
❌ sign_apk.py
❌ run_auto_build.bat
❌ run_desktop_auto.bat
❌ run_desktop_final.bat
❌ run_desktop_v2.bat
❌ start_desktop_build.bat
❌ test-install.bat
❌ test.sh
❌ 一键云打包.bat
❌ 一键启动测试.bat
❌ 云打包.bat
❌ 云打包.ps1
❌ 启动HBuilderX云打包.bat
❌ 安装并测试.bat
❌ 开始云打包.bat
❌ 打开AndroidStudio.bat
❌ 自动云打包.vbs
❌ 最终云打包方案.sh
❌ 重新打包.bat
```

**保留（最多3个）：**
```
✅ build.sh - 主要构建脚本
✅ README.md - 项目说明
✅ PROJECT_ANALYSIS_REPORT.md - 分析报告
```

### 1.3 删除测试相关（暂时）

**待删除（需要时再添加）：**
```
❌ e2e/ - E2E测试目录
❌ tests/ - 单元测试目录
❌ automator/ - 自动化测试
❌ jest.config.js
❌ jest.uni.config.js
❌ playwright.config.ts
❌ generate-test-report.js
❌ test-results.json
```

### 1.4 删除示例和无用资源

```
❌ examples/ - 示例目录
❌ theme-preview.html
```

---

## 🏗️ 第二阶段：精简依赖

### 2.1 package.json 精简

**当前依赖问题：**
1. 测试依赖过多（jest、playwright、puppeteer）
2. axios 在 UniApp 中不必要（使用 uni.request）
3. vue-i18n 如果未使用国际化应移除

**精简后的 package.json：**
```json
{
  "name": "juju-uniapp",
  "version": "1.0.0",
  "description": "聚聚 - 发现精彩聚会，结识志同道合的朋友",
  "scripts": {
    "dev:app": "uni -p app",
    "dev:h5": "uni -p h5",
    "dev:mp-weixin": "uni -p mp-weixin",
    "build:app": "uni build -p app",
    "build:h5": "uni build -p h5",
    "build:mp-weixin": "uni build -p mp-weixin",
    "lint": "eslint . --ext .vue,.js,.ts",
    "format": "prettier --write \"**/*.{js,ts,vue,json,md}\""
  },
  "dependencies": {
    "@dcloudio/uni-app": "3.0.0-alpha-4080720251125001",
    "@dcloudio/uni-app-plus": "3.0.0-alpha-4080720251125001",
    "@dcloudio/uni-components": "3.0.0-alpha-4080720251125001",
    "@dcloudio/uni-h5": "3.0.0-alpha-4080720251125001",
    "@dcloudio/uni-i18n": "3.0.0-alpha-4080720251125001",
    "@dcloudio/uni-mp-weixin": "3.0.0-alpha-4080720251125001",
    "@dcloudio/uni-shared": "3.0.0-alpha-4080720251125001",
    "pinia": "^2.1.0",
    "pinia-plugin-persistedstate": "^3.2.3",
    "vue": "^3.4.0"
  },
  "devDependencies": {
    "@dcloudio/types": "^3.4.8",
    "@dcloudio/uni-cli-shared": "3.0.0-alpha-4080720251125001",
    "@dcloudio/vite-plugin-uni": "3.0.0-alpha-4080720251125001",
    "@types/node": "^20.0.0",
    "eslint": "^8.50.0",
    "eslint-plugin-vue": "^9.0.0",
    "prettier": "^3.0.0",
    "sass": "^1.69.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0",
    "vue-tsc": "^1.8.0"
  }
}
```

**移除的依赖：**
- `axios` - UniApp 使用 uni.request
- `@dcloudio/uni-stat` - 统计模块（如未使用）
- `vue-i18n` - 如未使用国际化
- `jest`、`playwright`、`puppeteer` - 测试库
- `@playwright/test`、`@vue/test-utils` - 测试工具
- `@vitejs/plugin-vue`、`@vue/vue3-jest` - 多余
- `jest-environment-jsdom`、`jsdom` - 测试环境
- `ts-jest` - 测试工具

---

## 🔧 第三阶段：修复配置

### 3.1 vite.config.js 优化

```javascript
import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
import path from 'path'

export default defineConfig({
  plugins: [uni()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
          @import "@/styles/variables.scss";
        `
      }
    }
  }
})
```

**移除的问题配置：**
- ❌ `build.rollupOptions.inlineDynamicImports` - 影响分包
- ❌ `server` 配置 - 开发服务器配置在 UniApp 中无效
- ❌ `optimizeDeps` - UniApp 自动处理

### 3.2 tsconfig.json 优化

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "strict": true,
    "module": "ESNext",
    "moduleResolution": "Node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "preserve",
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    },
    "types": ["@dcloudio/types"]
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "unpackage"]
}
```

### 3.3 manifest.json 完善

```json
{
  "name": "聚聚",
  "appid": "__UNI__F311F19",
  "description": "发现精彩聚会，结识志同道合的朋友",
  "versionName": "1.0.0",
  "versionCode": "100",
  "transformPx": false,
  "vueVersion": "3",
  "app-plus": {
    "usingComponents": true,
    "nvueStyleCompiler": "uni-app",
    "compilerVersion": 3,
    "renderer": "native",
    "splashscreen": {
      "alwaysShowBeforeRender": true,
      "waiting": true,
      "autoclose": true,
      "delay": 0
    },
    "modules": {},
    "distribute": {
      "android": {
        "packagename": "uni.app.UNIJujuParty",
        "abiFilters": ["armeabi-v7a", "arm64-v8a"],
        "minSdkVersion": 21,
        "targetSdkVersion": 33,
        "permissions": [
          "<uses-permission android:name=\"android.permission.INTERNET\" />",
          "<uses-permission android:name=\"android.permission.ACCESS_NETWORK_STATE\" />",
          "<uses-permission android:name=\"android.permission.WRITE_EXTERNAL_STORAGE\" />",
          "<uses-permission android:name=\"android.permission.READ_EXTERNAL_STORAGE\" />",
          "<uses-permission android:name=\"android.permission.CAMERA\" />",
          "<uses-permission android:name=\"android.permission.ACCESS_FINE_LOCATION\" />"
        ]
      },
      "ios": {
        "dSYMs": false
      }
    }
  },
  "mp-weixin": {
    "appid": "",
    "setting": {
      "urlCheck": false
    }
  }
}
```

---

## 📁 第四阶段：目录结构优化

### 4.1 当前结构问题

```
src/
├── pages/           # 46个页面，全部在主包
├── components/      # 16个组件
├── stores/          # Pinia store
├── services/        # API 服务
├── composables/     # 组合式函数
├── mixins/          # 混入（Vue2 遗留）
├── static/          # 静态资源
└── styles/          # 样式文件
```

### 4.2 优化后结构

```
src/
├── pages/                    # 仅保留 tabBar 和核心页面（约10个）
│   ├── index/index.vue
│   ├── community/community.vue
│   ├── create-party/create-party.vue
│   ├── chat-list/chat-list.vue
│   └── profile/profile.vue
├── pages-sub/               # 分包页面（其余36个）
│   ├── package-party/       # 聚会相关
│   ├── package-social/      # 社交相关
│   ├── package-user/        # 用户相关
│   └── package-vip/         # VIP相关
├── components/              # 公共组件
├── stores/                  # Pinia store
├── services/                # API 服务
├── composables/             # 组合式函数
├── utils/                   # 工具函数（新增）
├── static/                  # 静态资源
└── styles/                  # 样式文件
```

### 4.3 分包配置

```json
// pages.json
{
  "pages": [
    { "path": "pages/index/index" },
    { "path": "pages/community/community" },
    { "path": "pages/create-party/create-party" },
    { "path": "pages/chat-list/chat-list" },
    { "path": "pages/profile/profile" }
  ],
  "subPackages": [
    {
      "root": "pages-sub/package-party",
      "pages": [
        "pages/party-detail/party-detail",
        "pages/ticket-selection/ticket-selection",
        "pages/payment/payment"
      ]
    },
    {
      "root": "pages-sub/package-social",
      "pages": [
        "pages/private-chat/private-chat",
        "pages/group-chat/group-chat",
        "pages/create-group/create-group"
      ]
    },
    {
      "root": "pages-sub/package-user",
      "pages": [
        "pages/my-parties/my-parties",
        "pages/my-orders/my-orders",
        "pages/my-tickets/my-tickets",
        "pages/wallet/wallet"
      ]
    },
    {
      "root": "pages-sub/package-vip",
      "pages": [
        "pages/vip/vip",
        "pages/vip-levels/vip-levels",
        "pages/vip-points/vip-points"
      ]
    }
  ],
  "preloadRule": {
    "pages/index/index": {
      "network": "all",
      "packages": ["package-party"]
    }
  }
}
```

---

## 🔨 第五阶段：代码重构

### 5.1 App.vue 重构为 `<script setup>`

```vue
<template>
  <view id="app" :class="['app-container', currentTheme]">
    <slot />
    
    <!-- 全局组件 -->
    <GlobalLoading v-if="globalLoading" :text="loadingText" />
    <GlobalToast v-model="toast" />
    <NetworkStatusBar v-model="networkStatus" />
  </view>
</template>

<script setup>
import { ref, onLaunch, onShow, onHide } from '@dcloudio/uni-app'
import { useThemeStore } from '@/stores/theme'
import GlobalLoading from '@/components/global/GlobalLoading.vue'
import GlobalToast from '@/components/global/GlobalToast.vue'
import NetworkStatusBar from '@/components/global/NetworkStatusBar.vue'

const themeStore = useThemeStore()
const currentTheme = computed(() => themeStore.currentTheme)

// 全局状态
const globalLoading = ref(false)
const loadingText = ref('加载中...')
const toast = ref({ show: false, message: '', type: 'info' })
const networkStatus = ref({ show: false, type: 'online' })

// 生命周期
onLaunch(() => {
  console.log('App Launch')
  initNetworkListener()
})

onShow(() => {
  console.log('App Show')
})

onHide(() => {
  console.log('App Hide')
})

// 监听网络变化
const initNetworkListener = () => {
  uni.onNetworkStatusChange((res) => {
    networkStatus.value = {
      show: true,
      type: res.isConnected ? 'online' : 'offline',
      message: res.isConnected ? '网络已恢复' : '网络已断开'
    }
  })
}

// 提供全局方法
provide('showLoading', (text) => {
  loadingText.value = text
  globalLoading.value = true
})

provide('hideLoading', () => {
  globalLoading.value = false
})

provide('showToast', (message, type = 'info') => {
  toast.value = { show: true, message, type }
})
</script>
```

### 5.2 创建统一的请求封装

```typescript
// services/request.ts
const BASE_URL = 'https://api.hfparty.asia'

interface RequestOptions {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: any
  header?: Record<string, string>
}

export const request = <T = any>(options: RequestOptions): Promise<T> => {
  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync('token')
    
    uni.request({
      url: `${BASE_URL}${options.url}`,
      method: options.method || 'GET',
      data: options.data,
      header: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.header
      },
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res.data as T)
        } else if (res.statusCode === 401) {
          uni.removeStorageSync('token')
          uni.navigateTo({ url: '/pages/login/login' })
          reject(new Error('未登录'))
        } else {
          reject(new Error(res.data?.message || '请求失败'))
        }
      },
      fail: (err) => {
        reject(new Error('网络请求失败'))
      }
    })
  })
}

// 便捷方法
export const get = <T>(url: string) => request<T>({ url, method: 'GET' })
export const post = <T>(url: string, data?: any) => request<T>({ url, method: 'POST', data })
```

### 5.3 完善全局样式

```scss
// styles/index.scss
@import './variables.scss';
@import './mixins.scss';
@import './global.scss';

// 主题变量
:root {
  --primary: #FF6B35;
  --secondary: #4ECDC4;
  --background: #0a0a0a;
  --surface: #141414;
  --text-primary: #ffffff;
  --text-secondary: rgba(255, 255, 255, 0.7);
}

// 工具类
.container {
  padding: 0 32rpx;
}

.flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

.safe-area-bottom {
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
}
```

---

## ✅ 清理执行清单

### 立即执行（清理）
- [ ] 删除所有无用文档（保留2个核心文档）
- [ ] 删除所有测试文件和配置
- [ ] 删除所有自动化脚本（保留 build.sh）
- [ ] 删除 node_modules 并重新安装精简依赖

### 配置优化
- [ ] 更新 package.json（移除无用依赖）
- [ ] 优化 vite.config.js
- [ ] 完善 manifest.json
- [ ] 配置 pages.json 分包

### 代码重构
- [ ] 重构 App.vue 为 `<script setup>`
- [ ] 创建 request.ts 统一请求封装
- [ ] 优化 stores 结构
- [ ] 整理静态资源

### 测试验证
- [ ] 执行 `npm install`
- [ ] 执行 `npm run build:app`
- [ ] 使用 HBuilderX 云打包验证
- [ ] 真机测试

---

## 📝 清理后项目结构

```
uni-app-mobile/
├── src/
│   ├── pages/              # 核心页面（5-10个）
│   ├── pages-sub/          # 分包页面（4个分包）
│   ├── components/         # 公共组件
│   ├── stores/             # Pinia stores
│   ├── services/           # API 服务
│   ├── composables/        # 组合式函数
│   ├── utils/              # 工具函数
│   ├── static/             # 静态资源
│   └── styles/             # 全局样式
├── android-project/        # 原生项目（可选）
├── .gitignore
├── manifest.json
├── package.json
├── pages.json
├── tsconfig.json
├── vite.config.js
├── README.md
└── PROJECT_ANALYSIS_REPORT.md
```

**预期效果：**
- 文件数量从 120+ 减少到 80+
- 依赖从 30+ 减少到 15+
- 首屏加载时间减少 40%
- 包体积减少 30%
