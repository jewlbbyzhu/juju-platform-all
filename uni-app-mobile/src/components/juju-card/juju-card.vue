<template>
  <view
    class="juju-card"
    :class="[
      `juju-card--${variant}`,
      {
        'juju-card--pressable': pressable,
        'juju-card--hover': hover,
      }
    ]"
    :style="customStyle"
    @tap="handleTap"
  >
    <view v-if="$slots.header || title" class="juju-card__header">
      <slot name="header">
        <text class="juju-card__title">{{ title }}</text>
        <text v-if="subtitle" class="juju-card__subtitle">{{ subtitle }}</text>
      </slot>
    </view>

    <view class="juju-card__body" :class="{ 'juju-card__body--no-padding': noPadding }">
      <slot />
    </view>

    <view v-if="$slots.footer" class="juju-card__footer">
      <slot name="footer" />
    </view>
  </view>
</template>

<script>
export default {
  name: 'JujuCard',
  props: {
    variant: {
      type: String,
      default: 'default',
      validator: (value) => ['default', 'elevated', 'outlined', 'ghost'].includes(value)
    },
    title: {
      type: String,
      default: ''
    },
    subtitle: {
      type: String,
      default: ''
    },
    pressable: {
      type: Boolean,
      default: false
    },
    hover: {
      type: Boolean,
      default: false
    },
    noPadding: {
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
      if (this.pressable) {
        this.$emit('tap', e);
      }
    }
  }
};
</script>

<style lang="scss" scoped>
@use '../../styles/variables' as *;

.juju-card {
  background: $bg-primary;
  border-radius: $radius-lg;
  overflow: hidden;
  transition: all $duration-normal $ease-in-out;

  // 变体样式
  &--default {
    border: 2rpx solid $border-light;
  }

  &--elevated {
    box-shadow: $shadow-sm;

    &:hover,
    &.juju-card--hover {
      box-shadow: $shadow-md;
    }
  }

  &--outlined {
    border: 2rpx solid $border-default;
    background: transparent;
  }

  &--ghost {
    background: transparent;
  }

  // 可点击状态
  &--pressable {
    cursor: pointer;

    &:active {
      transform: translateY(-4rpx);
      box-shadow: $shadow-md;
    }
  }

  // 头部
  &__header {
    padding: $space-md $space-md $space-sm;
    border-bottom: 2rpx solid $border-light;
  }

  &__title {
    display: block;
    font-size: $text-lg;
    font-weight: $font-semibold;
    color: $text-primary;
  }

  &__subtitle {
    display: block;
    font-size: $text-sm;
    color: $text-secondary;
    margin-top: $space-xs;
  }

  // 内容区
  &__body {
    padding: $space-md;

    &--no-padding {
      padding: 0;
    }
  }

  // 底部
  &__footer {
    padding: $space-sm $space-md $space-md;
    border-top: 2rpx solid $border-light;
  }
}
</style>
