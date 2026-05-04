<template>
  <view class="share-poster-container">
    <view class="header">
      <text class="header-title">生成分享海报</text>
      <text class="header-close" @tap="close">✕</text>
    </view>

    <view class="poster-preview">
      <poster-generator 
        v-if="showPoster"
        :party="party"
        :user="user"
      />
    </view>

    <view class="poster-info" v-if="party">
      <view class="info-item">
        <text class="info-label">聚会名称</text>
        <text class="info-value">{{ party.title }}</text>
      </view>
      <view class="info-item">
        <text class="info-label">开始时间</text>
        <text class="info-value">{{ formatTime(party.start_time) }}</text>
      </view>
      <view class="info-item">
        <text class="info-label">地点</text>
        <text class="info-value">{{ party.address || '线上活动' }}</text>
      </view>
      <view class="info-item" v-if="party.ticket_types && party.ticket_types.length > 0">
        <text class="info-label">票价</text>
        <text class="info-value">¥{{ party.ticket_types[0].price }}起</text>
      </view>
    </view>

    <view class="poster-tips">
      <text class="tips-title">分享提示</text>
      <view class="tips-list">
        <view class="tip-item">
          <text class="tip-icon">✓</text>
          <text class="tip-text">海报包含聚会关键信息</text>
        </view>
        <view class="tip-item">
          <text class="tip-icon">✓</text>
          <text class="tip-text">扫码即可快速参与</text>
        </view>
        <view class="tip-item">
          <text class="tip-icon">✓</text>
          <text class="tip-text">支持保存到相册</text>
        </view>
        <view class="tip-item">
          <text class="tip-icon">✓</text>
          <text class="tip-text">一键分享到微信</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import PosterGenerator from '@/components/poster-generator.vue'

const userStore = useUserStore()

const party = ref(null)
const user = ref(null)
const showPoster = ref(false)

const loadPartyData = () => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const options = currentPage.options || {}

  if (options.partyId) {
    const { partyApi } = require('../api/party.js')
    
    partyApi.getPartyDetail(options.partyId).then(res => {
      if (res.code === 0) {
        party.value = res.data
        setTimeout(() => {
          showPoster.value = true
        }, 300)
      }
    }).catch(error => {
      uni.showToast({
        title: '加载失败',
        icon: 'none'
      })
    })
  }
}

const formatTime = (time) => {
  if (!time) return ''
  const date = new Date(time)
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  return `${month}月${day}日 ${hour}:${minute.toString().padStart(2, '0')}`
}

const close = () => {
  uni.navigateBack()
}

const onShareAppMessage = () => {
  return {
    title: party.value?.title ? `分享聚会：${party.value.title}` : '分享聚会海报',
    path: `/pages/party-detail/party-detail?id=${party.value?.id || ''}`,
    imageUrl: party.value?.coverImage || '/static/share-cover.png'
  }
}

const onShareTimeline = () => {
  return {
    title: party.value?.title ? `分享聚会：${party.value.title}` : '分享聚会海报',
    query: `id=${party.value?.id || ''}`,
    imageUrl: party.value?.coverImage || '/static/share-cover.png'
  }
}

onMounted(() => {
  user.value = userStore.userInfo
  loadPartyData()
})
</script>

<style lang="scss" scoped>
.share-poster-container {
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
  font-size: 32rpx;
  font-weight: bold;
  color: #ffffff;
}

.header-close {
  font-size: 40rpx;
  color: rgba(255, 255, 255, 0.6);
  padding: 10rpx;
}

.poster-preview {
  padding: 30rpx;
}

.poster-info {
  margin: 30rpx;
  padding: 30rpx;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 20rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.05);
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid rgba(255, 255, 255, 0.05);

  &:last-child {
    border-bottom: none;
  }
}

.info-label {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.5);
}

.info-value {
  font-size: 26rpx;
  color: #ffffff;
  font-weight: 500;
}

.poster-tips {
  margin: 30rpx;
  padding: 30rpx;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(0, 0, 0, 0) 100%);
  border-radius: 20rpx;
  border: 1rpx solid rgba(102, 126, 234, 0.3);
}

.tips-title {
  display: block;
  font-size: 28rpx;
  font-weight: 500;
  color: #667eea;
  margin-bottom: 20rpx;
}

.tips-list {
  display: flex;
  flex-direction: column;
  gap: 15rpx;
}

.tip-item {
  display: flex;
  align-items: center;
  gap: 15rpx;
}

.tip-icon {
  font-size: 32rpx;
  color: #52c41a;
}

.tip-text {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.7);
}
</style>
