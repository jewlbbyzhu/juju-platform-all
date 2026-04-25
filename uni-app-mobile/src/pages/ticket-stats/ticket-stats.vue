<template>
  <view class="ticket-stats-container">
    <view class="header">
      <view class="title">票型销售统计</view>
      <view class="export-btn" @click="handleExport">
        <text class="icon">📊</text>
        <text>导出报表</text>
      </view>
    </view>

    <view class="time-filter">
      <view 
        v-for="item in timeOptions" 
        :key="item.value"
        class="filter-item"
        :class="{ active: timeFilter === item.value }"
        @click="handleTimeFilter(item.value)"
      >
        {{ item.label }}
      </view>
    </view>

    <view class="stats-cards">
      <view class="stats-card">
        <view class="card-label">总销量</view>
        <view class="card-value">{{ formatNumber(stats.totalSales) }}</view>
        <view class="card-trend" :class="stats.salesTrend >= 0 ? 'up' : 'down'">
          <text>{{ stats.salesTrend >= 0 ? '↑' : '↓' }}</text>
          <text>{{ Math.abs(stats.salesTrend) }}%</text>
        </view>
      </view>

      <view class="stats-card">
        <view class="card-label">总营收</view>
        <view class="card-value">¥{{ formatMoney(stats.totalRevenue) }}</view>
        <view class="card-trend" :class="stats.revenueTrend >= 0 ? 'up' : 'down'">
          <text>{{ stats.revenueTrend >= 0 ? '↑' : '↓' }}</text>
          <text>{{ Math.abs(stats.revenueTrend) }}%</text>
        </view>
      </view>

      <view class="stats-card">
        <view class="card-label">转化率</view>
        <view class="card-value">{{ stats.conversionRate }}%</view>
        <view class="card-trend" :class="stats.conversionTrend >= 0 ? 'up' : 'down'">
          <text>{{ stats.conversionTrend >= 0 ? '↑' : '↓' }}</text>
          <text>{{ Math.abs(stats.conversionTrend) }}%</text>
        </view>
      </view>

      <view class="stats-card">
        <view class="card-label">平均客单价</view>
        <view class="card-value">¥{{ formatMoney(stats.avgOrderValue) }}</view>
        <view class="card-trend" :class="stats.avgOrderTrend >= 0 ? 'up' : 'down'">
          <text>{{ stats.avgOrderTrend >= 0 ? '↑' : '↓' }}</text>
          <text>{{ Math.abs(stats.avgOrderTrend) }}%</text>
        </view>
      </view>
    </view>

    <view class="chart-section">
      <view class="section-title">销售趋势</view>
      <view class="chart-container">
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
    </view>

    <view class="ranking-section">
      <view class="section-title">票型销量排行</view>
      <view class="ranking-list">
        <view 
          v-for="(item, index) in rankingList" 
          :key="item.id"
          class="ranking-item"
          @click="handleTicketDetail(item.id)"
        >
          <view class="ranking-index" :class="`rank-${index + 1}`">
            {{ index + 1 }}
          </view>
          <view class="ranking-info">
            <view class="ticket-name">{{ item.name }}</view>
            <view class="ticket-type">{{ getTicketTypeText(item.type) }}</view>
          </view>
          <view class="ranking-stats">
            <view class="sales-count">{{ formatNumber(item.sales) }}张</view>
            <view class="revenue">¥{{ formatMoney(item.revenue) }}</view>
          </view>
        </view>
      </view>
    </view>

    <view class="detail-section">
      <view class="section-title">票型详情</view>
      <view class="detail-list">
        <view 
          v-for="item in detailList" 
          :key="item.id"
          class="detail-item"
          @click="handleTicketDetail(item.id)"
        >
          <view class="detail-header">
            <view class="ticket-info">
              <text class="ticket-name">{{ item.name }}</text>
              <text class="ticket-type">{{ getTicketTypeText(item.type) }}</text>
            </view>
            <view class="ticket-status" :class="`status-${item.status}`">
              {{ getTicketStatusText(item.status) }}
            </view>
          </view>

          <view class="detail-stats">
            <view class="stat-item">
              <text class="stat-label">价格</text>
              <text class="stat-value">¥{{ item.price }}</text>
            </view>
            <view class="stat-item">
              <text class="stat-label">销量</text>
              <text class="stat-value">{{ formatNumber(item.sales) }}</text>
            </view>
            <view class="stat-item">
              <text class="stat-label">营收</text>
              <text class="stat-value">¥{{ formatMoney(item.revenue) }}</text>
            </view>
            <view class="stat-item">
              <text class="stat-label">转化率</text>
              <text class="stat-value">{{ item.conversionRate }}%</text>
            </view>
          </view>

          <view class="detail-progress">
            <view class="progress-label">
              <text>库存进度</text>
              <text>{{ item.sold }}/{{ item.stock }}</text>
            </view>
            <view class="progress-bar">
              <view 
                class="progress-fill" 
                :style="{ width: `${(item.sold / item.stock) * 100}%` }"
              ></view>
            </view>
          </view>

          <view class="detail-actions">
            <view class="action-btn" @click.stop="handleViewDetail(item.id)">
              <text>查看详情</text>
            </view>
            <view class="action-btn" @click.stop="handleViewOrders(item.id)">
              <text>查看订单</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <view class="loading-more" v-if="loading">
      <text>加载中...</text>
    </view>

    <view class="no-more" v-if="!hasMore && detailList.length > 0">
      <text>没有更多了</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ticketStatsApi } from '../../api/ticket-stats.js'

