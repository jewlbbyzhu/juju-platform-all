<template>
  <view class="home-container">
    <!-- 顶部导航栏 -->
    <view class="nav-header">
      <view class="nav-left" @tap="showCityPicker">
        <view class="location-icon">
          <text class="iconfont icon-location"></text>
        </view>
        <text class="city-name">{{ selectedCity || '选择城市' }}</text>
        <text class="iconfont icon-arrow-down"></text>
      </view>
      <view class="nav-center">
        <text class="page-title">发现聚会</text>
      </view>
      <view class="nav-right" @tap="goToSearch">
        <text class="iconfont icon-search"></text>
      </view>
    </view>

    <!-- 分类标签 -->
    <view class="category-section">
      <scroll-view class="category-scroll" scroll-x show-scrollbar="false">
        <view
          class="category-item"
          :class="{ active: currentCategory === '' }"
          @tap="selectCategory('')"
        >
          <text>全部</text>
        </view>
        <view
          class="category-item"
          :class="{ active: currentCategory === 'party' }"
          @tap="selectCategory('party')"
        >
          <text class="iconfont icon-party"></text>
          <text>派对</text>
        </view>
        <view
          class="category-item"
          :class="{ active: currentCategory === 'music' }"
          @tap="selectCategory('music')"
        >
          <text class="iconfont icon-music"></text>
          <text>音乐</text>
        </view>
        <view
          class="category-item"
          :class="{ active: currentCategory === 'sports' }"
          @tap="selectCategory('sports')"
        >
          <text class="iconfont icon-sports"></text>
          <text>运动</text>
        </view>
        <view
          class="category-item"
          :class="{ active: currentCategory === 'art' }"
          @tap="selectCategory('art')"
        >
          <text class="iconfont icon-art"></text>
          <text>艺术</text>
        </view>
        <view
          class="category-item"
          :class="{ active: currentCategory === 'food' }"
          @tap="selectCategory('food')"
        >
          <text class="iconfont icon-food"></text>
          <text>美食</text>
        </view>
        <view
          class="category-item"
          :class="{ active: currentCategory === 'outdoor' }"
          @tap="selectCategory('outdoor')"
        >
          <text class="iconfont icon-outdoor"></text>
          <text>户外</text>
        </view>
        <view
          class="category-item"
          :class="{ active: currentCategory === 'gaming' }"
          @tap="selectCategory('gaming')"
        >
          <text class="iconfont icon-gaming"></text>
          <text>游戏</text>
        </view>
      </scroll-view>
    </view>

    <!-- 聚会列表 -->
    <scroll-view
      class="party-list"
      scroll-y
      @scrolltolower="loadMore"
      @refresherrefresh="onRefresh"
      :refresher-enabled="true"
      :refresher-triggered="refreshing"
    >
      <!-- 骨架屏加载状态 -->
      <view v-if="loading && parties.length === 0" class="skeleton-wrapper">
        <view v-for="i in 3" :key="i" class="party-skeleton">
          <view class="skeleton-cover" />
          <view class="skeleton-content">
            <view class="skeleton-line title" />
            <view class="skeleton-line meta" />
            <view class="skeleton-line footer" />
          </view>
        </view>
      </view>

      <!-- 聚会卡片列表 -->
      <view
        v-else
        class="party-card"
        v-for="(party, index) in parties"
        :key="party.id"
        :style="{ animationDelay: `${index * 0.05}s` }"
        @tap="goToDetail(party.id)"
      >
        <!-- 封面图 -->
        <view class="card-cover-wrapper">
          <image
            class="card-cover"
            :src="party.images?.[0] || '/static/default-party.png'"
            mode="aspectFill"
            lazy-load
            @error="handleImageError"
          />
          <view class="cover-overlay">
            <view class="status-badge" v-if="party.status === 'upcoming'">
              <text>即将开始</text>
            </view>
            <view class="price-badge">
              <text class="price-symbol">¥</text>
              <text class="price-value">{{ getMinPrice(party.ticket_types) }}</text>
              <text class="price-unit">起</text>
            </view>
          </view>
        </view>

        <!-- 卡片内容 -->
        <view class="card-content">
          <!-- 标题 -->
          <text class="party-title">{{ party.title }}</text>

          <!-- 描述 -->
          <text class="party-desc" v-if="party.description">{{ party.description }}</text>

          <!-- 元信息 -->
          <view class="party-meta">
            <view class="meta-item">
              <text class="iconfont icon-location"></text>
              <text class="meta-text">{{ party.address || '地点待定' }}</text>
            </view>
            <view class="meta-item">
              <text class="iconfont icon-time"></text>
              <text class="meta-text">{{ formatPartyTime(party.start_time) }}</text>
            </view>
            <view class="meta-item">
              <text class="iconfont icon-people"></text>
              <text class="meta-text">{{ party.participant_count || 0 }}/{{ party.max_participants || '不限' }}人</text>
            </view>
          </view>

          <!-- 标签 -->
          <view class="party-tags" v-if="party.tags && party.tags.length > 0">
            <text class="tag" v-for="tag in party.tags.slice(0, 3)" :key="tag">{{ tag }}</text>
          </view>

          <!-- 底部操作栏 -->
          <view class="card-footer">
            <view class="organizer" @tap.stop="goToUserProfile(party.organizer_id)">
              <image
                class="organizer-avatar"
                :src="party.organizer?.avatar || '/static/default-avatar.png'"
                mode="aspectFill"
              />
              <text class="organizer-name">{{ party.organizer?.nickname || '匿名用户' }}</text>
            </view>
            <view class="actions">
              <view class="action-btn" @tap.stop="toggleLike(party)">
                <text class="iconfont" :class="party.is_liked ? 'icon-heart-filled' : 'icon-heart'"></text>
                <text class="action-count">{{ party.like_count || 0 }}</text>
              </view>
              <view class="action-btn" @tap.stop="showComments(party)">
                <text class="iconfont icon-comment"></text>
                <text class="action-count">{{ party.comment_count || 0 }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 加载更多 -->
      <view class="loading-more" v-if="loading && parties.length > 0">
        <view class="loading-spinner" />
        <text class="loading-text">加载中...</text>
      </view>

      <!-- 没有更多 -->
      <view class="no-more" v-if="!hasMore && parties.length > 0">
        <text>没有更多了</text>
      </view>

      <!-- 空状态 -->
      <view class="empty-state" v-if="parties.length === 0 && !loading">
        <image class="empty-icon" src="/static/empty-party.png" mode="aspectFit" />
        <text class="empty-title">暂无聚会</text>
        <text class="empty-desc">该城市暂时没有聚会活动</text>
      </view>
    </scroll-view>

    <!-- 城市选择器 -->
    <view class="city-picker-modal" v-if="showCityPickerModal" @tap="hideCityPicker">
      <view class="picker-content" @tap.stop>
        <view class="picker-header">
          <text class="picker-title">选择城市</text>
          <view class="close-btn" @tap="hideCityPicker">
            <text class="iconfont icon-close"></text>
          </view>
        </view>
        <scroll-view class="city-list" scroll-y>
          <view
            class="city-item"
            :class="{ active: selectedCity === city }"
            v-for="city in cityList"
            :key="city"
            @tap="selectCity(city)"
          >
            <text>{{ city }}</text>
            <text class="iconfont icon-check" v-if="selectedCity === city"></text>
          </view>
        </scroll-view>
      </view>
    </view>
  </view>
</template>

<script>
import { partyApi } from '@/api/party';
import { socialApi } from '@/api/social';

export default {
  data() {
    return {
      currentCategory: '',
      parties: [],
      page: 1,
      pageSize: 10,
      loading: false,
      refreshing: false,
      hasMore: true,
      selectedCity: '',
      showCityPickerModal: false,
      cityList: [
        '北京', '上海', '广州', '深圳', '杭州', '成都', '重庆', '武汉', '西安', '南京',
        '天津', '苏州', '长沙', '郑州', '东莞', '青岛', '沈阳', '宁波', '昆明'
      ]
    };
  },

  onLoad() {
    this.loadCachedCity();
    this.loadParties();
  },

  onPullDownRefresh() {
    this.onRefresh();
  },

  methods: {
    loadCachedCity() {
      try {
        const cachedCity = uni.getStorageSync('selectedCity');
        if (cachedCity) {
          this.selectedCity = cachedCity;
        }
      } catch (error) {
        // console.error('加载缓存城市失败:', error);
      }
    },

    showCityPicker() {
      this.showCityPickerModal = true;
    },

    hideCityPicker() {
      this.showCityPickerModal = false;
    },

    selectCity(city) {
      this.selectedCity = city;
      this.hideCityPicker();

      try {
        uni.setStorageSync('selectedCity', city);
      } catch (error) {
        // console.error('缓存城市失败:', error);
      }

      this.loadParties(true);
    },

    async loadParties(reset = false) {
      if (reset) {
        this.page = 1;
        this.parties = [];
        this.hasMore = true;
      }

      if (this.loading || !this.hasMore) return;

      this.loading = true;

      try {
        const params = {
          page: this.page,
          pageSize: this.pageSize
        };

        if (this.currentCategory) {
          params.category = this.currentCategory;
        }

        if (this.selectedCity) {
          params.city = this.selectedCity;
        }

        const res = await partyApi.getParties(params);

        if (res.code === 0) {
          const newParties = res.data.list || [];
          if (reset) {
            this.parties = newParties;
          } else {
            this.parties = [...this.parties, ...newParties];
          }

          this.hasMore = newParties.length >= this.pageSize;
          this.page++;
        }
      } catch (error) {
        uni.showToast({
          title: '加载失败',
          icon: 'none'
        });
      } finally {
        this.loading = false;
      }
    },

    goToSearch() {
      uni.navigateTo({
        url: '/pages/search/search'
      });
    },

    selectCategory(category) {
      if (this.currentCategory === category) return;
      this.currentCategory = category;
      this.loadParties(true);
    },

    goToDetail(id) {
      uni.navigateTo({
        url: `/pages/party-detail/party-detail?id=${id}`
      });
    },

    goToUserProfile(userId) {
      uni.navigateTo({
        url: `/pages/user-profile/user-profile?id=${userId}`
      });
    },

    onRefresh() {
      this.refreshing = true;
      this.loadParties(true).then(() => {
        this.refreshing = false;
        uni.stopPullDownRefresh();
      });
    },

    loadMore() {
      this.loadParties();
    },

    async toggleLike(party) {
      try {
        if (party.is_liked) {
          await socialApi.unlikeParty(party.id);
          party.is_liked = false;
          party.like_count = Math.max(0, party.like_count - 1);
        } else {
          await socialApi.likeParty(party.id);
          party.is_liked = true;
          party.like_count = (party.like_count || 0) + 1;
        }
      } catch (error) {
        uni.showToast({
          title: '操作失败',
          icon: 'none'
        });
      }
    },

    showComments(party) {
      uni.navigateTo({
        url: `/pages/party-detail/party-detail?id=${party.id}&tab=comments`
      });
    },

    getMinPrice(ticketTypes) {
      if (!ticketTypes || ticketTypes.length === 0) return 0;
      const prices = ticketTypes
        .filter(t => t.price > 0)
        .map(t => parseFloat(t.price));
      return prices.length > 0 ? Math.min(...prices) : 0;
    },

    formatPartyTime(time) {
      if (!time) return '时间待定';
      const date = new Date(time);
      const now = new Date();
      const diff = date - now;
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));

      if (days === 0) {
        return '今天 ' + this.formatTime(date);
      } else if (days === 1) {
        return '明天 ' + this.formatTime(date);
      } else if (days < 7) {
        return days + '天后 ' + this.formatTime(date);
      } else {
        return this.formatDate(date) + ' ' + this.formatTime(date);
      }
    },

    formatDate(date) {
      return `${date.getMonth() + 1}月${date.getDate()}日`;
    },

    formatTime(date) {
      return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    },

    handleImageError() {
      // 图片加载失败处理
    },

    onShareAppMessage() {
      return {
        title: '发现身边的精彩聚会 - 聚聚',
        path: '/pages/index/index',
        imageUrl: '/static/share-cover.png'
      };
    },

    onShareTimeline() {
      return {
        title: '发现身边的精彩聚会 - 聚聚',
        query: '',
        imageUrl: '/static/share-cover.png'
      };
    }
  }
};
</script>

