<template>
  <view class="group-chat-list-container">
    <view class="header">
      <view class="title">群聊</view>
      <view class="create-btn" @click="handleCreateGroup">
        <text class="icon">+</text>
        <text>创建群聊</text>
      </view>
    </view>

    <view class="search-bar">
      <view class="search-input">
        <text class="search-icon">🔍</text>
        <input 
          v-model="searchKeyword" 
          placeholder="搜索群聊" 
          placeholder-class="placeholder"
          @input="handleSearch"
        />
      </view>
    </view>

    <view class="filter-tabs">
      <view 
        v-for="item in filterOptions" 
        :key="item.value"
        class="filter-tab"
        :class="{ active: filterType === item.value }"
        @click="handleFilter(item.value)"
      >
        {{ item.label }}
        <view class="badge" v-if="item.count > 0">{{ item.count }}</view>
      </view>
    </view>

    <view class="group-list">
      <view 
        v-for="item in groupList" 
        :key="item.id"
        class="group-item"
        @click="handleGroupDetail(item.id)"
      >
        <view class="group-avatar">
          <image v-if="item.avatar" :src="item.avatar" mode="aspectFill" />
          <text v-else class="avatar-placeholder">{{ item.name.substring(0, 2) }}</text>
          <view class="member-count">{{ item.memberCount }}</view>
        </view>

        <view class="group-info">
          <view class="group-header">
            <view class="group-name">{{ item.name }}</view>
            <view class="group-time">{{ formatTime(item.lastMessageTime) }}</view>
          </view>

          <view class="group-desc">{{ item.description }}</view>

          <view class="group-message">
            <text class="message-prefix" v-if="item.lastMessageType === 'image'">[图片]</text>
            <text class="message-prefix" v-else-if="item.lastMessageType === 'voice'">[语音]</text>
            <text class="message-prefix" v-else-if="item.lastMessageType === 'system'">[系统]</text>
            <text class="message-content">{{ item.lastMessage || '暂无消息' }}</text>
          </view>

          <view class="group-meta">
            <view class="meta-tag" v-if="item.isPinned">置顶</view>
            <view class="meta-tag" v-if="item.isMuted">免打扰</view>
            <view class="meta-tag" v-if="item.isAnnouncement">公告</view>
          </view>
        </view>

        <view class="group-actions">
          <view class="unread-badge" v-if="item.unreadCount > 0">
            <text>{{ item.unreadCount > 99 ? '99+' : item.unreadCount }}</text>
          </view>
          <view class="action-menu" @click.stop="handleActionMenu(item)">
            <text class="icon">⋮</text>
          </view>
        </view>
      </view>
    </view>

    <view class="empty-state" v-if="groupList.length === 0 && !loading">
      <text class="empty-icon">💬</text>
      <text class="empty-text">暂无群聊</text>
      <view class="empty-action" @click="handleCreateGroup">
        <text>创建群聊</text>
      </view>
    </view>

    <view class="loading-more" v-if="loading">
      <text>加载中...</text>
    </view>

    <view class="no-more" v-if="!hasMore && groupList.length > 0">
      <text>没有更多了</text>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { groupChatApi } from '../../api/group-chat.js'

const filterOptions = [
  { label: '全部', value: 'all', count: 0 },
  { label: '置顶', value: 'pinned', count: 0 },
  { label: '免打扰', value: 'muted', count: 0 },
  { label: '公告', value: 'announcement', count: 0 }
]

const searchKeyword = ref('')
const filterType = ref('all')
const loading = ref(false)
const hasMore = ref(true)
const page = ref(1)
const pageSize = ref(20)

const groupList = ref([])

const formatTime = (timestamp) => {
  if (!timestamp) return ''
  
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date
  
  if (diff < 86400000 && date.getDate() === now.getDate()) {
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
  } else if (diff < 172800000) {
    return '昨天'
  } else if (diff < 604800000) {
    const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    return days[date.getDay()]
  } else {
    return `${date.getMonth() + 1}/${date.getDate()}`
  }
}

