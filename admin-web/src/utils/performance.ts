/**
 * 性能监控工具
 */

/**
 * 性能指标接口
 */
export interface PerformanceMetrics {
  // 首次内容绘制
  fcp?: number
  // 最大内容绘制
  lcp?: number
  // 首次输入延迟
  fid?: number
  // 累积布局偏移
  cls?: number
  // 首次字节时间
  ttfb?: number
  // 页面加载时间
  loadTime?: number
  // DOM解析时间
  domParseTime?: number
  // 资源加载时间
  resourceLoadTime?: number
}

/**
 * 性能监控类
 */
class PerformanceMonitor {
  private metrics: PerformanceMetrics = {}
  private observers: PerformanceObserver[] = []

  /**
   * 初始化性能监控
   */
  init() {
    if (typeof window === 'undefined' || !window.performance) {
      return
    }

    // 监控FCP
    this.observeFCP()
    
    // 监控LCP
    this.observeLCP()
    
    // 监控FID
    this.observeFID()
    
    // 监控CLS
    this.observeCLS()
    
    // 监控页面加载
    this.observePageLoad()
  }

  /**
   * 监控FCP (First Contentful Paint)
   */
  private observeFCP() {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            this.metrics.fcp = entry.startTime
            this.reportMetric('fcp', entry.startTime)
          }
        }
      })
      observer.observe({ entryTypes: ['paint'] })
      this.observers.push(observer)
    } catch (error) {
      console.warn('FCP monitoring not supported', error)
    }
  }

  /**
   * 监控LCP (Largest Contentful Paint)
   */
  private observeLCP() {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1] as any
        this.metrics.lcp = lastEntry.renderTime || lastEntry.loadTime
        this.reportMetric('lcp', this.metrics.lcp)
      })
      observer.observe({ entryTypes: ['largest-contentful-paint'] })
      this.observers.push(observer)
    } catch (error) {
      console.warn('LCP monitoring not supported', error)
    }
  }

  /**
   * 监控FID (First Input Delay)
   */
  private observeFID() {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const fidEntry = entry as any
          this.metrics.fid = fidEntry.processingStart - fidEntry.startTime
          this.reportMetric('fid', this.metrics.fid)
        }
      })
      observer.observe({ entryTypes: ['first-input'] })
      this.observers.push(observer)
    } catch (error) {
      console.warn('FID monitoring not supported', error)
    }
  }

  /**
   * 监控CLS (Cumulative Layout Shift)
   */
  private observeCLS() {
    try {
      let clsValue = 0
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const layoutShift = entry as any
          if (!layoutShift.hadRecentInput) {
            clsValue += layoutShift.value
            this.metrics.cls = clsValue
          }
        }
      })
      observer.observe({ entryTypes: ['layout-shift'] })
      this.observers.push(observer)
    } catch (error) {
      console.warn('CLS monitoring not supported', error)
    }
  }

  /**
   * 监控页面加载
   */
  private observePageLoad() {
    if (document.readyState === 'complete') {
      this.calculateLoadMetrics()
    } else {
      window.addEventListener('load', () => {
        this.calculateLoadMetrics()
      })
    }
  }

  /**
   * 计算加载指标
   */
  private calculateLoadMetrics() {
    const timing = performance.timing
    
    // TTFB
    this.metrics.ttfb = timing.responseStart - timing.requestStart
    
    // 页面加载时间
    this.metrics.loadTime = timing.loadEventEnd - timing.navigationStart
    
    // DOM解析时间
    this.metrics.domParseTime = timing.domContentLoadedEventEnd - timing.domLoading
    
    // 资源加载时间
    this.metrics.resourceLoadTime = timing.loadEventEnd - timing.domContentLoadedEventEnd
    
    this.reportMetric('ttfb', this.metrics.ttfb)
    this.reportMetric('loadTime', this.metrics.loadTime)
    this.reportMetric('domParseTime', this.metrics.domParseTime)
    this.reportMetric('resourceLoadTime', this.metrics.resourceLoadTime)
  }

  /**
   * 上报性能指标
   */
  private reportMetric(name: string, value: number) {
    if (import.meta.env.DEV) {
      console.log(`[Performance] ${name}:`, value.toFixed(2), 'ms')
    }
    
    // 生产环境可以上报到监控平台
    if (import.meta.env.PROD) {
      // TODO: 上报到监控平台
    }
  }

  /**
   * 获取所有指标
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics }
  }

  /**
   * 清理监控
   */
  cleanup() {
    this.observers.forEach(observer => observer.disconnect())
    this.observers = []
  }
}

// 导出单例
export const performanceMonitor = new PerformanceMonitor()

/**
 * 测量函数执行时间
 */
export function measureTime<T>(
  name: string,
  fn: () => T
): T {
  const start = performance.now()
  const result = fn()
  const end = performance.now()
  
  if (import.meta.env.DEV) {
    console.log(`[Measure] ${name}:`, (end - start).toFixed(2), 'ms')
  }
  
  return result
}

/**
 * 测量异步函数执行时间
 */
export async function measureTimeAsync<T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> {
  const start = performance.now()
  const result = await fn()
  const end = performance.now()
  
  if (import.meta.env.DEV) {
    console.log(`[Measure] ${name}:`, (end - start).toFixed(2), 'ms')
  }
  
  return result
}

/**
 * 内存监控
 */
export function getMemoryUsage() {
  if ('memory' in performance) {
    const memory = (performance as any).memory
    return {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
      usagePercent: (memory.usedJSHeapSize / memory.jsHeapSizeLimit * 100).toFixed(2)
    }
  }
  return null
}

/**
 * 资源加载监控
 */
export function getResourceTiming() {
  const resources = performance.getEntriesByType('resource')
  
  const summary = {
    total: resources.length,
    byType: {} as Record<string, number>,
    slowest: [] as PerformanceResourceTiming[]
  }
  
  resources.forEach((resource: any) => {
    const type = resource.initiatorType
    summary.byType[type] = (summary.byType[type] || 0) + 1
  })
  
  // 获取最慢的10个资源
  summary.slowest = resources
    .sort((a, b) => b.duration - a.duration)
    .slice(0, 10) as PerformanceResourceTiming[]
  
  return summary
}
