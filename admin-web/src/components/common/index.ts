/**
 * Common Components Export
 * 通用组件统一导出
 */

// 基础组件
export { default as AdminHeader } from './AdminHeader.vue'
export { default as SidebarMenu } from './SidebarMenu.vue'
export { default as UserProfile } from './UserProfile.vue'
export { default as PermissionGuard } from './PermissionGuard.vue'

// 数据展示组件
export { default as DataTable } from './DataTable.vue'
export { default as DataTableEnhanced } from './DataTableEnhanced.vue'
export type { TableColumnEnhanced, TableActionEnhanced } from './DataTableEnhanced.vue'

// 表单组件
export { default as EnhancedForm } from './EnhancedForm.vue'
export type { FormField } from './EnhancedForm.vue'

// 重新导出类型
export type * from './DataTableEnhanced.vue'
export type * from './EnhancedForm.vue'
