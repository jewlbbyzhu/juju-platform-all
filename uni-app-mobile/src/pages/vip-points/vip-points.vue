<template>
  <view class="vip-points-container">
    <view class="header">
      <text class="header-title">VIP积分</text>
      <text class="header-subtitle">积分兑换，尊享好礼</text>
    </view>

    <view class="points-card">
      <view class="card-header">
        <text class="card-title">我的积分</text>
        <text class="card-icon">💎</text>
      </view>
      <view class="card-content">
        <text class="points-value">{{ pointsInfo.total_points || 0 }}</text>
        <text class="points-label">可用积分</text>
      </view>
      <view class="card-footer">
        <view class="footer-item">
          <text class="footer-label">本月获得</text>
          <text class="footer-value">+{{ pointsInfo.monthly_earned || 0 }}</text>
        </view>
        <view class="footer-item">
          <text class="footer-label">本月使用</text>
          <text class="footer-value">-{{ pointsInfo.monthly_used || 0 }}</text>
        </view>
      </view>
    </view>

    <view class="points-tabs">
      <view 
        class="tab-item" 
        :class="{ active: activeTab === 'earn' }"
        @tap="switchTab('earn')"
      >
        <text class="tab-text">获取积分</text>
      </view>
      <view 
        class="tab-item" 
        :class="{ active: activeTab === 'redeem' }"
        @tap="switchTab('redeem')"
      >
        <text class="tab-text">积分兑换</text>
      </view>
      <view 
        class="tab-item" 
        :class="{ active: activeTab === 'history' }"
        @tap="switchTab('history')"
      >
        <text class="tab-text">积分记录</text>
      </view>
    </view>

    <scroll-view class="content-scroll" scroll-y>
      <view class="earn-section" v-if="activeTab === 'earn'">
        <text class="section-title">获取积分</text>
        <view class="earn-list">
          <view 
            class="earn-item" 
            v-for="item in earnMethods" 
            :key="item.id"
          >
            <view class="earn-icon">
              <text class="icon-text">{{ item.icon }}</text>
            </view>
            <view class="earn-content">
              <text class="earn-title">{{ item.title }}</text>
              <text class="earn-desc">{{ item.description }}</text>
              <text class="earn-points">+{{ item.points }}积分</text>
            </view>
            <view class="earn-action">
              <button 
                class="action-btn" 
                @tap="earnPoints(item)"
              >
                <text>{{ item.action }}</text>
              </button>
            </view>
          </view>
        </view>
      </view>

      <view class="redeem-section" v-if="activeTab === 'redeem'">
        <text class="section-title">积分兑换</text>
        <scroll-view class="redeem-scroll" scroll-x>
          <view 
            class="redeem-item" 
            v-for="item in rewards" 
            :key="item.id"
          >
            <image 
              class="redeem-image" 
              :src="item.image || '/static/default-reward.png'" 
              mode="aspectFill"
            ></image>
            <view class="redeem-info">
              <text class="redeem-title">{{ item.title }}</text>
              <text class="redeem-points">需要{{ item.points }}积分</text>
              <text class="redeem-stock">剩余{{ item.stock }}件</text>
            </view>
            <button 
              class="redeem-btn" 
              :disabled="pointsInfo.total_points < item.points || item.stock <= 0"
              @tap="redeemReward(item)"
            >
              <text>{{ item.stock > 0 && pointsInfo.total_points >= item.points ? '立即兑换' : item.stock <= 0 ? '已售罄' : '积分不足' }}</text>
            </button>
          </view>
        </scroll-view>
      </view>

      <view class="history-section" v-if="activeTab === 'history'">
        <text class="section-title">积分记录</text>
        <scroll-view class="history-scroll" scroll-y @scrolltolower="loadMoreHistory">
          <view 
            class="history-item" 
            v-for="item in pointsHistory" 
            :key="item.id"
          >
            <view class="history-icon">
              <text class="icon-text">{{ item.type === 'earn' ? '➕' : '➖' }}</text>
            </view>
            <view class="history-content">
              <text class="history-title">{{ item.description }}</text>
              <text class="history-time">{{ formatTime(item.created_at) }}</text>
            </view>
            <view class="history-points">
              <text 
                class="points-value" 
                :class="item.type"
              >
                {{ item.type === 'earn' ? '+' : '-' }}{{ item.points }}
              </text>
            </view>
          </view>

          <view class="loading-more" v-if="loadingHistory">
            <text>加载中...</text>
          </view>

          <view class="no-more" v-if="!hasMoreHistory && pointsHistory.length > 0">
            <text>没有更多了</text>
          </view>

          <view class="empty-state" v-if="pointsHistory.length === 0 && !loadingHistory">
            <text class="empty-icon">💎</text>
            <text class="empty-text">暂无积分记录</text>
            <text class="empty-tip">完成任务获取积分吧</text>
          </view>
        </scroll-view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { vipApi } from '@/api/vip.js'

