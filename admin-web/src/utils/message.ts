
import { ElMessage, ElMessageBox, ElNotification } from 'element-plus'
import type { MessageOptions, MessageBoxOptions } from 'element-plus'

/**
 * 消息提示配置
 */
const defaultMessageConfig = {
  duration: 3000,
  showClose: true,
  grouping: true,
  offset: 16,
}

/**
 * 确认对话框配置
 */
const defaultConfirmConfig = {
  confirmButtonText: '确定',
  cancelButtonText: '取消',
  closeOnClickModal: false,
  closeOnPressEscape: false,
  draggable: false,
}

/**
 * 消息类型定义
 */
type MessageType = 'success' | 'warning' | 'error' | 'info'
type NotificationType = 'success' | 'warning' | 'error' | 'info'
type ConfirmType = 'warning' | 'error' | 'info' | 'success'

/**
 * 显示消息提示
 */
export const showMessage = (
  message: string,
  type: MessageType = 'info',
  options?: Partial<MessageOptions>
) => {
  return ElMessage({
    message,
    type,
    ...defaultMessageConfig,
    ...options,
  })
}

/**
 * 显示成功消息
 */
export const showSuccess = (message: string, options?: Partial<MessageOptions>) => {
  return showMessage(message, 'success', options)
}

/**
 * 显示警告消息
 */
export const showWarning = (message: string, options?: Partial<MessageOptions>) => {
  return showMessage(message, 'warning', options)
}

/**
 * 显示错误消息
 */
export const showError = (message: string, options?: Partial<MessageOptions>) => {
  return showMessage(message, 'error', {
    duration: 5000,
    ...options,
  })
}

/**
 * 显示通知
 */
export const showNotification = (
  title: string,
  message: string,
  type: NotificationType = 'info',
  options?: Record<string, any>
) => {
  return ElNotification({
    title,
    message,
    type,
    position: 'top-right',
    duration: 4500,
    showClose: true,
    ...options,
  })
}

/**
 * 确认对话框
 */
export const showConfirm = (
  message: string,
  title: string = '确认操作',
  type: ConfirmType = 'warning',
  options?: Partial<MessageBoxOptions>
): Promise<void> => {
  return new Promise((resolve, reject) => {
    ElMessageBox.confirm(message, title, {
      ...defaultConfirmConfig,
      type,
      ...options,
    })
      .then(() => resolve())
      .catch(() => reject())
  })
}

/**
 * 删除确认对话框
 */
export const showDeleteConfirm = (
  itemName: string = '该记录',
  options?: Partial<MessageBoxOptions>
): Promise<void> => {
  return showConfirm(
    `确定要删除${itemName}吗？删除后无法恢复，请谨慎操作。`,
    '删除确认',
    'error',
    {
      confirmButtonText: '删除',
      confirmButtonClass: 'el-button--danger',
      ...options,
    }
  )
}

/**
 * 批量删除确认对话框
 */
export const showBatchDeleteConfirm = (
  count: number,
  options?: Partial<MessageBoxOptions>
): Promise<void> => {
  return showConfirm(
    `确定要删除选中的 ${count} 条记录吗？删除后无法恢复，请谨慎操作。`,
    '批量删除确认',
    'error',
    {
      confirmButtonText: '删除',
      confirmButtonClass: 'el-button--danger',
      ...options,
    }
  )
}

/**
 * 保存确认对话框
 */
export const showSaveConfirm = (
  options?: Partial<MessageBoxOptions>
): Promise<void> => {
  return showConfirm(
    '确定要保存当前更改吗？',
    '保存确认',
    'info',
    {
      confirmButtonText: '保存',
      ...options,
    }
  )
}

/**
 * 提交确认对话框
 */
export const showSubmitConfirm = (
  options?: Partial<MessageBoxOptions>
): Promise<void> => {
  return showConfirm(
    '确定要提交吗？提交后将无法撤回。',
    '提交确认',
    'warning',
    {
      confirmButtonText: '提交',
      ...options,
    }
  )
}

/**
 * 审核确认对话框
 */
export const showAuditConfirm = (
  action: 'approve' | 'reject' | 'pass' = 'approve',
  options?: Partial<MessageBoxOptions>
): Promise<void> => {
  const config = {
    approve: {
      message: '确定要通过该申请吗？',
      title: '通过确认',
      type: 'success' as ConfirmType,
      confirmButtonText: '通过',
    },
    reject: {
      message: '确定要拒绝该申请吗？',
      title: '拒绝确认',
      type: 'warning' as ConfirmType,
      confirmButtonText: '拒绝',
    },
    pass: {
      message: '确定要标记为通过吗？',
      title: '确认通过',
      type: 'success' as ConfirmType,
      confirmButtonText: '确认',
    },
  }

  const { message, title, type, confirmButtonText } = config[action]
  return showConfirm(message, title, type, {
    confirmButtonText,
    ...options,
  })
}

/**
 * 提示对话框
 */
export const showAlert = (
  message: string,
  title: string = '提示',
  type: ConfirmType = 'info',
  options?: Partial<MessageBoxOptions>
): Promise<void> => {
  return new Promise((resolve) => {
    ElMessageBox.alert(message, title, {
      confirmButtonText: '确定',
      type,
      ...options,
    }).then(() => resolve())
  })
}

/**
 * 输入对话框
 */
export const showPrompt = (
  message: string,
  title: string = '输入',
  options?: Partial<MessageBoxOptions>
): Promise<string> => {
  return new Promise((resolve, reject) => {
    ElMessageBox.prompt(message, title, {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      ...options,
    })
      .then(({ value }) => resolve(value))
      .catch(() => reject())
  })
}

/**
 * 关闭所有消息
 */
export const closeAllMessages = () => {
  ElMessage.closeAll()
}

/**
 * 关闭所有通知
 */
export const closeAllNotifications = () => {
  ElNotification.closeAll()
}

export default {
  showMessage,
  showSuccess,
  showWarning,
  showError,
  showNotification,
  showConfirm,
  showDeleteConfirm,
  showBatchDeleteConfirm,
  showSaveConfirm,
  showSubmitConfirm,
  showAuditConfirm,
  showAlert,
  showPrompt,
  closeAllMessages,
  closeAllNotifications,
}