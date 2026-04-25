import { createSSRApp } from 'vue'
import App from './App.vue'
import pinia from './stores'

// 导入全局样式
import './styles/global.scss'
import './styles/animations.scss'
import './styles/responsive.scss'
import './static/index.css'

export function createApp() {
  const app = createSSRApp(App)
  app.use(pinia)
  return { app }
}
