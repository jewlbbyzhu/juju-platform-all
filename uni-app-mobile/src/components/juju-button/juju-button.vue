<template>
  <button
    class="juju-button"
    :class="[
      `juju-button--${variant}`,
      `juju-button--${size}`,
      {
        'juju-button--block': block,
        'juju-button--rounded': rounded,
        'juju-button--disabled': disabled,
        'juju-button--loading': loading,
      }
    ]"
    :disabled="disabled || loading"
    :style="customStyle"
    @tap="handleTap"
  >
    <view v-if="loading" class="juju-button__loader">
      <view class="juju-button__spinner" />
    </view>
    <view v-else class="juju-button__content">
      <image
        v-if="icon && !icon.startsWith('http')"
        class="juju-button__icon"
        :src="icon"
        mode="aspectFit"
      />
      <text v-else-if="icon" class="juju-button__icon-text">{{ icon }}</text>
      <slot />
    </view>
  </button>
</template>

<script>
export default {
  name: 'JujuButton',
  props: {
    variant: {
      type: String,
      default: 'primary',
      validator: (value) => ['primary', 'secondary', 'outline', 'ghost', 'danger'].includes(value)
    },
    size: {
      type: String,
      default: 'md',
      validator: (value) => ['sm', 'md', 'lg'].includes(value)
    },
    icon: {
      type: String,
      default: ''
    },
    block: {
      type: Boolean,
      default: false
    },
    rounded: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    },
    customStyle: {
      type: Object,
      default: () => ({})
    }
  },
  methods: {
    handleTap(e) {
      if (!this.disabled && !this.loading) {
        this.$emit('tap', e);
      }
    }
  }
};
</script>

<style lang="scss" scoped>
@use '../../styles/variables' as *;

.juju-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  font-weight: $font-semibold;
  transition: all $duration-fast $ease-in-out;
  position: relative;
  overflow: hidden;

  &::after {
    border: none;
  }

  &:active:not(:disabled) {
    transform: scale(0.98);
  }

  // 变体样式
  &--primary {
    background: $primary-gradient;
    color: $text-inverse;
    box-shadow: $shadow-primary;

    &:active:not(:disabled) {
      box-shadow: 0 2rpx 8rpx rgba(255, 107, 53, 0.2);
    }
  }

  &--secondary {
    background: $gray-100;
    color: $gray-700;

    &:active:not(:disabled) {
      background: $gray-200;
    }
  }

  &--outline {
    background: transparent;
    border: 2rpx solid $border-default;
    color: $gray-700;

    &:active:not(:disabled) {
      background: $gray-50;
    }
  }

  &--ghost {
    background: transparent;
    color: $gray-600;

    &:active:not(:disabled) {
      background: $gray-100;
    }
  }

  &--danger {
    background: $error-gradient;
    color: $text-inverse;
    box-shadow: $shadow-error;

    &:active:not(:disabled) {
      box-shadow: 0 2rpx 8rpx rgba(239, 68, 68, 0.2);
    }
  }

  // 尺寸样式
  &--sm {
    padding: $space-xs $space-sm;
    font-size: $text-sm;
    height: $btn-height-sm;
    border-radius: $radius-md;
  }

  &--md {
    padding: $space-sm $space-md;
    font-size: $text-base;
    height: $btn-height-md;
    border-radius: $radius-md;
  }

  &--lg {
    padding: $space-md $space-lg;
    font-size: $text-lg;
    height: $btn-height-lg;
    border-radius: $radius-lg;
  }

  // 圆角样式
  &--rounded {
    border-radius: $radius-full !important;
  }

  // 块级样式
  &--block {
    width: 100%;
  }

  // 禁用状态
  &--disabled,
  &:disabled {
    opacity: 0.5;
    pointer-events: none;
  }

  // 加载状态
  &--loading {
    pointer-events: none;
  }

  // 内容区域
  &__content {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__icon {
    width: 32rpx;
    height: 32rpx;
    margin-right: $space-xs;
  }

  &__icon-text {
    font-size: 32rpx;
    margin-right: $space-xs;
  }

  // 加载动画
  &__loader {
    @include flex-center;
  }

  &__spinner {
    width: 32rpx;
    height: 32rpx;
    border: 4rpx solid rgba(255, 255, 255, 0.3);
    border-top-color: #ffffff;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
