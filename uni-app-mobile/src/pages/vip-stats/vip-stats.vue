<template>
  <view class="vip-stats-container">
    <view class="header">
      <view class="title">VIP数据统计</view>
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
        <view class="card-label">VIP总数</view>
        <view class="card-value">{{ formatNumber(stats.totalVip) }}</view>
        <view class="card-trend" :class="stats.vipTrend >= 0 ? 'up' : 'down'">
          <text>{{ stats.vipTrend >= 0 ? '↑' : '↓' }}</text>
          <text>{{ Math.abs(stats.vipTrend) }}%</text>
        </view>
      </view>

      <view class="stats-card">
        <view class="card-label">VIP营收</view>
        <view class="card-value">¥{{ formatMoney(stats.vipRevenue) }}</view>
        <view class="card-trend" :class="stats.revenueTrend >= 0 ? 'up' : 'down'">
          <text>{{ stats.revenueTrend >= 0 ? '↑' : '↓' }}</text>
          <text>{{ Math.abs(stats.revenueTrend) }}%</text>
        </view>
      </view>

      <view class="stats-card">
        <view class="card-label">活跃VIP</view>
        <view class="card-value">{{ formatNumber(stats.activeVip) }}</view>
        <view class="card-trend" :class="stats.activeTrend >= 0 ? 'up' : 'down'">
          <text>{{ stats.activeTrend >= 0 ? '↑' : '↓' }}</text>
          <text>{{ Math.abs(stats.activeTrend) }}%</text>
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
    </view>

    <view class="chart-section">
      <view class="section-title">VIP增长趋势</view>
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
          <text class="placeholder-text">VIP增长趋势图表</text>
        </view>
      </view>
    </view>

    <view class="level-distribution">
      <view class="section-title">等级分布</view>
      <view class="distribution-list">
        <view 
          v-for="item in levelDistribution" 
          :key="item.level"
          class="distribution-item"
        >
          <view class="level-info">
            <view class="level-name">{{ item.name }}</view>
            <view class="level-count">{{ formatNumber(item.count) }}人</view>
          </view>
          <view class="level-bar">
            <view 
              class="level-fill" 
              :style="{ width: `${item.percentage}%` }"
            ></view>
          </view>
          <view class="level-percent">{{ item.percentage }}%</view>
        </view>
      </view>
    </view>

    <view class="revenue-stats">
      <view class="section-title">营收统计</view>
      <view class="revenue-grid">
        <view class="revenue-item">
          <view class="revenue-label">月卡营收</view>
          <view class="revenue-value">¥{{ formatMoney(stats.monthlyRevenue) }}</view>
          <view class="revenue-percent">{{ stats.monthlyPercent }}%</view>
        </view>

        <view class="revenue-item">
          <view class="revenue-label">季卡营收</view>
          <view class="revenue-value">¥{{ formatMoney(stats.quarterlyRevenue) }}</view>
          <view class="revenue-percent">{{ stats.quarterlyPercent }}%</view>
        </view>

        <view class="revenue-item">
          <view class="revenue-label">年卡营收</view>
          <view class="revenue-value">¥{{ formatMoney(stats.yearlyRevenue) }}</view>
          <view class="revenue-percent">{{ stats.yearlyPercent }}%</view>
        </view>

        <view class="revenue-item">
          <view class="revenue-label">平均客单价</view>
          <view class="revenue-value">¥{{ formatMoney(stats.avgOrderValue) }}</view>
          <view class="revenue-trend" :class="stats.avgOrderTrend >= 0 ? 'up' : 'down'">
            <text>{{ stats.avgOrderTrend >= 0 ? '↑' : '↓' }}</text>
            <text>{{ Math.abs(stats.avgOrderTrend) }}%</text>
          </view>
        </view>
      </view>
    </view>

    <view class="activity-stats">
      <view class="section-title">活跃度统计</view>
      <view class="activity-list">
        <view class="activity-item">
          <view class="activity-label">日活跃用户</view>
          <view class="activity-value">{{ formatNumber(stats.dailyActive) }}</view>
          <view class="activity-trend" :class="stats.dailyActiveTrend >= 0 ? 'up' : 'down'">
            <text>{{ stats.dailyActiveTrend >= 0 ? '↑' : '↓' }}</text>
            <text>{{ Math.abs(stats.dailyActiveTrend) }}%</text>
          </view>
        </view>

        <view class="activity-item">
          <view class="activity-label">周活跃用户</view>
          <view class="activity-value">{{ formatNumber(stats.weeklyActive) }}</view>
          <view class="activity-trend" :class="stats.weeklyActiveTrend >= 0 ? 'up' : 'down'">
            <text>{{ stats.weeklyActiveTrend >= 0 ? '↑' : '↓' }}</text>
            <text>{{ Math.abs(stats.weeklyActiveTrend) }}%</text>
          </view>
        </view>

        <view class="activity-item">
          <view class="activity-label">月活跃用户</view>
          <view class="activity-value">{{ formatNumber(stats.monthlyActive) }}</view>
          <view class="activity-trend" :class="stats.monthlyActiveTrend >= 0 ? 'up' : 'down'">
            <text>{{ stats.monthlyActiveTrend >= 0 ? '↑' : '↓' }}</text>
            <text>{{ Math.abs(stats.monthlyActiveTrend) }}%</text>
          </view>
        </view>

        <view class="activity-item">
          <view class="activity-label">平均使用时长</view>
          <view class="activity-value">{{ stats.avgDuration }}分钟</view>
          <view class="activity-trend" :class="stats.avgDurationTrend >= 0 ? 'up' : 'down'">
            <text>{{ stats.avgDurationTrend >= 0 ? '↑' : '↓' }}</text>
            <text>{{ Math.abs(stats.avgDurationTrend) }}%</text>
          </view>
        </view>
      </view>
    </view>

    <view class="retention-stats">
      <view class="section-title">留存统计</view>
      <view class="retention-grid">
        <view class="retention-item">
          <view class="retention-label">次日留存</view>
          <view class="retention-value">{{ stats.day1Retention }}%</view>
          <view class="retention-trend" :class="stats.day1RetentionTrend >= 0 ? 'up' : 'down'">
            <text>{{ stats.day1RetentionTrend >= 0 ? '↑' : '↓' }}</text>
            <text>{{ Math.abs(stats.day1RetentionTrend) }}%</text>
          </view>
        </view>

        <view class="retention-item">
          <view class="retention-label">7日留存</view>
          <view class="retention-value">{{ stats.day7Retention }}%</view>
          <view class="retention-trend" :class="stats.day7RetentionTrend >= 0 ? 'up' : 'down'">
            <text>{{ stats.day7RetentionTrend >= 0 ? '↑' : '↓' }}</text>
            <text>{{ Math.abs(stats.day7RetentionTrend) }}%</text>
          </view>
        </view>

        <view class="retention-item">
          <view class="retention-label">30日留存</view>
          <view class="retention-value">{{ stats.day30Retention }}%</view>
          <view class="retention-trend" :class="stats.day30RetentionTrend >= 0 ? 'up' : 'down'">
            <text>{{ stats.day30RetentionTrend >= 0 ? '↑' : '↓' }}</text>
            <text>{{ Math.abs(stats.day30RetentionTrend) }}%</text>
          </view>
        </view>

        <view class="retention-item">
          <view class="retention-label">续费率</view>
          <view class="retention-value">{{ stats.renewalRate }}%</view>
          <view class="retention-trend" :class="stats.renewalTrend >= 0 ? 'up' : 'down'">
            <text>{{ stats.renewalTrend >= 0 ? '↑' : '↓' }}</text>
            <text>{{ Math.abs(stats.renewalTrend) }}%</text>
          </view>
        </view>
      </view>
    </view>

    <view class="conversion-stats">
      <view class="section-title">转化统计</view>
      <view class="conversion-list">
        <view class="conversion-item">
          <view class="conversion-label">浏览到购买转化</view>
          <view class="conversion-bar">
            <view 
              class="conversion-fill" 
              :style="{ width: `${stats.viewToPurchase}%` }"
            ></view>
          </view>
          <view class="conversion-value">{{ stats.viewToPurchase }}%</view>
        </view>

        <view class="conversion-item">
          <view class="conversion-label">购买到VIP转化</view>
          <view class="conversion-bar">
            <view 
              class="conversion-fill" 
              :style="{ width: `${stats.purchaseToVip}%` }"
            ></view>
          </view>
          <view class="conversion-value">{{ stats.purchaseToVip }}%</view>
        </view>

        <view class="conversion-item">
          <view class="conversion-label">活动到VIP转化</view>
          <view class="conversion-bar">
            <view 
              class="conversion-fill" 
              :style="{ width: `${stats.activityToVip}%` }"
            ></view>
          </view>
          <view class="conversion-value">{{ stats.activityToVip }}%</view>
        </view>

        <view class="conversion-item">
          <view class="conversion-label">推荐到VIP转化</view>
          <view class="conversion-bar">
            <view 
              class="conversion-fill" 
              :style="{ width: `${stats.referralToVip}%` }"
            ></view>
          </view>
          <view class="conversion-value">{{ stats.referralToVip }}%</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { vipStatsApi } from '../../api/vip-stats.js'

