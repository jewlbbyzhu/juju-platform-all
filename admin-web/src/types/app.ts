/**
 * App Version Management Types
 */

/**
 * App version information
 */
export interface AppVersion {
  id: number
  versionName: string // e.g., "1.0.0"
  versionCode: number // e.g., 100
  platform: 'android' | 'ios' | 'both'
  fileUrl: string
  fileSize: number // in bytes
  fileName: string
  updateType: 'force' | 'recommend' | 'optional'
  updateContent: string // Update description/changelog
  minSupportVersion?: string // Minimum supported version
  status: 'draft' | 'published' | 'archived'
  downloadCount: number
  publishedAt?: string
  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy?: string
}

/**
 * App version list query parameters
 */
export interface AppVersionListParams {
  page: number
  pageSize: number
  platform?: 'android' | 'ios' | 'both'
  status?: 'draft' | 'published' | 'archived'
  updateType?: 'force' | 'recommend' | 'optional'
  keyword?: string // Search by version name or update content
  startDate?: string
  endDate?: string
}

/**
 * App version list response
 */
export interface AppVersionListResponse {
  list: AppVersion[]
  total: number
  page: number
  pageSize: number
}

/**
 * App version create/update request
 */
export interface AppVersionRequest {
  versionName: string
  versionCode: number
  platform: 'android' | 'ios' | 'both'
  fileUrl: string
  fileSize: number
  fileName: string
  updateType: 'force' | 'recommend' | 'optional'
  updateContent: string
  minSupportVersion?: string
  status?: 'draft' | 'published'
}

/**
 * File upload response
 */
export interface AppFileUploadResponse {
  url: string
  fileName: string
  fileSize: number
  uploadedAt: string
}

/**
 * App version statistics
 */
export interface AppVersionStats {
  totalVersions: number
  publishedVersions: number
  totalDownloads: number
  latestVersion: {
    android?: AppVersion
    ios?: AppVersion
  }
  downloadTrend: {
    date: string
    downloads: number
    platform: 'android' | 'ios'
  }[]
  platformDistribution: {
    platform: 'android' | 'ios'
    count: number
    percentage: number
  }[]
}

/**
 * User feedback
 */
export interface UserFeedback {
  id: number
  userId: number
  userName: string
  userAvatar?: string
  versionName: string
  platform: 'android' | 'ios'
  feedbackType: 'bug' | 'feature' | 'improvement' | 'other'
  title: string
  content: string
  images?: string[]
  status: 'pending' | 'processing' | 'resolved' | 'closed'
  reply?: string
  repliedAt?: string
  repliedBy?: string
  createdAt: string
  updatedAt: string
}

/**
 * User feedback list query parameters
 */
export interface UserFeedbackListParams {
  page: number
  pageSize: number
  status?: 'pending' | 'processing' | 'resolved' | 'closed'
  feedbackType?: 'bug' | 'feature' | 'improvement' | 'other'
  platform?: 'android' | 'ios'
  keyword?: string
  startDate?: string
  endDate?: string
}

/**
 * User feedback list response
 */
export interface UserFeedbackListResponse {
  list: UserFeedback[]
  total: number
  page: number
  pageSize: number
}

/**
 * User feedback reply request
 */
export interface FeedbackReplyRequest {
  reply: string
  status?: 'processing' | 'resolved' | 'closed'
}

/**
 * Download statistics query parameters
 */
export interface DownloadStatsParams {
  versionId?: number
  platform?: 'android' | 'ios'
  startDate?: string
  endDate?: string
  groupBy?: 'day' | 'week' | 'month'
}

/**
 * Download statistics response
 */
export interface DownloadStatsResponse {
  totalDownloads: number
  stats: {
    date: string
    downloads: number
    platform?: 'android' | 'ios'
  }[]
}
