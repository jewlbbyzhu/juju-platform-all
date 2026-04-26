// Re-export navigation types
export * from './navigation';

export interface PageResult<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface User {
  id: number;
  nickname: string;
  avatar: string;
  phone: string;
  gender: 0 | 1 | 2;
  birthday: string;
  bio: string;
  createdAt: string;
  updatedAt: string;
}

export interface Party {
  id: number;
  title: string;
  name?: string;
  description: string;
  coverImage: string;
  images?: string[];
  startTime: string;
  endTime: string;
  location: string;
  maxParticipants: number;
  currentParticipants: number;
  status: number | string;
  price?: number;
  organizer: User;
  creator?: User;
}

export interface Order {
  id: number;
  orderNo: string;
  partyId: number;
  partyTitle: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  paidAt?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  code: number;
  message: string;
  data: T;
}

// List response wrapper for paginated results
export interface ListResponse<T> {
  list: T[];
  total?: number;
  page?: number;
  pageSize?: number;
  hasMore?: boolean;
}

// Conversation type for chat
export interface Conversation {
  id: string | number;
  name?: string;
  avatar?: string;
  type?: 'private' | 'group';
  unread_count?: number;
  last_message?: string;
  last_message_time?: string;
}

// Favorite item type
export interface FavoriteItem {
  id: string | number;
  type: 'party' | 'post' | 'user';
  title?: string;
  content?: string;
  image?: string;
  created_at?: string;
}

// VIP related types
export interface VIPInfo {
  currentLevel?: number;
  current_level?: number;
  currentPoints?: number;
  current_points?: number;
  totalPoints?: number;
  total_points?: number;
  availablePoints?: number;
  available_points?: number;
  frozenPoints?: number;
  frozen_points?: number;
  expiringSoon?: number;
  expiring_soon?: number;
}

export interface VIPStats {
  totalSavings?: number;
  total_savings?: number;
  totalOrders?: number;
  total_orders?: number;
  totalSpent?: number;
  total_spent?: number;
  discountRate?: number;
  discount_rate?: number;
  avgOrderValue?: number;
  avg_order_value?: number;
  joinDays?: number;
  join_days?: number;
  upcomingRenewal?: string;
  upcoming_renewal?: string;
  monthlyStats?: any[];
  monthly_stats?: any[];
}

// Invite code types
export interface InviteCodeInfo {
  totalInvites: number;
  totalReward: number;
}

// Follow user type
export interface FollowUser {
  id: string | number;
  nickname: string;
  avatar?: string;
  bio?: string;
  isFollowing?: boolean;
}