const timeOptions = [
  { label: '今日', value: 'today' },
  { label: '本周', value: 'week' },
  { label: '本月', value: 'month' },
  { label: '自定义', value: 'custom' }
]

const chartTypeOptions = [
  { label: '新增VIP', value: 'new' },
  { label: '活跃VIP', value: 'active' },
  { label: '营收', value: 'revenue' }
]

const timeFilter = ref('today')
const chartType = ref('new')
const loading = ref(false)

const stats = ref({
  totalVip: 0,
  vipRevenue: 0,
  activeVip: 0,
  conversionRate: 0,
  vipTrend: 0,
  revenueTrend: 0,
  activeTrend: 0,
  conversionTrend: 0,
  monthlyRevenue: 0,
  quarterlyRevenue: 0,
  yearlyRevenue: 0,
  avgOrderValue: 0,
  monthlyPercent: 0,
  quarterlyPercent: 0,
  yearlyPercent: 0,
  avgOrderTrend: 0,
  dailyActive: 0,
  weeklyActive: 0,
  monthlyActive: 0,
  avgDuration: 0,
  dailyActiveTrend: 0,
  weeklyActiveTrend: 0,
  monthlyActiveTrend: 0,
  avgDurationTrend: 0,
  day1Retention: 0,
  day7Retention: 0,
  day30Retention: 0,
  renewalRate: 0,
  day1RetentionTrend: 0,
  day7RetentionTrend: 0,
  day30RetentionTrend: 0,
  renewalTrend: 0,
  viewToPurchase: 0,
  purchaseToVip: 0,
  activityToVip: 0,
  referralToVip: 0
})

