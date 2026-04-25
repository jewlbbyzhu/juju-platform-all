import { get, post, put, del } from './api'
import type { Party, PartyFilter } from '@/stores/party'

// 聚会相关 API
export const partyApi = {
  // 获取聚会列表
  getPartyList: (params?: PartyFilter & { page?: number; limit?: number }) => {
    return get<{ list: Party[]; total: number; hasMore: boolean }>('/party/list', params)
  },

  // 获取聚会详情
  getPartyDetail: (id: number) => {
    return get<Party>(`/party/${id}`)
  },

  // 创建聚会
  createParty: (data: Partial<Party>) => {
    return post<Party>('/party', data)
  },

  // 更新聚会
  updateParty: (id: number, data: Partial<Party>) => {
    return put<Party>(`/party/${id}`, data)
  },

  // 删除聚会
  deleteParty: (id: number) => {
    return del(`/party/${id}`)
  },

  // 收藏聚会
  favoriteParty: (id: number) => {
    return post(`/party/${id}/favorite`)
  },

  // 取消收藏
  unfavoriteParty: (id: number) => {
    return post(`/party/${id}/unfavorite`)
  },

  // 获取收藏的聚会
  getFavoriteParties: (params?: { page?: number; limit?: number }) => {
    return get<{ list: Party[]; total: number }>('/party/favorites', params)
  },

  // 获取我创建的聚会
  getMyParties: (params?: { page?: number; limit?: number }) => {
    return get<{ list: Party[]; total: number }>('/party/my', params)
  },

  // 获取我参与的聚会
  getParticipatedParties: (params?: { page?: number; limit?: number }) => {
    return get<{ list: Party[]; total: number }>('/party/participated', params)
  },

  // 搜索聚会
  searchParties: (keyword: string, params?: { page?: number; limit?: number }) => {
    return get<{ list: Party[]; total: number }>('/party/search', { keyword, ...params })
  },

  // 获取分类列表
  getCategories: () => {
    return get<string[]>('/party/categories')
  },

  // 获取城市列表
  getCities: () => {
    return get<string[]>('/party/cities')
  }
}

export default partyApi