const handleSearch = () => {
  page.value = 1
  groupList.value = []
  hasMore.value = true
  loadGroupList()
}

const handleFilter = (value) => {
  filterType.value = value
  page.value = 1
  groupList.value = []
  hasMore.value = true
  loadGroupList()
}

const handleGroupDetail = (groupId) => {
  uni.navigateTo({
    url: `/pages/group-chat/group-chat?id=${groupId}`
  })
}

const handleCreateGroup = () => {
  uni.navigateTo({
    url: '/pages/create-group/create-group'
  })
}

const handleActionMenu = (group) => {
  const actions = []
  
  if (group.isPinned) {
    actions.push('取消置顶')
  } else {
    actions.push('置顶群聊')
  }
  
  if (group.isMuted) {
    actions.push('取消免打扰')
  } else {
    actions.push('开启免打扰')
  }
  
  actions.push('查看群信息')
  actions.push('退出群聊')
  
  uni.showActionSheet({
    itemList: actions,
    success: (res) => {
      handleAction(group, actions[res.tapIndex])
    }
  })
}

const handleAction = (group, action) => {
  switch (action) {
    case '置顶群聊':
    case '取消置顶':
      handleTogglePin(group)
      break
    case '开启免打扰':
    case '取消免打扰':
      handleToggleMute(group)
      break
    case '查看群信息':
      handleViewGroupInfo(group.id)
      break
    case '退出群聊':
      handleLeaveGroup(group.id)
      break
  }
}

const handleTogglePin = (group) => {
  group.isPinned = !group.isPinned
  uni.showToast({
    title: group.isPinned ? '已置顶' : '已取消置顶',
    icon: 'success'
  })
}

const handleToggleMute = (group) => {
  group.isMuted = !group.isMuted
  uni.showToast({
    title: group.isMuted ? '已开启免打扰' : '已取消免打扰',
    icon: 'success'
  })
}

const handleViewGroupInfo = (groupId) => {
  uni.navigateTo({
    url: `/pages/group-info/group-info?id=${groupId}`
  })
}

const handleLeaveGroup = (groupId) => {
  uni.showModal({
    title: '确认退出',
    content: '确定要退出该群聊吗？',
    success: (res) => {
      if (res.confirm) {
        uni.showLoading({ title: '退出中...' })
        
        setTimeout(() => {
          uni.hideLoading()
          uni.showToast({
            title: '已退出群聊',
            icon: 'success'
          })
          loadGroupList(true)
        }, 1000)
      }
    }
  })
}

const loadGroupList = (reset = false) => {
  if (reset) {
    page.value = 1
    groupList.value = []
    hasMore.value = true
  }

  if (!hasMore.value) return

  loading.value = true
  
  const params = {
    page: page.value,
    limit: pageSize.value
  }

  if (searchKeyword.value) {
    params.keyword = searchKeyword.value
  }

  if (filterType.value !== 'all') {
    params.filter = filterType.value
  }

  groupChatApi.getGroups(params).then(response => {
    const newData = response.data
    
    if (reset) {
      groupList.value = newData
    } else {
      groupList.value = [...groupList.value, ...newData]
    }

    hasMore.value = newData.length >= pageSize.value
    page.value++

    filterOptions.value[0].count = groupList.value.length
    filterOptions.value[1].count = groupList.value.filter(g => g.isPinned).length
    filterOptions.value[2].count = groupList.value.filter(g => g.isMuted).length
    filterOptions.value[3].count = groupList.value.filter(g => g.isAnnouncement).length
  }).catch(error => {
    uni.showToast({
      title: '加载失败',
      icon: 'none'
    })
  }).finally(() => {
    loading.value = false
  })
}

onMounted(() => {
  loadGroupList(true)
})

uni.onReachBottom(() => {
  if (!loading.value && hasMore.value) {
    loadGroupList()
  }
})
</script>