const activeTab = ref('earn')
const pointsInfo = ref({
  total_points: 0,
  monthly_earned: 0,
  monthly_used: 0
})
const earnMethods = ref([
  {
    id: 1,
    icon: '📝',
    title: '完善资料',
    description: '完善个人资料可获得积分',
    points: 50,
    action: '去完善'
  },
  {
    id: 2,
    icon: '🎉',
    title: '每日签到',
    description: '每日签到可获得积分',
    points: 10,
    action: '去签到'
  },
  {
    id: 3,
    icon: '💬',
    title: '发表评论',
    description: '发表评论可获得积分',
    points: 5,
    action: '去评论'
  },
  {
    id: 4,
    icon: '❤️',
    title: '点赞互动',
    description: '点赞他人内容可获得积分',
    points: 2,
    action: '去点赞'
  },
  {
    id: 5,
    icon: '📤',
    title: '邀请好友',
    description: '邀请好友注册可获得积分',
    points: 100,
    action: '去邀请'
  }
])
const rewards = ref([])
const pointsHistory = ref([])
const loadingHistory = ref(false)
const hasMoreHistory = ref(true)
const historyPage = ref(1)
const historyPageSize = ref(20)

const loadPointsInfo = async () => {
  try {
    const res = await vipApi.getVipPoints()
    if (res.code === 0) {
      pointsInfo.value = res.data
    }
  } catch (error) {
    // console.error('Failed to load points info:', error)
  }
}

const loadRewards = async () => {
  try {
    const res = await vipApi.getVipRewards()
    if (res.code === 0) {
      rewards.value = res.data.list || []
    }
  } catch (error) {
    // console.error('Failed to load rewards:', error)
  }
}

const loadPointsHistory = async (reset = false) => {
  if (reset) {
    historyPage.value = 1
    pointsHistory.value = []
    hasMoreHistory.value = true
  }

  if (loadingHistory.value || !hasMoreHistory.value) return

  loadingHistory.value = true

  try {
    const res = await vipApi.getVipPointsHistory({
      page: historyPage.value,
      pageSize: historyPageSize.value
    })

    if (res.code === 0) {
      const newHistory = res.data.list || []
      if (reset) {
        pointsHistory.value = newHistory
      } else {
        pointsHistory.value = [...pointsHistory.value, ...newHistory]
      }

      hasMoreHistory.value = newHistory.length >= historyPageSize.value
      historyPage.value++
    }
  } catch (error) {
    uni.showToast({
      title: '加载失败',
      icon: 'none'
    })
  } finally {
    loadingHistory.value = false
  }
}

const loadMoreHistory = () => {
  loadPointsHistory(false)
}

const switchTab = (tab) => {
  activeTab.value = tab
  
  if (tab === 'history' && pointsHistory.value.length === 0) {
    loadPointsHistory(true)
  }
}

const earnPoints = (item) => {
  uni.showToast({
    title: '跳转中...',
    icon: 'none'
  })

  setTimeout(() => {
    if (item.id === 1) {
      uni.navigateTo({
        url: '/pages/user-profile/user-profile'
      })
    } else if (item.id === 2) {
      uni.showToast({
        title: '签到成功',
        icon: 'success'
      })
      loadPointsInfo()
    } else if (item.id === 3) {
      uni.switchTab({
        url: '/pages/discover/discover'
      })
    } else if (item.id === 4) {
      uni.switchTab({
        url: '/pages/discover/discover'
      })
    } else if (item.id === 5) {
      uni.navigateTo({
        url: '/pages/invite-code/invite-code'
      })
    }
  }, 500)
}

