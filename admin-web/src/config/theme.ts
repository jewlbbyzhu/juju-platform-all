/**
 * Element Plus 主题配置 - 专业级后台UI
 * 基于设计令牌统一配置Element Plus组件样式
 */

import type { ConfigProviderProps } from 'element-plus'
import { ref } from 'vue'

/**
 * Element Plus 主题配置
 */
export const elementPlusTheme: ConfigProviderProps = {
  // 主题色配置 - 活力橙
  namespace: 'el',
  zIndex: 2000,
  size: 'default',
  button: {
    autoInsertSpace: false,
  },
}

/**
 * 尺寸配置
 */
export const sizeConfig = {
  // 间距配置
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  // 圆角配置
  borderRadius: {
    none: 0,
    sm: 4,
    md: 6,
    lg: 8,
    xl: 12,
    full: 9999,
  },
  // 阴影配置
  boxShadow: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
  },
}

/**
 * 表单配置
 */
export const formConfig = {
  // 标签位置
  labelPosition: 'right',
  // 标签宽度
  labelWidth: '100px',
  // 表单尺寸
  size: 'default',
  // 必填标记位置
  requireAsteriskPosition: 'right',
}

/**
 * 表格配置
 */
export const tableConfig = {
  // 默认分页大小
  defaultPageSize: 20,
  // 分页选项
  pageSizes: [10, 20, 50, 100],
  // 分页布局
  paginationLayout: 'total, sizes, prev, pager, next, jumper',
  // 是否显示斑马纹
  stripe: true,
  // 是否显示边框
  border: true,
  // 操作列宽度
  actionsWidth: 200,
}

/**
 * 消息配置
 */
export const messageConfig = {
  // 消息显示时长
  duration: 3000,
  // 是否显示关闭按钮
  showClose: true,
  // 是否分组
  grouping: true,
  // 偏移量
  offset: 16,
  // 位置
  position: 'top-right',
}

/**
 * 对话框配置
 */
export const dialogConfig = {
  // 是否显示关闭按钮
  showClose: true,
  // 是否可以通过点击遮罩层关闭
  closeOnClickModal: true,
  // 是否可以通过按ESC关闭
  closeOnPressEscape: true,
  // 是否显示全屏按钮
  draggable: false,
  // 是否居中
  alignCenter: false,
}

/**
 * 按钮配置
 */
export const buttonConfig = {
  // 默认类型
  type: 'default',
  // 默认尺寸
  size: 'default',
  // 是否朴素
  plain: false,
  // 是否文字按钮
  text: false,
  // 是否圆角
  round: false,
  // 是否圆形
  circle: false,
}

/**
 * 标签配置
 */
export const tagConfig = {
  // 默认类型
  type: 'info',
  // 是否可关闭
  closable: false,
  // 是否禁用渐变
  disableTransitions: false,
  // 尺寸
  size: 'default',
  // 是否镂空
  effect: 'light',
}

/**
 * 当前主题状态
 */
export const currentTheme = ref({
  primary: '#F04E0C',
  secondary: '#3F51B5',
  success: '#4CAF50',
  warning: '#FFC107',
  error: '#F44336',
  info: '#2196F3',
})

/**
 * 状态标签颜色映射
 */
export const statusTagColors: Record<string, { type: string; color?: string }> = {
  // 用户状态
  active: { type: 'success' },
  disabled: { type: 'info' },
  locked: { type: 'danger' },
  // 订单状态
  pending: { type: 'warning' },
  paid: { type: 'success' },
  refunded: { type: 'info' },
  cancelled: { type: 'danger' },
  // 聚会状态
  draft: { type: 'info' },
  pending_audit: { type: 'warning' },
  approved: { type: 'success' },
  rejected: { type: 'danger' },
  published: { type: 'primary' },
  ended: { type: 'info' },
  // 支付状态
  unpaid: { type: 'warning' },
  processing: { type: 'primary' },
  completed: { type: 'success' },
  failed: { type: 'danger' },
  // 通用状态
  enabled: { type: 'success' },
  normal: { type: 'success' },
  abnormal: { type: 'danger' },
}

/**
 * 角色标签映射
 */
export const roleTagColors: Record<string, { type: string; text: string }> = {
  super_admin: { type: 'danger', text: '超级管理员' },
  operation_admin: { type: 'warning', text: '运营管理员' },
  finance_admin: { type: 'success', text: '财务管理员' },
  customer_service: { type: 'info', text: '客服' },
  developer: { type: 'primary', text: '开发者' },
  content_admin: { type: 'info', text: '内容管理员' },
}

/**
 * 获取状态标签配置
 */
export const getStatusTagConfig = (status: string): { type: string; color?: string } => {
  return statusTagColors[status] || { type: 'info' }
}

/**
 * 获取角色标签配置
 */
export const getRoleTagConfig = (role: string): { type: string; text: string } => {
  return roleTagColors[role] || { type: 'info', text: role }
}

export default {
  elementPlusTheme,
  sizeConfig,
  formConfig,
  tableConfig,
  messageConfig,
  dialogConfig,
  buttonConfig,
  tagConfig,
  currentTheme,
  statusTagColors,
  roleTagColors,
  getStatusTagConfig,
  getRoleTagConfig,
}