const timeOptions = [
  { label: '今日', value: 'today' },
  { label: '本周', value: 'week' },
  { label: '本月', value: 'month' },
  { label: '自定义', value: 'custom' }
]

const chartTypeOptions = [
  { label: '销量', value: 'sales' },
  { label: '营收', value: 'revenue' },
  { label: '转化率', value: 'conversion' }
]

const timeFilter = ref('today')
const chartType = ref('sales')
const loading = ref(false)
const hasMore = ref(true)
const page = ref(1)
const pageSize = ref(10)

const stats = ref({
  totalSales: 0,
  totalRevenue: 0,
  conversionRate: 0,
  avgOrderValue: 0,
  salesTrend: 0,
  revenueTrend: 0,
  conversionTrend: 0,
  avgOrderTrend: 0
})

const rankingList = ref([])
const detailList = ref([])

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

const handleTimeFilter = (value) => {
  timeFilter.value = value
  loadStats()
}

const handleChartType = (value) => {
  chartType.value = value
  loadChart()
}

const handleTicketDetail = (ticketId) => {
  uni.navigateTo({
    url: `/pages/ticket-stats-detail/ticket-stats-detail?id=${ticketId}`
  })
}

const handleViewDetail = (ticketId) => {
  uni.navigateTo({
    url: `/pages/ticket-stats-detail/ticket-stats-detail?id=${ticketId}`
  })
}

const handleViewOrders = (ticketId) => {
  uni.navigateTo({
    url: `/pages/ticket-orders/ticket-orders?id=${ticketId}`
  })
}

const handleExport = () => {
  uni.showLoading({ title: '导出中...' })
  
  ticketStatsApi.exportTicketSalesReport({
    timeFilter: timeFilter.value,
    chartType: chartType.value
  }).then(response => {
    uni.hideLoading()
    uni.showToast({
      title: '导出成功',
      icon: 'success'
    })
  }).catch(error => {
    uni.hideLoading()
    uni.showToast({
      title: '导出失败',
      icon: 'none'
    })
  })
}

const loadStats = () => {
  loading.value = true
  
  ticketStatsApi.getTicketSalesStats({
    timeFilter: timeFilter.value
  }).then(response => {
    stats.value = response.data
  }).catch(error => {
    uni.showToast({
      title: '加载失败',
      icon: 'none'
    })
  }).finally(() => {
    loading.value = false
  })
}

const loadChart = () => {
  ticketStatsApi.getTicketSalesTrend({
    timeFilter: timeFilter.value,
    chartType: chartType.value
  }).then(response => {
  }).catch(error => {
    uni.showToast({
      title: '加载失败',
      icon: 'none'
    })
  })
}

const loadRanking = () => {
  ticketStatsApi.getTicketSalesRanking({
    timeFilter: timeFilter.value,
    limit: 10
  }).then(response => {
    rankingList.value = response.data
  }).catch(error => {
    uni.showToast({
      title: '加载失败',
      icon: 'none'
    })
  })
}

