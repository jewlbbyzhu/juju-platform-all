<template>
  <view class="ticket-inventory-container">
    <view class="header">
      <text class="header-title">票型库存管理</text>
      <text class="header-subtitle">管理票型库存和销售情况</text>
    </view>

    <view class="filter-bar">
      <view class="filter-item">
        <text class="filter-label">状态筛选</text>
        <picker 
          mode="selector" 
          :range="statusOptions" 
          @change="onStatusFilterChange"
        >
          <view class="picker-input">
            <text class="picker-text">{{ statusFilterText }}</text>
            <text class="picker-arrow">›</text>
          </view>
        </picker>
      </view>
      <view class="filter-item">
        <text class="filter-label">搜索</text>
        <input 
          class="search-input" 
          v-model="searchKeyword" 
          placeholder="搜索票型名称..."
          @input="handleSearch"
        />
      </view>
    </view>

    <scroll-view class="inventory-list" scroll-y @scrolltolower="loadMore">
      <view 
        class="inventory-item" 
        v-for="item in filteredTickets" 
        :key="item.id"
      >
        <view class="item-header">
          <view class="item-info">
            <text class="item-name">{{ item.name }}</text>
            <text class="item-type">{{ getTicketTypeText(item.type) }}</text>
            <text class="item-party" v-if="item.party_name">{{ item.party_name }}</text>
          </view>
          <view class="item-status">
            <text 
              class="status-badge" 
              :class="item.status"
            >
              {{ getStatusText(item.status) }}
            </text>
          </view>
        </view>

        <view class="item-details">
          <view class="detail-row">
            <text class="detail-label">价格</text>
            <text class="detail-value">¥{{ item.price }}</text>
          </view>
          <view class="detail-row">
            <text class="detail-label">原价</text>
            <text class="detail-value">¥{{ item.original_price || '-' }}</text>
          </view>
          <view class="detail-row">
            <text class="detail-label">可用库存</text>
            <text class="detail-value">{{ item.current_stock }}</text>
          </view>
          <view class="detail-row">
            <text class="detail-label">已售数量</text>
            <text class="detail-value">{{ item.old_count }}</text>
          </view>
          <view class="detail-row" v-if="item.type === 6">
            <text class="detail-label">团购人数</text>
            <text class="detail-value">{{ item.group_min || '-' }}人起</text>
          </view>
          <view class="detail-row" v-if="item.type === 6">
            <text class="detail-label">团购折扣</text>
            <text class="detail-value">{{ item.group_discount || '-' }}折</text>
          </view>
        </view>

        <view class="item-actions">
          <button class="action-btn edit" @tap="editTicket(item)">
            <text>编辑</text>
          </button>
          <button class="action-btn adjust" @tap="adjustStock(item)">
            <text>调整库存</text>
          </button>
          <button 
            class="action-btn" 
            :class="{ disable: item.status === 1 }"
            @tap="toggleStatus(item)"
          >
            <text>{{ item.status === 1 ? '停售' : '在售' }}</text>
          </button>
        </view>
      </view>

      <view class="loading-more" v-if="loading">
        <text>加载中...</text>
      </view>

      <view class="no-more" v-if="!hasMore && filteredTickets.length > 0">
        <text>没有更多了</text>
      </view>

      <view class="empty-state" v-if="filteredTickets.length === 0 && !loading">
        <text class="empty-icon">🎫</text>
        <text class="empty-text">暂无票型</text>
        <text class="empty-tip">创建聚会后可添加票型</text>
      </view>
    </scroll-view>

    <view class="action-bar">
      <button class="action-btn primary" @tap="createTicket">
        <text>+ 新建票型</text>
      </button>
      <button class="action-btn secondary" @tap="batchAdjust">
        <text>批量调整</text>
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { partyApi } from '@/api/party.js'

const tickets = ref([])
const loading = ref(false)
const hasMore = ref(true)
const page = ref(1)
const pageSize = ref(20)
const searchKeyword = ref('')
const statusFilter = ref('all')

const statusOptions = ['全部', '在售', '售罄', '停售']

const statusFilterText = computed(() => {
  const textMap = {
    all: '全部',
    0: '在售',
    1: '售罄',
    2: '停售'
  }
  return textMap[statusFilter.value] || '全部'
})

const filteredTickets = computed(() => {
  let result = tickets.value

  if (searchKeyword.value) {
    result = result.filter(item => 
      item.name.toLowerCase().includes(searchKeyword.value.toLowerCase())
    )
  }

  if (statusFilter.value !== 'all') {
    const statusMap = {
      '在售': 0,
      '售罄': 1,
      '停售': 2
    }
    result = result.filter(item => item.status === statusMap[statusFilter.value])
  }

  return result
})

