import type { EChartsOption } from 'echarts'

/**
 * 图表性能优化配置
 */
export interface ChartOptimizationOptions {
  // 是否启用动画
  animation?: boolean
  // 动画时长
  animationDuration?: number
  // 是否启用渐进式渲染
  progressive?: boolean
  // 渐进式渲染阈值
  progressiveThreshold?: number
  // 是否启用数据采样
  sampling?: boolean
  // 采样类型
  samplingType?: 'lttb' | 'average' | 'max' | 'min' | 'sum'
}

/**
 * 默认优化配置
 */
const defaultOptimization: ChartOptimizationOptions = {
  animation: true,
  animationDuration: 300,
  progressive: true,
  progressiveThreshold: 1000,
  sampling: true,
  samplingType: 'lttb',
}

/**
 * 优化图表配置
 */
export function optimizeChartOption(
  option: EChartsOption,
  optimization: ChartOptimizationOptions = {}
): EChartsOption {
  const opts = { ...defaultOptimization, ...optimization }
  
  const optimizedOption: EChartsOption = {
    ...option,
    animation: opts.animation,
    animationDuration: opts.animationDuration,
  }

  // 优化series配置
  if (Array.isArray(optimizedOption.series)) {
    optimizedOption.series = optimizedOption.series.map((series: any) => {
      const optimizedSeries = { ...series }

      // 启用渐进式渲染
      if (opts.progressive && series.data && series.data.length > opts.progressiveThreshold!) {
        optimizedSeries.progressive = opts.progressiveThreshold
        optimizedSeries.progressiveThreshold = opts.progressiveThreshold
      }

      // 启用数据采样
      if (opts.sampling && series.type === 'line') {
        optimizedSeries.sampling = opts.samplingType
      }

      // 大数据量时禁用动画
      if (series.data && series.data.length > 5000) {
        optimizedSeries.animation = false
      }

      return optimizedSeries
    })
  }

  return optimizedOption
}

/**
 * 数据抽样 - 减少数据点数量
 */
export function sampleData<T extends { value: number }>(
  data: T[],
  maxPoints: number
): T[] {
  if (data.length <= maxPoints) {
    return data
  }

  const step = Math.ceil(data.length / maxPoints)
  return data.filter((_, index) => index % step === 0)
}

/**
 * LTTB算法 - 最大三角形三桶算法
 * 用于时间序列数据的下采样，保留数据的视觉特征
 */
export function lttbDownsampling<T extends { timestamp: number; value: number }>(
  data: T[],
  threshold: number
): T[] {
  if (data.length <= threshold) {
    return data
  }

  const sampled: T[] = []
  const bucketSize = (data.length - 2) / (threshold - 2)

  // 始终包含第一个点
  sampled.push(data[0])

  for (let i = 0; i < threshold - 2; i++) {
    const avgRangeStart = Math.floor((i + 1) * bucketSize) + 1
    const avgRangeEnd = Math.floor((i + 2) * bucketSize) + 1
    const avgRangeLength = avgRangeEnd - avgRangeStart

    let avgX = 0
    let avgY = 0

    for (let j = avgRangeStart; j < avgRangeEnd; j++) {
      avgX += data[j].timestamp
      avgY += data[j].value
    }

    avgX /= avgRangeLength
    avgY /= avgRangeLength

    const rangeStart = Math.floor(i * bucketSize) + 1
    const rangeEnd = Math.floor((i + 1) * bucketSize) + 1

    let maxArea = -1
    let maxAreaPoint = data[rangeStart]

    const pointAX = data[sampled.length - 1].timestamp
    const pointAY = data[sampled.length - 1].value

    for (let j = rangeStart; j < rangeEnd; j++) {
      const area = Math.abs(
        (pointAX - avgX) * (data[j].value - pointAY) -
        (pointAX - data[j].timestamp) * (avgY - pointAY)
      ) * 0.5

      if (area > maxArea) {
        maxArea = area
        maxAreaPoint = data[j]
      }
    }

    sampled.push(maxAreaPoint)
  }

  // 始终包含最后一个点
  sampled.push(data[data.length - 1])

  return sampled
}

/**
 * 防抖函数 - 用于图表resize
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null

  return function (this: any, ...args: Parameters<T>) {
    const context = this

    if (timeout) {
      clearTimeout(timeout)
    }

    timeout = setTimeout(() => {
      func.apply(context, args)
      timeout = null
    }, wait)
  }
}

/**
 * 节流函数 - 用于图表交互
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null
  let previous = 0

  return function (this: any, ...args: Parameters<T>) {
    const context = this
    const now = Date.now()

    if (!previous) previous = now

    const remaining = wait - (now - previous)

    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout)
        timeout = null
      }
      previous = now
      func.apply(context, args)
    } else if (!timeout) {
      timeout = setTimeout(() => {
        previous = Date.now()
        timeout = null
        func.apply(context, args)
      }, remaining)
    }
  }
}

/**
 * 图表懒加载管理器
 */
export class ChartLazyLoader {
  private observer: IntersectionObserver | null = null
  private charts = new Map<Element, () => void>()

  constructor() {
    if (typeof IntersectionObserver !== 'undefined') {
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const loadChart = this.charts.get(entry.target)
              if (loadChart) {
                loadChart()
                this.unobserve(entry.target)
              }
            }
          })
        },
        {
          rootMargin: '50px',
          threshold: 0.1,
        }
      )
    }
  }

  /**
   * 观察图表元素
   */
  observe(element: Element, loadChart: () => void) {
    if (this.observer) {
      this.charts.set(element, loadChart)
      this.observer.observe(element)
    } else {
      // 不支持IntersectionObserver时直接加载
      loadChart()
    }
  }

  /**
   * 停止观察
   */
  unobserve(element: Element) {
    if (this.observer) {
      this.observer.unobserve(element)
      this.charts.delete(element)
    }
  }

  /**
   * 销毁
   */
  destroy() {
    if (this.observer) {
      this.observer.disconnect()
      this.charts.clear()
    }
  }
}

/**
 * 创建图表懒加载实例
 */
export function createChartLazyLoader() {
  return new ChartLazyLoader()
}
