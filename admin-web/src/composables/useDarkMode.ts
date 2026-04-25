import { ref, computed, watch, onMounted } from 'vue'

/**
 * 主题模式
 */
export type ThemeMode = 'light' | 'dark' | 'auto'

/**
 * 暗黑模式Hook
 */
export function useDarkMode() {
  const STORAGE_KEY = 'theme-mode'
  
  // 当前主题模式
  const mode = ref<ThemeMode>('auto')
  
  // 系统是否为暗黑模式
  const systemDark = ref(false)
  
  // 实际是否为暗黑模式
  const isDark = computed(() => {
    if (mode.value === 'auto') {
      return systemDark.value
    }
    return mode.value === 'dark'
  })

  /**
   * 检测系统主题
   */
  const detectSystemTheme = () => {
    if (window.matchMedia) {
      const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)')
      systemDark.value = darkModeQuery.matches
      
      // 监听系统主题变化
      darkModeQuery.addEventListener('change', (e) => {
        systemDark.value = e.matches
      })
    }
  }

  /**
   * 应用主题
   */
  const applyTheme = (dark: boolean) => {
    if (dark) {
      document.documentElement.classList.add('dark')
      document.documentElement.setAttribute('data-theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      document.documentElement.setAttribute('data-theme', 'light')
    }
  }

  /**
   * 设置主题模式
   */
  const setMode = (newMode: ThemeMode) => {
    mode.value = newMode
    localStorage.setItem(STORAGE_KEY, newMode)
  }

  /**
   * 切换暗黑模式
   */
  const toggle = () => {
    if (mode.value === 'light') {
      setMode('dark')
    } else if (mode.value === 'dark') {
      setMode('auto')
    } else {
      setMode('light')
    }
  }

  /**
   * 启用暗黑模式
   */
  const enable = () => {
    setMode('dark')
  }

  /**
   * 禁用暗黑模式
   */
  const disable = () => {
    setMode('light')
  }

  /**
   * 使用系统主题
   */
  const useSystem = () => {
    setMode('auto')
  }

  /**
   * 从本地存储加载主题
   */
  const loadTheme = () => {
    const savedMode = localStorage.getItem(STORAGE_KEY) as ThemeMode
    if (savedMode && ['light', 'dark', 'auto'].includes(savedMode)) {
      mode.value = savedMode
    }
  }

  // 监听isDark变化，应用主题
  watch(isDark, (dark) => {
    applyTheme(dark)
  }, { immediate: true })

  onMounted(() => {
    detectSystemTheme()
    loadTheme()
  })

  return {
    mode: computed(() => mode.value),
    isDark,
    systemDark: computed(() => systemDark.value),
    setMode,
    toggle,
    enable,
    disable,
    useSystem,
  }
}

/**
 * 全局暗黑模式管理器
 */
class DarkModeManager {
  private mode: ThemeMode = 'auto'
  private systemDark = false
  private listeners: Array<(isDark: boolean) => void> = []

  constructor() {
    this.init()
  }

  /**
   * 初始化
   */
  private init() {
    // 检测系统主题
    if (window.matchMedia) {
      const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)')
      this.systemDark = darkModeQuery.matches
      
      darkModeQuery.addEventListener('change', (e) => {
        this.systemDark = e.matches
        this.applyTheme()
      })
    }

    // 加载保存的主题
    const savedMode = localStorage.getItem('theme-mode') as ThemeMode
    if (savedMode && ['light', 'dark', 'auto'].includes(savedMode)) {
      this.mode = savedMode
    }

    // 应用主题
    this.applyTheme()
  }

  /**
   * 获取当前是否为暗黑模式
   */
  get isDark(): boolean {
    if (this.mode === 'auto') {
      return this.systemDark
    }
    return this.mode === 'dark'
  }

  /**
   * 获取当前模式
   */
  getMode(): ThemeMode {
    return this.mode
  }

  /**
   * 设置模式
   */
  setMode(mode: ThemeMode) {
    this.mode = mode
    localStorage.setItem('theme-mode', mode)
    this.applyTheme()
  }

  /**
   * 切换模式
   */
  toggle() {
    if (this.mode === 'light') {
      this.setMode('dark')
    } else if (this.mode === 'dark') {
      this.setMode('auto')
    } else {
      this.setMode('light')
    }
  }

  /**
   * 应用主题
   */
  private applyTheme() {
    const isDark = this.isDark
    
    if (isDark) {
      document.documentElement.classList.add('dark')
      document.documentElement.setAttribute('data-theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      document.documentElement.setAttribute('data-theme', 'light')
    }

    // 通知监听器
    this.listeners.forEach(listener => listener(isDark))
  }

  /**
   * 添加监听器
   */
  addListener(listener: (isDark: boolean) => void) {
    this.listeners.push(listener)
  }

  /**
   * 移除监听器
   */
  removeListener(listener: (isDark: boolean) => void) {
    const index = this.listeners.indexOf(listener)
    if (index > -1) {
      this.listeners.splice(index, 1)
    }
  }
}

// 导出单例
export const darkModeManager = new DarkModeManager()
