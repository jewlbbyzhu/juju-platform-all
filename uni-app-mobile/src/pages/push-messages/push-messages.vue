<template>
  <view class="push-messages-container">
    <view class="header">
      <text class="header-title">消息通知</text>
      <view class="header-actions">
        <text class="action-btn" @tap="markAllRead" v-if="unreadCount > 0">
          全部已读
        </text>
        <text class="action-btn" @tap="clearAll">
          清空
        </text>
      </view>
    </view>

    <view class="filter-bar">
      <view 
        class="filter-item" 
        :class="{ active: filterType === 'all' }"
        @tap="setFilter('all')"
      >
        <text class="filter-text">全部</text>
      </view>
      <view 
        class="filter-item" 
        :class="{ active: filterType === 'unread' }"
        @tap="setFilter('unread')"
      >
        <text class="filter-text">未读</text>
        <text class="badge" v-if="unreadCount > 0">{{ unreadCount }}</text>
      </view>
      <view 
        class="filter-item" 
        :class="{ active: filterType === 'party' }"
        @tap="setFilter('party')"
      >
        <text class="filter-text">聚会</text>
      </view>
      <view 
        class="filter-item" 
        :class="{ active: filterType === 'social' }"
        @tap="setFilter('social')"
      >
        <text class="filter-text">社交</text>
      </view>
      <view 
        class="filter-item" 
        :class="{ active: filterType === 'system' }"
        @tap="setFilter('system')"
      >
        <text class="filter-text">系统</text>
      </view>
    </view>

    <scroll-view class="messages-list" scroll-y @scrolltolower="loadMore">
      <view 
        class="message-item" 
        v-for="message in filteredMessages" 
        :key="message.id"
        :class="{ unread: !message.is_read }"
        @tap="handleMessageClick(message)"
      >
        <view class="message-icon">
          <text class="icon-text">{{ getIcon(message.type) }}</text>
        </view>

        <view class="message-content">
          <view class="message-header">
            <text class="message-title">{{ message.title }}</text>
            <text class="message-time">{{ formatTime(message.created_at) }}</text>
          </view>

          <text class="message-body">{{ message.content }}</text>

          <view class="message-footer" v-if="message.action_url">
            <button class="action-link" @tap.stop="handleAction(message)">
              <text>查看详情</text>
            </button>
          </view>
        </view>

        <view class="message-actions" @tap.stop="showMessageActions(message)">
          <text class="action-icon">⋯</text>
        </view>
      </view>

      <view class="loading-more" v-if="loading">
        <text>加载中...</text>
      </view>

      <view class="no-more" v-if="!hasMore && filteredMessages.length > 0">
        <text>没有更多了</text>
      </view>

      <view class="empty-state" v-if="filteredMessages.length === 0 && !loading">
        <text class="empty-icon">🔔</text>
        <text class="empty-text">暂无消息</text>
        <text class="empty-tip">开启推送通知，及时获取最新消息</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { pushApi } from '@/api/push.js'

const filterType = ref('all')
const messages = ref([])
const unreadCount = ref(0)
const loading = ref(false)
const hasMore = ref(true)
const page = ref(1)
const pageSize = ref(20)

const filteredMessages = computed(() => {
  if (filterType.value === 'unread') {
    return messages.value.filter(m => !m.is_read)
  } else if (filterType.value === 'party') {
    return messages.value.filter(m => m.type === 'party')
  } else if (filterType.value === 'social') {
    return messages.value.filter(m => m.type === 'social')
  } else if (filterType.value === 'system') {
    return messages.value.filter(m => m.type === 'system')
  }
  return messages.value
})

const loadMessages = async (reset = false) => {
  if (reset) {
    page.value = 1
    messages.value = []
    hasMore.value = true
  }

  if (loading.value || !hasMore.value) return

  loading.value = true

  try {
    const res = await pushApi.getPushMessages({
      page: page.value,
      pageSize: pageSize.value
    })

    if (res.code === 0) {
      const newMessages = res.data.list || []
      if (reset) {
        messages.value = newMessages
      } else {
        messages.value = [...messages.value, ...newMessages]
      }

      hasMore.value = newMessages.length >= pageSize.value
      page.value++

      loadUnreadCount()
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
  loadMessages(false)
}

const loadUnreadCount = async () => {
  try {
    const res = await pushApi.getUnreadCount()
    if (res.code === 0) {
      unreadCount.value = res.data.count || 0
    }
  } catch (error) {
    // console.error('Failed to load unread count:', error)
  }
}

const setFilter = (type) => {
  filterType.value = type
}

const handleMessageClick = async (message) => {
  if (!message.is_read) {
    try {
      await pushApi.markAsRead(message.id)
      message.is_read = true
      unreadCount.value = Math.max(0, unreadCount.value - 1)
    } catch (error) {
      // console.error('Failed to mark as read:', error)
    }
  }

  if (message.action_url) {
    uni.navigateTo({
      url: message.action_url
    })
  }
}

const handleAction = (message) => {
  if (message.action_url) {
    uni.navigateTo({
      url: message.action_url
    })
  }
}

const showMessageActions = (message) => {
  const items = ['标记已读', '删除']
  
  uni.showActionSheet({
    itemList: items,
    success: async (res) => {
      if (res.tapIndex === 0) {
        await markAsRead(message)
      } else if (res.tapIndex === 1) {
        await deleteMessage(message)
      }
    }
  })
}

const markAsRead = async (message) => {
  if (message.is_read) {
    uni.showToast({
      title: '已读',
      icon: 'none'
    })
    return
  }

  try {
    const res = await pushApi.markAsRead(message.id)
    if (res.code === 0) {
      message.is_read = true
      unreadCount.value = Math.max(0, unreadCount.value - 1)
      uni.showToast({
        title: '已标记为已读',
        icon: 'success'
      })
    }
  } catch (error) {
    uni.showToast({
      title: '操作失败',
      icon: 'none'
    })
  }
}

const deleteMessage = (message) => {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除这条消息吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          const deleteRes = await pushApi.deleteMessage(message.id)
          if (deleteRes.code === 0) {
            const index = messages.value.findIndex(m => m.id === message.id)
            if (index > -1) {
              messages.value.splice(index, 1)
              
              if (!message.is_read) {
                unreadCount.value = Math.max(0, unreadCount.value - 1)
              }

              uni.showToast({
                title: '删除成功',
                icon: 'success'
              })
            }
          }
        } catch (error) {
          uni.showToast({
            title: '删除失败',
            icon: 'none'
          })
        }
      }
    }
  })
}

