<template>
  <view class="profile-container" :class="`theme-${currentTheme}`">
    <!-- 头部背景 -->
    <view class="profile-header">
      <view class="header-bg">
        <!-- 霓虹主题特效 -->
        <view v-if="currentTheme === 'neon'" class="neon-glow"></view>
        <view v-if="currentTheme === 'neon'" class="neon-particles">
          <view v-for="i in 5" :key="i" class="particle"></view>
        </view>
        
        <!-- 活力主题装饰 -->
        <view v-if="currentTheme === 'vibrant'" class="vibrant-shapes">
          <view class="shape shape-1"></view>
          <view class="shape shape-2"></view>
          <view class="shape shape-3"></view>
        </view>
      </view>
      
      <!-- 用户信息 -->
      <view class="user-info">
        <view class="avatar-wrapper" @tap="editProfile">
          <image 
            class="user-avatar" 
            :src="userInfo?.avatar || '/static/default-avatar.png'" 
            mode="aspectFill"
          />
          <view class="edit-badge">
            <text class="edit-icon">✎</text>
          </view>
          <!-- VIP 徽章 -->
          <view v-if="userInfo?.is_vip" class="vip-crown">
            <text>👑</text>
          </view>
        </view>
        
        <view class="user-text">
          <text class="user-name">{{ userInfo?.nickname || '未登录' }}</text>
          <text class="user-id" v-if="userInfo">ID: {{ userInfo.id }}</text>
          <text class="user-bio">{{ userInfo?.bio || '这个人很懒，什么都没写~' }}</text>
          
          <!-- VIP 标签 -->
          <view v-if="userInfo?.is_vip" class="vip-tag">
            <text class="vip-icon">👑</text>
            <text class="vip-text">{{ getVipLevelText(userInfo.vip_level) }}</text>
          </view>
        </view>
        
        <!-- 设置按钮 -->
        <view class="settings-btn" @tap="goToSettings">
          <text class="settings-icon">⚙️</text>
        </view>
      </view>
    </view>

    <!-- 统计卡片 -->
    <view class="stats-card">
      <view class="stat-item" @tap="navigateTo('/pages/following/following')">
        <text class="stat-value">{{ userInfo?.following_count || 0 }}</text>
        <text class="stat-label">关注</text>
      </view>
      <view class="stat-divider"></view>
      <view class="stat-item" @tap="navigateTo('/pages/fans/fans')">
        <text class="stat-value">{{ userInfo?.followers_count || 0 }}</text>
        <text class="stat-label">粉丝</text>
      </view>
      <view class="stat-divider"></view>
      <view class="stat-item" @tap="navigateTo('/pages/my-parties/my-parties')">
        <text class="stat-value">{{ userInfo?.created_count || 0 }}</text>
        <text class="stat-label">发布</text>
      </view>
      <view class="stat-divider"></view>
      <view class="stat-item" @tap="navigateTo('/pages/my-parties/my-parties')">
        <text class="stat-value">{{ userInfo?.participated_count || 0 }}</text>
        <text class="stat-label">参与</text>
      </view>
    </view>

    <!-- 快捷操作 -->
    <view class="quick-actions">
      <view 
        class="action-item" 
        v-for="(action, index) in quickActions" 
        :key="index"
        @tap="navigateTo(action.url)"
        :style="{ animationDelay: `${index * 0.05}s` }"
      >
        <view class="action-icon-wrapper" :class="`bg-${action.color}`">
          <text class="action-icon">{{ action.icon }}</text>
        </view>
        <text class="action-text">{{ action.name }}</text>
        <view v-if="action.badge" class="action-badge">{{ action.badge }}</view>
      </view>
    </view>

    <!-- 菜单列表 -->
    <view class="menu-sections">
      <!-- 我的活动 -->
      <view class="menu-group">
        <text class="group-title">我的活动</text>
        <view class="menu-list">
          <view 
            class="menu-item" 
            v-for="(item, index) in activityMenus" 
            :key="index"
            @tap="navigateTo(item.url)"
          >
            <view class="menu-icon-wrapper" :class="`bg-${item.color}`">
              <text class="menu-icon">{{ item.icon }}</text>
            </view>
            <text class="menu-text">{{ item.name }}</text>
            <view class="menu-arrow">
              <text>›</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 会员服务 -->
      <view class="menu-group">
        <text class="group-title">会员服务</text>
        <view class="menu-list">
          <view class="menu-item vip-item" @tap="navigateTo('/pages/vip/vip')">
            <view class="menu-icon-wrapper bg-vip">
              <text class="menu-icon">👑</text>
            </view>
            <view class="menu-content">
              <text class="menu-text">VIP会员</text>
              <text class="menu-desc" v-if="!userInfo?.is_vip">开通尊享特权</text>
              <text class="menu-desc" v-else>{{ vipRemainingDays }}天后到期</text>
            </view>
            <view class="menu-tag" v-if="!userInfo?.is_vip">
              <text>限时优惠</text>
            </view>
            <view class="menu-arrow">
              <text>›</text>
            </view>
          </view>
          <view 
            class="menu-item" 
            v-for="(item, index) in vipMenus" 
            :key="index"
            @tap="navigateTo(item.url)"
          >
            <view class="menu-icon-wrapper" :class="`bg-${item.color}`">
              <text class="menu-icon">{{ item.icon }}</text>
            </view>
            <text class="menu-text">{{ item.name }}</text>
            <view class="menu-arrow">
              <text>›</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 常用功能 -->
      <view class="menu-group">
        <text class="group-title">常用功能</text>
        <view class="menu-list">
          <view 
            class="menu-item" 
            v-for="(item, index) in commonMenus" 
            :key="index"
            @tap="navigateTo(item.url)"
          >
            <view class="menu-icon-wrapper" :class="`bg-${item.color}`">
              <text class="menu-icon">{{ item.icon }}</text>
            </view>
            <text class="menu-text">{{ item.name }}</text>
            <view class="menu-badge" v-if="item.badge">{{ item.badge }}</view>
            <view class="menu-arrow">
              <text>›</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 其他 -->
      <view class="menu-group">
        <text class="group-title">其他</text>
        <view class="menu-list">
          <view 
            class="menu-item" 
            v-for="(item, index) in otherMenus" 
            :key="index"
            @tap="item.action ? item.action() : navigateTo(item.url)"
          >
            <view class="menu-icon-wrapper" :class="`bg-${item.color}`">
              <text class="menu-icon">{{ item.icon }}</text>
            </view>
            <text class="menu-text" :class="{ 'text-danger': item.danger }">{{ item.name }}</text>
            <view class="menu-arrow">
              <text>›</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 主题切换器（仅用于演示） -->
    <view class="theme-switcher">
      <text class="switcher-title">主题切换</text>
      <view class="theme-options">
        <view 
          v-for="theme in themes" 
          :key="theme.key"
          class="theme-option"
          :class="{ active: currentTheme === theme.key }"
          @tap="switchTheme(theme.key)"
        >
          <view class="theme-preview" :style="{ background: theme.gradient }"></view>
          <text class="theme-name">{{ theme.name }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { authApi } from '@/api/auth';
import { notificationApi } from '@/api/notification';
import themeManager from '@/utils/theme.js';

export default {
  data() {
    return {
      userInfo: null,
      unreadCount: 0,
      currentTheme: 'neon',
      themes: [
        { key: 'neon', name: '霓虹', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
        { key: 'minimal', name: '简约', gradient: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)' },
        { key: 'dark', name: '暗色', gradient: 'linear-gradient(135deg, #4A5568 0%, #3D4F5F 100%)' },
        { key: 'vibrant', name: '活力', gradient: 'linear-gradient(135deg, #FF6B9C 0%, #4ECDC4 100%)' }
      ],
      quickActions: [
        { name: '我的订单', icon: '📋', url: '/pages/my-orders/my-orders', color: 'primary', badge: 0 },
        { name: '我的票券', icon: '🎫', url: '/pages/my-tickets/my-tickets', color: 'secondary', badge: 0 },
        { name: '我的钱包', icon: '💰', url: '/pages/wallet/wallet', color: 'success', badge: 0 },
        { name: '我的收藏', icon: '⭐', url: '/pages/favorite/favorite', color: 'warning', badge: 0 }
      ],
      activityMenus: [
        { name: '我的聚会', icon: '🎉', url: '/pages/my-parties/my-parties', color: 'primary' },
        { name: '邀请好友', icon: '🎁', url: '/pages/invite-code/invite-code', color: 'secondary' }
      ],
      vipMenus: [
        { name: '订阅历史', icon: '📊', url: '/pages/vip-history/vip-history', color: 'info' },
        { name: '积分商城', icon: '🎯', url: '/pages/vip-points/vip-points', color: 'warning' }
      ],
      commonMenus: [
        { name: '消息中心', icon: '💬', url: '/pages/chat-list/chat-list', color: 'primary', badge: 0 },
        { name: '通知提醒', icon: '🔔', url: '/pages/notifications/notifications', color: 'secondary', badge: 0 },
        { name: '扫码验票', icon: '📷', url: '/pages/scan-ticket/scan-ticket', color: 'success' },
        { name: '标签管理', icon: '🏷️', url: '/pages/tag-manage/tag-manage', color: 'info' }
      ],
      otherMenus: [
        { name: '帮助中心', icon: '❓', url: '/pages/help/help', color: 'secondary' },
        { name: '关于我们', icon: 'ℹ️', url: '/pages/about/about', color: 'info' },
        { name: '退出登录', icon: '🚪', url: '', color: 'error', danger: true, action: this.handleLogout }
      ]
    };
  },

  computed: {
    vipRemainingDays() {
      if (!this.userInfo?.vip_expires_at) return 0;
      const expireDate = new Date(this.userInfo.vip_expires_at);
      const now = new Date();
      const diff = expireDate - now;
      return Math.ceil(diff / (1000 * 60 * 60 * 24));
    }
  },

  onLoad() {
    this.loadUserInfo();
    this.loadUnreadCount();
    this.loadCurrentTheme();
  },

  onShow() {
    this.loadUserInfo();
    this.loadUnreadCount();
  },

  methods: {
    loadUserInfo() {
      const userInfo = uni.getStorageSync('userInfo');
      if (userInfo) {
        this.userInfo = userInfo;
      }
    },

    async loadUnreadCount() {
      try {
        const res = await notificationApi.getUnreadCount();
        if (res.code === 0) {
          this.unreadCount = res.data.count || 0;
          // 更新消息徽章
          this.commonMenus[0].badge = this.unreadCount > 0 ? this.unreadCount : 0;
        }
      } catch (error) {
        // console.error('加载未读消息失败', error);
      }
    },

    loadCurrentTheme() {
      const savedTheme = uni.getStorageSync('app_theme') || 'neon';
      this.currentTheme = savedTheme;
    },

    switchTheme(theme) {
      this.currentTheme = theme;
      uni.setStorageSync('app_theme', theme);
      themeManager.setTheme(theme);
      uni.showToast({
        title: `已切换至${this.themes.find(t => t.key === theme).name}主题`,
        icon: 'none'
      });
    },

    getVipLevelText(level) {
      const levelMap = {
        'monthly': '月卡会员',
        'quarterly': '季卡会员',
        'yearly': '年卡会员'
      };
      return levelMap[level] || 'VIP会员';
    },

    editProfile() {
      uni.navigateTo({
        url: '/pages/edit-profile/edit-profile'
      });
    },

    goToSettings() {
      uni.navigateTo({
        url: '/pages/settings/settings'
      });
    },

    navigateTo(url) {
      if (url) {
        uni.navigateTo({ url });
      }
    },

    async handleLogout() {
      uni.showModal({
        title: '提示',
        content: '确定要退出登录吗？',
        confirmColor: '#EF4444',
        success: async (res) => {
          if (res.confirm) {
            try {
              await authApi.logout();
              uni.removeStorageSync('token');
              uni.removeStorageSync('userInfo');

              uni.showToast({
                title: '退出成功',
                icon: 'success'
              });

              setTimeout(() => {
                uni.reLaunch({
                  url: '/pages/login/login'
                });
              }, 1500);
            } catch (error) {
              uni.showToast({
                title: '退出失败',
                icon: 'none'
              });
            }
          }
        }
      });
    }
  }
};
</script>

<style lang="scss" scoped>
@import '../../styles/variables';

// ============================================
// 基础样式
// ============================================

.profile-container {
  min-height: 100vh;
  padding-bottom: 140rpx;
  transition: all 0.3s ease;
}

// ============================================
// 霓虹主题 (Neon)
// ============================================

.theme-neon {
  background: #000000;
  
  .profile-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    
    .neon-glow {
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(102, 126, 234, 0.3) 0%, transparent 70%);
      animation: neonPulse 3s ease-in-out infinite;
    }
    
    .neon-particles {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      overflow: hidden;
      
      .particle {
        position: absolute;
        width: 4rpx;
        height: 4rpx;
        background: rgba(255, 255, 255, 0.5);
        border-radius: 50%;
        animation: float 6s ease-in-out infinite;
        
        @for $i from 1 through 5 {
          &:nth-child(#{$i}) {
            left: #{$i * 20%};
            animation-delay: #{$i * 0.5}s;
            animation-duration: #{4 + $i}s;
          }
        }
      }
    }
  }
  
  .stats-card {
    background: #1a1a1a;
    border: 1rpx solid rgba(255, 255, 255, 0.1);
    
    .stat-value {
      color: #ffffff;
    }
    
    .stat-label {
      color: rgba(255, 255, 255, 0.6);
    }
    
    .stat-divider {
      background: rgba(255, 255, 255, 0.1);
    }
  }
  
  .quick-actions {
    .action-item {
      background: #1a1a1a;
      border: 1rpx solid rgba(255, 255, 255, 0.1);
      
      .action-text {
        color: rgba(255, 255, 255, 0.8);
      }
    }
  }
  
  .menu-group {
    .group-title {
      color: rgba(255, 255, 255, 0.6);
    }
    
    .menu-list {
      background: #1a1a1a;
      border: 1rpx solid rgba(255, 255, 255, 0.1);
    }
    
    .menu-item {
      border-bottom-color: rgba(255, 255, 255, 0.05);
      
      &:active {
        background: rgba(255, 255, 255, 0.05);
      }
      
      .menu-text {
        color: #ffffff;
      }
      
      .menu-desc {
        color: rgba(255, 255, 255, 0.5);
      }
      
      .menu-arrow {
        color: rgba(255, 255, 255, 0.4);
      }
    }
  }
  
  .theme-switcher {
    background: #1a1a1a;
    border: 1rpx solid rgba(255, 255, 255, 0.1);
    
    .switcher-title {
      color: rgba(255, 255, 255, 0.8);
    }
    
    .theme-name {
      color: rgba(255, 255, 255, 0.6);
    }
  }
}

