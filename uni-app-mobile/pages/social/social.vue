<template>
  <view class="social-container">
    <view class="tabs-wrapper">
      <view class="tab-item" :class="{ active: currentTab === 'followers' }" @tap="switchTab('followers')">
        <text class="tab-text">粉丝</text>
        <text class="tab-count">{{ followersCount }}</text>
      </view>
      <view class="tab-item" :class="{ active: currentTab === 'following' }" @tap="switchTab('following')">
        <text class="tab-text">关注</text>
        <text class="tab-count">{{ followingCount }}</text>
      </view>
    </view>

    <scroll-view class="user-list" scroll-y @scrolltolower="loadMore">
      <view 
        class="user-item" 
        v-for="user in userList" 
        :key="user.id"
      >
        <image 
          class="user-avatar" 
          :src="user.avatar || '/static/default-avatar.png'" 
          mode="aspectFill"
          @tap="goToProfile(user.id)"
        ></image>

        <view class="user-info">
          <view class="user-header">
            <text class="user-name">{{ user.nickname || '匿名用户' }}</text>
            <view class="user-badge" v-if="user.is_vip">
              <text class="badge-text">VIP</text>
            </view>
          </view>

          <text class="user-bio">{{ user.bio || '这个人很懒，什么都没写' }}</text>

          <view class="user-stats">
            <text class="stat-item">粉丝 {{ user.followers_count || 0 }}</text>
            <text class="stat-item">关注 {{ user.following_count || 0 }}</text>
            <text class="stat-item">聚会 {{ user.parties_count || 0 }}</text>
          </view>
        </view>

        <view class="user-actions">
          <button 
            class="action-btn" 
            :class="{ following: user.is_following }"
            @tap="toggleFollow(user)"
          >
            <text>{{ user.is_following ? '已关注' : '关注' }}</text>
          </button>

          <view class="more-btn" @tap="showMoreActions(user)">
            <text>⋯</text>
          </view>
        </view>
      </view>

      <view class="loading-more" v-if="loading">
        <text>加载中...</text>
      </view>

      <view class="no-more" v-if="!hasMore && userList.length > 0">
        <text>没有更多了</text>
      </view>

      <view class="empty-state" v-if="userList.length === 0 && !loading">
        <image class="empty-icon" src="/static/empty.png" mode="aspectFit"></image>
        <text class="empty-text">{{ emptyText }}</text>
        <text class="empty-tip">{{ emptyTip }}</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { socialApi } from '@/api/social.js'

const props = defineProps({
  userId: {
    type: [String, Number],
    default: ''
  }
})

const currentTab = ref('followers')
const followers = ref([])
const following = ref([])
const followersCount = ref(0)
const followingCount = ref(0)
const loading = ref(false)
const hasMore = ref(true)
const page = ref(1)
const pageSize = ref(20)

const userList = computed(() => {
  return currentTab.value === 'followers' ? followers.value : following.value
})

const emptyText = computed(() => {
  return currentTab.value === 'followers' ? '暂无粉丝' : '暂无关注'
})

const emptyTip = computed(() => {
  return currentTab.value === 'followers' ? '快去发布精彩聚会吧' : '去发现更多有趣的人'
})

const switchTab = (tab) => {
  if (currentTab.value === tab) return
  currentTab.value = tab
  page.value = 1
  hasMore.value = true
  loadUsers()
}

