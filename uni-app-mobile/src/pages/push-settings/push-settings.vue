<template>
  <view class="push-settings-container">
    <view class="header">
      <text class="header-title">推送设置</text>
      <text class="header-subtitle">自定义通知偏好</text>
    </view>

    <view class="settings-section">
      <text class="section-title">通知类型</text>
      <view class="settings-list">
        <view class="setting-item">
          <view class="item-left">
            <text class="item-icon">🎉</text>
            <text class="item-label">聚会通知</text>
            <text class="item-desc">聚会相关消息推送</text>
          </view>
          <switch 
            class="item-switch" 
            :checked="settings.party_enabled" 
            @change="toggleSetting('party_enabled', $event)"
            color="#667eea"
          />
        </view>

        <view class="setting-item">
          <view class="item-left">
            <text class="item-icon">💬</text>
            <text class="item-label">评论通知</text>
            <text class="item-desc">收到评论时推送</text>
          </view>
          <switch 
            class="item-switch" 
            :checked="settings.comment_enabled" 
            @change="toggleSetting('comment_enabled', $event)"
            color="#667eea"
          />
        </view>

        <view class="setting-item">
          <view class="item-left">
            <text class="item-icon">❤️</text>
            <text class="item-label">点赞通知</text>
            <text class="item-desc">收到点赞时推送</text>
          </view>
          <switch 
            class="item-switch" 
            :checked="settings.like_enabled" 
            @change="toggleSetting('like_enabled', $event)"
            color="#667eea"
          />
        </view>

        <view class="setting-item">
          <view class="item-left">
            <text class="item-icon">👥</text>
            <text class="item-label">关注通知</text>
            <text class="item-desc">新增关注时推送</text>
          </view>
          <switch 
            class="item-switch" 
            :checked="settings.follow_enabled" 
            @change="toggleSetting('follow_enabled', $event)"
            color="#667eea"
          />
        </view>

        <view class="setting-item">
          <view class="item-left">
            <text class="item-icon">💬</text>
            <text class="item-label">私信通知</text>
            <text class="item-desc">收到私信时推送</text>
          </view>
          <switch 
            class="item-switch" 
            :checked="settings.message_enabled" 
            @change="toggleSetting('message_enabled', $event)"
            color="#667eea"
          />
        </view>

        <view class="setting-item">
          <view class="item-left">
            <text class="item-icon">🎁</text>
            <text class="item-label">活动通知</text>
            <text class="item-desc">VIP活动推送</text>
          </view>
          <switch 
            class="item-switch" 
            :checked="settings.activity_enabled" 
            @change="toggleSetting('activity_enabled', $event)"
            color="#667eea"
          />
        </view>

        <view class="setting-item">
          <view class="item-left">
            <text class="item-icon">🔔</text>
            <text class="item-label">系统通知</text>
            <text class="item-desc">系统消息推送</text>
          </view>
          <switch 
            class="item-switch" 
            :checked="settings.system_enabled" 
            @change="toggleSetting('system_enabled', $event)"
            color="#667eea"
          />
        </view>
      </view>
    </view>

    <view class="settings-section">
      <text class="section-title">推送时间</text>
      <view class="settings-list">
        <view class="setting-item">
          <view class="item-left">
            <text class="item-icon">🕐</text>
            <text class="item-label">免打扰时段</text>
            <text class="item-desc">设置不接收通知的时间段</text>
          </view>
          <switch 
            class="item-switch" 
            :checked="settings.do_not_disturb_enabled" 
            @change="toggleSetting('do_not_disturb_enabled', $event)"
            color="#667eea"
          />
        </view>

        <view class="setting-item" v-if="settings.do_not_disturb_enabled">
          <view class="item-left">
            <text class="item-icon">🌙</text>
            <text class="item-label">开始时间</text>
          </view>
          <picker 
            mode="time" 
            :value="settings.do_not_disturb_start" 
            @change="updateTime('do_not_disturb_start', $event)"
          >
            <view class="picker-value">
              <text class="value-text">{{ settings.do_not_disturb_start || '22:00' }}</text>
              <text class="picker-arrow">›</text>
            </view>
          </picker>
        </view>

        <view class="setting-item" v-if="settings.do_not_disturb_enabled">
          <view class="item-left">
            <text class="item-icon">🌅</text>
            <text class="item-label">结束时间</text>
          </view>
          <picker 
            mode="time" 
            :value="settings.do_not_disturb_end" 
            @change="updateTime('do_not_disturb_end', $event)"
          >
            <view class="picker-value">
              <text class="value-text">{{ settings.do_not_disturb_end || '08:00' }}</text>
              <text class="picker-arrow">›</text>
            </view>
          </picker>
        </view>
      </view>
    </view>

    <view class="settings-section">
      <text class="section-title">推送频率</text>
      <view class="settings-list">
        <view class="setting-item">
          <view class="item-left">
            <text class="item-icon">📊</text>
            <text class="item-label">聚合推送</text>
            <text class="item-desc">合并相似通知</text>
          </view>
          <switch 
            class="item-switch" 
            :checked="settings.aggregate_enabled" 
            @change="toggleSetting('aggregate_enabled', $event)"
            color="#667eea"
          />
        </view>

        <view class="setting-item">
          <view class="item-left">
            <text class="item-icon">⏰</text>
            <text class="item-label">推送间隔</text>
            <text class="item-desc">设置推送最小间隔</text>
          </view>
          <picker 
            mode="selector" 
            :range="intervalOptions" 
            :value="settings.push_interval" 
            @change="updateInterval"
          >
            <view class="picker-value">
              <text class="value-text">{{ getIntervalText(settings.push_interval) }}</text>
              <text class="picker-arrow">›</text>
            </view>
          </picker>
        </view>
      </view>
    </view>

    <view class="action-section">
      <button class="action-btn save" @tap="saveSettings">
        <text>保存设置</text>
      </button>
      <button class="action-btn reset" @tap="resetSettings">
        <text>恢复默认</text>
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { pushApi } from '@/api/push.js'