<style lang="scss">
// 变量定义
$primary: #FF6B35;
$primary-light: #FF8E53;
$primary-dark: #E55A2B;
$bg-dark: #0a0a0a;
$bg-card: #141414;
$bg-hover: #1a1a1a;
$text-primary: #ffffff;
$text-secondary: rgba(255, 255, 255, 0.7);
$text-tertiary: rgba(255, 255, 255, 0.5);
$border-light: rgba(255, 255, 255, 0.1);

.home-container {
  min-height: 100vh;
  background: $bg-dark;
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
}

// 顶部导航栏
.nav-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 32rpx;
  background: $bg-dark;
  border-bottom: 1rpx solid $border-light;

  .nav-left {
    display: flex;
    align-items: center;
    gap: 8rpx;
    padding: 12rpx 20rpx;
    background: $bg-card;
    border-radius: 32rpx;

    .location-icon {
      color: $primary;
      font-size: 28rpx;
    }

    .city-name {
      font-size: 26rpx;
      color: $text-primary;
      font-weight: 500;
    }

    .icon-arrow-down {
      font-size: 20rpx;
      color: $text-tertiary;
    }
  }

  .nav-center {
    .page-title {
      font-size: 32rpx;
      font-weight: 600;
      color: $text-primary;
    }
  }

  .nav-right {
    width: 72rpx;
    height: 72rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    background: $bg-card;
    border-radius: 50%;

    .icon-search {
      font-size: 36rpx;
      color: $text-secondary;
    }
  }
}

