// 统一导出所有类型

// 用户相关类型
export interface UserInfo {
  id: number
  nickname: string
  avatar: string
  phone: string
  bio: string
  is_vip: boolean
  vip_level: number
  vip_expire_time: string
  following_count: number
  followers_count: number
  created_count: number
  participated_count: number
  balance: number
  points: number
}

// 聚会相关类型
export interface Party {
  id: number
  title: string
  description: string
  cover_image: string
  category: string
  city: string
  address: string
  start_time: string
  end_time: string
  price: number
  original_price: number
  max_participants: number
  current_participants: number
  organizer: {
    id: number
    nickname: string
    avatar: string
  }
  tags: string[]
  is_favorite: boolean
  status: 'upcoming' | 'ongoing' | 'ended' | 'cancelled'
  created_at: string
}

// 聚会筛选条件
export interface PartyFilter {
  category?: string
  city?: string
  minPrice?: number
  maxPrice?: number
  startDate?: string
  endDate?: string
  sortBy?: 'newest' | 'price_asc' | 'price_desc' | 'popular'
}

// 订单相关类型
export interface Order {
  id: number
  order_no: string
  party_id: number
  party_title: string
  ticket_type: string
  quantity: number
  total_amount: number
  status: 'pending' | 'paid' | 'cancelled' | 'refunded'
  created_at: string
  paid_at?: string
}

// 票券相关类型
export interface Ticket {
  id: number
  ticket_no: string
  party_id: number
  party_title: string
  qr_code: string
  status: 'unused' | 'used' | 'expired' | 'refunded'
  valid_time: string
  used_time?: string
}

// 消息相关类型
export interface Message {
  id: number
  type: 'system' | 'chat' | 'notification'
  title: string
  content: string
  is_read: boolean
  created_at: string
}

// 聊天相关类型
export interface Chat {
  id: number
  target_id: number
  target_name: string
  target_avatar: string
  last_message: string
  unread_count: number
  updated_at: string
}

// API 响应类型
export interface ApiResponse<T = any> {
  code: number
  data: T
  message: string
}

// 分页响应类型
export interface PaginatedResponse<T> {
  list: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

// 应用配置类型
export interface AppConfig {
  theme: 'dark' | 'light'
  language: string
  fontSize: 'small' | 'medium' | 'large'
  notificationEnabled: boolean
  soundEnabled: boolean
  vibrationEnabled: boolean
}

// VIP 相关类型
export interface VipInfo {
  level: number
  points: number
  expire_time: string
  privileges: string[]
}

// 社交相关类型
export interface SocialStats {
  following_count: number
  followers_count: number
  created_count: number
  participated_count: number
}
