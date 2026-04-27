// 收藏 API
import api from "./index";
import { ApiResponse, PageResponse, Favorite } from '../types/api';

export interface FavoriteCheckResult {
  isFavorite: boolean;
  favoriteId?: number;
}

export const favoriteApi = {
  getFavorites: (params = {}): Promise<PageResponse<Favorite>> => api.get("/favorites", { params }),
  addFavorite: (data: { targetId: string | number; type: string }): Promise<ApiResponse<Favorite>> => api.post("/favorites", data),
  removeFavorite: (id: string | number): Promise<ApiResponse<void>> => api.delete(`/favorites/${id}`),
  checkFavorite: (targetId: string | number): Promise<ApiResponse<FavoriteCheckResult>> => api.get(`/favorites/check/${targetId}`),
};

export default favoriteApi;
