<template>
  <view class="comments-container">
    <view class="comments-header">
      <text class="comments-title">评论 ({{ totalCount }})</text>
      <view class="sort-btn" @tap="toggleSort">
        <text class="sort-text">{{ sortText }}</text>
        <text class="sort-icon">▼</text>
      </view>
    </view>

    <view class="comment-input-wrapper">
      <image 
        class="user-avatar" 
        :src="userInfo?.avatar || '/static/default-avatar.png'" 
        mode="aspectFill"
      ></image>
      <view class="input-container">
        <input 
          class="comment-input" 
          v-model="inputText" 
          placeholder="写下你的评论..."
          @confirm="handleSubmit"
          :maxlength="500"
        />
        <view class="input-actions">
          <text class="char-count">{{ inputText.length }}/500</text>
          <button 
            class="submit-btn" 
            :disabled="!inputText.trim() || submitting"
            @tap="handleSubmit"
          >
            <text>发送</text>
          </button>
        </view>
      </view>
    </view>

    <scroll-view class="comments-list" scroll-y>
      <view 
        class="comment-item" 
        v-for="comment in sortedComments" 
        :key="comment.id"
      >
        <image 
          class="comment-avatar" 
          :src="comment.user?.avatar || '/static/default-avatar.png'" 
          mode="aspectFill"
        ></image>

        <view class="comment-content">
          <view class="comment-header">
            <text class="comment-author">{{ comment.user?.nickname || '匿名用户' }}</text>
            <text class="comment-time">{{ formatTime(comment.created_at) }}</text>
          </view>

          <text class="comment-text">{{ comment.content }}</text>

          <view class="comment-actions">
            <view class="action-item" @tap="handleLike(comment)">
              <text class="action-icon">{{ comment.is_liked ? '❤️' : '🤍' }}</text>
              <text class="action-count">{{ comment.like_count || 0 }}</text>
            </view>

            <view class="action-item" @tap="handleReply(comment)">
              <text class="action-icon">💬</text>
              <text class="action-text">回复</text>
            </view>

            <view 
              class="action-item" 
              @tap="handleDelete(comment)"
              v-if="comment.user_id === userInfo?.id"
            >
              <text class="action-icon">🗑️</text>
              <text class="action-text">删除</text>
            </view>

            <view class="action-item" @tap="handleReport(comment)">
              <text class="action-icon">⚠️</text>
              <text class="action-text">举报</text>
            </view>
          </view>

          <view class="replies-wrapper" v-if="comment.replies && comment.replies.length > 0">
            <view 
              class="reply-item" 
              v-for="reply in comment.replies" 
              :key="reply.id"
            >
              <image 
                class="reply-avatar" 
                :src="reply.user?.avatar || '/static/default-avatar.png'" 
                mode="aspectFill"
              ></image>

              <view class="reply-content">
                <view class="reply-header">
                  <text class="reply-author">{{ reply.user?.nickname || '匿名用户' }}</text>
                  <text class="reply-time">{{ formatTime(reply.created_at) }}</text>
                </view>

                <text class="reply-text">{{ reply.content }}</text>
              </view>
            </view>

            <view class="show-more-replies" @tap="loadMoreReplies(comment)" v-if="comment.reply_count > comment.replies.length">
              <text>查看全部 {{ comment.reply_count }} 条回复</text>
            </view>
          </view>
        </view>
      </view>

      <view class="loading-more" v-if="loading">
        <text>加载中...</text>
      </view>

      <view class="no-more" v-if="!hasMore && comments.length > 0">
        <text>没有更多了</text>
      </view>

      <view class="empty-state" v-if="comments.length === 0 && !loading">
        <image class="empty-icon" src="/static/empty.png" mode="aspectFit"></image>
        <text class="empty-text">暂无评论</text>
        <text class="empty-tip">快来发表第一条评论吧</text>
      </view>
    </scroll-view>

    <view class="reply-input-container" v-if="showReplyInput && replyingTo">
      <view class="reply-input-wrapper">
        <view class="reply-info">
          <text class="reply-label">回复</text>
          <text class="reply-target">{{ replyingTo.user?.nickname || '匿名用户' }}</text>
          <text class="reply-close" @tap="cancelReply">✕</text>
        </view>
        <textarea 
          class="reply-textarea" 
          v-model="replyContent" 
          placeholder="写下你的回复..."
          :maxlength="500"
          auto-height
        ></textarea>
        <view class="reply-actions">
          <text class="char-count">{{ replyContent.length }}/500</text>
          <button 
            class="submit-btn" 
            :disabled="!replyContent.trim() || submitting"
            @tap="submitReply"
          >
            <text>发送</text>
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { socialApi } from '@/api/social.js'

