import { createPinia } from 'pinia'

const pinia = createPinia()

export default pinia

// Export all stores
export * from './modules/auth'
export * from './modules/user'
export * from './modules/dashboard'