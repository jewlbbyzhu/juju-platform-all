<template>
  <view class="vip-events-container">
    <view class="header">
      <text class="header-title">VIP专属活动</text>
      <text class="header-subtitle">尊享会员专属精彩活动</text>
    </view>

    <view class="vip-banner">
      <image class="banner-image" src="/static/vip-banner.png" mode="aspectFill"></image>
      <view class="banner-overlay">
        <text class="banner-title">VIP会员专享</text>
        <text class="banner-desc">参与专属活动，赢取丰厚奖励</text>
      </view>
    </view>

    <view class="event-tabs">
      <view 
        class="tab-item" 
        :class="{ active: activeTab === 'ongoing' }"
        @tap="switchTab('ongoing')"
      >
        <text class="tab-text">进行中</text>
      </view>
      <view 
        class="tab-item" 
        :class="{ active: activeTab === 'upcoming' }"
        @tap="switchTab('upcoming')"
      >
        <text class="tab-text">即将开始</text>
      </view>
      <view 
        class="tab-item" 
        :class="{ active: activeTab === 'ended' }"
        @tap="switchTab('ended')"
      >
        <text class="tab-text">已结束</text>
      </view>
    </view>

    <scroll-view class="event-list" scroll-y @scrolltolower="loadMore">
      <view 
        class="event-card" 
        v-for="event in filteredEvents" 
        :key="event.id"
        @tap="viewEventDetail(event)"
      >
        <image 
          class="event-image" 
          :src="event.cover_image || '/static/default-event.png'" 
          mode="aspectFill"
        ></image>

        <view class="event-badge" v-if="event.status === 'ongoing'">
          <text class="badge-text">进行中</text>
        </view>
        <view class="event-badge upcoming" v-else-if="event.status === 'upcoming'">
          <text class="badge-text">即将开始</text>
        </view>
        <view class="event-badge ended" v-else>
          <text class="badge-text">已结束</text>
        </view>

        <view class="event-content">
          <text class="event-title">{{ event.title }}</text>
          <text class="event-desc">{{ event.description }}</text>

          <view class="event-info">
            <view class="info-item">
              <text class="info-icon">📅</text>
              <text class="info-text">{{ formatTime(event.start_time) }}</text>
            </view>
            <view class="info-item">
              <text class="info-icon">👥</text>
              <text class="info-text">{{ event.participant_count || 0 }}人参与</text>
            </view>
            <view class="info-item">
              <text class="info-icon">🎁</text>
              <text class="info-text">{{ event.reward_type }}</text>
            </view>
          </view>

          <view class="event-reward" v-if="event.reward">
            <text class="reward-label">活动奖励</text>
            <text class="reward-value">{{ event.reward }}</text>
          </view>

          <button 
            class="event-btn" 
            :class="{ disabled: event.status !== 'ongoing' }"
            @tap.stop="joinEvent(event)"
          >
            <text>{{ event.status === 'ongoing' ? '立即参与' : event.status === 'upcoming' ? '预约提醒' : '查看详情' }}</text>
          </button>
        </view>
      </view>

      <view class="loading-more" v-if="loading">
        <text>加载中...</text>
      </view>

      <view class="no-more" v-if="!hasMore && filteredEvents.length > 0">
        <text>没有更多了</text>
      </view>

      <view class="empty-state" v-if="filteredEvents.length === 0 && !loading">
        <text class="empty-icon">🎉</text>
        <text class="empty-text">暂无{{ activeTab === 'ongoing' ? '进行中' : activeTab === 'upcoming' ? '即将开始' : '已结束' }}的活动</text>
        <text class="empty-tip">敬请期待更多精彩活动</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { vipApi } from '@/api/vip.js'

const userStore = useUserStore()

const activeTab = ref('ongoing')
const events = ref([])
const loading = ref(false)
const hasMore = ref(true)
const page = ref(1)
const pageSize = ref(20)

const filteredEvents = computed(() => {
  return events.value.filter(event => event.status === activeTab.value)
})

