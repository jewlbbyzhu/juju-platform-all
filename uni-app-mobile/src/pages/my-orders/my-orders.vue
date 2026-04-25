<template>
  <view class="orders-container" :class="currentThemeClass">
    <!-- 主题特定视觉效果 -->
    <view v-if="currentTheme === 'neon'" class="neon-effects">
      <view class="neon-glow"></view>
      <view class="neon-particles">
        <view v-for="i in 6" :key="i" class="particle"></view>
      </view>
    </view>
    
    <view v-if="currentTheme === 'vibrant'" class="vibrant-shapes">
      <view class="shape shape-1"></view>
      <view class="shape shape-2"></view>
      <view class="shape shape-3"></view>
    </view>
    
    <!-- 页面标题 -->
    <view class="page-header">
      <text class="page-title">我的订单</text>
      <text class="page-subtitle">查看和管理您的所有订单</text>
    </view>
    
    <!-- 标签页 -->
    <view class="tabs-wrapper">
      <view class="tabs">
        <view 
          v-for="tab in tabs" 
          :key="tab.value"
          class="tab-item" 
          :class="{ active: currentTab === tab.value }"
          @tap="switchTab(tab.value)"
        >
          <text class="tab-text">{{ tab.label }}</text>
          <text v-if="tab.count > 0" class="tab-badge">{{ tab.count }}</text>
          <view class="tab-indicator" v-if="currentTab === tab.value"></view>
        </view>
      </view>
    </view>

    <!-- 订单列表 -->
    <scroll-view 
      class="orders-list" 
      scroll-y 
      @scrolltolower="loadMore"
      @refresherrefresh="onRefresh"
      :refresher-enabled="true"
      :refresher-triggered="refreshing"
    >
      <view 
        class="order-card" 
        v-for="(order, index) in orders" 
        :key="order.id" 
        :style="{ animationDelay: index * 0.05 + 's' }"
        @tap="goToDetail(order.id)"
      >
        <!-- 订单头部 -->
        <view class="order-header">
          <view class="order-meta">
            <text class="order-no">订单号: {{ order.order_no }}</text>
            <text class="order-time">{{ formatDateTime(order.created_at) }}</text>
          </view>
          <view class="order-status" :class="getStatusClass(order.status)">
            <text class="status-icon">{{ getStatusIcon(order.status) }}</text>
            <text class="status-text">{{ getStatusText(order.status) }}</text>
          </view>
        </view>

        <!-- 订单内容 -->
        <view class="order-content">
          <image class="party-image" :src="order.party?.images?.[0] || '/static/default-party.png'" mode="aspectFill"></image>
          <view class="order-info">
            <text class="party-title">{{ order.party?.title }}</text>
            <view class="info-row">
              <text class="info-label">票型</text>
              <text class="info-value">{{ order.ticket?.name }}</text>
            </view>
            <view class="info-row">
              <text class="info-label">报名人</text>
              <text class="info-value">{{ order.name }}</text>
            </view>
          </view>
        </view>

        <!-- 订单底部 -->
        <view class="order-footer">
          <view class="price-section">
            <text class="price-label">实付金额</text>
            <text class="price-value">¥{{ order.total_amount }}</text>
          </view>
          <view class="action-section">
            <template v-if="order.status === 'pending'">
              <button class="action-btn secondary" @tap.stop="handleCancel(order)">
                <text>取消订单</text>
              </button>
              <button class="action-btn primary" @tap.stop="handlePay(order)">
                <text>立即支付</text>
              </button>
            </template>
            <template v-else-if="order.status === 'paid'">
              <button class="action-btn secondary" @tap.stop="viewTicket(order)">
                <text>查看票券</text>
              </button>
            </template>
            <template v-else>
              <button class="action-btn ghost" @tap.stop="goToDetail(order.id)">
                <text>查看详情</text>
              </button>
            </template>
          </view>
        </view>
      </view>

      <!-- 加载状态 -->
      <view class="loading-state" v-if="loading">
        <view class="loading-spinner"></view>
        <text class="loading-text">加载中...</text>
      </view>

      <view class="no-more" v-if="!hasMore && orders.length > 0">
        <text>已经到底了</text>
      </view>

      <!-- 空状态 -->
      <view class="empty-state" v-if="orders.length === 0 && !loading">
        <view class="empty-icon-wrapper">
          <text class="empty-icon">📋</text>
        </view>
        <text class="empty-title">暂无订单</text>
        <text class="empty-desc">快去发现精彩聚会吧</text>
        <button class="explore-btn" @tap="goToExplore">
          <text>去发现</text>
        </button>
      </view>
    </scroll-view>
    
    <!-- 主题切换器（演示用） -->
    <view class="theme-switcher">
      <text class="theme-label">主题:</text>
      <view 
        v-for="theme in themes" 
        :key="theme.value"
        class="theme-option"
        :class="{ active: currentTheme === theme.value }"
        @tap="switchTheme(theme.value)"
      >
        {{ theme.label }}
      </view>
    </view>
  </view>
