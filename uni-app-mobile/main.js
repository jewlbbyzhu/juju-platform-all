import { createApp } from 'vue'
import App from './App.vue'
import pinia from './src/stores'

// 导入全局样式
import './src/styles/global.scss'
import './src/styles/animations.scss'
import './src/styles/responsive.scss'
import './src/static/index.css'

export function createApp() {
  const app = createApp(App)
  app.use(pinia)
  return { app }
}
