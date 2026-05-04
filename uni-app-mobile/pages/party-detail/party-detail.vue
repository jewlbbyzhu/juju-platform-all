<template>
  <view class="party-detail-container">
    <scroll-view scroll-y class="detail-scroll">
      <!-- 封面图片 -->
      <view class="hero-section">
        <image 
          class="hero-image" 
          :src="party.coverImage || '/static/default-party.png'" 
          mode="aspectFill"
          @error="handleImageError"
        ></image>
        <view class="hero-overlay">
          <view class="status-badge" :class="getStatusClass(party.status)">
            <text>{{ getStatusText(party.status) }}</text>
          </view>
        </view>
      </view>

      <!-- 基本信息 -->
      <view class="info-section">
        <view class="title-row">
          <text class="party-title">{{ party.title }}</text>
          <view class="share-btn" @tap="shareParty">
            <text class="share-icon">📤</text>
          </view>
        </view>

        <!-- 分类标签 -->
        <view class="tags-row">
          <text class="tag category-tag" :class="getCategoryClass(party.category)">
            {{ getCategoryText(party.category) }}
          </text>
          <text class="tag gender-tag" v-if="party.genderRestriction && party.genderRestriction !== 0">
            {{ getGenderText(party.genderRestriction) }}
          </text>
          <text class="tag age-tag" v-if="party.minAge || party.maxAge">
            {{ party.minAge || 0 }}-{{ party.maxAge || 99 }}岁
          </text>
        </view>

        <!-- 组织者信息 -->
        <view class="organizer-row">
          <image 
            class="organizer-avatar" 
            :src="party.organizer?.avatar || '/static/default-avatar.png'"
            mode="aspectFill"
          ></image>
          <view class="organizer-info">
            <text class="organizer-name">{{ party.organizer?.nickname || '未知组织者' }}</text>
            <text class="organizer-label">组织者</text>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { partyApi } from '@/api/party';

const party = ref({});
const partyId = ref('');
const loading = ref(false);

onLoad((options) => {
  if (options.id) {
    partyId.value = options.id;
    loadPartyDetail(options.id);
  }
});

const loadPartyDetail = async (id) => {
  loading.value = true;
  try {
    const res = await partyApi.getPartyDetail(id);
    if (res.code === 0) {
      party.value = res.data;
    } else {
      uni.showToast({
        title: res.message || '加载失败',
        icon: 'none'
      });
    }
  } catch (error) {
    // console.error('加载聚会详情失败:', error);
    uni.showToast({
      title: '网络错误',
      icon: 'none'
    });
  } finally {
    loading.value = false;
  }
};

const handleImageError = () => {
  // console.log('图片加载失败');
};

const shareParty = () => {
  uni.showShareMenu({
    withShareTicket: true,
    menus: ['shareAppMessage', 'shareTimeline']
  });
};

const onShareAppMessage = () => {
  return {
    title: party.value?.title ? `来${party.value.title}一起玩！` : '发现精彩聚会 - 聚聚',
    path: `/pages/party-detail/party-detail?id=${party.value?.id || ''}`,
    imageUrl: party.value?.coverImage || '/static/share-cover.png'
  };
};

const onShareTimeline = () => {
  return {
    title: party.value?.title ? `来${party.value.title}一起玩！` : '发现精彩聚会 - 聚聚',
    query: `id=${party.value?.id || ''}`,
    imageUrl: party.value?.coverImage || '/static/share-cover.png'
  };
};

const getStatusClass = (status) => {
  const map = {
    0: 'status-pending',
    1: 'status-active',
    2: 'status-full',
    3: 'status-ended',
    4: 'status-cancelled'
  };
  return map[status] || 'status-pending';
};

const getStatusText = (status) => {
  const map = {
    0: '待审核',
    1: '报名中',
    2: '已满员',
    3: '已结束',
    4: '已取消'
  };
  return map[status] || '未知';
};

const getCategoryClass = (category) => {
  return `category-${category || 'other'}`;
};

const getCategoryText = (category) => {
  const map = {
    'dining': '聚餐',
    'sports': '运动',
    'game': '游戏',
    'travel': '旅行',
    'study': '学习',
    'party': '派对',
    'other': '其他'
  };
  return map[category] || '其他';
};

const getGenderText = (restriction) => {
  const map = {
    1: '仅限男生',
    2: '仅限女生'
  };
  return map[restriction] || '';
};
</script>

<style lang="scss" scoped>
.party-detail-container {
  min-height: 100vh;
  background: #f5f5f5;
}

.detail-scroll {
  height: 100vh;
}

.hero-section {
  position: relative;
  width: 100%;
  height: 400rpx;
}

.hero-image {
  width: 100%;
  height: 100%;
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding: 20rpx;
}

.status-badge {
  display: inline-block;
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  font-size: 24rpx;
  color: #fff;
  
  &.status-pending { background: #ff9800; }
  &.status-active { background: #4caf50; }
  &.status-full { background: #f44336; }
  &.status-ended { background: #9e9e9e; }
  &.status-cancelled { background: #666; }
}

.info-section {
  padding: 30rpx;
  background: #fff;
  margin-bottom: 20rpx;
}

.title-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20rpx;
}

.party-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  flex: 1;
  margin-right: 20rpx;
}

.share-btn {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  border-radius: 30rpx;
}

.share-icon {
  font-size: 28rpx;
}

.tags-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-bottom: 30rpx;
}

.tag {
  padding: 8rpx 16rpx;
  border-radius: 8rpx;
  font-size: 24rpx;
  
  &.category-tag {
    background: #e3f2fd;
    color: #1976d2;
  }
  
  &.gender-tag {
    background: #fce4ec;
    color: #c2185b;
  }
  
  &.age-tag {
    background: #f3e5f5;
    color: #7b1fa2;
  }
}

.organizer-row {
  display: flex;
  align-items: center;
  padding: 20rpx 0;
  border-top: 1rpx solid #eee;
}

.organizer-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 40rpx;
  margin-right: 20rpx;
}

.organizer-info {
  flex: 1;
}

.organizer-name {
  font-size: 30rpx;
  color: #333;
  font-weight: 500;
  display: block;
}

.organizer-label {
  font-size: 24rpx;
  color: #999;
}
</style>