const markAllRead = async () => {
  uni.showModal({
    title: '确认全部已读',
    content: '确定要将所有未读消息标记为已读吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          const markRes = await pushApi.markAllAsRead()
          if (markRes.code === 0) {
            messages.value.forEach(m => m.is_read = true)
            unreadCount.value = 0
            uni.showToast({
              title: '已全部标记为已读',
              icon: 'success'
            })
          }
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

const clearAll = () => {
  uni.showModal({
    title: '确认清空',
    content: '确定要清空所有消息吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          const clearRes = await pushApi.clearAllMessages()
          if (clearRes.code === 0) {
            messages.value = []
            unreadCount.value = 0
            uni.showToast({
              title: '已清空',
              icon: 'success'
            })
          }
        } catch (error) {
          uni.showToast({
            title: '清空失败',
            icon: 'none'
          })
        }
      }
    }
  })
}

const getIcon = (type) => {
  const iconMap = {
    party: '🎉',
    social: '💬',
    system: '🔔'
  }
  return iconMap[type] || '📢'
}

const formatTime = (time) => {
  if (!time) return ''
  const now = Date.now()
  const diff = now - new Date(time).getTime()
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour

  if (diff < minute) {
    return '刚刚'
  } else if (diff < hour) {
    return `${Math.floor(diff / minute)}分钟前`
  } else if (diff < day) {
    return `${Math.floor(diff / hour)}小时前`
  } else if (diff < day * 7) {
    return `${Math.floor(diff / day)}天前`
  } else {
    const date = new Date(time)
    const month = date.getMonth() + 1
    const day = date.getDate()
    return `${month}月${day}日`
  }
}

onMounted(() => {
  loadMessages(true)
  loadUnreadCount()
})
</script>

<style lang="scss" scoped>
.push-messages-container {
  min-height: 100vh;
  background: #000000;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  background: rgba(255, 255, 255, 0.02);
  border-bottom: 1rpx solid rgba(255, 255, 255, 0.05);
}

.header-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #ffffff;
}

.header-actions {
  display: flex;
  gap: 20rpx;
}

.action-btn {
  font-size: 26rpx;
  color: #667eea;
  padding: 10rpx;
}

.filter-bar {
  display: flex;
  gap: 15rpx;
  padding: 20rpx 30rpx;
  background: rgba(255, 255, 255, 0.02);
}

.filter-item {
  flex: 1;
  text-align: center;
  padding: 15rpx;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20rpx;
  border: 1rpx solid transparent;
  transition: all 0.3s;
  position: relative;
}

.filter-item.active {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(0, 0, 0, 0) 100%);
  border-color: rgba(102, 126, 234, 0.5);
}

.filter-text {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.7);
}

.filter-item.active .filter-text {
  color: #667eea;
  font-weight: 500;
}

.badge {
  position: absolute;
  top: 5rpx;
  right: 15rpx;
  padding: 3rpx 10rpx;
  background: #ff4d4f;
  border-radius: 10rpx;
  font-size: 20rpx;
  color: #ffffff;
}

.messages-list {
  height: calc(100vh - 200rpx);
}

.message-item {
  display: flex;
  padding: 30rpx;
  background: rgba(255, 255, 255, 0.02);
  border-bottom: 1rpx solid rgba(255, 255, 255, 0.05);
  gap: 20rpx;
}

.message-item.unread {
  background: rgba(102, 126, 234, 0.05);
}

.message-icon {
  width: 80rpx;
  height: 80rpx;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 15rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.icon-text {
  font-size: 40rpx;
}

.message-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.message-title {
  font-size: 28rpx;
  font-weight: 500;
  color: #ffffff;
}

.message-time {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.5);
}

.message-body {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.5;
}

.message-footer {
  margin-top: 10rpx;
}

.action-link {
  padding: 10rpx 20rpx;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 20rpx;
  font-size: 24rpx;
  color: #667eea;
  border: none;

  &::after {
    border: none;
  }
}

.message-actions {
  flex-shrink: 0;
  padding: 10rpx;
}

.action-icon {
  font-size: 32rpx;
  color: rgba(255, 255, 255, 0.5);
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
