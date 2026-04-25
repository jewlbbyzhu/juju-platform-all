<template>
  <view class="user-profile-container">
    <view class="header">
      <text class="header-title">用户画像</text>
      <text class="header-subtitle">完善信息，获得更精准推荐</text>
    </view>

    <view class="profile-section">
      <view class="section-header">
        <text class="section-title">🏷️ 兴趣标签</text>
        <text class="section-edit" @tap="editTags">编辑</text>
      </view>
      <view class="tags-container">
        <view 
          class="tag-item" 
          v-for="tag in userTags" 
          :key="tag.id"
        >
          <text class="tag-name">{{ tag.name }}</text>
        </view>
        <view class="tag-item add" @tap="addTag">
          <text class="tag-name">+ 添加</text>
        </view>
      </view>
    </view>

    <view class="profile-section">
      <view class="section-header">
        <text class="section-title">❤️ 偏好设置</text>
        <text class="section-edit" @tap="editPreferences">编辑</text>
      </view>
      <view class="preferences-grid">
        <view class="preference-item">
          <text class="preference-label">聚会类型</text>
          <view class="preference-value">
            <text class="value-text">{{ preferences.partyType || '未设置' }}</text>
          </view>
        </view>
        <view class="preference-item">
          <text class="preference-label">活动时间</text>
          <view class="preference-value">
            <text class="value-text">{{ preferences.partyTime || '未设置' }}</text>
          </view>
        </view>
        <view class="preference-item">
          <text class="preference-label">参与人数</text>
          <view class="preference-value">
            <text class="value-text">{{ preferences.partySize || '未设置' }}</text>
          </view>
        </view>
        <view class="preference-item">
          <text class="preference-label">预算范围</text>
          <view class="preference-value">
            <text class="value-text">{{ preferences.budget || '未设置' }}</text>
          </view>
        </view>
      </view>
    </view>

    <view class="profile-section">
      <view class="section-header">
        <text class="section-title">📊 数据统计</text>
      </view>
      <view class="stats-grid">
        <view class="stat-card">
          <text class="stat-icon">🎉</text>
          <text class="stat-value">{{ statistics.totalParties || 0 }}</text>
          <text class="stat-label">参与聚会</text>
        </view>
        <view class="stat-card">
          <text class="stat-icon">👥</text>
          <text class="stat-value">{{ statistics.totalParticipants || 0 }}</text>
          <text class="stat-label">认识好友</text>
        </view>
        <view class="stat-card">
          <text class="stat-icon">💬</text>
          <text class="stat-value">{{ statistics.totalComments || 0 }}</text>
          <text class="stat-label">发表评论</text>
        </view>
        <view class="stat-card">
          <text class="stat-icon">❤️</text>
          <text class="stat-value">{{ statistics.totalLikes || 0 }}</text>
          <text class="stat-label">获得点赞</text>
        </view>
      </view>
    </view>

    <view class="profile-section">
      <view class="section-header">
        <text class="section-title">🎯 行为分析</text>
      </view>
      <view class="behavior-list">
        <view class="behavior-item">
          <text class="behavior-label">活跃时段</text>
          <view class="behavior-chart">
            <view 
              class="chart-bar" 
              v-for="(value, index) in behavior.activeHours" 
              :key="index"
              :style="{ height: (value / 100 * 100) + '%' }"
            ></view>
          </view>
        </view>
        <view class="behavior-item">
          <text class="behavior-label">偏好类型</text>
          <view class="preference-chart">
            <view 
              class="chart-pie" 
              v-for="(item, index) in behavior.categoryPreference" 
              :key="index"
              :style="{ 
                background: item.color,
                width: item.percentage + '%'
              }"
            >
              <text class="pie-label">{{ item.label }}</text>
            </view>
          </view>
        </view>
        <view class="behavior-item">
          <text class="behavior-label">参与频率</text>
          <view class="frequency-chart">
            <view class="frequency-item">
              <text class="freq-label">本周</text>
              <text class="freq-value">{{ behavior.weeklyCount || 0 }}次</text>
            </view>
            <view class="frequency-item">
              <text class="freq-label">本月</text>
              <text class="freq-value">{{ behavior.monthlyCount || 0 }}次</text>
            </view>
            <view class="frequency-item">
              <text class="freq-label">总计</text>
              <text class="freq-value">{{ behavior.totalCount || 0 }}次</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <view class="profile-section">
      <view class="section-header">
        <text class="section-title">✨ 智能推荐</text>
      </view>
      <scroll-view class="recommend-scroll" scroll-x>
        <view 
          class="recommend-item" 
          v-for="party in recommendedParties" 
          :key="party.id"
          @tap="viewParty(party)"
        >
          <image 
            class="recommend-image" 
            :src="party.cover_image || '/static/default-party.png'" 
            mode="aspectFill"
          ></image>
          <view class="recommend-info">
            <text class="recommend-title">{{ party.title }}</text>
            <text class="recommend-match">匹配度 {{ party.match_score || 0 }}%</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <view class="action-section">
      <button class="action-btn primary" @tap="completeProfile">
        <text>完善画像</text>
      </button>
      <button class="action-btn secondary" @tap="refreshProfile">
        <text>刷新数据</text>
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { profileApi } from '@/api/profile.js'

