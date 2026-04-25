class PlatformAdapter {
  static getPlatform() {
    const systemInfo = uni.getSystemInfoSync()
    return systemInfo.platform
  }

  static isWeChat() {
    return this.getPlatform() === 'mp-weixin'
  }

  static isH5() {
    return this.getPlatform() === 'h5'
  }

  static isApp() {
    return this.getPlatform() === 'app'
  }

  static isIOS() {
    const systemInfo = uni.getSystemInfoSync()
    return systemInfo.system.includes('iOS')
  }

  static isAndroid() {
    const systemInfo = uni.getSystemInfoSync()
    return systemInfo.system.includes('Android')
  }

  static getStatusBarHeight() {
    const systemInfo = uni.getSystemInfoSync()
    return systemInfo.statusBarHeight || 0
  }

  static getSafeAreaInsets() {
    const systemInfo = uni.getSystemInfoSync()
    return systemInfo.safeAreaInsets || {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0
    }
  }

  static getSystemInfo() {
    return uni.getSystemInfoSync()
  }

  static adaptStatusBarStyle() {
    const platform = this.getPlatform()
    if (platform === 'mp-weixin') {
      uni.setNavigationBarColor({
        frontColor: '#000000',
        backgroundColor: '#000000',
        animation: {
          duration: 200,
          timingFunc: 'easeIn'
        }
      })
    }
  }

  static adaptPageScroll() {
    const platform = this.getPlatform()
    if (platform === 'h5') {
      return {
        enabled: true,
        scrollWithAnimation: true
      }
    }
    return {
      enabled: false,
      scrollWithAnimation: false
    }
  }

  static adaptImageMode() {
    const platform = this.getPlatform()
    if (platform === 'mp-weixin') {
      return 'aspectFill'
    }
    return 'aspectFit'
  }

  static adaptShareProvider() {
    const platform = this.getPlatform()
    if (platform === 'mp-weixin') {
      return 'weixin'
    }
    if (platform === 'app') {
      return 'native'
    }
    return 'system'
  }

  static adaptPaymentMethod() {
    const platform = this.getPlatform()
    if (platform === 'mp-weixin') {
      return 'wechat'
    }
    if (platform === 'app') {
      return 'alipay'
    }
    return 'wallet'
  }

  static adaptLocationProvider() {
    const platform = this.getPlatform()
    if (platform === 'mp-weixin') {
      return 'wechat'
    }
    if (platform === 'app') {
      return 'system'
    }
    return 'h5'
  }

  static getSafeBottomHeight() {
    const safeArea = this.getSafeAreaInsets()
    const tabBarHeight = this.getTabBarHeight()
    return Math.max(safeArea.bottom, tabBarHeight)
  }

  static getTabBarHeight() {
    const systemInfo = uni.getSystemInfoSync()
    return systemInfo.tabBarHeight || 0
  }

  static getScreenWidth() {
    const systemInfo = uni.getSystemInfoSync()
    return systemInfo.screenWidth || 375
  }

  static getScreenHeight() {
    const systemInfo = uni.getSystemInfoSync()
    return systemInfo.screenHeight || 667
  }

  static getPixelRatio() {
    const systemInfo = uni.getSystemInfoSync()
    return systemInfo.pixelRatio || 2
  }

  static isSmallScreen() {
    return this.getScreenWidth() < 375
  }

  static isLargeScreen() {
    return this.getScreenWidth() > 414
  }

  static adaptFontSize(baseSize) {
    const screenWidth = this.getScreenWidth()
    const ratio = screenWidth / 375
    return Math.round(baseSize * ratio)
  }

  static adaptSpacing(baseSpacing) {
    const screenWidth = this.getScreenWidth()
    const ratio = screenWidth / 375
    return Math.round(baseSpacing * ratio)
  }

  static checkNetworkStatus() {
    return new Promise((resolve) => {
      uni.getNetworkType({
        success: (res) => {
          resolve({
            isConnected: res.networkType !== 'none',
            networkType: res.networkType
          })
        },
        fail: () => {
          resolve({
            isConnected: false,
            networkType: 'none'
          })
        }
      })
    })
  }

  static onNetworkStatusChange(callback) {
    uni.onNetworkStatusChange((res) => {
      callback({
        isConnected: res.isConnected,
        networkType: res.networkType
      })
    })
  }

  static getDeviceInfo() {
    const systemInfo = uni.getSystemInfoSync()
    return {
      platform: systemInfo.platform,
      system: systemInfo.system,
      version: systemInfo.version,
      SDKVersion: systemInfo.SDKVersion,
      brand: systemInfo.brand,
      model: systemInfo.model,
      screenWidth: systemInfo.screenWidth,
      screenHeight: systemInfo.screenHeight,
      pixelRatio: systemInfo.pixelRatio,
      statusBarHeight: systemInfo.statusBarHeight,
      safeAreaInsets: systemInfo.safeAreaInsets,
      tabBarHeight: systemInfo.tabBarHeight
    }
  }

  static logPlatformInfo() {
    const info = this.getDeviceInfo()
    console.log('Platform Info:', info)
    return info
  }
}

export default PlatformAdapter