const loadUsers = async (reset = false) => {
  if (reset) {
    page.value = 1
    hasMore.value = true
  }

  if (loading.value || !hasMore.value) return

  loading.value = true

  try {
    const api = currentTab.value === 'followers' ? socialApi.getFollowers : socialApi.getFollowing
    const targetUserId = props.userId || ''

    const res = await api(targetUserId, {
      page: page.value,
      pageSize: pageSize.value
    })

    if (res.code === 0) {
      const newUsers = res.data.list || []
      
      if (currentTab.value === 'followers') {
        if (reset) {
          followers.value = newUsers
        } else {
          followers.value = [...followers.value, ...newUsers]
        }
        followersCount.value = res.data.total || 0
      } else {
        if (reset) {
          following.value = newUsers
        } else {
          following.value = [...following.value, ...newUsers]
        }
        followingCount.value = res.data.total || 0
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
  loadUsers()
}

const toggleFollow = async (user) => {
  try {
    if (user.is_following) {
      await socialApi.unfollowUser(user.id)
      user.is_following = false
      followingCount.value = Math.max(0, followingCount.value - 1)
    } else {
      await socialApi.followUser(user.id)
      user.is_following = true
      followingCount.value = followingCount.value + 1
    }

    uni.showToast({
      title: user.is_following ? '关注成功' : '已取消关注',
      icon: 'success'
    })
  } catch (error) {
    uni.showToast({
      title: '操作失败',
      icon: 'none'
    })
  }
}

const goToProfile = (userId) => {
  uni.navigateTo({
    url: `/pages/user-profile/user-profile?id=${userId}`
  })
}

const showMoreActions = (user) => {
  const items = ['查看主页', '私信', '举报', '拉黑']

  uni.showActionSheet({
    itemList: items,
    success: (res) => {
      switch (res.tapIndex) {
        case 0:
          goToProfile(user.id)
          break
        case 1:
          uni.showToast({
            title: '私信功能开发中',
            icon: 'none'
          })
          break
        case 2:
          handleReport(user)
          break
        case 3:
          handleBlock(user)
          break
      }
    }
  })
}

const handleReport = (user) => {
  uni.showToast({
    title: '举报功能开发中',
    icon: 'none'
  })
}

const handleBlock = async (user) => {
  uni.showModal({
    title: '确认拉黑',
    content: `确定要拉黑 ${user.nickname || '该用户'} 吗?`,
    success: async (res) => {
      if (res.confirm) {
        try {
          await socialApi.blockUser(user.id)
          uni.showToast({
            title: '拉黑成功',
            icon: 'success'
          })
        } catch (error) {
          uni.showToast({
            title: '操作失败',
            icon: 'none'
          })
        }
      }
    }
  })
}

onMounted(() => {
  loadUsers(true)
})
</script>

<style lang="scss" scoped>
.social-container {
  min-height: 100vh;
  background: var(--theme-background);
}

.tabs-wrapper {
  display: flex;
  background: var(--theme-surface);
  border-bottom: 1rpx solid var(--theme-border);
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30rpx 0;
  position: relative;

  &.active {
    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 80rpx;
      height: 6rpx;
      background: var(--theme-accent);
      border-radius: 3rpx;
    }
  }
}

.tab-text {
  font-size: 28rpx;
  color: var(--theme-text);
  margin-bottom: 10rpx;
}

.tab-count {
  font-size: 24rpx;
  color: var(--theme-text-secondary);
}

.user-list {
  height: calc(100vh - 150rpx);
}

.user-item {
  display: flex;
  align-items: center;
  padding: 30rpx;
  background: var(--theme-surface);
  border-bottom: 1rpx solid var(--theme-border);
}

.user-avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  margin-right: 20rpx;
}

.user-info {
  flex: 1;
  margin-right: 20rpx;
}

.user-header {
  display: flex;
  align-items: center;
  margin-bottom: 10rpx;
}

.user-name {
  font-size: 32rpx;
  font-weight: bold;
  color: var(--theme-text);
  margin-right: 10rpx;
}

.user-badge {
  padding: 6rpx 15rpx;
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  border-radius: 15rpx;
}

.badge-text {
  font-size: 20rpx;
  font-weight: bold;
  color: #ffffff;
}

.user-bio {
  display: block;
  font-size: 24rpx;
  color: var(--theme-text-secondary);
  margin-bottom: 15rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-stats {
  display: flex;
  gap: 20rpx;
}

.stat-item {
  font-size: 24rpx;
  color: var(--theme-text-secondary);
}

.user-actions {
  display: flex;
  flex-direction: column;
  gap: 15rpx;
}

.action-btn {
  width: 140rpx;
  height: 60rpx;
  border-radius: 30rpx;
  font-size: 24rpx;
  color: #ffffff;
  background: var(--theme-accent);
  border: none;

  &.following {
    background: var(--theme-text-secondary);
    opacity: 0.5;
  }

  &::after {
    border: none;
  }
}

.more-btn {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--theme-background);
  border-radius: 50%;
  font-size: 32rpx;
  color: var(--theme-text-secondary);
}

.loading-more,
.no-more,
.empty-state {
  text-align: center;
  padding: 60rpx;
  color: var(--theme-text-secondary);
  font-size: 28rpx;
}

.empty-icon {
  width: 200rpx;
  height: 200rpx;
  margin-bottom: 20rpx;
}

.empty-text {
  display: block;
  font-size: 32rpx;
  color: var(--theme-text-secondary);
  margin-bottom: 10rpx;
}

.empty-tip {
  display: block;
  font-size: 24rpx;
  color: var(--theme-text-secondary);
}
</style>
