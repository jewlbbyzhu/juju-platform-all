<template>
  <view class="scan-container">
    <view class="scan-header">
      <text class="scan-title">扫码验票</text>
      <view class="scan-stats" @tap="viewHistory">
        <text class="stats-text">今日验票: {{ todayCount }}次</text>
        <text class="stats-arrow">›</text>
      </view>
    </view>

    <view class="scan-content">
      <camera
        class="scan-camera"
        :device-position="cameraPosition"
        :flash="flashMode"
        @scancode="handleScanCode"
        @error="handleCameraError"
        :scan-area="scanArea"
      >
        <cover-view class="scan-overlay">
          <cover-view class="scan-frame">
            <cover-view class="scan-corner top-left"></cover-view>
            <cover-view class="scan-corner top-right"></cover-view>
            <cover-view class="scan-corner bottom-left"></cover-view>
            <cover-view class="scan-corner bottom-right"></cover-view>
            
            <cover-view class="scan-line" :class="{ scanning: isScanning }"></cover-view>
          </cover-view>
          
          <cover-view class="scan-tip">
            <cover-view class="tip-text">将二维码放入框内即可自动扫描</cover-view>
          </cover-view>
        </cover-view>
      </camera>

      <view class="scan-controls">
        <view class="control-item" @tap="toggleFlash">
          <text class="control-icon">{{ flashMode === 'off' ? '🔦' : '💡' }}</text>
          <text class="control-text">{{ flashMode === 'off' ? '开灯' : '关灯' }}</text>
        </view>

        <view class="control-item" @tap="switchCamera">
          <text class="control-icon">🔄</text>
          <text class="control-text">切换</text>
        </view>

        <view class="control-item" @tap="inputCode">
          <text class="control-icon">⌨️</text>
          <text class="control-text">手动输入</text>
        </view>
      </view>
    </view>

    <view class="scan-result" v-if="scanResult">
      <view class="result-card" :class="resultClass">
        <view class="result-icon">
          <text class="icon-text">{{ resultIcon }}</text>
        </view>
        
        <view class="result-content">
          <text class="result-title">{{ resultTitle }}</text>
          <text class="result-message">{{ resultMessage }}</text>
          
          <view class="ticket-info" v-if="scanResult.ticket">
            <view class="info-row">
              <text class="info-label">聚会名称:</text>
              <text class="info-value">{{ scanResult.ticket.partyName }}</text>
            </view>
            <view class="info-row">
              <text class="info-label">票型:</text>
              <text class="info-value">{{ scanResult.ticket.ticketType }}</text>
            </view>
            <view class="info-row">
              <text class="info-label">持票人:</text>
              <text class="info-value">{{ scanResult.ticket.userName }}</text>
            </view>
            <view class="info-row">
              <text class="info-label">手机号:</text>
              <text class="info-value">{{ scanResult.ticket.userPhone }}</text>
            </view>
          </view>
        </view>

        <view class="result-actions">
          <button class="action-btn secondary" @tap="scanAgain">继续扫描</button>
          <button class="action-btn primary" @tap="viewDetail" v-if="scanResult.id">查看详情</button>
        </view>
      </view>
    </view>

    <view class="scan-loading" v-if="loading">
      <view class="loading-content">
        <text class="loading-icon">⏳</text>
        <text class="loading-text">正在验证票券...</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { scanApi } from '@/api/scan.js'

const cameraPosition = ref('back')
const flashMode = ref('off')
const scanArea = ref({ left: 20, top: 20, width: 60, height: 60 })
const isScanning = ref(false)
const loading = ref(false)
const scanResult = ref(null)
const todayCount = ref(0)
const scanInterval = ref(null)

const resultClass = computed(() => {
  if (!scanResult.value) return ''
  return scanResult.value.status === 'success' ? 'success' : 
         scanResult.value.status === 'used' ? 'used' : 'invalid'
})

const resultIcon = computed(() => {
  if (!scanResult.value) return ''
  return scanResult.value.status === 'success' ? '✅' : 
         scanResult.value.status === 'used' ? '📋' : '❌'
})

