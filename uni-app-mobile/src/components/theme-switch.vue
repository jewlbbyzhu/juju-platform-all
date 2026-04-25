<template>
  <view class="theme-switch-container">
    <view class="theme-switch-header">
      <text class="theme-switch-title">主题风格</text>
      <text class="theme-switch-current">{{ currentThemeName }}</text>
    </view>

    <view class="theme-grid">
      <view
        v-for="theme in themeList"
        :key="theme.type"
        class="theme-item"
        :class="{ active: theme.isActive }"
        :style="getThemeItemStyle(theme)"
        @click="selectTheme(theme.type)"
      >
        <view class="theme-preview">
          <view
            class="theme-preview-circle"
            :style="getPreviewStyle(theme)"
          ></view>
        </view>
        <text class="theme-name">{{ theme.name }}</text>
        <text class="theme-desc">{{ theme.description }}</text>
        <view v-if="theme.isActive" class="theme-check">
          <text class="theme-check-icon">✓</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import themeManager from '@/utils/theme.js'

const currentTheme = ref('')
const themeList = ref([])

const currentThemeName = computed(() => {
  const current = themeList.value.find(t => t.isActive)
  return current ? current.name : ''
})

const getThemeItemStyle = (theme) => {
  const config = themeManager.getThemeConfig(theme.type)
  return {
    background: config.colors.surface,
    border: theme.isActive ? `2rpx solid ${config.colors.primary}` : `1rpx solid ${config.colors.border}`
  }
}

const getPreviewStyle = (theme) => {
  const config = themeManager.getThemeConfig(theme.type)
  return {
    background: config.colors.gradient || `linear-gradient(135deg, ${config.colors.primary}, ${config.colors.secondary})`
  }
}

const selectTheme = (themeType) => {
  if (themeType === currentTheme.value) return

  themeManager.setTheme(themeType)
  currentTheme.value = themeType
  updateThemeList()
}

const updateThemeList = () => {
  currentTheme.value = themeManager.getCurrentTheme()
  themeList.value = themeManager.getThemeList()
}

const handleThemeChange = (oldTheme, newTheme) => {
  currentTheme.value = newTheme
  updateThemeList()
}

onMounted(() => {
  updateThemeList()
  themeManager.onThemeChange(handleThemeChange)
})

onUnmounted(() => {
  themeManager.offThemeChange(handleThemeChange)
})
</script>

<style lang="scss" scoped>
.theme-switch-container {
  padding: 30rpx;
  background: var(--theme-background);
}

.theme-switch-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
}

.theme-switch-title {
  font-size: 32rpx;
  font-weight: bold;
  color: var(--theme-text);
}

.theme-switch-current {
  font-size: 28rpx;
  color: var(--theme-text-secondary);
}

.theme-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
}

.theme-item {
  position: relative;
  padding: 24rpx;
  border-radius: var(--theme-border-radius);
  transition: all 0.3s ease;
  overflow: hidden;

  &:active {
    transform: scale(0.98);
  }

  &.active {
    box-shadow: var(--theme-shadow);
  }
}

.theme-preview {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 16rpx;
}

.theme-preview-circle {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15);
}

.theme-name {
  display: block;
  font-size: 28rpx;
  font-weight: bold;
  color: var(--theme-text);
  text-align: center;
  margin-bottom: 8rpx;
}

.theme-desc {
  display: block;
  font-size: 24rpx;
  color: var(--theme-text-secondary);
  text-align: center;
}

.theme-check {
  position: absolute;
  top: 12rpx;
  right: 12rpx;
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  background: var(--theme-primary);
  display: flex;
  justify-content: center;
  align-items: center;
}

.theme-check-icon {
  color: #ffffff;
  font-size: 24rpx;
  font-weight: bold;
}
</style>
