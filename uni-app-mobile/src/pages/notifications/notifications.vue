<template>
  <view class="notifications-container">
    <view class="header">
      <text class="header-title">消息通知</text>
      <view class="unread-badge" v-if="unreadCount > 0">
        <text>{{ unreadCount }}</text>
      </view>
    </view>

    <view class="tabs">
      <view 
        class="tab-item" 
        :class="{ active: currentTab === 'all' }"
        @tap="switchTab('all')"
      >
        <text>全部</text>
      </view>
      <view 
        class="tab-item" 
        :class="{ active: currentTab === 'unread' }"
        @tap="switchTab('unread')"
      >
        <text>未读</text>
      </view>
    </view>

    <scroll-view 
      class="notification-list" 
      scroll-y 
      @scrolltolower="loadMore"
      @refresherrefresh="onRefresh"
      :refresher-enabled="true"
      :refresher-triggered="refreshing"
    >
      <view 
        class="notification-item" 
        :class="{ unread: !notification.is_read }"
        v-for="notification in notifications" 
        :key="notification.id"
        @tap="goToDetail(notification)"
      >
        <view class="notification-icon" :class="getTypeClass(notification.type)">
          <text>{{ getTypeIcon(notification.type) }}</text>
        </view>

        <view class="notification-content">
          <text class="notification-title">{{ notification.title }}</text>
          <text class="notification-message">{{ notification.message }}</text>
          <text class="notification-time">{{ formatTime(notification.created_at) }}</text>
        </view>

        <view class="unread-dot" v-if="!notification.is_read"></view>
      </view>

      <view class="loading-more" v-if="loading">
        <text>加载中...</text>
      </view>

      <view class="no-more" v-if="!hasMore && notifications.length > 0">
        <text>没有更多了</text>
      </view>

      <view class="empty-state" v-if="notifications.length === 0 && !loading">
        <image class="empty-icon" src="/static/empty-notification.png" mode="aspectFit"></image>
        <text class="empty-text">暂无通知</text>
      </view>
    </scroll-view>

    <view class="bottom-actions" v-if="notifications.length > 0">
      <button class="action-btn mark-all-btn" @tap="markAllAsRead">
        <text>全部已读</text>
      </button>
      <button class="action-btn clear-all-btn" @tap="clearAll">
        <text>清空通知</text>
      </button>
    </view>
  </view>
</template>

<script>
import { notificationApi } from '../../api/notification'