const levelDistribution = ref([
  { level: 1, name: '月卡VIP', count: 0, percentage: 0 },
  { level: 2, name: '季卡VIP', count: 0, percentage: 0 },
  { level: 3, name: '年卡VIP', count: 0, percentage: 0 }
])

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

const handleTimeFilter = (value) => {
  timeFilter.value = value
  loadStats()
}

const handleChartType = (value) => {
  chartType.value = value
  loadChart()
}

const handleExport = () => {
  uni.showLoading({ title: '导出中...' })
  
  vipStatsApi.exportVipStatsReport({
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
  
  vipStatsApi.getVipStatsOverview({
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
  vipStatsApi.getVipGrowthTrend({
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

const loadLevelDistribution = () => {
  vipStatsApi.getVipLevelDistribution({
    timeFilter: timeFilter.value
  }).then(response => {
    levelDistribution.value = response.data
  }).catch(error => {
    uni.showToast({
      title: '加载失败',
      icon: 'none'
    })
  })
}

const loadRevenueStats = () => {
  vipStatsApi.getVipRevenueStats({
    timeFilter: timeFilter.value
  }).then(response => {
    Object.assign(stats.value, response.data)
  }).catch(error => {
    uni.showToast({
      title: '加载失败',
      icon: 'none'
    })
  })
}

const loadActivityStats = () => {
  vipStatsApi.getVipActivityStats({
    timeFilter: timeFilter.value
  }).then(response => {
    Object.assign(stats.value, response.data)
  }).catch(error => {
    uni.showToast({
      title: '加载失败',
      icon: 'none'
    })
  })
}

const loadRetentionStats = () => {
  vipStatsApi.getVipRetentionStats({
    timeFilter: timeFilter.value
  }).then(response => {
    Object.assign(stats.value, response.data)
  }).catch(error => {
    uni.showToast({
      title: '加载失败',
      icon: 'none'
    })
  })
}

const loadConversionStats = () => {
  vipStatsApi.getVipConversionStats({
    timeFilter: timeFilter.value
  }).then(response => {
    Object.assign(stats.value, response.data)
  }).catch(error => {
    uni.showToast({
      title: '加载失败',
      icon: 'none'
    })
  })
}

onMounted(() => {
  loadStats()
  loadChart()
  loadLevelDistribution()
  loadRevenueStats()
  loadActivityStats()
  loadRetentionStats()
  loadConversionStats()
})
</script>

<style lang="scss" scoped>
.vip-stats-container {
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

.level-distribution {
  padding: 30rpx;
}

.distribution-list {
  background: #1a1a1a;
  border-radius: 16rpx;
  padding: 30rpx;
}

.distribution-item {
  display: flex;
  align-items: center;
  gap: 20rpx;
  margin-bottom: 24rpx;
}

.distribution-item:last-child {
  margin-bottom: 0;
}

.level-info {
  width: 140rpx;
}

.level-name {
  font-size: 26rpx;
  color: #ffffff;
  margin-bottom: 8rpx;
}

.level-count {
  font-size: 22rpx;
  color: #999;
}

.level-bar {
  flex: 1;
  height: 12rpx;
  background: #2a2a2a;
  border-radius: 6rpx;
  overflow: hidden;
}

.level-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  transition: width 0.3s;
}

.level-percent {
  width: 80rpx;
  text-align: right;
  font-size: 24rpx;
  font-weight: bold;
  color: #667eea;
}

.revenue-stats {
  padding: 30rpx;
}

.revenue-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
}

.revenue-item {
  padding: 24rpx;
  background: #1a1a1a;
  border-radius: 16rpx;
}

.revenue-label {
  font-size: 22rpx;
  color: #999;
  margin-bottom: 12rpx;
}

.revenue-value {
  font-size: 30rpx;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 8rpx;
}

.revenue-percent {
  font-size: 22rpx;
  color: #667eea;
}

.revenue-trend {
  font-size: 22rpx;
  display: flex;
  align-items: center;
  gap: 4rpx;
}

.revenue-trend.up {
  color: #00c853;
}

.revenue-trend.down {
  color: #ff3d00;
}

.activity-stats {
  padding: 30rpx;
}

.activity-list {
  background: #1a1a1a;
  border-radius: 16rpx;
  padding: 30rpx;
}

.activity-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #2a2a2a;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-label {
  font-size: 26rpx;
  color: #ffffff;
}

.activity-value {
  font-size: 28rpx;
  font-weight: bold;
  color: #667eea;
}

.activity-trend {
  font-size: 22rpx;
  display: flex;
  align-items: center;
  gap: 4rpx;
}

.activity-trend.up {
  color: #00c853;
}

.activity-trend.down {
  color: #ff3d00;
}

.retention-stats {
  padding: 30rpx;
}

.retention-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
}

.retention-item {
  padding: 24rpx;
  background: #1a1a1a;
  border-radius: 16rpx;
}

.retention-label {
  font-size: 22rpx;
  color: #999;
  margin-bottom: 12rpx;
}

.retention-value {
  font-size: 32rpx;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 8rpx;
}

.retention-trend {
  font-size: 22rpx;
  display: flex;
  align-items: center;
  gap: 4rpx;
}

.retention-trend.up {
  color: #00c853;
}

.retention-trend.down {
  color: #ff3d00;
}

.conversion-stats {
  padding: 30rpx;
}

.conversion-list {
  background: #1a1a1a;
  border-radius: 16rpx;
  padding: 30rpx;
}

.conversion-item {
  display: flex;
  align-items: center;
  gap: 20rpx;
  margin-bottom: 24rpx;
}

.conversion-item:last-child {
  margin-bottom: 0;
}

.conversion-label {
  width: 160rpx;
  font-size: 24rpx;
  color: #ffffff;
}

.conversion-bar {
  flex: 1;
  height: 12rpx;
  background: #2a2a2a;
  border-radius: 6rpx;
  overflow: hidden;
}

.conversion-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  transition: width 0.3s;
}

.conversion-value {
  width: 80rpx;
  text-align: right;
  font-size: 24rpx;
  font-weight: bold;
  color: #667eea;
}
</style>
