<template>
  <view class="container">
    <view class="header">
      <text class="title">编辑资料</text>
    </view>
    <view class="form">
      <view class="form-item">
        <text class="label">昵称</text>
        <input class="input" v-model="form.nickname" placeholder="请输入昵称" />
      </view>
      <view class="form-item">
        <text class="label">简介</text>
        <textarea class="textarea" v-model="form.bio" placeholder="个人简介" />
      </view>
      <button class="save-btn" @tap="saveProfile">保存</button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      form: {
        nickname: '',
        bio: ''
      }
    }
  },
  onLoad() {
    const userInfo = uni.getStorageSync('userInfo')
    if (userInfo) {
      this.form.nickname = userInfo.nickname || ''
      this.form.bio = userInfo.bio || ''
    }
  },
  methods: {
    async saveProfile() {
      uni.showLoading({ title: '保存中...' })
      try {
        // TODO: 调用 API 保存资料
        uni.hideLoading()
        uni.showToast({ title: '保存成功', icon: 'success' })
        setTimeout(() => uni.navigateBack(), 1500)
      } catch (e) {
        uni.hideLoading()
        uni.showToast({ title: '保存失败', icon: 'none' })
      }
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
.form-item {
  margin-bottom: 30rpx;
}
.label {
  display: block;
  font-size: 28rpx;
  color: #cccccc;
  margin-bottom: 16rpx;
}
.input, .textarea {
  width: 100%;
  height: 88rpx;
  background: #1a1a1a;
  border: 1rpx solid #333;
  border-radius: 12rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
  color: #ffffff;
  box-sizing: border-box;
}
.textarea {
  height: 200rpx;
  padding: 24rpx;
}
.save-btn {
  margin-top: 60rpx;
  width: 100%;
  height: 88rpx;
  background: linear-gradient(135deg, #FF6B35, #FF8E53);
  border: none;
  border-radius: 12rpx;
  font-size: 32rpx;
  color: #ffffff;
  font-weight: bold;
}
</style>