// 分类标签
.category-section {
  background: $bg-dark;
  padding: 20rpx 0;
  border-bottom: 1rpx solid $border-light;

  .category-scroll {
    white-space: nowrap;
    padding: 0 24rpx;
  }

  .category-item {
    display: inline-flex;
    align-items: center;
    gap: 8rpx;
    padding: 16rpx 32rpx;
    margin-right: 16rpx;
    background: $bg-card;
    border-radius: 32rpx;
    transition: all 0.3s ease;

    text {
      font-size: 26rpx;
      color: $text-secondary;
    }

    .iconfont {
      font-size: 28rpx;
      color: $text-tertiary;
    }

    &.active {
      background: linear-gradient(135deg, $primary 0%, $primary-light 100%);

      text {
        color: #ffffff;
        font-weight: 600;
      }

      .iconfont {
        color: #ffffff;
      }
    }

    &:active {
      transform: scale(0.95);
    }
  }
}

// 聚会列表
.party-list {
  height: calc(100vh - 200rpx - constant(safe-area-inset-bottom));
  height: calc(100vh - 200rpx - env(safe-area-inset-bottom));
  padding: 24rpx;
}

// 骨架屏
.skeleton-wrapper {
  padding: 0 8rpx;

  .party-skeleton {
    background: $bg-card;
    border-radius: 24rpx;
    margin-bottom: 24rpx;
    overflow: hidden;

    .skeleton-cover {
      width: 100%;
      height: 320rpx;
      background: linear-gradient(90deg, $bg-hover 25%, #222 50%, $bg-hover 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
    }

    .skeleton-content {
      padding: 24rpx;

      .skeleton-line {
        height: 28rpx;
        background: $bg-hover;
        border-radius: 8rpx;
        margin-bottom: 16rpx;

        &.title {
          width: 70%;
        }

        &.meta {
          width: 50%;
        }

        &.footer {
          width: 40%;
        }
      }
    }
  }
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

// 聚会卡片
.party-card {
  background: $bg-card;
  border-radius: 24rpx;
  margin-bottom: 24rpx;
  overflow: hidden;
  animation: slideUp 0.4s ease-out backwards;
  transition: all 0.3s ease;

  &:active {
    transform: scale(0.98);
  }

  .card-cover-wrapper {
    position: relative;
    width: 100%;
    height: 320rpx;

    .card-cover {
      width: 100%;
      height: 100%;
    }

    .cover-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.6) 100%);
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 20rpx;

      .status-badge {
        padding: 8rpx 20rpx;
        background: rgba(16, 185, 129, 0.9);
        border-radius: 20rpx;

        text {
          font-size: 22rpx;
          color: #ffffff;
          font-weight: 500;
        }
      }

      .price-badge {
        display: flex;
        align-items: baseline;
        padding: 12rpx 24rpx;
        background: linear-gradient(135deg, $primary 0%, $primary-light 100%);
        border-radius: 24rpx;

        .price-symbol {
          font-size: 24rpx;
          color: #ffffff;
          font-weight: 600;
        }

        .price-value {
          font-size: 36rpx;
          color: #ffffff;
          font-weight: 700;
          margin: 0 4rpx;
        }

        .price-unit {
          font-size: 22rpx;
          color: rgba(255, 255, 255, 0.8);
        }
      }
    }
  }

  .card-content {
    padding: 24rpx;

    .party-title {
      font-size: 32rpx;
      font-weight: 600;
      color: $text-primary;
      margin-bottom: 12rpx;
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .party-desc {
      font-size: 26rpx;
      color: $text-secondary;
      margin-bottom: 16rpx;
      line-height: 1.5;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .party-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 20rpx;
      margin-bottom: 16rpx;

      .meta-item {
        display: flex;
        align-items: center;
        gap: 8rpx;

        .iconfont {
          font-size: 24rpx;
          color: $primary;
        }

        .meta-text {
          font-size: 24rpx;
          color: $text-tertiary;
        }
      }
    }

    .party-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 12rpx;
      margin-bottom: 20rpx;

      .tag {
        padding: 8rpx 16rpx;
        background: rgba(255, 107, 53, 0.1);
        border-radius: 8rpx;
        font-size: 22rpx;
        color: $primary;
      }
    }

    .card-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: 20rpx;
      border-top: 1rpx solid $border-light;

      .organizer {
        display: flex;
        align-items: center;
        gap: 12rpx;

        .organizer-avatar {
          width: 48rpx;
          height: 48rpx;
          border-radius: 50%;
        }

        .organizer-name {
          font-size: 24rpx;
          color: $text-secondary;
        }
      }

      .actions {
        display: flex;
        align-items: center;
        gap: 24rpx;

        .action-btn {
          display: flex;
          align-items: center;
          gap: 8rpx;

          .iconfont {
            font-size: 32rpx;
            color: $text-tertiary;

            &.icon-heart-filled {
              color: #EF4444;
            }
          }

          .action-count {
            font-size: 24rpx;
            color: $text-tertiary;
          }
        }
      }
    }
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// 加载更多
.loading-more {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  padding: 40rpx;

  .loading-spinner {
    width: 32rpx;
    height: 32rpx;
    border: 4rpx solid $border-light;
    border-top-color: $primary;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  .loading-text {
    font-size: 26rpx;
    color: $text-tertiary;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

// 没有更多
.no-more {
  text-align: center;
  padding: 40rpx;

  text {
    font-size: 26rpx;
    color: $text-tertiary;
  }
}

// 空状态
.empty-state {
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
  }
}

// 城市选择器
.city-picker-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  z-index: 1000;
  display: flex;
  align-items: flex-end;
  animation: fadeIn 0.3s ease;

  .picker-content {
    width: 100%;
    background: $bg-card;
    border-radius: 32rpx 32rpx 0 0;
    max-height: 70vh;
    animation: slideUp 0.3s ease;

    .picker-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 32rpx;
      border-bottom: 1rpx solid $border-light;

      .picker-title {
        font-size: 32rpx;
        font-weight: 600;
        color: $text-primary;
      }

      .close-btn {
        width: 64rpx;
        height: 64rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        background: $bg-hover;
        border-radius: 50%;

        .icon-close {
          font-size: 32rpx;
          color: $text-secondary;
        }
      }
    }

    .city-list {
      max-height: 50vh;
      padding: 16rpx 0;

      .city-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 28rpx 32rpx;
        transition: all 0.2s ease;

        text {
          font-size: 30rpx;
          color: $text-primary;
        }

        .icon-check {
          font-size: 32rpx;
          color: $primary;
        }

        &.active {
          background: rgba(255, 107, 53, 0.1);

          text {
            color: $primary;
            font-weight: 600;
          }
        }

        &:active {
          background: $bg-hover;
        }
      }
    }
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
