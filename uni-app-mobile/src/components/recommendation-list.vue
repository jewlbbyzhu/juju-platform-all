<template>
  <view class="recommendation-container">
    <view class="recommendation-header" v-if="showHeader">
      <text class="recommendation-title">{{ title }}</text>
      <view class="recommendation-more" @tap="handleMore" v-if="showMore">
        <text class="more-text">更多</text>
        <text class="more-arrow">›</text>
      </view>
    </view>

    <scroll-view 
      class="recommendation-scroll" 
      scroll-x 
      show-scrollbar="false"
      v-if="scrollable"
    >
      <view class="recommendation-list">
        <view 
          class="recommendation-item" 
          v-for="party in parties" 
          :key="party.id"
          @tap="handlePartyClick(party)"
        >
          <view class="party-image-wrapper">
            <image 
              class="party-image" 
              :src="party.images?.[0] || '/static/default-party.png'" 
              mode="aspectFill" 
              lazy-load
            ></image>
            <view class="recommendation-badge" v-if="party.recommendationScore">
              <text class="badge-text">推荐</text>
            </view>
            <view class="score-indicator" v-if="showScore">
              <text class="score-text">{{ Math.round(party.recommendationScore * 100) }}%</text>
            </view>
          </view>

          <view class="party-info">
            <text class="party-title">{{ party.title }}</text>
            <view class="party-meta">
              <text class="meta-item">{{ getCategoryText(party.category) }}</text>
              <text class="meta-item">{{ formatTime(party.start_time) }}</text>
            </view>
            <view class="party-footer">
              <view class="price-info">
                <text class="price-label">¥</text>
                <text class="price-value">{{ getMinPrice(party.ticket_types) }}</text>
              </view>
              <view class="participants-info">
                <text class="participants-count">{{ party.participant_count }}</text>
                <text class="participants-label">人</text>
              </view>
            </view>
          </view>

          <view class="recommendation-reason" v-if="party.recommendationReason && showReason">
            <text class="reason-icon">✨</text>
            <text class="reason-text">{{ party.recommendationReason }}</text>
          </view>
        </view>
      </view>
    </scroll-view>

    <view class="recommendation-grid" v-else>
      <view 
        class="recommendation-item" 
        v-for="party in parties" 
        :key="party.id"
        @tap="handlePartyClick(party)"
      >
        <view class="party-image-wrapper">
          <image 
            class="party-image" 
            :src="party.images?.[0] || '/static/default-party.png'" 
            mode="aspectFill" 
            lazy-load
          ></image>
          <view class="recommendation-badge" v-if="party.recommendationScore">
            <text class="badge-text">推荐</text>
          </view>
          <view class="score-indicator" v-if="showScore">
            <text class="score-text">{{ Math.round(party.recommendationScore * 100) }}%</text>
          </view>
        </view>

        <view class="party-info">
          <text class="party-title">{{ party.title }}</text>
          <view class="party-meta">
            <text class="meta-item">{{ getCategoryText(party.category) }}</text>
            <text class="meta-item">{{ formatTime(party.start_time) }}</text>
          </view>
          <view class="party-footer">
            <view class="price-info">
              <text class="price-label">¥</text>
              <text class="price-value">{{ getMinPrice(party.ticket_types) }}</text>
            </view>
            <view class="participants-info">
              <text class="participants-count">{{ party.participant_count }}</text>
              <text class="participants-label">人</text>
            </view>
          </view>
        </view>

        <view class="recommendation-reason" v-if="party.recommendationReason && showReason">
          <text class="reason-icon">✨</text>
          <text class="reason-text">{{ party.recommendationReason }}</text>
        </view>
      </view>
    </view>

    <view class="empty-state" v-if="parties.length === 0 && !loading">
      <image class="empty-icon" src="/static/empty.png" mode="aspectFit"></image>
      <text class="empty-text">暂无推荐</text>
      <text class="empty-tip">浏览更多聚会以获取个性化推荐</text>
    </view>

    <view class="loading-state" v-if="loading">
      <text>加载中...</text>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import recommendationEngine from '@/utils/recommendation.js'

