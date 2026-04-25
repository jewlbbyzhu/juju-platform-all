<template>
  <view class="theme-preview-container">
    <view class="preview-header">
      <text class="preview-title">主题预览</text>
      <text class="preview-subtitle">选择你喜欢的主题风格</text>
    </view>

    <view class="theme-switch-wrapper">
      <theme-switch></theme-switch>
    </view>

    <view class="preview-content">
      <view class="preview-section">
        <text class="section-title">卡片样式</text>
        <view class="preview-card">
          <view class="card-header">
            <text class="card-title">聚会卡片示例</text>
            <view class="card-badge">
              <text>热门</text>
            </view>
          </view>
          <view class="card-body">
            <text class="card-desc">这是一个示例卡片，展示当前主题的卡片样式效果</text>
          </view>
          <view class="card-footer">
            <view class="card-price">
              <text class="price-label">¥</text>
              <text class="price-value">99</text>
            </view>
            <view class="card-action">
              <text>立即报名</text>
            </view>
          </view>
        </view>
      </view>

      <view class="preview-section">
        <text class="section-title">按钮样式</text>
        <view class="button-group">
          <button class="preview-btn primary">
            <text>主要按钮</text>
          </button>
          <button class="preview-btn secondary">
            <text>次要按钮</text>
          </button>
          <button class="preview-btn outline">
            <text>描边按钮</text>
          </button>
        </view>
      </view>

      <view class="preview-section">
        <text class="section-title">标签样式</text>
        <view class="tag-group">
          <view class="preview-tag">
            <text>派对</text>
          </view>
          <view class="preview-tag">
            <text>音乐</text>
          </view>
          <view class="preview-tag">
            <text>运动</text>
          </view>
          <view class="preview-tag">
            <text>艺术</text>
          </view>
        </view>
      </view>

      <view class="preview-section">
        <text class="section-title">状态颜色</text>
        <view class="status-group">
          <view class="status-item success">
            <text class="status-icon">✓</text>
            <text class="status-text">成功</text>
          </view>
          <view class="status-item warning">
            <text class="status-icon">!</text>
            <text class="status-text">警告</text>
          </view>
          <view class="status-item error">
            <text class="status-icon">×</text>
            <text class="status-text">错误</text>
          </view>
        </view>
      </view>

      <view class="preview-section">
        <text class="section-title">输入框样式</text>
        <view class="input-group">
          <view class="preview-input">
            <text class="input-placeholder">请输入搜索关键词</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { onMounted } from 'vue'
import themeManager from '@/utils/theme.js'
import ThemeSwitch from '@/components/theme-switch.vue'

onMounted(() => {
  themeManager.applyTheme(themeManager.getCurrentTheme())
})
</script>

<style lang="scss" scoped>
.theme-preview-container {
  min-height: 100vh;
  background: var(--theme-background);
  padding-bottom: 40rpx;
}

.preview-header {
  padding: 60rpx 40rpx 40rpx;
  text-align: center;
}

.preview-title {
  display: block;
  font-size: 48rpx;
  font-weight: bold;
  color: var(--theme-text);
  margin-bottom: 20rpx;
}

.preview-subtitle {
  display: block;
  font-size: 28rpx;
  color: var(--theme-text-secondary);
}

.theme-switch-wrapper {
  margin: 20rpx;
}

.preview-content {
  padding: 20rpx;
}

.preview-section {
  margin-bottom: 40rpx;
}

.section-title {
  display: block;
  font-size: 32rpx;
  font-weight: bold;
  color: var(--theme-text);
  margin-bottom: 20rpx;
}

.preview-card {
  background: var(--theme-surface);
  border-radius: var(--theme-border-radius);
  padding: 30rpx;
  box-shadow: var(--theme-shadow);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.card-title {
  font-size: 32rpx;
  font-weight: bold;
  color: var(--theme-text);
}

.card-badge {
  padding: 8rpx 20rpx;
  background: var(--theme-accent);
  border-radius: 30rpx;
  font-size: 24rpx;
  color: #ffffff;
}

.card-body {
  margin-bottom: 20rpx;
}

.card-desc {
  font-size: 28rpx;
  color: var(--theme-text-secondary);
  line-height: 1.6;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-price {
  display: flex;
  align-items: baseline;
}

.price-label {
  font-size: 24rpx;
  color: var(--theme-accent);
  margin-right: 5rpx;
}

.price-value {
  font-size: 48rpx;
  font-weight: bold;
  color: var(--theme-accent);
}

.card-action {
  padding: 20rpx 40rpx;
  background: var(--theme-accent);
  border-radius: 30rpx;
  font-size: 28rpx;
  color: #ffffff;
  font-weight: bold;
}

.button-group {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.preview-btn {
  height: 90rpx;
  border-radius: 45rpx;
  font-size: 32rpx;
  font-weight: bold;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;

  &::after {
    border: none;
  }

  &.primary {
    background: var(--theme-accent);
    color: #ffffff;
  }

  &.secondary {
    background: var(--theme-primary);
    color: #ffffff;
  }

  &.outline {
    background: transparent;
    border: 2rpx solid var(--theme-primary);
    color: var(--theme-primary);
  }
}

.tag-group {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.preview-tag {
  padding: 15rpx 30rpx;
  background: var(--theme-primary);
  border-radius: 30rpx;
  font-size: 28rpx;
  color: #ffffff;
}

.status-group {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.status-item {
  display: flex;
  align-items: center;
  padding: 30rpx;
  background: var(--theme-surface);
  border-radius: var(--theme-border-radius);

  &.success {
    border-left: 6rpx solid var(--theme-success);
  }

  &.warning {
    border-left: 6rpx solid var(--theme-warning);
  }

  &.error {
    border-left: 6rpx solid var(--theme-error);
  }
}

.status-icon {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  font-weight: bold;
  color: #ffffff;
  margin-right: 20rpx;

  .success & {
    background: var(--theme-success);
  }

  .warning & {
    background: var(--theme-warning);
  }

  .error & {
    background: var(--theme-error);
  }
}

.status-text {
  font-size: 28rpx;
  color: var(--theme-text);
}

.input-group {
  padding: 20rpx 0;
}

.preview-input {
  height: 90rpx;
  background: var(--theme-surface);
  border-radius: 45rpx;
  padding: 0 40rpx;
  display: flex;
  align-items: center;
  border: 2rpx solid var(--theme-border);
}

.input-placeholder {
  font-size: 28rpx;
  color: var(--theme-text-secondary);
}
</style>
