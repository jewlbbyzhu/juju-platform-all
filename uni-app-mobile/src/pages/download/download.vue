<template>
  <view class="download-page">
    <view class="header">
      <view class="logo"><text>聚</text></view>
      <text class="title">聚聚</text>
      <text class="subtitle">发现精彩聚会，结识志同道合的朋友</text>
    </view>
    
    <view class="content">
      <view class="platform-card">
        <view class="platform-header">
          <view class="platform-icon android"><text>🤖</text></view>
          <view class="platform-info">
            <text class="platform-name">Android 版</text>
            <text class="platform-desc">适用于 Android 8.0 及以上</text>
          </view>
        </view>
        <button class="download-btn primary" @click="downloadAndroid">
          <text>📥 立即下载 APK</text>
        </button>
      </view>
      
      <view class="platform-card">
        <view class="platform-header">
          <view class="platform-icon ios"><text>🍎</text></view>
          <view class="platform-info">
            <text class="platform-name">iOS 版</text>
            <text class="platform-desc">适用于 iOS 14.0 及以上</text>
          </view>
        </view>
        <button class="download-btn disabled" disabled>
          <text>⏳ 即将上线</text>
        </button>
      </view>
      
      <view class="version-info">
        <text class="badge">最新版本</text>
        <text class="version-text">Android v1.0.0</text>
        <text class="version-date">发布于 2026年2月19日</text>
      </view>
    </view>
    
    <view class="footer">
      <text class="footer-text">下载即表示您同意 <text class="link" @click="goToPrivacy">隐私政策</text> 和 <text class="link" @click="goToTerms">服务条款</text></text>
      <text class="copyright">© 2026 聚聚. All rights reserved.</text>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'

const downloadUrl = ref('https://hfparty.asia/download/juju-app-latest.apk')

const downloadAndroid = () => {
  // 在小程序中使用 web-view 或引导用户复制链接
  uni.setClipboardData({
    data: downloadUrl.value,
    success: () => {
      uni.showModal({
        title: '下载链接已复制',
        content: '请在浏览器中打开链接下载 APK',
        showCancel: false
      })
    }
  })
}

const goToPrivacy = () => {
  uni.navigateTo({
    url: '/pages/webview/webview?url=https://hfparty.asia/privacy.html'
  })
}

const goToTerms = () => {
  uni.navigateTo({
    url: '/pages/webview/webview?url=https://hfparty.asia/terms.html'
  })
}
</script>

<style scoped>
.download-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #fff5f0 0%, #ffffff 50%, #fff9f5 100%);
  display: flex;
  flex-direction: column;
}

.header {
  background: linear-gradient(135deg, #ff6b35 0%, #ff8c5a 100%);
  padding: 60rpx 40rpx;
  text-align: center;
  color: white;
}

.logo {
  width: 120rpx;
  height: 120rpx;
  background: white;
  border-radius: 30rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 30rpx;
}

.logo text {
  font-size: 60rpx;
  font-weight: bold;
  color: #ff6b35;
}

.title {
  font-size: 48rpx;
  font-weight: bold;
  display: block;
  margin-bottom: 16rpx;
}

.subtitle {
  font-size: 28rpx;
  opacity: 0.9;
  display: block;
}

.content {
  flex: 1;
  padding: 40rpx;
}

.platform-card {
  background: #f8f9fa;
  border-radius: 32rpx;
  padding: 40rpx;
  margin-bottom: 30rpx;
  border: 2rpx solid transparent;
  transition: all 0.3s;
}

.platform-card:active {
  border-color: #ff6b35;
}

.platform-header {
  display: flex;
  align-items: center;
  margin-bottom: 30rpx;
}

.platform-icon {
  width: 96rpx;
  height: 96rpx;
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 24rpx;
}

.platform-icon.android {
  background: linear-gradient(135deg, #3DDC84 0%, #2E8B57 100%);
}

.platform-icon.ios {
  background: linear-gradient(135deg, #007AFF 0%, #5856D6 100%);
}

.platform-icon text {
  font-size: 48rpx;
}

.platform-info {
  flex: 1;
}

.platform-name {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
}

.platform-desc {
  font-size: 26rpx;
  color: #666;
  display: block;
}

.download-btn {
  width: 100%;
  padding: 30rpx;
  border-radius: 24rpx;
  border: none;
  font-size: 32rpx;
  font-weight: 600;
  text-align: center;
}

.download-btn.primary {
  background: linear-gradient(135deg, #ff6b35 0%, #ff8c5a 100%);
  color: white;
}

.download-btn.primary:active {
  opacity: 0.9;
}

.download-btn.disabled {
  background: #ccc;
  color: #666;
}

.version-info {
  text-align: center;
  padding: 40rpx;
  background: #f8f9fa;
  border-radius: 24rpx;
  margin-top: 40rpx;
}

.badge {
  display: inline-block;
  background: #ff6b35;
  color: white;
  padding: 8rpx 24rpx;
  border-radius: 40rpx;
  font-size: 24rpx;
  font-weight: 600;
}

.version-text {
  display: block;
  margin-top: 20rpx;
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.version-date {
  display: block;
  margin-top: 12rpx;
  font-size: 26rpx;
  color: #999;
}

.footer {
  text-align: center;
  padding: 40rpx;
  color: #999;
  font-size: 24rpx;
}

.footer-text {
  display: block;
  margin-bottom: 16rpx;
}

.link {
  color: #ff6b35;
}

.copyright {
  display: block;
  font-size: 22rpx;
}
</style>
