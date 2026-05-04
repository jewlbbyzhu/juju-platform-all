<template>
  <view class="container">
    <view class="header">
      <text class="title">设置</text>
    </view>
    <view class="menu-list">
      <view class="menu-item" @tap="goToPage('/pages/edit-profile/edit-profile')">
        <text class="menu-text">编辑资料</text>
        <text class="arrow">›</text>
      </view>
      <view class="menu-item" @tap="goToPage('/pages/push-settings/push-settings')">
        <text class="menu-text">推送设置</text>
        <text class="arrow">›</text>
      </view>
      <view class="menu-item" @tap="goToPage('/pages/help/help')">
        <text class="menu-text">帮助中心</text>
        <text class="arrow">›</text>
      </view>
      <view class="menu-item" @tap="goToPage('/pages/about/about')">
        <text class="menu-text">关于我们</text>
        <text class="arrow">›</text>
      </view>
      <view class="menu-item danger" @tap="logout">
        <text class="menu-text">退出登录</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  methods: {
    goToPage(url) {
      uni.navigateTo({ url })
    },
    logout() {
      uni.showModal({
        title: '确认退出',
        content: '确定要退出登录吗？',
        success: (res) => {
          if (res.confirm) {
            uni.clearStorageSync()
            uni.showToast({ title: '已退出', icon: 'success' })
            setTimeout(() => {
              uni.reLaunch({ url: '/pages/login/login' })
            }, 1500)
          }
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background: #0a0a0a;
  padding: 30rpx;
}
.header {
  margin-bottom: 40rpx;
}
.title {
  font-size: 36rpx;
  font-weight: bold;
  color: #ffffff;
}
.menu-list {
  background: #1a1a1a;
  border-radius: 16rpx;
  overflow: hidden;
}
.menu-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #333;
}
.menu-item:last-child {
  border-bottom: none;
}
.menu-text {
  font-size: 30rpx;
  color: #ffffff;
}
.arrow {
  font-size: 36rpx;
  color: #666;
}
.danger .menu-text {
  color: #ff4d4f;
  text-align: center;
  width: 100%;
}
</style>
