<template>
  <view class="chat-list-container">
    <view class="header">
      <text class="header-title">消息</text>
      <view class="header-actions">
        <text class="action-icon" @tap="createGroup">➕</text>
        <text class="action-icon" @tap="searchChat">🔍</text>
      </view>
    </view>

    <view class="tab-bar">
      <view 
        class="tab-item" 
        :class="{ active: activeTab === 'all' }"
        @tap="switchTab('all')"
      >
        <text class="tab-text">全部</text>
      </view>
      <view 
        class="tab-item" 
        :class="{ active: activeTab === 'unread' }"
        @tap="switchTab('unread')"
      >
        <text class="tab-text">未读</text>
        <text class="badge" v-if="unreadCount > 0">{{ unreadCount }}</text>
      </view>
      <view 
        class="tab-item" 
        :class="{ active: activeTab === 'groups' }"
        @tap="switchTab('groups')"
      >
        <text class="tab-text">群聊</text>
      </view>
    </view>

    <scroll-view class="chat-list" scroll-y @scrolltolower="loadMore">
      <view 
        class="chat-item" 
        v-for="item in filteredChats" 
        :key="item.id"
        @tap="openChat(item)"
      >
        <image 
          class="chat-avatar" 
          :src="item.avatar || '/static/default-avatar.png'" 
          mode="aspectFill"
        ></image>

        <view class="chat-content">
          <view class="chat-header">
            <text class="chat-name">{{ item.name || '未知用户' }}</text>
            <text class="chat-time">{{ formatTime(item.last_message_time) }}</text>
          </view>

          <text class="chat-message">{{ item.last_message || '暂无消息' }}</text>

          <view class="chat-footer">
            <text class="chat-type" v-if="item.type === 'group'">群聊</text>
            <text class="chat-type" v-else>私聊</text>
            <view class="unread-badge" v-if="item.unread_count > 0">
              <text class="badge-count">{{ item.unread_count }}</text>
            </view>
          </view>
        </view>

        <view class="chat-actions" @tap.stop="showActions(item)">
          <text class="action-icon">⋯</text>
        </view>
      </view>

      <view class="loading-more" v-if="loading">
        <text>加载中...</text>
      </view>

      <view class="no-more" v-if="!hasMore && filteredChats.length > 0">
        <text>没有更多了</text>
      </view>

      <view class="empty-state" v-if="filteredChats.length === 0 && !loading">
        <text class="empty-icon">💬</text>
        <text class="empty-text">暂无消息</text>
        <text class="empty-tip">开始与好友聊天吧</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { chatApi } from '@/api/chat.js'

const activeTab = ref('all')
const conversations = ref([])
const loading = ref(false)
const hasMore = ref(true)
const page = ref(1)
const pageSize = ref(20)

const unreadCount = computed(() => {
  return conversations.value.reduce((total, item) => total + (item.unread_count || 0), 0)
})

const filteredChats = computed(() => {
  if (activeTab.value === 'unread') {
    return conversations.value.filter(item => item.unread_count > 0)
  } else if (activeTab.value === 'groups') {
    return conversations.value.filter(item => item.type === 'group')
  }
  return conversations.value
})

const loadConversations = async (reset = false) => {
  if (reset) {
    page.value = 1
    conversations.value = []
    hasMore.value = true
  }

  if (loading.value || !hasMore.value) return

  loading.value = true

  try {
    const res = await chatApi.getConversationList({
      page: page.value,
      pageSize: pageSize.value
    })

    if (res.code === 0) {
      const newConversations = res.data.list || []
      if (reset) {
        conversations.value = newConversations
      } else {
        conversations.value = [...conversations.value, ...newConversations]
      }

      hasMore.value = newConversations.length >= pageSize.value
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
  loadConversations(false)
}

const switchTab = (tab) => {
  activeTab.value = tab
}

const openChat = (item) => {
  if (item.type === 'group') {
    uni.navigateTo({
      url: `/pages/group-chat/group-chat?groupId=${item.id}`
    })
  } else {
    uni.navigateTo({
      url: `/pages/private-chat/private-chat?conversationId=${item.id}`
    })
  }
}

const createGroup = () => {
  uni.navigateTo({
    url: '/pages/create-group/create-group'
  })
}

const searchChat = () => {
  uni.navigateTo({
    url: '/pages/search-chat/search-chat'
  })
}

const showActions = (item) => {
  const items = ['标记已读', '删除会话']
  
  uni.showActionSheet({
    itemList: items,
    success: async (res) => {
      if (res.tapIndex === 0) {
        await markAsRead(item)
      } else if (res.tapIndex === 1) {
        await deleteConversation(item)
      }
    }
  })
}

const markAsRead = async (item) => {
  try {
    const res = await chatApi.markAsRead(item.id)
    if (res.code === 0) {
      item.unread_count = 0
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

const deleteConversation = (item) => {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除此会话吗？',
    success: async (res) => {
      if (res.confirm) {
        const index = conversations.value.findIndex(c => c.id === item.id)
        if (index > -1) {
          conversations.value.splice(index, 1)
          uni.showToast({
            title: '删除成功',
            icon: 'success'
          })
        }
      }
    }
  })
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
  loadConversations(true)
})
</script>

<style lang="scss" scoped>
.chat-list-container {
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

.action-icon {
  font-size: 40rpx;
  padding: 10rpx;
}

.tab-bar {
  display: flex;
  gap: 20rpx;
  padding: 20rpx 30rpx;
  background: rgba(255, 255, 255, 0.02);
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 20rpx;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 15rpx;
  border: 1rpx solid transparent;
  transition: all 0.3s;
  position: relative;
}

.tab-item.active {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(0, 0, 0, 0) 100%);
  border-color: rgba(102, 126, 234, 0.5);
}

.tab-text {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.7);
}

.tab-item.active .tab-text {
  color: #667eea;
  font-weight: 500;
}

.badge {
  position: absolute;
  top: 5rpx;
  right: 20rpx;
  padding: 3rpx 10rpx;
  background: #ff4d4f;
  border-radius: 10rpx;
  font-size: 20rpx;
  color: #ffffff;
}

.chat-list {
  height: calc(100vh - 200rpx);
}

.chat-item {
  display: flex;
  align-items: center;
  padding: 30rpx;
  background: rgba(255, 255, 255, 0.02);
  border-bottom: 1rpx solid rgba(255, 255, 255, 0.05);
  gap: 20rpx;
}

.chat-avatar {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  flex-shrink: 0;
}

.chat-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10rpx;
  overflow: hidden;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chat-name {
  font-size: 30rpx;
  font-weight: 500;
  color: #ffffff;
}

.chat-time {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.5);
}

.chat-message {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.6);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chat-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chat-type {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.4);
  padding: 3rpx 10rpx;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10rpx;
}

.unread-badge {
  padding: 3rpx 12rpx;
  background: #ff4d4f;
  border-radius: 15rpx;
}

.badge-count {
  font-size: 20rpx;
  color: #ffffff;
  font-weight: 500;
}

.chat-actions {
  flex-shrink: 0;
  padding: 10rpx;
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
