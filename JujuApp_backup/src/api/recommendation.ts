// 推荐 API
import api from "./index";
import { ApiResponse, PageResponse, Party } from '../types/api';

export interface RecommendationParams {
  page?: number;
  pageSize?: number;
  category?: string;
  location?: string;
  dateRange?: string;
}

export interface BehaviorTrackData {
  action: string;
  targetId?: number;
  targetType?: string;
  metadata?: Record<string, unknown>;
}

export const recommendationApi = {
  getRecommendations: (params: RecommendationParams = {}) => api.get<ApiResponse<PageResponse<Party>>>("/recommendations", { params }),
  getSimilarParties: (partyId: string | number, params: RecommendationParams = {}) => api.get<ApiResponse<Party[]>>(`/recommendations/similar/${partyId}`, { params }),
  getHotParties: (params: RecommendationParams = {}) => api.get<ApiResponse<PageResponse<Party>>>("/recommendations/hot", { params }),
  getNearbyParties: (params: { latitude: number; longitude: number; radius?: number; page?: number; pageSize?: number } = { latitude: 0, longitude: 0 }) => api.get<ApiResponse<PageResponse<Party>>>("/recommendations/nearby", { params }),
  updatePreferences: (data: { categories?: string[]; tags?: string[]; priceRange?: [number, number] }) => api.post<ApiResponse<void>>("/recommendations/preferences", data),
  getPreferences: () => api.get<ApiResponse<{ categories: string[]; tags: string[]; priceRange: [number, number] }>>("/recommendations/preferences"),
  trackBehavior: (data: BehaviorTrackData) => api.post<ApiResponse<void>>("/recommendations/behavior", data),
};

export default recommendationApi;
