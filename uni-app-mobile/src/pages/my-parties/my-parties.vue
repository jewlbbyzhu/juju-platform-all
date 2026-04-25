<template>
  <view class="my-parties-container">
    <!-- 顶部导航 -->
    <view class="nav-header">
      <view class="nav-left" @tap="goBack">
        <text class="iconfont icon-arrow-left"></text>
      </view>
      <view class="nav-center">
        <text class="page-title">我的活动</text>
      </view>
      <view class="nav-right" @tap="createParty">
        <text class="iconfont icon-plus"></text>
      </view>
    </view>

    <!-- 角色切换 -->
    <view class="role-tabs">
      <view 
        class="role-tab" 
        :class="{ active: currentRole === 'organizer' }"
        @tap="switchRole('organizer')"
      >
        <text class="iconfont icon-crown"></text>
        <text>我组织的</text>
      </view>
      <view 
        class="role-tab" 
        :class="{ active: currentRole === 'participant' }"
        @tap="switchRole('participant')"
      >
        <text class="iconfont icon-ticket"></text>
        <text>我参与的</text>
      </view>
    </view>

    <!-- 状态筛选 - 仅在组织者角色显示 -->
    <view class="filter-section" v-if="currentRole === 'organizer'">
      <scroll-view class="filter-scroll" scroll-x show-scrollbar="false">
        <view
          class="filter-item"
          :class="{ active: currentTab === 'all' }"
          @tap="switchTab('all')"
        >
          <text>全部</text>
        </view>
        <view
          class="filter-item"
          :class="{ active: currentTab === 'upcoming' }"
          @tap="switchTab('upcoming')"
        >
          <text>即将开始</text>
        </view>
        <view
          class="filter-item"
          :class="{ active: currentTab === 'ongoing' }"
          @tap="switchTab('ongoing')"
        >
          <text>进行中</text>
        </view>
        <view
          class="filter-item"
          :class="{ active: currentTab === 'ended' }"
          @tap="switchTab('ended')"
        >
          <text>已结束</text>
        </view>
        <view
          class="filter-item"
          :class="{ active: currentTab === 'cancelled' }"
          @tap="switchTab('cancelled')"
        >
          <text>已取消</text>
        </view>
      </scroll-view>
    </view>

    <!-- 活动列表 -->
    <scroll-view 
      class="party-list" 
      scroll-y 
      @scrolltolower="loadMore"
      @refresherrefresh="onRefresh"
      :refresher-enabled="true"
      :refresher-triggered="refreshing"
    >
      <!-- 骨架屏 -->
      <view v-if="loading && parties.length === 0" class="skeleton-wrapper">
        <view v-for="i in 3" :key="i" class="party-skeleton">
          <view class="skeleton-thumb" />
          <view class="skeleton-content">
            <view class="skeleton-line title" />
            <view class="skeleton-line meta" />
          </view>
        </view>
      </view>

      <!-- 活动卡片 -->
      <view 
        class="party-card" 
        v-for="(party, index) in parties" 
        :key="party.id"
        :style="{ animationDelay: `${index * 0.05}s` }"
        @tap="goToDetail(party.id)"
      >
        <view class="card-main">
          <image class="party-thumb" :src="party.images?.[0] || '/static/default-party.png'" mode="aspectFill" />
          <view class="party-info">
            <view class="info-header">
              <text class="party-title">{{ party.title }}</text>
              <view class="party-status" :class="getStatusClass(party.status)">
                <text>{{ getStatusText(party.status) }}</text>
              </view>
            </view>
            <view class="party-meta">
              <view class="meta-item">
                <text class="iconfont icon-calendar"></text>
                <text>{{ formatDateTime(party.start_time) }}</text>
              </view>
              <view class="meta-item">
                <text class="iconfont icon-location"></text>
                <text>{{ party.address || '地点待定' }}</text>
              </view>
              <view class="meta-item">
                <text class="iconfont icon-people"></text>
                <text>{{ party.participant_count || 0 }}/{{ party.max_participants || '不限' }}人</text>
              </view>
            </view>
            <view class="party-stats" v-if="currentRole === 'organizer'">
              <view class="stat-item">
                <text class="stat-value">¥{{ party.total_revenue || 0 }}</text>
                <text class="stat-label">总收入</text>
              </view>
              <view class="stat-item">
                <text class="stat-value">{{ party.ticket_count || 0 }}</text>
                <text class="stat-label">已售票</text>
              </view>
              <view class="stat-item">
                <text class="stat-value">{{ party.view_count || 0 }}</text>
                <text class="stat-label">浏览量</text>
              </view>
            </view>
            <view class="ticket-info" v-else>
              <text class="ticket-type">{{ party.ticket_name || '普通票' }}</text>
              <text class="ticket-status" :class="getTicketStatusClass(party.ticket_status)">
                {{ getTicketStatusText(party.ticket_status) }}
              </text>
            </view>
          </view>
        </view>

        <!-- 操作按钮 -->
        <view class="card-actions" v-if="currentRole === 'organizer'">
          <button 
            class="action-btn secondary" 
            @tap.stop="viewStats(party)"
            v-if="party.status !== 'cancelled'"
          >
            <text class="iconfont icon-chart"></text>
            <text>数据</text>
          </button>
          <button 
            class="action-btn secondary" 
            @tap.stop="manageTickets(party)"
            v-if="party.status !== 'cancelled'"
          >
            <text class="iconfont icon-ticket"></text>
            <text>验票</text>
          </button>
          <button 
            class="action-btn secondary" 
            @tap.stop="shareParty(party)"
          >
            <text class="iconfont icon-share"></text>
            <text>分享</text>
          </button>
          <button 
            class="action-btn primary" 
            @tap.stop="editParty(party)"
            v-if="party.status === 'upcoming'"
          >
            <text>编辑</text>
          </button>
          <button 
            class="action-btn danger" 
            @tap.stop="cancelParty(party)"
            v-if="party.status === 'upcoming'"
          >
            <text>取消</text>
          </button>
        </view>
        <view class="card-actions" v-else>
          <button 
            class="action-btn secondary" 
            @tap.stop="viewTicket(party)"
          >
            <text class="iconfont icon-ticket"></text>
            <text>查看票券</text>
          </button>
          <button 
            class="action-btn secondary" 
            @tap.stop="viewOrder(party)"
          >
            <text class="iconfont icon-order"></text>
            <text>订单详情</text>
          </button>
          <button 
            class="action-btn primary" 
            @tap.stop="goToDetail(party.id)"
            v-if="party.status === 'upcoming' || party.status === 'ongoing'"
          >
            <text>进入聚会</text>
          </button>
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
        <text class="empty-title">{{ currentRole === 'organizer' ? '暂无组织的活动' : '暂无参与的活动' }}</text>
        <text class="empty-desc">{{ currentRole === 'organizer' ? '点击右上角创建你的第一个聚会' : '去发现页面寻找感兴趣的聚会吧' }}</text>
        <button class="empty-btn" @tap="currentRole === 'organizer' ? createParty() : goToDiscover()">
          <text>{{ currentRole === 'organizer' ? '创建聚会' : '去发现' }}</text>
        </button>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import { partyApi } from '../../api/party';