const props = defineProps({
  title: {
    type: String,
    default: '为您推荐'
  },
  parties: {
    type: Array,
    default: () => []
  },
  scrollable: {
    type: Boolean,
    default: true
  },
  showHeader: {
    type: Boolean,
    default: true
  },
  showMore: {
    type: Boolean,
    default: false
  },
  showScore: {
    type: Boolean,
    default: false
  },
  showReason: {
    type: Boolean,
    default: true
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['partyClick', 'moreClick'])

const handlePartyClick = (party) => {
  recommendationEngine.trackView(party.id, party.category)
  emit('partyClick', party)
}

const handleMore = () => {
  emit('moreClick')
}

const getCategoryText = (category) => {
  const textMap = {
    'party': '派对',
    'music': '音乐',
    'sports': '运动',
    'art': '艺术'
  }
  return textMap[category] || '其他'
}

const formatTime = (time) => {
  if (!time) return ''
  const date = new Date(time)
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${month}月${day}日 ${hours}:${minutes}`
}

const getMinPrice = (ticketTypes) => {
  if (!ticketTypes || ticketTypes.length === 0) return 0
  const prices = ticketTypes.map(t => parseFloat(t.price))
  return Math.min(...prices)
}
</script>

<style lang="scss" scoped>
.recommendation-container {
  margin-bottom: 30rpx;
}

.recommendation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
  padding: 0 20rpx;
}

.recommendation-title {
  font-size: 36rpx;
  font-weight: bold;
  color: var(--theme-text);
}

.recommendation-more {
  display: flex;
  align-items: center;
}

.more-text {
  font-size: 28rpx;
  color: var(--theme-text-secondary);
  margin-right: 5rpx;
}

.more-arrow {
  font-size: 32rpx;
  color: var(--theme-text-secondary);
}

.recommendation-scroll {
  white-space: nowrap;
}

.recommendation-list {
  display: inline-flex;
  padding: 0 20rpx;
}

.recommendation-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
  padding: 0 20rpx;
}

.recommendation-item {
  display: inline-block;
  width: 400rpx;
  background: var(--theme-surface);
  border-radius: var(--theme-border-radius);
  overflow: hidden;
  box-shadow: var(--theme-shadow);
  transition: transform 0.3s;

  &:active {
    transform: scale(0.98);
  }

  .recommendation-grid & {
    width: 100%;
  }
}

.party-image-wrapper {
  position: relative;
  width: 100%;
  height: 300rpx;
}

.party-image {
  width: 100%;
  height: 100%;
}

.recommendation-badge {
  position: absolute;
  top: 15rpx;
  left: 15rpx;
  background: var(--theme-accent);
  padding: 8rpx 20rpx;
  border-radius: 20rpx;
}

.badge-text {
  font-size: 20rpx;
  color: #ffffff;
  font-weight: bold;
}

.score-indicator {
  position: absolute;
  top: 15rpx;
  right: 15rpx;
  background: rgba(0, 0, 0, 0.7);
  padding: 8rpx 15rpx;
  border-radius: 20rpx;
}

.score-text {
  font-size: 20rpx;
  color: #ffffff;
  font-weight: bold;
}

.party-info {
  padding: 20rpx;
}

.party-title {
  display: block;
  font-size: 28rpx;
  font-weight: bold;
  color: var(--theme-text);
  margin-bottom: 15rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.party-meta {
  display: flex;
  gap: 15rpx;
  margin-bottom: 15rpx;
}

.meta-item {
  font-size: 24rpx;
  color: var(--theme-text-secondary);
}

.party-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price-info {
  display: flex;
  align-items: baseline;
}

.price-label {
  font-size: 20rpx;
  color: var(--theme-accent);
  margin-right: 5rpx;
}

.price-value {
  font-size: 32rpx;
  font-weight: bold;
  color: var(--theme-accent);
}

.participants-info {
  display: flex;
  align-items: baseline;
}

.participants-count {
  font-size: 28rpx;
  font-weight: bold;
  color: var(--theme-text);
  margin-right: 5rpx;
}

.participants-label {
  font-size: 20rpx;
  color: var(--theme-text-secondary);
}

.recommendation-reason {
  display: flex;
  align-items: center;
  padding: 15rpx 20rpx;
  background: rgba(255, 107, 53, 0.1);
  border-top: 1rpx solid var(--theme-border);
}

.reason-icon {
  font-size: 24rpx;
  margin-right: 10rpx;
}

.reason-text {
  flex: 1;
  font-size: 22rpx;
  color: var(--theme-accent);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.empty-state {
  text-align: center;
  padding: 60rpx 20rpx;
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

.loading-state {
  text-align: center;
  padding: 60rpx 20rpx;
  color: var(--theme-text-secondary);
  font-size: 28rpx;
}
</style>
