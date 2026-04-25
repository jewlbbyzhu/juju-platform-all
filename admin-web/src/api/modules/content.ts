import request from '../request'
import type {
  Banner,
  BannerListParams,
  BannerListResponse,
  BannerRequest,
  BannerSortRequest,
  Announcement,
  AnnouncementListParams,
  AnnouncementListResponse,
  AnnouncementRequest,
  FileUploadResponse,
  ContentStats
} from '@/types/content'

export class ContentAPI {
  /**
   * Get banner list with pagination and filters
   * @param params - Query parameters
   * @returns Paginated banner list
   */
  static async getBanners(params: BannerListParams): Promise<BannerListResponse> {
    return request.get('/content/banners', { params })
  }

  /**
   * Get banner detail by ID
   * @param id - Banner ID
   * @returns Banner detail
   */
  static async getBannerDetail(id: number): Promise<Banner> {
    return request.get(`/content/banners/${id}`)
  }

  /**
   * Create new banner
   * @param data - Banner data
   * @returns Created banner
   */
  static async createBanner(data: BannerRequest): Promise<Banner> {
    return request.post('/content/banners', data)
  }

  /**
   * Update banner
   * @param id - Banner ID
   * @param data - Banner data
   * @returns Updated banner
   */
  static async updateBanner(id: number, data: BannerRequest): Promise<Banner> {
    return request.put(`/content/banners/${id}`, data)
  }

  /**
   * Delete banner
   * @param id - Banner ID
   * @returns void
   */
  static async deleteBanner(id: number): Promise<void> {
    return request.delete(`/content/banners/${id}`)
  }

  /**
   * Update banner status (enable/disable)
   * @param id - Banner ID
   * @param status - New status
   * @returns Updated banner
   */
  static async updateBannerStatus(
    id: number,
    status: 'active' | 'inactive'
  ): Promise<Banner> {
    return request.patch(`/content/banners/${id}/status`, { status })
  }

  /**
   * Sort banners (update sort order)
   * @param data - Sort data
   * @returns void
   */
  static async sortBanners(data: BannerSortRequest[]): Promise<void> {
    return request.post('/content/banners/sort', { items: data })
  }

  /**
   * Get announcement list with pagination and filters
   * @param params - Query parameters
   * @returns Paginated announcement list
   */
  static async getAnnouncements(
    params: AnnouncementListParams
  ): Promise<AnnouncementListResponse> {
    return request.get('/content/announcements', { params })
  }

  /**
   * Get announcement detail by ID
   * @param id - Announcement ID
   * @returns Announcement detail
   */
  static async getAnnouncementDetail(id: number): Promise<Announcement> {
    return request.get(`/content/announcements/${id}`)
  }

  /**
   * Create new announcement
   * @param data - Announcement data
   * @returns Created announcement
   */
  static async createAnnouncement(data: AnnouncementRequest): Promise<Announcement> {
    return request.post('/content/announcements', data)
  }

  /**
   * Update announcement
   * @param id - Announcement ID
   * @param data - Announcement data
   * @returns Updated announcement
   */
  static async updateAnnouncement(
    id: number,
    data: AnnouncementRequest
  ): Promise<Announcement> {
    return request.put(`/content/announcements/${id}`, data)
  }

  /**
   * Delete announcement
   * @param id - Announcement ID
   * @returns void
   */
  static async deleteAnnouncement(id: number): Promise<void> {
    return request.delete(`/content/announcements/${id}`)
  }

  /**
   * Publish announcement
   * @param id - Announcement ID
   * @returns Updated announcement
   */
  static async publishAnnouncement(id: number): Promise<Announcement> {
    return request.post(`/content/announcements/${id}/publish`)
  }

  /**
   * Archive announcement
   * @param id - Announcement ID
   * @returns Updated announcement
   */
  static async archiveAnnouncement(id: number): Promise<Announcement> {
    return request.post(`/content/announcements/${id}/archive`)
  }

  /**
   * Upload file (image, document, etc.)
   * @param file - File to upload
   * @param type - File type (banner, announcement, etc.)
   * @returns Upload response with file URL
   */
  static async uploadFile(
    file: File,
    type: 'banner' | 'announcement' | 'other' = 'other'
  ): Promise<FileUploadResponse> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', type)

    return request.post('/content/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }

  /**
   * Get content statistics
   * @returns Content statistics
   */
  static async getContentStats(): Promise<ContentStats> {
    return request.get('/content/stats')
  }

  /**
   * Batch delete banners
   * @param ids - Banner IDs
   * @returns void
   */
  static async batchDeleteBanners(ids: number[]): Promise<void> {
    return request.post('/content/banners/batch/delete', { ids })
  }

  /**
   * Batch update banner status
   * @param ids - Banner IDs
   * @param status - New status
   * @returns void
   */
  static async batchUpdateBannerStatus(
    ids: number[],
    status: 'active' | 'inactive'
  ): Promise<void> {
    return request.post('/content/banners/batch/status', { ids, status })
  }

  /**
   * Batch delete announcements
   * @param ids - Announcement IDs
   * @returns void
   */
  static async batchDeleteAnnouncements(ids: number[]): Promise<void> {
    return request.post('/content/announcements/batch/delete', { ids })
  }
}

// Export for backward compatibility
export const contentAPI = {
  getBanners: ContentAPI.getBanners,
  getBannerDetail: ContentAPI.getBannerDetail,
  createBanner: ContentAPI.createBanner,
  updateBanner: ContentAPI.updateBanner,
  deleteBanner: ContentAPI.deleteBanner,
  updateBannerStatus: ContentAPI.updateBannerStatus,
  sortBanners: ContentAPI.sortBanners,
  getAnnouncements: ContentAPI.getAnnouncements,
  getAnnouncementDetail: ContentAPI.getAnnouncementDetail,
  createAnnouncement: ContentAPI.createAnnouncement,
  updateAnnouncement: ContentAPI.updateAnnouncement,
  deleteAnnouncement: ContentAPI.deleteAnnouncement,
  publishAnnouncement: ContentAPI.publishAnnouncement,
  archiveAnnouncement: ContentAPI.archiveAnnouncement,
  uploadFile: ContentAPI.uploadFile,
  getContentStats: ContentAPI.getContentStats,
  batchDeleteBanners: ContentAPI.batchDeleteBanners,
  batchUpdateBannerStatus: ContentAPI.batchUpdateBannerStatus,
  batchDeleteAnnouncements: ContentAPI.batchDeleteAnnouncements,
}
