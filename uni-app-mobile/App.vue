<template>
  <view id="app" :class="['app-container', currentTheme, 'theme-' + currentTheme]">
    <!-- 页面内容 -->
    <view class="page-container" :class="pageTransitionClass">
      <slot />
    </view>
    
    <!-- 全局加载遮罩 -->
    <view v-if="globalLoading" class="global-loading-overlay" @touchmove.stop.prevent>
      <view class="loading-content">
        <view class="loading-spinner">
          <view class="spinner-ring"></view>
          <view class="spinner-ring"></view>
          <view class="spinner-ring"></view>
        </view>
        <text class="loading-text">{{ loadingText }}</text>
      </view>
    </view>
    
    <!-- 全局Toast提示 -->
    <view 
      v-if="toast.show" 
      class="global-toast" 
      :class="[toast.type, { 'toast-show': toast.show, 'toast-hiding': toast.hiding }]"
    >
      <view class="toast-icon">
        <text v-if="toast.type === 'success'" class="iconfont icon-check">✓</text>
        <text v-else-if="toast.type === 'error'" class="iconfont icon-close">✕</text>
        <text v-else-if="toast.type === 'warning'" class="iconfont icon-warning">!</text>
        <text v-else class="iconfont icon-info">i</text>
      </view>
      <text class="toast-message">{{ toast.message }}</text>
    </view>
    
    <!-- 网络状态提示 -->
    <view 
      v-if="networkStatus.show" 
      class="network-status-bar" 
      :class="[networkStatus.type, { 'status-hiding': networkStatus.hiding }]"
    >
      <text class="network-icon">{{ networkStatus.type === 'offline' ? '📡' : '✓' }}</text>
      <text class="network-text">{{ networkStatus.message }}</text>
    </view>
    
    <!-- 全局确认对话框 -->
    <view v-if="confirmDialog.show" class="global-modal" @tap="closeConfirmDialog">
      <view class="modal-overlay"></view>
      <view class="modal-content confirm-dialog" @tap.stop>
        <view class="dialog-header">
          <text class="dialog-title">{{ confirmDialog.title }}</text>
        </view>
        <view class="dialog-body">
          <text class="dialog-message">{{ confirmDialog.message }}</text>
        </view>
        <view class="dialog-footer">
          <view class="dialog-btn btn-cancel" @tap="closeConfirmDialog">
            <text>{{ confirmDialog.cancelText }}</text>
          </view>
          <view class="dialog-btn btn-confirm" @tap="handleConfirm">
            <text>{{ confirmDialog.confirmText }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { useThemeStore } from './src/stores/theme'

/**
 * 聚聚平台 UniApp 全局应用组件
 * 提供全局UI元素：加载、Toast、网络状态、确认对话框
 * 支持主题切换和页面转场动画
 */
export default {
  name: 'App',
  data() {
    return {
      currentTheme: 'neon',
      globalLoading: false,
      loadingText: '加载中...',
      pageTransitionClass: '',
      toast: {
        show: false,
        message: '',
        type: 'info',
        timer: null,
        hiding: false
      },
      networkStatus: {
        show: false,
        type: 'online',
        message: '',
        hiding: false,
        timer: null
      },
      confirmDialog: {
        show: false,
        title: '提示',
        message: '',
        confirmText: '确定',
        cancelText: '取消',
        onConfirm: null,
        onCancel: null
      }
    }
  },
  onLaunch: function() {
    console.log('App Launch - 聚聚平台启动')
    this.initTheme()
    this.initNetworkListener()
    this.initPageTransition()
    this.initGlobalMethods()
  },
  onShow: function() {
    console.log('App Show')
    this.checkNetworkStatus()
  },
  onHide: function() {
    console.log('App Hide')
  },
  methods: {
    // 初始化主题
    initTheme() {
      const themeStore = useThemeStore()
      this.currentTheme = themeStore.currentTheme || 'neon'
      
      // 监听主题变化
      uni.$on('themeChanged', (theme) => {
        this.currentTheme = theme
        this.applyTheme(theme)
      })
      
      // 应用初始主题
      this.applyTheme(this.currentTheme)
    },
    
    // 应用主题
    applyTheme(theme) {
      const themeColors = {
        neon: { primary: '#FF6B35', bg: '#0a0a0a' },
        minimal: { primary: '#4A90E2', bg: '#ffffff' },
        dark: { primary: '#BB86FC', bg: '#121212' },
        vibrant: { primary: '#FF4081', bg: '#FFF3E0' }
      }
      
      const colors = themeColors[theme] || themeColors.neon
      
      // 设置页面背景色
      uni.setBackgroundColor({
        backgroundColor: colors.bg,
        backgroundColorTop: colors.bg,
        backgroundColorBottom: colors.bg
      })
      
      // 设置导航栏颜色
      uni.setNavigationBarColor({
        frontColor: theme === 'minimal' || theme === 'vibrant' ? '#000000' : '#ffffff',
        backgroundColor: colors.bg
      })
    },
    
    // 初始化网络监听
    initNetworkListener() {
      uni.onNetworkStatusChange((res) => {
        if (!res.isConnected) {
          this.showNetworkStatus('offline', '网络已断开，请检查网络设置')
        } else {
          this.showNetworkStatus('online', '网络已恢复')
          setTimeout(() => {
            this.hideNetworkStatus()
          }, 2000)
        }
      })
    },
    
    // 检查网络状态
    checkNetworkStatus() {
      uni.getNetworkType({
        success: (res) => {
          if (res.networkType === 'none') {
            this.showNetworkStatus('offline', '当前无网络连接')
          }
        }
      })
    },
    
    // 显示网络状态
    showNetworkStatus(type, message) {
      if (this.networkStatus.timer) {
        clearTimeout(this.networkStatus.timer)
      }
      
      this.networkStatus = {
        show: true,
        type,
        message,
        hiding: false,
        timer: null
      }
    },
    
    // 隐藏网络状态
    hideNetworkStatus() {
      this.networkStatus.hiding = true
      this.networkStatus.timer = setTimeout(() => {
        this.networkStatus.show = false
        this.networkStatus.hiding = false
      }, 300)
    },
    
    // 初始化页面过渡
    initPageTransition() {
      // 监听页面跳转事件
      uni.$on('pageTransition', (direction) => {
        this.pageTransitionClass = `page-${direction}`
        setTimeout(() => {
          this.pageTransitionClass = ''
        }, 400)
      })
      
      // 监听页面返回事件
      uni.$on('pageBack', () => {
        this.pageTransitionClass = 'page-back'
        setTimeout(() => {
          this.pageTransitionClass = ''
        }, 400)
      })
    },
    
    // 初始化全局方法
    initGlobalMethods() {
      // 全局加载方法
      uni.$showLoading = (text = '加载中...') => {
        this.showLoading(text)
      }
      
      uni.$hideLoading = () => {
        this.hideLoading()
      }
      
      // 全局Toast方法
      uni.$toast = (message, type = 'info', duration = 2000) => {
        this.showToast(message, type, duration)
      }
      
      uni.$toast.success = (message, duration) => {
        this.showToast(message, 'success', duration)
      }
      
      uni.$toast.error = (message, duration) => {
        this.showToast(message, 'error', duration)
      }
      
      uni.$toast.warning = (message, duration) => {
        this.showToast(message, 'warning', duration)
      }
      
      // 全局确认对话框
      uni.$confirm = (options) => {
        return new Promise((resolve) => {
          this.showConfirmDialog({
            ...options,
            onConfirm: () => resolve(true),
            onCancel: () => resolve(false)
          })
        })
      }
    },
    
    // 显示全局加载
    showLoading(text = '加载中...') {
      this.loadingText = text
      this.globalLoading = true
    },
    
    // 隐藏全局加载
    hideLoading() {
      this.globalLoading = false
    },
    
    // 显示Toast
    showToast(message, type = 'info', duration = 2000) {
      if (this.toast.timer) {
        clearTimeout(this.toast.timer)
      }
      
      this.toast = {
        show: true,
        message,
        type,
        hiding: false,
        timer: null
      }
      
      this.toast.timer = setTimeout(() => {
        this.hideToast()
      }, duration)
    },
    
    // 隐藏Toast
    hideToast() {
      this.toast.hiding = true
      setTimeout(() => {
        this.toast.show = false
        this.toast.hiding = false
      }, 300)
    },
    
    // 显示确认对话框
    showConfirmDialog(options) {
      this.confirmDialog = {
        show: true,
        title: options.title || '提示',
        message: options.message || '',
        confirmText: options.confirmText || '确定',
        cancelText: options.cancelText || '取消',
        onConfirm: options.onConfirm,
        onCancel: options.onCancel
      }
    },
    
    // 关闭确认对话框
    closeConfirmDialog() {
      this.confirmDialog.show = false
      if (this.confirmDialog.onCancel) {
        this.confirmDialog.onCancel()
      }
    },
    
    // 处理确认
    handleConfirm() {
      this.confirmDialog.show = false
      if (this.confirmDialog.onConfirm) {
        this.confirmDialog.onConfirm()
      }
    }
  }
}
</script>

<style lang="scss">
// 导入设计系统
@import './src/styles/variables.scss';
@import './src/styles/global.scss';
@import './src/styles/animations.scss';
@import './src/styles/responsive.scss';

/* 应用基础样式 */
#app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* 页面基础样式 */
page {
  background-color: $dark-bg-primary;
  color: $dark-text-primary;
}

/* 应用容器 */
.app-container {
  min-height: 100vh;
  transition: background-color 0.3s ease;
  
  // 霓虹主题
  &.theme-neon {
    --primary-color: #FF6B35;
    --secondary-color: #4ECDC4;
    --background-color: #0a0a0a;
    --surface-color: #141414;
    --text-primary: #ffffff;
    --text-secondary: rgba(255, 255, 255, 0.7);
    --text-tertiary: rgba(255, 255, 255, 0.5);
    --border-color: rgba(255, 255, 255, 0.1);
    --glow-color: rgba(255, 107, 53, 0.3);
  }
  
  // 简约主题
  &.theme-minimal {
    --primary-color: #4A90E2;
    --secondary-color: #50E3C2;
    --background-color: #ffffff;
    --surface-color: #f5f5f5;
    --text-primary: #333333;
    --text-secondary: #666666;
    --text-tertiary: #999999;
    --border-color: #e0e0e0;
    --glow-color: rgba(74, 144, 226, 0.2);
  }
  
  // 暗色主题
  &.theme-dark {
    --primary-color: #BB86FC;
    --secondary-color: #03DAC6;
    --background-color: #121212;
    --surface-color: #1E1E1E;
    --text-primary: #E0E0E0;
    --text-secondary: #B0B0B0;
    --text-tertiary: #808080;
    --border-color: #2C2C2C;
    --glow-color: rgba(187, 134, 252, 0.2);
  }
  
  // 活力主题
  &.theme-vibrant {
    --primary-color: #FF4081;
    --secondary-color: #00E676;
    --background-color: #FFF3E0;
    --surface-color: #ffffff;
    --text-primary: #3E2723;
    --text-secondary: #5D4037;
    --text-tertiary: #8D6E63;
    --border-color: #FFE0B2;
    --glow-color: rgba(255, 64, 129, 0.2);
  }
}

/* 页面容器 */
.page-container {
  min-height: 100vh;
  background-color: var(--background-color, #0a0a0a);
  transition: opacity 0.4s $ease-out, transform 0.4s $ease-out;
}

/* 页面转场动画 */
.page-forward {
  animation: pageEnter 0.4s $ease-out forwards;
}

.page-back {
  animation: pageLeave 0.3s $ease-in forwards;
}

/* 全局加载遮罩 */
.global-loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(10rpx);
  -webkit-backdrop-filter: blur(10rpx);
  @include flex-center;
  z-index: $z-fullscreen;
  animation: fadeIn 0.3s ease;
}

.loading-content {
  @include flex-center;
  flex-direction: column;
}

.loading-spinner {
  position: relative;
  width: 80rpx;
  height: 80rpx;
}

.spinner-ring {
  position: absolute;
  width: 100%;
  height: 100%;
  border: 4rpx solid transparent;
  border-top-color: var(--primary-color, #FF6B35);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  &:nth-child(1) {
    animation-duration: 1s;
  }
  
  &:nth-child(2) {
    width: 70%;
    height: 70%;
    top: 15%;
    left: 15%;
    animation-duration: 0.8s;
    animation-direction: reverse;
    border-top-color: var(--secondary-color, #4ECDC4);
  }
  
  &:nth-child(3) {
    width: 40%;
    height: 40%;
    top: 30%;
    left: 30%;
    animation-duration: 0.6s;
    border-top-color: var(--primary-color, #FF6B35);
  }
}

.loading-text {
  margin-top: 30rpx;
  font-size: 28rpx;
  color: #ffffff;
  letter-spacing: 2rpx;
}

/* 全局Toast */
.global-toast {
  position: fixed;
  top: 200rpx;
  left: 50%;
  transform: translateX(-50%) translateY(-100rpx);
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(20rpx);
  -webkit-backdrop-filter: blur(20rpx);
  border-radius: 16rpx;
  padding: 24rpx 40rpx;
  display: flex;
  align-items: center;
  gap: 16rpx;
  z-index: $z-toast;
  opacity: 0;
  transition: all 0.3s $ease-spring;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.3);
  
  &.toast-show {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
  
  &.toast-hiding {
    opacity: 0;
    transform: translateX(-50%) translateY(-20rpx);
  }
  
  &.success {
    background: rgba(16, 185, 129, 0.95);
  }
  
  &.error {
    background: rgba(239, 68, 68, 0.95);
  }
  
  &.warning {
    background: rgba(245, 158, 11, 0.95);
  }
  
  .toast-icon {
    width: 40rpx;
    height: 40rpx;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.2);
    @include flex-center;
    font-size: 24rpx;
    color: #ffffff;
    font-weight: bold;
  }
  
  .toast-message {
    font-size: 28rpx;
    color: #ffffff;
    font-weight: 500;
  }
}

/* 网络状态提示条 */
.network-status-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  z-index: $z-fullscreen;
  animation: slideDown 0.3s ease;
  transition: transform 0.3s ease, opacity 0.3s ease;
  
  &.offline {
    background: linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 100%);
  }
  
  &.online {
    background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%);
  }
  
  &.status-hiding {
    transform: translateY(-100%);
    opacity: 0;
  }
  
  .network-icon {
    font-size: 28rpx;
  }
  
  .network-text {
    font-size: 26rpx;
    color: #ffffff;
    font-weight: 500;
  }
}

