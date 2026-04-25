import { defineStore } from 'pinia'

export const useThemeStore = defineStore('theme', {
  state: () => ({
    currentTheme: 'neon',
    isDark: false
  }),

  getters: {
    themeColor: (state) => {
      const colors = {
        neon: '#FF6B35',
        minimal: '#4A90E2',
        dark: '#BB86FC',
        vibrant: '#FF4081'
      }
      return colors[state.currentTheme] || colors.neon
    }
  },

  actions: {
    setTheme(theme) {
      this.currentTheme = theme
      this.isDark = theme === 'dark' || theme === 'neon'
      uni.$emit('themeChanged', theme)
    },

    toggleDarkMode() {
      this.isDark = !this.isDark
    }
  },

  persist: {
    key: 'juju-theme-store',
    storage: {
      getItem: (key) => uni.getStorageSync(key),
      setItem: (key, value) => uni.setStorageSync(key, value),
      removeItem: (key) => uni.removeStorageSync(key)
    }
  }
})