const resultTitle = computed(() => {
  if (!scanResult.value) return ''
  return scanResult.value.status === 'success' ? '验票成功' : 
         scanResult.value.status === 'used' ? '票券已使用' : '票券无效'
})

const resultMessage = computed(() => {
  if (!scanResult.value) return ''
  return scanResult.value.message || ''
})

const requestCameraPermission = async () => {
  try {
    const res = await uni.getSetting()
    if (!res.authSetting['scope.camera']) {
      await uni.authorize({ scope: 'scope.camera' })
    }
  } catch (error) {
    uni.showModal({
      title: '需要相机权限',
      content: '扫码验票需要使用相机，请在设置中开启相机权限',
      confirmText: '去设置',
      success: (res) => {
        if (res.confirm) {
          uni.openSetting()
        }
      }
    })
    return false
  }
  return true
}

const loadTodayStats = async () => {
  try {
    const res = await scanApi.getScanStats()
    if (res.code === 0) {
      todayCount.value = res.data.todayCount || 0
    }
  } catch (error) {
    // console.error('Failed to load scan stats:', error)
  }
}

const handleScanCode = async (result) => {
  if (loading.value || !result || !result.result) return

  loading.value = true
  isScanning.value = false

  try {
    const res = await scanApi.scanQRCode(result.result)
    
    if (res.code === 0) {
      scanResult.value = res.data
      todayCount.value++
      
      uni.vibrateShort({ type: 'success' })
    } else {
      scanResult.value = {
        status: 'invalid',
        message: res.message || '票券验证失败'
      }
      
      uni.vibrateShort({ type: 'warning' })
    }
  } catch (error) {
    scanResult.value = {
      status: 'invalid',
      message: error.message || '网络错误，请重试'
    }
    
    uni.vibrateShort({ type: 'warning' })
  } finally {
    loading.value = false
  }
}

const handleCameraError = (error) => {
  // console.error('Camera error:', error)
  uni.showToast({
    title: '相机启动失败',
    icon: 'none',
    duration: 2000
  })
}

const toggleFlash = () => {
  flashMode.value = flashMode.value === 'off' ? 'on' : 'off'
}

const switchCamera = () => {
  cameraPosition.value = cameraPosition.value === 'back' ? 'front' : 'back'
}

const inputCode = () => {
  uni.showModal({
    title: '手动输入票号',
    editable: true,
    placeholderText: '请输入票号',
    success: async (res) => {
      if (res.confirm && res.content) {
        loading.value = true
        try {
          const res = await scanApi.scanQRCode(res.content.trim())
          if (res.code === 0) {
            scanResult.value = res.data
            todayCount.value++
            uni.vibrateShort({ type: 'success' })
          } else {
            scanResult.value = {
              status: 'invalid',
              message: res.message || '票券验证失败'
            }
            uni.vibrateShort({ type: 'warning' })
          }
        } catch (error) {
          scanResult.value = {
            status: 'invalid',
            message: error.message || '网络错误，请重试'
          }
          uni.vibrateShort({ type: 'warning' })
        } finally {
          loading.value = false
        }
      }
    }
  })
}

const scanAgain = () => {
  scanResult.value = null
  isScanning.value = true
}

const viewDetail = () => {
  if (scanResult.value && scanResult.value.id) {
    uni.navigateTo({
      url: `/pages/scan-detail/scan-detail?id=${scanResult.value.id}`
    })
  }
}

const viewHistory = () => {
  uni.navigateTo({
    url: '/pages/scan-history/scan-history'
  })
}

const startScanAnimation = () => {
  isScanning.value = true
  scanInterval.value = setInterval(() => {
    isScanning.value = !isScanning.value
  }, 2000)
}

onMounted(async () => {
  const hasPermission = await requestCameraPermission()
  if (hasPermission) {
    await loadTodayStats()
    startScanAnimation()
  }
})

onUnmounted(() => {
  if (scanInterval.value) {
    clearInterval(scanInterval.value)
  }
})
</script>

<style lang="scss" scoped>
.scan-container {
  min-height: 100vh;
  background: #000000;
  display: flex;
  flex-direction: column;
}