const settings = ref({
  party_enabled: true,
  comment_enabled: true,
  like_enabled: true,
  follow_enabled: true,
  message_enabled: true,
  activity_enabled: true,
  system_enabled: true,
  do_not_disturb_enabled: false,
  do_not_disturb_start: '22:00',
  do_not_disturb_end: '08:00',
  aggregate_enabled: false,
  push_interval: 0
})

const intervalOptions = ref(['实时', '5分钟', '15分钟', '30分钟', '1小时'])

const loadSettings = async () => {
  try {
    const res = await pushApi.getPushSettings()
    if (res.code === 0) {
      settings.value = res.data || settings.value
    }
  } catch (error) {
    // console.error('Failed to load push settings:', error)
  }
}

const toggleSetting = async (key, event) => {
  settings.value[key] = event.detail.value
}

const updateTime = (key, event) => {
  settings.value[key] = event.detail.value
}

const updateInterval = (event) => {
  const intervalMap = {
    '实时': 0,
    '5分钟': 5,
    '15分钟': 15,
    '30分钟': 30,
    '1小时': 60
  }
  settings.value.push_interval = intervalMap[event.detail.value]
}

const getIntervalText = (value) => {
  const textMap = {
    0: '实时',
    5: '5分钟',
    15: '15分钟',
    30: '30分钟',
    60: '1小时'
  }
  return textMap[value] || '实时'
}

const saveSettings = async () => {
  try {
    const res = await pushApi.updatePushSettings(settings.value)
    if (res.code === 0) {
      uni.showToast({
        title: '保存成功',
        icon: 'success'
      })
    } else {
      uni.showToast({
        title: res.message || '保存失败',
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

const resetSettings = () => {
  uni.showModal({
    title: '确认重置',
    content: '确定要恢复默认设置吗？',
    success: async (res) => {
      if (res.confirm) {
        settings.value = {
          party_enabled: true,
          comment_enabled: true,
          like_enabled: true,
          follow_enabled: true,
          message_enabled: true,
          activity_enabled: true,
          system_enabled: true,
          do_not_disturb_enabled: false,
          do_not_disturb_start: '22:00',
          do_not_disturb_end: '08:00',
          aggregate_enabled: false,
          push_interval: 0
        }

        await saveSettings()
      }
    }
  })
}

onMounted(() => {
  loadSettings()
})
</script>

<style lang="scss" scoped>
.push-settings-container {
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

.settings-section {
  margin: 30rpx;
  padding: 30rpx;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 20rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.05);
}

.section-title {
  display: block;
  font-size: 30rpx;
  font-weight: 500;
  color: #ffffff;
  margin-bottom: 30rpx;
}

.settings-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 25rpx;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 15rpx;
}

.item-left {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 15rpx;
}

.item-icon {
  font-size: 36rpx;
  flex-shrink: 0;
}

.item-label {
  font-size: 28rpx;
  color: #ffffff;
  font-weight: 500;
}

.item-desc {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.5);
}

.item-switch {
  transform: scale(0.8);
}

.picker-value {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.value-text {
  font-size: 26rpx;
  color: #ffffff;
}

.picker-arrow {
  font-size: 32rpx;
  color: rgba(255, 255, 255, 0.5);
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

.action-btn.save {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.action-btn.reset {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.7);
}
</style>
