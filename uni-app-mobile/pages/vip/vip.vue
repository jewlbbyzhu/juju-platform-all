<template>
  <view class="vip-container" :class="currentThemeClass">
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
    
    <!-- VIP头部 -->
    <view class="vip-header">
      <view class="vip-header-content">
        <view class="crown-wrapper">
          <text class="crown-icon">👑</text>
          <view class="crown-glow"></view>
        </view>
        <text class="vip-title">VIP会员</text>
        <text class="vip-subtitle">尊享特权，畅玩聚会</text>
      </view>
    </view>

    <!-- VIP状态卡片 -->
    <view class="vip-status-card" v-if="isVip">
      <view class="status-header">
        <view class="vip-badge">
          <text class="badge-icon">✨</text>
          <text class="badge-text">{{ getVipLevelText(userInfo?.vip_level) }}</text>
        </view>
        <text class="vip-expire">有效期至 {{ formatDateTime(userInfo?.vip_expires_at) }}</text>
      </view>
      <view class="vip-progress">
        <view class="progress-bar">
          <view class="progress-fill" :style="{ width: vipProgress + '%' }"></view>
        </view>
        <text class="progress-text">剩余 {{ remainingDays }} 天</text>
      </view>
      <view class="vip-privileges-preview">
        <view class="privilege-tag" v-for="(privilege, index) in activePrivileges" :key="index">
          <text class="tag-icon">{{ privilege.icon }}</text>
          <text class="tag-text">{{ privilege.name }}</text>
        </view>
      </view>
    </view>

    <!-- 套餐选择 -->
    <view class="packages-section">
      <view class="section-header">
        <text class="section-title">选择套餐</text>
        <text class="section-subtitle">开通VIP享受更多特权</text>
      </view>

      <view class="packages-list">
        <view 
          v-for="(pkg, index) in packages" 
          :key="pkg.id"
          class="package-card" 
          :class="{ 
            selected: selectedPackage === pkg.id, 
            recommended: pkg.recommended 
          }"
          :style="{ animationDelay: index * 0.1 + 's' }"
          @tap="selectPackage(pkg.id)"
        >
          <view v-if="pkg.recommended" class="recommend-badge">
            <text>推荐</text>
          </view>
          <view v-if="pkg.popular" class="popular-badge">
            <text>热门</text>
          </view>
          
          <view class="package-main">
            <view class="package-info">
              <text class="package-name">{{ pkg.name }}</text>
              <text class="package-period">{{ pkg.periodText }}</text>
            </view>
            <view class="package-price-wrapper">
              <text class="price-symbol">¥</text>
              <text class="package-price">{{ pkg.price }}</text>
              <text class="price-unit">/{{ getUnit(pkg.period) }}</text>
            </view>
          </view>
          
          <view class="package-features">
            <view class="feature-item" v-for="(feature, fIndex) in pkg.features" :key="fIndex">
              <text class="feature-check">✓</text>
              <text class="feature-text">{{ feature }}</text>
            </view>
          </view>
          
          <view class="package-footer">
            <view class="save-badge">
              <text>省¥{{ pkg.save }}</text>
            </view>
            <button 
              class="buy-btn" 
              :class="{ active: selectedPackage === pkg.id }"
              @tap.stop="buyPackage(pkg.id)"
            >
              <text>{{ isVip ? '续费' : '开通' }}</text>
            </button>
          </view>
        </view>
      </view>
    </view>

    <!-- 会员特权 -->
    <view class="privileges-section">
      <view class="section-header">
        <text class="section-title">会员特权</text>
        <text class="section-subtitle">{{ isVip ? '您正在享受以下特权' : '开通后即可享受' }}</text>
      </view>

      <view class="privileges-grid">
        <view 
          class="privilege-item" 
          v-for="(privilege, index) in allPrivileges" 
          :key="index"
          :class="{ active: isVip && privilege.active }"
        >
          <view class="privilege-icon-wrapper">
            <text class="privilege-icon">{{ privilege.icon }}</text>
          </view>
          <text class="privilege-name">{{ privilege.name }}</text>
          <text class="privilege-desc">{{ privilege.desc }}</text>
          <view v-if="isVip && privilege.active" class="active-indicator">
            <text>✓</text>
          </view>
        </view>
      </view>
    </view>

    <!-- FAQ -->
    <view class="faq-section">
      <view class="section-header">
        <text class="section-title">常见问题</text>
      </view>

      <view class="faq-list">
        <view 
          class="faq-item" 
          v-for="(faq, index) in faqList" 
          :key="index"
          :class="{ expanded: faqExpanded[index] }"
          @tap="toggleFaq(index)"
        >
          <view class="faq-header">
            <view class="faq-icon-wrapper">
              <text class="faq-icon">{{ faqExpanded[index] ? '−' : '+' }}</text>
            </view>
            <text class="faq-question">{{ faq.question }}</text>
          </view>
          <view class="faq-answer" v-show="faqExpanded[index]">
            <text>{{ faq.answer }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 协议 -->
    <view class="agreement-section">
      <text class="agreement-text">开通即表示同意</text>
      <text class="agreement-link" @tap="showAgreement">《VIP会员服务协议》</text>
    </view>

    <!-- 底部按钮 -->
    <view class="vip-footer" v-if="isVip">
      <button class="history-btn" @tap="viewHistory">
        <text class="btn-icon">📋</text>
        <text>查看订阅历史</text>
      </button>
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

<script setup>
import { ref, computed, onMounted } from 'vue'
import { vipApi } from '@/api/vip.js'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

const selectedPackage = ref('monthly')
const faqExpanded = ref([false, false, false])
const loading = ref(false)
const currentTheme = ref('neon')

const themes = [
  { label: '霓虹', value: 'neon' },
  { label: '简约', value: 'minimal' },
  { label: '暗色', value: 'dark' },
  { label: '活力', value: 'vibrant' }
]

const packages = ref([
  {
    id: 'monthly',
    name: '月卡',
    price: 29,
    period: 30,
    periodText: '30天',
    save: 5,
    features: ['免手续费', '专属客服', '优先报名'],
    recommended: true,
    popular: false
  },
  {
    id: 'quarterly',
    name: '季卡',
    price: 79,
    period: 90,
    periodText: '90天',
    save: 8,
    features: ['免手续费', '专属客服', '优先报名', '专属活动'],
    recommended: false,
    popular: true
  },
  {
    id: 'yearly',
    name: '年卡',
    price: 299,
    period: 365,
    periodText: '365天',
    save: 49,
    features: ['免手续费', '专属客服', '优先报名', '专属活动', '生日特权'],
    recommended: false,
    popular: false
  }
])

const allPrivileges = ref([
  { icon: '💰', name: '免手续费', desc: '钱包充值提现免手续费', active: true },
  { icon: '🎫', name: '优先报名', desc: '热门聚会优先报名权', active: true },
  { icon: '🎉', name: '专属活动', desc: 'VIP专属聚会活动', active: true },
  { icon: '🎁', name: '生日特权', desc: '生日月专属优惠', active: false },
  { icon: '💬', name: '专属客服', desc: '24小时专属客服', active: true },
  { icon: '📊', name: '数据统计', desc: '详细的数据分析报告', active: false }
])

const faqList = ref([
  {
    question: 'VIP会员有哪些特权？',
    answer: 'VIP会员享受免手续费、优先报名、专属活动、生日特权、专属客服等多项特权，让您畅玩聚会无压力。'
  },
  {
    question: 'VIP会员如何收费？',
    answer: 'VIP会员采用订阅制，月卡29元/月，季卡79元/季，年卡299元/年。开通后自动续费，可随时取消。'
  },
  {
    question: 'VIP会员可以退款吗？',
    answer: 'VIP会员开通后7天内可无理由退款，超过7天不支持退款。退款后会员权益立即失效。'
  }
])

const userInfo = computed(() => userStore.userInfo)
const isVip = computed(() => userStore.getIsVip)
const currentThemeClass = computed(() => `theme-${currentTheme.value}`)

const activePrivileges = computed(() => {
  return allPrivileges.value.filter(p => p.active).slice(0, 4)
})

const remainingDays = computed(() => {
  if (!userInfo.value?.vip_expires_at) return 0
  const expireDate = new Date(userInfo.value.vip_expires_at)
  const now = new Date()
  const diff = expireDate - now
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
})

const vipProgress = computed(() => {
  if (!isVip.value || !userInfo.value?.vip_start_at || !userInfo.value?.vip_expires_at) return 0
  const start = new Date(userInfo.value.vip_start_at).getTime()
  const end = new Date(userInfo.value.vip_expires_at).getTime()
  const now = Date.now()
  const total = end - start
  const passed = now - start
  return Math.max(0, Math.min(100, (passed / total) * 100))
})

const switchTheme = (theme) => {
  currentTheme.value = theme
}

const getUnit = (period) => {
  if (period >= 365) return '年'
  if (period >= 90) return '季'
  return '月'
}

const selectPackage = (pkgId) => {
  selectedPackage.value = pkgId
}

const buyPackage = async (pkgId) => {
  const packageData = packages.value.find(p => p.id === pkgId)
  if (!packageData) return

  uni.showModal({
    title: isVip.value ? '确认续费' : '确认开通',
    content: `确定要${isVip.value ? '续费' : '开通'}${packageData.name}吗？\n\n价格：¥${packageData.price}\n有效期：${packageData.periodText}`,
    confirmText: '确认支付',
    success: async (res) => {
      if (res.confirm) {
        loading.value = true
        try {
          const apiCall = isVip.value ? vipApi.renewSubscription : vipApi.subscribe
          const result = await apiCall(pkgId, { paymentMethod: 'wechat' })

          if (result.code === 0) {
            const { paymentParams } = result.data
            uni.requestPayment({
              provider: 'wxpay',
              ...paymentParams,
              success: async () => {
                uni.showToast({
                  title: isVip.value ? '续费成功' : '开通成功',
                  icon: 'success'
                })
                await userStore.fetchUserInfo()
              },
              fail: () => {
                uni.showToast({ title: '支付失败', icon: 'none' })
              }
            })
          } else {
            uni.showToast({ title: result.message || '操作失败', icon: 'none' })
          }
        } catch (error) {
          uni.showToast({ title: error.message || '网络错误', icon: 'none' })
        } finally {
          loading.value = false
        }
      }
    }
  })
}

const toggleFaq = (index) => {
  faqExpanded.value[index] = !faqExpanded.value[index]
}

const showAgreement = () => {
  uni.navigateTo({ url: '/pages/vip-agreement/vip-agreement' })
}

const viewHistory = () => {
  uni.navigateTo({ url: '/pages/vip-history/vip-history' })
}

const getVipLevelText = (level) => {
  const levelMap = { monthly: '月付VIP', quarterly: '季付VIP', yearly: '年付VIP' }
  return levelMap[level] || 'VIP会员'
}

const formatDateTime = (time) => {
  if (!time) return ''
  const date = new Date(time)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

onMounted(() => {
  userStore.fetchUserInfo()
})
</script>

<style lang="scss" scoped>
// ========== 动画定义 ==========
@keyframes slideUp {
  from { opacity: 0; transform: translateY(30rpx); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-15rpx) rotate(3deg); }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.1); opacity: 1; }
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

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

