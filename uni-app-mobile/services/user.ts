import { get, post, put } from './api'
import type { UserInfo } from '@/stores/user'

// 用户相关 API
export const userApi = {
  // 登录
  login: (data: { phone: string; code: string }) => {
    return post<{ token: string; userInfo: UserInfo }>('/user/login', data)
  },

  // 获取用户信息
  getUserInfo: () => {
    return get<UserInfo>('/user/info')
  },

  // 更新用户信息
  updateUserInfo: (data: Partial<UserInfo>) => {
    return put<UserInfo>('/user/info', data)
  },

  // 上传头像
  uploadAvatar: (filePath: string) => {
    return post<{ url: string }>('/user/avatar', { filePath })
  },

  // 获取关注列表
  getFollowingList: (params?: { page?: number; limit?: number }) => {
    return get<{ list: UserInfo[]; total: number }>('/user/following', params)
  },

  // 获取粉丝列表
  getFansList: (params?: { page?: number; limit?: number }) => {
    return get<{ list: UserInfo[]; total: number }>('/user/fans', params)
  },

  // 关注用户
  followUser: (userId: number) => {
    return post('/user/follow', { userId })
  },

  // 取消关注
  unfollowUser: (userId: number) => {
    return post('/user/unfollow', { userId })
  },

  // 获取用户余额
  getBalance: () => {
    return get<{ balance: number }>('/user/balance')
  },

  // 充值
  recharge: (data: { amount: number; paymentMethod: string }) => {
    return post('/user/recharge', data)
  },

  // 获取积分
  getPoints: () => {
    return get<{ points: number }>('/user/points')
  }
}

export default userApi
