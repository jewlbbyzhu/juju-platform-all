<template>
  <view class="ticket-stats-detail-container">
    <view class="header">
      <view class="back-btn" @click="handleBack">
        <text class="icon">←</text>
      </view>
      <view class="title">票型详情</view>
      <view class="share-btn" @click="handleShare">
        <text class="icon">📤</text>
      </view>
    </view>

    <view class="ticket-info-card">
      <view class="ticket-header">
        <view class="ticket-name">{{ ticketInfo.name }}</view>
        <view class="ticket-type">{{ getTicketTypeText(ticketInfo.type) }}</view>
      </view>

      <view class="ticket-price">
        <text class="price-symbol">¥</text>
        <text class="price-value">{{ ticketInfo.price }}</text>
        <text class="price-original" v-if="ticketInfo.originalPrice">¥{{ ticketInfo.originalPrice }}</text>
      </view>

      <view class="ticket-meta">
        <view class="meta-item">
          <text class="meta-label">总库存</text>
          <text class="meta-value">{{ ticketInfo.stock }}</text>
        </view>
        <view class="meta-item">
          <text class="meta-label">已售</text>
          <text class="meta-value">{{ ticketInfo.sold }}</text>
        </view>
        <view class="meta-item">
          <text class="meta-label">剩余</text>
          <text class="meta-value">{{ ticketInfo.stock - ticketInfo.sold }}</text>
        </view>
      </view>

      <view class="ticket-status" :class="`status-${ticketInfo.status}`">
        {{ getTicketStatusText(ticketInfo.status) }}
      </view>
    </view>

    <view class="stats-overview">
      <view class="overview-title">销售概览</view>
      <view class="overview-grid">
        <view class="overview-item">
          <view class="item-label">总销量</view>
          <view class="item-value">{{ formatNumber(ticketInfo.totalSales) }}</view>
          <view class="item-trend" :class="ticketInfo.salesTrend >= 0 ? 'up' : 'down'">
            <text>{{ ticketInfo.salesTrend >= 0 ? '↑' : '↓' }}</text>
            <text>{{ Math.abs(ticketInfo.salesTrend) }}%</text>
          </view>
        </view>

        <view class="overview-item">
          <view class="item-label">总营收</view>
          <view class="item-value">¥{{ formatMoney(ticketInfo.totalRevenue) }}</view>
          <view class="item-trend" :class="ticketInfo.revenueTrend >= 0 ? 'up' : 'down'">
            <text>{{ ticketInfo.revenueTrend >= 0 ? '↑' : '↓' }}</text>
            <text>{{ Math.abs(ticketInfo.revenueTrend) }}%</text>
          </view>
        </view>

        <view class="overview-item">
          <view class="item-label">转化率</view>
          <view class="item-value">{{ ticketInfo.conversionRate }}%</view>
          <view class="item-trend" :class="ticketInfo.conversionTrend >= 0 ? 'up' : 'down'">
            <text>{{ ticketInfo.conversionTrend >= 0 ? '↑' : '↓' }}</text>
            <text>{{ Math.abs(ticketInfo.conversionTrend) }}%</text>
          </view>
        </view>

        <view class="overview-item">
          <view class="item-label">客单价</view>
          <view class="item-value">¥{{ formatMoney(ticketInfo.avgOrderValue) }}</view>
          <view class="item-trend" :class="ticketInfo.avgOrderTrend >= 0 ? 'up' : 'down'">
            <text>{{ ticketInfo.avgOrderTrend >= 0 ? '↑' : '↓' }}</text>
            <text>{{ Math.abs(ticketInfo.avgOrderTrend) }}%</text>
          </view>
        </view>
      </view>
    </view>

    <view class="sales-chart">
      <view class="chart-title">销售趋势</view>
      <view class="chart-tabs">
        <view 
          v-for="item in chartTypeOptions" 
          :key="item.value"
          class="chart-tab"
          :class="{ active: chartType === item.value }"
          @click="handleChartType(item.value)"
        >
          {{ item.label }}
        </view>
      </view>
      <view class="chart-placeholder">
        <text class="placeholder-icon">📈</text>
        <text class="placeholder-text">销售趋势图表</text>
      </view>
    </view>

    <view class="time-distribution">
      <view class="distribution-title">时段分布</view>
      <view class="distribution-list">
        <view 
          v-for="item in timeDistribution" 
          :key="item.time"
          class="distribution-item"
        >
          <view class="time-label">{{ item.time }}</view>
          <view class="time-bar">
            <view 
              class="time-fill" 
              :style="{ width: `${item.percentage}%` }"
            ></view>
          </view>
          <view class="time-value">{{ formatNumber(item.count) }}</view>
        </view>
      </view>
    </view>

    <view class="user-distribution">
      <view class="distribution-title">用户分布</view>
      <view class="distribution-grid">
        <view class="distribution-card">
          <view class="card-label">新用户</view>
          <view class="card-value">{{ ticketInfo.newUserCount }}</view>
          <view class="card-percent">{{ ticketInfo.newUserPercent }}%</view>
        </view>

        <view class="distribution-card">
          <view class="card-label">老用户</view>
          <view class="card-value">{{ ticketInfo.oldUserCount }}</view>
          <view class="card-percent">{{ ticketInfo.oldUserPercent }}%</view>
        </view>

        <view class="distribution-card">
          <view class="card-label">VIP用户</view>
          <view class="card-value">{{ ticketInfo.vipUserCount }}</view>
          <view class="card-percent">{{ ticketInfo.vipUserPercent }}%</view>
        </view>

        <view class="distribution-card">
          <view class="card-label">普通用户</view>
          <view class="card-value">{{ ticketInfo.normalUserCount }}</view>
          <view class="card-percent">{{ ticketInfo.normalUserPercent }}%</view>
        </view>
      </view>
    </view>

    <view class="recent-orders">
      <view class="orders-title">最近订单</view>
      <view class="orders-list">
        <view 
          v-for="item in recentOrders" 
          :key="item.id"
          class="order-item"
          @click="handleOrderDetail(item.id)"
        >
          <view class="order-header">
            <view class="order-user">
              <text class="user-name">{{ item.userName }}</text>
              <text class="user-avatar">{{ item.userAvatar }}</text>
            </view>
            <view class="order-time">{{ formatTime(item.createdAt) }}</view>
          </view>

          <view class="order-info">
            <view class="order-quantity">数量: {{ item.quantity }}</view>
            <view class="order-amount">¥{{ item.amount }}</view>
          </view>

          <view class="order-status" :class="`status-${item.status}`">
            {{ getOrderStatusText(item.status) }}
          </view>
        </view>
      </view>
    </view>

    <view class="action-buttons">
      <view class="action-btn primary" @click="handleViewOrders">
        <text>查看全部订单</text>
      </view>
      <view class="action-btn" @click="handleEditTicket">
        <text>编辑票型</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ticketStatsApi } from '@/api/ticket-stats.js'

