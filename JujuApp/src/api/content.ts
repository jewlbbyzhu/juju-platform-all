// 内容/帖子 API
import api from "./index";
import { ApiResponse, PageResponse, Post } from '../types/api';

export interface Banner {
  id: number;
  title: string;
  image: string;
  link?: string;
  position: string;
  sort: number;
}

export interface Announcement {
  id: number;
  title: string;
  content: string;
  isTop: boolean;
  createdAt: string;
}

export const contentApi = {
  getContents: (params = {}): Promise<PageResponse<Post>> => api.get("/content", { params }),
  getContentDetail: (id: string | number): Promise<ApiResponse<Post>> => api.get(`/content/${id}`),
  getPosts: (params = {}): Promise<PageResponse<Post>> => api.get("/posts", { params }),
  getPostDetail: (id: string | number): Promise<ApiResponse<Post>> => api.get(`/posts/${id}`),
  getBanners: (position = "home"): Promise<ApiResponse<Banner[]>> => api.get("/content/banners", { params: { position } }),
  getAnnouncements: (params = {}): Promise<PageResponse<Announcement>> => api.get("/content/announcements", { params }),
  getAnnouncementDetail: (id: string | number): Promise<ApiResponse<Announcement>> => api.get(`/content/announcements/${id}`),
};

export default contentApi;