// ========== 基础容器 ==========
.vip-container {
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
      background: radial-gradient(circle, rgba(255, 215, 0, 0.3) 0%, transparent 70%);
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
        background: #FFD700;
        border-radius: 50%;
        box-shadow: 0 0 10rpx #FFD700, 0 0 20rpx #FFD700;
        animation: particleFloat 8s linear infinite;
        
        &:nth-child(1) { left: 10%; animation-delay: 0s; }
        &:nth-child(2) { left: 25%; animation-delay: 1s; background: #FFA500; box-shadow: 0 0 10rpx #FFA500, 0 0 20rpx #FFA500; }
        &:nth-child(3) { left: 40%; animation-delay: 2s; }
        &:nth-child(4) { left: 60%; animation-delay: 3s; background: #FF6B35; box-shadow: 0 0 10rpx #FF6B35, 0 0 20rpx #FF6B35; }
        &:nth-child(5) { left: 75%; animation-delay: 4s; }
        &:nth-child(6) { left: 90%; animation-delay: 5s; background: #FF8E53; box-shadow: 0 0 10rpx #FF8E53, 0 0 20rpx #FF8E53; }
      }
    }
  }
  
  .vip-header {
    background: linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF6B35 100%);
    position: relative;
    z-index: 1;
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(90deg, transparent 50%, rgba(255,255,255,0.05) 50%);
      background-size: 40rpx 40rpx;
      pointer-events: none;
    }
    
    .crown-wrapper {
      .crown-glow {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 160rpx;
        height: 160rpx;
        background: radial-gradient(circle, rgba(255, 215, 0, 0.5) 0%, transparent 70%);
        animation: pulse 2s ease-in-out infinite;
      }
    }
  }
  
  .vip-status-card {
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    border: 2rpx solid rgba(255, 215, 0, 0.3);
    box-shadow: 0 0 40rpx rgba(255, 215, 0, 0.2);
    
    .vip-badge {
      background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
      box-shadow: 0 4rpx 20rpx rgba(255, 215, 0, 0.4);
    }
    
    .progress-fill {
      background: linear-gradient(90deg, #FFD700 0%, #FFA500 100%);
      box-shadow: 0 0 10rpx rgba(255, 215, 0, 0.5);
    }
    
    .privilege-tag {
      background: rgba(255, 215, 0, 0.15);
      border: 1rpx solid rgba(255, 215, 0, 0.3);
    }
  }
  
  .packages-section {
    .section-title {
      color: #ffffff;
    }
    .section-subtitle {
      color: rgba(255, 255, 255, 0.6);
    }
    
    .package-card {
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      border: 2rpx solid rgba(255, 255, 255, 0.1);
      
      &.selected {
        border-color: #FFD700;
        box-shadow: 0 0 30rpx rgba(255, 215, 0, 0.3);
      }
      
      .package-name {
        color: #ffffff;
      }
      .package-price {
        color: #FFD700;
      }
      .feature-text {
        color: rgba(255, 255, 255, 0.7);
      }
      .buy-btn {
        background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
        box-shadow: 0 4rpx 20rpx rgba(255, 215, 0, 0.4);
      }
    }
  }
  
  .privileges-section {
    .section-title {
      color: #ffffff;
    }
    .section-subtitle {
      color: rgba(255, 255, 255, 0.6);
    }
    .privilege-item {
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      border: 1rpx solid rgba(255, 255, 255, 0.1);
      
      &.active {
        border-color: rgba(255, 215, 0, 0.5);
        background: linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 165, 0, 0.1) 100%);
      }
      
      .privilege-name {
        color: #ffffff;
      }
      .privilege-desc {
        color: rgba(255, 255, 255, 0.6);
      }
      .active-indicator {
        background: #FFD700;
        color: #000000;
      }
    }
  }
  
  .faq-section {
    .section-title {
      color: #ffffff;
    }
    .faq-item {
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      border: 1rpx solid rgba(255, 255, 255, 0.1);
      
      .faq-question {
        color: #ffffff;
      }
      .faq-answer {
        color: rgba(255, 255, 255, 0.7);
      }
      .faq-icon-wrapper {
        background: rgba(255, 215, 0, 0.2);
        color: #FFD700;
      }
    }
  }
  
  .agreement-section {
    .agreement-text {
      color: rgba(255, 255, 255, 0.6);
    }
    .agreement-link {
      color: #FFD700;
    }
  }
  
  .history-btn {
    background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
    color: #000000;
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
        background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
        color: #000000;
        box-shadow: 0 0 20rpx rgba(255, 215, 0, 0.5);
      }
    }
  }
}