const loadTickets = async (reset = false) => {
  if (reset) {
    page.value = 1
    tickets.value = []
    hasMore.value = true
  }

  if (loading.value || !hasMore.value) return

  loading.value = true

  try {
    const res = await partyApi.getTicketInventory({
      page: page.value,
      pageSize: pageSize.value
    })

    if (res.code === 0) {
      const newTickets = res.data.list || []
      if (reset) {
        tickets.value = newTickets
      } else {
        tickets.value = [...tickets.value, ...newTickets]
      }

      hasMore.value = newTickets.length >= pageSize.value
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
  loadTickets(false)
}

const handleSearch = () => {
  loadTickets(true)
}

const onStatusFilterChange = () => {
  loadTickets(true)
}

const getTicketTypeText = (type) => {
  const typeMap = {
    1: '普通',
    2: '早鸟',
    3: '男性',
    4: '女性',
    5: '男性早鸟',
    6: '女性早鸟',
    7: 'VIP专享',
    8: '团购票',
    9: '套票'
  }
  return typeMap[type] || '普通'
}

const getStatusText = (status) => {
  const statusMap = {
    0: '在售',
    1: '售罄',
    2: '停售'
  }
  return statusMap[status] || '未知'
}

const editTicket = (item) => {
  uni.navigateTo({
    url: `/pages/ticket-edit/ticket-edit?ticketId=${item.id}`
  })
}

const adjustStock = (item) => {
  uni.navigateTo({
    url: `/pages/ticket-stock/ticket-stock?ticketId=${item.id}`
  })
}

const toggleStatus = (item) => {
  const newStatus = item.status === 0 ? 2 : 0
  const statusText = newStatus === 0 ? '在售' : '停售'

  uni.showModal({
    title: '确认状态变更',
    content: `确定要将"${item.name}"${statusText}吗？`,
    success: async (res) => {
      if (res.confirm) {
        try {
          const updateRes = await partyApi.updateTicketStatus(item.id, {
            status: newStatus
          })

          if (updateRes.code === 0) {
            item.status = newStatus
            uni.showToast({
              title: '状态更新成功',
              icon: 'success'
            })
          } else {
            uni.showToast({
              title: updateRes.message || '更新失败',
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

const createTicket = () => {
  uni.navigateTo({
    url: '/pages/ticket-create/ticket-create'
  })
}

const batchAdjust = () => {
  uni.navigateTo({
    url: '/pages/ticket-batch/ticket-batch'
  })
}

onMounted(() => {
  loadTickets(true)
})
</script>

<style lang="scss" scoped>
.ticket-inventory-container {
  min-height: 100vh;
  background: #000000;
}

.header {
  padding: 60rpx 40rpx 40rpx;
  background: linear-gradient(180deg, rgba(102, 126, 234, 0.2) 0%, rgba(0, 0, 0, 0) 100%);
}

.header-title {
  display: block;
  font-size: 40rpx;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 15rpx;
}

.header-subtitle {
  display: block;
  font-size: 26rpx;
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
  display: flex;
  align-items: center;
  gap: 15rpx;
}

.filter-label {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.6);
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  height: 60rpx;
  padding: 0 20rpx;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20rpx;
  font-size: 26rpx;
  color: #ffffff;
}

.picker-input {
  display: flex;
  align-items: center;
  gap: 10rpx;
  padding: 0 20rpx;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20rpx;
}

.picker-text {
  font-size: 26rpx;
  color: #ffffff;
}

.picker-arrow {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.5);
}

.inventory-list {
  height: calc(100vh - 250rpx);
}

.inventory-item {
  background: rgba(255, 255, 255, 0.02);
  border-radius: 20rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.05);
  margin-bottom: 20rpx;
  padding: 30rpx;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.item-name {
  font-size: 30rpx;
  font-weight: 500;
  color: #ffffff;
}

.item-type {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.5);
}

.item-party {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.4);
}

.item-status {
  flex-shrink: 0;
}

.status-badge {
  padding: 5rpx 15rpx;
  border-radius: 15rpx;
  font-size: 22rpx;
  font-weight: 500;
}

.status-badge.status-0 {
  background: rgba(82, 196, 26, 0.2);
  color: #52c41a;
}

.status-badge.status-1 {
  background: rgba(255, 77, 79, 0.2);
  color: #ff4d4f;
}

.status-badge.status-2 {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.5);
}

.item-details {
  display: flex;
  flex-direction: column;
  gap: 15rpx;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-label {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.6);
}

.detail-value {
  font-size: 26rpx;
  color: #ffffff;
  font-weight: 500;
}

.item-actions {
  display: flex;
  gap: 15rpx;
  margin-top: 20rpx;
}

.action-btn {
  flex: 1;
  padding: 15rpx 25rpx;
  border-radius: 20rpx;
  font-size: 24rpx;
  color: #ffffff;
  border: none;

  &::after {
    border: none;
  }
}

.action-btn.edit {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.action-btn.adjust {
  background: rgba(255, 255, 255, 0.1);
}

.action-btn.disable {
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.5);
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

.action-bar {
  display: flex;
  gap: 20rpx;
  padding: 30rpx;
  background: rgba(255, 255, 255, 0.02);
  border-top: 1rpx solid rgba(255, 255, 255, 0.05);
}

.action-bar .action-btn {
  flex: 1;
  padding: 25rpx 30rpx;
  border-radius: 25rpx;
  font-size: 26rpx;
  color: #ffffff;
  border: none;

  &::after {
    border: none;
  }
}

.action-bar .action-btn.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.action-bar .action-btn.secondary {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.7);
}
</style>