// ============================================
// 简约主题 (Minimal)
// ============================================

.theme-minimal {
  background: #f5f5f5;
  
  .profile-header {
    background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%);
  }
  
  .stats-card {
    background: #ffffff;
    box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
    border-radius: 16rpx;
    
    .stat-value {
      color: #333333;
    }
    
    .stat-label {
      color: #999999;
    }
    
    .stat-divider {
      background: #eeeeee;
    }
  }
  
  .quick-actions {
    .action-item {
      background: #ffffff;
      box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
      border-radius: 16rpx;
      
      .action-text {
        color: #666666;
      }
    }
  }
  
  .menu-group {
    .group-title {
      color: #999999;
      font-weight: 500;
    }
    
    .menu-list {
      background: #ffffff;
      border-radius: 16rpx;
      box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
    }
    
    .menu-item {
      border-bottom-color: #f5f5f5;
      
      &:active {
        background: #f9f9f9;
      }
      
      .menu-text {
        color: #333333;
      }
      
      .menu-desc {
        color: #999999;
      }
      
      .menu-arrow {
        color: #cccccc;
      }
    }
  }
  
  .theme-switcher {
    background: #ffffff;
    border-radius: 16rpx;
    box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
    
    .switcher-title {
      color: #666666;
    }
    
    .theme-name {
      color: #999999;
    }
  }
}

