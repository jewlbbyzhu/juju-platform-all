import { ElMessage, ElNotification } from 'element-plus'
import type { AxiosError } from 'axios'
import { getStoredUser } from '@/utils/auth'

/**
 * 错误类型枚举
 */
export enum ErrorType {
  NETWORK = 'NETWORK',
  AUTH = 'AUTH',
  BUSINESS = 'BUSINESS',
  VALIDATION = 'VALIDATION',
  UNKNOWN = 'UNKNOWN'
}

/**
 * 错误信息接口
 */
export interface ErrorInfo {
  type: ErrorType
  code?: string
  message: string
  details?: any
  timestamp: string
  stack?: string
}

/**
 * 错误日志上报接口
 */
interface ErrorReportPayload {
  error: ErrorInfo
  userAgent: string
  url: string
  userId?: string
}

/**
 * 全局错误处理器类
 */
class GlobalErrorHandler {
  private errorQueue: ErrorInfo[] = []
  private maxQueueSize = 50
  private reportEndpoint = '/api/v1/errors/report'
  private initialized = false

  /**
   * 初始化错误处理器
   */
  init() {
    if (this.initialized) return

    // 捕获未处理的Promise错误
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError(event.reason)
      event.preventDefault()
    })

    // 捕获全局错误
    window.addEventListener('error', (event) => {
      this.handleError(event.error || event.message)
      event.preventDefault()
    })

    // Vue错误处理在main.ts中配置
    this.initialized = true
  }

  /**
   * 处理错误
   */
  handleError(error: any, showNotification = true): ErrorInfo {
    const errorInfo = this.parseError(error)
    
    // 添加到错误队列
    this.addToQueue(errorInfo)
    
    // 显示用户友好的错误提示
    if (showNotification) {
      this.showErrorNotification(errorInfo)
    }
    
    // 上报错误日志
    this.reportError(errorInfo)
    
    // 开发环境打印详细错误
    if (import.meta.env.DEV) {
      console.error('[Error Handler]', errorInfo, error)
    }
    
    return errorInfo
  }

  /**
   * 解析错误对象
   */
  private parseError(error: any): ErrorInfo {
    const timestamp = new Date().toISOString()
    
    // Axios错误
    if (this.isAxiosError(error)) {
      return this.parseAxiosError(error, timestamp)
    }
    
    // 标准Error对象
    if (error instanceof Error) {
      return {
        type: ErrorType.UNKNOWN,
        message: error.message,
        timestamp,
        stack: error.stack
      }
    }
    
    // 字符串错误
    if (typeof error === 'string') {
      return {
        type: ErrorType.UNKNOWN,
        message: error,
        timestamp
      }
    }
    
    // 其他类型
    return {
      type: ErrorType.UNKNOWN,
      message: '未知错误',
      details: error,
      timestamp
    }
  }

  /**
   * 判断是否为Axios错误
   */
  private isAxiosError(error: any): error is AxiosError {
    return error?.isAxiosError === true
  }

  /**
   * 解析Axios错误
   */
  private parseAxiosError(error: AxiosError, timestamp: string): ErrorInfo {
    const response = error.response
    
    // 网络错误
    if (!response) {
      return {
        type: ErrorType.NETWORK,
        message: '网络连接异常，请检查网络设置',
        timestamp
      }
    }
    
    // 认证错误
    if (response.status === 401) {
      return {
        type: ErrorType.AUTH,
        code: 'AUTH_001',
        message: '登录已过期，请重新登录',
        timestamp
      }
    }
    
    if (response.status === 403) {
      return {
        type: ErrorType.AUTH,
        code: 'AUTH_003',
        message: '权限不足，无法执行此操作',
        timestamp
      }
    }
    
    // 业务错误
    if (response.status >= 400 && response.status < 500) {
      const data: any = response.data
      return {
        type: ErrorType.BUSINESS,
        code: data?.error?.code || `HTTP_${response.status}`,
        message: data?.error?.message || data?.message || '操作失败',
        details: data?.error?.details,
        timestamp
      }
    }
    
    // 服务器错误
    if (response.status >= 500) {
      return {
        type: ErrorType.NETWORK,
        code: `HTTP_${response.status}`,
        message: '服务器异常，请稍后重试',
        timestamp
      }
    }
    
    return {
      type: ErrorType.UNKNOWN,
      message: error.message || '请求失败',
      timestamp
    }
  }

  /**
   * 显示错误通知
   */
  private showErrorNotification(errorInfo: ErrorInfo) {
    const { type, message } = errorInfo
    
    // 认证错误使用通知
    if (type === ErrorType.AUTH) {
      ElNotification({
        title: '认证失败',
        message,
        type: 'error',
        duration: 5000
      })
      return
    }
    
    // 网络错误使用通知
    if (type === ErrorType.NETWORK) {
      ElNotification({
        title: '网络错误',
        message,
        type: 'error',
        duration: 5000
      })
      return
    }
    
    // 其他错误使用消息提示
    ElMessage({
      message,
      type: 'error',
      duration: 3000,
      showClose: true
    })
  }

  /**
   * 添加到错误队列
   */
  private addToQueue(errorInfo: ErrorInfo) {
    this.errorQueue.push(errorInfo)
    
    // 限制队列大小
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue.shift()
    }
  }

  /**
   * 上报错误日志
   */
  private async reportError(errorInfo: ErrorInfo) {
    try {
      // 只在生产环境上报
      if (import.meta.env.PROD) {
        const payload: ErrorReportPayload = {
          error: errorInfo,
          userAgent: navigator.userAgent,
          url: window.location.href,
          userId: this.getUserId()
        }
        
        // 使用fetch避免依赖axios（防止循环错误）
        await fetch(this.reportEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        })
      }
    } catch (error) {
      // 上报失败不影响主流程
      console.error('[Error Report Failed]', error)
    }
  }

  /**
   * 获取用户ID
   */
  private getUserId(): string | undefined {
    try {
      const user = getStoredUser()
      if (user?.id !== undefined && user?.id !== null) return String(user.id)
    } catch {
      // ignore
    }
    return undefined
  }

  /**
   * 获取错误队列
   */
  getErrorQueue(): ErrorInfo[] {
    return [...this.errorQueue]
  }

  /**
   * 清空错误队列
   */
  clearErrorQueue() {
    this.errorQueue = []
  }
}

// 导出单例
export const errorHandler = new GlobalErrorHandler()

// 导出便捷方法
export function handleError(error: any, showNotification = true): ErrorInfo {
  return errorHandler.handleError(error, showNotification)
}
