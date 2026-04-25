/**
 * Content Management Types
 */

/**
 * Banner entity
 */
export interface Banner {
  id: number
  title: string
  imageUrl: string
  linkUrl?: string
  sortOrder: number
  status: 'active' | 'inactive'
  startDate?: string
  endDate?: string
  createdAt: string
  updatedAt: string
}

/**
 * Banner list query parameters
 */
export interface BannerListParams {
  page: number
  pageSize: number
  status?: 'active' | 'inactive'
  keyword?: string
}

/**
 * Banner list response
 */
export interface BannerListResponse {
  list: Banner[]  // 后端使用 list 而不是 items
  total: number
  page: number
  pageSize: number
}

/**
 * Banner create/update request
 */
export interface BannerRequest {
  title: string
  imageUrl: string
  linkUrl?: string
  sortOrder: number
  status: 'active' | 'inactive'
  startDate?: string
  endDate?: string
}

/**
 * Banner sort request
 */
export interface BannerSortRequest {
  bannerId: number
  newSortOrder: number
}

/**
 * Announcement entity
 */
export interface Announcement {
  id: number
  title: string
  content: string
  type: 'system' | 'activity' | 'maintenance' | 'update'
  status: 'draft' | 'published' | 'archived'
  publishedAt?: string
  createdBy: string
  createdAt: string
  updatedAt: string
}

/**
 * Announcement list query parameters
 */
export interface AnnouncementListParams {
  page: number
  pageSize: number
  status?: 'draft' | 'published' | 'archived'
  type?: 'system' | 'activity' | 'maintenance' | 'update'
  keyword?: string
}

/**
 * Announcement list response
 */
export interface AnnouncementListResponse {
  list: Announcement[]  // 后端使用 list 而不是 items
  total: number
  page: number
  pageSize: number
}

/**
 * Announcement create/update request
 */
export interface AnnouncementRequest {
  title: string
  content: string
  type: 'system' | 'activity' | 'maintenance' | 'update'
  status: 'draft' | 'published' | 'archived'
}

/**
 * File upload response
 */
export interface FileUploadResponse {
  url: string
  filename: string
  size: number
  mimeType: string
}

/**
 * Content statistics - 匹配后端返回字段
 */
export interface ContentStats {
  banners: number
  activeBanners: number
  announcements: number
  publishedAnnouncements: number
}
