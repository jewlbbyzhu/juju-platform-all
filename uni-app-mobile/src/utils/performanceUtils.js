class PerformanceUtils {
  static debounce(func, wait = 300) {
    let timeout
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout)
        func(...args)
      }
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }
  }

  static throttle(func, limit = 300) {
    let inThrottle
    return function executedFunction(...args) {
      if (!inThrottle) {
        func(...args)
        inThrottle = true
        setTimeout(() => inThrottle = false, limit)
      }
    }
  }

  static rafThrottle(func) {
    let ticking = false
    return function executedFunction(...args) {
      if (!ticking) {
        requestAnimationFrame(() => {
          func(...args)
          ticking = false
        })
        ticking = true
      }
    }
  }

  static loadImageWithLazy(src, options = {}) {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = src
    })
  }

  static async batchRequest(requests, batchSize = 5) {
    const results = []
    for (let i = 0; i < requests.length; i += batchSize) {
      const batch = requests.slice(i, i + batchSize)
      const batchResults = await Promise.all(batch)
      results.push(...batchResults)
    }
    return results
  }

  static formatFileSize(bytes) {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    const f = (bytes / Math.pow(k, i)).toFixed(2)
    return parseFloat(f) + ' ' + sizes[i]
  }

  static getPerformanceMetrics() {
    if (typeof performance !== 'undefined') {
      const metrics = {
        memory: performance.memory,
        timing: performance.timing,
        navigation: performance.navigation
      }
      return metrics
    }
    return null
  }

  static optimizeImage(src, quality = 0.8) {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()

      img.onload = () => {
        canvas.width = img.width * quality
        canvas.height = img.height * quality
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

        canvas.toBlob((blob) => {
          const optimizedUrl = URL.createObjectURL(blob)
          resolve(optimizedUrl)
        }, 'image/jpeg', quality)
      }

      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = src
    })
  }

  static clearCache() {
    if (typeof caches !== 'undefined') {
      caches.keys().then(cacheNames => {
        cacheNames.forEach(cacheName => {
          caches.delete(cacheName)
        })
      })
    }
  }

  static async preloadImages(urls) {
    const promises = urls.map(url => {
      return new Promise((resolve, reject) => {
        const img = new Image()
        img.onload = () => resolve(url)
        img.onerror = () => reject(url)
        img.src = url
      })
    })

    try {
      await Promise.all(promises)
      return true
    } catch (error) {
      console.error('Preload images error:', error)
      return false
    }
  }

  static getScrollPosition() {
    const scrollTop = uni.getStorageSync('scrollTop') || 0
    return scrollTop
  }

  static setScrollPosition(scrollTop) {
    uni.setStorageSync('scrollTop', scrollTop)
  }

  static clearScrollPosition() {
    uni.removeStorageSync('scrollTop')
  }
}

export default PerformanceUtils
