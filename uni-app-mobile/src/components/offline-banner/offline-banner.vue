<template>
  <view class="offline-banner" v-if="!isOnline">
    <view class="offline-content">
      <text class="offline-icon">📶</text>
      <text class="offline-text">网络已断开，部分功能可能受限</text>
      <button class="retry-btn" @tap="retry">
        <text>重试</text>
      </button>
    </view>
  </view>
</template>

<script>
import OfflineManager from '@/utils/offlineManager'

export default {
  data() {
    return {
      isOnline: true
    }
  },

  mounted() {
    this.checkNetworkStatus()
    OfflineManager.onNetworkStatusChange((status) => {
      this.isOnline = status.isConnected
    })
  },

  beforeUnmount() {
    this.stopChecking()
  },

  methods: {
    checkNetworkStatus() {
      this.isOnline = OfflineManager.isOnline()
      this.startChecking()
    },

    startChecking() {
      this.checkTimer = setInterval(() => {
        this.isOnline = OfflineManager.isOnline()
      }, 5000)
    },

    stopChecking() {
      if (this.checkTimer) {
        clearInterval(this.checkTimer)
      }
    },

    retry() {
      uni.showToast({
        title: '正在重试...',
        icon: 'loading',
        duration: 2000
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.offline-banner {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 9999;
  background: linear-gradient(135deg, #FF6B35 0%, #FF8E53 100%);
  padding: 20rpx 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.3);
}

.offline-content {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.offline-icon {
  font-size: 40rpx;
}

.offline-text {
  font-size: 28rpx;
  color: #ffffff;
  font-weight: bold;
}

.retry-btn {
  padding: 12rpx 30rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 30rpx;
  border: 2rpx solid #ffffff;
  color: #ffffff;
  font-size: 24rpx;
  font-weight: bold;

  &::after {
    border: none;
  }

  &:active {
    background: rgba(255, 255, 255, 0.3);
  }
}
</style>