const userTags = ref([])
const preferences = ref({
  partyType: '',
  partyTime: '',
  partySize: '',
  budget: ''
})
const statistics = ref({
  totalParties: 0,
  totalParticipants: 0,
  totalComments: 0,
  totalLikes: 0
})
const behavior = ref({
  activeHours: [],
  categoryPreference: [],
  weeklyCount: 0,
  monthlyCount: 0,
  totalCount: 0
})
const recommendedParties = ref([])

const loadUserProfile = async () => {
  try {
    const res = await profileApi.getUserProfile()
    if (res.code === 0) {
      const data = res.data
      userTags.value = data.tags || []
      preferences.value = data.preferences || {}
      statistics.value = data.statistics || {}
      behavior.value = data.behavior || {}
    }
  } catch (error) {
    // console.error('Failed to load user profile:', error)
  }
}

const loadRecommendedParties = async () => {
  try {
    const res = await profileApi.getRecommendedParties({ limit: 10 })
    if (res.code === 0) {
      recommendedParties.value = res.data.list || []
    }
  } catch (error) {
    // console.error('Failed to load recommended parties:', error)
  }
}

const editTags = () => {
  uni.navigateTo({
    url: '/pages/edit-tags/edit-tags'
  })
}

const editPreferences = () => {
  uni.navigateTo({
    url: '/pages/edit-preferences/edit-preferences'
  })
}

const addTag = () => {
  uni.navigateTo({
    url: '/pages/add-tag/add-tag'
  })
}

const viewParty = (party) => {
  uni.navigateTo({
    url: `/pages/party-detail/party-detail?partyId=${party.id}`
  })
}

const completeProfile = () => {
  uni.navigateTo({
    url: '/pages/complete-profile/complete-profile'
  })
}

const refreshProfile = async () => {
  uni.showLoading({
    title: '刷新中...'
  })

  try {
    await Promise.all([
      loadUserProfile(),
      loadRecommendedParties()
    ])

    uni.hideLoading()
    uni.showToast({
      title: '刷新成功',
      icon: 'success'
    })
  } catch (error) {
    uni.hideLoading()
    uni.showToast({
      title: '刷新失败',
      icon: 'none'
    })
  }
}

onMounted(() => {
  loadUserProfile()
  loadRecommendedParties()
})
</script>

<style lang="scss" scoped>
.user-profile-container {
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

.profile-section {
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

.section-edit {
  font-size: 24rpx;
  color: #667eea;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 15rpx;
}

.tag-item {
  padding: 15rpx 25rpx;
  background: rgba(102, 126, 234, 0.2);
  border-radius: 25rpx;
  border: 1rpx solid rgba(102, 126, 234, 0.3);
}

.tag-item.add {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.2);
  border-style: dashed;
}

.tag-name {
  font-size: 26rpx;
  color: #ffffff;
}

.preferences-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
}

.preference-item {
  padding: 20rpx;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 15rpx;
}

.preference-label {
  display: block;
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 10rpx;
}

.preference-value {
  background: rgba(102, 126, 234, 0.1);
  padding: 15rpx;
  border-radius: 10rpx;
}

.value-text {
  font-size: 26rpx;
  color: #667eea;
  font-weight: 500;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
}

.stat-card {
  text-align: center;
  padding: 30rpx;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 15rpx;
}

.stat-icon {
  display: block;
  font-size: 48rpx;
  margin-bottom: 15rpx;
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

.behavior-list {
  display: flex;
  flex-direction: column;
  gap: 30rpx;
}

.behavior-item {
  padding: 20rpx;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 15rpx;
}

.behavior-label {
  display: block;
  font-size: 26rpx;
  color: #ffffff;
  margin-bottom: 20rpx;
}

.behavior-chart {
  display: flex;
  align-items: flex-end;
  gap: 10rpx;
  height: 150rpx;
}

.chart-bar {
  flex: 1;
  background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
  border-radius: 5rpx 5rpx 0 0;
  min-height: 10rpx;
}

.preference-chart {
  display: flex;
  height: 30rpx;
  border-radius: 15rpx;
  overflow: hidden;
}

.chart-pie {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.pie-label {
  font-size: 20rpx;
  color: #ffffff;
}

.frequency-chart {
  display: flex;
  gap: 20rpx;
}

.frequency-item {
  flex: 1;
  text-align: center;
  padding: 20rpx;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 10rpx;
}

.freq-label {
  display: block;
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 10rpx;
}

.freq-value {
  display: block;
  font-size: 28rpx;
  font-weight: bold;
  color: #667eea;
}

.recommend-scroll {
  white-space: nowrap;
  padding-bottom: 10rpx;
}

.recommend-item {
  display: inline-block;
  width: 300rpx;
  margin-right: 20rpx;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 15rpx;
  overflow: hidden;
  vertical-align: top;
}

.recommend-image {
  width: 100%;
  height: 200rpx;
}

.recommend-info {
  padding: 20rpx;
}

.recommend-title {
  display: block;
  font-size: 26rpx;
  color: #ffffff;
  margin-bottom: 10rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.recommend-match {
  display: block;
  font-size: 22rpx;
  color: #52c41a;
  font-weight: 500;
}

.action-section {
  padding: 30rpx;
  display: flex;
  gap: 20rpx;
}

.action-btn {
  flex: 1;
  padding: 30rpx;
  border-radius: 30rpx;
  font-size: 28rpx;
  color: #ffffff;
  border: none;

  &::after {
    border: none;
  }
}

.action-btn.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.action-btn.secondary {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.7);
}
</style>
