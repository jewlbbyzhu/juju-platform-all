<template>
  <view class="group-chat-container">
    <view class="header">
      <view class="back-btn" @click="handleBack">
        <text class="icon">←</text>
      </view>
      <view class="group-info" @click="handleGroupInfo">
        <view class="group-name">{{ groupInfo.name }}</view>
        <view class="member-count">{{ groupInfo.memberCount }}人</view>
      </view>
      <view class="more-btn" @click="handleMore">
        <text class="icon">⋮</text>
      </view>
    </view>

    <scroll-view 
      class="message-list" 
      scroll-y 
      :scroll-into-view="scrollIntoView"
      @scrolltoupper="loadMoreMessages"
    >
      <view class="load-more" v-if="loadingMore">
        <text>加载更多...</text>
      </view>

      <view 
        v-for="message in messageList" 
        :key="message.id"
        :id="`message-${message.id}`"
        class="message-item"
        :class="{ 'is-self': message.isSelf }"
      >
        <view class="message-time" v-if="message.showTime">
          {{ formatMessageTime(message.createdAt) }}
        </view>

        <view class="message-content-wrapper">
          <image 
            v-if="!message.isSelf" 
            class="user-avatar" 
            :src="message.userAvatar" 
            mode="aspectFill"
          />
          
          <view class="message-bubble">
            <view class="user-name" v-if="!message.isSelf">{{ message.userName }}</view>
            
            <view class="bubble-content" :class="`type-${message.type}`">
              <text v-if="message.type === 'text'">{{ message.content }}</text>
              
              <image 
                v-else-if="message.type === 'image'" 
                :src="message.content" 
                mode="widthFix"
                @click="handlePreviewImage(message.content)"
              />
              
              <view v-else-if="message.type === 'voice'" class="voice-content" @click="handlePlayVoice(message)">
                <text class="voice-icon">🎤</text>
                <text class="voice-duration">{{ message.duration }}"</text>
              </view>
              
              <view v-else-if="message.type === 'system'" class="system-content">
                {{ message.content }}
              </view>
            </view>
          </view>

          <image 
            v-if="message.isSelf" 
            class="user-avatar" 
            :src="message.userAvatar" 
            mode="aspectFill"
          />
        </view>
      </view>

      <view class="empty-state" v-if="messageList.length === 0 && !loading">
        <text class="empty-icon">💬</text>
        <text class="empty-text">暂无消息</text>
      </view>
    </scroll-view>

    <view class="input-area">
      <view class="input-toolbar">
        <view class="toolbar-btn" @click="handleChooseImage">
          <text class="icon">📷</text>
        </view>
        <view class="toolbar-btn" @click="handleChooseVoice">
          <text class="icon">🎤</text>
        </view>
        <view class="toolbar-btn" @click="handleChooseEmoji">
          <text class="icon">😊</text>
        </view>
      </view>

      <view class="input-wrapper">
        <input 
          v-model="inputText" 
          class="message-input"
          placeholder="输入消息..."
          placeholder-class="placeholder"
          @confirm="handleSendText"
        />
        <view class="send-btn" @click="handleSendText">
          <text>发送</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { groupChatApi } from '../../api/group-chat.js'

const groupId = ref('')
const scrollIntoView = ref('')
const loading = ref(false)
const loadingMore = ref(false)
const hasMore = ref(true)
const page = ref(1)
const pageSize = ref(20)

const groupInfo = ref({
  id: '',
  name: '',
  avatar: '',
  description: '',
  memberCount: 0,
  isMuted: false,
  isAnnouncement: false
})

const messageList = ref([])
const inputText = ref('')

const formatMessageTime = (timestamp) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date
  
  if (diff < 60000) {
    return '刚刚'
  } else if (diff < 3600000) {
    return `${Math.floor(diff / 60000)}分钟前`
  } else if (diff < 86400000) {
    return `${Math.floor(diff / 3600000)}小时前`
  } else {
    return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
  }
}

const handleBack = () => {
  uni.navigateBack()
}

const handleGroupInfo = () => {
  uni.navigateTo({
    url: `/pages/group-info/group-info?id=${groupId.value}`
  })
}

const handleMore = () => {
  const actions = ['查看群信息', '清空聊天记录', '举报群聊']
  
  uni.showActionSheet({
    itemList: actions,
    success: (res) => {
      handleAction(actions[res.tapIndex])
    }
  })
}

const handleAction = (action) => {
  switch (action) {
    case '查看群信息':
      handleGroupInfo()
      break
    case '清空聊天记录':
      handleClearMessages()
      break
    case '举报群聊':
      handleReportGroup()
      break
  }
}

const handleClearMessages = () => {
  uni.showModal({
    title: '确认清空',
    content: '确定要清空聊天记录吗？',
    success: (res) => {
      if (res.confirm) {
        messageList.value = []
        uni.showToast({
          title: '已清空',
          icon: 'success'
        })
      }
    }
  })
}

const handleReportGroup = () => {
  uni.navigateTo({
    url: `/pages/report/report?type=group&id=${groupId.value}`
  })
}

const handlePreviewImage = (url) => {
  uni.previewImage({
    urls: [url]
  })
}

const handlePlayVoice = (message) => {
  uni.showToast({
    title: '播放语音',
    icon: 'none'
  })
}

const handleChooseImage = () => {
  uni.chooseImage({
    count: 1,
    success: (res) => {
      handleSendImage(res.tempFilePaths[0])
    }
  })
}

const handleChooseVoice = () => {
  uni.showToast({
    title: '按住说话',
    icon: 'none'
  })
}

const handleChooseEmoji = () => {
  uni.showToast({
    title: '表情功能',
    icon: 'none'
  })
}