// ============================================
// 暗色主题 (Dark)
// ============================================

.theme-dark {
  background: #1a1a1a;
  
  .profile-header {
    background: linear-gradient(135deg, #2d3748 0%, #1a202c 100%);
  }
  
  .stats-card {
    background: #2d2d2d;
    border-radius: 20rpx;
    
    .stat-value {
      color: #e0e0e0;
    }
    
    .stat-label {
      color: #888888;
    }
    
    .stat-divider {
      background: #404040;
    }
  }
  
  .quick-actions {
    .action-item {
      background: #2d2d2d;
      border-radius: 20rpx;
      
      .action-text {
        color: #b0b0b0;
      }
    }
  }
  
  .menu-group {
    .group-title {
      color: #888888;
    }
    
    .menu-list {
      background: #2d2d2d;
      border-radius: 20rpx;
    }
    
    .menu-item {
      border-bottom-color: #404040;
      
      &:active {
        background: #3a3a3a;
      }
      
      .menu-text {
        color: #e0e0e0;
      }
      
      .menu-desc {
        color: #888888;
      }
      
      .menu-arrow {
        color: #666666;
      }
    }
  }
  
  .theme-switcher {
    background: #2d2d2d;
    border-radius: 20rpx;
    
    .switcher-title {
      color: #b0b0b0;
    }
    
    .theme-name {
      color: #888888;
    }
  }
}

// ============================================
// 活力主题 (Vibrant)
// ============================================

.theme-vibrant {
  background: linear-gradient(180deg, #FFF5E5 0%, #ffffff 100%);
  
  .profile-header {
    background: linear-gradient(135deg, #FF6B9C 0%, #4ECDC4 100%);
    
    .vibrant-shapes {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      overflow: hidden;
      
      .shape {
        position: absolute;
        border-radius: 50%;
        opacity: 0.2;
        
        &-1 {
          width: 200rpx;
          height: 200rpx;
          background: #FFD93D;
          top: -50rpx;
          right: -50rpx;
          animation: float 8s ease-in-out infinite;
        }
        
        &-2 {
          width: 150rpx;
          height: 150rpx;
          background: #6BCB77;
          bottom: 20rpx;
          left: -30rpx;
          animation: float 6s ease-in-out infinite reverse;
        }
        
        &-3 {
          width: 100rpx;
          height: 100rpx;
          background: #4D96FF;
          top: 50%;
          right: 10%;
          animation: float 10s ease-in-out infinite;
        }
      }
    }
  }
  
  .stats-card {
    background: #ffffff;
    border-radius: 24rpx;
    box-shadow: 0 8rpx 32rpx rgba(255, 107, 156, 0.15);
    
    .stat-value {
      color: #FF6B9C;
      font-weight: 700;
    }
    
    .stat-label {
      color: #999999;
    }
    
    .stat-divider {
      background: #FFE4E1;
    }
  }
  
  .quick-actions {
    .action-item {
      background: #ffffff;
      border-radius: 24rpx;
      box-shadow: 0 4rpx 16rpx rgba(255, 107, 156, 0.1);
      
      .action-text {
        color: #666666;
      }
    }
  }
  
  .menu-group {
    .group-title {
      color: #FF6B9C;
      font-weight: 600;
    }
    
    .menu-list {
      background: #ffffff;
      border-radius: 24rpx;
      box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
    }
    
    .menu-item {
      border-bottom-color: #FFF0F5;
      
      &:active {
        background: #FFF5F8;
      }
      
      .menu-text {
        color: #333333;
      }
      
      .menu-desc {
        color: #FF6B9C;
      }
      
      .menu-arrow {
        color: #FFB6C1;
      }
    }
  }
  
  .theme-switcher {
    background: #ffffff;
    border-radius: 24rpx;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
    
    .switcher-title {
      color: #666666;
    }
    
    .theme-name {
      color: #999999;
    }
  }
}

// ============================================
// 公共组件样式
// ============================================

.profile-header {
  position: relative;
  padding: 80rpx 32rpx 100rpx;
  overflow: hidden;
  
  .header-bg {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }
}

.user-info {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  
  .avatar-wrapper {
    position: relative;
    margin-right: 24rpx;
    
    .user-avatar {
      width: 140rpx;
      height: 140rpx;
      border-radius: 50%;
      border: 4rpx solid rgba(255, 255, 255, 0.3);
    }
    
    .edit-badge {
      position: absolute;
      bottom: 0;
      right: 0;
      width: 40rpx;
      height: 40rpx;
      background: rgba(0, 0, 0, 0.5);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      
      .edit-icon {
        font-size: 20rpx;
        color: #ffffff;
      }
    }
    
    .vip-crown {
      position: absolute;
      top: -10rpx;
      right: -10rpx;
      font-size: 32rpx;
      animation: bounce 2s ease-in-out infinite;
    }
  }
  
  .user-text {
    flex: 1;
    
    .user-name {
      display: block;
      font-size: 40rpx;
      font-weight: 700;
      color: #ffffff;
      margin-bottom: 8rpx;
    }
    
    .user-id {
      display: block;
      font-size: 24rpx;
      color: rgba(255, 255, 255, 0.8);
      margin-bottom: 8rpx;
    }
    
    .user-bio {
      display: block;
      font-size: 24rpx;
      color: rgba(255, 255, 255, 0.9);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      max-width: 400rpx;
    }
    
    .vip-tag {
      display: inline-flex;
      align-items: center;
      margin-top: 12rpx;
      padding: 6rpx 16rpx;
      background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
      border-radius: 20rpx;
      
      .vip-icon {
        font-size: 20rpx;
        margin-right: 6rpx;
      }
      
      .vip-text {
        font-size: 20rpx;
        font-weight: 600;
        color: #000000;
      }
    }
  }
  
  .settings-btn {
    width: 64rpx;
    height: 64rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    
    .settings-icon {
      font-size: 32rpx;
    }
  }
}

// 统计卡片
.stats-card {
  display: flex;
  align-items: center;
  justify-content: space-around;
  margin: -40rpx 32rpx 24rpx;
  padding: 32rpx 24rpx;
  position: relative;
  z-index: 20;
  animation: slideUp 0.5s ease-out;
  
  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1;
    
    .stat-value {
      font-size: 40rpx;
      font-weight: 700;
      margin-bottom: 8rpx;
    }
    
    .stat-label {
      font-size: 24rpx;
    }
  }
  
  .stat-divider {
    width: 2rpx;
    height: 60rpx;
  }
}

// 快捷操作
.quick-actions {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16rpx;
  padding: 0 32rpx;
  margin-bottom: 32rpx;
  
  .action-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 24rpx 16rpx;
    position: relative;
    animation: scaleIn 0.4s ease-out backwards;
    transition: all 0.2s ease;
    
    &:active {
      transform: scale(0.95);
    }
    
    .action-icon-wrapper {
      width: 88rpx;
      height: 88rpx;
      border-radius: 20rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 12rpx;
      
      &.bg-primary {
        background: rgba(255, 107, 53, 0.1);
      }
      
      &.bg-secondary {
        background: rgba(102, 126, 234, 0.1);
      }
      
      &.bg-success {
        background: rgba(16, 185, 129, 0.1);
      }
      
      &.bg-warning {
        background: rgba(245, 158, 11, 0.1);
      }
    }
    
    .action-icon {
      font-size: 40rpx;
    }
    
    .action-text {
      font-size: 24rpx;
    }
    
    .action-badge {
      position: absolute;
      top: 16rpx;
      right: 16rpx;
      min-width: 32rpx;
      height: 32rpx;
      padding: 0 8rpx;
      background: #EF4444;
      border-radius: 16rpx;
      font-size: 20rpx;
      font-weight: 600;
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
}

// 菜单区域
.menu-sections {
  padding: 0 32rpx;
}

.menu-group {
  margin-bottom: 32rpx;
  
  .group-title {
    display: block;
    font-size: 28rpx;
    margin-bottom: 16rpx;
    padding-left: 8rpx;
  }
  
  .menu-list {
    overflow: hidden;
  }
  
  .menu-item {
    display: flex;
    align-items: center;
    padding: 28rpx 24rpx;
    border-bottom-width: 2rpx;
    border-bottom-style: solid;
    transition: all 0.2s ease;
    
    &:last-child {
      border-bottom: none;
    }
    
    &.vip-item {
      .menu-content {
        flex: 1;
        display: flex;
        flex-direction: column;
      }
      
      .menu-desc {
        font-size: 22rpx;
        margin-top: 4rpx;
      }
      
      .menu-tag {
        padding: 4rpx 12rpx;
        background: linear-gradient(135deg, #FF6B35 0%, #FF8E53 100%);
        border-radius: 12rpx;
        margin-right: 16rpx;
        
        text {
          font-size: 20rpx;
          color: #ffffff;
          font-weight: 500;
        }
      }
    }
    
    .menu-icon-wrapper {
      width: 72rpx;
      height: 72rpx;
      border-radius: 16rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 20rpx;
      flex-shrink: 0;
      
      &.bg-primary {
        background: rgba(255, 107, 53, 0.1);
      }
      
      &.bg-secondary {
        background: rgba(102, 126, 234, 0.1);
      }
      
      &.bg-success {
        background: rgba(16, 185, 129, 0.1);
      }
      
      &.bg-warning {
        background: rgba(245, 158, 11, 0.1);
      }
      
      &.bg-info {
        background: rgba(59, 130, 246, 0.1);
      }
      
      &.bg-error {
        background: rgba(239, 68, 68, 0.1);
      }
      
      &.bg-vip {
        background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
      }
    }
    
    .menu-icon {
      font-size: 36rpx;
    }
    
    .menu-text {
      flex: 1;
      font-size: 30rpx;
      
      &.text-danger {
        color: #EF4444;
      }
    }
    
    .menu-badge {
      min-width: 36rpx;
      height: 36rpx;
      padding: 0 10rpx;
      background: #EF4444;
      border-radius: 18rpx;
      font-size: 22rpx;
      font-weight: 600;
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 16rpx;
    }
    
    .menu-arrow {
      font-size: 32rpx;
      
      text {
        display: block;
        transform: scaleY(1.5);
      }
    }
  }
}

// 主题切换器
.theme-switcher {
  margin: 32rpx;
  padding: 24rpx;
  
  .switcher-title {
    display: block;
    font-size: 28rpx;
    font-weight: 600;
    margin-bottom: 20rpx;
  }
  
  .theme-options {
    display: flex;
    gap: 20rpx;
  }
  
  .theme-option {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 16rpx;
    border-radius: 16rpx;
    transition: all 0.2s ease;
    
    &.active {
      background: rgba(255, 107, 53, 0.1);
      
      .theme-name {
        color: #FF6B35;
        font-weight: 600;
      }
    }
    
    &:active {
      transform: scale(0.95);
    }
    
    .theme-preview {
      width: 80rpx;
      height: 80rpx;
      border-radius: 20rpx;
      margin-bottom: 12rpx;
      box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15);
    }
    
    .theme-name {
      font-size: 22rpx;
    }
  }
}

// 动画
@keyframes neonPulse {
  0%, 100% {
    opacity: 0.5;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.1);
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-100rpx);
  }
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10rpx);
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

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
