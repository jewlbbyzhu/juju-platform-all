import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  // State
  const theme = ref<'light' | 'dark'>('light')
  const sidebarCollapsed = ref(false)

  // Actions
  const toggleTheme = () => {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
    document.documentElement.classList.toggle('dark', theme.value === 'dark')
  }

  const toggleSidebar = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  const setSidebarCollapsed = (collapsed: boolean) => {
    sidebarCollapsed.value = collapsed
  }

  return {
    // State
    theme,
    sidebarCollapsed,
    
    // Actions
    toggleTheme,
    toggleSidebar,
    setSidebarCollapsed,
  }
})