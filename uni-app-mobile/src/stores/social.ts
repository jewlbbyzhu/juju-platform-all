import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { socialApi } from '@/api/social.js'

// 用户关系类型
export interface UserRelation {
  id: number
  nickname: string
  avatar: string
  bio: string
  is_vip: boolean
  vip_level: number
  following_count: number
  followers_count: number
  is_following?: boolean
  created_at: string
}

// 社交状态
export const useSocialStore = defineStore('social', () => {
  // State
  const followingList = ref<UserRelation[]>([])
  const followersList = ref<UserRelation[]>([])
  const loading = ref(false)
  const hasMore = ref(true)

  // Getters
  const getFollowingCount = computed(() => followingList.value.length)
  const getFollowersCount = computed(() => followersList.value.length)
  const getFollowingList = computed(() => followingList.value)
  const getFollowersList = computed(() => followersList.value)

  // Actions
  // 获取关注列表
  const fetchFollowing = async (page = 1, limit = 20) => {
    try {
      loading.value = true
      const res = await socialApi.getFollowing({ page, limit })
      if (res.success) {
        if (page === 1) {
          followingList.value = res.data.list || []
        } else {
          followingList.value.push(...(res.data.list || []))
        }
        hasMore.value = (res.data.list || []).length === limit
      }
      return res
    } catch (error) {
      console.error('获取关注列表失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // 获取粉丝列表
  const fetchFollowers = async (page = 1, limit = 20) => {
    try {
      loading.value = true
      const res = await socialApi.getFollowers({ page, limit })
      if (res.success) {
        if (page === 1) {
          followersList.value = res.data.list || []
        } else {
          followersList.value.push(...(res.data.list || []))
        }
        hasMore.value = (res.data.list || []).length === limit
      }
      return res
    } catch (error) {
      console.error('获取粉丝列表失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // 关注用户
  const followUserAction = async (userId: number) => {
    try {
      const res = await socialApi.followUser(userId)
      if (res.success) {
        // 更新本地状态
        const user = followersList.value.find(u => u.id === userId)
        if (user) {
          user.is_following = true
        }
      }
      return res
    } catch (error) {
      console.error('关注用户失败:', error)
      throw error
    }
  }

  // 取消关注
  const unfollowUserAction = async (userId: number) => {
    try {
      const res = await socialApi.unfollowUser(userId)
      if (res.success) {
        // 从关注列表中移除
        followingList.value = followingList.value.filter(u => u.id !== userId)
        // 更新粉丝列表状态
        const user = followersList.value.find(u => u.id === userId)
        if (user) {
          user.is_following = false
        }
      }
      return res
    } catch (error) {
      console.error('取消关注失败:', error)
      throw error
    }
  }

  // 检查是否已关注
  const isFollowing = (userId: number) => {
    return followingList.value.some(u => u.id === userId)
  }

  // 清空列表
  const clearLists = () => {
    followingList.value = []
    followersList.value = []
    hasMore.value = true
  }

  return {
    // State
    followingList,
    followersList,
    loading,
    hasMore,
    // Getters
    getFollowingCount,
    getFollowersCount,
    getFollowingList,
    getFollowersList,
    // Actions
    fetchFollowing,
    fetchFollowers,
    followUser: followUserAction,
    unfollowUser: unfollowUserAction,
    isFollowing,
    clearLists
  }
})
