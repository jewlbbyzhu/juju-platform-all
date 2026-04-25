<template>
  <view class="invite-code-container">
    <view class="header">
      <text class="header-title">邀请好友</text>
      <text class="header-subtitle">邀请好友注册，双方均可获得奖励</text>
    </view>

    <view class="invite-card">
      <view class="card-header">
        <text class="card-title">我的邀请码</text>
        <text class="card-desc">分享给好友，双方各得奖励</text>
      </view>

      <view class="code-display">
        <text class="code-text">{{ inviteCode || '加载中...' }}</text>
        <button class="copy-btn" @tap="copyCode">
          <text>复制</text>
        </button>
      </view>

      <view class="share-actions">
        <button class="share-btn wechat" @tap="shareToWechat">
          <text class="share-icon">💬</text>
          <text class="share-text">微信好友</text>
        </button>
        <button class="share-btn moments" @tap="shareToMoments">
          <text class="share-icon">📱</text>
          <text class="share-text">朋友圈</text>
        </button>
        <button class="share-btn poster" @tap="generatePoster">
          <text class="share-icon">🖼️</text>
          <text class="share-text">生成海报</text>
        </button>
      </view>
    </view>

    <view class="stats-section">
      <text class="section-title">邀请统计</text>
      <view class="stats-grid">
        <view class="stat-item">
          <text class="stat-value">{{ stats.totalInvited || 0 }}</text>
          <text class="stat-label">累计邀请</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">{{ stats.successInvited || 0 }}</text>
          <text class="stat-label">成功注册</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">{{ stats.totalReward || 0 }}</text>
          <text class="stat-label">累计奖励</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">{{ stats.availableReward || 0 }}</text>
          <text class="stat-label">可提现</text>
        </view>
      </view>
    </view>

    <view class="rewards-section">
      <view class="section-header">
        <text class="section-title">奖励规则</text>
      </view>
      <view class="reward-list">
        <view class="reward-item">
          <view class="reward-icon">
            <text>🎁</text>
          </view>
          <view class="reward-content">
            <text class="reward-title">邀请者奖励</text>
            <text class="reward-desc">好友成功注册后，您可获得{{ inviteReward.inviter }}元奖励</text>
          </view>
        </view>
        <view class="reward-item">
          <view class="reward-icon">
            <text>🎉</text>
          </view>
          <view class="reward-content">
            <text class="reward-title">被邀请者奖励</text>
            <text class="reward-desc">好友注册成功后，可获得{{ inviteReward.invitee }}元奖励</text>
          </view>
        </view>
        <view class="reward-item">
          <view class="reward-icon">
            <text>📈</text>
          </view>
          <view class="reward-content">
            <text class="reward-title">额外奖励</text>
            <text class="reward-desc">好友完成首次消费，您再获得{{ inviteReward.extra }}元奖励</text>
          </view>
        </view>
      </view>
    </view>

    <view class="history-section">
      <view class="section-header">
        <text class="section-title">邀请记录</text>
        <text class="section-more" @tap="viewAllHistory">查看全部</text>
      </view>
      <view class="history-list">
        <view 
          class="history-item" 
          v-for="item in inviteHistory" 
          :key="item.id"
        >
          <view class="history-info">
            <text class="history-user">{{ item.invitee_nickname || '匿名用户' }}</text>
            <text class="history-time">{{ formatTime(item.created_at) }}</text>
          </view>
          <view class="history-status">
            <text 
              class="status-badge" 
              :class="item.status"
            >
              {{ getStatusText(item.status) }}
            </text>
            <text class="history-reward" v-if="item.status === 'completed'">
              +{{ item.reward }}元
            </text>
          </view>
        </view>
      </view>
    </view>

    <view class="withdraw-section" v-if="stats.availableReward > 0">
      <button class="withdraw-btn" @tap="withdraw">
        <text>提现 {{ stats.availableReward }}元</text>
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { inviteApi } from '@/api/invite.js'

const inviteCode = ref('')
const stats = ref({
  totalInvited: 0,
  successInvited: 0,
  totalReward: 0,
  availableReward: 0
})
const inviteReward = ref({
  inviter: 5,
  invitee: 3,
  extra: 10
})
const inviteHistory = ref([])

const loadInviteCode = async () => {
  try {
    const res = await inviteApi.getInviteCode()
    if (res.code === 0) {
      inviteCode.value = res.data.code
    }
  } catch (error) {
    // console.error('Failed to load invite code:', error)
  }
}

const loadInviteStats = async () => {
  try {
    const res = await inviteApi.getInviteStats()
    if (res.code === 0) {
      stats.value = res.data
    }
  } catch (error) {
    // console.error('Failed to load invite stats:', error)
  }
}

const loadInviteHistory = async () => {
  try {
    const res = await inviteApi.getInviteHistory({ page: 1, pageSize: 5 })
    if (res.code === 0) {
      inviteHistory.value = res.data.list || []
    }
  } catch (error) {
    // console.error('Failed to load invite history:', error)
  }
}

