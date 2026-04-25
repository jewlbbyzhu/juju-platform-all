<template>
  <view class="party-skeleton">
    <!-- 聚会卡片骨架屏 -->
    <view v-for="i in count" :key="i" class="party-card-skeleton">
      <!-- 封面图 -->
      <view class="cover-skeleton skeleton-bg animated" />
      
      <!-- 内容区域 -->
      <view class="content-skeleton">
        <!-- 标题 -->
        <view class="title-skeleton skeleton-bg animated" />
        
        <!-- 时间和地点 -->
        <view class="info-skeleton">
          <view class="info-item-skeleton skeleton-bg animated" />
          <view class="info-item-skeleton skeleton-bg animated short" />
        </view>
        
        <!-- 价格和操作 -->
        <view class="footer-skeleton">
          <view class="price-skeleton skeleton-bg animated" />
          <view class="avatar-skeleton skeleton-bg animated round" />
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
interface Props {
  count?: number
}

withDefaults(defineProps<Props>(), {
  count: 3
})
</script>

<style lang="scss" scoped>
.party-skeleton {
  padding: 20rpx;
}

.party-card-skeleton {
  background-color: #1a1a1a;
  border-radius: 16rpx;
  overflow: hidden;
  margin-bottom: 20rpx;
}

.cover-skeleton {
  width: 100%;
  height: 300rpx;
}

.content-skeleton {
  padding: 20rpx;
}

.title-skeleton {
  width: 70%;
  height: 36rpx;
  border-radius: 8rpx;
  margin-bottom: 16rpx;
}

.info-skeleton {
  margin-bottom: 16rpx;
}

.info-item-skeleton {
  width: 50%;
  height: 28rpx;
  border-radius: 6rpx;
  margin-bottom: 10rpx;
  
  &.short {
    width: 35%;
  }
}

.footer-skeleton {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price-skeleton {
  width: 120rpx;
  height: 32rpx;
  border-radius: 6rpx;
}

.avatar-skeleton {
  width: 48rpx;
  height: 48rpx;
  
  &.round {
    border-radius: 50%;
  }
}

.skeleton-bg {
  background-color: #2a2a2a;
}

.animated {
  animation: skeleton-loading 1.5s ease-in-out infinite;
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
