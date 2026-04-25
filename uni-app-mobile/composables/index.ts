// 统一导出所有 composables
export * from './useAuth'
export * from './useParty'

// 默认导出
import useAuth from './useAuth'
import useParty from './useParty'

export default {
  useAuth,
  useParty
}