</template>

<script>
import { orderApi } from '../../api/order'

export default {
  data() {
    return {
      currentTab: 'all',
      orders: [],
      page: 1,
      pageSize: 10,
      loading: false,
      refreshing: false,
      hasMore: true,
      currentTheme: 'neon',
      themes: [
        { label: '霓虹', value: 'neon' },
        { label: '简约', value: 'minimal' },
        { label: '暗色', value: 'dark' },
        { label: '活力', value: 'vibrant' }
      ],
      tabs: [
        { label: '全部', value: 'all', count: 0 },
        { label: '待支付', value: 'pending', count: 0 },
        { label: '已支付', value: 'paid', count: 0 },
        { label: '已完成', value: 'completed', count: 0 },
        { label: '已取消', value: 'cancelled', count: 0 }
      ]
    }
  },

  computed: {
    currentThemeClass() {
      return `theme-${this.currentTheme}`
    }
  },

  onLoad() {
    this.loadOrders()
  },

  onPullDownRefresh() {
    this.onRefresh()
  },

  methods: {
    switchTheme(theme) {
      this.currentTheme = theme
    },
    
    async loadOrders(reset = false) {
      if (reset) {
        this.page = 1
        this.orders = []
        this.hasMore = true
      }

      if (this.loading || !this.hasMore) return

      this.loading = true

      try {
        const params = {
          page: this.page,
          pageSize: this.pageSize
        }

        if (this.currentTab !== 'all') {
          params.status = this.currentTab
        }

        const res = await orderApi.getOrders(params)

        if (res.code === 0) {
          if (reset) {
            this.orders = res.data.list || []
          } else {
            this.orders = [...this.orders, ...(res.data.list || [])]
          }

          this.hasMore = res.data.list?.length >= this.pageSize
          this.page++
        }
      } catch (error) {
        uni.showToast({
          title: '加载失败',
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
    },

    switchTab(tab) {
      if (this.currentTab === tab) return
      this.currentTab = tab
      this.loadOrders(true)
    },

    goToDetail(orderId) {
      uni.navigateTo({
        url: `/pages/order-detail/order-detail?id=${orderId}`
      })
    },

    goToExplore() {
      uni.switchTab({
        url: '/pages/index/index'
      })
    },

    handlePay(order) {
      uni.navigateTo({
        url: `/pages/payment/payment?orderId=${order.id}`
      })
    },

    handleCancel(order) {
      uni.showModal({
        title: '取消订单',
        content: '确定要取消该订单吗？取消后无法恢复',
        confirmColor: '#F44336',
        success: async (res) => {
          if (res.confirm) {
            try {
              const res = await orderApi.cancelOrder(order.id)
              if (res.code === 0) {
                uni.showToast({
                  title: '取消成功',
                  icon: 'success'
                })
                this.loadOrders(true)
              } else {
                uni.showToast({
                  title: res.message || '取消失败',
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
    },

    viewTicket(order) {
      uni.navigateTo({
        url: `/pages/my-tickets/my-tickets?orderId=${order.id}`
      })
    },

    onRefresh() {
      this.refreshing = true
      this.loadOrders(true).then(() => {
        this.refreshing = false
      })
    },

    loadMore() {
      this.loadOrders()
    },

    getStatusClass(status) {
      const classMap = {
        'pending': 'status-pending',
        'paid': 'status-paid',
        'completed': 'status-completed',
        'cancelled': 'status-cancelled'
      }
      return classMap[status] || ''
    },

    getStatusText(status) {
      const textMap = {
        'pending': '待支付',
        'paid': '已支付',
        'completed': '已完成',
        'cancelled': '已取消'
      }
      return textMap[status] || '未知'
    },
    
    getStatusIcon(status) {
      const iconMap = {
        'pending': '⏰',
        'paid': '✓',
        'completed': '✓',
        'cancelled': '✕'
      }
      return iconMap[status] || ''
    },

    formatDateTime(time) {
      if (!time) return ''
      const date = new Date(time)
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const day = date.getDate().toString().padStart(2, '0')
      const hours = date.getHours().toString().padStart(2, '0')
      const minutes = date.getMinutes().toString().padStart(2, '0')
      return `${month}-${day} ${hours}:${minutes}`
    }
  }
}
</script>

<style lang="scss" scoped>
// ========== 动画定义 ==========
@keyframes slideUp {
  from { opacity: 0; transform: translateY(30rpx); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-20rpx) rotate(5deg); }
}

@keyframes neonPulse {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.1); }
}

@keyframes particleFloat {
  0%, 100% { transform: translateY(100vh) rotate(0deg); opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { transform: translateY(-100rpx) rotate(720deg); opacity: 0; }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

// ========== 基础容器 ==========
.orders-container {
  min-height: 100vh;
  padding-bottom: 40rpx;
  position: relative;
  overflow: hidden;
}

// ========== 霓虹主题 ==========
.theme-neon {
  background: #000000;
  
  .neon-effects {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    overflow: hidden;
    z-index: 0;
    
    .neon-glow {
      position: absolute;
      top: -200rpx;
      right: -200rpx;
      width: 600rpx;
      height: 600rpx;
      background: radial-gradient(circle, rgba(102, 126, 234, 0.4) 0%, transparent 70%);
      animation: neonPulse 4s ease-in-out infinite;
    }
    
    .neon-particles {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      
      .particle {
        position: absolute;
        width: 6rpx;
        height: 6rpx;
        background: #667eea;
        border-radius: 50%;
        box-shadow: 0 0 10rpx #667eea, 0 0 20rpx #667eea;
        animation: particleFloat 8s linear infinite;
        
        &:nth-child(1) { left: 10%; animation-delay: 0s; }
        &:nth-child(2) { left: 25%; animation-delay: 1s; background: #764ba2; box-shadow: 0 0 10rpx #764ba2, 0 0 20rpx #764ba2; }
        &:nth-child(3) { left: 40%; animation-delay: 2s; }
        &:nth-child(4) { left: 60%; animation-delay: 3s; background: #f093fb; box-shadow: 0 0 10rpx #f093fb, 0 0 20rpx #f093fb; }
        &:nth-child(5) { left: 75%; animation-delay: 4s; }
        &:nth-child(6) { left: 90%; animation-delay: 5s; background: #4facfe; box-shadow: 0 0 10rpx #4facfe, 0 0 20rpx #4facfe; }
      }
    }
  }
  
  .page-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    position: relative;
    z-index: 1;
  }
  
  .tabs-wrapper {
    background: #0a0a0a;
    .tab-item {
      color: rgba(255, 255, 255, 0.6);
      &.active {
        color: #667eea;
        .tab-indicator {
          background: #667eea;
          box-shadow: 0 0 10rpx #667eea;
        }
      }
      .tab-badge {
        background: #FF6B35;
        color: #ffffff;
      }
    }
  }
  
  .order-card {
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    border: 1rpx solid rgba(255, 255, 255, 0.05);
    
    .order-no {
      color: rgba(255, 255, 255, 0.5);
    }
    .order-time {
      color: rgba(255, 255, 255, 0.4);
    }
    .party-title {
      color: #ffffff;
    }
    .info-label {
      color: rgba(255, 255, 255, 0.5);
    }
    .info-value {
      color: rgba(255, 255, 255, 0.8);
    }
    .price-label {
      color: rgba(255, 255, 255, 0.5);
    }
    .price-value {
      color: #FF6B35;
    }
  }
  
  .status-pending {
    background: rgba(255, 193, 7, 0.15);
    color: #FFC107;
  }
  .status-paid {
    background: rgba(76, 175, 80, 0.15);
    color: #4CAF50;
  }
  .status-completed {
    background: rgba(33, 150, 243, 0.15);
    color: #2196F3;
  }
  .status-cancelled {
    background: rgba(244, 67, 54, 0.15);
    color: #F44336;
  }
  
  .action-btn {
    &.primary {
      background: linear-gradient(135deg, #FF6B35 0%, #FF8E53 100%);
      box-shadow: 0 4rpx 20rpx rgba(255, 107, 53, 0.4);
    }
    &.secondary {
      background: rgba(255, 255, 255, 0.1);
      color: rgba(255, 255, 255, 0.8);
    }
    &.ghost {
      background: transparent;
      border: 1rpx solid rgba(255, 255, 255, 0.2);
      color: rgba(255, 255, 255, 0.6);
    }
  }
  
  .empty-state {
    .empty-icon-wrapper {
      background: rgba(102, 126, 234, 0.1);
    }
    .empty-title {
      color: #ffffff;
    }
    .empty-desc {
      color: rgba(255, 255, 255, 0.5);
    }
  }
  
  .explore-btn {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    box-shadow: 0 4rpx 20rpx rgba(102, 126, 234, 0.4);
  }
  
  .loading-spinner {
    border: 4rpx solid rgba(255, 255, 255, 0.1);
    border-top-color: #667eea;
  }
  
  .theme-switcher {
    background: #1a1a2e;
    .theme-label {
      color: rgba(255, 255, 255, 0.7);
    }
    .theme-option {
      background: rgba(255, 255, 255, 0.1);
      color: rgba(255, 255, 255, 0.7);
      &.active {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: #ffffff;
        box-shadow: 0 0 20rpx rgba(102, 126, 234, 0.5);
      }
    }
  }
}

// ========== 简约主题 ==========
.theme-minimal {
  background: #f8f9fa;
  
  .page-header {
    background: #ffffff;
    border-bottom: 1rpx solid #e9ecef;
    .page-title {
      color: #212529;
    }
    .page-subtitle {
      color: #6c757d;
    }
  }
  
  .tabs-wrapper {
    background: #ffffff;
    border-bottom: 1rpx solid #e9ecef;
    .tab-item {
      color: #6c757d;
      &.active {
        color: #212529;
        .tab-indicator {
          background: #212529;
        }
      }
      .tab-badge {
        background: #FF6B35;
        color: #ffffff;
      }
    }
  }
  
  .order-card {
    background: #ffffff;
    box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
    
    .order-no {
      color: #6c757d;
    }
    .order-time {
      color: #adb5bd;
    }
    .party-title {
      color: #212529;
    }
    .info-label {
      color: #6c757d;
    }
    .info-value {
      color: #495057;
    }
    .price-label {
      color: #6c757d;
    }
    .price-value {
      color: #212529;
    }
  }
  
  .status-pending {
    background: #FFF3E0;
    color: #FF9800;
  }
  .status-paid {
    background: #E8F5E9;
    color: #4CAF50;
  }
  .status-completed {
    background: #E3F2FD;
    color: #2196F3;
  }
  .status-cancelled {
    background: #FFEBEE;
    color: #F44336;
  }
  
  .action-btn {
    &.primary {
      background: #212529;
    }
    &.secondary {
      background: #f8f9fa;
      color: #495057;
    }
    &.ghost {
      background: transparent;
      border: 1rpx solid #dee2e6;
      color: #6c757d;
    }
  }
  
  .empty-state {
    .empty-icon-wrapper {
      background: #f8f9fa;
    }
    .empty-title {
      color: #212529;
    }
    .empty-desc {
      color: #6c757d;
    }
  }
  
  .explore-btn {
    background: #212529;
  }
  
  .loading-spinner {
    border: 4rpx solid #e9ecef;
    border-top-color: #212529;
  }
  
  .theme-switcher {
    background: #ffffff;
    box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
    .theme-label {
      color: #6c757d;
    }
    .theme-option {
      background: #f8f9fa;
      color: #6c757d;
      &.active {
        background: #212529;
        color: #ffffff;
      }
    }
  }
}

// ========== 暗色主题 ==========
.theme-dark {
  background: #121212;
  
  .page-header {
    background: linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 100%);
    .page-title {
      color: #e0e0e0;
    }
    .page-subtitle {
      color: rgba(255, 255, 255, 0.5);
    }
  }
  
  .tabs-wrapper {
    background: #1e1e1e;
    .tab-item {
      color: rgba(255, 255, 255, 0.5);
      &.active {
        color: #FF6B35;
        .tab-indicator {
          background: #FF6B35;
        }
      }
      .tab-badge {
        background: #FF6B35;
        color: #ffffff;
      }
    }
  }
  
  .order-card {
    background: #1e1e1e;
    
    .order-no {
      color: rgba(255, 255, 255, 0.4);
    }
    .order-time {
      color: rgba(255, 255, 255, 0.3);
    }
    .party-title {
      color: #e0e0e0;
    }
    .info-label {
      color: rgba(255, 255, 255, 0.4);
    }
    .info-value {
      color: rgba(255, 255, 255, 0.7);
    }
    .price-label {
      color: rgba(255, 255, 255, 0.4);
    }
    .price-value {
      color: #FF6B35;
    }
  }
  
  .status-pending {
    background: rgba(255, 193, 7, 0.1);
    color: #FFC107;
  }
  .status-paid {
    background: rgba(76, 175, 80, 0.1);
    color: #4CAF50;
  }
  .status-completed {
    background: rgba(33, 150, 243, 0.1);
    color: #2196F3;
  }
  .status-cancelled {
    background: rgba(244, 67, 54, 0.1);
    color: #F44336;
  }
  
  .action-btn {
    &.primary {
      background: #FF6B35;
    }
    &.secondary {
      background: #2d2d2d;
      color: #e0e0e0;
    }
    &.ghost {
      background: transparent;
      border: 1rpx solid #3d3d3d;
      color: rgba(255, 255, 255, 0.5);
    }
  }
  
  .empty-state {
    .empty-icon-wrapper {
      background: #1e1e1e;
    }
    .empty-title {
      color: #e0e0e0;
    }
    .empty-desc {
      color: rgba(255, 255, 255, 0.4);
    }
  }
  
  .explore-btn {
    background: #FF6B35;
  }
  
  .loading-spinner {
    border: 4rpx solid #2d2d2d;
    border-top-color: #FF6B35;
  }
  
  .theme-switcher {
    background: #1e1e1e;
    .theme-label {
      color: rgba(255, 255, 255, 0.5);
    }
    .theme-option {
      background: #2d2d2d;
      color: rgba(255, 255, 255, 0.5);
      &.active {
        background: #FF6B35;
        color: #ffffff;
      }
    }
  }
}

// ========== 活力主题 ==========
.theme-vibrant {
  background: linear-gradient(180deg, #FFF5E5 0%, #ffffff 100%);
  
  .vibrant-shapes {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 600rpx;
    overflow: hidden;
    pointer-events: none;
    z-index: 0;
    
    .shape {
      position: absolute;
      border-radius: 50%;
      opacity: 0.6;
      
      &.shape-1 {
        width: 300rpx;
        height: 300rpx;
        background: #FFD93D;
        top: -100rpx;
        right: -50rpx;
        animation: float 8s ease-in-out infinite;
      }
      &.shape-2 {
        width: 200rpx;
        height: 200rpx;
        background: #6BCB77;
        top: 100rpx;
        left: -50rpx;
        animation: float 6s ease-in-out infinite reverse;
      }
      &.shape-3 {
        width: 150rpx;
        height: 150rpx;
        background: #4D96FF;
        top: 200rpx;
        right: 100rpx;
        animation: float 10s ease-in-out infinite;
      }
    }
  }
  
  .page-header {
    background: linear-gradient(135deg, #FF6B35 0%, #FF8E53 50%, #FFB347 100%);
    position: relative;
    z-index: 1;
    .page-title {
      color: #ffffff;
      text-shadow: 2rpx 2rpx 4rpx rgba(0, 0, 0, 0.2);
    }
    .page-subtitle {
      color: rgba(255, 255, 255, 0.95);
    }
  }
  
  .tabs-wrapper {
    background: #ffffff;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
    .tab-item {
      color: #666666;
      &.active {
        color: #FF6B35;
        .tab-indicator {
          background: linear-gradient(90deg, #FF6B35 0%, #FF8E53 100%);
        }
      }
      .tab-badge {
        background: linear-gradient(135deg, #FF6B35 0%, #FF8E53 100%);
        color: #ffffff;
      }
    }
  }
  
  .order-card {
    background: #ffffff;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
    border: 2rpx solid transparent;
    
    &:active {
      border-color: rgba(255, 107, 53, 0.3);
    }
    
    .order-no {
      color: #999999;
    }
    .order-time {
      color: #bbbbbb;
    }
    .party-title {
      color: #333333;
    }
    .info-label {
      color: #999999;
    }
    .info-value {
      color: #666666;
    }
    .price-label {
      color: #999999;
    }
    .price-value {
      color: #FF6B35;
    }
  }
  
  .status-pending {
    background: linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%);
    color: #FF9800;
  }
  .status-paid {
    background: linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%);
    color: #4CAF50;
  }
  .status-completed {
    background: linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%);
    color: #2196F3;
  }
  .status-cancelled {
    background: linear-gradient(135deg, #FFEBEE 0%, #FFCDD2 100%);
    color: #F44336;
  }
  
  .action-btn {
    &.primary {
      background: linear-gradient(135deg, #FF6B35 0%, #FF8E53 100%);
      box-shadow: 0 4rpx 20rpx rgba(255, 107, 53, 0.3);
    }
    &.secondary {
      background: linear-gradient(135deg, #FFF5E5 0%, #ffffff 100%);
      color: #FF6B35;
      border: 1rpx solid rgba(255, 107, 53, 0.2);
    }
    &.ghost {
      background: transparent;
      border: 1rpx solid #e0e0e0;
      color: #999999;
    }
  }
  
  .empty-state {
    .empty-icon-wrapper {
      background: linear-gradient(135deg, #FFF5E5 0%, #ffffff 100%);
    }
    .empty-title {
      color: #333333;
    }
    .empty-desc {
      color: #666666;
    }
  }
  
  .explore-btn {
    background: linear-gradient(135deg, #FF6B35 0%, #FF8E53 100%);
    box-shadow: 0 4rpx 20rpx rgba(255, 107, 53, 0.3);
  }
  
  .loading-spinner {
    border: 4rpx solid #f5f5f5;
    border-top-color: #FF6B35;
  }
  
  .theme-switcher {
    background: #ffffff;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
    .theme-label {
      color: #666666;
    }
    .theme-option {
      background: #f5f5f5;
      color: #666666;
      &.active {
        background: linear-gradient(135deg, #FF6B35 0%, #FF8E53 100%);
        color: #ffffff;
      }
    }
  }
}

// ========== 公共样式 ==========
.page-header {
  padding: 60rpx 40rpx 40rpx;
  text-align: center;
  
  .page-title {
    font-size: 44rpx;
    font-weight: bold;
    display: block;
    margin-bottom: 10rpx;
  }
  .page-subtitle {
    font-size: 26rpx;
  }
}

.tabs-wrapper {
  padding: 0 20rpx;
  position: sticky;
  top: 0;
  z-index: 10;
  
  .tabs {
    display: flex;
    padding: 20rpx 0;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    
    &::-webkit-scrollbar {
      display: none;
    }
  }
  
  .tab-item {
    flex-shrink: 0;
    padding: 20rpx 30rpx;
    font-size: 28rpx;
    position: relative;
    display: flex;
    align-items: center;
    gap: 10rpx;
    transition: all 0.3s ease;
    
    &:active {
      opacity: 0.7;
    }
    
    .tab-text {
      font-weight: 500;
    }
    
    .tab-badge {
      padding: 4rpx 12rpx;
      border-radius: 20rpx;
      font-size: 20rpx;
      font-weight: bold;
    }
    
    .tab-indicator {
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 40rpx;
      height: 4rpx;
      border-radius: 2rpx;
    }
  }
}

.orders-list {
  padding: 20rpx;
  height: calc(100vh - 300rpx);
}

.order-card {
  border-radius: 24rpx;
  margin-bottom: 24rpx;
  overflow: hidden;
  animation: slideUp 0.4s ease both;
  transition: all 0.3s ease;
  
  &:active {
    transform: scale(0.98);
  }
  
  .order-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 30rpx;
    border-bottom: 1rpx solid rgba(0, 0, 0, 0.05);
    
    .order-meta {
      display: flex;
      flex-direction: column;
      gap: 8rpx;
      
      .order-no {
        font-size: 24rpx;
      }
      .order-time {
        font-size: 22rpx;
      }
    }
    
    .order-status {
      display: flex;
      align-items: center;
      gap: 8rpx;
      padding: 12rpx 24rpx;
      border-radius: 30rpx;
      font-size: 24rpx;
      font-weight: 600;
      
      .status-icon {
        font-size: 20rpx;
      }
    }
  }
  
  .order-content {
    display: flex;
    padding: 30rpx;
    gap: 24rpx;
    
    .party-image {
      width: 160rpx;
      height: 160rpx;
      border-radius: 16rpx;
      flex-shrink: 0;
    }
    
    .order-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 16rpx;
      
      .party-title {
        font-size: 30rpx;
        font-weight: bold;
        line-height: 1.4;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      
      .info-row {
        display: flex;
        align-items: center;
        gap: 12rpx;
        
        .info-label {
          font-size: 24rpx;
        }
        .info-value {
          font-size: 26rpx;
          font-weight: 500;
        }
      }
    }
  }
  
  .order-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24rpx 30rpx;
    border-top: 1rpx solid rgba(0, 0, 0, 0.05);
    
    .price-section {
      display: flex;
      align-items: baseline;
      gap: 12rpx;
      
      .price-label {
        font-size: 24rpx;
      }
      .price-value {
        font-size: 40rpx;
        font-weight: bold;
      }
    }
    
    .action-section {
      display: flex;
      gap: 16rpx;
      
      .action-btn {
        padding: 16rpx 32rpx;
        border-radius: 30rpx;
        font-size: 26rpx;
        font-weight: 600;
        border: none;
        transition: all 0.3s ease;
        
        &::after {
          border: none;
        }
        
        &:active {
          transform: scale(0.95);
        }
      }
    }
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 100rpx 40rpx;
  
  .empty-icon-wrapper {
    width: 180rpx;
    height: 180rpx;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 40rpx;
    
    .empty-icon {
      font-size: 80rpx;
    }
  }
  
  .empty-title {
    font-size: 36rpx;
    font-weight: bold;
    margin-bottom: 16rpx;
  }
  
  .empty-desc {
    font-size: 28rpx;
    margin-bottom: 40rpx;
  }
  
  .explore-btn {
    padding: 24rpx 60rpx;
    border-radius: 40rpx;
    font-size: 30rpx;
    font-weight: 600;
    color: #ffffff;
    border: none;
    transition: all 0.3s ease;
    
    &::after {
      border: none;
    }
    
    &:active {
      transform: scale(0.95);
    }
  }
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx;
  gap: 20rpx;
  
  .loading-spinner {
    width: 48rpx;
    height: 48rpx;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  .loading-text {
    font-size: 26rpx;
  }
}

.no-more {
  text-align: center;
  padding: 40rpx;
  font-size: 26rpx;
  opacity: 0.5;
}

.theme-switcher {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20rpx;
  padding: 30rpx;
  margin: 20rpx 30rpx;
  border-radius: 50rpx;
  
  .theme-label {
    font-size: 26rpx;
    margin-right: 10rpx;
  }
  
  .theme-option {
    padding: 16rpx 32rpx;
    border-radius: 30rpx;
    font-size: 24rpx;
    font-weight: 500;
    transition: all 0.3s ease;
    
    &:active {
      transform: scale(0.95);
    }
  }
}
</style>