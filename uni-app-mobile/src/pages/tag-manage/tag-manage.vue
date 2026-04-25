<template>
  <view class="tag-manage-container">
    <view class="header">
      <text class="header-title">标签管理</text>
      <button class="create-btn" @tap="createTag">
        <text>+ 新建标签</text>
      </button>
    </view>

    <view class="search-bar">
      <input 
        class="search-input" 
        v-model="searchKeyword" 
        placeholder="搜索标签..."
        @input="handleSearch"
      />
    </view>

    <view class="tag-sections">
      <view class="tag-section" v-if="hotTags.length > 0">
        <view class="section-header">
          <text class="section-title">🔥 热门标签</text>
          <text class="section-more" @tap="viewAllHotTags">查看全部</text>
        </view>
        <view class="tag-list">
          <view 
            class="tag-item hot" 
            v-for="tag in hotTags" 
            :key="tag.id"
            @tap="viewTagDetail(tag)"
          >
            <text class="tag-name">{{ tag.name }}</text>
            <text class="tag-count">{{ tag.party_count || 0 }}个聚会</text>
          </view>
        </view>
      </view>

      <view class="tag-section" v-if="recommendedTags.length > 0">
        <view class="section-header">
          <text class="section-title">✨ 推荐标签</text>
        </view>
        <view class="tag-list">
          <view 
            class="tag-item recommended" 
            v-for="tag in recommendedTags" 
            :key="tag.id"
            @tap="viewTagDetail(tag)"
          >
            <text class="tag-name">{{ tag.name }}</text>
            <text class="tag-count">{{ tag.party_count || 0 }}个聚会</text>
          </view>
        </view>
      </view>

      <view class="tag-section" v-if="followedTags.length > 0">
        <view class="section-header">
          <text class="section-title">❤️ 我的关注</text>
        </view>
        <view class="tag-list">
          <view 
            class="tag-item followed" 
            v-for="tag in followedTags" 
            :key="tag.id"
            @tap="viewTagDetail(tag)"
          >
            <text class="tag-name">{{ tag.name }}</text>
            <text class="tag-count">{{ tag.party_count || 0 }}个聚会</text>
            <view class="tag-action" @tap.stop="unfollowTag(tag)">
              <text>取消关注</text>
            </view>
          </view>
        </view>
      </view>

      <view class="tag-section">
        <view class="section-header">
          <text class="section-title">📂 全部标签</text>
        </view>
        <scroll-view class="tag-scroll" scroll-y @scrolltolower="loadMore">
          <view class="tag-list">
            <view 
              class="tag-item" 
              v-for="tag in allTags" 
              :key="tag.id"
              :class="{ followed: tag.is_followed }"
              @tap="viewTagDetail(tag)"
            >
              <text class="tag-name">{{ tag.name }}</text>
              <text class="tag-count">{{ tag.party_count || 0 }}个聚会</text>
              <view 
                class="tag-action" 
                v-if="tag.is_followed"
                @tap.stop="unfollowTag(tag)"
              >
                <text>取消关注</text>
              </view>
              <view 
                class="tag-action follow" 
                v-else
                @tap.stop="followTag(tag)"
              >
                <text>+ 关注</text>
              </view>
            </view>
          </view>

          <view class="loading-more" v-if="loading">
            <text>加载中...</text>
          </view>

          <view class="no-more" v-if="!hasMore && allTags.length > 0">
            <text>没有更多了</text>
          </view>

          <view class="empty-state" v-if="allTags.length === 0 && !loading">
            <text class="empty-icon">🏷️</text>
            <text class="empty-text">暂无标签</text>
            <text class="empty-tip">创建第一个标签吧</text>
          </view>
        </scroll-view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { tagApi } from '@/api/tag.js'

const searchKeyword = ref('')
const hotTags = ref([])
const recommendedTags = ref([])
const followedTags = ref([])
const allTags = ref([])
const loading = ref(false)
const hasMore = ref(true)
const page = ref(1)
const pageSize = ref(20)

const loadHotTags = async () => {
  try {
    const res = await tagApi.getHotTags({ limit: 10 })
    if (res.code === 0) {
      hotTags.value = res.data.list || []
    }
  } catch (error) {
    // console.error('Failed to load hot tags:', error)
  }
}

const loadRecommendedTags = async () => {
  try {
    const res = await tagApi.getRecommendedTags({ limit: 10 })
    if (res.code === 0) {
      recommendedTags.value = res.data.list || []
    }
  } catch (error) {
    // console.error('Failed to load recommended tags:', error)
  }
}

const loadFollowedTags = async () => {
  try {
    const res = await tagApi.getTagList({ followed: true, limit: 10 })
    if (res.code === 0) {
      followedTags.value = res.data.list || []
    }
  } catch (error) {
    // console.error('Failed to load followed tags:', error)
  }
}

