<template>
  <view class="container">
    <view class="header">
      <image class="logo" src="/static/logo.png" mode="aspectFit" />
      <text class="app-name">聚聚 JUJU</text>
      <text class="version">版本 {{version}}</text>
    </view>
    <view class="content">
      <text class="desc">聚聚是一款专注于线下聚会预约的社交平台，帮助用户发现身边的精彩聚会，结识志同道合的朋友。</text>
      <view class="info-list">
        <view class="info-item">
          <text class="label">官方网站</text>
          <text class="value">https://hfparty.asia</text>
        </view>
        <view class="info-item">
          <text class="label">客服邮箱</text>
          <text class="value">support@hfparty.asia</text>
        </view>
      </view>
    </view>
    <view class="footer">
      <text class="copyright">© 2026 聚聚 JUJU. All rights reserved.</text>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      version: '1.0.0'
    }
  }
}
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background: #0a0a0a;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx 40rpx;
}
.header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 60rpx;
}
.logo {
  width: 160rpx;
  height: 160rpx;
  margin-bottom: 24rpx;
}
.app-name {
  font-size: 40rpx;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 12rpx;
}
.version {
  font-size: 26rpx;
  color: #666;
}
.content {
  width: 100%;
  margin-bottom: 60rpx;
}
.desc {
  display: block;
  font-size: 28rpx;
  color: #cccccc;
  line-height: 1.8;
  text-align: center;
  margin-bottom: 40rpx;
}
.info-list {
  background: #1a1a1a;
  border-radius: 16rpx;
  overflow: hidden;
}
.info-item {
  display: flex;
  justify-content: space-between;
  padding: 30rpx;
  border-bottom: 1rpx solid #333;
}
.info-item:last-child {
  border-bottom: none;
}
.label {
  font-size: 28rpx;
  color: #888;
}
.value {
  font-size: 28rpx;
  color: #ffffff;
}
.footer {
  margin-top: auto;
  padding-top: 40rpx;
}
.copyright {
  font-size: 24rpx;
  color: #444;
}
</style>
