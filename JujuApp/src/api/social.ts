// 社交相关 API
import api from "./index";
import { ApiResponse, PageResponse, Post } from '../types/api';

export interface Comment {
  id: number;
  postId: number;
  userId: number;
  userName?: string;
  userAvatar?: string;
  content: string;
  likeCount: number;
  replyCount: number;
  createdAt: string;
}

export interface CreatePostData {
  content: string;
  images?: string[];
  partyId?: number;
  location?: string;
  visibility?: 'public' | 'friends' | 'private';
}

export interface CommentData {
  content: string;
  parentId?: number;
}

export const socialApi = {
  getFeed: (params?: { page?: number; pageSize?: number }): Promise<PageResponse<Post>> => api.get("/social/feed", { params }),
  createPost: (data: CreatePostData): Promise<ApiResponse<Post>> => api.post("/social/posts", data),
  likePost: (postId: string): Promise<ApiResponse<void>> => api.post(`/social/posts/${postId}/like`),
  unlikePost: (postId: string): Promise<ApiResponse<void>> => api.delete(`/social/posts/${postId}/like`),
  commentPost: (postId: string, data: CommentData): Promise<ApiResponse<Comment>> => api.post(`/social/posts/${postId}/comments`, data),
  getComments: (postId: string, params?: { page?: number; pageSize?: number }): Promise<PageResponse<Comment>> => api.get(`/social/posts/${postId}/comments`, { params }),
  sharePost: (postId: string): Promise<ApiResponse<void>> => api.post(`/social/posts/${postId}/share`),
  getUserPosts: (userId: string, params?: { page?: number; pageSize?: number }): Promise<PageResponse<Post>> => api.get(`/social/users/${userId}/posts`, { params }),
};

export default socialApi;
