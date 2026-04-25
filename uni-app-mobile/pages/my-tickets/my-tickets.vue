<template>
  <view class="tickets-container" :class="currentThemeClass">
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
      <text class="page-title">我的票券</text>
      <text class="page-subtitle">管理和使用您的活动票券</text>
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
          <text class="tab-icon">{{ tab.icon }}</text>
          <text class="tab-text">{{ tab.label }}</text>
          <view class="tab-indicator" v-if="currentTab === tab.value"></view>
        </view>
      </view>
    </view>

    <!-- 票券列表 -->
    <scroll-view 
      class="tickets-list" 
      scroll-y 
      @scrolltolower="loadMore"
      @refresherrefresh="onRefresh"
      :refresher-enabled="true"
      :refresher-triggered="refreshing"
    >
      <view 
        class="ticket-card" 
        v-for="(ticket, index) in tickets" 
        :key="ticket.id"
        :class="{ 'ticket-used': ticket.status === 'used', 'ticket-expired': ticket.status === 'expired' }"
        :style="{ animationDelay: index * 0.05 + 's' }"
        @tap="goToDetail(ticket.id)"
      >
        <!-- 票券头部 -->
        <view class="ticket-header">
          <view class="party-info">
            <image class="party-image" :src="ticket.party?.images?.[0] || '/static/default-party.png'" mode="aspectFill"></image>
            <view class="party-details">
              <text class="party-title">{{ ticket.party?.title }}</text>
              <text class="ticket-type">{{ ticket.ticket?.name }}</text>
            </view>
          </view>
          <view class="ticket-status-badge" :class="getStatusClass(ticket.status)">
            <text class="status-icon">{{ getStatusIcon(ticket.status) }}</text>
            <text class="status-text">{{ getStatusText(ticket.status) }}</text>
          </view>
        </view>

        <!-- 票券内容 -->
        <view class="ticket-content">
          <!-- 二维码区域（仅有效票券） -->
          <view class="qr-section" v-if="currentTab === 'valid' && ticket.status === 'valid'">
            <view class="qr-wrapper" @tap.stop="showQrCode(ticket)">
              <image class="qr-code" :src="ticket.qr_code" mode="aspectFit"></image>
              <view class="qr-overlay">
                <text class="qr-hint">点击放大</text>
              </view>
            </view>
            <text class="ticket-no">票号: {{ ticket.ticket_no }}</text>
          </view>

          <!-- 信息区域 -->
          <view class="info-section">
            <view class="info-grid">
              <view class="info-item">
                <text class="info-icon">👤</text>
                <view class="info-content">
                  <text class="info-label">姓名</text>
                  <text class="info-value">{{ ticket.name }}</text>
                </view>
              </view>
              <view class="info-item">
                <text class="info-icon">📱</text>
                <view class="info-content">
                  <text class="info-label">手机</text>
                  <text class="info-value">{{ maskPhone(ticket.phone) }}</text>
                </view>
              </view>
              <view class="info-item">
                <text class="info-icon">🕐</text>
                <view class="info-content">
                  <text class="info-label">时间</text>
                  <text class="info-value">{{ formatDateTime(ticket.party?.start_time) }}</text>
                </view>
              </view>
              <view class="info-item">
                <text class="info-icon">📍</text>
                <view class="info-content">
                  <text class="info-label">地点</text>
                  <text class="info-value address">{{ ticket.party?.address }}</text>
                </view>
              </view>
            </view>
          </view>
        </view>

        <!-- 票券底部 -->
        <view class="ticket-footer">
          <view class="price-section">
            <text class="price-label">票价</text>
            <text class="price-value">¥{{ ticket.ticket?.price }}</text>
          </view>
          <view class="action-section" v-if="ticket.status === 'valid'">
            <button class="action-btn secondary" @tap.stop="navigateToParty(ticket.party_id)">
              <text class="btn-icon">🧭</text>
              <text>导航</text>
            </button>
            <button class="action-btn primary" @tap.stop="shareTicket(ticket)">
              <text class="btn-icon">↗️</text>
              <text>分享</text>
            </button>
          </view>
          <view class="action-section" v-else>
            <button class="action-btn ghost" @tap.stop="goToDetail(ticket.id)">
              <text>查看详情</text>
            </button>
          </view>
        </view>
        
        <!-- 装饰性打孔效果 -->
        <view class="ticket-punch left"></view>
        <view class="ticket-punch right"></view>
      </view>

      <!-- 加载状态 -->
      <view class="loading-state" v-if="loading">
        <view class="loading-spinner"></view>
        <text class="loading-text">加载中...</text>
      </view>

      <view class="no-more" v-if="!hasMore && tickets.length > 0">
        <text>已经到底了</text>
      </view>

      <!-- 空状态 -->
      <view class="empty-state" v-if="tickets.length === 0 && !loading">
        <view class="empty-icon-wrapper">
          <text class="empty-icon">🎫</text>
        </view>
        <text class="empty-title">暂无票券</text>
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
import { orderApi } from '@/api/order'

