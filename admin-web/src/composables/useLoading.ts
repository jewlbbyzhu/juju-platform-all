import { ref, computed } from 'vue'
import { ElLoading } from 'element-plus'
import type { LoadingInstance } from 'element-plus/es/components/loading/src/loading'

/**
 * 加载状态管理
 */
export function useLoading(initialState = false) {
  const loading = ref(initialState)
  const loadingInstance = ref<LoadingInstance | null>(null)

  /**
   * 开始加载
   */
  const startLoading = (text = '加载中...') => {
    loading.value = true
    loadingInstance.value = ElLoading.service({
      lock: true,
      text,
      background: 'rgba(0, 0, 0, 0.7)',
    })
  }

  /**
   * 停止加载
   */
  const stopLoading = () => {
    loading.value = false
    if (loadingInstance.value) {
      loadingInstance.value.close()
      loadingInstance.value = null
    }
  }

  /**
   * 切换加载状态
   */
  const toggleLoading = () => {
    if (loading.value) {
      stopLoading()
    } else {
      startLoading()
    }
  }

  /**
   * 包装异步函数，自动管理加载状态
   */
  const withLoading = async <T>(
    fn: () => Promise<T>,
    text?: string
  ): Promise<T> => {
    try {
      startLoading(text)
      return await fn()
    } finally {
      stopLoading()
    }
  }

  return {
    loading: computed(() => loading.value),
    startLoading,
    stopLoading,
    toggleLoading,
    withLoading,
  }
}

/**
 * 全局加载状态管理
 */
class GlobalLoadingManager {
  private loadingCount = 0
  private loadingInstance: LoadingInstance | null = null

  /**
   * 显示全局加载
   */
  show(text = '加载中...') {
    this.loadingCount++
    
    if (this.loadingCount === 1) {
      this.loadingInstance = ElLoading.service({
        lock: true,
        text,
        background: 'rgba(0, 0, 0, 0.7)',
      })
    }
  }

  /**
   * 隐藏全局加载
   */
  hide() {
    this.loadingCount = Math.max(0, this.loadingCount - 1)
    
    if (this.loadingCount === 0 && this.loadingInstance) {
      this.loadingInstance.close()
      this.loadingInstance = null
    }
  }

  /**
   * 强制关闭所有加载
   */
  forceClose() {
    this.loadingCount = 0
    if (this.loadingInstance) {
      this.loadingInstance.close()
      this.loadingInstance = null
    }
  }

  /**
   * 包装异步函数
   */
  async wrap<T>(fn: () => Promise<T>, text?: string): Promise<T> {
    try {
      this.show(text)
      return await fn()
    } finally {
      this.hide()
    }
  }
}

export const globalLoading = new GlobalLoadingManager()