const loadDetail = (reset = false) => {
  if (reset) {
    page.value = 1
    detailList.value = []
    hasMore.value = true
  }

  if (!hasMore.value) return

  loading.value = true
  
  ticketStatsApi.getTicketSalesDetail('', {
    page: page.value,
    limit: pageSize.value,
    timeFilter: timeFilter.value
  }).then(response => {
    const newData = response.data
    
    if (reset) {
      detailList.value = newData
    } else {
      detailList.value = [...detailList.value, ...newData]
    }

    hasMore.value = newData.length >= pageSize.value
    page.value++
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
  loadStats()
  loadChart()
  loadRanking()
  loadDetail(true)
})

uni.onReachBottom(() => {
  if (!loading.value && hasMore.value) {
    loadDetail()
  }
})
</script>

<style lang="scss" scoped>
.ticket-stats-container {
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

.export-btn {
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

.time-filter {
  display: flex;
  gap: 20rpx;
  padding: 30rpx;
  background: #1a1a1a;
}

.filter-item {
  flex: 1;
  padding: 20rpx;
  text-align: center;
  background: #2a2a2a;
  border-radius: 12rpx;
  font-size: 26rpx;
  color: #999;
  transition: all 0.3s;
}

.filter-item.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
  padding: 30rpx;
}

.stats-card {
  padding: 30rpx;
  background: #1a1a1a;
  border-radius: 16rpx;
}

.card-label {
  font-size: 24rpx;
  color: #999;
  margin-bottom: 16rpx;
}

.card-value {
  font-size: 36rpx;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 12rpx;
}

.card-trend {
  font-size: 24rpx;
  display: flex;
  align-items: center;
  gap: 4rpx;
}

.card-trend.up {
  color: #00c853;
}

.card-trend.down {
  color: #ff3d00;
}

.chart-section {
  padding: 30rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 24rpx;
}

.chart-container {
  background: #1a1a1a;
  border-radius: 16rpx;
  padding: 30rpx;
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

.ranking-section {
  padding: 30rpx;
}

.ranking-list {
  background: #1a1a1a;
  border-radius: 16rpx;
  overflow: hidden;
}

.ranking-item {
  display: flex;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #2a2a2a;
}

.ranking-item:last-child {
  border-bottom: none;
}

.ranking-index {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #2a2a2a;
  border-radius: 12rpx;
  font-size: 28rpx;
  font-weight: bold;
  color: #999;
  margin-right: 20rpx;
}

.ranking-index.rank-1 {
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
  color: #000000;
}

.ranking-index.rank-2 {
  background: linear-gradient(135deg, #c0c0c0 0%, #e8e8e8 100%);
  color: #000000;
}

.ranking-index.rank-3 {
  background: linear-gradient(135deg, #cd7f32 0%, #daa06d 100%);
  color: #000000;
}

.ranking-info {
  flex: 1;
}

.ticket-name {
  font-size: 28rpx;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 8rpx;
}

.ticket-type {
  font-size: 24rpx;
  color: #999;
}

.ranking-stats {
  text-align: right;
}

.sales-count {
  font-size: 28rpx;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 8rpx;
}

.revenue {
  font-size: 24rpx;
  color: #667eea;
}

.detail-section {
  padding: 30rpx;
}

.detail-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.detail-item {
  background: #1a1a1a;
  border-radius: 16rpx;
  padding: 30rpx;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.ticket-info {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.ticket-name {
  font-size: 28rpx;
  font-weight: bold;
  color: #ffffff;
}

.ticket-type {
  font-size: 24rpx;
  color: #999;
}

.ticket-status {
  padding: 8rpx 16rpx;
  border-radius: 8rpx;
  font-size: 22rpx;
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

.detail-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20rpx;
  margin-bottom: 24rpx;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.stat-label {
  font-size: 22rpx;
  color: #999;
}

.stat-value {
  font-size: 26rpx;
  font-weight: bold;
  color: #ffffff;
}

.detail-progress {
  margin-bottom: 24rpx;
}

.progress-label {
  display: flex;
  justify-content: space-between;
  font-size: 24rpx;
  color: #999;
  margin-bottom: 12rpx;
}

.progress-bar {
  height: 8rpx;
  background: #2a2a2a;
  border-radius: 4rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  transition: width 0.3s;
}

.detail-actions {
  display: flex;
  gap: 20rpx;
}

.action-btn {
  flex: 1;
  padding: 20rpx;
  text-align: center;
  background: #2a2a2a;
  border-radius: 12rpx;
  font-size: 26rpx;
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