export default {
  data() {
    return {
      currentRole: 'organizer',
      currentTab: 'all',
      parties: [],
      page: 1,
      pageSize: 10,
      loading: false,
      refreshing: false,
      hasMore: true
    };
  },

  onLoad() {
    this.loadParties();
  },

  onPullDownRefresh() {
    this.onRefresh();
  },

  methods: {
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
          pageSize: this.pageSize,
          role: this.currentRole
        };

        if (this.currentRole === 'organizer' && this.currentTab !== 'all') {
          params.status = this.currentTab;
        }

        const res = this.currentRole === 'organizer' 
          ? await partyApi.getMyParties(params)
          : await partyApi.getParticipatedParties(params);

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

    switchRole(role) {
      if (this.currentRole === role) return;
      this.currentRole = role;
      this.loadParties(true);
    },

    switchTab(tab) {
      if (this.currentTab === tab) return;
      this.currentTab = tab;
      this.loadParties(true);
    },

    goBack() {
      uni.navigateBack();
    },

    goToDetail(partyId) {
      uni.navigateTo({
        url: `/pages/party-detail/party-detail?id=${partyId}`
      });
    },

    goToDiscover() {
      uni.switchTab({
        url: '/pages/index/index'
      });
    },

    createParty() {
      uni.navigateTo({
        url: '/pages/create-party/create-party'
      });
    },

    editParty(party) {
      uni.navigateTo({
        url: `/pages/edit-party/edit-party?id=${party.id}`
      });
    },

    viewStats(party) {
      uni.navigateTo({
        url: `/pages/ticket-stats/ticket-stats?partyId=${party.id}`
      });
    },

    manageTickets(party) {
      uni.navigateTo({
        url: `/pages/scan-ticket/scan-ticket?partyId=${party.id}`
      });
    },

    shareParty(party) {
      uni.navigateTo({
        url: `/pages/share-poster/share-poster?partyId=${party.id}`
      });
    },

    cancelParty(party) {
      uni.showModal({
        title: '取消聚会',
        content: '确定要取消这个聚会吗？取消后将退还所有已购票用户的款项。',
        confirmColor: '#EF4444',
        success: async (res) => {
          if (res.confirm) {
            try {
              const result = await partyApi.cancelParty(party.id);
              if (result.code === 0) {
                uni.showToast({
                  title: '已取消',
                  icon: 'success'
                });
                this.loadParties(true);
              } else {
                uni.showToast({
                  title: result.message || '取消失败',
                  icon: 'none'
                });
              }
            } catch (error) {
              uni.showToast({
                title: '网络错误',
                icon: 'none'
              });
            }
          }
        }
      });
    },

    viewTicket(party) {
      uni.navigateTo({
        url: `/pages/my-tickets/my-tickets?partyId=${party.id}`
      });
    },

    viewOrder(party) {
      uni.navigateTo({
        url: `/pages/order-detail/order-detail?partyId=${party.id}`
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

    getStatusClass(status) {
      const classMap = {
        'upcoming': 'status-upcoming',
        'ongoing': 'status-ongoing',
        'ended': 'status-ended',
        'cancelled': 'status-cancelled'
      };
      return classMap[status] || '';
    },

    getStatusText(status) {
      const textMap = {
        'upcoming': '即将开始',
        'ongoing': '进行中',
        'ended': '已结束',
        'cancelled': '已取消'
      };
      return textMap[status] || '未知';
    },

    getTicketStatusClass(status) {
      const classMap = {
        'unused': 'ticket-unused',
        'used': 'ticket-used',
        'refunded': 'ticket-refunded',
        'expired': 'ticket-expired'
      };
      return classMap[status] || '';
    },

    getTicketStatusText(status) {
      const textMap = {
        'unused': '未使用',
        'used': '已使用',
        'refunded': '已退款',
        'expired': '已过期'
      };
      return textMap[status] || '未知';
    },

    formatDateTime(time) {
      if (!time) return '时间待定';
      const date = new Date(time);
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${month}-${day} ${hours}:${minutes}`;
    }
  }
};
</script>

<style lang="scss">
$primary: #FF6B35;
$primary-light: #FF8E53;
$success: #10B981;
$warning: #F59E0B;
$error: #EF4444;
$info: #3B82F6;
$bg-dark: #0a0a0a;
$bg-card: #141414;
$bg-hover: #1a1a1a;
$text-primary: #ffffff;
$text-secondary: rgba(255, 255, 255, 0.7);
$text-tertiary: rgba(255, 255, 255, 0.5);
$border-light: rgba(255, 255, 255, 0.1);

.my-parties-container {
  min-height: 100vh;
  background: $bg-dark;
}

// 顶部导航
.nav-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 32rpx;
  background: $bg-dark;
  border-bottom: 1rpx solid $border-light;

  .nav-left,
  .nav-right {
    width: 72rpx;
    height: 72rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    background: $bg-card;
    border-radius: 50%;

    .iconfont {
      font-size: 36rpx;
      color: $text-secondary;
    }
  }

  .nav-center {
    .page-title {
      font-size: 32rpx;
      font-weight: 600;
      color: $text-primary;
    }
  }
}

// 角色切换
.role-tabs {
  display: flex;
  background: $bg-dark;
  padding: 20rpx 32rpx;
  gap: 20rpx;
  border-bottom: 1rpx solid $border-light;

  .role-tab {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12rpx;
    padding: 24rpx 0;
    background: $bg-card;
    border-radius: 16rpx;
    transition: all 0.3s ease;

    .iconfont {
      font-size: 32rpx;
      color: $text-tertiary;
    }

    text {
      font-size: 28rpx;
      color: $text-secondary;
    }

    &.active {
      background: linear-gradient(135deg, $primary 0%, $primary-light 100%);

      .iconfont,
      text {
        color: #ffffff;
        font-weight: 600;
      }
    }

    &:active {
      transform: scale(0.98);
    }
  }
}

// 筛选栏
.filter-section {
  background: $bg-dark;
  padding: 20rpx 0;
  border-bottom: 1rpx solid $border-light;

  .filter-scroll {
    white-space: nowrap;
    padding: 0 24rpx;
  }

  .filter-item {
    display: inline-block;
    padding: 16rpx 32rpx;
    margin-right: 16rpx;
    background: $bg-card;
    border-radius: 32rpx;
    transition: all 0.3s ease;

    text {
      font-size: 26rpx;
      color: $text-secondary;
    }

    &.active {
      background: rgba(255, 107, 53, 0.2);

      text {
        color: $primary;
        font-weight: 600;
      }
    }

    &:active {
      transform: scale(0.95);
    }
  }
}

// 活动列表
.party-list {
  height: calc(100vh - 280rpx - constant(safe-area-inset-bottom));
  height: calc(100vh - 280rpx - env(safe-area-inset-bottom));
  padding: 24rpx;
}

// 骨架屏
.skeleton-wrapper {
  .party-skeleton {
    display: flex;
    background: $bg-card;
    border-radius: 20rpx;
    padding: 24rpx;
    margin-bottom: 20rpx;

    .skeleton-thumb {
      width: 160rpx;
      height: 160rpx;
      background: linear-gradient(90deg, $bg-hover 25%, #222 50%, $bg-hover 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: 16rpx;
      margin-right: 20rpx;
    }

    .skeleton-content {
      flex: 1;

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

// 活动卡片
.party-card {
  background: $bg-card;
  border-radius: 20rpx;
  margin-bottom: 20rpx;
  overflow: hidden;
  animation: slideUp 0.4s ease-out backwards;
  transition: all 0.3s ease;

  &:active {
    transform: scale(0.98);
  }

  .card-main {
    display: flex;
    padding: 24rpx;

    .party-thumb {
      width: 160rpx;
      height: 160rpx;
      border-radius: 16rpx;
      margin-right: 20rpx;
      flex-shrink: 0;
    }

    .party-info {
      flex: 1;
      min-width: 0;

      .info-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        margin-bottom: 12rpx;

        .party-title {
          flex: 1;
          font-size: 30rpx;
          font-weight: 600;
          color: $text-primary;
          margin-right: 16rpx;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .party-status {
          padding: 8rpx 16rpx;
          border-radius: 20rpx;
          font-size: 22rpx;
          font-weight: 500;
          flex-shrink: 0;

          &.status-upcoming {
            background: rgba(16, 185, 129, 0.2);
            color: $success;
          }

          &.status-ongoing {
            background: rgba(59, 130, 246, 0.2);
            color: $info;
          }

          &.status-ended {
            background: rgba(255, 255, 255, 0.1);
            color: $text-tertiary;
          }

          &.status-cancelled {
            background: rgba(239, 68, 68, 0.2);
            color: $error;
          }
        }
      }

      .party-meta {
        margin-bottom: 16rpx;

        .meta-item {
          display: flex;
          align-items: center;
          gap: 8rpx;
          margin-bottom: 8rpx;

          .iconfont {
            font-size: 24rpx;
            color: $text-tertiary;
          }

          text {
            font-size: 24rpx;
            color: $text-tertiary;
          }
        }
      }

      .party-stats {
        display: flex;
        gap: 24rpx;
        padding-top: 12rpx;
        border-top: 1rpx solid $border-light;

        .stat-item {
          display: flex;
          flex-direction: column;

          .stat-value {
            font-size: 28rpx;
            font-weight: 600;
            color: $primary;
          }

          .stat-label {
            font-size: 22rpx;
            color: $text-tertiary;
            margin-top: 4rpx;
          }
        }
      }

      .ticket-info {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-top: 12rpx;
        border-top: 1rpx solid $border-light;

        .ticket-type {
          font-size: 24rpx;
          color: $text-secondary;
        }

        .ticket-status {
          padding: 6rpx 16rpx;
          border-radius: 16rpx;
          font-size: 22rpx;

          &.ticket-unused {
            background: rgba(16, 185, 129, 0.2);
            color: $success;
          }

          &.ticket-used {
            background: rgba(255, 255, 255, 0.1);
            color: $text-tertiary;
          }

          &.ticket-refunded {
            background: rgba(239, 68, 68, 0.2);
            color: $error;
          }

          &.ticket-expired {
            background: rgba(245, 158, 11, 0.2);
            color: $warning;
          }
        }
      }
    }
  }

  .card-actions {
    display: flex;
    gap: 16rpx;
    padding: 0 24rpx 24rpx;

    .action-btn {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8rpx;
      height: 72rpx;
      border-radius: 12rpx;
      border: none;
      transition: all 0.2s ease;

      &::after {
        border: none;
      }

      .iconfont {
        font-size: 28rpx;
      }

      text {
        font-size: 26rpx;
      }

      &.primary {
        background: linear-gradient(135deg, $primary 0%, $primary-light 100%);
        color: #ffffff;
      }

      &.secondary {
        background: $bg-hover;
        color: $text-secondary;

        .iconfont {
          color: $text-tertiary;
        }
      }

      &.danger {
        background: rgba(239, 68, 68, 0.2);
        color: $error;
      }

      &:active {
        transform: scale(0.98);
        opacity: 0.9;
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
    width: 200rpx;
    height: 200rpx;
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
    margin-bottom: 32rpx;
    text-align: center;
  }

  .empty-btn {
    padding: 24rpx 64rpx;
    background: linear-gradient(135deg, $primary 0%, $primary-light 100%);
    border-radius: 40rpx;
    border: none;

    &::after {
      border: none;
    }

    text {
      font-size: 28rpx;
      color: #ffffff;
      font-weight: 600;
    }

    &:active {
      transform: scale(0.98);
    }
  }
}
</style>
