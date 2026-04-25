<template>
  <view class="custom-navbar" :class="[theme, { 'transparent': transparent, 'fixed': fixed }]">
    <!-- 状态栏占位 -->
    <view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>
    
    <!-- 导航栏内容 -->
    <view class="navbar-content" :style="{ height: navbarHeight + 'px' }">
      <!-- 左侧按钮区域 -->
      <view class="navbar-left">
        <view 
          v-if="showBack" 
          class="nav-btn back-btn"
          @click="handleBack"
          :class="{ 'has-animation': enableAnimation }"
        >
          <text class="iconfont icon-arrow-left"></text>
        </view>
        <view 
          v-if="showHome" 
          class="nav-btn home-btn"
          @click="handleHome"
          :class="{ 'has-animation': enableAnimation }"
        >
          <text class="iconfont icon-home"></text>
        </view>
        <slot name="left"></slot>
      </view>
      
      <!-- 中间标题区域 -->
      <view class="navbar-center">
        <text v-if="title" class="navbar-title" :class="{ 'title-animation': enableAnimation }">{{ title }}</text>
        <slot name="center"></slot>
      </view>
      
      <!-- 右侧按钮区域 -->
      <view class="navbar-right">
        <slot name="right"></slot>
        <view 
          v-if="showMenu" 
          class="nav-btn menu-btn"
          @click="handleMenu"
          :class="{ 'has-animation': enableAnimation }"
        >
          <text class="iconfont icon-menu"></text>
        </view>
        <view 
          v-if="showShare" 
          class="nav-btn share-btn"
          @click="handleShare"
          :class="{ 'has-animation': enableAnimation }"
        >
          <text class="iconfont icon-share"></text>
        </view>
      </view>
    </view>
    
    <!-- 底部渐变遮罩 -->
    <view v-if="showShadow" class="navbar-shadow"></view>
  </view>
</template>

<script>
export default {
  name: 'CustomNavbar',
  props: {
    title: {
      type: String,
      default: ''
    },
    theme: {
      type: String,
      default: 'dark',
      validator: (value) => ['light', 'dark', 'transparent', 'neon', 'minimal', 'vibrant'].includes(value)
    },
    transparent: {
      type: Boolean,
      default: false
    },
    fixed: {
      type: Boolean,
      default: true
    },
    showBack: {
      type: Boolean,
      default: true
    },
    showHome: {
      type: Boolean,
      default: false
    },
    showMenu: {
      type: Boolean,
      default: false
    },
    showShare: {
      type: Boolean,
      default: false
    },
    showShadow: {
      type: Boolean,
      default: true
    },
    enableAnimation: {
      type: Boolean,
      default: true
    },
    customBack: {
      type: Function,
      default: null
    }
  },
  data() {
    return {
      statusBarHeight: 0,
      navbarHeight: 44
    }
  },
  created() {
    this.getSystemInfo()
  },
  methods: {
    getSystemInfo() {
      const systemInfo = uni.getSystemInfoSync()
      this.statusBarHeight = systemInfo.statusBarHeight || 0
      
      // #ifdef MP-WEIXIN
      const menuButtonInfo = uni.getMenuButtonBoundingClientRect()
      this.navbarHeight = (menuButtonInfo.top - systemInfo.statusBarHeight) * 2 + menuButtonInfo.height
      // #endif
    },
    handleBack() {
      if (this.customBack) {
        this.customBack()
      } else {
        uni.navigateBack({
          fail: () => {
            uni.switchTab({
              url: '/pages/index/index'
            })
          }
        })
      }
    },
    handleHome() {
      uni.switchTab({
        url: '/pages/index/index'
      })
    },
    handleMenu() {
      this.$emit('menu')
    },
    handleShare() {
      this.$emit('share')
    }
  }
}
</script>

<style lang="scss" scoped>
.custom-navbar {
  position: relative;
  width: 100%;
  z-index: 1000;
  
  &.fixed {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
  }
  
  /* 亮色主题 */
  &.light {
    background: #ffffff;
    
    .navbar-title {
      color: #333333;
    }
    
    .nav-btn {
      color: #333333;
      background: rgba(0, 0, 0, 0.05);
      
      &:active {
        background: rgba(0, 0, 0, 0.1);
      }
    }
  }
  
  /* 暗色主题 */
  &.dark {
    background: #000000;
    
    .navbar-title {
      color: #ffffff;
    }
    
    .nav-btn {
      color: #ffffff;
      background: rgba(255, 255, 255, 0.1);
      
      &:active {
        background: rgba(255, 255, 255, 0.2);
      }
    }
  }
  
  /* 透明主题 */
  &.transparent {
    background: transparent;
    
    .navbar-title {
      color: #ffffff;
      text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.3);
    }
    
    .nav-btn {
      color: #ffffff;
      background: rgba(0, 0, 0, 0.3);
      backdrop-filter: blur(10rpx);
      
      &:active {
        background: rgba(0, 0, 0, 0.5);
      }
    }
  }
  
  /* 霓虹主题 */
  &.neon {
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    border-bottom: 1rpx solid rgba(255, 107, 53, 0.2);
    
    .navbar-title {
      color: #ffffff;
      text-shadow: 0 0 20rpx rgba(255, 107, 53, 0.5);
    }
    
    .nav-btn {
      color: #FF6B35;
      background: rgba(255, 107, 53, 0.1);
      border: 1rpx solid rgba(255, 107, 53, 0.3);
      
      &:active {
        background: rgba(255, 107, 53, 0.2);
        box-shadow: 0 0 20rpx rgba(255, 107, 53, 0.3);
      }
    }
  }
  
  /* 简约主题 */
  &.minimal {
    background: #ffffff;
    border-bottom: 1rpx solid #E8E8E8;
    
    .navbar-title {
      color: #333333;
      font-weight: 600;
    }
    
    .nav-btn {
      color: #4A90E2;
      background: transparent;
      border: 1rpx solid #E8E8E8;
      
      &:active {
        background: #F5F5F5;
      }
    }
  }
  
  /* 活力主题 */
  &.vibrant {
    background: linear-gradient(135deg, #FF4081 0%, #FF6B35 100%);
    
    .navbar-title {
      color: #ffffff;
      font-weight: 600;
    }
    
    .nav-btn {
      color: #ffffff;
      background: rgba(255, 255, 255, 0.2);
      
      &:active {
        background: rgba(255, 255, 255, 0.3);
      }
    }
  }
}

.status-bar {
  width: 100%;
}

.navbar-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20rpx;
  position: relative;
}

.navbar-left,
.navbar-right {
  display: flex;
  align-items: center;
  gap: 16rpx;
  min-width: 100rpx;
  flex-shrink: 0;
}

.navbar-right {
  justify-content: flex-end;
}

.navbar-center {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 20rpx;
}

.navbar-title {
  font-size: 34rpx;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 400rpx;
  
  &.title-animation {
    animation: titleSlideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }
}

.nav-btn {
  width: 64rpx;
  height: 64rpx;
  border-radius: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  &.has-animation {
    animation: btnScaleIn 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  }
  
  .iconfont {
    font-size: 32rpx;
  }
  
  &:active {
    transform: scale(0.95);
  }
}

.navbar-shadow {
  position: absolute;
  bottom: -20rpx;
  left: 0;
  right: 0;
  height: 20rpx;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.05), transparent);
  pointer-events: none;
}

/* 标题滑入动画 */
@keyframes titleSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 按钮缩放动画 */
@keyframes btnScaleIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
