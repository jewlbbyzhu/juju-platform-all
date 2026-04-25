// Party management types

// Party data model - 匹配后端实际返回结构
export interface Party {
  id: number
  title: string
  description: string
  category: PartyCategory
  tags: string[]
  images: string[]
  // 后端使用 snake_case 的字段
  start_time: string
  end_time: string
  registration_deadline?: string
  earlybird_deadline?: string
  location: PartyLocation
  max_participants: number
  current_participants: number
  gender_restriction: GenderRestriction
  age_restriction: AgeRestriction
  ticket_mode: TicketMode
  ticket_types: TicketType[]
  user_id: number
  organizer?: PartyOrganizer
  // 后端使用两个字段表示状态
  status: number  // 0=草稿, 1=已发布, 2=已结束, 3=已取消
  audit_status: number  // 0=待审核, 1=已通过, 2=已拒绝
  audit_info?: PartyAuditInfo
  created_at: string
  updated_at: string
  // 后端额外字段
  cover_image?: string
  address?: string
  latitude?: number
  longitude?: number
  min_price?: number
  max_price?: number
  is_featured?: boolean
  is_hot?: boolean
  view_count?: number
  favorite_count?: number
}

// Party location
export interface PartyLocation {
  address: string
  latitude: number
  longitude: number
}

// Age restriction
export interface AgeRestriction {
  min?: number
  max?: number
}

// Ticket type
export interface TicketType {
  id: number
  name: string
  price: number  // 单位：分
  quantity: number
  sold: number
  deadline?: string
  gender?: 0 | 1 | 2  // 0=无限制, 1=男性, 2=女性
}

// Party organizer - 匹配后端返回字段
export interface PartyOrganizer {
  id: number
  nickname: string
  avatar: string
  is_vip?: boolean
  vip_type?: VipType
}

// Party audit info
export interface PartyAuditInfo {
  reviewer?: string
  reviewedAt?: string
  reason?: string
  status: AuditStatus
}

// Party list request parameters
export interface PartyListParams {
  page: number
  pageSize: number
  keyword?: string
  status?: PartyStatus
  category?: PartyCategory
  organizerId?: number
  startDate?: string
  endDate?: string
  sortBy?: 'createdAt' | 'startTime' | 'currentParticipants'
  sortOrder?: 'asc' | 'desc'
  vipOnly?: boolean  // 仅显示VIP用户创建的聚会
}

// Party list response
export interface PartyListResponse {
  list: Party[]
  total: number
  page: number
  pageSize: number
}

// Party detail
export interface PartyDetail extends Party {
  // 参与者列表
  participants: PartyParticipant[]
  // 审核历史
  auditHistory: PartyAuditHistory[]
}

// Party participant
export interface PartyParticipant {
  id: number
  userId: number
  nickname: string
  avatar: string
  gender: 0 | 1 | 2
  ticketType: string
  ticketCount: number
  joinedAt: string
}

// Party audit history
export interface PartyAuditHistory {
  id: number
  reviewer: string
  status: AuditStatus
  reason?: string
  createdAt: string
}

// Party audit request
export interface PartyAuditRequest {
  status: AuditStatus
  reason?: string
}

// Party statistics
export interface PartyStatsData {
  totalParties: number
  pendingParties: number
  ongoingParties: number
  completedParties: number
  rejectedParties: number
  newPartiesToday: number
  newPartiesThisWeek: number
  newPartiesThisMonth: number
  partyGrowthTrend: {
    date: string
    count: number
  }[]
  vipParties: number
  normalParties: number
}

// Enums
// 注意：这些值必须与后端数据库中的状态值匹配
// 后端使用 status 和 audit_status 两个字段
// status: 0=草稿, 1=已发布, 2=已结束, 3=已取消
// audit_status: 0=待审核, 1=已通过, 2=已拒绝
export enum PartyStatus {
  DRAFT = 0,           // 草稿 (status=0)
  PUBLISHED = 1,       // 已发布 (status=1)
  ENDED = 2,           // 已结束 (status=2)
  CANCELLED = 3        // 已取消 (status=3)
}

export enum PartyAuditStatus {
  PENDING = 0,         // 待审核
  APPROVED = 1,        // 已通过
  REJECTED = 2         // 已拒绝
}

export enum PartyCategory {
  NEON = 0,      // 霓虹
  COOL = 1,      // 潮酷
  PREMIUM = 2,   // 高级
  FUTURE = 3     // 未来
}

export enum GenderRestriction {
  NONE = 0,      // 无限制
  MALE_ONLY = 1, // 仅限男性
  FEMALE_ONLY = 2 // 仅限女性
}

export enum TicketMode {
  NORMAL = 0,           // 普通票
  EARLY_BIRD = 1,       // 普通票 + 早鸟票
  GENDER = 2,           // 男士票 + 女士票
  GENDER_EARLY_BIRD = 3 // 男士票 + 女士票 + 早鸟票
}

export enum AuditStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

export enum VipType {
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly'
}

// Export party request
export interface ExportPartyRequest {
  keyword?: string
  status?: PartyStatus
  category?: PartyCategory
  startDate?: string
  endDate?: string
}