/* 全局模态框 */
.global-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: $z-modal;
  @include flex-center;
}

.modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4rpx);
  animation: fadeIn 0.2s ease;
}

.modal-content {
  position: relative;
  background: var(--surface-color, #141414);
  border-radius: 24rpx;
  width: 560rpx;
  max-width: 90%;
  overflow: hidden;
  animation: zoomIn 0.3s $ease-spring;
  box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.4);
}

/* 确认对话框 */
.confirm-dialog {
  .dialog-header {
    padding: 40rpx 40rpx 20rpx;
    text-align: center;
    
    .dialog-title {
      font-size: 36rpx;
      font-weight: 600;
      color: var(--text-primary, #ffffff);
    }
  }
  
  .dialog-body {
    padding: 20rpx 40rpx 40rpx;
    text-align: center;
    
    .dialog-message {
      font-size: 30rpx;
      color: var(--text-secondary, rgba(255, 255, 255, 0.7));
      line-height: 1.5;
    }
  }
  
  .dialog-footer {
    display: flex;
    border-top: 1rpx solid var(--border-color, rgba(255, 255, 255, 0.1));
    
    .dialog-btn {
      flex: 1;
      padding: 30rpx;
      text-align: center;
      transition: background-color 0.2s ease;
      
      &:active {
        background-color: rgba(255, 255, 255, 0.05);
      }
      
      text {
        font-size: 32rpx;
        font-weight: 500;
      }
      
      &.btn-cancel {
        border-right: 1rpx solid var(--border-color, rgba(255, 255, 255, 0.1));
        
        text {
          color: var(--text-secondary, rgba(255, 255, 255, 0.7));
        }
      }
      
      &.btn-confirm {
        text {
          color: var(--primary-color, #FF6B35);
          font-weight: 600;
        }
      }
    }
  }
}

/* 页面进入动画 */
@keyframes pageEnter {
  from {
    opacity: 0;
    transform: translateX(50rpx);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes pageLeave {
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(-50rpx);
  }
}

/* 滑入动画 */
@keyframes slideDown {
  from {
    transform: translateY(-100%);
  }
  to {
    transform: translateY(0);
  }
}

/* 旋转动画 */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 淡入动画 */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* 缩放入场动画 */
@keyframes zoomIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* 通用工具类增强 */
.container-safe {
  padding-left: $page-padding;
  padding-right: $page-padding;
  padding-left: calc($page-padding + constant(safe-area-inset-left));
  padding-left: calc($page-padding + env(safe-area-inset-left));
  padding-right: calc($page-padding + constant(safe-area-inset-right));
  padding-right: calc($page-padding + env(safe-area-inset-right));
}

.page-wrapper {
  min-height: 100vh;
  background-color: var(--background-color, #0a0a0a);
  padding-bottom: calc(100rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(100rpx + env(safe-area-inset-bottom));
}

/* 内容区域 */
.content-area {
  padding: $space-4;
}

/* 卡片通用样式 */
.card-base {
  background: var(--surface-color, #141414);
  border-radius: 24rpx;
  border: 1rpx solid var(--border-color, rgba(255, 255, 255, 0.1));
  overflow: hidden;
}

/* 霓虹发光效果 */
.neon-glow {
  box-shadow: 0 0 10rpx var(--glow-color), 0 0 20rpx var(--glow-color);
}

/* 渐变文字 */
.gradient-text-brand {
  background: linear-gradient(135deg, var(--primary-color, #FF6B35), var(--secondary-color, #4ECDC4));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* VIP 文字效果 */
.vip-text-gradient {
  background: linear-gradient(135deg, #FFD700, #FFA500);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* 点击效果 */
.tap-highlight {
  transition: transform 0.1s ease, opacity 0.1s ease;
  
  &:active {
    transform: scale(0.98);
    opacity: 0.8;
  }
}

/* 悬浮效果 */
.hover-lift {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-4rpx);
    box-shadow: 0 12rpx 40rpx rgba(0, 0, 0, 0.15);
  }
}
</style>