export default {
  data() {
    return {
      currentTab: 'valid',
      tickets: [],
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
        { label: '有效票券', value: 'valid', icon: '✓' },
        { label: '已使用', value: 'used', icon: '✓' },
        { label: '已过期', value: 'expired', icon: '✕' }
      ]
    }
  },

  computed: {
    currentThemeClass() {
      return `theme-${this.currentTheme}`
    }
  },

  onLoad(options) {
    if (options.orderId) {
      this.loadTicketByOrder(options.orderId)
    } else {
      this.loadTickets()
    }
  },

  onPullDownRefresh() {
    this.onRefresh()
  },

  methods: {
    switchTheme(theme) {
      this.currentTheme = theme
    },
    
    async loadTickets(reset = false) {
      if (reset) {
        this.page = 1
        this.tickets = []
        this.hasMore = true
      }

      if (this.loading || !this.hasMore) return

      this.loading = true

      try {
        const params = {
          page: this.page,
          pageSize: this.pageSize,
          status: this.currentTab
        }

        const res = await orderApi.getTickets(params)

        if (res.code === 0) {
          if (reset) {
            this.tickets = res.data.list || []
          } else {
            this.tickets = [...this.tickets, ...(res.data.list || [])]
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

    async loadTicketByOrder(orderId) {
      try {
        const res = await orderApi.getOrderDetail(orderId)
        if (res.code === 0 && res.data.tickets) {
          this.tickets = res.data.tickets
        }
      } catch (error) {
        uni.showToast({
          title: '加载失败',
          icon: 'none'
        })
      }
    },

    switchTab(tab) {
      if (this.currentTab === tab) return
      this.currentTab = tab
      this.loadTickets(true)
    },

    goToDetail(ticketId) {
      uni.navigateTo({
        url: `/pages/ticket-detail/ticket-detail?id=${ticketId}`
      })
    },

    goToExplore() {
      uni.switchTab({
        url: '/pages/index/index'
      })
    },

    showQrCode(ticket) {
      uni.previewImage({
        urls: [ticket.qr_code],
        current: 0,
        fail: () => {
          uni.showToast({
            title: '预览失败',
            icon: 'none'
          })
        }
      })
    },

    navigateToParty(partyId) {
      uni.navigateTo({
        url: `/pages/party-detail/party-detail?id=${partyId}`
      })
    },

    shareTicket(ticket) {
      uni.showShareMenu({
        withShareTicket: true,
        fail: () => {
          uni.showToast({
            title: '分享失败',
            icon: 'none'
          })
        }
      })
    },

    onRefresh() {
      this.refreshing = true
      this.loadTickets(true).then(() => {
        this.refreshing = false
      })
    },

    loadMore() {
      this.loadTickets()
    },

    getStatusClass(status) {
      const classMap = {
        'valid': 'status-valid',
        'used': 'status-used',
        'expired': 'status-expired'
      }
      return classMap[status] || ''
    },

    getStatusText(status) {
      const textMap = {
        'valid': '有效',
        'used': '已使用',
        'expired': '已过期'
      }
      return textMap[status] || '未知'
    },
    
    getStatusIcon(status) {
      const iconMap = {
        'valid': '✓',
        'used': '✓',
        'expired': '✕'
      }
      return iconMap[status] || ''
    },

    maskPhone(phone) {
      if (!phone) return ''
      return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
    },

    formatDateTime(time) {
      if (!time) return ''
      const date = new Date(time)
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const day = date.getDate().toString().padStart(2, '0')
      const hours = date.getHours().toString().padStart(2, '0')
      const minutes = date.getMinutes().toString().padStart(2, '0')
      return `${month}月${day}日 ${hours}:${minutes}`
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

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

// ========== 基础容器 ==========
.tickets-container {
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
      background: radial-gradient(circle, rgba(76, 175, 80, 0.4) 0%, transparent 70%);
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
        background: #4CAF50;
        border-radius: 50%;
        box-shadow: 0 0 10rpx #4CAF50, 0 0 20rpx #4CAF50;
        animation: particleFloat 8s linear infinite;
        
        &:nth-child(1) { left: 10%; animation-delay: 0s; }
        &:nth-child(2) { left: 25%; animation-delay: 1s; background: #8BC34A; box-shadow: 0 0 10rpx #8BC34A, 0 0 20rpx #8BC34A; }
        &:nth-child(3) { left: 40%; animation-delay: 2s; }
        &:nth-child(4) { left: 60%; animation-delay: 3s; background: #CDDC39; box-shadow: 0 0 10rpx #CDDC39, 0 0 20rpx #CDDC39; }
        &:nth-child(5) { left: 75%; animation-delay: 4s; }
        &:nth-child(6) { left: 90%; animation-delay: 5s; background: #00E676; box-shadow: 0 0 10rpx #00E676, 0 0 20rpx #00E676; }
      }
    }
  }
  
  .page-header {
    background: linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%);
    position: relative;
    z-index: 1;
  }
  
  .tabs-wrapper {
    background: #0a0a0a;
    .tab-item {
      color: rgba(255, 255, 255, 0.6);
      &.active {
        color: #4CAF50;
        .tab-indicator {
          background: #4CAF50;
          box-shadow: 0 0 10rpx #4CAF50;
        }
      }
    }
  }
  
  .ticket-card {
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    border: 1rpx solid rgba(255, 255, 255, 0.05);
    
    &.ticket-used, &.ticket-expired {
      opacity: 0.7;
    }
    
    .party-title {
      color: #ffffff;
    }
    .ticket-type {
      color: rgba(255, 255, 255, 0.6);
    }
    .info-label {
      color: rgba(255, 255, 255, 0.5);
    }
    .info-value {
      color: rgba(255, 255, 255, 0.8);
    }
    .ticket-no {
      color: rgba(255, 255, 255, 0.5);
    }
    .price-label {
      color: rgba(255, 255, 255, 0.5);
    }
    .price-value {
      color: #4CAF50;
    }
  }
  
  .status-valid {
    background: linear-gradient(135deg, #4CAF50 0%, #45A049 100%);
    box-shadow: 0 4rpx 20rpx rgba(76, 175, 80, 0.4);
  }
  .status-used {
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.5);
  }
  .status-expired {
    background: rgba(244, 67, 54, 0.2);
    color: #F44336;
  }
  
  .qr-wrapper {
    background: #ffffff;
    box-shadow: 0 4rpx 30rpx rgba(0, 0, 0, 0.3);
  }
  
  .ticket-punch {
    background: #000000;
  }
  
  .action-btn {
    &.primary {
      background: linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%);
      box-shadow: 0 4rpx 20rpx rgba(76, 175, 80, 0.4);
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
      background: rgba(76, 175, 80, 0.1);
    }
    .empty-title {
      color: #ffffff;
    }
    .empty-desc {
      color: rgba(255, 255, 255, 0.5);
    }
  }
  
  .explore-btn {
    background: linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%);
    box-shadow: 0 4rpx 20rpx rgba(76, 175, 80, 0.4);
  }
  
  .loading-spinner {
    border: 4rpx solid rgba(255, 255, 255, 0.1);
    border-top-color: #4CAF50;
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
        background: linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%);
        color: #ffffff;
        box-shadow: 0 0 20rpx rgba(76, 175, 80, 0.5);
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
    }
  }
  
  .ticket-card {
    background: #ffffff;
    box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
    
    &.ticket-used, &.ticket-expired {
      opacity: 0.6;
    }
    
    .party-title {
      color: #212529;
    }
    .ticket-type {
      color: #6c757d;
    }
    .info-label {
      color: #6c757d;
    }
    .info-value {
      color: #495057;
    }
    .ticket-no {
      color: #adb5bd;
    }
    .price-label {
      color: #6c757d;
    }
    .price-value {
      color: #212529;
    }
  }
  
  .status-valid {
    background: #212529;
    color: #ffffff;
  }
  .status-used {
    background: #e9ecef;
    color: #6c757d;
  }
  .status-expired {
    background: #FFEBEE;
    color: #F44336;
  }
  
  .qr-wrapper {
    background: #ffffff;
    border: 1rpx solid #e9ecef;
  }
  
  .ticket-punch {
    background: #f8f9fa;
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
        color: #4CAF50;
        .tab-indicator {
          background: #4CAF50;
        }
      }
    }
  }
  
  .ticket-card {
    background: #1e1e1e;
    
    &.ticket-used, &.ticket-expired {
      opacity: 0.5;
    }
    
    .party-title {
      color: #e0e0e0;
    }
    .ticket-type {
      color: rgba(255, 255, 255, 0.5);
    }
    .info-label {
      color: rgba(255, 255, 255, 0.4);
    }
    .info-value {
      color: rgba(255, 255, 255, 0.7);
    }
    .ticket-no {
      color: rgba(255, 255, 255, 0.3);
    }
    .price-label {
      color: rgba(255, 255, 255, 0.4);
    }
    .price-value {
      color: #4CAF50;
    }
  }
  
  .status-valid {
    background: #4CAF50;
    color: #ffffff;
  }
  .status-used {
    background: #2d2d2d;
    color: rgba(255, 255, 255, 0.4);
  }
  .status-expired {
    background: rgba(244, 67, 54, 0.1);
    color: #F44336;
  }
  
  .qr-wrapper {
    background: #ffffff;
  }
  
  .ticket-punch {
    background: #121212;
  }
  
  .action-btn {
    &.primary {
      background: #4CAF50;
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
    background: #4CAF50;
  }
  
  .loading-spinner {
    border: 4rpx solid #2d2d2d;
    border-top-color: #4CAF50;
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
        background: #4CAF50;
        color: #ffffff;
      }
    }
  }
}

