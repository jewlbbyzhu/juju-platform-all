<template>
  <view class="empty-state-container" :style="customStyle">
    <image 
      class="empty-icon" 
      :src="icon || defaultIcon" 
      mode="aspectFit"
    />
    <text class="empty-title">{{ title }}</text>
    <text class="empty-desc" v-if="description">{{ description }}</text>
    <button 
      v-if="showButton" 
      class="empty-btn"
      @tap="handleButtonClick"
    >
      {{ buttonText }}
    </button>
  </view>
</template>

<script>
/**
 * 统一空状态组件
 * @description 用于页面无数据时展示
 */
export default {
  name: 'EmptyState',
  props: {
    // 图标路径
    icon: {
      type: String,
      default: ''
    },
    // 标题
    title: {
      type: String,
      default: '暂无数据'
    },
    // 描述
    description: {
      type: String,
      default: ''
    },
    // 是否显示按钮
    showButton: {
      type: Boolean,
      default: false
    },
    // 按钮文字
    buttonText: {
      type: String,
      default: '去逛逛'
    },
    // 自定义样式
    customStyle: {
      type: Object,
      default: () => ({})
    }
  },
  computed: {
    defaultIcon() {
      // 根据主题返回不同图标
      return '/static/empty-default.png'
    }
  },
  methods: {
    handleButtonClick() {
      this.$emit('click')
    }
  }
}
</script>

<style lang="scss" scoped>
@use '../styles/variables' as *;

.empty-state-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 48rpx;
  
  .empty-icon {
    width: 240rpx;
    height: 240rpx;
    margin-bottom: 32rpx;
    opacity: 0.6;
  }
  
  .empty-title {
    font-size: 32rpx;
    font-weight: 600;
    color: $text-secondary;
    margin-bottom: 12rpx;
  }
  
  .empty-desc {
    font-size: 26rpx;
    color: $text-tertiary;
    margin-bottom: 40rpx;
    text-align: center;
  }
  
  .empty-btn {
    padding: 20rpx 60rpx;
    background: $primary-gradient;
    border-radius: 40rpx;
    font-size: 28rpx;
    color: #ffffff;
    font-weight: 600;
    border: none;
    
    &::after {
      border: none;
    }
    
    &:active {
      opacity: 0.8;
      transform: scale(0.98);
    }
  }
}
</style>
