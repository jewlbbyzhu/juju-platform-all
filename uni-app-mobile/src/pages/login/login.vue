<template>
  <view class="login-container">
    <view class="login-content">
      <view class="logo-section">
        <image class="logo" src="/static/logo.png" mode="aspectFit"></image>
        <text class="app-name">聚聚</text>
        <text class="app-slogan">发现身边的精彩聚会</text>
      </view>

      <view class="login-tabs">
        <view 
          class="tab-item" 
          :class="{ active: loginType === 'wechat' }"
          @tap="switchLoginType('wechat')"
        >
          <text>微信登录</text>
        </view>
        <view 
          class="tab-item" 
          :class="{ active: loginType === 'phone' }"
          @tap="switchLoginType('phone')"
        >
          <text>手机号登录</text>
        </view>
      </view>

      <view class="login-form">
        <view v-if="loginType === 'wechat'" class="wechat-login">
          <button class="login-btn" open-type="getUserInfo" @getuserinfo="handleGetUserInfo">
            <image class="wechat-icon" src="/static/wechat.png" mode="aspectFit"></image>
            <text>微信快速登录</text>
          </button>
        </view>

        <view v-if="loginType === 'phone'" class="phone-login">
          <view class="input-group">
            <input 
              class="phone-input" 
              type="number" 
              v-model="phoneNumber" 
              placeholder="请输入手机号" 
              maxlength="11"
            />
          </view>
          
          <view class="input-group">
            <input 
              class="code-input" 
              type="number" 
              v-model="verifyCode" 
              placeholder="请输入验证码" 
              maxlength="6"
            />
            <button 
              class="code-btn" 
              :disabled="codeDisabled" 
              @tap="sendVerifyCode"
            >
              <text>{{ codeText }}</text>
            </button>
          </view>

          <button class="login-btn" @tap="handlePhoneLogin">
            <text>登录</text>
          </button>
        </view>

        <view class="agreement">
          <text class="agreement-text">登录即表示同意</text>
          <text class="agreement-link" @tap="showUserAgreement">《用户协议》</text>
          <text class="agreement-text">和</text>
          <text class="agreement-link" @tap="showPrivacyPolicy">《隐私政策》</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { authApi } from '../../api/auth'

