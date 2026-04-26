// 标签 API
import api from "./index";
import { ApiResponse, PageResponse, Tag, Party } from '../types/api';

export interface TagDetail extends Tag {
  description?: string;
  followerCount?: number;
  isFollowed?: boolean;
}

export const tagApi = {
  getTags: (params = {}): Promise<PageResponse<Tag>> => api.get("/tags", { params }),
  getTagList: (params = {}): Promise<PageResponse<Tag>> => api.get("/tags", { params }),
  getHotTags: (params = {}): Promise<ApiResponse<Tag[]>> => api.get("/tags/hot", { params }),
  getTagDetail: (tagId: string | number): Promise<ApiResponse<TagDetail>> => api.get(`/tags/${tagId}`),
  createTag: (data: { name: string; icon?: string }): Promise<ApiResponse<Tag>> => api.post("/tags", data),
  updateTag: (tagId: string | number, data: { name?: string; icon?: string }): Promise<ApiResponse<Tag>> => api.put(`/tags/${tagId}`, data),
  deleteTag: (tagId: string | number): Promise<ApiResponse<void>> => api.delete(`/tags/${tagId}`),
  followTag: (tagId: string | number): Promise<ApiResponse<void>> => api.post(`/tags/${tagId}/follow`),
  unfollowTag: (tagId: string | number): Promise<ApiResponse<void>> => api.post(`/tags/${tagId}/unfollow`),
  getTagParties: (tagId: string | number, params = {}): Promise<PageResponse<Party>> => api.get(`/tags/${tagId}/parties`, { params }),
  searchTags: (keyword: string): Promise<ApiResponse<Tag[]>> => api.get("/tags/search", { params: { keyword } }),
  getRecommendedTags: (params = {}): Promise<ApiResponse<Tag[]>> => api.get("/tags/recommended", { params }),
};

export default tagApi;
