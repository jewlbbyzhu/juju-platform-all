// 统一导出所有服务
export * from './api'
export * from './user'
export * from './party'

// 默认导出
import api from './api'
import userApi from './user'
import partyApi from './party'

export default {
  api,
  user: userApi,
  party: partyApi
}