export default {
  data() {
    return {
      loginType: 'wechat',
      userInfo: null,
      phoneNumber: '',
      verifyCode: '',
      codeDisabled: false,
      countdown: 0,
      codeText: '获取验证码'
    }
  },

  methods: {
    switchLoginType(type) {
      this.loginType = type
    },

    handleGetUserInfo(e) {
      const { userInfo } = e.detail
      if (!userInfo) {
        uni.showToast({
          title: '获取用户信息失败',
          icon: 'none'
        })
        return
      }

      this.login(userInfo)
    },

    async sendVerifyCode() {
      if (!this.phoneNumber || this.phoneNumber.length !== 11) {
        uni.showToast({
          title: '请输入正确的手机号',
          icon: 'none'
        })
        return
      }

      if (this.countdown > 0) {
        return
      }

      try {
        uni.showLoading({
          title: '发送中...'
        })

        const res = await authApi.sendVerifyCode(this.phoneNumber)
        uni.hideLoading()

        if (res.code === 0) {
          uni.showToast({
            title: '验证码已发送',
            icon: 'success'
          })

          this.startCountdown()
        } else {
          uni.showToast({
            title: res.message || '发送失败',
            icon: 'none'
          })
        }
      } catch (error) {
        uni.hideLoading()
        uni.showToast({
          title: '网络错误',
          icon: 'none'
        })
      }
    },

    startCountdown() {
      this.countdown = 60
      this.codeDisabled = true
      this.codeText = `${this.countdown}s`

      const timer = setInterval(() => {
        this.countdown--
        this.codeText = `${this.countdown}s`

        if (this.countdown <= 0) {
          clearInterval(timer)
          this.codeDisabled = false
          this.codeText = '获取验证码'
        }
      }, 1000)
    },

    async handlePhoneLogin() {
      if (!this.phoneNumber || this.phoneNumber.length !== 11) {
        uni.showToast({
          title: '请输入正确的手机号',
          icon: 'none'
        })
        return
      }

      if (!this.verifyCode || this.verifyCode.length !== 6) {
        uni.showToast({
          title: '请输入正确的验证码',
          icon: 'none'
        })
        return
      }

      uni.showLoading({
        title: '登录中...'
      })

      try {
        const res = await authApi.phoneLogin(this.phoneNumber, this.verifyCode)
        uni.hideLoading()

        if (res.code === 0) {
          uni.setStorageSync('token', res.data.token)
          uni.setStorageSync('userInfo', res.data.user)

          uni.showToast({
            title: '登录成功',
            icon: 'success'
          })

          setTimeout(() => {
            uni.switchTab({
              url: '/pages/index/index'
            })
          }, 1500)
        } else {
          uni.showToast({
            title: res.message || '登录失败',
            icon: 'none'
          })
        }
      } catch (error) {
        uni.hideLoading()
        uni.showToast({
          title: '网络错误',
          icon: 'none'
        })
      }
    },

    async login(userInfo) {
      uni.showLoading({
        title: '登录中...'
      })

      try {
        const res = await authApi.login(userInfo)
        if (res.code === 0) {
          uni.setStorageSync('token', res.data.token)
          uni.setStorageSync('userInfo', res.data.user)

          uni.hideLoading()
          uni.showToast({
            title: '登录成功',
            icon: 'success'
          })

          setTimeout(() => {
            uni.switchTab({
              url: '/pages/index/index'
            })
          }, 1500)
        } else {
          uni.hideLoading()
          uni.showToast({
            title: res.message || '登录失败',
            icon: 'none'
          })
        }
      } catch (error) {
        uni.hideLoading()
        uni.showToast({
          title: '网络错误',
          icon: 'none'
        })
      }
    },

    showUserAgreement() {
      uni.showModal({
        title: '用户协议',
        content: '本协议是用户与聚聚平台之间关于使用聚聚服务所订立的协议。用户使用聚聚服务即视为同意本协议全部内容。',
        showCancel: false,
        confirmText: '我知道了'
      })
    },

    showPrivacyPolicy() {
      uni.showModal({
        title: '隐私政策',
        content: '聚聚重视用户隐私保护。我们收集的信息仅用于提供服务，不会泄露给第三方。',
        showCancel: false,
        confirmText: '我知道了'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx;
}

.login-content {
  width: 100%;
  max-width: 600rpx;
}

.logo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 80rpx;
}

.logo {
  width: 200rpx;
  height: 200rpx;
  margin-bottom: 30rpx;
}

.app-name {
  font-size: 48rpx;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 20rpx;
}

.app-slogan {
  font-size: 28rpx;
  color: rgba(255,255,255,0.8);
}

.login-tabs {
  display: flex;
  background: rgba(255,255,255,0.15);
  border-radius: 20rpx;
  margin-bottom: 60rpx;
  overflow: hidden;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 30rpx 0;
  font-size: 32rpx;
  color: rgba(255,255,255,0.6);
  position: relative;
  transition: all 0.3s;
}

.tab-item.active {
  color: #ffffff;
  font-weight: bold;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 80rpx;
  height: 4rpx;
  background: #ffffff;
  border-radius: 2rpx;
}

.login-form {
  background: rgba(255,255,255,0.15);
  border-radius: 20rpx;
  padding: 60rpx 40rpx;
  backdrop-filter: blur(10rpx);
}

.wechat-login {
  display: flex;
  justify-content: center;
}

.phone-login {
  display: flex;
  flex-direction: column;
  gap: 30rpx;
}

.input-group {
  display: flex;
  gap: 20rpx;
  align-items: center;
}

.phone-input,
.code-input {
  flex: 1;
  height: 88rpx;
  background: rgba(255,255,255,0.2);
  border: 2rpx solid rgba(255,255,255,0.3);
  border-radius: 12rpx;
  padding: 0 30rpx;
  font-size: 28rpx;
  color: #ffffff;
}

.code-input {
  flex: 1;
}

.code-btn {
  padding: 0 40rpx;
  height: 88rpx;
  background: rgba(255,255,255,0.3);
  border: none;
  border-radius: 12rpx;
  font-size: 24rpx;
  color: #ffffff;
  white-space: nowrap;
}

.code-btn:disabled {
  opacity: 0.5;
}

.login-btn {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 12rpx;
  font-size: 32rpx;
  color: #ffffff;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
}

.wechat-icon {
  width: 48rpx;
  height: 48rpx;
}

.agreement {
  margin-top: 40rpx;
  text-align: center;
  font-size: 24rpx;
  color: rgba(255,255,255,0.6);
}

.agreement-text {
  color: rgba(255,255,255,0.6);
}

.agreement-link {
  color: #ffffff;
  text-decoration: underline;
}
</style>
