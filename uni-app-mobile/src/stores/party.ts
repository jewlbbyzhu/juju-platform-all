import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// 聚会信息类型
export interface Party {
  id: number
  title: string
  description: string
  cover_image: string
  category: string
  city: string
  address: string
  start_time: string
  end_time: string
  price: number
  original_price: number
  max_participants: number
  current_participants: number
  organizer: {
    id: number
    nickname: string
    avatar: string
  }
  tags: string[]
  is_favorite: boolean
  status: 'upcoming' | 'ongoing' | 'ended' | 'cancelled'
  created_at: string
}

// 聚会筛选条件
export interface PartyFilter {
  category?: string
  city?: string
  minPrice?: number
  maxPrice?: number
  startDate?: string
  endDate?: string
  sortBy?: 'newest' | 'price_asc' | 'price_desc' | 'popular'
}

// 聚会状态
export const usePartyStore = defineStore('party', () => {
  // State
  const partyList = ref<Party[]>([])
  const currentParty = ref<Party | null>(null)
  const favoriteParties = ref<Party[]>([])
  const myParties = ref<Party[]>([])
  const filter = ref<PartyFilter>({})
  const loading = ref(false)
  const hasMore = ref(true)
  const currentPage = ref(1)

  // Getters
  const getPartyList = computed(() => partyList.value)
  const getCurrentParty = computed(() => currentParty.value)
  const getFavoriteParties = computed(() => favoriteParties.value)
  const getMyParties = computed(() => myParties.value)
  const getFilter = computed(() => filter.value)
  const getLoading = computed(() => loading.value)
  const getHasMore = computed(() => hasMore.value)

  // 按分类筛选的聚会
  const getPartiesByCategory = computed(() => {
    return (category: string) => {
      if (!category) return partyList.value
      return partyList.value.filter(party => party.category === category)
    }
  })

  // 按城市筛选的聚会
  const getPartiesByCity = computed(() => {
    return (city: string) => {
      if (!city) return partyList.value
      return partyList.value.filter(party => party.city === city)
    }
  })

  // Actions
  const setPartyList = (list: Party[]) => {
    partyList.value = list
  }

  const appendPartyList = (list: Party[]) => {
    partyList.value = [...partyList.value, ...list]
  }

  const setCurrentParty = (party: Party | null) => {
    currentParty.value = party
  }

  const setFilter = (newFilter: PartyFilter) => {
    filter.value = { ...filter.value, ...newFilter }
  }

  const resetFilter = () => {
    filter.value = {}
  }

  const setLoading = (status: boolean) => {
    loading.value = status
  }

  const setHasMore = (status: boolean) => {
    hasMore.value = status
  }

  const setCurrentPage = (page: number) => {
    currentPage.value = page
  }

  const incrementPage = () => {
    currentPage.value++
  }

  // 收藏/取消收藏
  const toggleFavorite = (partyId: number) => {
    const party = partyList.value.find(p => p.id === partyId)
    if (party) {
      party.is_favorite = !party.is_favorite
      
      if (party.is_favorite) {
        favoriteParties.value.push(party)
      } else {
        favoriteParties.value = favoriteParties.value.filter(p => p.id !== partyId)
      }
    }
  }

  // 添加新聚会到列表
  const addParty = (party: Party) => {
    partyList.value.unshift(party)
    myParties.value.unshift(party)
  }

  // 更新聚会信息
  const updateParty = (partyId: number, updates: Partial<Party>) => {
    const index = partyList.value.findIndex(p => p.id === partyId)
    if (index !== -1) {
      partyList.value[index] = { ...partyList.value[index], ...updates }
    }
    
    if (currentParty.value?.id === partyId) {
      currentParty.value = { ...currentParty.value, ...updates }
    }
  }

  // 删除聚会
  const removeParty = (partyId: number) => {
    partyList.value = partyList.value.filter(p => p.id !== partyId)
    myParties.value = myParties.value.filter(p => p.id !== partyId)
    favoriteParties.value = favoriteParties.value.filter(p => p.id !== partyId)
    
    if (currentParty.value?.id === partyId) {
      currentParty.value = null
    }
  }

  // 清空列表
  const clearPartyList = () => {
    partyList.value = []
    currentPage.value = 1
    hasMore.value = true
  }

  return {
    // State
    partyList,
    currentParty,
    favoriteParties,
    myParties,
    filter,
    loading,
    hasMore,
    currentPage,
    // Getters
    getPartyList,
    getCurrentParty,
    getFavoriteParties,
    getMyParties,
    getFilter,
    getLoading,
    getHasMore,
    getPartiesByCategory,
    getPartiesByCity,
    // Actions
    setPartyList,
    appendPartyList,
    setCurrentParty,
    setFilter,
    resetFilter,
    setLoading,
    setHasMore,
    setCurrentPage,
    incrementPage,
    toggleFavorite,
    addParty,
    updateParty,
    removeParty,
    clearPartyList
  }
})
