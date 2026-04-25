<template>
  <view class="vip-levels-container">
    <view class="header">
      <text class="header-title">VIP等级</text>
      <text class="header-subtitle">升级等级，享受更多特权</text>
    </view>

    <view class="current-level" v-if="currentLevel">
      <view class="level-card current">
        <view class="level-header">
          <text class="level-badge">当前等级</text>
          <text class="level-name">{{ currentLevel.name }}</text>
        </view>
        <view class="level-info">
          <view class="info-item">
            <text class="info-label">特权</text>
            <view class="info-tags">
              <text 
                class="info-tag" 
                v-for="benefit in currentLevel.benefits" 
                :key="benefit"
              >
                {{ benefit }}
              </text>
            </view>
          </view>
          <view class="info-item">
            <text class="info-label">积分倍率</text>
            <text class="info-value">{{ currentLevel.points_rate }}x</text>
          </view>
          <view class="info-item">
            <text class="info-label">手续费优惠</text>
            <text class="info-value">{{ currentLevel.service_fee_discount }}%</text>
          </view>
        </view>
        <view class="level-progress">
          <text class="progress-label">距离下一等级</text>
          <view class="progress-bar">
            <view 
              class="progress-fill" 
              :style="{ width: (currentLevel.progress / 100 * 100) + '%' }"
            ></view>
          </view>
          <text class="progress-text">{{ currentLevel.progress }}%</text>
        </view>
      </view>
    </view>

    <view class="levels-section">
      <text class="section-title">全部等级</text>
      <scroll-view class="levels-scroll" scroll-y>
        <view 
          class="level-item" 
          v-for="level in levels" 
          :key="level.id"
          :class="{ current: level.id === currentLevel?.id, locked: level.locked }"
        >
          <view class="level-header">
            <view class="level-icon">
              <text class="icon-text">{{ level.icon }}</text>
            </view>
            <view class="level-title">
              <text class="level-name">{{ level.name }}</text>
              <text class="level-desc">{{ level.description }}</text>
            </view>
            <view class="level-status">
              <text 
                class="status-badge" 
                :class="level.id === currentLevel?.id ? 'current' : 'locked'"
              >
                {{ level.id === currentLevel?.id ? '当前' : level.locked ? '未解锁' : '可升级' }}
              </text>
            </view>
          </view>

          <view class="level-privileges">
            <view class="privilege-item">
              <text class="privilege-label">特权</text>
              <view class="privilege-list">
                <text 
                  class="privilege-tag" 
                  v-for="benefit in level.benefits" 
                  :key="benefit"
                >
                  ✓ {{ benefit }}
                </text>
              </view>
            </view>
            <view class="privilege-item">
              <text class="privilege-label">积分倍率</text>
              <text class="privilege-value">{{ level.points_rate }}x</text>
            </view>
            <view class="privilege-item">
              <text class="privilege-label">手续费优惠</text>
              <text class="privilege-value">{{ level.service_fee_discount }}%</text>
            </view>
            <view class="privilege-item">
              <text class="privilege-label">升级条件</text>
              <text class="privilege-value">{{ level.upgrade_condition }}</text>
            </view>
          </view>

          <button 
            class="upgrade-btn" 
            v-if="!level.locked && level.id !== currentLevel?.id"
            @tap="upgradeLevel(level)"
          >
            <text>升级到{{ level.name }}</text>
          </button>
        </view>
      </scroll-view>
    </view>

    <view class="level-comparison" v-if="levels.length > 0">
      <text class="section-title">等级对比</text>
      <view class="comparison-table">
        <view class="table-header">
          <text class="header-cell">等级</text>
          <text class="header-cell">特权</text>
          <text class="header-cell">积分倍率</text>
          <text class="header-cell">手续费</text>
          <text class="header-cell">升级条件</text>
        </view>
        <view 
          class="table-row" 
          v-for="level in levels" 
          :key="level.id"
          :class="{ current: level.id === currentLevel?.id }"
        >
          <text class="row-cell">{{ level.name }}</text>
          <text class="row-cell">{{ level.benefits.join(', ') }}</text>
          <text class="row-cell">{{ level.points_rate }}x</text>
          <text class="row-cell">{{ level.service_fee_discount }}%</text>
          <text class="row-cell">{{ level.upgrade_condition }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { vipApi } from '@/api/vip.js'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

const currentLevel = ref(null)
const levels = ref([])

const loadVipLevels = async () => {
  try {
    const res = await vipApi.getVipLevels()
    if (res.code === 0) {
      levels.value = res.data.list || []
      
      const currentLevelId = userStore.vipInfo?.levelId
      if (currentLevelId) {
        const levelRes = await vipApi.getVipLevelDetail(currentLevelId)
        if (levelRes.code === 0) {
          currentLevel.value = levelRes.data
        }
      }
    }
  } catch (error) {
    uni.showToast({
      title: '加载失败',
      icon: 'none'
    })
  }
}

const upgradeLevel = async (level) => {
  if (!userStore.isVipUser) {
    uni.showModal({
      title: '需要VIP会员',
      content: '升级等级需要先开通VIP会员，是否立即开通？',
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

  uni.showModal({
    title: '确认升级',
    content: `确定要升级到${level.name}吗？\n升级费用：${level.upgrade_price}元`,
    success: async (res) => {
      if (res.confirm) {
        try {
          const upgradeRes = await vipApi.upgradeVipLevel(level.id, {})
          
          if (upgradeRes.code === 0) {
            uni.showToast({
              title: '升级成功',
              icon: 'success'
            })

            setTimeout(() => {
              loadVipLevels()
              userStore.fetchUserInfo()
            }, 1500)
          } else {
            uni.showToast({
              title: upgradeRes.message || '升级失败',
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

onMounted(() => {
  loadVipLevels()
})
</script>

<style lang="scss" scoped>
.vip-levels-container {
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

.current-level {
  padding: 30rpx;
}

.level-card {
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(0, 0, 0, 0) 100%);
  border-radius: 20rpx;
  border: 2rpx solid rgba(212, 175, 55, 0.5);
  padding: 30rpx;
}

.level-card.current {
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.2) 0%, rgba(0, 0, 0, 0) 100%);
  border-color: #d4af37;
}

.level-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
}

.level-badge {
  padding: 8rpx 20rpx;
  background: #d4af37;
  border-radius: 20rpx;
  font-size: 22rpx;
  color: #ffffff;
  font-weight: 500;
}

.level-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #d4af37;
}

.level-info {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  margin-bottom: 30rpx;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-label {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.7);
}

.info-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
}

.info-tag {
  padding: 5rpx 15rpx;
  background: rgba(212, 175, 55, 0.2);
  border-radius: 15rpx;
  font-size: 22rpx;
  color: #d4af37;
}

.info-value {
  font-size: 28rpx;
  color: #d4af37;
  font-weight: 500;
}

.level-progress {
  display: flex;
  align-items: center;
  gap: 15rpx;
}

.progress-label {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.6);
}

.progress-bar {
  flex: 1;
  height: 10rpx;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 5rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #d4af37 0%, #c9a227 100%);
  border-radius: 5rpx;
  transition: width 0.3s;
}

.progress-text {
  font-size: 24rpx;
  color: #d4af37;
  font-weight: 500;
}

.levels-section {
  padding: 30rpx;
}

.section-title {
  display: block;
  font-size: 30rpx;
  font-weight: 500;
  color: #ffffff;
  margin-bottom: 30rpx;
}

.levels-scroll {
  height: calc(100vh - 400rpx);
}

.level-item {
  background: rgba(255, 255, 255, 0.02);
  border-radius: 20rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.05);
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.level-item.current {
  border-color: #d4af37;
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(0, 0, 0, 0) 100%);
}

.level-item.locked {
  opacity: 0.6;
}

.level-header {
  display: flex;
  align-items: center;
  gap: 20rpx;
  margin-bottom: 20rpx;
}

.level-icon {
  width: 80rpx;
  height: 80rpx;
  background: rgba(212, 175, 55, 0.2);
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-text {
  font-size: 40rpx;
}

.level-title {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 5rpx;
}

.level-desc {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.5);
}

.level-status {
  flex-shrink: 0;
}

.status-badge {
  padding: 8rpx 20rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
  font-weight: 500;
}

.status-badge.current {
  background: #d4af37;
  color: #ffffff;
}

.status-badge.locked {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.5);
}

.level-privileges {
  display: flex;
  flex-direction: column;
  gap: 15rpx;
}

.privilege-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.privilege-label {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.6);
}

.privilege-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
}

.privilege-tag {
  padding: 5rpx 12rpx;
  background: rgba(212, 175, 55, 0.1);
  border-radius: 10rpx;
  font-size: 20rpx;
  color: #d4af37;
}

.privilege-value {
  font-size: 26rpx;
  color: #d4af37;
  font-weight: 500;
}

.upgrade-btn {
  width: 100%;
  padding: 25rpx;
  background: linear-gradient(135deg, #d4af37 0%, #c9a227 100%);
  border-radius: 30rpx;
  font-size: 28rpx;
  font-weight: bold;
  color: #ffffff;
  border: none;
  margin-top: 20rpx;

  &::after {
    border: none;
  }
}

.level-comparison {
  padding: 30rpx;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 20rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.05);
}

.comparison-table {
  display: flex;
  flex-direction: column;
}

.table-header {
  display: grid;
  grid-template-columns: 1fr 1.5fr 0.8fr 0.8fr 1.2fr;
  gap: 10rpx;
  padding: 20rpx;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 15rpx 15rpx 0 0;
}

.header-cell {
  font-size: 24rpx;
  font-weight: 500;
  color: #ffffff;
}

.table-row {
  display: grid;
  grid-template-columns: 1fr 1.5fr 0.8fr 0.8fr 1.2fr;
  gap: 10rpx;
  padding: 20rpx;
  border-bottom: 1rpx solid rgba(255, 255, 255, 0.05);
}

.table-row.current {
  background: rgba(212, 175, 55, 0.1);
}

.row-cell {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.7);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
