import { createPinia } from 'pinia'
import { createPersistedState } from 'pinia-plugin-persistedstate'

// 创建 Pinia 实例
const pinia = createPinia()

// 使用持久化插件 - 兼容H5和uni-app
pinia.use(createPersistedState({
  storage: {
    getItem: (key: string) => {
      try {
        // 优先使用uni-app API，如果不存在则使用localStorage
        if (typeof uni !== 'undefined' && uni.getStorageSync) {
          return uni.getStorageSync(key)
        }
        return localStorage.getItem(key)
      } catch (e) {
        return null
      }
    },
    setItem: (key: string, value: string) => {
      try {
        if (typeof uni !== 'undefined' && uni.setStorageSync) {
          uni.setStorageSync(key, value)
        } else {
          localStorage.setItem(key, value)
        }
      } catch (e) {
        console.error('Failed to persist store:', e)
      }
    },
    removeItem: (key: string) => {
      try {
        if (typeof uni !== 'undefined' && uni.removeStorageSync) {
          uni.removeStorageSync(key)
        } else {
          localStorage.removeItem(key)
        }
      } catch (e) {
        console.error('Failed to remove store:', e)
      }
    }
  }
}))

export default pinia

// 导出所有 store
export * from './user'
export * from './party'
export * from './app'
