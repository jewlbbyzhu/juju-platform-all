<template>
  <view class="immersive-viewer" v-if="visible">
    <view class="viewer-container" @tap="closeViewer">
      <swiper 
        class="image-swiper" 
        :current="currentIndex" 
        :autoplay="false" 
        @change="onSwiperChange"
      >
        <swiper-item v-for="(image, index) in images" :key="index">
          <image 
            class="viewer-image" 
            :src="image" 
            mode="aspectFit" 
            @tap.stop="toggleFullscreen"
            lazy-load
          ></image>
        </swiper-item>
      </swiper>

      <view class="viewer-info" v-if="showInfo">
        <text class="info-index">{{ currentIndex + 1 }}/{{ images.length }}</text>
        <view class="info-actions">
          <button class="action-btn" @tap.stop="downloadImage">
            <text>💾 下载</text>
          </button>
          <button class="action-btn" @tap.stop="shareImage">
            <text>📤 分享</text>
          </button>
        </view>
      </view>

      <view class="viewer-controls">
        <button class="control-btn prev-btn" @tap.stop="prevImage">
          <text>◀</text>
        </button>
        <button class="control-btn play-btn" @tap.stop="togglePlay">
          <text>{{ isPlaying ? '⏸' : '▶' }}</text>
        </button>
        <button class="control-btn next-btn" @tap.stop="nextImage">
          <text>▶</text>
        </button>
      </view>
    </view>

    <view class="fullscreen-container" v-if="isFullscreen" @tap="toggleFullscreen">
      <image 
        class="fullscreen-image" 
        :src="images[currentIndex]" 
        mode="aspectFit"
      ></image>
      <view class="fullscreen-info">
        <text class="fullscreen-index">{{ currentIndex + 1 }}/{{ images.length }}</text>
        <button class="close-btn" @tap.stop="closeViewer">
          <text>✕</text>
        </button>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    images: {
      type: Array,
      default: () => []
    },
    initialIndex: {
      type: Number,
      default: 0
    },
    showInfo: {
      type: Boolean,
      default: true
    }
  },

  data() {
    return {
      currentIndex: 0,
      isPlaying: false,
      isFullscreen: false,
      playTimer: null
    }
  },

  watch: {
    visible(newVal) {
      if (newVal) {
        this.currentIndex = this.initialIndex
        this.startAutoPlay()
      } else {
        this.stopAutoPlay()
      }
    }
  },

  beforeUnmount() {
    this.stopAutoPlay()
  },

  methods: {
    onSwiperChange(e) {
      this.currentIndex = e.detail.current
    },

    prevImage() {
      if (this.currentIndex > 0) {
        this.currentIndex--
      }
    },

    nextImage() {
      if (this.currentIndex < this.images.length - 1) {
        this.currentIndex++
      }
    },

    togglePlay() {
      this.isPlaying = !this.isPlaying
      if (this.isPlaying) {
        this.startAutoPlay()
      } else {
        this.stopAutoPlay()
      }
    },

    startAutoPlay() {
      this.stopAutoPlay()
      this.playTimer = setInterval(() => {
        if (this.currentIndex < this.images.length - 1) {
          this.currentIndex++
        } else {
          this.currentIndex = 0
        }
      }, 3000)
    },

    stopAutoPlay() {
      if (this.playTimer) {
        clearInterval(this.playTimer)
        this.playTimer = null
      }
    },

    toggleFullscreen() {
      this.isFullscreen = !this.isFullscreen
      if (this.isFullscreen) {
        this.stopAutoPlay()
      }
    },

    closeViewer() {
      this.stopAutoPlay()
      this.isFullscreen = false
      this.$emit('close')
    },

    downloadImage() {
      uni.showLoading({
        title: '下载中...'
      })

      uni.downloadFile({
        url: this.images[this.currentIndex],
        success: (res) => {
          uni.hideLoading()
          uni.showToast({
            title: '下载成功',
            icon: 'success'
          })
        },
        fail: () => {
          uni.hideLoading()
          uni.showToast({
            title: '下载失败',
            icon: 'none'
          })
        }
      })
    },

    shareImage() {
      uni.share({
        provider: 'weixin',
        scene: 'WXSceneSession',
        type: 0,
        imageUrl: this.images[this.currentIndex],
        success: () => {
          console.log('分享成功')
        },
        fail: () => {
          uni.showToast({
            title: '分享失败',
            icon: 'none'
          })
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.immersive-viewer {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10000;
  background: rgba(0, 0, 0, 0.95);
}

.viewer-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #000000;
}

.image-swiper {
  flex: 1;
  width: 100%;
  height: 100%;
}

.viewer-image {
  width: 100%;
  height: 100%;
}

.viewer-info {
  position: absolute;
  top: 40rpx;
  left: 40rpx;
  right: 40rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(0, 0, 0, 0.6);
  padding: 20rpx 30rpx;
  border-radius: 50rpx;
  backdrop-filter: blur(10rpx);
}

.info-index {
  font-size: 28rpx;
  color: #ffffff;
  font-weight: bold;
}

.info-actions {
  display: flex;
  gap: 15rpx;
}

.action-btn {
  padding: 12rpx 25rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 30rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.3);
  color: #ffffff;
  font-size: 24rpx;
  display: flex;
  align-items: center;
  gap: 10rpx;

  &::after {
    border: none;
  }

  &:active {
    background: rgba(255, 255, 255, 0.3);
  }
}

.viewer-controls {
  position: absolute;
  bottom: 40rpx;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 30rpx;
  background: rgba(0, 0, 0, 0.6);
  padding: 20rpx 40rpx;
  border-radius: 50rpx;
  backdrop-filter: blur(10rpx);
}

.control-btn {
  width: 80rpx;
  height: 80rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1rpx solid rgba(255, 255, 255, 0.3);
  color: #ffffff;
  font-size: 32rpx;

  &::after {
    border: none;
  }

  &:active {
    background: rgba(255, 255, 255, 0.3);
  }
}

.fullscreen-container {
  width: 100%;
  height: 100%;
  background: #000000;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.fullscreen-image {
  width: 100%;
  height: 100%;
}

.fullscreen-info {
  position: absolute;
  top: 40rpx;
  left: 40rpx;
  right: 40rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(0, 0, 0, 0.6);
  padding: 20rpx 30rpx;
  border-radius: 50rpx;
  backdrop-filter: blur(10rpx);
}

.fullscreen-index {
  font-size: 28rpx;
  color: #ffffff;
  font-weight: bold;
}

.close-btn {
  width: 60rpx;
  height: 60rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1rpx solid rgba(255, 255, 255, 0.3);
  color: #ffffff;
  font-size: 32rpx;

  &::after {
    border: none;
  }

  &:active {
    background: rgba(255, 255, 255, 0.3);
  }
}
</style>
