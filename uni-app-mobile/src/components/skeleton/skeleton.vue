<template>
  <view class="skeleton-container" :style="{ backgroundColor: bgColor }">
    <!-- 骨架屏内容 -->
    <view v-for="(row, rowIndex) in rows" :key="rowIndex" class="skeleton-row">
      <view
        v-for="(col, colIndex) in row"
        :key="colIndex"
        class="skeleton-item"
        :class="{ animated: animated, round: col.round }"
        :style="{
          width: col.width,
          height: col.height,
          marginRight: col.marginRight,
          marginBottom: col.marginBottom,
          borderRadius: col.borderRadius
        }"
      />
    </view>
  </view>
</template>

<script setup lang="ts">
interface SkeletonItem {
  width: string
  height: string
  marginRight?: string
  marginBottom?: string
  borderRadius?: string
  round?: boolean
}

interface Props {
  // 行数配置
  rows: SkeletonItem[][]
  // 是否显示动画
  animated?: boolean
  // 背景颜色
  bgColor?: string
}

withDefaults(defineProps<Props>(), {
  animated: true,
  bgColor: '#1a1a1a'
})
</script>

<style lang="scss" scoped>
.skeleton-container {
  padding: 20rpx;
}

.skeleton-row {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.skeleton-item {
  background-color: #2a2a2a;

  &.animated {
    animation: skeleton-loading 1.5s ease-in-out infinite;
  }

  &.round {
    border-radius: 50%;
  }
}

@keyframes skeleton-loading {
  0% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.6;
  }
}
</style>