// ========== 活力主题 ==========
.theme-vibrant {
  background: linear-gradient(180deg, #E8F5E9 0%, #ffffff 100%);
  
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
        background: #4CAF50;
        top: -100rpx;
        right: -50rpx;
        animation: float 8s ease-in-out infinite;
      }
      &.shape-2 {
        width: 200rpx;
        height: 200rpx;
        background: #8BC34A;
        top: 100rpx;
        left: -50rpx;
        animation: float 6s ease-in-out infinite reverse;
      }
      &.shape-3 {
        width: 150rpx;
        height: 150rpx;
        background: #CDDC39;
        top: 200rpx;
        right: 100rpx;
        animation: float 10s ease-in-out infinite;
      }
    }
  }
  
  .page-header {
    background: linear-gradient(135deg, #4CAF50 0%, #8BC34A 50%, #CDDC39 100%);
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
        color: #4CAF50;
        .tab-indicator {
          background: linear-gradient(90deg, #4CAF50 0%, #8BC34A 100%);
        }
      }
    }
  }
  
  .ticket-card {
    background: #ffffff;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
    border: 2rpx solid transparent;
    
    &.ticket-used, &.ticket-expired {
      opacity: 0.6;
    }
    
    &:active {
      border-color: rgba(76, 175, 80, 0.3);
    }
    
    .party-title {
      color: #333333;
    }
    .ticket-type {
      color: #666666;
    }
    .info-label {
      color: #999999;
    }
    .info-value {
      color: #666666;
    }
    .ticket-no {
      color: #bbbbbb;
    }
    .price-label {
      color: #999999;
    }
    .price-value {
      color: #4CAF50;
    }
  }
  
  .status-valid {
    background: linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%);
    color: #ffffff;
    box-shadow: 0 4rpx 20rpx rgba(76, 175, 80, 0.3);
  }
  .status-used {
    background: #f5f5f5;
    color: #999999;
  }
  .status-expired {
    background: linear-gradient(135deg, #FFEBEE 0%, #FFCDD2 100%);
    color: #F44336;
  }
  
  .qr-wrapper {
    background: #ffffff;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
    border: 2rpx solid #E8F5E9;
  }
  
  .ticket-punch {
    background: linear-gradient(180deg, #E8F5E9 0%, #ffffff 100%);
  }
  
  .action-btn {
    &.primary {
      background: linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%);
      box-shadow: 0 4rpx 20rpx rgba(76, 175, 80, 0.3);
    }
    &.secondary {
      background: linear-gradient(135deg, #E8F5E9 0%, #ffffff 100%);
      color: #4CAF50;
      border: 1rpx solid rgba(76, 175, 80, 0.2);
    }
    &.ghost {
      background: transparent;
      border: 1rpx solid #e0e0e0;
      color: #999999;
    }
  }
  
  .empty-state {
    .empty-icon-wrapper {
      background: linear-gradient(135deg, #E8F5E9 0%, #ffffff 100%);
    }
    .empty-title {
      color: #333333;
    }
    .empty-desc {
      color: #666666;
    }
  }
  
  .explore-btn {
    background: linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%);
    box-shadow: 0 4rpx 20rpx rgba(76, 175, 80, 0.3);
  }
  
  .loading-spinner {
    border: 4rpx solid #f5f5f5;
    border-top-color: #4CAF50;
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
        background: linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%);
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
  padding: 0 30rpx;
  position: sticky;
  top: 0;
  z-index: 10;
  
  .tabs {
    display: flex;
    padding: 20rpx 0;
  }
  
  .tab-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10rpx;
    padding: 20rpx 0;
    font-size: 26rpx;
    position: relative;
    transition: all 0.3s ease;
    
    &:active {
      opacity: 0.7;
    }
    
    .tab-icon {
      font-size: 32rpx;
    }
    
    .tab-text {
      font-weight: 500;
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

.tickets-list {
  padding: 20rpx;
  height: calc(100vh - 320rpx);
}

.ticket-card {
  border-radius: 24rpx;
  margin-bottom: 30rpx;
  overflow: hidden;
  position: relative;
  animation: slideUp 0.4s ease both;
  transition: all 0.3s ease;
  
  &:active {
    transform: scale(0.98);
  }
  
  .ticket-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 30rpx;
    border-bottom: 1rpx dashed rgba(0, 0, 0, 0.1);
    
    .party-info {
      flex: 1;
      display: flex;
      gap: 20rpx;
      
      .party-image {
        width: 120rpx;
        height: 120rpx;
        border-radius: 16rpx;
        flex-shrink: 0;
      }
      
      .party-details {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 10rpx;
        
        .party-title {
          font-size: 30rpx;
          font-weight: bold;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .ticket-type {
          font-size: 24rpx;
        }
      }
    }
    
    .ticket-status-badge {
      display: flex;
      align-items: center;
      gap: 8rpx;
      padding: 12rpx 24rpx;
      border-radius: 30rpx;
      font-size: 24rpx;
      font-weight: 600;
      flex-shrink: 0;
      
      .status-icon {
        font-size: 20rpx;
      }
    }
  }
  
  .ticket-content {
    padding: 30rpx;
    
    .qr-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-bottom: 30rpx;
      
      .qr-wrapper {
        position: relative;
        padding: 30rpx;
        border-radius: 20rpx;
        margin-bottom: 20rpx;
        transition: all 0.3s ease;
        
        &:active {
          transform: scale(0.95);
        }
        
        .qr-code {
          width: 280rpx;
          height: 280rpx;
          border-radius: 12rpx;
        }
        
        .qr-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.3);
          border-radius: 20rpx;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.3s ease;
          
          .qr-hint {
            color: #ffffff;
            font-size: 28rpx;
            font-weight: 600;
          }
        }
        
        &:hover .qr-overlay,
        &:active .qr-overlay {
          opacity: 1;
        }
      }
      
      .ticket-no {
        font-size: 24rpx;
      }
    }
    
    .info-section {
      .info-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 24rpx;
        
        .info-item {
          display: flex;
          align-items: flex-start;
          gap: 16rpx;
          
          .info-icon {
            font-size: 32rpx;
            margin-top: 4rpx;
          }
          
          .info-content {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 6rpx;
            
            .info-label {
              font-size: 22rpx;
            }
            
            .info-value {
              font-size: 26rpx;
              font-weight: 500;
              line-height: 1.4;
              
              &.address {
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                overflow: hidden;
              }
            }
          }
        }
      }
    }
  }
  
  .ticket-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24rpx 30rpx;
    border-top: 1rpx dashed rgba(0, 0, 0, 0.1);
    
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
        display: flex;
        align-items: center;
        gap: 8rpx;
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
        
        .btn-icon {
          font-size: 24rpx;
        }
      }
    }
  }
  
  .ticket-punch {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 40rpx;
    height: 40rpx;
    border-radius: 50%;
    
    &.left {
      left: -20rpx;
    }
    
    &.right {
      right: -20rpx;
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