const redeemReward = (item) => {
  if (pointsInfo.value.total_points < item.points) {
    uni.showToast({
      title: '积分不足',
      icon: 'none'
    })
    return
  }

  if (item.stock <= 0) {
    uni.showToast({
      title: '已售罄',
      icon: 'none'
    })
    return
  }

  uni.showModal({
    title: '确认兑换',
    content: `确定要兑换"${item.title}"吗？\n消耗积分：${item.points}`,
    success: async (res) => {
      if (res.confirm) {
        try {
          const redeemRes = await vipApi.redeemPoints(item.id)

          if (redeemRes.code === 0) {
            uni.showToast({
              title: '兑换成功',
              icon: 'success'
            })

            item.stock--
            pointsInfo.value.total_points -= item.points
            pointsInfo.value.monthly_used += item.points
          } else {
            uni.showToast({
              title: redeemRes.message || '兑换失败',
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

const formatTime = (time) => {
  if (!time) return ''
  const date = new Date(time)
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  return `${month}月${day}日 ${hour}:${minute.toString().padStart(2, '0')}`
}

onMounted(() => {
  loadPointsInfo()
  loadRewards()
})
</script>

<style lang="scss" scoped>
.vip-points-container {
  min-height: 100vh;
  background: #000000;
}

.header {
  padding: 60rpx 40rpx 40rpx;
  background: linear-gradient(180deg, rgba(212, 175, 55, 0.2) 0%, rgba(0, 0, 0, 0) 100%);
}

.header-title {
  display: block;
  font-size: 40rpx;
  font-weight: bold;
  color: #d4af37;
  margin-bottom: 15rpx;
}

.header-subtitle {
  display: block;
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.6);
}

.points-card {
  margin: 30rpx;
  padding: 40rpx;
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(0, 0, 0, 0) 100%);
  border-radius: 20rpx;
  border: 2rpx solid rgba(212, 175, 55, 0.3);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
}

.card-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #d4af37;
}

.card-icon {
  font-size: 48rpx;
}

.card-content {
  text-align: center;
  padding: 30rpx;
  background: rgba(212, 175, 55, 0.1);
  border-radius: 15rpx;
}

.points-value {
  display: block;
  font-size: 64rpx;
  font-weight: bold;
  color: #d4af37;
  margin-bottom: 10rpx;
}

.points-label {
  display: block;
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.6);
}

.card-footer {
  display: flex;
  justify-content: space-around;
  margin-top: 30rpx;
}

.footer-item {
  text-align: center;
}

.footer-label {
  display: block;
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 5rpx;
}

.footer-value {
  display: block;
  font-size: 28rpx;
  font-weight: 500;
}

.footer-value:has-text('+') {
  color: #52c41a;
}

.footer-value:not(:has-text('+')) {
  color: #ff4d4f;
}

.points-tabs {
  display: flex;
  gap: 20rpx;
  padding: 20rpx 30rpx;
  background: rgba(255, 255, 255, 0.02);
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 20rpx;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 15rpx;
  border: 1rpx solid transparent;
  transition: all 0.3s;
}

.tab-item.active {
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.2) 0%, rgba(0, 0, 0, 0) 100%);
  border-color: rgba(212, 175, 55, 0.5);
}

.tab-text {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.7);
}

.tab-item.active .tab-text {
  color: #d4af37;
  font-weight: 500;
}

.content-scroll {
  height: calc(100vh - 350rpx);
}

.section-title {
  display: block;
  font-size: 30rpx;
  font-weight: 500;
  color: #ffffff;
  margin-bottom: 30rpx;
}

.earn-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.earn-item {
  display: flex;
  align-items: center;
  padding: 25rpx;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 15rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.05);
  gap: 20rpx;
}

.earn-icon {
  width: 80rpx;
  height: 80rpx;
  background: rgba(212, 175, 55, 0.1);
  border-radius: 15rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.icon-text {
  font-size: 40rpx;
}

.earn-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.earn-title {
  font-size: 28rpx;
  font-weight: 500;
  color: #ffffff;
}

.earn-desc {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.6);
}

.earn-points {
  font-size: 26rpx;
  color: #d4af37;
  font-weight: 500;
}

.earn-action {
  flex-shrink: 0;
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

.redeem-scroll {
  white-space: nowrap;
  padding-bottom: 10rpx;
}

.redeem-item {
  display: inline-block;
  width: 300rpx;
  margin-right: 20rpx;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 15rpx;
  overflow: hidden;
  vertical-align: top;
}

.redeem-image {
  width: 100%;
  height: 200rpx;
}

.redeem-info {
  padding: 20rpx;
}

.redeem-title {
  display: block;
  font-size: 26rpx;
  color: #ffffff;
  margin-bottom: 10rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.redeem-points {
  display: block;
  font-size: 24rpx;
  color: #d4af37;
  font-weight: 500;
  margin-bottom: 5rpx;
}

.redeem-stock {
  display: block;
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.5);
}

.redeem-btn {
  width: 100%;
  padding: 20rpx;
  background: linear-gradient(135deg, #d4af37 0%, #c9a227 100%);
  border-radius: 15rpx;
  font-size: 26rpx;
  color: #ffffff;
  border: none;
  margin-top: 15rpx;

  &::after {
    border: none;
  }
}

.redeem-btn:disabled {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.5);
}

.history-scroll {
  height: calc(100vh - 400rpx);
}

.history-item {
  display: flex;
  align-items: center;
  padding: 25rpx;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 15rpx;
  border-bottom: 1rpx solid rgba(255, 255, 255, 0.05);
  gap: 20rpx;
}

.history-icon {
  width: 60rpx;
  height: 60rpx;
  background: rgba(212, 175, 55, 0.1);
  border-radius: 15rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.history-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.history-title {
  font-size: 26rpx;
  color: #ffffff;
}

.history-time {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.5);
}

.history-points {
  flex-shrink: 0;
}

.points-value {
  font-size: 28rpx;
  font-weight: 500;
}

.points-value.earn {
  color: #52c41a;
}

.points-value.spend {
  color: #ff4d4f;
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
