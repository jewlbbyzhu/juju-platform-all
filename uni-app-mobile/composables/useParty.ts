import { ref, computed } from 'vue'
import { usePartyStore } from '@/stores/party'
import { partyApi } from '../services/party'
import type { Party, PartyFilter } from '@/stores/party'

// 聚会相关的组合式函数
export function useParty() {
  const partyStore = usePartyStore()
  
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  // 聚会列表
  const partyList = computed(() => partyStore.getPartyList)
  const currentParty = computed(() => partyStore.getCurrentParty)
  const hasMore = computed(() => partyStore.getHasMore)
  const isLoading = computed(() => partyStore.getLoading)
  
  // 获取聚会列表
  const fetchPartyList = async (params?: PartyFilter, refresh = false) => {
    if (refresh) {
      partyStore.clearPartyList()
    }
    
    if (!hasMore.value && !refresh) return
    
    partyStore.setLoading(true)
    error.value = null
    
    try {
      const res = await partyApi.getPartyList({
        ...params,
        ...partyStore.filter,
        page: partyStore.currentPage,
        limit: 10
      })
      
      if (refresh) {
        partyStore.setPartyList(res.list)
      } else {
        partyStore.appendPartyList(res.list)
      }
      
      partyStore.setHasMore(res.hasMore)
      partyStore.incrementPage()
      
      return res.list
    } catch (err: any) {
      error.value = err.message || '获取聚会列表失败'
      return []
    } finally {
      partyStore.setLoading(false)
    }
  }
  
  // 获取聚会详情
  const fetchPartyDetail = async (id: number) => {
    loading.value = true
    error.value = null
    
    try {
      const party = await partyApi.getPartyDetail(id)
      partyStore.setCurrentParty(party)
      return party
    } catch (err: any) {
      error.value = err.message || '获取聚会详情失败'
      return null
    } finally {
      loading.value = false
    }
  }
  
  // 创建聚会
  const createParty = async (data: Partial<Party>) => {
    loading.value = true
    
    try {
      const party = await partyApi.createParty(data)
      partyStore.addParty(party)
      uni.showToast({
        title: '创建成功',
        icon: 'success'
      })
      return party
    } catch (err: any) {
      uni.showToast({
        title: err.message || '创建失败',
        icon: 'none'
      })
      return null
    } finally {
      loading.value = false
    }
  }
  
  // 更新聚会
  const updateParty = async (id: number, data: Partial<Party>) => {
    loading.value = true
    
    try {
      const party = await partyApi.updateParty(id, data)
      partyStore.updateParty(id, party)
      uni.showToast({
        title: '更新成功',
        icon: 'success'
      })
      return party
    } catch (err: any) {
      uni.showToast({
        title: err.message || '更新失败',
        icon: 'none'
      })
      return null
    } finally {
      loading.value = false
    }
  }
  
  // 删除聚会
  const deleteParty = async (id: number) => {
    loading.value = true
    
    try {
      await partyApi.deleteParty(id)
      partyStore.removeParty(id)
      uni.showToast({
        title: '删除成功',
        icon: 'success'
      })
      return true
    } catch (err: any) {
      uni.showToast({
        title: err.message || '删除失败',
        icon: 'none'
      })
      return false
    } finally {
      loading.value = false
    }
  }
  
  // 收藏/取消收藏
  const toggleFavorite = async (id: number) => {
    try {
      const party = partyStore.getPartyList.find(p => p.id === id)
      if (party?.is_favorite) {
        await partyApi.unfavoriteParty(id)
      } else {
        await partyApi.favoriteParty(id)
      }
      partyStore.toggleFavorite(id)
      return true
    } catch (err: any) {
      uni.showToast({
        title: err.message || '操作失败',
        icon: 'none'
      })
      return false
    }
  }
  
  // 设置筛选条件
  const setFilter = (filter: PartyFilter) => {
    partyStore.setFilter(filter)
    partyStore.clearPartyList()
  }
  
  // 重置筛选
  const resetFilter = () => {
    partyStore.resetFilter()
    partyStore.clearPartyList()
  }
  
  // 加载更多
  const loadMore = async (params?: PartyFilter) => {
    await fetchPartyList(params)
  }
  
  // 刷新列表
  const refresh = async (params?: PartyFilter) => {
    await fetchPartyList(params, true)
  }
  
  return {
    loading,
    error,
    partyList,
    currentParty,
    hasMore,
    isLoading,
    fetchPartyList,
    fetchPartyDetail,
    createParty,
    updateParty,
    deleteParty,
    toggleFavorite,
    setFilter,
    resetFilter,
    loadMore,
    refresh
  }
}

export default useParty