const loadAllTags = async (reset = false) => {
  if (reset) {
    page.value = 1
    allTags.value = []
    hasMore.value = true
  }

  if (loading.value || !hasMore.value) return

  loading.value = true

  try {
    const res = await tagApi.getTagList({
      page: page.value,
      pageSize: pageSize.value,
      keyword: searchKeyword.value
    })

    if (res.code === 0) {
      const newTags = res.data.list || []
      if (reset) {
        allTags.value = newTags
      } else {
        allTags.value = [...allTags.value, ...newTags]
      }

      hasMore.value = newTags.length >= pageSize.value
      page.value++
    }
  } catch (error) {
    uni.showToast({
      title: '加载失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}

const loadMore = () => {
  loadAllTags(false)
}

const handleSearch = () => {
  loadAllTags(true)
}

const viewTagDetail = (tag) => {
  uni.navigateTo({
    url: `/pages/tag-detail/tag-detail?tagId=${tag.id}`
  })
}

const followTag = async (tag) => {
  try {
    const res = await tagApi.followTag(tag.id)

    if (res.code === 0) {
      tag.is_followed = true
      uni.showToast({
        title: '关注成功',
        icon: 'success'
      })
    } else {
      uni.showToast({
        title: res.message || '关注失败',
        icon: 'none'
      })
    }
  } catch (error) {
    uni.showToast({
      title: '网络错误',
      icon: 'none'
    })
  }
}

const unfollowTag = async (tag) => {
  uni.showModal({
    title: '确认取消关注',
    content: `确定要取消关注"${tag.name}"吗？`,
    success: async (res) => {
      if (res.confirm) {
        try {
          const res = await tagApi.unfollowTag(tag.id)

          if (res.code === 0) {
            tag.is_followed = false
            
            const index = followedTags.value.findIndex(t => t.id === tag.id)
            if (index > -1) {
              followedTags.value.splice(index, 1)
            }

            uni.showToast({
              title: '已取消关注',
              icon: 'success'
            })
          } else {
            uni.showToast({
              title: res.message || '操作失败',
              icon: 'none'
            })
          }
        } catch (error) {
          uni.showToast({
            title: '网络错误',
            icon: 'none'
          })
        }
      }
    }
  })
}

const createTag = () => {
  uni.navigateTo({
    url: '/pages/create-tag/create-tag'
  })
}

const viewAllHotTags = () => {
  uni.navigateTo({
    url: '/pages/hot-tags/hot-tags'
  })
}

onMounted(() => {
  loadHotTags()
  loadRecommendedTags()
  loadFollowedTags()
  loadAllTags(true)
})
</script>

<style lang="scss" scoped>
.tag-manage-container {
  min-height: 100vh;
  background: #000000;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  background: rgba(255, 255, 255, 0.02);
  border-bottom: 1rpx solid rgba(255, 255, 255, 0.05);
}

.header-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #ffffff;
}

.create-btn {
  padding: 15rpx 30rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 25rpx;
  font-size: 26rpx;
  color: #ffffff;
  border: none;

  &::after {
    border: none;
  }
}

.search-bar {
  padding: 20rpx 30rpx;
}

.search-input {
  width: 100%;
  height: 80rpx;
  padding: 0 30rpx;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 40rpx;
  font-size: 28rpx;
  color: #ffffff;
}

.tag-sections {
  padding: 20rpx 0;
}

.tag-section {
  margin-bottom: 40rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 30rpx 20rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: 500;
  color: #ffffff;
}

.section-more {
  font-size: 24rpx;
  color: #667eea;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 15rpx;
  padding: 0 30rpx;
}

.tag-item {
  display: flex;
  align-items: center;
  gap: 10rpx;
  padding: 15rpx 25rpx;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 30rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s;
}

.tag-item.hot {
  background: linear-gradient(135deg, rgba(255, 77, 79, 0.2) 0%, rgba(0, 0, 0, 0) 100%);
  border-color: rgba(255, 77, 79, 0.3);
}

.tag-item.recommended {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(0, 0, 0, 0) 100%);
  border-color: rgba(102, 126, 234, 0.3);
}

.tag-item.followed {
  background: linear-gradient(135deg, rgba(82, 196, 26, 0.2) 0%, rgba(0, 0, 0, 0) 100%);
  border-color: rgba(82, 196, 26, 0.3);
}

.tag-name {
  font-size: 26rpx;
  color: #ffffff;
}

.tag-count {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.5);
}

.tag-action {
  font-size: 22rpx;
  color: #667eea;
  padding: 5rpx 10rpx;
  border-radius: 15rpx;
  background: rgba(102, 126, 234, 0.1);
}

.tag-action.follow {
  color: #ffffff;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.tag-scroll {
  height: 800rpx;
}

.loading-more,
.no-more,
.empty-state {
  text-align: center;
  padding: 60rpx;
  color: rgba(255, 255, 255, 0.5);
  font-size: 28rpx;
}

.empty-icon {
  display: block;
  font-size: 80rpx;
  margin-bottom: 20rpx;
}

.empty-text {
  display: block;
  font-size: 32rpx;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 10rpx;
}

.empty-tip {
  display: block;
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.4);
}
</style>