const handleSendText = () => {
  if (!inputText.value.trim()) return
  
  groupChatApi.sendMessage(groupId.value, {
    type: 'text',
    content: inputText.value
  }).then(() => {
    inputText.value = ''
  }).catch(error => {
    uni.showToast({
      title: '发送失败',
      icon: 'none'
    })
  })
}

const handleSendImage = (imagePath) => {
  uni.showLoading({ title: '发送中...' })
  
  groupChatApi.sendMessage(groupId.value, {
    type: 'image',
    content: imagePath
  }).then(() => {
    uni.hideLoading()
  }).catch(error => {
    uni.hideLoading()
    uni.showToast({
      title: '发送失败',
      icon: 'none'
    })
  })
}

const loadGroupInfo = () => {
  groupChatApi.getGroup(groupId.value).then(response => {
    groupInfo.value = response.data
  }).catch(error => {
    uni.showToast({
      title: '加载失败',
      icon: 'none'
    })
  })
}

const loadMessages = (reset = false) => {
  if (reset) {
    page.value = 1
    messageList.value = []
    hasMore.value = true
  }

  if (!hasMore.value) return

  loading.value = true
  
  groupChatApi.getMessages(groupId.value, {
    page: page.value,
    limit: pageSize.value
  }).then(response => {
    const newData = response.data.map((item, index) => ({
      ...item,
      showTime: index === 0 || new Date(item.createdAt) - new Date(response.data[index - 1]?.createdAt) > 300000
    }))
    
    if (reset) {
      messageList.value = newData.reverse()
    } else {
      messageList.value = [...newData.reverse(), ...messageList.value]
    }

    hasMore.value = newData.length >= pageSize.value
    page.value++

    if (reset) {
      nextTick(() => {
        scrollToBottom()
      })
    }
  }).catch(error => {
    uni.showToast({
      title: '加载失败',
      icon: 'none'
    })
  }).finally(() => {
    loading.value = false
  })
}

const loadMoreMessages = () => {
  if (!hasMore.value || loadingMore.value) return
  
  loadingMore.value = true
  page.value++
  
  groupChatApi.getMessages(groupId.value, {
    page: page.value,
    limit: pageSize.value
  }).then(response => {
    const newData = response.data.map((item, index) => ({
      ...item,
      showTime: new Date(item.createdAt) - new Date(messageList.value[0]?.createdAt) > 300000
    }))
    
    messageList.value = [...newData.reverse(), ...messageList.value]
    hasMore.value = newData.length >= pageSize.value
  }).catch(error => {
    page.value--
  }).finally(() => {
    loadingMore.value = false
  })
}

const scrollToBottom = () => {
  if (messageList.value.length > 0) {
    scrollIntoView.value = `message-${messageList.value[messageList.value.length - 1].id}`
  }
}

onMounted(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const options = currentPage.options
  
  if (options.id) {
    groupId.value = options.id
    loadGroupInfo()
    loadMessages(true)
  }
})
</script>

<style lang="scss" scoped>
.group-chat-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #000000;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.back-btn,
.more-btn {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
}

.icon {
  font-size: 32rpx;
  color: #ffffff;
}

.group-info {
  flex: 1;
  text-align: center;
}

.group-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 8rpx;
}

.member-count {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
}

.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 30rpx;
}

.load-more {
  text-align: center;
  padding: 20rpx;
  font-size: 24rpx;
  color: #999;
}

.message-item {
  margin-bottom: 30rpx;
}

.message-time {
  text-align: center;
  padding: 20rpx 0;
  font-size: 22rpx;
  color: #999;
}

.message-content-wrapper {
  display: flex;
  gap: 20rpx;
}

.message-item.is-self .message-content-wrapper {
  flex-direction: row-reverse;
}

.user-avatar {
  width: 70rpx;
  height: 70rpx;
  border-radius: 12rpx;
  background: #2a2a2a;
}

.message-bubble {
  max-width: 70%;
}

.user-name {
  font-size: 22rpx;
  color: #999;
  margin-bottom: 8rpx;
}

.message-item.is-self .user-name {
  text-align: right;
}

.bubble-content {
  padding: 20rpx 24rpx;
  background: #2a2a2a;
  border-radius: 16rpx;
  font-size: 28rpx;
  color: #ffffff;
  word-wrap: break-word;
}

.message-item.is-self .bubble-content {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.bubble-content.type-image {
  padding: 10rpx;
}

.bubble-content.type-image image {
  max-width: 400rpx;
  border-radius: 12rpx;
}

.bubble-content.type-voice {
  display: flex;
  align-items: center;
  gap: 16rpx;
  min-width: 200rpx;
}

.voice-icon {
  font-size: 32rpx;
}

.voice-duration {
  font-size: 24rpx;
  color: #999;
}

.bubble-content.type-system {
  text-align: center;
  background: transparent;
  color: #999;
  font-size: 24rpx;
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

.input-area {
  padding: 20rpx 30rpx;
  background: #1a1a1a;
  border-top: 1rpx solid #2a2a2a;
}

.input-toolbar {
  display: flex;
  gap: 20rpx;
  margin-bottom: 16rpx;
}

.toolbar-btn {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #2a2a2a;
  border-radius: 12rpx;
}

.toolbar-btn .icon {
  font-size: 32rpx;
  color: #999;
}

.input-wrapper {
  display: flex;
  gap: 20rpx;
}

.message-input {
  flex: 1;
  padding: 20rpx 24rpx;
  background: #2a2a2a;
  border-radius: 30rpx;
  font-size: 28rpx;
  color: #ffffff;
}

.placeholder {
  color: #999;
}

.send-btn {
  padding: 20rpx 32rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 30rpx;
  font-size: 28rpx;
  color: #ffffff;
}
</style>
