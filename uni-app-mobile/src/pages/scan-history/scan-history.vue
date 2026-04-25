<template>
  <view class="history-container">
    <view class="history-header">
      <text class="history-title">验票记录</text>
      <view class="stats-summary">
        <view class="stat-item">
          <text class="stat-value">{{ todayCount }}</text>
          <text class="stat-label">今日</text>
        </view>
        <view class="stat-divider"></view>
        <view class="stat-item">
          <text class="stat-value">{{ totalCount }}</text>
          <text class="stat-label">总计</text>
        </view>
        <view class="stat-divider"></view>
        <view class="stat-item">
          <text class="stat-value">{{ successCount }}</text>
          <text class="stat-label">成功</text>
        </view>
      </view>
    </view>

    <view class="filter-bar">
      <view 
        class="filter-item" 
        :class="{ active: filter === 'all' }"
        @tap="setFilter('all')"
      >
        <text class="filter-text">全部</text>
      </view>
      <view 
        class="filter-item" 
        :class="{ active: filter === 'success' }"
        @tap="setFilter('success')"
      >
        <text class="filter-text">成功</text>
      </view>
      <view 
        class="filter-item" 
        :class="{ active: filter === 'used' }"
        @tap="setFilter('used')"
      >
        <text class="filter-text">已使用</text>
      </view>
      <view 
        class="filter-item" 
        :class="{ active: filter === 'invalid' }"
        @tap="setFilter('invalid')"
      >
        <text class="filter-text">无效</text>
      </view>
    </view>

    <scroll-view class="history-list" scroll-y @scrolltolower="loadMore">
      <view 
        class="history-item" 
        v-for="item in filteredHistory" 
        :key="item.id"
        @tap="viewDetail(item)"
      >
        <view class="item-status" :class="item.status">
          <text class="status-icon">{{ getStatusIcon(item.status) }}</text>
        </view>

        <view class="item-content">
          <view class="item-header">
            <text class="item-title">{{ item.partyName }}</text>
            <text class="item-time">{{ formatTime(item.createdAt) }}</text>
          </view>

          <view class="item-info">
            <text class="info-text">票型: {{ item.ticketType }}</text>
            <text class="info-text">持票人: {{ item.userName }}</text>
          </view>

          <view class="item-footer">
            <text class="item-message" :class="item.status">{{ item.message }}</text>
            <text class="item-arrow">›</text>
          </view>
        </view>
      </view>

      <view class="loading-more" v-if="loading">
        <text>加载中...</text>
      </view>

      <view class="no-more" v-if="!hasMore && history.length > 0">
        <text>没有更多了</text>
      </view>

      <view class="empty-state" v-if="history.length === 0 && !loading">
        <text class="empty-icon">📋</text>
        <text class="empty-text">暂无验票记录</text>
        <text class="empty-tip">扫描票券后将显示在这里</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { scanApi } from '@/api/scan.js'

const history = ref([])
const loading = ref(false)
const hasMore = ref(true)
const page = ref(1)
const pageSize = ref(20)
const filter = ref('all')

const todayCount = ref(0)
const totalCount = ref(0)
const successCount = ref(0)

const filteredHistory = computed(() => {
  if (filter.value === 'all') return history.value
  return history.value.filter(item => item.status === filter.value)
})

const getStatusIcon = (status) => {
  const icons = {
    success: '✅',
    used: '📋',
    invalid: '❌'
  }
  return icons[status] || '❓'
}

const formatTime = (time) => {
  if (!time) return ''
  const date = new Date(time)
  const now = new Date()
  const diff = now - date
  
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
    const month = date.getMonth() + 1
    const dayOfMonth = date.getDate()
    const hour = date.getHours()
    const minute = date.getMinutes()
    return `${month}月${dayOfMonth}日 ${hour}:${minute.toString().padStart(2, '0')}`
  }
}

const setFilter = (newFilter) => {
  filter.value = newFilter
}

const loadHistory = async (reset = false) => {
  if (reset) {
    page.value = 1
    history.value = []
    hasMore.value = true
  }

  if (loading.value || !hasMore.value) return

  loading.value = true

  try {
    const res = await scanApi.getScanHistory({
      page: page.value,
      pageSize: pageSize.value,
      status: filter.value === 'all' ? undefined : filter.value
    })

    if (res.code === 0) {
      const newItems = res.data.list || []
      if (reset) {
        history.value = newItems
      } else {
        history.value = [...history.value, ...newItems]
      }

      hasMore.value = newItems.length >= pageSize.value
      page.value++

      todayCount.value = res.data.todayCount || 0
      totalCount.value = res.data.totalCount || 0
      successCount.value = res.data.successCount || 0
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
  loadHistory(false)
}

const viewDetail = (item) => {
  uni.navigateTo({
    url: `/pages/scan-detail/scan-detail?id=${item.id}`
  })
}

const refresh = () => {
  loadHistory(true)
}

onMounted(() => {
  loadHistory(true)
})

uni.$on('scanHistoryRefresh', refresh)
</script>

<style lang="scss" scoped>
.history-container {
  min-height: 100vh;
  background: #000000;
}

.history-header {
  padding: 30rpx;
  background: linear-gradient(180deg, rgba(102, 126, 234, 0.2) 0%, rgba(0, 0, 0, 0) 100%);
}

.history-title {
  display: block;
  font-size: 36rpx;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 30rpx;
}

.stats-summary {
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 30rpx;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20rpx;
  backdrop-filter: blur(10px);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10rpx;
}

.stat-value {
  font-size: 40rpx;
  font-weight: bold;
  color: #667eea;
}

.stat-label {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.6);
}

.stat-divider {
  width: 1rpx;
  height: 60rpx;
  background: rgba(255, 255, 255, 0.1);
}

.filter-bar {
  display: flex;
  gap: 20rpx;
  padding: 20rpx 30rpx;
  background: rgba(255, 255, 255, 0.02);
}

.filter-item {
  flex: 1;
  padding: 20rpx;
  text-align: center;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 30rpx;
  transition: all 0.3s;
}

.filter-item.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.filter-text {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.7);
}

.filter-item.active .filter-text {
  color: #ffffff;
  font-weight: 500;
}

.history-list {
  height: calc(100vh - 300rpx);
}

.history-item {
  display: flex;
  padding: 30rpx;
  background: rgba(255, 255, 255, 0.02);
  border-bottom: 1rpx solid rgba(255, 255, 255, 0.05);
  gap: 20rpx;
}

.item-status {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
}

.item-status.success {
  background: rgba(82, 196, 26, 0.2);
}

.item-status.used {
  background: rgba(250, 173, 20, 0.2);
}

.item-status.invalid {
  background: rgba(255, 77, 79, 0.2);
}

.status-icon {
  font-size: 40rpx;
}

.item-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 15rpx;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.item-title {
  font-size: 30rpx;
  font-weight: 500;
  color: #ffffff;
}

.item-time {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.5);
}

.item-info {
  display: flex;
  gap: 30rpx;
}

.info-text {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.6);
}

.item-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.item-message {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.5);
}

.item-message.success {
  color: #52c41a;
}

.item-message.used {
  color: #faad14;
}

.item-message.invalid {
  color: #ff4d4f;
}

.item-arrow {
  font-size: 32rpx;
  color: rgba(255, 255, 255, 0.3);
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