// ========== 简约主题 ==========
.theme-minimal {
  background: #f8f9fa;
  
  .vip-header {
    background: linear-gradient(135deg, #495057 0%, #212529 100%);
    
    .vip-title {
      color: #ffffff;
    }
    .vip-subtitle {
      color: rgba(255, 255, 255, 0.8);
    }
  }
  
  .vip-status-card {
    background: #ffffff;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
    
    .vip-badge {
      background: #212529;
    }
    .vip-expire {
      color: #6c757d;
    }
    .progress-fill {
      background: #212529;
    }
    .progress-text {
      color: #6c757d;
    }
    .privilege-tag {
      background: #f8f9fa;
      color: #495057;
    }
  }
  
  .packages-section {
    .section-title {
      color: #212529;
    }
    .section-subtitle {
      color: #6c757d;
    }
    
    .package-card {
      background: #ffffff;
      box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
      border: 2rpx solid transparent;
      
      &.selected {
        border-color: #212529;
      }
      
      .recommend-badge {
        background: #212529;
      }
      .popular-badge {
        background: #FF6B35;
      }
      .package-name {
        color: #212529;
      }
      .package-price {
        color: #212529;
      }
      .feature-text {
        color: #6c757d;
      }
      .buy-btn {
        background: #212529;
        &.active {
          background: #FF6B35;
        }
      }
    }
  }
  
  .privileges-section {
    .section-title {
      color: #212529;
    }
    .section-subtitle {
      color: #6c757d;
    }
    .privilege-item {
      background: #ffffff;
      box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
      
      &.active {
        border: 2rpx solid #212529;
      }
      
      .privilege-name {
        color: #212529;
      }
      .privilege-desc {
        color: #6c757d;
      }
      .active-indicator {
        background: #212529;
        color: #ffffff;
      }
    }
  }
  
  .faq-section {
    .section-title {
      color: #212529;
    }
    .faq-item {
      background: #ffffff;
      box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
      
      .faq-question {
        color: #212529;
      }
      .faq-answer {
        color: #6c757d;
      }
      .faq-icon-wrapper {
        background: #f8f9fa;
        color: #212529;
      }
    }
  }
  
  .agreement-section {
    .agreement-text {
      color: #6c757d;
    }
    .agreement-link {
      color: #212529;
    }
  }
  
  .history-btn {
    background: #212529;
    color: #ffffff;
  }
  
  .theme-switcher {
    background: #ffffff;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
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
  
  .vip-header {
    background: linear-gradient(135deg, #2d2d2d 0%, #1e1e1e 100%);
    
    .vip-title {
      color: #e0e0e0;
    }
    .vip-subtitle {
      color: rgba(255, 255, 255, 0.6);
    }
  }
  
  .vip-status-card {
    background: #1e1e1e;
    
    .vip-badge {
      background: #FF6B35;
    }
    .vip-expire {
      color: rgba(255, 255, 255, 0.5);
    }
    .progress-fill {
      background: #FF6B35;
    }
    .progress-text {
      color: rgba(255, 255, 255, 0.6);
    }
    .privilege-tag {
      background: #2d2d2d;
      color: #e0e0e0;
    }
  }
  
  .packages-section {
    .section-title {
      color: #e0e0e0;
    }
    .section-subtitle {
      color: rgba(255, 255, 255, 0.5);
    }
    
    .package-card {
      background: #1e1e1e;
      border: 2rpx solid transparent;
      
      &.selected {
        border-color: #FF6B35;
      }
      
      .package-name {
        color: #e0e0e0;
      }
      .package-price {
        color: #FF6B35;
      }
      .feature-text {
        color: rgba(255, 255, 255, 0.6);
      }
      .buy-btn {
        background: #FF6B35;
      }
    }
  }
  
  .privileges-section {
    .section-title {
      color: #e0e0e0;
    }
    .section-subtitle {
      color: rgba(255, 255, 255, 0.5);
    }
    .privilege-item {
      background: #1e1e1e;
      
      &.active {
        border: 2rpx solid #FF6B35;
      }
      
      .privilege-name {
        color: #e0e0e0;
      }
      .privilege-desc {
        color: rgba(255, 255, 255, 0.5);
      }
      .active-indicator {
        background: #FF6B35;
        color: #ffffff;
      }
    }
  }
  
  .faq-section {
    .section-title {
      color: #e0e0e0;
    }
    .faq-item {
      background: #1e1e1e;
      
      .faq-question {
        color: #e0e0e0;
      }
      .faq-answer {
        color: rgba(255, 255, 255, 0.6);
      }
      .faq-icon-wrapper {
        background: #2d2d2d;
        color: #FF6B35;
      }
    }
  }
  
  .agreement-section {
    .agreement-text {
      color: rgba(255, 255, 255, 0.5);
    }
    .agreement-link {
      color: #FF6B35;
    }
  }
  
  .history-btn {
    background: #FF6B35;
    color: #ffffff;
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
  
  .vip-header {
    background: linear-gradient(135deg, #FF6B35 0%, #FF8E53 50%, #FFB347 100%);
    position: relative;
    z-index: 1;
    
    .vip-title {
      color: #ffffff;
      text-shadow: 2rpx 2rpx 4rpx rgba(0, 0, 0, 0.2);
    }
    .vip-subtitle {
      color: rgba(255, 255, 255, 0.95);
    }
  }
  
  .vip-status-card {
    background: #ffffff;
    box-shadow: 0 8rpx 40rpx rgba(255, 107, 53, 0.15);
    
    .vip-badge {
      background: linear-gradient(135deg, #FF6B35 0%, #FF8E53 100%);
    }
    .vip-expire {
      color: #666666;
    }
    .progress-fill {
      background: linear-gradient(90deg, #FF6B35 0%, #FF8E53 100%);
    }
    .progress-text {
      color: #FF6B35;
    }
    .privilege-tag {
      background: linear-gradient(135deg, #FFF5E5 0%, #ffffff 100%);
      color: #FF6B35;
      border: 1rpx solid rgba(255, 107, 53, 0.2);
    }
  }
  
  .packages-section {
    .section-title {
      color: #333333;
    }
    .section-subtitle {
      color: #666666;
    }
    
    .package-card {
      background: #ffffff;
      box-shadow: 0 8rpx 30rpx rgba(0, 0, 0, 0.08);
      border: 3rpx solid transparent;
      
      &.selected {
        border-color: #FF6B35;
        box-shadow: 0 8rpx 40rpx rgba(255, 107, 53, 0.2);
      }
      
      .recommend-badge {
        background: linear-gradient(135deg, #FF6B35 0%, #FF8E53 100%);
      }
      .popular-badge {
        background: linear-gradient(135deg, #6BCB77 0%, #4D96FF 100%);
      }
      .package-name {
        color: #333333;
      }
      .package-price {
        color: #FF6B35;
      }
      .feature-text {
        color: #666666;
      }
      .buy-btn {
        background: linear-gradient(135deg, #FF6B35 0%, #FF8E53 100%);
        box-shadow: 0 4rpx 20rpx rgba(255, 107, 53, 0.3);
      }
    }
  }
  
  .privileges-section {
    .section-title {
      color: #333333;
    }
    .section-subtitle {
      color: #666666;
    }
    .privilege-item {
      background: #ffffff;
      box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
      border: 2rpx solid transparent;
      
      &.active {
        border-color: #FF6B35;
        background: linear-gradient(135deg, #FFF5E5 0%, #ffffff 100%);
      }
      
      .privilege-name {
        color: #333333;
      }
      .privilege-desc {
        color: #666666;
      }
      .active-indicator {
        background: linear-gradient(135deg, #FF6B35 0%, #FF8E53 100%);
        color: #ffffff;
      }
    }
  }
  
  .faq-section {
    .section-title {
      color: #333333;
    }
    .faq-item {
      background: #ffffff;
      box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
      
      .faq-question {
        color: #333333;
      }
      .faq-answer {
        color: #666666;
      }
      .faq-icon-wrapper {
        background: linear-gradient(135deg, #FFF5E5 0%, #ffffff 100%);
        color: #FF6B35;
      }
    }
  }
  
  .agreement-section {
    .agreement-text {
      color: #666666;
    }
    .agreement-link {
      color: #FF6B35;
    }
  }
  
  .history-btn {
    background: linear-gradient(135deg, #FF6B35 0%, #FF8E53 100%);
    color: #ffffff;
    box-shadow: 0 4rpx 20rpx rgba(255, 107, 53, 0.3);
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
.vip-header {
  padding: 80rpx 40rpx;
  text-align: center;
  
  .vip-header-content {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  .crown-wrapper {
    position: relative;
    margin-bottom: 30rpx;
    
    .crown-icon {
      font-size: 100rpx;
      position: relative;
      z-index: 1;
      animation: float 3s ease-in-out infinite;
    }
  }
  
  .vip-title {
    font-size: 48rpx;
    font-weight: bold;
    margin-bottom: 15rpx;
  }
  
  .vip-subtitle {
    font-size: 28rpx;
  }
}

.vip-status-card {
  margin: -40rpx 30rpx 30rpx;
  padding: 40rpx;
  border-radius: 24rpx;
  position: relative;
  z-index: 2;
  animation: slideUp 0.5s ease both;
  
  .status-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30rpx;
    
    .vip-badge {
      display: flex;
      align-items: center;
      gap: 10rpx;
      padding: 12rpx 24rpx;
      border-radius: 30rpx;
      
      .badge-icon {
        font-size: 24rpx;
      }
      .badge-text {
        font-size: 26rpx;
        font-weight: bold;
      }
    }
    
    .vip-expire {
      font-size: 24rpx;
    }
  }
  
  .vip-progress {
    margin-bottom: 30rpx;
    
    .progress-bar {
      height: 12rpx;
      background: rgba(0, 0, 0, 0.1);
      border-radius: 6rpx;
      overflow: hidden;
      margin-bottom: 15rpx;
      
      .progress-fill {
        height: 100%;
        border-radius: 6rpx;
        transition: width 0.5s ease;
      }
    }
    
    .progress-text {
      font-size: 24rpx;
    }
  }
  
  .vip-privileges-preview {
    display: flex;
    flex-wrap: wrap;
    gap: 15rpx;
    
    .privilege-tag {
      display: flex;
      align-items: center;
      gap: 8rpx;
      padding: 10rpx 20rpx;
      border-radius: 20rpx;
      font-size: 22rpx;
      
      .tag-icon {
        font-size: 20rpx;
      }
    }
  }
}

.packages-section {
  padding: 30rpx;
  
  .section-header {
    margin-bottom: 30rpx;
    
    .section-title {
      font-size: 36rpx;
      font-weight: bold;
      display: block;
      margin-bottom: 10rpx;
    }
    .section-subtitle {
      font-size: 26rpx;
    }
  }
  
  .packages-list {
    display: flex;
    flex-direction: column;
    gap: 30rpx;
  }
  
  .package-card {
    padding: 40rpx;
    border-radius: 24rpx;
    position: relative;
    animation: slideUp 0.5s ease both;
    transition: all 0.3s ease;
    
    &:active {
      transform: scale(0.98);
    }
    
    .recommend-badge,
    .popular-badge {
      position: absolute;
      top: -12rpx;
      left: 30rpx;
      padding: 8rpx 24rpx;
      border-radius: 20rpx;
      font-size: 22rpx;
      font-weight: bold;
      color: #ffffff;
    }
    
    .popular-badge {
      left: auto;
      right: 30rpx;
    }
    
    .package-main {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 30rpx;
      
      .package-info {
        .package-name {
          font-size: 36rpx;
          font-weight: bold;
          display: block;
          margin-bottom: 10rpx;
        }
        .package-period {
          font-size: 24rpx;
          opacity: 0.7;
        }
      }
      
      .package-price-wrapper {
        display: flex;
        align-items: baseline;
        
        .price-symbol {
          font-size: 32rpx;
          font-weight: bold;
          margin-right: 5rpx;
        }
        .package-price {
          font-size: 56rpx;
          font-weight: bold;
        }
        .price-unit {
          font-size: 24rpx;
          opacity: 0.7;
          margin-left: 5rpx;
        }
      }
    }
    
    .package-features {
      display: flex;
      flex-wrap: wrap;
      gap: 15rpx;
      margin-bottom: 30rpx;
      
      .feature-item {
        display: flex;
        align-items: center;
        gap: 8rpx;
        font-size: 24rpx;
        
        .feature-check {
          font-size: 20rpx;
        }
      }
    }
    
    .package-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .save-badge {
        padding: 8rpx 20rpx;
        background: rgba(76, 175, 80, 0.1);
        border-radius: 20rpx;
        
        text {
          font-size: 24rpx;
          color: #4CAF50;
          font-weight: 600;
        }
      }
      
      .buy-btn {
        padding: 20rpx 40rpx;
        border-radius: 40rpx;
        font-size: 28rpx;
        font-weight: bold;
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
  }
}

.privileges-section {
  padding: 30rpx;
  
  .section-header {
    margin-bottom: 30rpx;
    
    .section-title {
      font-size: 36rpx;
      font-weight: bold;
      display: block;
      margin-bottom: 10rpx;
    }
    .section-subtitle {
      font-size: 26rpx;
    }
  }
  
  .privileges-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20rpx;
  }
  
  .privilege-item {
    padding: 30rpx;
    border-radius: 20rpx;
    text-align: center;
    position: relative;
    transition: all 0.3s ease;
    
    &:active {
      transform: scale(0.98);
    }
    
    .privilege-icon-wrapper {
      width: 90rpx;
      height: 90rpx;
      border-radius: 24rpx;
      background: rgba(255, 107, 53, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20rpx;
      
      .privilege-icon {
        font-size: 48rpx;
      }
    }
    
    .privilege-name {
      font-size: 28rpx;
      font-weight: bold;
      display: block;
      margin-bottom: 10rpx;
    }
    
    .privilege-desc {
      font-size: 22rpx;
      display: block;
      line-height: 1.4;
    }
    
    .active-indicator {
      position: absolute;
      top: 15rpx;
      right: 15rpx;
      width: 36rpx;
      height: 36rpx;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20rpx;
    }
  }
}

.faq-section {
  padding: 30rpx;
  
  .section-header {
    margin-bottom: 30rpx;
    
    .section-title {
      font-size: 36rpx;
      font-weight: bold;
    }
  }
  
  .faq-list {
    display: flex;
    flex-direction: column;
    gap: 20rpx;
  }
  
  .faq-item {
    border-radius: 20rpx;
    overflow: hidden;
    transition: all 0.3s ease;
    
    .faq-header {
      display: flex;
      align-items: center;
      padding: 30rpx;
      
      .faq-icon-wrapper {
        width: 48rpx;
        height: 48rpx;
        border-radius: 12rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 20rpx;
        flex-shrink: 0;
        
        .faq-icon {
          font-size: 28rpx;
          font-weight: bold;
        }
      }
      
      .faq-question {
        flex: 1;
        font-size: 28rpx;
        font-weight: 600;
      }
    }
    
    .faq-answer {
      padding: 0 30rpx 30rpx 98rpx;
      font-size: 26rpx;
      line-height: 1.6;
    }
  }
}

.agreement-section {
  padding: 40rpx;
  text-align: center;
  
  .agreement-text {
    font-size: 24rpx;
  }
  
  .agreement-link {
    font-size: 24rpx;
    text-decoration: underline;
  }
}

.vip-footer {
  padding: 30rpx;
  
  .history-btn {
    width: 100%;
    padding: 30rpx;
    border-radius: 50rpx;
    font-size: 30rpx;
    font-weight: 600;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 15rpx;
    transition: all 0.3s ease;
    
    &::after {
      border: none;
    }
    
    &:active {
      transform: scale(0.98);
    }
    
    .btn-icon {
      font-size: 32rpx;
    }
  }
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