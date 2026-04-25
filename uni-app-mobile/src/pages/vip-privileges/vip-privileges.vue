<template>
  <view class="vip-privileges-container">
    <view class="privilege-header">
      <text class="header-title">VIP特权</text>
      <text class="header-subtitle">尊享会员专属权益</text>
    </view>

    <view class="privilege-cards">
      <view class="privilege-card highlight">
        <view class="card-icon">
          <text class="icon-text">⚡</text>
        </view>
        <view class="card-content">
          <text class="card-title">快速审批</text>
          <text class="card-desc">聚会审批时间缩短至{{ vipInfo.approvalTimeHours }}小时</text>
          <view class="card-status" v-if="vipInfo.isVip">
            <text class="status-text">已生效</text>
          </view>
        </view>
      </view>

      <view class="privilege-card">
        <view class="card-icon">
          <text class="icon-text">🎫</text>
        </view>
        <view class="card-content">
          <text class="card-title">免费创建名额</text>
          <text class="card-desc">每月{{ vipInfo.freeCreateCount }}次免费创建聚会</text>
          <view class="card-progress">
            <view class="progress-bar">
              <view 
                class="progress-fill" 
                :style="{ width: (vipInfo.usedCreateCount / vipInfo.freeCreateCount * 100) + '%' }"
              ></view>
            </view>
            <text class="progress-text">{{ vipInfo.usedCreateCount }}/{{ vipInfo.freeCreateCount }}</text>
          </view>
        </view>
      </view>

      <view class="privilege-card">
        <view class="card-icon">
          <text class="icon-text">💰</text>
        </view>
        <view class="card-content">
          <text class="card-title">手续费优惠</text>
          <text class="card-desc">手续费降至{{ vipInfo.serviceFeePct }}%</text>
          <view class="card-compare">
            <text class="compare-label">普通用户:</text>
            <text class="compare-value">5%</text>
            <text class="compare-arrow">→</text>
            <text class="compare-highlight">{{ vipInfo.serviceFeePct }}%</text>
          </view>
        </view>
      </view>

      <view class="privilege-card">
        <view class="card-icon">
          <text class="icon-text">💬</text>
        </view>
        <view class="card-content">
          <text class="card-title">专属客服</text>
          <text class="card-desc">7x24小时VIP专属客服支持</text>
          <button class="card-btn" @tap="openCustomerService">
            <text>联系客服</text>
          </button>
        </view>
      </view>

      <view class="privilege-card">
        <view class="card-icon">
          <text class="icon-text">🎯</text>
        </view>
        <view class="card-content">
          <text class="card-title">优先推荐</text>
          <text class="card-desc">在推荐列表中优先展示</text>
          <view class="card-status" v-if="vipInfo.isVip">
            <text class="status-text">已生效</text>
          </view>
        </view>
      </view>

      <view class="privilege-card">
        <view class="card-icon">
          <text class="icon-text">🎁</text>
        </view>
        <view class="card-content">
          <text class="card-title">专属活动</text>
          <text class="card-desc">参与VIP专属活动，赢取丰厚奖励</text>
          <button class="card-btn" @tap="viewExclusiveEvents">
            <text>查看活动</text>
          </button>
        </view>
      </view>
    </view>

    <view class="usage-stats" v-if="vipInfo.isVip">
      <text class="stats-title">本月使用情况</text>
      <view class="stats-grid">
        <view class="stat-item">
          <text class="stat-value">{{ vipInfo.usedCreateCount }}</text>
          <text class="stat-label">已使用名额</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">{{ vipInfo.freeCreateCount - vipInfo.usedCreateCount }}</text>
          <text class="stat-label">剩余名额</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">{{ vipInfo.approvalTimeHours }}h</text>
          <text class="stat-label">审批时间</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">{{ vipInfo.serviceFeePct }}%</text>
          <text class="stat-label">手续费</text>
        </view>
      </view>
    </view>

    <view class="upgrade-tip" v-if="!vipInfo.isVip">
      <text class="tip-text">开通VIP即可享受以上特权</text>
      <button class="upgrade-btn" @tap="goToVip">
        <text>立即开通</text>
      </button>
    </view>
  </view>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

