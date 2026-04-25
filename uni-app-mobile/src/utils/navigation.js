/* global uni, getCurrentPages, getApp */

/**
 * 导航工具函数
 * 提供统一的页面跳转、返回、主题切换等导航相关功能
 */

// 页面栈管理
const pageStack = []

/**
 * 页面跳转 - 带动画效果
 * @param {string} url - 目标页面路径
 * @param {Object} options - 配置选项
 * @param {string} options.animationType - 动画类型：forward|back|fade|none
 * @param {number} options.animationDuration - 动画时长(ms)
 * @param {Object} options.params - 页面参数
 * @param {Function} options.success - 成功回调
 * @param {Function} options.fail - 失败回调
 */
export function navigateTo(url, options = {}) {
  const {
    animationType = 'forward',
    animationDuration = 300,
    params = {},
    success,
    fail
  } = options

  // 构建完整URL（带参数）
  const queryString = Object.keys(params)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&')
  
  const fullUrl = queryString ? `${url}?${queryString}` : url

  // 触发页面过渡动画
  uni.$emit('pageTransition', animationType)

  // 延迟跳转，等待动画开始
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      uni.navigateTo({
        url: fullUrl,
        animationType: getAnimationType(animationType),
        animationDuration,
        success: (res) => {
          pageStack.push({ url: fullUrl, timestamp: Date.now() })
          if (success) success(res)
          resolve(res)
        },
        fail: (err) => {
          console.error('导航失败:', err)
          if (fail) fail(err)
          reject(err)
        }
      })
    }, 100)
  })
}

/**
 * 返回上一页 - 带动画效果
 * @param {Object} options - 配置选项
 * @param {number} options.delta - 返回层级
 * @param {Function} options.success - 成功回调
 * @param {Function} options.fail - 失败回调
 */
export function navigateBack(options = {}) {
  const { delta = 1, success, fail } = options

  // 触发返回动画
  uni.$emit('pageTransition', 'back')

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      uni.navigateBack({
        delta,
        animationType: 'slide-out-right',
        animationDuration: 300,
        success: (res) => {
          // 从页面栈中移除
          for (let i = 0; i < delta; i++) {
            pageStack.pop()
          }
          if (success) success(res)
          resolve(res)
        },
        fail: (err) => {
          console.error('返回失败:', err)
          if (fail) fail(err)
          reject(err)
        }
      })
    }, 100)
  })
}

/**
 * 跳转到 TabBar 页面
 * @param {string} url - 目标页面路径
 * @param {Object} options - 配置选项
 */
export function switchTab(url, options = {}) {
  const { success, fail } = options

  return new Promise((resolve, reject) => {
    uni.switchTab({
      url,
      success: (res) => {
        if (success) success(res)
        resolve(res)
      },
      fail: (err) => {
        console.error('Tab切换失败:', err)
        if (fail) fail(err)
        reject(err)
      }
    })
  })
}

/**
 * 重定向到指定页面（关闭当前页面）
 * @param {string} url - 目标页面路径
 * @param {Object} options - 配置选项
 */
export function redirectTo(url, options = {}) {
  const { success, fail } = options

  return new Promise((resolve, reject) => {
    uni.redirectTo({
      url,
      success: (res) => {
        if (success) success(res)
        resolve(res)
      },
      fail: (err) => {
        console.error('重定向失败:', err)
        if (fail) fail(err)
        reject(err)
      }
    })
  })
}

/**
 * 关闭所有页面，跳转到指定页面
 * @param {string} url - 目标页面路径
 * @param {Object} options - 配置选项
 */
export function reLaunch(url, options = {}) {
  const { success, fail } = options

  return new Promise((resolve, reject) => {
    uni.reLaunch({
      url,
      success: (res) => {
        // 清空页面栈
        pageStack.length = 0
        if (success) success(res)
        resolve(res)
      },
      fail: (err) => {
        console.error('重启应用失败:', err)
        if (fail) fail(err)
        reject(err)
      }
    })
  })
}

/**
 * 预加载页面
 * @param {string} url - 目标页面路径
 */
export function preloadPage(url) {
  // #ifdef APP-PLUS
  uni.preloadPage({ url })
  // #endif
}

/**
 * 获取页面栈信息
 * @returns {Array} 页面栈数组
 */
export function getPageStack() {
  return [...pageStack]
}

/**
 * 获取当前页面信息
 * @returns {Object|null} 当前页面信息
 */
export function getCurrentPage() {
  const pages = getCurrentPages()
  return pages[pages.length - 1] || null
}

/**
 * 获取当前页面路径
 * @returns {string} 当前页面路径
 */
export function getCurrentPagePath() {
  const page = getCurrentPage()
  return page ? page.route : ''
}

/**
 * 获取页面参数
 * @returns {Object} 页面参数对象
 */
export function getPageParams() {
  const page = getCurrentPage()
  return page ? page.options || {} : {}
}

/**
 * 显示全局加载
 * @param {string} text - 加载提示文字
 * @param {boolean} mask - 是否显示遮罩
 */
export function showLoading(text = '加载中...', mask = true) {
  uni.showLoading({
    title: text,
    mask
  })
}

/**
 * 隐藏全局加载
 */
export function hideLoading() {
  uni.hideLoading()
}

/**
 * 显示 Toast 提示
 * @param {string} message - 提示内容
 * @param {string} type - 提示类型：success|error|warning|info
 * @param {number} duration - 显示时长(ms)
 */
export function showToast(message, type = 'info', duration = 2000) {
  // 使用 App.vue 中的全局 Toast
  const app = getApp()
  if (app && app.showToast) {
    app.showToast(message, type, duration)
    return
  }

  // 降级使用 uni.showToast
  const iconMap = {
    success: 'success',
    error: 'error',
    warning: 'none',
    info: 'none'
  }

  uni.showToast({
    title: message,
    icon: iconMap[type] || 'none',
    duration
  })
}

