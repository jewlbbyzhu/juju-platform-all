import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// 应用配置
export interface AppConfig {
  theme: 'dark' | 'light'
  language: string
  fontSize: 'small' | 'medium' | 'large'
  notificationEnabled: boolean
  soundEnabled: boolean
  vibrationEnabled: boolean
}

// 应用状态
export const useAppStore = defineStore('app', () => {
  // State
  const config = ref<AppConfig>({
    theme: 'dark',
    language: 'zh-CN',
    fontSize: 'medium',
    notificationEnabled: true,
    soundEnabled: true,
    vibrationEnabled: true
  })
  
  const isLoading = ref(false)
  const loadingText = ref('加载中...')
  const networkStatus = ref<'online' | 'offline'>('online')
  const systemInfo = ref<Record<string, any> | null>(null)

  // Getters
  const getConfig = computed(() => config.value)
  const getTheme = computed(() => config.value.theme)
  const getLanguage = computed(() => config.value.language)
  const getIsLoading = computed(() => isLoading.value)
  const getNetworkStatus = computed(() => networkStatus.value)
  const getSystemInfo = computed(() => systemInfo.value)

  // Actions
  const setConfig = (newConfig: Partial<AppConfig>) => {
    config.value = { ...config.value, ...newConfig }
    // 持久化存储
    uni.setStorageSync('appConfig', config.value)
  }

  const setTheme = (theme: 'dark' | 'light') => {
    config.value.theme = theme
    uni.setStorageSync('appConfig', config.value)
  }

  const setLanguage = (language: string) => {
    config.value.language = language
    uni.setStorageSync('appConfig', config.value)
  }

  const setFontSize = (size: 'small' | 'medium' | 'large') => {
    config.value.fontSize = size
    uni.setStorageSync('appConfig', config.value)
  }

  const toggleNotification = () => {
    config.value.notificationEnabled = !config.value.notificationEnabled
    uni.setStorageSync('appConfig', config.value)
  }

  const toggleSound = () => {
    config.value.soundEnabled = !config.value.soundEnabled
    uni.setStorageSync('appConfig', config.value)
  }

  const toggleVibration = () => {
    config.value.vibrationEnabled = !config.value.vibrationEnabled
    uni.setStorageSync('appConfig', config.value)
  }

  const showLoading = (text?: string) => {
    isLoading.value = true
    if (text) {
      loadingText.value = text
    }
    uni.showLoading({
      title: loadingText.value,
      mask: true
    })
  }

  const hideLoading = () => {
    isLoading.value = false
    uni.hideLoading()
  }

  const setNetworkStatus = (status: 'online' | 'offline') => {
    networkStatus.value = status
  }

  const initSystemInfo = async () => {
    try {
      const info = await uni.getSystemInfo()
      systemInfo.value = info
    } catch (error) {
      console.error('获取系统信息失败:', error)
    }
  }

  // 初始化配置
  const initFromStorage = () => {
    const storedConfig = uni.getStorageSync('appConfig')
    if (storedConfig) {
      config.value = { ...config.value, ...storedConfig }
    }
  }

  // 监听网络状态
  const startNetworkListener = () => {
    uni.onNetworkStatusChange((res) => {
      networkStatus.value = res.isConnected ? 'online' : 'offline'
    })
  }

  return {
    // State
    config,
    isLoading,
    loadingText,
    networkStatus,
    systemInfo,
    // Getters
    getConfig,
    getTheme,
    getLanguage,
    getIsLoading,
    getNetworkStatus,
    getSystemInfo,
    // Actions
    setConfig,
    setTheme,
    setLanguage,
    setFontSize,
    toggleNotification,
    toggleSound,
    toggleVibration,
    showLoading,
    hideLoading,
    setNetworkStatus,
    initSystemInfo,
    initFromStorage,
    startNetworkListener
  }
})