const vipInfo = computed(() => userStore.vipInfo || {
  isVip: false,
  vipType: null,
  vipExpireTime: null,
  freeCreateCount: 0,
  usedCreateCount: 0,
  serviceFeePct: 5,
  approvalTimeHours: 12
})

const openCustomerService = () => {
  uni.showModal({
    title: '联系客服',
    content: 'VIP专属客服\n\n工作时间：7x24小时\n联系方式：400-888-8888',
    showCancel: false,
    confirmText: '确定'
  })
}

const viewExclusiveEvents = () => {
  uni.navigateTo({
    url: '/pages/vip-events/vip-events'
  })
}

const goToVip = () => {
  uni.navigateTo({
    url: '/pages/vip/vip'
  })
}

onMounted(() => {
  userStore.fetchUserInfo()
})
</script>

<style lang="scss" scoped>
.vip-privileges-container {
  min-height: 100vh;
  background: #000000;
}

.privilege-header {
  padding: 60rpx 40rpx 40rpx;
  background: linear-gradient(180deg, rgba(212, 175, 55, 0.2) 0%, rgba(0, 0, 0, 0) 100%);
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

.privilege-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
  padding: 30rpx;
}

.privilege-card {
  background: rgba(255, 255, 255, 0.02);
  border-radius: 20rpx;
  padding: 30rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.05);
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.privilege-card.highlight {
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(0, 0, 0, 0) 100%);
  border-color: rgba(212, 175, 55, 0.3);
}

.card-icon {
  width: 80rpx;
  height: 80rpx;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-text {
  font-size: 40rpx;
}

.card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.card-title {
  font-size: 30rpx;
  font-weight: 500;
  color: #ffffff;
}

.card-desc {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.5;
}

.card-status {
  align-self: flex-start;
  padding: 8rpx 20rpx;
  background: rgba(82, 196, 26, 0.2);
  border-radius: 20rpx;
  margin-top: 10rpx;
}

.status-text {
  font-size: 22rpx;
  color: #52c41a;
  font-weight: 500;
}

.card-progress {
  display: flex;
  align-items: center;
  gap: 15rpx;
  margin-top: 10rpx;
}

.progress-bar {
  flex: 1;
  height: 8rpx;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  border-radius: 4rpx;
  transition: width 0.3s;
}

.progress-text {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.7);
}

.card-compare {
  display: flex;
  align-items: center;
  gap: 10rpx;
  margin-top: 10rpx;
}

.compare-label {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.5);
}

.compare-value {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.5);
  text-decoration: line-through;
}

.compare-arrow {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.5);
}

.compare-highlight {
  font-size: 24rpx;
  color: #d4af37;
  font-weight: 500;
}

.card-btn {
  align-self: flex-start;
  padding: 15rpx 30rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 25rpx;
  font-size: 26rpx;
  color: #ffffff;
  border: none;
  margin-top: 10rpx;

  &::after {
    border: none;
  }
}

.usage-stats {
  margin: 30rpx;
  padding: 30rpx;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 20rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.05);
}

.stats-title {
  display: block;
  font-size: 28rpx;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 30rpx;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 30rpx;
}

.stat-item {
  text-align: center;
  padding: 20rpx;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 15rpx;
}

.stat-value {
  display: block;
  font-size: 40rpx;
  font-weight: bold;
  color: #d4af37;
  margin-bottom: 10rpx;
}

.stat-label {
  display: block;
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.6);
}

.upgrade-tip {
  margin: 30rpx;
  padding: 40rpx;
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(0, 0, 0, 0) 100%);
  border-radius: 20rpx;
  border: 1rpx solid rgba(212, 175, 55, 0.3);
  text-align: center;
}

.tip-text {
  display: block;
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 30rpx;
}

.upgrade-btn {
  width: 100%;
  padding: 30rpx;
  background: linear-gradient(135deg, #d4af37 0%, #c9a227 100%);
  border-radius: 30rpx;
  font-size: 30rpx;
  font-weight: bold;
  color: #ffffff;
  border: none;

  &::after {
    border: none;
  }
}
</style>