const props = defineProps({
  partyId: {
    type: [String, Number],
    required: true
  }
})

const emit = defineEmits(['commentAdded', 'commentDeleted'])

const userInfo = ref(null)
const comments = ref([])
const inputText = ref('')
const submitting = ref(false)
const loading = ref(false)
const hasMore = ref(true)
const page = ref(1)
const pageSize = ref(20)
const sortBy = ref('hot')
const replyingTo = ref(null)
const replyContent = ref('')
const showReplyInput = ref(false)

const totalCount = computed(() => comments.value.length)

const sortText = computed(() => {
  return sortBy.value === 'hot' ? '最热' : '最新'
})

const sortedComments = computed(() => {
  if (sortBy.value === 'hot') {
    return [...comments.value].sort((a, b) => (b.like_count || 0) - (a.like_count || 0))
  }
  return [...comments.value].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
})

const loadUserInfo = () => {
  const user = uni.getStorageSync('userInfo')
  if (user) {
    userInfo.value = user
  }
}

const loadComments = async (reset = false) => {
  if (reset) {
    page.value = 1
    comments.value = []
    hasMore.value = true
  }

  if (loading.value || !hasMore.value) return

  loading.value = true

  try {
    const res = await socialApi.getComments(props.partyId, {
      page: page.value,
      pageSize: pageSize.value,
      sortBy: sortBy.value
    })

    if (res.code === 0) {
      const newComments = res.data.list || []
      if (reset) {
        comments.value = newComments
      } else {
        comments.value = [...comments.value, ...newComments]
      }

      hasMore.value = newComments.length >= pageSize.value
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

const handleSubmit = async () => {
  if (!inputText.value.trim()) return

  submitting.value = true

  try {
    const res = await socialApi.addComment(props.partyId, {
      content: inputText.value.trim()
    })

    if (res.code === 0) {
      inputText.value = ''
      comments.value.unshift(res.data)
      emit('commentAdded', res.data)

      uni.showToast({
        title: '评论成功',
        icon: 'success'
      })
    }
  } catch (error) {
    uni.showToast({
      title: '评论失败',
      icon: 'none'
    })
  } finally {
    submitting.value = false
  }
}

const handleLike = async (comment) => {
  try {
    if (comment.is_liked) {
      await socialApi.unlikeComment(comment.id)
      comment.is_liked = false
      comment.like_count = Math.max(0, (comment.like_count || 0) - 1)
    } else {
      await socialApi.likeComment(comment.id)
      comment.is_liked = true
      comment.like_count = (comment.like_count || 0) + 1
    }
  } catch (error) {
    uni.showToast({
      title: '操作失败',
      icon: 'none'
    })
  }
}

const handleReply = (comment) => {
  replyingTo.value = comment
  replyContent.value = ''
  showReplyInput.value = true
  
  nextTick(() => {
    uni.pageScrollTo({
      selector: '.reply-input-container',
      duration: 300
    })
  })
}

const submitReply = async () => {
  if (!replyContent.value.trim()) {
    uni.showToast({
      title: '请输入回复内容',
      icon: 'none'
    })
    return
  }

  submitting.value = true

  try {
    const res = await socialApi.addComment({
      partyId: partyId.value,
      content: replyContent.value,
      parentId: replyingTo.value.id
    })

    if (res.code === 0) {
      const newReply = res.data
      
      if (!replyingTo.value.replies) {
        replyingTo.value.replies = []
      }
      replyingTo.value.replies.push(newReply)
      replyingTo.value.replyCount = (replyingTo.value.replyCount || 0) + 1
      
      emit('commentAdded', newReply)
      
      uni.showToast({
        title: '回复成功',
        icon: 'success'
      })

      cancelReply()
    } else {
      uni.showToast({
        title: res.message || '回复失败',
        icon: 'none'
      })
    }
  } catch (error) {
    uni.showToast({
      title: error.message || '网络错误',
      icon: 'none'
    })
  } finally {
    submitting.value = false
  }
}

const cancelReply = () => {
  replyingTo.value = null
  replyContent.value = ''
  showReplyInput.value = false
}

const handleDelete = async (comment) => {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除这条评论吗?',
    success: async (res) => {
      if (res.confirm) {
        try {
          const res = await socialApi.deleteComment(comment.id)
          if (res.code === 0) {
            const index = comments.value.findIndex(c => c.id === comment.id)
            if (index > -1) {
              comments.value.splice(index, 1)
            }
            emit('commentDeleted', comment)

            uni.showToast({
              title: '删除成功',
              icon: 'success'
            })
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

const handleReport = (comment) => {
  const reportReasons = [
    { id: 1, text: '垃圾广告' },
    { id: 2, text: '色情低俗' },
    { id: 3, text: '政治敏感' },
    { id: 4, text: '人身攻击' },
    { id: 5, text: '虚假信息' },
    { id: 6, text: '其他' }
  ]

  const items = reportReasons.map(r => r.text)
  
  uni.showActionSheet({
    itemList: items,
    success: async (res) => {
      const reasonId = reportReasons[res.tapIndex].id
      const reasonText = reportReasons[res.tapIndex].text
      
      uni.showModal({
        title: '确认举报',
        content: `确定要举报这条评论吗？\n举报原因：${reasonText}`,
        success: async (modalRes) => {
          if (modalRes.confirm) {
            try {
              const reportRes = await socialApi.reportComment({
                commentId: comment.id,
                reasonId: reasonId,
                reason: reasonText
              })

              if (reportRes.code === 0) {
                uni.showToast({
                  title: '举报成功',
                  icon: 'success'
                })
              } else {
                uni.showToast({
                  title: reportRes.message || '举报失败',
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
    }
  })
}

const loadMoreReplies = (comment) => {
  uni.showToast({
    title: '加载更多回复功能开发中',
    icon: 'none'
  })
}

const toggleSort = () => {
  sortBy.value = sortBy.value === 'hot' ? 'latest' : 'hot'
  loadComments(true)
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
  } else if (diff < 7 * day) {
    return `${Math.floor(diff / day)}天前`
  } else {
    const date = new Date(time)
    const month = date.getMonth() + 1
    const day = date.getDate()
    return `${month}月${day}日`
  }
}

onMounted(() => {
  loadUserInfo()
  loadComments()
})
</script>

<style lang="scss" scoped>
.comments-container {
  min-height: 100vh;
  background: var(--theme-background);
}

.comments-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid var(--theme-border);
}

.comments-title {
  font-size: 36rpx;
  font-weight: bold;
  color: var(--theme-text);
}

.sort-btn {
  display: flex;
  align-items: center;
  padding: 10rpx 20rpx;
  background: var(--theme-surface);
  border-radius: 30rpx;
}

.sort-text {
  font-size: 24rpx;
  color: var(--theme-text-secondary);
  margin-right: 10rpx;
}

.sort-icon {
  font-size: 20rpx;
  color: var(--theme-text-secondary);
}

.comment-input-wrapper {
  display: flex;
  padding: 30rpx;
  background: var(--theme-surface);
  border-bottom: 1rpx solid var(--theme-border);
}

.user-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  margin-right: 20rpx;
}

.input-container {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.comment-input {
  flex: 1;
  min-height: 80rpx;
  background: var(--theme-background);
  border-radius: 20rpx;
  padding: 20rpx;
  font-size: 28rpx;
  color: var(--theme-text);
  border: 1rpx solid var(--theme-border);
}

.input-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 15rpx;
}

.char-count {
  font-size: 24rpx;
  color: var(--theme-text-secondary);
}

.submit-btn {
  padding: 15rpx 40rpx;
  background: var(--theme-accent);
  border-radius: 30rpx;
  font-size: 28rpx;
  color: #ffffff;
  border: none;

  &:disabled {
    background: var(--theme-text-secondary);
    opacity: 0.5;
  }

  &::after {
    border: none;
  }
}

.comments-list {
  height: calc(100vh - 300rpx);
}

.comment-item {
  display: flex;
  padding: 30rpx;
  border-bottom: 1rpx solid var(--theme-border);
}

.comment-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  margin-right: 20rpx;
}

.comment-content {
  flex: 1;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15rpx;
}

.comment-author {
  font-size: 28rpx;
  font-weight: bold;
  color: var(--theme-text);
}

.comment-time {
  font-size: 24rpx;
  color: var(--theme-text-secondary);
}

.comment-text {
  display: block;
  font-size: 28rpx;
  line-height: 1.6;
  color: var(--theme-text);
  margin-bottom: 20rpx;
}

.comment-actions {
  display: flex;
  gap: 30rpx;
}

.action-item {
  display: flex;
  align-items: center;
}

.action-icon {
  font-size: 28rpx;
  margin-right: 8rpx;
}

.action-count {
  font-size: 24rpx;
  color: var(--theme-text-secondary);
}

.action-text {
  font-size: 24rpx;
  color: var(--theme-text-secondary);
}

.replies-wrapper {
  margin-top: 20rpx;
  padding: 20rpx;
  background: var(--theme-background);
  border-radius: 15rpx;
}

.reply-item {
  display: flex;
  margin-bottom: 20rpx;

  &:last-child {
    margin-bottom: 0;
  }
}

.reply-avatar {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  margin-right: 15rpx;
}

.reply-content {
  flex: 1;
}

.reply-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10rpx;
}

.reply-author {
  font-size: 24rpx;
  font-weight: bold;
  color: var(--theme-text);
}

.reply-time {
  font-size: 20rpx;
  color: var(--theme-text-secondary);
}

.reply-text {
  display: block;
  font-size: 24rpx;
  line-height: 1.6;
  color: var(--theme-text);
}

.show-more-replies {
  text-align: center;
  padding: 15rpx;
  font-size: 24rpx;
  color: var(--theme-accent);
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

.reply-input-container {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #1a1a1a;
  border-top: 1rpx solid rgba(255, 255, 255, 0.1);
  padding: 20rpx;
  z-index: 1000;
}

.reply-input-wrapper {
  max-width: 750rpx;
  margin: 0 auto;
}

.reply-info {
  display: flex;
  align-items: center;
  gap: 15rpx;
  padding-bottom: 15rpx;
  border-bottom: 1rpx solid rgba(255, 255, 255, 0.05);
  margin-bottom: 15rpx;
}

.reply-label {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.5);
}

.reply-target {
  flex: 1;
  font-size: 26rpx;
  color: #667eea;
  font-weight: 500;
}

.reply-close {
  font-size: 32rpx;
  color: rgba(255, 255, 255, 0.5);
  padding: 10rpx;
}

.reply-textarea {
  width: 100%;
  min-height: 120rpx;
  max-height: 300rpx;
  padding: 20rpx;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 15rpx;
  font-size: 28rpx;
  color: #ffffff;
  line-height: 1.6;
}

.reply-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 15rpx;
}
</style>