const copyCode = () => {
  uni.setClipboardData({
    data: inviteCode.value,
    success: () => {
      uni.showToast({
        title: '复制成功',
        icon: 'success'
      })
    }
  })
}

const shareToWechat = () => {
  uni.share({
    provider: 'weixin',
    scene: 'WXSceneSession',
    type: 0,
    title: '邀请你加入聚聚',
    summary: `使用我的邀请码${inviteCode.value}注册，双方均可获得奖励！`,
    href: `https://www.hfparty.asia/register?invite=${inviteCode.value}`
  })
}

const shareToMoments = () => {
  uni.share({
    provider: 'weixin',
    scene: 'WXSenceTimeline',
    type: 0,
    title: '邀请你加入聚聚',
    summary: `使用我的邀请码${inviteCode.value}注册，双方均可获得奖励！`,
    href: `https://www.hfparty.asia/register?invite=${inviteCode.value}`
  })
}

const generatePoster = () => {
  uni.navigateTo({
    url: '/pages/invite-poster/invite-poster'
  })
}

const withdraw = () => {
  uni.navigateTo({
    url: '/pages/withdraw/withdraw'
  })
}

const viewAllHistory = () => {
  uni.navigateTo({
    url: '/pages/invite-history/invite-history'
  })
}

const formatTime = (time) => {
  if (!time) return ''
  const date = new Date(time)
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  return `${month}月${day}日 ${hour}:${minute.toString().padStart(2, '0')}`
}

const getStatusText = (status) => {
  const statusMap = {
    pending: '待注册',
    registered: '已注册',
    completed: '已完成',
    failed: '已失效'
  }
  return statusMap[status] || status
}

onMounted(() => {
  loadInviteCode()
  loadInviteStats()
  loadInviteHistory()
})
</script>

<style lang="scss" scoped>
.invite-code-container {
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

.invite-card {
  margin: 30rpx;
  padding: 40rpx;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(0, 0, 0, 0) 100%);
  border-radius: 20rpx;
  border: 1rpx solid rgba(102, 126, 234, 0.3);
}

.card-header {
  margin-bottom: 30rpx;
}

.card-title {
  display: block;
  font-size: 32rpx;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 10rpx;
}

.card-desc {
  display: block;
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.6);
}

.code-display {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 15rpx;
  border: 2rpx dashed rgba(102, 126, 234, 0.5);
  margin-bottom: 30rpx;
}

.code-text {
  font-size: 48rpx;
  font-weight: bold;
  color: #667eea;
  letter-spacing: 5rpx;
}

.copy-btn {
  padding: 15rpx 30rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 25rpx;
  font-size: 26rpx;
  color: #ffffff;
  border: none;

  &::after {
    border: none;
  }
}

.share-actions {
  display: flex;
  gap: 15rpx;
}

.share-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10rpx;
  padding: 25rpx;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 15rpx;
  font-size: 24rpx;
  color: #ffffff;
  border: none;

  &::after {
    border: none;
  }
}

.share-btn.wechat {
  background: rgba(7, 193, 96, 0.1);
}

.share-btn.moments {
  background: rgba(7, 193, 96, 0.1);
}

.share-btn.poster {
  background: rgba(255, 193, 7, 0.1);
}

.share-icon {
  font-size: 40rpx;
}

.share-text {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.7);
}

.stats-section,
.rewards-section,
.history-section {
  margin: 30rpx;
  padding: 30rpx;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 20rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.05);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: 500;
  color: #ffffff;
}

.section-more {
  font-size: 24rpx;
  color: #667eea;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
}

.stat-item {
  text-align: center;
  padding: 30rpx;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 15rpx;
}

.stat-value {
  display: block;
  font-size: 48rpx;
  font-weight: bold;
  color: #d4af37;
  margin-bottom: 10rpx;
}

.stat-label {
  display: block;
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.6);
}

.reward-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.reward-item {
  display: flex;
  gap: 20rpx;
  padding: 20rpx;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 15rpx;
}

.reward-icon {
  font-size: 48rpx;
  flex-shrink: 0;
}

.reward-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.reward-title {
  font-size: 28rpx;
  font-weight: 500;
  color: #ffffff;
}

.reward-desc {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.5;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 15rpx;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 15rpx;
}

.history-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.history-user {
  font-size: 26rpx;
  color: #ffffff;
}

.history-time {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.5);
}

.history-status {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8rpx;
}

.status-badge {
  padding: 5rpx 15rpx;
  border-radius: 15rpx;
  font-size: 22rpx;
}

.status-badge.pending {
  background: rgba(255, 193, 7, 0.2);
  color: #ffc107;
}

.status-badge.registered {
  background: rgba(102, 126, 234, 0.2);
  color: #667eea;
}

.status-badge.completed {
  background: rgba(82, 196, 26, 0.2);
  color: #52c41a;
}

.status-badge.failed {
  background: rgba(255, 77, 79, 0.2);
  color: #ff4d4f;
}

.history-reward {
  font-size: 24rpx;
  color: #52c41a;
  font-weight: 500;
}

.withdraw-section {
  padding: 30rpx;
}

.withdraw-btn {
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
