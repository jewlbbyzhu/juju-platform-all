import request from '../request'
import type {
  AppVersion,
  AppVersionListParams,
  AppVersionListResponse,
  AppFileUploadResponse,
  UserFeedbackListParams,
  UserFeedbackListResponse,
  FeedbackReplyRequest,
  DownloadStatsParams,
  DownloadStatsResponse,
  AppVersionStats
} from '@/types/app'

export class AppAPI {
  static async getVersions(params: AppVersionListParams): Promise<AppVersionListResponse> {
    return request.get('/app/versions', { params })
  }

  static async createVersion(data: {
    versionName: string
    versionCode: number
    platform: 'android' | 'ios' | 'both'
    fileUrl: string
    fileSize: number
    fileName: string
    updateType: 'force' | 'recommend' | 'optional'
    updateContent: string
    minSupportVersion?: string
    status?: 'draft' | 'published' | 'archived'
  }): Promise<{ id: number }> {
    return request.post('/app/versions', data)
  }

  static async updateVersion(id: number, data: Partial<AppVersion>): Promise<void> {
    return request.put(`/app/versions/${id}`, data)
  }

  static async deleteVersion(id: number): Promise<void> {
    return request.delete(`/app/versions/${id}`)
  }

  static async publishVersion(id: number): Promise<void> {
    return request.post(`/app/versions/${id}/publish`)
  }

  static async uploadFile(file: File): Promise<AppFileUploadResponse> {
    const formData = new FormData()
    formData.append('file', file)
    return request.post('/app/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }

  static async getFeedback(params: UserFeedbackListParams): Promise<UserFeedbackListResponse> {
    return request.get('/app/feedback', { params })
  }

  static async getFeedbackList(params: UserFeedbackListParams): Promise<UserFeedbackListResponse> {
    return this.getFeedback(params)
  }

  static async replyFeedback(id: number, data: FeedbackReplyRequest): Promise<void> {
    return request.put(`/app/feedback/${id}/reply`, data)
  }

  static async updateFeedbackStatus(id: number, data: { status: 'pending' | 'processing' | 'resolved' | 'closed' }): Promise<void> {
    return request.put(`/app/feedback/${id}/status`, data)
  }

  static async getStatistics(): Promise<AppVersionStats> {
    return request.get('/app/stats')
  }

  static async getVersionStats(): Promise<AppVersionStats> {
    return this.getStatistics()
  }

  static async getLatestVersion(platform: 'android' | 'ios'): Promise<AppVersion | null> {
    const resp: AppVersionListResponse = await request.get('/app/versions', { params: { page: 1, pageSize: 1, platform, status: 'published', sort: 'versionCode:desc' } })
    return resp.list?.[0] ?? null
  }

  static async getDownloadStats(params: DownloadStatsParams): Promise<DownloadStatsResponse> {
    return request.get('/app/downloads', { params })
  }
}

export const appAPI = {
  getVersions: AppAPI.getVersions,
  createVersion: AppAPI.createVersion,
  updateVersion: AppAPI.updateVersion,
  deleteVersion: AppAPI.deleteVersion,
  publishVersion: AppAPI.publishVersion,
  uploadFile: AppAPI.uploadFile,
  getFeedback: AppAPI.getFeedback,
  replyFeedback: AppAPI.replyFeedback,
  updateFeedbackStatus: AppAPI.updateFeedbackStatus,
  getStatistics: AppAPI.getStatistics,
  getDownloadStats: AppAPI.getDownloadStats,
}
