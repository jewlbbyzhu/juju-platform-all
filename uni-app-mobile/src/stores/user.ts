import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// 用户信息类型
export interface UserInfo {
  id: number
  nickname: string
  avatar: string
  phone: string
  bio: string
  is_vip: boolean
  vip_level: number
  vip_expire_time: string
  following_count: number
  followers_count: number
  created_count: number
  participated_count: number
  balance: number
  points: number
}

// 用户状态
export const useUserStore = defineStore('user', () => {
  // State
  const userInfo = ref<UserInfo | null>(null)
  const token = ref<string>('')
  const isLoggedIn = computed(() => !!token.value && !!userInfo.value)

  // Getters
  const getUserInfo = computed(() => userInfo.value)
  const getToken = computed(() => token.value)
  const getIsVip = computed(() => userInfo.value?.is_vip || false)
  const getVipLevel = computed(() => userInfo.value?.vip_level || 0)
  const getBalance = computed(() => userInfo.value?.balance || 0)

  // Actions
  const setUserInfo = (info: UserInfo) => {
    userInfo.value = info
  }

  const setToken = (newToken: string) => {
    token.value = newToken
  }

  const clearUserInfo = () => {
    userInfo.value = null
    token.value = ''
  }

  // 更新用户信息字段
  const updateUserField = <K extends keyof UserInfo>(field: K, value: UserInfo[K]) => {
    if (userInfo.value) {
      userInfo.value[field] = value
    }
  }

  // 增加余额
  const addBalance = (amount: number) => {
    if (userInfo.value) {
      userInfo.value.balance += amount
    }
  }

  // 减少余额
  const deductBalance = (amount: number) => {
    if (userInfo.value && userInfo.value.balance >= amount) {
      userInfo.value.balance -= amount
      return true
    }
    return false
  }

  // 增加积分
  const addPoints = (points: number) => {
    if (userInfo.value) {
      userInfo.value.points += points
    }
  }

  return {
    // State
    userInfo,
    token,
    isLoggedIn,
    // Getters
    getUserInfo,
    getToken,
    getIsVip,
    getVipLevel,
    getBalance,
    // Actions
    setUserInfo,
    setToken,
    clearUserInfo,
    updateUserField,
    addBalance,
    deductBalance,
    addPoints
  }
}, {
  // 使用 pinia-plugin-persistedstate 进行持久化
  persist: {
    key: 'juju-user-store',
    storage: {
      getItem: (key: string) => {
        try {
          return uni.getStorageSync(key)
        } catch (e) {
          return null
        }
      },
      setItem: (key: string, value: string) => {
        try {
          uni.setStorageSync(key, value)
        } catch (e) {
          console.error('Failed to persist user store:', e)
        }
      },
      removeItem: (key: string) => {
        try {
          uni.removeStorageSync(key)
        } catch (e) {
          console.error('Failed to remove user store:', e)
        }
      }
    },
    paths: ['userInfo', 'token']
  }
})
