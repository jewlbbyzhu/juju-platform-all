<template>
  <view class="fans-container">
    <view class="header">
      <text class="title">我的粉丝</text>
      <text class="count">{{ fansList.length }}人</text>
    </view>

    <scroll-view class="list-container" scroll-y @scrolltolower="loadMore">
      <view 
        class="user-item" 
        v-for="user in fansList" 
        :key="user.id"
      >
        <image 
          class="user-avatar" 
          :src="user.avatar || '/static/default-avatar.png'" 
          mode="aspectFill"
          @tap="viewUserProfile(user)"
        ></image>

        <view class="user-info">
          <text class="user-name">{{ user.nickname || '匿名用户' }}</text>
          <text class="user-desc">{{ user.bio || '这个人很懒，什么都没写' }}</text>
        </view>

        <view class="user-actions">
          <button 
            class="action-btn follow" 
            v-if="!user.is_following"
            @tap="follow(user)"
          >
            <text>+ 关注</text>
          </button>
          <button 
            class="action-btn following" 
            v-else
            @tap="unfollow(user)"
          >
            <text>已关注</text>
          </button>
          <button 
            class="action-btn message" 
            @tap="sendMessage(user)"
          >
            <text>私信</text>
          </button>
        </view>
      </view>

      <view class="loading-more" v-if="loading">
        <text>加载中...</text>
      </view>

      <view class="no-more" v-if="!hasMore && fansList.length > 0">
        <text>没有更多了</text>
      </view>

      <view class="empty-state" v-if="fansList.length === 0 && !loading">
        <text class="empty-icon">👥</text>
        <text class="empty-text">还没有粉丝</text>
        <text class="empty-tip">多参与互动，吸引更多粉丝吧</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { socialApi } from '@/api/social.js'
import { useSocialStore } from '@/stores/social'

const socialStore = useSocialStore()

const fansList = ref([])
const loading = ref(false)
const hasMore = ref(true)
const page = ref(1)
const pageSize = ref(20)

const loadFans = async (reset = false) => {
  if (reset) {
    page.value = 1
    fansList.value = []
    hasMore.value = true
  }

  if (loading.value || !hasMore.value) return

  loading.value = true

  try {
    const res = await socialApi.getFansList({
      page: page.value,
      pageSize: pageSize.value
    })

    if (res.code === 0) {
      const newUsers = res.data.list || []
      if (reset) {
        fansList.value = newUsers
      } else {
        fansList.value = [...fansList.value, ...newUsers]
      }

      hasMore.value = newUsers.length >= pageSize.value
      page.value++
    }
  } catch (error) {
    uni.showToast({
      title: '加载失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}

const loadMore = () => {
  loadFans(false)
}

const follow = async (user) => {
  try {
    const res = await socialApi.followUser(user.id)

    if (res.code === 0) {
      user.is_following = true
      socialStore.updateFollowingCount(1)

      uni.showToast({
        title: '关注成功',
        icon: 'success'
      })
    } else {
      uni.showToast({
        title: res.message || '关注失败',
        icon: 'none'
      })
    }
  } catch (error) {
    uni.showToast({
      title: error.message || '网络错误',
      icon: 'none'
    })
  }
}

const unfollow = async (user) => {
  uni.showModal({
    title: '确认取消关注',
    content: `确定要取消关注${user.nickname || '该用户'}吗？`,
    success: async (res) => {
      if (res.confirm) {
        try {
          const res = await socialApi.unfollowUser(user.id)

          if (res.code === 0) {
            user.is_following = false
            socialStore.updateFollowingCount(-1)

            uni.showToast({
              title: '已取消关注',
              icon: 'success'
            })
          } else {
            uni.showToast({
              title: res.message || '操作失败',
              icon: 'none'
            })
          }
        } catch (error) {
          uni.showToast({
            title: error.message || '网络错误',
            icon: 'none'
          })
        }
      }
    }
  })
}

const sendMessage = (user) => {
  uni.navigateTo({
    url: `/pages/chat/chat?userId=${user.id}`
  })
}

const viewUserProfile = (user) => {
  uni.navigateTo({
    url: `/pages/user-profile/user-profile?userId=${user.id}`
  })
}

onMounted(() => {
  loadFans(true)
})
</script>

<style lang="scss" scoped>
.fans-container {
  min-height: 100vh;
  background: #000000;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  background: linear-gradient(180deg, rgba(102, 126, 234, 0.2) 0%, rgba(0, 0, 0, 0) 100%);
}

.title {
  font-size: 36rpx;
  font-weight: bold;
  color: #ffffff;
}

.count {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.6);
}

.list-container {
  height: calc(100vh - 120rpx);
}

.user-item {
  display: flex;
  align-items: center;
  padding: 30rpx;
  background: rgba(255, 255, 255, 0.02);
  border-bottom:1rpx solid rgba(255, 255, 255, 0.05);
  gap: 20rpx;
}

.user-avatar {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  flex-shrink: 0;
}

.user-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  overflow: hidden;
}

.user-name {
  font-size: 30rpx;
  font-weight: 500;
  color: #ffffff;
}

.user-desc {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.5);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-actions {
  display: flex;
  gap: 15rpx;
  flex-shrink: 0;
}

.action-btn {
  padding: 15rpx 30rpx;
  border-radius: 25rpx;
  font-size: 26rpx;
  color: #ffffff;
  border: none;

  &::after {
    border: none;
  }
}

.action-btn.follow {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.action-btn.following {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.7);
}

.action-btn.message {
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.7);
}

.loading-more,
.no-more,
.empty-state {
  text-align: center;
  padding: 60rpx;
  color: rgba(255, 255, 255, 0.5);
  font-size: 28rpx;
}

.empty-icon {
  display: block;
  font-size: 80rpx;
  margin-bottom: 20rpx;
}

.empty-text {
  display: block;
  font-size: 32rpx;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 10rpx;
}

.empty-tip {
  display: block;
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.4);
}
</style>