export default {
  data() {
    return {
      currentTab: 'all',
      notifications: [],
      unreadCount: 0,
      page: 1,
      pageSize: 10,
      loading: false,
      refreshing: false,
      hasMore: true
    }
  },

  onLoad() {
    this.loadNotifications()
    this.loadUnreadCount()
  },

  onShow() {
    this.loadUnreadCount()
  },

  onPullDownRefresh() {
    this.onRefresh()
  },

  methods: {
    async loadNotifications(reset = false) {
      if (reset) {
        this.page = 1
        this.notifications = []
        this.hasMore = true
      }

      if (this.loading || !this.hasMore) return

      this.loading = true

      try {
        const params = {
          page: this.page,
          pageSize: this.pageSize
        }

        if (this.currentTab === 'unread') {
          params.is_read = false
        }

        const res = await notificationApi.getNotifications(params)

        if (res.code === 0) {
          if (reset) {
            this.notifications = res.data.list || []
          } else {
            this.notifications = [...this.notifications, ...(res.data.list || [])]
          }

          this.hasMore = res.data.list?.length >= this.pageSize
          this.page++
        }
      } catch (error) {
        uni.showToast({
          title: '加载失败',
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
    },

    async loadUnreadCount() {
      try {
        const res = await notificationApi.getUnreadCount()
        if (res.code === 0) {
          this.unreadCount = res.data.count || 0
        }
      } catch (error) {
        // console.error('加载未读数量失败:', error)
      }
    },

    switchTab(tab) {
      if (this.currentTab === tab) return
      this.currentTab = tab
      this.loadNotifications(true)
    },

    goToDetail(notification) {
      if (!notification.is_read) {
        this.markAsRead(notification.id)
      }

      if (notification.type === 'order' || notification.type === 'ticket') {
        uni.navigateTo({
          url: `/pages/order-detail/order-detail?id=${notification.related_id}`
        })
      } else if (notification.type === 'party') {
        uni.navigateTo({
          url: `/pages/party-detail/party-detail?id=${notification.related_id}`
        })
      } else if (notification.type === 'system') {
        uni.navigateTo({
          url: `/pages/notification-detail/notification-detail?id=${notification.id}`
        })
      }
    },

    async markAsRead(id) {
      try {
        const res = await notificationApi.markAsRead(id)
        if (res.code === 0) {
          const notification = this.notifications.find(n => n.id === id)
          if (notification) {
            notification.is_read = true
          }
          this.unreadCount = Math.max(0, this.unreadCount - 1)
        }
      } catch (error) {
        // console.error('标记已读失败:', error)
      }
    },

    async markAllAsRead() {
      uni.showModal({
        title: '提示',
        content: '确定要将所有通知标记为已读吗?',
        success: async (res) => {
          if (res.confirm) {
            try {
              const res = await notificationApi.markAllAsRead()
              if (res.code === 0) {
                this.notifications.forEach(n => n.is_read = true)
                this.unreadCount = 0
                uni.showToast({
                  title: '标记成功',
                  icon: 'success'
                })
              } else {
                uni.showToast({
                  title: res.message || '标记失败',
                  icon: 'none'
                })
              }
            } catch (error) {
              uni.showToast({
                title: '网络错误',
                icon: 'none'
              })
            }
          }
        }
      })
    },

    async clearAll() {
      uni.showModal({
        title: '提示',
        content: '确定要清空所有通知吗?此操作不可恢复。',
        success: async (res) => {
          if (res.confirm) {
            try {
              const res = await notificationApi.deleteAllNotifications()
              if (res.code === 0) {
                this.notifications = []
                this.unreadCount = 0
                uni.showToast({
                  title: '清空成功',
                  icon: 'success'
                })
              } else {
                uni.showToast({
                  title: res.message || '清空失败',
                  icon: 'none'
                })
              }
            } catch (error) {
              uni.showToast({
                title: '网络错误',
                icon: 'none'
              })
            }
          }
        }
      })
    },

    onRefresh() {
      this.refreshing = true
      this.loadNotifications(true).then(() => {
        this.refreshing = false
      })
    },

    loadMore() {
      this.loadNotifications()
    },

    getTypeClass(type) {
      const classMap = {
        'order': 'type-order',
        'ticket': 'type-ticket',
        'party': 'type-party',
        'system': 'type-system',
        'wallet': 'type-wallet'
      }
      return classMap[type] || ''
    },

    getTypeIcon(type) {
      const iconMap = {
        'order': '📋',
        'ticket': '🎫',
        'party': '🎉',
        'system': '🔔',
        'wallet': '💰'
      }
      return iconMap[type] || '📬'
    },

    formatTime(time) {
      if (!time) return ''
      const date = new Date(time)
      const now = new Date()
      const diff = now - date
      const minutes = Math.floor(diff / 60000)
      const hours = Math.floor(diff / 3600000)
      const days = Math.floor(diff / 86400000)

      if (minutes < 1) {
        return '刚刚'
      } else if (minutes < 60) {
        return `${minutes}分钟前`
      } else if (hours < 24) {
        return `${hours}小时前`
      } else if (days < 7) {
        return `${days}天前`
      } else {
        const month = date.getMonth() + 1
        const day = date.getDate()
        return `${month}-${day}`
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.notifications-container {
  min-height: 100vh;
  background: #000000;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx 40rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.header-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #ffffff;
}

.unread-badge {
  padding: 8rpx 20rpx;
  background: #FF6B35;
  border-radius: 30rpx;
  font-size: 24rpx;
  color: #ffffff;
  font-weight: bold;
}

.tabs {
  display: flex;
  background: #1a1a1a;
  padding: 20rpx 0;
  border-bottom: 1rpx solid rgba(255, 255, 255, 0.1);
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 30rpx 0;
  color: rgba(255, 255, 255, 0.6);
  font-size: 28rpx;
  position: relative;
  transition: all 0.3s;

  &.active {
    color: #FF6B35;
    font-weight: bold;

    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 60rpx;
      height: 4rpx;
      background: #FF6B35;
      border-radius: 2rpx;
    }
  }
}

.notification-list {
  padding: 20rpx;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  padding: 30rpx;
  background: #1a1a1a;
  border-radius: 20rpx;
  margin-bottom: 20rpx;
  position: relative;
  transition: background 0.3s;

  &.unread {
    background: rgba(255, 107, 53, 0.1);
  }

  &:active {
    background: rgba(255, 255, 255, 0.05);
  }
}

.notification-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  margin-right: 20rpx;
  flex-shrink: 0;
}

.type-order {
  background: linear-gradient(135deg, #4CAF50 0%, #45A049 100%);
}

.type-ticket {
  background: linear-gradient(135deg, #FF9800 0%, #FFC107 100%);
}

.type-party {
  background: linear-gradient(135deg, #FF6B35 0%, #FF8E53 100%);
}

.type-system {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.type-wallet {
  background: linear-gradient(135deg, #F44336 0%, #FF6B35 100%);
}

.notification-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.notification-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 10rpx;
}

.notification-message {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 10rpx;
  line-height: 1.5;
}

.notification-time {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.5);
}

.unread-dot {
  position: absolute;
  top: 20rpx;
  right: 20rpx;
  width: 16rpx;
  height: 16rpx;
  background: #FF6B35;
  border-radius: 50%;
}

.loading-more,
.no-more,
.empty-state {
  text-align: center;
  padding: 40rpx;
  color: rgba(255, 255, 255, 0.5);
  font-size: 28rpx;
}

.empty-icon {
  width: 200rpx;
  height: 200rpx;
  margin-bottom: 20rpx;
}

.empty-text {
  font-size: 32rpx;
  color: rgba(255, 255, 255, 0.7);
}

.bottom-actions {
  display: flex;
  gap: 20rpx;
  padding: 30rpx 40rpx;
  background: #1a1a1a;
  border-top: 1rpx solid rgba(255, 255, 255, 0.1);
}

.action-btn {
  flex: 1;
  height: 80rpx;
  border-radius: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  border: none;

  &::after {
    border: none;
  }
}

.mark-all-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
  font-weight: bold;
}

.clear-all-btn {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.6);
}
</style>
