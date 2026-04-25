<template>
  <view class="wallet-container" :class="currentThemeClass">
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
    
    <!-- 顶部余额卡片 -->
    <view class="wallet-header">
      <view class="balance-card">
        <view class="balance-label">账户余额</view>
        <view class="balance-amount">
          <text class="currency">¥</text>
          <text class="amount">{{ walletInfo?.balance || '0.00' }}</text>
        </view>
        <view class="balance-info">
          <text class="info-item">冻结: ¥{{ walletInfo?.frozen_balance || '0.00' }}</text>
          <text class="info-divider">|</text>
          <text class="info-item">可用: ¥{{ walletInfo?.available_balance || '0.00' }}</text>
        </view>
      </view>
      
      <!-- 主要操作按钮 -->
      <view class="wallet-actions">
        <view class="action-btn recharge-btn" @tap="goToRecharge">
          <view class="btn-icon">
            <text class="iconfont">💰</text>
          </view>
          <text class="btn-text">充值</text>
        </view>
        <view class="action-btn withdraw-btn" @tap="goToWithdraw">
          <view class="btn-icon">
            <text class="iconfont">💸</text>
          </view>
          <text class="btn-text">提现</text>
        </view>
      </view>
    </view>
    
    <!-- 快捷功能 -->
    <view class="quick-actions-section">
      <view class="section-title">快捷功能</view>
      <view class="quick-actions-grid">
        <view class="quick-action-item" @tap="goToTransfer">
          <view class="action-icon-wrapper">
            <text class="action-icon">↗️</text>
          </view>
          <text class="action-name">转账</text>
          <text class="action-desc">向好友转账</text>
        </view>
        <view class="quick-action-item" @tap="goToBankCards">
          <view class="action-icon-wrapper">
            <text class="action-icon">💳</text>
          </view>
          <text class="action-name">银行卡</text>
          <text class="action-desc">管理银行卡</text>
        </view>
        <view class="quick-action-item" @tap="goToTransactions">
          <view class="action-icon-wrapper">
            <text class="action-icon">📊</text>
          </view>
          <text class="action-name">交易记录</text>
          <text class="action-desc">查看明细</text>
        </view>
        <view class="quick-action-item" @tap="goToSecurity">
          <view class="action-icon-wrapper">
            <text class="action-icon">🔒</text>
          </view>
          <text class="action-name">安全中心</text>
          <text class="action-desc">密码管理</text>
        </view>
      </view>
    </view>
    
    <!-- 最近交易 -->
    <view class="transactions-section">
      <view class="section-header">
        <text class="section-title">最近交易</text>
        <view class="view-more" @tap="goToTransactions">
          <text>查看全部</text>
          <text class="arrow">›</text>
        </view>
      </view>
      
      <view class="transactions-list" v-if="recentTransactions.length > 0">
        <view 
          class="transaction-item" 
          v-for="(transaction, index) in recentTransactions" 
          :key="transaction.id"
          :style="{ animationDelay: index * 0.05 + 's' }"
          @tap="goToTransactionDetail(transaction.id)"
        >
          <view class="transaction-icon" :class="getTransactionTypeClass(transaction.type)">
            <text>{{ getTransactionIcon(transaction.type) }}</text>
          </view>
          <view class="transaction-content">
            <view class="transaction-main">
              <text class="transaction-title">{{ transaction.description }}</text>
              <text class="transaction-amount" :class="getAmountClass(transaction.type)">
                {{ transaction.type === 'income' || transaction.type === 'recharge' ? '+' : '-' }}¥{{ transaction.amount }}
              </text>
            </view>
            <view class="transaction-meta">
              <text class="transaction-time">{{ formatTime(transaction.created_at) }}</text>
              <text class="transaction-status" :class="'status-' + transaction.status">
                {{ getStatusText(transaction.status) }}
              </text>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 空状态 -->
      <view class="empty-state" v-else>
        <view class="empty-icon-wrapper">
          <text class="empty-icon">📋</text>
        </view>
        <text class="empty-title">暂无交易记录</text>
        <text class="empty-desc">您的交易记录将显示在这里</text>
      </view>
    </view>
    
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
import { walletApi } from '@/api/wallet'
import { useUserStore } from '@/stores/user'

