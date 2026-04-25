<template>
  <view class="private-chat-container">
    <view class="chat-header">
      <view class="header-left" @tap="goBack">
        <text class="back-icon">‹</text>
      </view>
      <view class="header-center">
        <image 
          class="user-avatar" 
          :src="userInfo.avatar || '/static/default-avatar.png'" 
          mode="aspectFill"
        ></image>
        <text class="user-name">{{ userInfo.nickname || '未知用户' }}</text>
      </view>
      <view class="header-right">
        <text class="header-icon" @tap="viewProfile">👤</text>
        <text class="header-icon" @tap="showMore">⋯</text>
      </view>
    </view>

    <scroll-view 
      class="message-list" 
      scroll-y 
      :scroll-top="scrollTop"
      @scrolltoupper="loadMore"
      scroll-with-animation
    >
      <view 
        class="message-item" 
        v-for="message in messages" 
        :key="message.id"
        :class="{ self: message.is_self }"
      >
        <image 
          class="message-avatar" 
          v-if="!message.is_self"
          :src="message.sender_avatar || '/static/default-avatar.png'" 
          mode="aspectFill"
        ></image>

        <view class="message-content">
          <view class="message-bubble" :class="{ image: message.type === 'image', voice: message.type === 'voice' }">
            <image 
              class="message-image" 
              v-if="message.type === 'image'"
              :src="message.content" 
              mode="aspectFill"
              @tap="previewImage(message.content)"
            ></image>
            <view 
              class="voice-player" 
              v-else-if="message.type === 'voice'"
              @tap="playVoice(message)"
            >
              <text class="voice-icon">🎤</text>
              <text class="voice-duration">{{ message.duration }}s</text>
            </view>
            <text class="message-text" v-else>{{ message.content }}</text>
            <text class="message-time">{{ formatTime(message.created_at) }}</text>
          </view>
        </view>

        <view class="message-actions" @tap.stop="showMessageActions(message)">
          <text class="action-icon">⋯</text>
        </view>
      </view>

      <view class="loading-more" v-if="loadingMore">
        <text>加载更多...</text>
      </view>
    </scroll-view>

    <view class="input-area">
      <view class="input-tools">
        <text class="tool-btn" @tap="chooseImage">🖼️</text>
        <text class="tool-btn" @tap="chooseVoice">🎤</text>
        <text class="tool-btn" @tap="chooseEmoji">😊</text>
      </view>
      <view class="input-wrapper">
        <input 
          class="message-input" 
          v-model="inputText" 
          placeholder="输入消息..."
          @confirm="sendMessage"
          :maxlength="500"
        />
        <button 
          class="send-btn" 
          :disabled="!inputText.trim() || sending"
          @tap="sendMessage"
        >
          <text>发送</text>
        </button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { chatApi } from '@/api/chat.js'

const conversationId = ref('')
const userInfo = ref({})
const messages = ref([])
const inputText = ref('')
const sending = ref(false)
const loadingMore = ref(false)
const scrollTop = ref(0)
const page = ref(1)
const pageSize = ref(20)

const loadMessages = async (reset = false) => {
  if (reset) {
    page.value = 1
    messages.value = []
  }

  if (loadingMore.value) return

  loadingMore.value = true

  try {
    const res = await chatApi.getMessages(conversationId.value, {
      page: page.value,
      pageSize: pageSize.value
    })

    if (res.code === 0) {
      const newMessages = res.data.list || []
      if (reset) {
        messages.value = newMessages
      } else {
        messages.value = [...newMessages, ...messages.value]
      }

      if (reset) {
        scrollToBottom()
      }

      page.value++
    }
  } catch (error) {
    uni.showToast({
      title: '加载失败',
      icon: 'none'
    })
  } finally {
    loadingMore.value = false
  }
}

const loadMore = () => {
  loadMessages(false)
}

const scrollToBottom = () => {
  nextTick(() => {
    scrollTop.value = 999999
  })
}

const sendMessage = async () => {
  if (!inputText.value.trim() || sending.value) return

  sending.value = true

  try {
    const res = await chatApi.sendMessage(conversationId.value, {
      content: inputText.value,
      type: 'text'
    })

    if (res.code === 0) {
      messages.value.push(res.data)
      inputText.value = ''
      scrollToBottom()
    } else {
      uni.showToast({
        title: res.message || '发送失败',
        icon: 'none'
      })
    }
  } catch (error) {
    uni.showToast({
      title: '网络错误',
      icon: 'none'
    })
  } finally {
    sending.value = false
  }
}

const chooseImage = () => {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: async (res) => {
      const filePath = res.tempFilePaths[0]
      
      try {
        const uploadRes = await chatApi.uploadImage(filePath)
        if (uploadRes.code === 0) {
          const sendRes = await chatApi.sendMessage(conversationId.value, {
            content: uploadRes.data.url,
            type: 'image'
          })

          if (sendRes.code === 0) {
            messages.value.push(sendRes.data)
            scrollToBottom()
          }
        }
      } catch (error) {
        uni.showToast({
          title: '上传失败',
          icon: 'none'
        })
      }
    }
  })
}

const chooseVoice = () => {
  uni.startRecord({
    success: async (res) => {
      uni.stopRecord({
        success: async (stopRes) => {
          const filePath = stopRes.tempFilePath
          
          try {
            const uploadRes = await chatApi.uploadVoice(filePath)
            if (uploadRes.code === 0) {
              const sendRes = await chatApi.sendMessage(conversationId.value, {
                content: uploadRes.data.url,
                type: 'voice',
                duration: uploadRes.data.duration
              })

              if (sendRes.code === 0) {
                messages.value.push(sendRes.data)
                scrollToBottom()
              }
            }
          } catch (error) {
            uni.showToast({
              title: '上传失败',
              icon: 'none'
            })
          }
        }
      })
    }
  })
}

