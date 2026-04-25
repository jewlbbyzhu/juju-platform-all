import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'

import App from './App.vue'
import router from './router'
import { setupPermissionDirectives } from './directives/permission'
import { errorHandler } from './utils/errorHandler'
import { performanceMonitor } from './utils/performance'
import './assets/styles/index.css'

const app = createApp(App)

// Setup global error handler
errorHandler.init()

// Setup performance monitoring
if (import.meta.env.PROD) {
  performanceMonitor.init()
}

// Vue error handler
app.config.errorHandler = (err, instance, info) => {
  console.error('[Vue Error]', err, info)
  errorHandler.handleError(err)
}

// Vue warning handler (only in development)
if (import.meta.env.DEV) {
  app.config.warnHandler = (msg, instance, trace) => {
    console.warn('[Vue Warning]', msg, trace)
  }
}

app.use(createPinia())
app.use(router)
app.use(ElementPlus)

// Setup permission directives
setupPermissionDirectives(app)

app.mount('#app')

// 开发环境下引入自动化点击模拟器，支持通过URL参数触发
if (import.meta.env.DEV) {
  setTimeout(() => {
    import('./dev/consoleCapture').then((c) => {
      c.initConsoleCapture()
    }).catch(() => {})
    import('./dev/autoTap').then((mod) => {
      mod.initAutoTap()
    }).catch((err) => {
      console.warn('自动化点击模块加载失败', err)
    })
  }, 100)
}
