<template>
  <div class="admin-header">
    <!-- Left section -->
    <div class="header-left">
      <el-button
        :icon="sidebarCollapsed ? Expand : Fold"
        @click="toggleSidebar"
        text
        class="sidebar-toggle"
        size="large"
      />
      
      <!-- Breadcrumb -->
      <el-breadcrumb separator="/" class="breadcrumb">
        <el-breadcrumb-item 
          v-for="(item, index) in breadcrumbItems" 
          :key="item.path"
          :to="index < breadcrumbItems.length - 1 ? item.path : undefined"
        >
          {{ item.title }}
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <!-- Right section -->
    <div class="header-right">
      <!-- Search -->
      <div class="header-search desktop-only">
        <el-input
          v-model="searchQuery"
          placeholder="搜索..."
          :prefix-icon="Search"
          clearable
          class="search-input"
          @keyup.enter="handleSearch"
        />
      </div>

      <!-- Theme toggle -->
      <el-tooltip content="切换主题" placement="bottom">
        <el-button
          :icon="theme === 'dark' ? Sunny : Moon"
          @click="toggleTheme"
          text
          class="header-btn"
          size="large"
        />
      </el-tooltip>

      <!-- Fullscreen -->
      <el-tooltip content="全屏" placement="bottom">
        <el-button
          :icon="isFullscreen ? FullScreen : FullScreen"
          @click="toggleFullscreen"
          text
          class="header-btn desktop-only"
          size="large"
        />
      </el-tooltip>

      <!-- Notifications -->
      <el-tooltip content="通知" placement="bottom">
        <div class="notification-wrapper">
          <el-badge 
            :value="notificationCount" 
            :hidden="notificationCount === 0"
            :max="99"
            class="notification-badge"
          >
            <el-button
              :icon="Bell"
              text
              class="header-btn"
              size="large"
              @click="showNotifications"
            />
          </el-badge>
        </div>
      </el-tooltip>

      <!-- User Profile -->
      <UserProfile />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { Fold, Expand, Moon, Sunny, Bell, Search, FullScreen } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/modules/user'
import { menuConfig } from '@/config/menu'
import UserProfile from './UserProfile.vue'
import type { MenuItem } from '@/types/global'

const route = useRoute()
const userStore = useUserStore()

// Reactive data
const searchQuery = ref('')
const isFullscreen = ref(false)

// Computed properties
const sidebarCollapsed = computed(() => userStore.sidebarCollapsed)
const theme = computed(() => userStore.theme)

// Mock notification count - in real app this would come from a store
const notificationCount = computed(() => 3)

// Breadcrumb generation
const breadcrumbItems = computed(() => {
  const pathSegments = route.path.split('/').filter(Boolean)
  const items: Array<{ title: string; path: string }> = []
  
  let currentPath = ''
  
  for (const segment of pathSegments) {
    currentPath += `/${segment}`
    
    // Find menu item for this path
    const menuItem = findMenuItemByPath(menuConfig, currentPath)
    
    if (menuItem) {
      items.push({
        title: menuItem.title,
        path: currentPath
      })
    } else {
      // Fallback for dynamic routes
      items.push({
        title: segment.charAt(0).toUpperCase() + segment.slice(1),
        path: currentPath
      })
    }
  }
  
  return items
})

// Helper function to find menu item by path
const findMenuItemByPath = (menus: MenuItem[], path: string): MenuItem | null => {
  for (const menu of menus) {
    if (menu.path === path) {
      return menu
    }
    
    if (menu.children) {
      const found = findMenuItemByPath(menu.children, path)
      if (found) return found
    }
  }
  
  return null
}

// Actions
const toggleSidebar = () => {
  userStore.toggleSidebar()
}

const toggleTheme = () => {
  userStore.toggleTheme()
}

const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().then(() => {
      isFullscreen.value = true
    }).catch(() => {
      // Ignore error
    })
  } else {
    document.exitFullscreen().then(() => {
      isFullscreen.value = false
    }).catch(() => {
      // Ignore error
    })
  }
}

const showNotifications = () => {
  // TODO: Implement notifications panel
  console.log('Show notifications')
}

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    // TODO: Implement global search
    console.log('Search:', searchQuery.value)
  }
}
</script>

<style scoped>
.admin-header {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--spacing-5);
  background-color: var(--color-bg-surface);
}

.header-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
}

.sidebar-toggle {
  color: var(--color-text-secondary);
  transition: all var(--transition-fast);
}

.sidebar-toggle:hover {
  color: var(--color-brand);
  background-color: var(--color-primary-50);
}

.breadcrumb {
  font-size: var(--font-size-sm);
}

.breadcrumb :deep(.el-breadcrumb__item) {
  transition: all var(--transition-fast);
}

.breadcrumb :deep(.el-breadcrumb__inner) {
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-medium);
}

.breadcrumb :deep(.el-breadcrumb__inner.is-link:hover) {
  color: var(--color-brand);
}

.breadcrumb :deep(.el-breadcrumb__item:last-child .el-breadcrumb__inner) {
  color: var(--color-text-primary);
  font-weight: var(--font-weight-semibold);
}

.breadcrumb :deep(.el-breadcrumb__separator) {
  color: var(--color-text-tertiary);
}

.header-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.header-search {
  margin-right: var(--spacing-2);
}

.search-input {
  width: 200px;
  transition: width var(--transition-normal);
}

.search-input:focus-within {
  width: 280px;
}

.search-input :deep(.el-input__wrapper) {
  border-radius: var(--radius-full);
  background-color: var(--color-gray-100);
  box-shadow: none;
  transition: all var(--transition-fast);
}

.search-input :deep(.el-input__wrapper:hover) {
  background-color: var(--color-gray-200);
}

.search-input :deep(.el-input__wrapper.is-focus) {
  background-color: var(--color-bg-surface);
  box-shadow: 0 0 0 2px var(--color-primary-100);
}

.dark .search-input :deep(.el-input__wrapper) {
  background-color: var(--color-gray-800);
}

.dark .search-input :deep(.el-input__wrapper:hover) {
  background-color: var(--color-gray-700);
}

.dark .search-input :deep(.el-input__wrapper.is-focus) {
  background-color: var(--color-gray-800);
}

.header-btn {
  color: var(--color-text-secondary);
  transition: all var(--transition-fast);
}

.header-btn:hover {
  color: var(--color-brand);
  background-color: var(--color-primary-50);
}

.dark .header-btn:hover {
  background-color: rgba(240, 78, 12, 0.1);
}

.notification-wrapper {
  position: relative;
}

.notification-badge :deep(.el-badge__content) {
  background-color: var(--color-error-500);
  border: none;
  font-size: 10px;
  height: 16px;
  line-height: 16px;
  padding: 0 5px;
  border-radius: var(--radius-full);
}

/* Responsive design */
@media (max-width: 768px) {
  .admin-header {
    padding: 0 var(--spacing-3);
  }
  
  .header-left {
    gap: var(--spacing-2);
  }
  
  .breadcrumb {
    display: none;
  }
  
  .header-right {
    gap: var(--spacing-1);
  }
}

@media (max-width: 1024px) {
  .desktop-only {
    display: none !important;
  }
}
</style>