<style lang="scss" scoped>
.group-chat-list-container {
  min-height: 100vh;
  background: #000000;
  padding-bottom: 40rpx;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.title {
  font-size: 36rpx;
  font-weight: bold;
  color: #ffffff;
}

.create-btn {
  display: flex;
  align-items: center;
  gap: 10rpx;
  padding: 16rpx 24rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 20rpx;
  font-size: 26rpx;
  color: #ffffff;
}

.icon {
  font-size: 28rpx;
}

.search-bar {
  padding: 30rpx;
  background: #1a1a1a;
}

.search-input {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 24rpx 30rpx;
  background: #2a2a2a;
  border-radius: 40rpx;
}

.search-icon {
  font-size: 32rpx;
  color: #999;
}

.search-input input {
  flex: 1;
  font-size: 28rpx;
  color: #ffffff;
}

.placeholder {
  color: #999;
}

.filter-tabs {
  display: flex;
  gap: 20rpx;
  padding: 30rpx;
  background: #1a1a1a;
}

.filter-tab {
  position: relative;
  padding: 16rpx 24rpx;
  background: #2a2a2a;
  border-radius: 20rpx;
  font-size: 26rpx;
  color: #999;
  transition: all 0.3s;
}

.filter-tab.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
}

.badge {
  position: absolute;
  top: -8rpx;
  right: -8rpx;
  min-width: 32rpx;
  height: 32rpx;
  padding: 0 8rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ff3d00;
  border-radius: 16rpx;
  font-size: 20rpx;
  color: #ffffff;
}

.group-list {
  padding: 30rpx;
}

.group-item {
  display: flex;
  align-items: center;
  padding: 30rpx;
  background: #1a1a1a;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
}

.group-avatar {
  position: relative;
  width: 100rpx;
  height: 100rpx;
  margin-right: 24rpx;
}

.group-avatar image {
  width: 100%;
  height: 100%;
  border-radius: 16rpx;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16rpx;
  font-size: 36rpx;
  font-weight: bold;
  color: #ffffff;
}

.member-count {
  position: absolute;
  bottom: -8rpx;
  right: -8rpx;
  min-width: 40rpx;
  height: 40rpx;
  padding: 0 8rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #667eea;
  border-radius: 20rpx;
  font-size: 20rpx;
  color: #ffffff;
}

.group-info {
  flex: 1;
  min-width: 0;
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12rpx;
}

.group-name {
  font-size: 30rpx;
  font-weight: bold;
  color: #ffffff;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.group-time {
  font-size: 22rpx;
  color: #999;
}

.group-desc {
  font-size: 24rpx;
  color: #999;
  margin-bottom: 12rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.group-message {
  display: flex;
  align-items: center;
  gap: 8rpx;
  margin-bottom: 12rpx;
}

.message-prefix {
  font-size: 24rpx;
  color: #667eea;
}

.message-content {
  flex: 1;
  font-size: 26rpx;
  color: #999;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.group-meta {
  display: flex;
  gap: 12rpx;
}

.meta-tag {
  padding: 4rpx 12rpx;
  background: rgba(102, 126, 234, 0.2);
  border-radius: 8rpx;
  font-size: 20rpx;
  color: #667eea;
}

.group-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
}

.unread-badge {
  min-width: 40rpx;
  height: 40rpx;
  padding: 0 10rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ff3d00;
  border-radius: 20rpx;
  font-size: 22rpx;
  color: #ffffff;
}

.action-menu {
  width: 40rpx;
  height: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 0;
  gap: 30rpx;
}

.empty-icon {
  font-size: 120rpx;
  opacity: 0.5;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
}

.empty-action {
  padding: 20rpx 40rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 30rpx;
  font-size: 28rpx;
  color: #ffffff;
}

.loading-more,
.no-more {
  padding: 30rpx;
  text-align: center;
  font-size: 26rpx;
  color: #999;
}
</style>