const chooseEmoji = () => {
  uni.showToast({
    title: '表情功能开发中',
    icon: 'none'
  })
}

const previewImage = (url) => {
  uni.previewImage({
    urls: [url]
  })
}

const playVoice = (message) => {
  uni.showToast({
    title: '播放语音',
    icon: 'none'
  })
}

const showMessageActions = (message) => {
  const items = ['复制', '删除']
  
  uni.showActionSheet({
    itemList: items,
    success: async (res) => {
      if (res.tapIndex === 0) {
        uni.setClipboardData({
          data: message.content,
          success: () => {
            uni.showToast({
              title: '复制成功',
              icon: 'success'
            })
          }
        })
      } else if (res.tapIndex === 1) {
        await deleteMessage(message)
      }
    }
  })
}

const deleteMessage = (message) => {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除这条消息吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          const deleteRes = await chatApi.deleteMessage(message.id)
          if (deleteRes.code === 0) {
            const index = messages.value.findIndex(m => m.id === message.id)
            if (index > -1) {
              messages.value.splice(index, 1)
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

const goBack = () => {
  uni.navigateBack()
}

const viewProfile = () => {
  uni.navigateTo({
    url: `/pages/user-profile/user-profile?userId=${userInfo.value.id}`
  })
}

const showMore = () => {
  const items = ['查看资料', '清空聊天记录']
  
  uni.showActionSheet({
    itemList: items,
    success: async (res) => {
      if (res.tapIndex === 0) {
        viewProfile()
      } else if (res.tapIndex === 1) {
        uni.showModal({
          title: '确认清空',
          content: '确定要清空聊天记录吗？',
          success: async (modalRes) => {
            if (modalRes.confirm) {
              messages.value = []
              uni.showToast({
                title: '已清空',
                icon: 'success'
              })
            }
          }
        })
      }
    }
  })
}

const formatTime = (time) => {
  if (!time) return ''
  const date = new Date(time)
  const hour = date.getHours()
  const minute = date.getMinutes()
  return `${hour}:${minute.toString().padStart(2, '0')}`
}

onMounted(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const options = currentPage.options || {}

  conversationId.value = options.conversationId || ''
  
  if (options.userInfo) {
    userInfo.value = JSON.parse(decodeURIComponent(options.userInfo))
  }

  loadMessages(true)
})
</script>

<style lang="scss" scoped>
.private-chat-container {
  height: 100vh;
  background: #000000;
  display: flex;
  flex-direction: column;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 30rpx;
  background: rgba(255, 255, 255, 0.02);
  border-bottom: 1rpx solid rgba(255, 255, 255, 0.05);
}

.header-left,
.header-right {
  display: flex;
  gap: 20rpx;
}

.back-icon {
  font-size: 48rpx;
  color: rgba(255, 255, 255, 0.7);
}

.header-center {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 15rpx;
}

.user-avatar {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
}

.user-name {
  font-size: 28rpx;
  font-weight: 500;
  color: #ffffff;
}

.header-icon {
  font-size: 36rpx;
  color: rgba(255, 255, 255, 0.7);
}

.message-list {
  flex: 1;
  padding: 20rpx;
  overflow: hidden;
}

.message-item {
  display: flex;
  margin-bottom: 30rpx;
  gap: 15rpx;
}

.message-item.self {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 70rpx;
  height: 70rpx;
  border-radius: 50%;
  flex-shrink: 0;
}

.message-content {
  max-width: 70%;
}

.message-bubble {
  padding: 20rpx 25rpx;
  border-radius: 20rpx;
  position: relative;
}

.message-item:not(.self) .message-bubble {
  background: rgba(255, 255, 255, 0.1);
  border-top-left-radius: 5rpx;
}

.message-item.self .message-bubble {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-top-right-radius: 5rpx;
}

.message-bubble.image {
  padding: 10rpx;
}

.message-bubble.voice {
  padding: 15rpx 20rpx;
}

.message-image {
  max-width: 400rpx;
  max-height: 400rpx;
  border-radius: 10rpx;
}

.voice-player {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.voice-icon {
  font-size: 40rpx;
}

.voice-duration {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.7);
}

.message-text {
  font-size: 28rpx;
  color: #ffffff;
  line-height: 1.5;
  word-break: break-all;
}

.message-time {
  display: block;
  font-size: 20rpx;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 10rpx;
}

.message-actions {
  flex-shrink: 0;
  padding: 10rpx;
}

.action-icon {
  font-size: 32rpx;
  color: rgba(255, 255, 255, 0.5);
}

.input-area {
  padding: 20rpx 30rpx;
  background: rgba(255, 255, 255, 0.02);
  border-top: 1rpx solid rgba(255, 255, 255, 0.05);
}

.input-tools {
  display: flex;
  gap: 20rpx;
  margin-bottom: 15rpx;
}

.tool-btn {
  font-size: 36rpx;
  padding: 10rpx;
}

.input-wrapper {
  display: flex;
  gap: 15rpx;
}

.message-input {
  flex: 1;
  height: 80rpx;
  padding: 0 25rpx;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20rpx;
  font-size: 28rpx;
  color: #ffffff;
}

.send-btn {
  padding: 0 40rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20rpx;
  font-size: 26rpx;
  color: #ffffff;
  border: none;

  &::after {
    border: none;
  }
}

.send-btn:disabled {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.5);
}

.loading-more {
  text-align: center;
  padding: 20rpx;
  color: rgba(255, 255, 255, 0.5);
  font-size: 24rpx;
}
</style>
