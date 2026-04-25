<template>
  <div class="sidebar-menu">
    <!-- Logo Section -->
    <div class="logo-section" :class="{ collapsed: collapsed }">
      <div class="logo">
        <div class="logo-icon">
          <el-icon size="28" color="var(--color-brand)">
            <House />
          </el-icon>
        </div>
        <h2 v-show="!collapsed" class="logo-text">聚聚后台</h2>
      </div>
    </div>

    <!-- Menu Section -->
    <div class="menu-section">
      <el-scrollbar class="menu-scrollbar">
        <el-menu
          :default-active="activeMenu"
          :collapse="collapsed"
          :unique-opened="true"
          router
          class="sidebar-menu-el"
          :collapse-transition="false"
        >
          <template v-for="item in visibleMenus" :key="item.id">
            <!-- Menu item with children -->
            <el-sub-menu 
              v-if="item.children && item.children.length > 0" 
              :index="item.path"
              class="menu-item"
            >
              <template #title>
                <el-icon v-if="item.icon" class="menu-icon">
                  <component :is="getIconComponent(item.icon)" />
                </el-icon>
                <span class="menu-title">{{ item.title }}</span>
              </template>
              
              <el-menu-item
                v-for="child in item.children"
                :key="child.id"
                :index="child.path"
                class="sub-menu-item"
              >
                <el-icon v-if="child.icon" class="menu-icon">
                  <component :is="getIconComponent(child.icon)" />
                </el-icon>
                <span class="menu-title">{{ child.title }}</span>
              </el-menu-item>
            </el-sub-menu>

            <!-- Single menu item -->
            <el-menu-item 
              v-else 
              :index="item.path"
              class="menu-item"
            >
              <el-icon v-if="item.icon" class="menu-icon">
                <component :is="getIconComponent(item.icon)" />
              </el-icon>
              <span class="menu-title">{{ item.title }}</span>
            </el-menu-item>
          </template>
        </el-menu>
      </el-scrollbar>
    </div>

    <!-- Collapse Toggle (for desktop) -->
    <div class="collapse-toggle" v-if="!isMobile">
      <el-button
        :icon="collapsed ? Expand : Fold"
        @click="toggleCollapse"
        text
        class="toggle-btn"
        size="small"
      >
        <span v-show="!collapsed" class="toggle-text">收起菜单</span>
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Component } from 'vue'
import { useRoute } from 'vue-router'
import { 
  House, 
  User, 
  Calendar, 
  ShoppingCart, 
  Money, 
  Document, 
  TrendCharts, 
  Setting, 
  Phone,
  Fold,
  Expand
} from '@element-plus/icons-vue'
import { markRaw } from 'vue'
import { usePermission } from '@/composables/usePermission'
import { useUserStore } from '@/stores/modules/user'
import { menuConfig } from '@/config/menu'
import type { MenuItem } from '@/types/global'

interface Props {
  collapsed?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  collapsed: false
})

const route = useRoute()
const userStore = useUserStore()
const { getVisibleMenus } = usePermission()

// Icon mapping
const iconComponents: Record<string, any> = {
  House,
  User,
  Calendar,
  ShoppingCart,
  Money,
  Document,
  TrendCharts,
  Setting,
  Phone
}

const getIconComponent = (iconName: string): any => {
  return markRaw(iconComponents[iconName] || House)
}

// Computed properties
const activeMenu = computed(() => route.path)

const visibleMenus = computed(() => {
  return getVisibleMenus(menuConfig as any[]) as MenuItem[]
})

const isMobile = computed(() => {
  return window.innerWidth < 768
})

// Methods
const toggleCollapse = () => {
  userStore.toggleSidebar()
}
</script>

<style scoped>
.sidebar-menu {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--color-bg-surface);
}

.logo-section {
  height: var(--header-height);
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid var(--color-border-light);
  padding: 0 var(--spacing-4);
  transition: all var(--transition-normal);
  flex-shrink: 0;
}

.logo-section.collapsed {
  padding: 0 var(--spacing-2);
}

.logo {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  width: 100%;
  justify-content: center;
}

.logo-section.collapsed .logo {
  justify-content: center;
}

.logo-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-lg);
  background-color: var(--color-primary-50);
  transition: all var(--transition-fast);
}

.dark .logo-icon {
  background-color: rgba(240, 78, 12, 0.15);
}