export default {
  setup() {
    const userStore = useUserStore()
    return {
      userStore
    }
  },

  data() {
    return {
      walletInfo: null,
      recentTransactions: [],
      loading: false,
      currentTheme: 'neon',
      themes: [
        { label: '霓虹', value: 'neon' },
        { label: '简约', value: 'minimal' },
        { label: '暗色', value: 'dark' },
        { label: '活力', value: 'vibrant' }
      ]
    }
  },

  computed: {
    userInfo() {
      return this.userStore.userInfo
    },

    currentThemeClass() {
      return `theme-${this.currentTheme}`
    }
  },

  onLoad() {
    this.loadWalletInfo()
    this.loadRecentTransactions()
  },

  onShow() {
    this.loadWalletInfo()
  },

  methods: {
    switchTheme(theme) {
      this.currentTheme = theme
    },
    
    async loadWalletInfo() {
      try {
        const res = await walletApi.getWalletInfo()
        if (res.code === 0) {
          this.walletInfo = res.data
        }
      } catch (error) {
        uni.showToast({
          title: '加载失败',
          icon: 'none'
        })
      }
    },

    async loadRecentTransactions() {
      try {
        const res = await walletApi.getTransactions({
          page: 1,
          pageSize: 5
        })
        if (res.code === 0) {
          this.recentTransactions = res.data.list || []
        }
      } catch (error) {
        // console.error('加载交易记录失败:', error)
      }
    },

    goToRecharge() {
      uni.navigateTo({
        url: '/pages/wallet-recharge/wallet-recharge'
      })
    },

    goToWithdraw() {
      uni.navigateTo({
        url: '/pages/wallet-withdraw/wallet-withdraw'
      })
    },

    goToTransfer() {
      uni.navigateTo({
        url: '/pages/wallet-transfer/wallet-transfer'
      })
    },

    goToBankCards() {
      uni.navigateTo({
        url: '/pages/wallet-bank-cards/wallet-bank-cards'
      })
    },

    goToTransactions() {
      uni.navigateTo({
        url: '/pages/wallet-transactions/wallet-transactions'
      })
    },

    goToSecurity() {
      uni.navigateTo({
        url: '/pages/wallet-security/wallet-security'
      })
    },

    goToTransactionDetail(transactionId) {
      uni.navigateTo({
        url: `/pages/transaction-detail/transaction-detail?id=${transactionId}`
      })
    },

    getTransactionTypeClass(type) {
      const classMap = {
        'recharge': 'type-recharge',
        'withdraw': 'type-withdraw',
        'payment': 'type-payment',
        'refund': 'type-refund',
        'income': 'type-income',
        'transfer': 'type-transfer'
      }
      return classMap[type] || 'type-default'
    },

    getTransactionIcon(type) {
      const iconMap = {
        'recharge': '💰',
        'withdraw': '💸',
        'payment': '💳',
        'refund': '↩️',
        'income': '💵',
        'transfer': '↗️'
      }
      return iconMap[type] || '📋'
    },

    getAmountClass(type) {
      return type === 'income' || type === 'recharge' || type === 'refund' ? 'amount-positive' : 'amount-negative'
    },
    
    getStatusText(status) {
      const statusMap = {
        0: '处理中',
        1: '成功',
        2: '失败',
        3: '已取消'
      }
      return statusMap[status] || '未知'
    },

    formatTime(time) {
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
// ========== 基础变量 ==========
$primary: #FF6B35;
$success: #4CAF50;
$warning: #FF9800;
$danger: #F44336;
$info: #2196F3;

// ========== 动画定义 ==========
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
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
  0%, 100% { 
    transform: translateY(100vh) rotate(0deg);
    opacity: 0;
  }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { 
    transform: translateY(-100rpx) rotate(720deg);
    opacity: 0;
  }
}

// ========== 基础容器 ==========
.wallet-container {
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
  }
  
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
  
  .wallet-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    position: relative;
    z-index: 1;
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: 
        linear-gradient(90deg, transparent 50%, rgba(255,255,255,0.03) 50%),
        linear-gradient(transparent 50%, rgba(255,255,255,0.03) 50%);
      background-size: 30rpx 30rpx;
      pointer-events: none;
    }
  }
  
  .balance-card {
    .balance-label {
      color: rgba(255, 255, 255, 0.7);
    }
    .currency {
      color: rgba(255, 255, 255, 0.9);
    }
    .amount {
      color: #ffffff;
      text-shadow: 0 0 30rpx rgba(255, 255, 255, 0.5);
    }
    .balance-info {
      color: rgba(255, 255, 255, 0.6);
    }
  }
  
  .recharge-btn {
    background: linear-gradient(135deg, #FF6B35 0%, #FF8E53 100%);
    box-shadow: 0 8rpx 32rpx rgba(255, 107, 53, 0.4);
  }
  
  .withdraw-btn {
    background: rgba(255, 255, 255, 0.15);
    border: 2rpx solid rgba(255, 255, 255, 0.3);
  }
  
  .quick-actions-section {
    background: #0a0a0a;
    .section-title {
      color: #ffffff;
    }
    .quick-action-item {
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      border: 1rpx solid rgba(102, 126, 234, 0.2);
      .action-name {
        color: #ffffff;
      }
      .action-desc {
        color: rgba(255, 255, 255, 0.5);
      }
      &:active {
        border-color: rgba(102, 126, 234, 0.5);
        box-shadow: 0 0 20rpx rgba(102, 126, 234, 0.3);
      }
    }
  }
  
  .transactions-section {
    .section-title {
      color: #ffffff;
    }
    .view-more {
      color: #667eea;
    }
    .transaction-item {
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      border: 1rpx solid rgba(255, 255, 255, 0.05);
      .transaction-title {
        color: #ffffff;
      }
      .transaction-time {
        color: rgba(255, 255, 255, 0.5);
      }
    }
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
  
  .wallet-header {
    background: #ffffff;
    border-bottom: 1rpx solid #e9ecef;
  }
  
  .balance-card {
    .balance-label {
      color: #6c757d;
    }
    .currency {
      color: #495057;
    }
    .amount {
      color: #212529;
    }
    .balance-info {
      color: #6c757d;
    }
  }
  
  .recharge-btn {
    background: #FF6B35;
  }
  
  .withdraw-btn {
    background: #ffffff;
    border: 2rpx solid #dee2e6;
    color: #495057;
  }
  
  .quick-actions-section {
    background: #ffffff;
    margin: 20rpx;
    border-radius: 16rpx;
    .section-title {
      color: #212529;
    }
    .quick-action-item {
      background: #f8f9fa;
      .action-name {
        color: #212529;
      }
      .action-desc {
        color: #6c757d;
      }
      &:active {
        background: #e9ecef;
      }
    }
  }
  
  .transactions-section {
    background: #ffffff;
    margin: 0 20rpx;
    border-radius: 16rpx;
    .section-title {
      color: #212529;
    }
    .view-more {
      color: #FF6B35;
    }
    .transaction-item {
      background: #f8f9fa;
      .transaction-title {
        color: #212529;
      }
      .transaction-time {
        color: #6c757d;
      }
    }
  }
  
  .theme-switcher {
    background: #ffffff;
    margin: 20rpx;
    border-radius: 16rpx;
    border: 1rpx solid #e9ecef;
    .theme-label {
      color: #6c757d;
    }
    .theme-option {
      background: #f8f9fa;
      color: #6c757d;
      &.active {
        background: #FF6B35;
        color: #ffffff;
      }
    }
  }
}

// ========== 暗色主题 ==========
.theme-dark {
  background: #121212;
  
  .wallet-header {
    background: linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 100%);
  }
  
  .balance-card {
    .balance-label {
      color: rgba(255, 255, 255, 0.6);
    }
    .currency {
      color: rgba(255, 255, 255, 0.8);
    }
    .amount {
      color: #e0e0e0;
    }
    .balance-info {
      color: rgba(255, 255, 255, 0.5);
    }
  }
  
  .recharge-btn {
    background: #FF6B35;
  }
  
  .withdraw-btn {
    background: #2d2d2d;
    color: #e0e0e0;
  }
  
  .quick-actions-section {
    background: #1e1e1e;
    .section-title {
      color: #e0e0e0;
    }
    .quick-action-item {
      background: #2d2d2d;
      .action-name {
        color: #e0e0e0;
      }
      .action-desc {
        color: rgba(255, 255, 255, 0.5);
      }
      &:active {
        background: #3d3d3d;
      }
    }
  }
  
  .transactions-section {
    .section-title {
      color: #e0e0e0;
    }
    .view-more {
      color: #FF6B35;
    }
    .transaction-item {
      background: #1e1e1e;
      .transaction-title {
        color: #e0e0e0;
      }
      .transaction-time {
        color: rgba(255, 255, 255, 0.5);
      }
    }
  }
  
  .theme-switcher {
    background: #1e1e1e;
    .theme-label {
      color: rgba(255, 255, 255, 0.6);
    }
    .theme-option {
      background: #2d2d2d;
      color: rgba(255, 255, 255, 0.6);
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
  
  .wallet-header {
    background: linear-gradient(135deg, #FF6B35 0%, #FF8E53 50%, #FFB347 100%);
    position: relative;
    z-index: 1;
  }
  
  .balance-card {
    .balance-label {
      color: rgba(255, 255, 255, 0.9);
    }
    .currency {
      color: rgba(255, 255, 255, 0.95);
    }
    .amount {
      color: #ffffff;
      text-shadow: 2rpx 2rpx 4rpx rgba(0, 0, 0, 0.2);
    }
    .balance-info {
      color: rgba(255, 255, 255, 0.85);
    }
  }
  
  .recharge-btn {
    background: #ffffff;
    color: #FF6B35;
    box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.15);
  }
  
  .withdraw-btn {
    background: rgba(255, 255, 255, 0.25);
    color: #ffffff;
    border: 2rpx solid rgba(255, 255, 255, 0.5);
  }
  
  .quick-actions-section {
    background: #ffffff;
    margin: 20rpx;
    border-radius: 24rpx;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
    .section-title {
      color: #333333;
    }
    .quick-action-item {
      background: linear-gradient(135deg, #FFF5E5 0%, #ffffff 100%);
      border: 2rpx solid transparent;
      .action-name {
        color: #333333;
      }
      .action-desc {
        color: #666666;
      }
      &:active {
        border-color: #FF6B35;
        transform: translateY(-4rpx);
      }
    }
  }
  
  .transactions-section {
    background: #ffffff;
    margin: 0 20rpx;
    border-radius: 24rpx;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
    .section-title {
      color: #333333;
    }
    .view-more {
      color: #FF6B35;
    }
    .transaction-item {
      background: #FFF9F5;
      .transaction-title {
        color: #333333;
      }
      .transaction-time {
        color: #666666;
      }
    }
  }
  
  .theme-switcher {
    background: #ffffff;
    margin: 20rpx;
    border-radius: 24rpx;
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
.wallet-header {
  padding: 60rpx 40rpx 80rpx;
  border-radius: 0 0 40rpx 40rpx;
}

.balance-card {
  text-align: center;
  margin-bottom: 50rpx;
  
  .balance-label {
    font-size: 28rpx;
    margin-bottom: 20rpx;
    display: block;
  }
  
  .balance-amount {
    display: flex;
    align-items: flex-start;
    justify-content: center;
    margin-bottom: 20rpx;
    
    .currency {
      font-size: 48rpx;
      font-weight: 600;
      margin-right: 10rpx;
      margin-top: 10rpx;
    }
    
    .amount {
      font-size: 96rpx;
      font-weight: bold;
      letter-spacing: 2rpx;
    }
  }
  
  .balance-info {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24rpx;
    
    .info-divider {
      margin: 0 20rpx;
      opacity: 0.5;
    }
  }
}

.wallet-actions {
  display: flex;
  gap: 30rpx;
  
  .action-btn {
    flex: 1;
    height: 100rpx;
    border-radius: 50rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12rpx;
    transition: all 0.3s ease;
    
    &:active {
      transform: scale(0.98);
    }
    
    .btn-icon {
      font-size: 32rpx;
    }
    
    .btn-text {
      font-size: 30rpx;
      font-weight: 600;
    }
  }
}

.quick-actions-section {
  padding: 40rpx;
  margin-top: -40rpx;
  position: relative;
  z-index: 2;
  
  .section-title {
    font-size: 32rpx;
    font-weight: bold;
    margin-bottom: 30rpx;
    display: block;
  }
  
  .quick-actions-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20rpx;
  }
  
  .quick-action-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 30rpx 10rpx;
    border-radius: 20rpx;
    transition: all 0.3s ease;
    
    &:active {
      transform: scale(0.95);
    }
    
    .action-icon-wrapper {
      width: 80rpx;
      height: 80rpx;
      border-radius: 20rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 16rpx;
      background: rgba(255, 107, 53, 0.1);
      
      .action-icon {
        font-size: 40rpx;
      }
    }
    
    .action-name {
      font-size: 26rpx;
      font-weight: 600;
      margin-bottom: 6rpx;
    }
    
    .action-desc {
      font-size: 20rpx;
    }
  }
}

.transactions-section {
  padding: 40rpx;
  margin-top: 20rpx;
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30rpx;
    
    .section-title {
      font-size: 32rpx;
      font-weight: bold;
    }
    
    .view-more {
      display: flex;
      align-items: center;
      font-size: 26rpx;
      
      .arrow {
        margin-left: 8rpx;
        font-size: 32rpx;
      }
    }
  }
  
  .transactions-list {
    display: flex;
    flex-direction: column;
    gap: 20rpx;
  }
  
  .transaction-item {
    display: flex;
    align-items: center;
    padding: 30rpx;
    border-radius: 20rpx;
    animation: slideUp 0.4s ease both;
    transition: all 0.3s ease;
    
    &:active {
      transform: translateX(10rpx);
    }
    
    .transaction-icon {
      width: 80rpx;
      height: 80rpx;
      border-radius: 20rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 36rpx;
      margin-right: 24rpx;
      flex-shrink: 0;
      
      &.type-recharge {
        background: linear-gradient(135deg, #4CAF50 0%, #45A049 100%);
      }
      &.type-withdraw {
        background: linear-gradient(135deg, #F44336 0%, #FF6B35 100%);
      }
      &.type-payment {
        background: linear-gradient(135deg, #FF9800 0%, #FFC107 100%);
      }
      &.type-refund {
        background: linear-gradient(135deg, #2196F3 0%, #3F51B5 100%);
      }
      &.type-income {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      }
      &.type-transfer {
        background: linear-gradient(135deg, #9C27B0 0%, #E91E63 100%);
      }
      &.type-default {
        background: linear-gradient(135deg, #757575 0%, #9E9E9E 100%);
      }
    }
    
    .transaction-content {
      flex: 1;
      min-width: 0;
      
      .transaction-main {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10rpx;
        
        .transaction-title {
          font-size: 30rpx;
          font-weight: 600;
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          margin-right: 20rpx;
        }
        
        .transaction-amount {
          font-size: 32rpx;
          font-weight: bold;
          flex-shrink: 0;
          
          &.amount-positive {
            color: #4CAF50;
          }
          &.amount-negative {
            color: #F44336;
          }
        }
      }
      
      .transaction-meta {
        display: flex;
        justify-content: space-between;
        align-items: center;
        
        .transaction-time {
          font-size: 24rpx;
        }
        
        .transaction-status {
          font-size: 22rpx;
          padding: 4rpx 12rpx;
          border-radius: 10rpx;
          
          &.status-0 {
            background: #FFF3E0;
            color: #FF9800;
          }
          &.status-1 {
            background: #E8F5E9;
            color: #4CAF50;
          }
          &.status-2 {
            background: #FFEBEE;
            color: #F44336;
          }
          &.status-3 {
            background: #F5F5F5;
            color: #9E9E9E;
          }
        }
      }
    }
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80rpx 40rpx;
  
  .empty-icon-wrapper {
    width: 160rpx;
    height: 160rpx;
    border-radius: 50%;
    background: rgba(255, 107, 53, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 30rpx;
    
    .empty-icon {
      font-size: 80rpx;
    }
  }
  
  .empty-title {
    font-size: 32rpx;
    font-weight: 600;
    margin-bottom: 12rpx;
  }
  
  .empty-desc {
    font-size: 26rpx;
  }
}

.theme-switcher {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20rpx;
  padding: 30rpx;
  margin-top: 20rpx;
  
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