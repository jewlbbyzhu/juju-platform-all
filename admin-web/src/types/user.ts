// User management types

// User data model - 匹配后端实际返回结构
export interface User {
  id: number
  openid: string
  nickname: string
  avatar: string
  gender: 0 | 1 | 2  // 0=未知, 1=男, 2=女
  // 后端使用 province, city, country 而不是 region
  province?: string
  city?: string
  country?: string
  birthday?: string
  phone?: string
  email?: string
  // 后端使用数字表示状态: 0=禁用, 1=正常
  status: number
  language?: string
  created_at: string
  updated_at: string
  last_login_at?: string
  
  // 统计数据 - 后端可能不返回，设为可选
  stats?: UserStats
  // VIP 信息 - 后端可能不返回，设为可选
  is_vip?: boolean
  vip_type?: VipType
  vip_expired_at?: string
}

export interface UserStats {
  joinedCount: number      // 参与聚会次数
  createdCount: number     // 创建聚会次数
  favoriteCount: number    // 收藏数量
  orderCount: number       // 订单数量
  totalExpense: number     // 总支出(分)
}

// User list request parameters
export interface UserListParams {
  page: number
  pageSize: number
  keyword?: string
  status?: UserStatus
  vipStatus?: boolean
  startDate?: string
  endDate?: string
  sortBy?: 'createdAt' | 'lastLoginAt' | 'totalExpense'
  sortOrder?: 'asc' | 'desc'
}

// User list response
export interface UserListResponse {
  list: User[]
  total: number
  page: number
  pageSize: number
}

// User detail
export interface UserDetail extends User {
  // 行为记录
  activities: UserActivity[]
  // 订单列表
  orders: UserOrder[]
  // 参与的聚会
  parties: UserParty[]
}

// User activity
export interface UserActivity {
  id: number
  type: ActivityType
  description: string
  createdAt: string
  metadata?: Record<string, any>
}

// User order summary
export interface UserOrder {
  id: number
  orderNo: string
  orderType: string
  amount: number
  status: string
  createdAt: string
}

// User party summary
export interface UserParty {
  id: number
  title: string
  startTime: string
  status: string
  role: 'organizer' | 'participant'
}

// User statistics
export interface UserStatsData {
  totalUsers: number
  activeUsers: number
  vipUsers: number
  newUsersToday: number
  newUsersThisWeek: number
  newUsersThisMonth: number
  userGrowthTrend: {
    date: string
    count: number
  }[]
}

// Enums
// 后端使用数字表示用户状态: 0=禁用, 1=正常
export enum UserStatus {
  BANNED = 0,      // 禁用
  ACTIVE = 1       // 正常
}

export enum VipType {
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly'
}

export enum ActivityType {
  LOGIN = 'login',
  CREATE_PARTY = 'create_party',
  JOIN_PARTY = 'join_party',
  CREATE_ORDER = 'create_order',
  PAYMENT = 'payment',
  REFUND = 'refund',
  VIP_SUBSCRIBE = 'vip_subscribe'
}

// Update user status request
export interface UpdateUserStatusRequest {
  status: UserStatus
  reason?: string
}

// Export user request
export interface ExportUserRequest {
  keyword?: string
  status?: UserStatus
  vipStatus?: boolean
  startDate?: string
  endDate?: string
}
