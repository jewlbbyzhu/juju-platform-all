<template>
  <view class="user-info-modal" v-if="visible" @tap="handleClose">
    <view class="modal-content" @tap.stop>
      <view class="modal-header">
        <text class="modal-title">用户信息</text>
        <view class="close-btn" @tap="handleClose">
          <text class="close-icon">×</text>
        </view>
      </view>

      <view class="modal-body">
        <view class="user-basic">
          <image class="user-avatar" :src="userInfo.avatar || '/static/avatar-default.png'" mode="aspectFill"></image>
          <view class="user-info">
            <text class="user-nickname">{{ userInfo.nickname || '未知用户' }}</text>
            <view class="user-badges">
              <view v-if="userInfo.is_vip" class="vip-badge">
                <text class="vip-text">VIP</text>
              </view>
              <view class="level-badge">
                <text class="level-text">Lv{{ userInfo.level || 1 }}</text>
              </view>
            </view>
          </view>
        </view>

        <view class="user-stats">
          <view class="stat-item">
            <text class="stat-value">{{ userInfo.participated_count || 0 }}</text>
            <text class="stat-label">参与聚会</text>
          </view>
          <view class="stat-divider"></view>
          <view class="stat-item">
            <text class="stat-value">{{ userInfo.created_count || 0 }}</text>
            <text class="stat-label">创建聚会</text>
          </view>
          <view class="stat-divider"></view>
          <view class="stat-item">
            <text class="stat-value">{{ userInfo.follower_count || 0 }}</text>
            <text class="stat-label">粉丝</text>
          </view>
        </view>

        <view class="action-buttons">
          <button 
            v-if="!isCurrentUser" 
            class="action-btn follow-btn" 
            :class="{ following: isFollowing }"
            @tap="handleFollow"
          >
            <text>{{ isFollowing ? '已关注' : '关注' }}</text>
          </button>

          <button 
            v-if="!isCurrentUser && isFollowing" 
            class="action-btn message-btn"
            @tap="handleMessage"
          >
            <text>私信</text>
          </button>

          <button 
            v-if="!isCurrentUser" 
            class="action-btn block-btn"
            @tap="handleBlock"
          >
            <text>拉黑</text>
          </button>

          <button 
            class="action-btn profile-btn"
            @tap="handleViewProfile"
          >
            <text>查看主页</text>
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { followApi } from '@/api/follow'
import { messageApi } from '@/api/message'
import { userApi } from '@/api/user'

export default {
  name: 'UserInfoModal',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    userInfo: {
      type: Object,
      default: () => ({})
    },
    currentUserId: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      isFollowing: false,
      isCurrentUser: false
    }
  },
  watch: {
    userInfo: {
      handler(newVal) {
        if (newVal && newVal.id) {
          this.checkFollowStatus()
          this.checkCurrentUser()
        }
      },
      immediate: true,
      deep: true
    }
  },
  methods: {
    async checkFollowStatus() {
      if (!this.currentUserId || !this.userInfo.id) {
        return
      }

      try {
        const res = await followApi.checkFollow(this.userInfo.id)
        if (res.code === 0) {
          this.isFollowing = res.data.isFollowing || false
        }
      } catch (error) {
        console.error('检查关注状态失败:', error)
      }
    },

    checkCurrentUser() {
      this.isCurrentUser = this.currentUserId === this.userInfo.id
    },

    async handleFollow() {
      if (!this.currentUserId || !this.userInfo.id) {
        return
      }

      try {
        uni.showLoading({
          title: this.isFollowing ? '取消关注中...' : '关注中...'
        })

        const res = this.isFollowing 
          ? await followApi.unfollow(this.userInfo.id)
          : await followApi.follow(this.userInfo.id)

        uni.hideLoading()

        if (res.code === 0) {
          this.isFollowing = !this.isFollowing
          uni.showToast({
            title: this.isFollowing ? '关注成功' : '已取消关注',
            icon: 'success'
          })
          this.$emit('follow-change', { 
            userId: this.userInfo.id, 
            isFollowing: this.isFollowing 
          })
        } else {
          uni.showToast({
            title: res.message || '操作失败',
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

    async handleMessage() {
      if (!this.isFollowing) {
        uni.showToast({
          title: '需要互关才能私信',
          icon: 'none'
        })
        return
      }

      uni.navigateTo({
        url: `/pages/message/chat?userId=${this.userInfo.id}`
      })
    },

    async handleBlock() {
      uni.showModal({
        title: '确认拉黑',
        content: '确定要拉黑该用户吗？拉黑后将无法看到对方的内容。',
        success: async (res) => {
          if (res.confirm) {
            try {
              uni.showLoading({
                title: '拉黑中...'
              })

              const blockRes = await userApi.blockUser(this.userInfo.id)
              uni.hideLoading()

              if (blockRes.code === 0) {
                uni.showToast({
                  title: '拉黑成功',
                  icon: 'success'
                })
                this.handleClose()
              } else {
                uni.showToast({
                  title: blockRes.message || '操作失败',
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
          }
        }
      })
    },

    handleViewProfile() {
      uni.navigateTo({
        url: `/pages/user/profile?userId=${this.userInfo.id}`
      })
    },

    handleClose() {
      this.$emit('close')
    }
  }
}
</script>

<style lang="scss" scoped>
.user-info-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-content {
  width: 600rpx;
  background: #ffffff;
  border-radius: 24rpx;
  overflow: hidden;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(100rpx);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.modal-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
}

.close-btn {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #f5f5f5;
}

.close-icon {
  font-size: 48rpx;
  color: #999999;
  line-height: 1;
}

.modal-body {
  padding: 40rpx 30rpx;
}

.user-basic {
  display: flex;
  align-items: center;
  margin-bottom: 40rpx;
}

.user-avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 60rpx;
  margin-right: 24rpx;
  border: 4rpx solid #f0f0f0;
}

.user-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.user-nickname {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
}

.user-badges {
  display: flex;
  gap: 12rpx;
}

.vip-badge {
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  padding: 4rpx 16rpx;
  border-radius: 20rpx;
}

.vip-text {
  font-size: 20rpx;
  font-weight: bold;
  color: #ffffff;
}

.level-badge {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 4rpx 16rpx;
  border-radius: 20rpx;
}

.level-text {
  font-size: 20rpx;
  font-weight: bold;
  color: #ffffff;
}

.user-stats {
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 30rpx 0;
  margin-bottom: 40rpx;
  background: #f8f9fa;
  border-radius: 16rpx;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}

.stat-value {
  font-size: 36rpx;
  font-weight: bold;
  color: #333333;
}

.stat-label {
  font-size: 24rpx;
  color: #999999;
}

.stat-divider {
  width: 1rpx;
  height: 60rpx;
  background: #e0e0e0;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.action-btn {
  width: 100%;
  height: 88rpx;
  border-radius: 12rpx;
  font-size: 28rpx;
  font-weight: bold;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.follow-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
}

.follow-btn.following {
  background: #f0f0f0;
  color: #999999;
}

.message-btn {
  background: linear-gradient(135deg, #FF6B35 0%, #FF8E53 100%);
  color: #ffffff;
}

.block-btn {
  background: #f0f0f0;
  color: #ff4d4f;
}

.profile-btn {
  background: #f0f0f0;
  color: #333333;
}
</style>