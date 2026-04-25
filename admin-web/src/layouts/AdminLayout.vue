<template>
  <div class="admin-layout" :class="{ 'mobile-layout': isMobile, 'dark': isDark }">
    <el-container class="layout-container">
      <!-- Mobile Overlay -->
      <div 
        v-if="isMobile && !sidebarCollapsed" 
        class="mobile-overlay"
        @click="closeMobileSidebar"
      ></div>

      <!-- Sidebar -->
      <el-aside 
        :width="sidebarWidth" 
        class="sidebar"
        :class="{ 
          'sidebar-collapsed': sidebarCollapsed,
          'sidebar-mobile': isMobile,
          'sidebar-mobile-open': isMobile && !sidebarCollapsed
        }"
      >
        <SidebarMenu :collapsed="sidebarCollapsed" />
      </el-aside>

      <!-- Main content -->
      <el-container class="main-container">
        <!-- Header -->
        <el-header class="header">
          <AdminHeader />
        </el-header>

        <!-- Main -->
        <el-main class="main">
          <div class="main-content">
            <router-view v-slot="{ Component }">
              <transition name="page" mode="out-in">
                <component :is="Component" />
              </transition>
            </router-view>
          </div>
        </el-main>

        <!-- Footer -->
        <el-footer class="footer" v-if="!isMobile">
          <div class="footer-content">
            <span>© 2024 聚聚管理后台. All rights reserved.</span>
            <span>Version 1.0.0</span>
          </div>
        </el-footer>
      </el-container>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useUserStore } from '@/stores/modules/user'
import SidebarMenu from '@/components/common/SidebarMenu.vue'
import AdminHeader from '@/components/common/AdminHeader.vue'

const userStore = useUserStore()

// Reactive data
const windowWidth = ref(window.innerWidth)

// Computed properties
const sidebarCollapsed = computed(() => userStore.sidebarCollapsed)
const isMobile = computed(() => windowWidth.value < 768)
const isDark = computed(() => userStore.theme === 'dark')

const sidebarWidth = computed(() => {
  if (isMobile.value) {
    return sidebarCollapsed.value ? '0px' : '260px'
  }
  return sidebarCollapsed.value ? '72px' : '260px'
})

// Watch for theme changes
watch(() => userStore.theme, (newTheme) => {
  if (newTheme === 'dark') {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}, { immediate: true })

// Methods
const handleResize = () => {
  windowWidth.value = window.innerWidth
  
  // Auto-collapse sidebar on mobile
  if (windowWidth.value < 768 && !sidebarCollapsed.value) {
    userStore.setSidebarCollapsed(true)
  }
}

const closeMobileSidebar = () => {
  if (isMobile.value) {
    userStore.setSidebarCollapsed(true)
  }
}

// Lifecycle
onMounted(() => {
  window.addEventListener('resize', handleResize)
  
  // Initialize mobile state
  if (window.innerWidth < 768) {
    userStore.setSidebarCollapsed(true)
  }
  
  // Initialize theme
  if (userStore.theme === 'dark') {
    document.documentElement.classList.add('dark')
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.admin-layout {
  height: 100vh;
  overflow: hidden;
  background-color: var(--color-bg-base);
}

.layout-container {
  height: 100%;
}

/* Mobile Overlay */
.mobile-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  transition: opacity 0.3s ease;
  backdrop-filter: blur(4px);
}

/* Sidebar Styles */
.sidebar {
  background-color: var(--color-bg-surface);
  border-right: 1px solid var(--color-border-light);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  z-index: 1001;
  box-shadow: var(--shadow-sm);
}

.sidebar-collapsed {
  width: 72px !important;
}

.sidebar-mobile {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  z-index: 1001;
  transform: translateX(-100%);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.sidebar-mobile-open {
  transform: translateX(0);
}

/* Main Container */
.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.mobile-layout .main-container {
  margin-left: 0 !important;
}

/* Header Styles */
.header {
  height: var(--header-height);
  background-color: var(--color-bg-surface);
  border-bottom: 1px solid var(--color-border-light);
  padding: 0;
  z-index: 999;
  position: relative;
  box-shadow: var(--shadow-sm);
}

/* Main Content */
.main {
  background-color: var(--color-bg-base);
  padding: 0;
  flex: 1;
  overflow: hidden;
}

.main-content {
  height: 100%;
  padding: var(--spacing-5);
  overflow-y: auto;
  overflow-x: hidden;
}

/* Footer */
.footer {
  height: var(--footer-height);
  background-color: var(--color-bg-surface);
  border-top: 1px solid var(--color-border-light);
  padding: 0;
  display: flex;
  align-items: center;
}

.footer-content {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 var(--spacing-5);
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
}

/* Page Transition */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Responsive Design */
@media (max-width: 768px) {
  .main-content {
    padding: var(--spacing-3);
  }
  
  .footer-content {
    padding: 0 var(--spacing-3);
    flex-direction: column;
    gap: var(--spacing-1);
  }
}

/* Scrollbar styling for main content */
.main-content::-webkit-scrollbar {
  width: 6px;
}

.main-content::-webkit-scrollbar-track {
  background: transparent;
}

.main-content::-webkit-scrollbar-thumb {
  background: var(--color-border-default);
  border-radius: var(--radius-full);
}

.main-content::-webkit-scrollbar-thumb:hover {
  background: var(--color-border-strong);
}
</style>
