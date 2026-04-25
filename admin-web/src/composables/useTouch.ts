import { ref, onMounted, onUnmounted } from 'vue'

/**
 * 触摸方向
 */
export type SwipeDirection = 'left' | 'right' | 'up' | 'down'

/**
 * 触摸事件选项
 */
export interface TouchOptions {
  // 最小滑动距离
  threshold?: number
  // 是否阻止默认行为
  preventDefault?: boolean
}

/**
 * 触摸手势Hook
 */
export function useTouch(
  target: HTMLElement | null,
  options: TouchOptions = {}
) {
  const { threshold = 50, preventDefault = false } = options

  const startX = ref(0)
  const startY = ref(0)
  const endX = ref(0)
  const endY = ref(0)
  const isSwiping = ref(false)

  /**
   * 触摸开始
   */
  const handleTouchStart = (e: TouchEvent) => {
    if (preventDefault) {
      e.preventDefault()
    }

    const touch = e.touches[0]
    startX.value = touch.clientX
    startY.value = touch.clientY
    isSwiping.value = true
  }

  /**
   * 触摸移动
   */
  const handleTouchMove = (e: TouchEvent) => {
    if (!isSwiping.value) return

    if (preventDefault) {
      e.preventDefault()
    }

    const touch = e.touches[0]
    endX.value = touch.clientX
    endY.value = touch.clientY
  }

  /**
   * 触摸结束
   */
  const handleTouchEnd = (e: TouchEvent) => {
    if (!isSwiping.value) return

    if (preventDefault) {
      e.preventDefault()
    }

    isSwiping.value = false

    const deltaX = endX.value - startX.value
    const deltaY = endY.value - startY.value

    // 判断滑动方向
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // 水平滑动
      if (Math.abs(deltaX) > threshold) {
        if (deltaX > 0) {
          onSwipeRight()
        } else {
          onSwipeLeft()
        }
      }
    } else {
      // 垂直滑动
      if (Math.abs(deltaY) > threshold) {
        if (deltaY > 0) {
          onSwipeDown()
        } else {
          onSwipeUp()
        }
      }
    }

    // 重置
    startX.value = 0
    startY.value = 0
    endX.value = 0
    endY.value = 0
  }

  // 滑动回调
  const swipeCallbacks = {
    left: [] as Array<() => void>,
    right: [] as Array<() => void>,
    up: [] as Array<() => void>,
    down: [] as Array<() => void>,
  }

  const onSwipeLeft = () => {
    swipeCallbacks.left.forEach(cb => cb())
  }

  const onSwipeRight = () => {
    swipeCallbacks.right.forEach(cb => cb())
  }

  const onSwipeUp = () => {
    swipeCallbacks.up.forEach(cb => cb())
  }

  const onSwipeDown = () => {
    swipeCallbacks.down.forEach(cb => cb())
  }

  /**
   * 注册滑动回调
   */
  const onSwipe = (direction: SwipeDirection, callback: () => void) => {
    swipeCallbacks[direction].push(callback)
  }

  onMounted(() => {
    if (target) {
      target.addEventListener('touchstart', handleTouchStart, { passive: !preventDefault })
      target.addEventListener('touchmove', handleTouchMove, { passive: !preventDefault })
      target.addEventListener('touchend', handleTouchEnd, { passive: !preventDefault })
    }
  })

  onUnmounted(() => {
    if (target) {
      target.removeEventListener('touchstart', handleTouchStart)
      target.removeEventListener('touchmove', handleTouchMove)
      target.removeEventListener('touchend', handleTouchEnd)
    }
  })

  return {
    isSwiping,
    onSwipe,
  }
}

/**
 * 长按手势Hook
 */
export function useLongPress(
  target: HTMLElement | null,
  callback: () => void,
  duration = 500
) {
  let timer: ReturnType<typeof setTimeout> | null = null

  const handleStart = () => {
    timer = setTimeout(() => {
      callback()
    }, duration)
  }

  const handleEnd = () => {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
  }

  onMounted(() => {
    if (target) {
      target.addEventListener('touchstart', handleStart)
      target.addEventListener('touchend', handleEnd)
      target.addEventListener('touchcancel', handleEnd)
      target.addEventListener('mousedown', handleStart)
      target.addEventListener('mouseup', handleEnd)
      target.addEventListener('mouseleave', handleEnd)
    }
  })

  onUnmounted(() => {
    if (target) {
      target.removeEventListener('touchstart', handleStart)
      target.removeEventListener('touchend', handleEnd)
      target.removeEventListener('touchcancel', handleEnd)
      target.removeEventListener('mousedown', handleStart)
      target.removeEventListener('mouseup', handleEnd)
      target.removeEventListener('mouseleave', handleEnd)
    }
    if (timer) {
      clearTimeout(timer)
    }
  })
}

/**
 * 双击手势Hook
 */
export function useDoubleTap(
  target: HTMLElement | null,
  callback: () => void,
  delay = 300
) {
  let lastTap = 0

  const handleTap = () => {
    const now = Date.now()
    if (now - lastTap < delay) {
      callback()
      lastTap = 0
    } else {
      lastTap = now
    }
  }

  onMounted(() => {
    if (target) {
      target.addEventListener('click', handleTap)
    }
  })

  onUnmounted(() => {
    if (target) {
      target.removeEventListener('click', handleTap)
    }
  })
}