const ticketId = ref('')
const chartType = ref('sales')
const loading = ref(false)

const chartTypeOptions = [
  { label: '销量', value: 'sales' },
  { label: '营收', value: 'revenue' },
  { label: '转化率', value: 'conversion' }
]

const ticketInfo = ref({
  id: '',
  name: '',
  type: 0,
  price: 0,
  originalPrice: 0,
  stock: 0,
  sold: 0,
  status: 0,
  totalSales: 0,
  totalRevenue: 0,
  conversionRate: 0,
  avgOrderValue: 0,
  salesTrend: 0,
  revenueTrend: 0,
  conversionTrend: 0,
  avgOrderTrend: 0,
  newUserCount: 0,
  newUserPercent: 0,
  oldUserCount: 0,
  oldUserPercent: 0,
  vipUserCount: 0,
  vipUserPercent: 0,
  normalUserCount: 0,
  normalUserPercent: 0
})

const timeDistribution = ref([
  { time: '00:00-06:00', count: 0, percentage: 0 },
  { time: '06:00-12:00', count: 0, percentage: 0 },
  { time: '12:00-18:00', count: 0, percentage: 0 },
  { time: '18:00-24:00', count: 0, percentage: 0 }
])

const recentOrders = ref([])

const formatNumber = (num) => {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万'
  }
  return num.toString()
}

const formatMoney = (amount) => {
  if (amount >= 10000) {
    return (amount / 10000).toFixed(2) + '万'
  }
  return amount.toFixed(2)
}