.scan-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  background: linear-gradient(180deg, rgba(102, 126, 234, 0.2) 0%, rgba(0, 0, 0, 0) 100%);
}

.scan-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #ffffff;
}

.scan-stats {
  display: flex;
  align-items: center;
  gap: 10rpx;
  padding: 15rpx 25rpx;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 30rpx;
  backdrop-filter: blur(10px);
}

.stats-text {
  font-size: 24rpx;
  color: #ffffff;
}

.stats-arrow {
  font-size: 28rpx;
  color: #ffffff;
}

.scan-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.scan-camera {
  width: 100%;
  height: 100%;
}

.scan-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.scan-frame {
  position: relative;
  width: 500rpx;
  height: 500rpx;
  border: 2rpx solid rgba(255, 255, 255, 0.3);
  border-radius: 20rpx;
  overflow: hidden;
}

.scan-corner {
  position: absolute;
  width: 80rpx;
  height: 80rpx;
  border: 4rpx solid #667eea;
  border-radius: 10rpx;
}

.top-left {
  top: -2rpx;
  left: -2rpx;
  border-right: none;
  border-bottom: none;
}

.top-right {
  top: -2rpx;
  right: -2rpx;
  border-left: none;
  border-bottom: none;
}

.bottom-left {
  bottom: -2rpx;
  left: -2rpx;
  border-right: none;
  border-top: none;
}

.bottom-right {
  bottom: -2rpx;
  right: -2rpx;
  border-left: none;
  border-top: none;
}

.scan-line {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4rpx;
  background: linear-gradient(90deg, transparent, #667eea, transparent);
  animation: scan 2s ease-in-out infinite;
  opacity: 0;
}

.scan-line.scanning {
  opacity: 1;
}

@keyframes scan {
  0% {
    top: 0;
  }
  100% {
    top: 100%;
  }
}

.scan-tip {
  margin-top: 60rpx;
  padding: 20rpx 40rpx;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 30rpx;
  backdrop-filter: blur(10px);
}

.tip-text {
  font-size: 28rpx;
  color: #ffffff;
}

.scan-controls {
  position: absolute;
  bottom: 100rpx;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 60rpx;
  padding: 30rpx;
}

.control-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10rpx;
}

.control-icon {
  font-size: 48rpx;
}

.control-text {
  font-size: 24rpx;
  color: #ffffff;
}

.scan-result {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 30rpx;
}

.result-card {
  width: 100%;
  max-width: 600rpx;
  background: #1a1a1a;
  border-radius: 20rpx;
  padding: 40rpx;
  box-shadow: 0 10rpx 40rpx rgba(0, 0, 0, 0.5);
}

.result-card.success {
  border: 2rpx solid #52c41a;
}

.result-card.used {
  border: 2rpx solid #faad14;
}

.result-card.invalid {
  border: 2rpx solid #ff4d4f;
}

.result-icon {
  text-align: center;
  margin-bottom: 30rpx;
}

.icon-text {
  font-size: 80rpx;
}

.result-content {
  margin-bottom: 30rpx;
}

.result-title {
  display: block;
  font-size: 36rpx;
  font-weight: bold;
  color: #ffffff;
  text-align: center;
  margin-bottom: 20rpx;
}

.result-message {
  display: block;
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.7);
  text-align: center;
  margin-bottom: 30rpx;
}

.ticket-info {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 15rpx;
  padding: 25rpx;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15rpx;

  &:last-child {
    margin-bottom: 0;
  }
}

.info-label {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.6);
}

.info-value {
  font-size: 26rpx;
  color: #ffffff;
  font-weight: 500;
}

.result-actions {
  display: flex;
  gap: 20rpx;
}

.action-btn {
  flex: 1;
  padding: 25rpx;
  border-radius: 30rpx;
  font-size: 28rpx;
  color: #ffffff;
  border: none;

  &::after {
    border: none;
  }
}

.action-btn.secondary {
  background: rgba(255, 255, 255, 0.1);
}

.action-btn.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.scan-loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20rpx;
}

.loading-icon {
  font-size: 60rpx;
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  font-size: 28rpx;
  color: #ffffff;
}
</style>
