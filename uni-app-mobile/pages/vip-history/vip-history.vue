<template>
  <view class="vip-history-container">
    <view class="history-header">
      <text class="history-title">订阅历史</text>
      <view class="current-status" v-if="currentVip">
        <text class="status-text">当前: {{ currentVip.vipTypeDisplayName }}</text>
        <text class="expire-text">有效期至: {{ formatDateTime(currentVip.vipExpireTime) }}</text>
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
        :class="{ active: filter === 'active' }"
        @tap="setFilter('active')"
      >
        <text class="filter-text">生效中</text>
      </view>
      <view 
        class="filter-item" 
        :class="{ active: filter === 'expired' }"
        @tap="setFilter('expired')"
      >
        <text class="filter-text">已过期</text>
      </view>
      <view 
        class="filter-item" 
        :class="{ active: filter === 'cancelled' }"
        @tap="setFilter('cancelled')"
      >
        <text class="filter-text">已取消</text>
      </view>
    </view>

    <scroll-view class="history-list" scroll-y @scrolltolower="loadMore">
      <view 
        class="history-item" 
        v-for="item in filteredHistory" 
        :key="item.id"
      >
        <view class="item-header">
          <view class="package-info">
            <text class="package-name">{{ item.packageName }}</text>
            <view class="package-badge" :class="item.status">
              <text class="badge-text">{{ getStatusText(item.status) }}</text>
            </view>
          </view>
          <text class="item-price">¥{{ item.amount }}</text>
        </view>

        <view class="item-body">
          <view class="info-row">
            <text class="info-label">订阅时间:</text>
            <text class="info-value">{{ formatDateTime(item.startTime) }}</text>
          </view>
          <view class="info-row">
            <text class="info-label">有效期:</text>
            <text class="info-value">{{ formatDateTime(item.expireTime) }}</text>
          </view>
          <view class="info-row" v-if="item.paymentMethod">
            <text class="info-label">支付方式:</text>
            <text class="info-value">{{ getPaymentMethodText(item.paymentMethod) }}</text>
          </view>
          <view class="info-row" v-if="item.paymentId">
            <text class="info-label">支付单号:</text>
            <text class="info-value">{{ item.paymentId }}</text>
          </view>
        </view>

        <view class="item-footer">
          <text class="item-message" v-if="item.message">{{ item.message }}</text>
          <view class="item-actions" v-if="item.status === 'active'">
            <button class="action-btn" @tap="renew(item)">续费</button>
            <button class="action-btn secondary" @tap="cancel(item)">取消订阅</button>
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
        <text class="empty-text">暂无订阅记录</text>
        <text class="empty-tip">开通VIP后将显示订阅历史</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { vipApi } from '@/api/vip.js'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

const history = ref([])
const loading = ref(false)
const hasMore = ref(true)
const page = ref(1)
const pageSize = ref(20)
const filter = ref('all')

const currentVip = computed(() => userStore.vipInfo)

const filteredHistory = computed(() => {
  if (filter.value === 'all') return history.value
  return history.value.filter(item => item.status === filter.value)
})

const getStatusText = (status) => {
  const statusMap = {
    active: '生效中',
    expired: '已过期',
    cancelled: '已取消'
  }
  return statusMap[status] || '未知'
}

const getPaymentMethodText = (method) => {
  const methodMap = {
    wechat: '微信支付',
    alipay: '支付宝支付',
    wallet: '钱包支付'
  }
  return methodMap[method] || '未知'
}

const formatDateTime = (time) => {
  if (!time) return ''
  const date = new Date(time)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day} ${hour}:${minute}`
}

const setFilter = (newFilter) => {
  filter.value = newFilter
  loadHistory(true)
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
    const res = await vipApi.getSubscriptionHistory({
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

const renew = (item) => {
  uni.navigateTo({
    url: `/pages/vip/vip?package=${item.packageId}`
  })
}

const cancel = (item) => {
  uni.showModal({
    title: '确认取消',
    content: '确定要取消VIP订阅吗？取消后将不再享受VIP特权。',
    confirmText: '确认取消',
    confirmColor: '#ff4d4f',
    success: async (res) => {
      if (res.confirm) {
        uni.showLoading({
          title: '取消中...'
        })

        try {
          const res = await vipApi.cancelSubscription('用户主动取消')

          if (res.code === 0) {
            uni.hideLoading()
            uni.showToast({
              title: '取消成功',
              icon: 'success'
            })

            await userStore.fetchUserInfo()
            loadHistory(true)
          } else {
            uni.hideLoading()
            uni.showToast({
              title: res.message || '取消失败',
              icon: 'none'
            })
          }
        } catch (error) {
          uni.hideLoading()
          uni.showToast({
            title: error.message || '网络错误',
            icon: 'none'
          })
        }
      }
    }
  })
}

onMounted(() => {
  userStore.fetchUserInfo()
  loadHistory(true)
})
</script>

<style lang="scss" scoped>
.vip-history-container {
  min-height: 100vh;
  background: #000000;
}

.history-header {
  padding: 30rpx;
  background: linear-gradient(180deg, rgba(212, 175, 55, 0.2) 0%, rgba(0, 0, 0, 0) 100%);
}

.history-title {
  display: block;
  font-size: 36rpx;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 20rpx;
}

.current-status {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
  padding: 20rpx;
  background: rgba(212, 175, 55, 0.1);
  border-radius: 15rpx;
  border: 1rpx solid rgba(212, 175, 55, 0.3);
}

.status-text {
  font-size: 28rpx;
  color: #d4af37;
  font-weight: 500;
}

.expire-text {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.6);
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
  background: linear-gradient(135deg, #d4af37 0%, #c9a227 100%);
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
  padding: 30rpx;
  background: rgba(255, 255, 255, 0.02);
  border-bottom: 1rpx solid rgba(255, 255, 255, 0.05);
  margin-bottom: 20rpx;
  border-radius: 20rpx;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.package-info {
  display: flex;
  align-items: center;
  gap: 15rpx;
}

.package-name {
  font-size: 32rpx;
  font-weight: 500;
  color: #ffffff;
}

.package-badge {
  padding: 8rpx 20rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
}

.package-badge.active {
  background: rgba(82, 196, 26, 0.2);
  color: #52c41a;
}

.package-badge.expired {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.5);
}

.package-badge.cancelled {
  background: rgba(255, 77, 79, 0.2);
  color: #ff4d4f;
}

.badge-text {
  font-size: 22rpx;
}

.item-price {
  font-size: 36rpx;
  font-weight: bold;
  color: #d4af37;
}

.item-body {
  margin-bottom: 20rpx;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15rpx;

  &:last-child {
    margin-bottom: 0;
  }
}

.info-label {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.5);
}

.info-value {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.8);
}

.item-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.item-message {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.5);
  flex: 1;
}

.item-actions {
  display: flex;
  gap: 15rpx;
}

.action-btn {
  padding: 15rpx 30rpx;
  background: linear-gradient(135deg, #d4af37 0%, #c9a227 100%);
  border-radius: 25rpx;
  font-size: 26rpx;
  color: #ffffff;
  border: none;

  &::after {
    border: none;
  }
}

.action-btn.secondary {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.7);
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