const loadEvents = async (reset = false) => {
  if (reset) {
    page.value = 1
    events.value = []
    hasMore.value = true
  }

  if (loading.value || !hasMore.value) return

  loading.value = true

  try {
    const res = await vipApi.getVipEvents({
      page: page.value,
      pageSize: pageSize.value
    })

    if (res.code === 0) {
      const newEvents = res.data.list || []
      if (reset) {
        events.value = newEvents
      } else {
        events.value = [...events.value, ...newEvents]
      }

      hasMore.value = newEvents.length >= pageSize.value
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
  loadEvents(false)
}

const switchTab = (tab) => {
  activeTab.value = tab
}

const viewEventDetail = (event) => {
  uni.navigateTo({
    url: `/pages/vip-event-detail/vip-event-detail?eventId=${event.id}`
  })
}

const joinEvent = async (event) => {
  if (!userStore.isVipUser) {
    uni.showModal({
      title: '需要VIP会员',
      content: '此活动仅限VIP会员参与，是否立即开通VIP？',
      success: (res) => {
        if (res.confirm) {
          uni.navigateTo({
            url: '/pages/vip/vip'
          })
        }
      }
    })
    return
  }

  if (event.status !== 'ongoing') {
    return
  }

  try {
    const res = await vipApi.joinVipEvent(event.id)

    if (res.code === 0) {
      uni.showToast({
        title: '参与成功',
        icon: 'success'
      })
    } else {
      uni.showToast({
        title: res.message || '参与失败',
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
  loadEvents(true)
})
</script>

<style lang="scss" scoped>
.vip-events-container {
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

.vip-banner {
  position: relative;
  margin: 30rpx;
  height: 300rpx;
  border-radius: 20rpx;
  overflow: hidden;
}

.banner-image {
  width: 100%;
  height: 100%;
}

.banner-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.7) 100%);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 40rpx;
}

.banner-title {
  display: block;
  font-size: 36rpx;
  font-weight: bold;
  color: #d4af37;
  margin-bottom: 10rpx;
}

.banner-desc {
  display: block;
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
}

.event-tabs {
  display: flex;
  gap: 20rpx;
  padding: 30rpx;
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

.event-list {
  height: calc(100vh - 600rpx);
  padding: 20rpx;
}

.event-card {
  margin-bottom: 30rpx;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 20rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.05);
  overflow: hidden;
  position: relative;
}

.event-image {
  width: 100%;
  height: 400rpx;
}

.event-badge {
  position: absolute;
  top: 20rpx;
  right: 20rpx;
  padding: 8rpx 20rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
  color: #ffffff;
}

.event-badge {
  background: rgba(82, 196, 26, 0.9);
}

.event-badge.upcoming {
  background: rgba(102, 126, 234, 0.9);
}

.event-badge.ended {
  background: rgba(255, 255, 255, 0.3);
}

.badge-text {
  font-size: 22rpx;
}

.event-content {
  padding: 30rpx;
}

.event-title {
  display: block;
  font-size: 32rpx;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 15rpx;
}

.event-desc {
  display: block;
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.5;
  margin-bottom: 20rpx;
}

.event-info {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
  margin-bottom: 20rpx;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.info-icon {
  font-size: 28rpx;
}

.info-text {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.7);
}

.event-reward {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx;
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(0, 0, 0, 0) 100%);
  border-radius: 15rpx;
  border: 1rpx solid rgba(212, 175, 55, 0.3);
  margin-bottom: 20rpx;
}

.reward-label {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.6);
}

.reward-value {
  font-size: 28rpx;
  font-weight: bold;
  color: #d4af37;
}

.event-btn {
  width: 100%;
  padding: 25rpx;
  background: linear-gradient(135deg, #d4af37 0%, #c9a227 100%);
  border-radius: 30rpx;
  font-size: 28rpx;
  font-weight: bold;
  color: #ffffff;
  border: none;

  &::after {
    border: none;
  }
}

.event-btn.disabled {
  background: rgba(255, 255, 255, 0.1);
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
</style>