.logo-text {
  color: var(--color-text-primary);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  margin: 0;
  white-space: nowrap;
  transition: opacity var(--transition-normal);
  letter-spacing: -0.5px;
}

.menu-section {
  flex: 1;
  overflow: hidden;
  padding: var(--spacing-2) 0;
}

.menu-scrollbar {
  height: 100%;
}

.sidebar-menu-el {
  border: none;
  height: 100%;
  background-color: transparent;
  padding: 0 var(--spacing-2);
}

.menu-item {
  margin: var(--spacing-1) 0;
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
}

.menu-item:hover {
  background-color: var(--color-gray-100) !important;
}

.menu-item.is-active {
  background-color: var(--color-primary-50) !important;
  color: var(--color-brand) !important;
}

.menu-item.is-active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 20px;
  background-color: var(--color-brand);
  border-radius: 0 var(--radius-full) var(--radius-full) 0;
}

.dark .menu-item:hover {
  background-color: var(--color-gray-800) !important;
}

.dark .menu-item.is-active {
  background-color: rgba(240, 78, 12, 0.15) !important;
}

.sub-menu-item {
  margin: var(--spacing-1) 0;
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
}

.sub-menu-item:hover {
  background-color: var(--color-gray-100) !important;
}

.sub-menu-item.is-active {
  background-color: var(--color-primary-50) !important;
  color: var(--color-brand) !important;
}

.dark .sub-menu-item:hover {
  background-color: var(--color-gray-800) !important;
}

.dark .sub-menu-item.is-active {
  background-color: rgba(240, 78, 12, 0.15) !important;
}

.menu-icon {
  font-size: 18px;
  transition: all var(--transition-fast);
}

.menu-title {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  transition: all var(--transition-fast);
}

/* Collapse Toggle */
.collapse-toggle {
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-top: 1px solid var(--color-border-light);
  flex-shrink: 0;
  padding: 0 var(--spacing-3);
}

.toggle-btn {
  color: var(--color-text-tertiary);
  width: 100%;
  height: 36px;
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-2);
}

.toggle-btn:hover {
  color: var(--color-brand);
  background-color: var(--color-primary-50);
}

.toggle-text {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

/* Menu item styling overrides */
:deep(.el-menu-item) {
  height: 44px;
  line-height: 44px;
  margin: var(--spacing-1) 0;
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
  position: relative;
}

:deep(.el-menu-item:hover) {
  background-color: var(--color-gray-100) !important;
}

:deep(.el-menu-item.is-active) {
  background-color: var(--color-primary-50) !important;
  color: var(--color-brand) !important;
}

:deep(.el-sub-menu__title) {
  height: 44px;
  line-height: 44px;
  margin: var(--spacing-1) 0;
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
}

:deep(.el-sub-menu__title:hover) {
  background-color: var(--color-gray-100) !important;
}

:deep(.el-sub-menu.is-active > .el-sub-menu__title) {
  color: var(--color-brand) !important;
}

/* Collapsed state adjustments */
:deep(.el-menu--collapse) {
  width: 72px;
}

:deep(.el-menu--collapse .el-menu-item) {
  margin: var(--spacing-1) 0;
  width: 48px;
  text-align: center;
  padding: 0 !important;
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.el-menu--collapse .el-sub-menu__title) {
  margin: var(--spacing-1) 0;
  width: 48px;
  text-align: center;
  padding: 0 !important;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Tooltip for collapsed menu items */
:deep(.el-menu--collapse .el-tooltip__trigger) {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Animation for menu expansion */
:deep(.el-menu-item span),
:deep(.el-sub-menu__title span) {
  transition: opacity var(--transition-normal);
}

:deep(.el-menu--collapse .el-menu-item span),
:deep(.el-menu--collapse .el-sub-menu__title span) {
  opacity: 0;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .collapse-toggle {
    display: none;
  }
  
  .logo-section {
    padding: 0 var(--spacing-3);
  }
  
  .menu-item,
  :deep(.el-menu-item),
  :deep(.el-sub-menu__title) {
    margin: var(--spacing-1) 0;
  }
}

/* Scrollbar styling */
:deep(.el-scrollbar__bar) {
  opacity: 0.3;
}

:deep(.el-scrollbar__bar:hover) {
  opacity: 0.5;
}
</style>
