<template>
  <view class="community-container">
    <view class="header">
      <text class="header-title">社区</text>
      <view class="header-actions">
        <view class="search-btn" @tap="showSearch">
          <text class="search-icon">🔍</text>
        </view>
      </view>
    </view>

    <scroll-view 
      class="posts-list" 
      scroll-y 
      @scrolltolower="loadMore"
      @refresherrefresh="onRefresh"
      :refresher-enabled="true"
      :refresher-triggered="refreshing"
    >
      <view class="post-card" v-for="post in posts" :key="post.id">
        <view class="post-header">
          <image 
            class="user-avatar" 
            :src="post.user?.avatar || '/static/default-avatar.png'" 
            mode="aspectFill"
            @tap="goToUserProfile(post.user_id)"
          ></image>
          <view class="user-info">
            <text class="user-name">{{ post.user?.nickname || '匿名用户' }}</text>
            <text class="post-time">{{ formatTime(post.created_at) }}</text>
          </view>
          <view class="more-btn" @tap="showPostMenu(post)">
            <text>⋯</text>
          </view>
        </view>

        <view class="post-content">
          <text class="post-text">{{ post.content }}</text>
        </view>

        <view class="post-images" v-if="post.images && post.images.length > 0">
          <image 
            v-for="(img, index) in post.images.slice(0, 9)" 
            :key="index"
            class="post-image"
            :class="{ 'single-image': post.images.length === 1 }"
            :src="img" 
            mode="aspectFill"
            @tap="previewImage(post.images, index)"
          ></image>
        </view>

        <view class="post-party" v-if="post.party" @tap="goToPartyDetail(post.party.id)">
          <image class="party-thumb" :src="post.party.images?.[0] || '/static/default-party.png'" mode="aspectFill"></image>
          <view class="party-info">
            <text class="party-name">{{ post.party.title }}</text>
            <text class="party-time">{{ formatPartyTime(post.party.start_time) }}</text>
          </view>
          <text class="party-link">›</text>
        </view>

        <view class="post-stats">
          <view class="stat-item" @tap="toggleLike(post)">
            <text class="stat-icon">{{ post.is_liked ? '❤️' : '🤍' }}</text>
            <text class="stat-count">{{ post.like_count || 0 }}</text>
          </view>
          <view class="stat-item" @tap="showComments(post)">
            <text class="stat-icon">💬</text>
            <text class="stat-count">{{ post.comment_count || 0 }}</text>
          </view>
          <view class="stat-item" @tap="sharePost(post)">
            <text class="stat-icon">🔄</text>
            <text class="stat-count">{{ post.share_count || 0 }}</text>
          </view>
        </view>

        <view class="post-comments" v-if="post.comments && post.comments.length > 0">
          <view class="comment-item" v-for="comment in post.comments.slice(0, 2)" :key="comment.id">
            <text class="comment-user">{{ comment.user?.nickname || '匿名用户' }}</text>
            <text class="comment-text">: {{ comment.content }}</text>
          </view>
          <view class="view-all-comments" v-if="post.comment_count > 2" @tap="showComments(post)">
            <text>查看全部{{ post.comment_count }}条评论</text>
          </view>
        </view>
      </view>

      <view class="loading-more" v-if="loading">
        <text>加载中...</text>
      </view>

      <view class="no-more" v-if="!hasMore && posts.length > 0">
        <text>没有更多了</text>
      </view>

      <view class="empty-state" v-if="posts.length === 0 && !loading">
        <image class="empty-icon" src="/static/empty.png" mode="aspectFit"></image>
        <text class="empty-text">暂无动态</text>
        <text class="empty-tip">发布你的第一条动态吧</text>
      </view>
    </scroll-view>

    <view class="fab-button" @tap="createPost">
      <text class="fab-icon">✏️</text>
    </view>
  </view>
</template>

<script>
import { socialApi } from '@/api/social'

