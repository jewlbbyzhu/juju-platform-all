import { ref, computed, onMounted, onUnmounted } from 'vue'

/**
 * 断点定义
 */
export const breakpoints = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
}

/**
 * 设备类型
 */
export type DeviceType = 'mobile' | 'tablet' | 'desktop'

/**
 * 响应式设计Hook
 */
export function useResponsive() {
  const windowWidth = ref(window.innerWidth)
  const windowHeight = ref(window.innerHeight)

  /**
   * 更新窗口尺寸
   */
  const updateSize = () => {
    windowWidth.value = window.innerWidth
    windowHeight.value = window.innerHeight
  }

  /**
   * 设备类型
   */
  const deviceType = computed<DeviceType>(() => {
    if (windowWidth.value < breakpoints.md) {
      return 'mobile'
    } else if (windowWidth.value < breakpoints.lg) {
      return 'tablet'
    } else {
      return 'desktop'
    }
  })

  /**
   * 是否为移动端
   */
  const isMobile = computed(() => deviceType.value === 'mobile')

  /**
   * 是否为平板
   */
  const isTablet = computed(() => deviceType.value === 'tablet')

  /**
   * 是否为桌面端
   */
  const isDesktop = computed(() => deviceType.value === 'desktop')

  /**
   * 是否小于指定断点
   */
  const isLessThan = (breakpoint: keyof typeof breakpoints) => {
    return computed(() => windowWidth.value < breakpoints[breakpoint])
  }

  /**
   * 是否大于指定断点
   */
  const isGreaterThan = (breakpoint: keyof typeof breakpoints) => {
    return computed(() => windowWidth.value >= breakpoints[breakpoint])
  }

  /**
   * 是否在指定断点范围内
   */
  const isBetween = (
    min: keyof typeof breakpoints,
    max: keyof typeof breakpoints
  ) => {
    return computed(
      () =>
        windowWidth.value >= breakpoints[min] &&
        windowWidth.value < breakpoints[max]
    )
  }

  /**
   * 侧边栏是否应该折叠
   */
  const shouldCollapseSidebar = computed(() => {
    return windowWidth.value < breakpoints.lg
  })

  /**
   * 表格是否应该使用卡片模式
   */
  const shouldUseCardMode = computed(() => {
    return windowWidth.value < breakpoints.md
  })

  /**
   * 获取响应式列数
   */
  const getResponsiveColumns = (
    mobile: number,
    tablet: number,
    desktop: number
  ) => {
    return computed(() => {
      if (isMobile.value) return mobile
      if (isTablet.value) return tablet
      return desktop
    })
  }

  onMounted(() => {
    window.addEventListener('resize', updateSize)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', updateSize)
  })

  return {
    windowWidth: computed(() => windowWidth.value),
    windowHeight: computed(() => windowHeight.value),
    deviceType,
    isMobile,
    isTablet,
    isDesktop,
    isLessThan,
    isGreaterThan,
    isBetween,
    shouldCollapseSidebar,
    shouldUseCardMode,
    getResponsiveColumns,
  }
}

/**
 * 触摸事件支持检测
 */
export function useTouchSupport() {
  const isTouchDevice = computed(() => {
    return (
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      (navigator as any).msMaxTouchPoints > 0
    )
  })

  return {
    isTouchDevice,
  }
}

/**
 * 屏幕方向
 */
export function useOrientation() {
  const orientation = ref<'portrait' | 'landscape'>(
    window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
  )

  const updateOrientation = () => {
    orientation.value =
      window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
  }

  const isPortrait = computed(() => orientation.value === 'portrait')
  const isLandscape = computed(() => orientation.value === 'landscape')

  onMounted(() => {
    window.addEventListener('resize', updateOrientation)
    window.addEventListener('orientationchange', updateOrientation)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', updateOrientation)
    window.removeEventListener('orientationchange', updateOrientation)
  })

  return {
    orientation: computed(() => orientation.value),
    isPortrait,
    isLandscape,
  }
}
