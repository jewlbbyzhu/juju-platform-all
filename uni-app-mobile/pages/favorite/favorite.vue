<template>
  <view class="container">
    <view class="header">
      <text class="title">我的收藏</text>
    </view>
    <view class="empty-state" v-if="favorites.length === 0">
      <text class="empty-text">暂无收藏</text>
      <text class="empty-tip">遇到喜欢的聚会，点击收藏即可在这里查看</text>
    </view>
    <view class="favorite-list" v-else>
      <view class="favorite-item" v-for="(item, index) in favorites" :key="index" @tap="goToDetail(item.id)">
        <image class="cover" :src="item.cover" mode="aspectFill" />
        <view class="info">
          <text class="name">{{item.name}}</text>
          <text class="time">{{item.time}}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      favorites: []
    }
  },
  onLoad() {
    this.loadFavorites()
  },
  methods: {
    loadFavorites() {
      // TODO: 从 API 加载收藏列表
      this.favorites = []
    },
    goToDetail(id) {
      uni.navigateTo({
        url: `/pages/party-detail/party-detail?id=${id}`
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background: #0a0a0a;
  padding: 30rpx;
}
.header {
  margin-bottom: 40rpx;
}
.title {
  font-size: 36rpx;
  font-weight: bold;
  color: #ffffff;
}
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 200rpx;
}
.empty-text {
  font-size: 32rpx;
  color: #666;
  margin-bottom: 20rpx;
}
.empty-tip {
  font-size: 26rpx;
  color: #444;
}
.favorite-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}
.favorite-item {
  display: flex;
  background: #1a1a1a;
  border-radius: 16rpx;
  overflow: hidden;
}
.cover {
  width: 200rpx;
  height: 200rpx;
}
.info {
  flex: 1;
  padding: 24rpx;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.name {
  font-size: 30rpx;
  color: #ffffff;
  font-weight: bold;
  margin-bottom: 12rpx;
}
.time {
  font-size: 24rpx;
  color: #888;
}
</style>
