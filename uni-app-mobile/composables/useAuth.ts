import { ref, computed } from 'vue'
import { useUserStore } from '@/stores/user'
import { userApi } from '../services/user'

// 认证相关的组合式函数
export function useAuth() {
  const userStore = useUserStore()
  
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  // 是否已登录
  const isLoggedIn = computed(() => userStore.isLoggedIn)
  
  // 登录
  const login = async (phone: string, code: string) => {
    loading.value = true
    error.value = null
    
    try {
      const res = await userApi.login({ phone, code })
      userStore.setToken(res.token)
      userStore.setUserInfo(res.userInfo)
      return true
    } catch (err: any) {
      error.value = err.message || '登录失败'
      return false
    } finally {
      loading.value = false
    }
  }
  
  // 登出
  const logout = () => {
    userStore.clearUserInfo()
    uni.showToast({
      title: '已退出登录',
      icon: 'success'
    })
  }
  
  // 获取用户信息
  const fetchUserInfo = async () => {
    if (!isLoggedIn.value) return
    
    try {
      const userInfo = await userApi.getUserInfo()
      userStore.setUserInfo(userInfo)
    } catch (err: any) {
      // 获取用户信息失败，可能是token过期
      if (err.code === 401) {
        userStore.clearUserInfo()
      }
    }
  }
  
  // 更新用户信息
  const updateUserInfo = async (data: Parameters<typeof userApi.updateUserInfo>[0]) => {
    loading.value = true
    
    try {
      const userInfo = await userApi.updateUserInfo(data)
      userStore.setUserInfo(userInfo)
      uni.showToast({
        title: '更新成功',
        icon: 'success'
      })
      return true
    } catch (err: any) {
      uni.showToast({
        title: err.message || '更新失败',
        icon: 'none'
      })
      return false
    } finally {
      loading.value = false
    }
  }
  
  return {
    loading,
    error,
    isLoggedIn,
    login,
    logout,
    fetchUserInfo,
    updateUserInfo
  }
}

export default useAuth