const formatTime = (timestamp) => {
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
    return `${Math.floor(diff / 86400000)}天前`
  }
}

const getTicketTypeText = (type) => {
  const typeMap = {
    0: '普通',
    1: '早鸟',
    2: '男性',
    3: '女性',
    4: '男性早鸟',
    5: '女性早鸟',
    6: 'VIP专享',
    7: '团购票',
    8: '套票'
  }
  return typeMap[type] || '未知'
}

const getTicketStatusText = (status) => {
  const statusMap = {
    0: '在售',
    1: '售罄',
    2: '停售',
    3: '预售'
  }
  return statusMap[status] || '未知'
}

const getOrderStatusText = (status) => {
  const statusMap = {
    0: '待支付',
    1: '已支付',
    2: '已取消',
    3: '已退款',
    4: '已完成'
  }
  return statusMap[status] || '未知'
}

const handleBack = () => {
  uni.navigateBack()
}

const handleShare = () => {
  uni.showShareMenu({
    withShareTicket: true
  })
}

const handleChartType = (value) => {
  chartType.value = value
}

const handleOrderDetail = (orderId) => {
  uni.navigateTo({
    url: `/pages/order-detail/order-detail?id=${orderId}`
  })
}

const handleViewOrders = () => {
  uni.navigateTo({
    url: `/pages/ticket-orders/ticket-orders?id=${ticketId.value}`
  })
}

const handleEditTicket = () => {
  uni.navigateTo({
    url: `/pages/edit-ticket/edit-ticket?id=${ticketId.value}`
  })
}

const loadTicketDetail = () => {
  loading.value = true
  
  ticketStatsApi.getTicketSalesDetail(ticketId.value, {}).then(response => {
    ticketInfo.value = response.data
    timeDistribution.value = response.data.timeDistribution || timeDistribution.value
    recentOrders.value = response.data.recentOrders || []
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
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const options = currentPage.options
  
  if (options.id) {
    ticketId.value = options.id
    loadTicketDetail()
  }
})
</script>

<style lang="scss" scoped>
.ticket-stats-detail-container {
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

.back-btn,
.share-btn {
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

.title {
  font-size: 36rpx;
  font-weight: bold;
  color: #ffffff;
}

.ticket-info-card {
  margin: 30rpx;
  padding: 30rpx;
  background: #1a1a1a;
  border-radius: 16rpx;
}

.ticket-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.ticket-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #ffffff;
}

.ticket-type {
  padding: 8rpx 16rpx;
  background: rgba(102, 126, 234, 0.2);
  border-radius: 8rpx;
  font-size: 22rpx;
  color: #667eea;
}

.ticket-price {
  display: flex;
  align-items: baseline;
  gap: 12rpx;
  margin-bottom: 24rpx;
}

.price-symbol {
  font-size: 28rpx;
  color: #667eea;
}

.price-value {
  font-size: 48rpx;
  font-weight: bold;
  color: #667eea;
}

.price-original {
  font-size: 24rpx;
  color: #999;
  text-decoration: line-through;
}

.ticket-meta {
  display: flex;
  justify-content: space-around;
  margin-bottom: 24rpx;
}

.meta-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}

.meta-label {
  font-size: 22rpx;
  color: #999;
}

.meta-value {
  font-size: 28rpx;
  font-weight: bold;
  color: #ffffff;
}

.ticket-status {
  padding: 12rpx 24rpx;
  text-align: center;
  background: rgba(0, 200, 83, 0.2);
  border-radius: 8rpx;
  font-size: 24rpx;
  color: #00c853;
}

.ticket-status.status-0 {
  background: rgba(0, 200, 83, 0.2);
  color: #00c853;
}

.ticket-status.status-1 {
  background: rgba(255, 61, 0, 0.2);
  color: #ff3d00;
}

.ticket-status.status-2 {
  background: rgba(255, 193, 7, 0.2);
  color: #ffc107;
}

.ticket-status.status-3 {
  background: rgba(102, 126, 234, 0.2);
  color: #667eea;
}

.stats-overview {
  margin: 30rpx;
  padding: 30rpx;
  background: #1a1a1a;
  border-radius: 16rpx;
}

.overview-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 24rpx;
}

.overview-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24rpx;
}

.overview-item {
  padding: 24rpx;
  background: #2a2a2a;
  border-radius: 12rpx;
}