export default {
  data() {
    return {
      posts: [],
      page: 1,
      pageSize: 10,
      loading: false,
      refreshing: false,
      hasMore: true
    }
  },

  onLoad() {
    this.loadPosts()
  },

  onPullDownRefresh() {
    this.onRefresh()
  },

  methods: {
    async loadPosts(reset = false) {
      if (reset) {
        this.page = 1
        this.posts = []
        this.hasMore = true
      }

      if (this.loading || !this.hasMore) return

      this.loading = true

      try {
        const res = await socialApi.getPosts({
          page: this.page,
          pageSize: this.pageSize
        })

        if (res.code === 0) {
          if (reset) {
            this.posts = res.data.list || []
          } else {
            this.posts = [...this.posts, ...(res.data.list || [])]
          }

          this.hasMore = res.data.list?.length >= this.pageSize
          this.page++
        }
      } catch (error) {
        uni.showToast({
          title: '加载失败',
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
    },

    onRefresh() {
      this.refreshing = true
      this.loadPosts(true).then(() => {
        this.refreshing = false
      })
    },

    loadMore() {
      this.loadPosts()
    },

    createPost() {
      uni.navigateTo({
        url: '/pages/create-post/create-post'
      })
    },

    showSearch() {
      uni.navigateTo({
        url: '/pages/search-users/search-users'
      })
    },

    goToUserProfile(userId) {
      uni.navigateTo({
        url: `/pages/user-profile/user-profile?id=${userId}`
      })
    },

    goToPartyDetail(partyId) {
      uni.navigateTo({
        url: `/pages/party-detail/party-detail?id=${partyId}`
      })
    },

    async toggleLike(post) {
      try {
        if (post.is_liked) {
          await socialApi.unlikePost(post.id)
          post.is_liked = false
          post.like_count = Math.max(0, post.like_count - 1)
        } else {
          await socialApi.likePost(post.id)
          post.is_liked = true
          post.like_count = post.like_count + 1
        }
      } catch (error) {
        uni.showToast({
          title: '操作失败',
          icon: 'none'
        })
      }
    },

    showComments(post) {
      uni.navigateTo({
        url: `/pages/post-comments/post-comments?postId=${post.id}`
      })
    },

    sharePost(post) {
      uni.showActionSheet({
        itemList: ['分享给好友', '生成海报', '复制链接'],
        success: (res) => {
          switch (res.tapIndex) {
            case 0:
              uni.showToast({
                title: '分享功能开发中',
                icon: 'none'
              })
              break
            case 1:
              uni.navigateTo({
                url: `/pages/share-poster/share-poster?type=post&id=${post.id}`
              })
              break
            case 2:
              uni.setClipboardData({
                data: `https://juju.party/post/${post.id}`,
                success: () => {
                  uni.showToast({
                    title: '链接已复制',
                    icon: 'success'
                  })
                }
              })
              break
          }
        }
      })
    },

    showPostMenu(post) {
      const isOwn = post.user_id === this.$store.state.user.userInfo?.id
      const items = isOwn ? ['编辑', '删除'] : ['举报', '不感兴趣']

      uni.showActionSheet({
        itemList: items,
        success: (res) => {
          if (isOwn) {
            if (res.tapIndex === 0) {
              this.editPost(post)
            } else if (res.tapIndex === 1) {
              this.deletePost(post)
            }
          } else {
            if (res.tapIndex === 0) {
              this.reportPost(post)
            } else if (res.tapIndex === 1) {
              this.hidePost(post)
            }
          }
        }
      })
    },

    editPost(post) {
      uni.showToast({
        title: '编辑功能开发中',
        icon: 'none'
      })
    },

    deletePost(post) {
      uni.showModal({
        title: '确认删除',
        content: '确定要删除这条动态吗?',
        success: async (res) => {
          if (res.confirm) {
            try {
              await socialApi.deletePost(post.id)
              const index = this.posts.findIndex(p => p.id === post.id)
              if (index > -1) {
                this.posts.splice(index, 1)
              }
              uni.showToast({
                title: '删除成功',
                icon: 'success'
              })
            } catch (error) {
              uni.showToast({
                title: '删除失败',
                icon: 'none'
              })
            }
          }
        }
      })
    },

    reportPost(post) {
      uni.showToast({
        title: '举报功能开发中',
        icon: 'none'
      })
    },

    hidePost(post) {
      const index = this.posts.findIndex(p => p.id === post.id)
      if (index > -1) {
        this.posts.splice(index, 1)
      }
      uni.showToast({
        title: '已隐藏该动态',
        icon: 'success'
      })
    },

    previewImage(images, current) {
      uni.previewImage({
        urls: images,
        current: current
      })
    },

    formatTime(time) {
      if (!time) return ''
      const date = new Date(time)
      const now = new Date()
      const diff = now - date

      const minute = 60 * 1000
      const hour = 60 * minute
      const day = 24 * hour

      if (diff < minute) {
        return '刚刚'
      } else if (diff < hour) {
        return `${Math.floor(diff / minute)}分钟前`
      } else if (diff < day) {
        return `${Math.floor(diff / hour)}小时前`
      } else if (diff < 7 * day) {
        return `${Math.floor(diff / day)}天前`
      } else {
        const month = date.getMonth() + 1
        const day = date.getDate()
        return `${month}月${day}日`
      }
    },

    formatPartyTime(time) {
      if (!time) return ''
      const date = new Date(time)
      const month = date.getMonth() + 1
      const day = date.getDate()
      const hours = date.getHours().toString().padStart(2, '0')
      const minutes = date.getMinutes().toString().padStart(2, '0')
      return `${month}月${day}日 ${hours}:${minutes}`
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../styles/variables';

.community-container {
  min-height: 100vh;
  background: $bg-secondary;
  padding-bottom: 120rpx;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 30rpx;
  background: $bg-primary;
  border-bottom: 1rpx solid $border-light;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-title {
  font-size: 36rpx;
  font-weight: bold;
  color: $text-primary;
}

.header-actions {
  display: flex;
  gap: 20rpx;
}

.search-btn {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: $bg-secondary;
  border-radius: 50%;
}

.search-icon {
  font-size: 32rpx;
}

.posts-list {
  height: 100vh;
}

.post-card {
  background: $bg-primary;
  margin-bottom: 20rpx;
  padding: 30rpx;
}

.post-header {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.user-avatar {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  margin-right: 20rpx;
}

.user-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 32rpx;
  font-weight: bold;
  color: $text-primary;
  margin-bottom: 8rpx;
}

.post-time {
  font-size: 24rpx;
  color: $text-secondary;
}

.more-btn {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  color: $text-secondary;
}

.post-content {
  margin-bottom: 20rpx;
}

.post-text {
  font-size: 30rpx;
  line-height: 1.6;
  color: $text-primary;
}

.post-images {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
  margin-bottom: 20rpx;
}

.post-image {
  width: calc((100% - 20rpx) / 3);
  height: 200rpx;
  border-radius: $radius-md;

  &.single-image {
    width: 100%;
    height: 400rpx;
  }
}

.post-party {
  display: flex;
  align-items: center;
  padding: 20rpx;
  background: $bg-secondary;
  border-radius: $radius-md;
  margin-bottom: 20rpx;
}

.party-thumb {
  width: 120rpx;
  height: 120rpx;
  border-radius: $radius-sm;
  margin-right: 20rpx;
}

.party-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.party-name {
  font-size: 28rpx;
  font-weight: bold;
  color: $text-primary;
  margin-bottom: 8rpx;
}

.party-time {
  font-size: 24rpx;
  color: $text-secondary;
}

.party-link {
  font-size: 40rpx;
  color: $text-secondary;
}

.post-stats {
  display: flex;
  gap: 40rpx;
  padding: 20rpx 0;
  border-top: 1rpx solid $border-light;
  border-bottom: 1rpx solid $border-light;
  margin-bottom: 20rpx;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.stat-icon {
  font-size: 32rpx;
}

.stat-count {
  font-size: 28rpx;
  color: $text-secondary;
}

.post-comments {
  margin-bottom: 20rpx;
}

.comment-item {
  padding: 10rpx 0;
  font-size: 28rpx;
  line-height: 1.5;
}

.comment-user {
  font-weight: bold;
  color: $text-primary;
}

.comment-text {
  color: $text-secondary;
}

.view-all-comments {
  padding: 10rpx 0;
  font-size: 28rpx;
  color: $primary;
}

.loading-more,
.no-more,
.empty-state {
  text-align: center;
  padding: 60rpx;
  color: $text-secondary;
  font-size: 28rpx;
}

.empty-icon {
  width: 200rpx;
  height: 200rpx;
  margin-bottom: 20rpx;
}

.empty-text {
  display: block;
  font-size: 32rpx;
  color: $text-secondary;
  margin-bottom: 10rpx;
}

.empty-tip {
  display: block;
  font-size: 24rpx;
  color: $text-secondary;
}

.fab-button {
  position: fixed;
  bottom: 120rpx;
  right: 40rpx;
  width: 120rpx;
  height: 120rpx;
  background: $primary;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 20rpx rgba(255, 107, 53, 0.4);
  z-index: 999;
}

.fab-icon {
  font-size: 48rpx;
}
</style>