/**
 * 隐藏 Toast
 */
export function hideToast() {
  const app = getApp()
  if (app && app.hideToast) {
    app.hideToast()
    return
  }
  uni.hideToast()
}

/**
 * 显示模态框
 * @param {Object} options - 配置选项
 * @param {string} options.title - 标题
 * @param {string} options.content - 内容
 * @param {boolean} options.showCancel - 是否显示取消按钮
 * @param {string} options.cancelText - 取消按钮文字
 * @param {string} options.confirmText - 确认按钮文字
 * @param {string} options.confirmColor - 确认按钮颜色
 */
export function showModal(options = {}) {
  const {
    title = '提示',
    content = '',
    showCancel = true,
    cancelText = '取消',
    confirmText = '确定',
    confirmColor = '#FF6B35'
  } = options

  return new Promise((resolve) => {
    uni.showModal({
      title,
      content,
      showCancel,
      cancelText,
      confirmText,
      confirmColor,
      success: (res) => {
        resolve(res.confirm)
      }
    })
  })
}

/**
 * 显示操作菜单
 * @param {Array} items - 菜单项数组
 * @param {string} title - 标题
 */
export function showActionSheet(items, title = '') {
  return new Promise((resolve, reject) => {
    uni.showActionSheet({
      itemList: items,
      title,
      success: (res) => {
        resolve(res.tapIndex)
      },
      fail: (err) => {
        reject(err)
      }
    })
  })
}

/**
 * 切换主题
 * @param {string} theme - 主题名称：neon|minimal|dark|vibrant
 */
export function switchTheme(theme) {
  const validThemes = ['neon', 'minimal', 'dark', 'vibrant']
  
  if (!validThemes.includes(theme)) {
    console.error('无效的主题:', theme)
    return
  }

  // 保存主题到本地
  uni.setStorageSync('app_theme', theme)
  
  // 触发全局主题切换事件
  uni.$emit('themeChanged', theme)
  
  // 更新页面主题类名
  const pages = getCurrentPages()
  pages.forEach(page => {
    if (page.$page && page.$page.$el) {
      page.$page.$el.classList.remove('theme-neon', 'theme-minimal', 'theme-dark', 'theme-vibrant')
      page.$page.$el.classList.add(`theme-${theme}`)
    }
  })

  showToast('主题切换成功', 'success')
}

/**
 * 获取当前主题
 * @returns {string} 当前主题名称
 */
export function getCurrentTheme() {
  return uni.getStorageSync('app_theme') || 'neon'
}

/**
 * 获取动画类型
 * @param {string} type - 动画类型名称
 * @returns {string} uni-app 动画类型
 */
function getAnimationType(type) {
  const typeMap = {
    forward: 'slide-in-right',
    back: 'slide-in-left',
    fade: 'fade-in',
    none: 'none'
  }
  return typeMap[type] || 'slide-in-right'
}

/**
 * 导航到外部链接（H5）
 * @param {string} url - 外部链接
 */
export function navigateToExternal(url) {
  // #ifdef H5
  window.open(url, '_blank')
  // #endif

  // #ifndef H5
  uni.showModal({
    title: '提示',
    content: '即将打开外部链接',
    success: (res) => {
      if (res.confirm) {
        uni.navigateTo({
          url: `/pages/webview/webview?url=${encodeURIComponent(url)}`
        })
      }
    }
  })
  // #endif
}

/**
 * 拨打电话
 * @param {string} phoneNumber - 电话号码
 */
export function makePhoneCall(phoneNumber) {
  uni.makePhoneCall({
    phoneNumber
  })
}

/**
 * 打开地图导航
 * @param {Object} options - 配置选项
 * @param {number} options.latitude - 纬度
 * @param {number} options.longitude - 经度
 * @param {string} options.name - 位置名称
 * @param {string} options.address - 详细地址
 */
export function openLocation(options = {}) {
  const { latitude, longitude, name = '', address = '' } = options

  if (!latitude || !longitude) {
    showToast('位置信息不完整', 'error')
    return
  }

  uni.openLocation({
    latitude: parseFloat(latitude),
    longitude: parseFloat(longitude),
    name,
    address
  })
}

/**
 * 复制到剪贴板
 * @param {string} text - 要复制的文本
 */
export function copyToClipboard(text) {
  uni.setClipboardData({
    data: text,
    success: () => {
      showToast('复制成功', 'success')
    },
    fail: () => {
      showToast('复制失败', 'error')
    }
  })
}

/**
 * 分享内容
 * @param {Object} options - 分享配置
 */
export function share(options = {}) {
  const {
    title = '聚聚',
    desc = '发现精彩聚会',
    path = '/pages/index/index',
    imageUrl = ''
  } = options

  // #ifdef MP-WEIXIN
  return {
    title,
    path,
    imageUrl
  }
  // #endif

  // #ifdef APP-PLUS
  uni.share({
    provider: 'weixin',
    scene: 'WXSceneSession',
    type: 0,
    title,
    summary: desc,
    href: `https://your-domain.com${path}`,
    imageUrl
  })
  // #endif
}

export default {
  navigateTo,
  navigateBack,
  switchTab,
  redirectTo,
  reLaunch,
  preloadPage,
  getPageStack,
  getCurrentPage,
  getCurrentPagePath,
  getPageParams,
  showLoading,
  hideLoading,
  showToast,
  hideToast,
  showModal,
  showActionSheet,
  switchTheme,
  getCurrentTheme,
  navigateToExternal,
  makePhoneCall,
  openLocation,
  copyToClipboard,
  share
}