.item-label {
  font-size: 22rpx;
  color: #999;
  margin-bottom: 12rpx;
}

.item-value {
  font-size: 32rpx;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 8rpx;
}

.item-trend {
  font-size: 22rpx;
  display: flex;
  align-items: center;
  gap: 4rpx;
}

.item-trend.up {
  color: #00c853;
}

.item-trend.down {
  color: #ff3d00;
}

.sales-chart {
  margin: 30rpx;
  padding: 30rpx;
  background: #1a1a1a;
  border-radius: 16rpx;
}

.chart-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 24rpx;
}

.chart-tabs {
  display: flex;
  gap: 20rpx;
  margin-bottom: 30rpx;
}

.chart-tab {
  padding: 16rpx 24rpx;
  background: #2a2a2a;
  border-radius: 20rpx;
  font-size: 24rpx;
  color: #999;
}

.chart-tab.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
}

.chart-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80rpx 0;
  gap: 20rpx;
}

.placeholder-icon {
  font-size: 80rpx;
  opacity: 0.5;
}

.placeholder-text {
  font-size: 26rpx;
  color: #666;
}

.time-distribution {
  margin: 30rpx;
  padding: 30rpx;
  background: #1a1a1a;
  border-radius: 16rpx;
}

.distribution-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 24rpx;
}

.distribution-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.distribution-item {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.time-label {
  width: 140rpx;
  font-size: 24rpx;
  color: #999;
}

.time-bar {
  flex: 1;
  height: 12rpx;
  background: #2a2a2a;
  border-radius: 6rpx;
  overflow: hidden;
}

.time-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  transition: width 0.3s;
}

.time-value {
  width: 100rpx;
  text-align: right;
  font-size: 24rpx;
  font-weight: bold;
  color: #ffffff;
}

.user-distribution {
  margin: 30rpx;
  padding: 30rpx;
  background: #1a1a1a;
  border-radius: 16rpx;
}

.distribution-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
}

.distribution-card {
  padding: 24rpx;
  background: #2a2a2a;
  border-radius: 12rpx;
  text-align: center;
}

.card-label {
  font-size: 22rpx;
  color: #999;
  margin-bottom: 12rpx;
}

.card-value {
  font-size: 32rpx;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 8rpx;
}

.card-percent {
  font-size: 22rpx;
  color: #667eea;
}

.recent-orders {
  margin: 30rpx;
  padding: 30rpx;
  background: #1a1a1a;
  border-radius: 16rpx;
}

.orders-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 24rpx;
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.order-item {
  padding: 24rpx;
  background: #2a2a2a;
  border-radius: 12rpx;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.order-user {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.user-name {
  font-size: 26rpx;
  color: #ffffff;
}

.user-avatar {
  width: 40rpx;
  height: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #3a3a3a;
  border-radius: 50%;
  font-size: 20rpx;
  color: #999;
}

.order-time {
  font-size: 22rpx;
  color: #999;
}

.order-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.order-quantity {
  font-size: 24rpx;
  color: #999;
}

.order-amount {
  font-size: 26rpx;
  font-weight: bold;
  color: #667eea;
}

.order-status {
  padding: 8rpx 16rpx;
  text-align: center;
  background: rgba(0, 200, 83, 0.2);
  border-radius: 8rpx;
  font-size: 22rpx;
  color: #00c853;
}

.order-status.status-0 {
  background: rgba(255, 193, 7, 0.2);
  color: #ffc107;
}

.order-status.status-1 {
  background: rgba(0, 200, 83, 0.2);
  color: #00c853;
}

.order-status.status-2 {
  background: rgba(255, 61, 0, 0.2);
  color: #ff3d00;
}

.order-status.status-3 {
  background: rgba(255, 61, 0, 0.2);
  color: #ff3d00;
}

.order-status.status-4 {
  background: rgba(102, 126, 234, 0.2);
  color: #667eea;
}

.action-buttons {
  display: flex;
  gap: 20rpx;
  padding: 30rpx;
}

.action-btn {
  flex: 1;
  padding: 28rpx;
  text-align: center;
  background: #2a2a2a;
  border-radius: 12rpx;
  font-size: 28rpx;
  color: #ffffff;
}

.action-btn.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
</style>
