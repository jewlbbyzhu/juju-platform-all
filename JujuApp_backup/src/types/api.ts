/**
 * API 类型定义
 * 与后端 ResponseHelper 格式统一
 */

// 标准API响应
export interface ApiResponse<T = unknown> {
  code: number;        // 0 表示成功，-1 表示错误
  success: boolean;    // true/false
  message: string;     // 提示信息
  data: T;            // 响应数据
  errorCode?: string;  // 错误代码（仅错误时）
  errors?: unknown;    // 详细错误（仅错误时）
}

// 分页数据
export interface PageData<T> {
  list: T[];          // 数据列表
  total: number;      // 总数
  page: number;       // 当前页
  pageSize: number;   // 每页大小
}

// 分页API响应
export type PageResponse<T> = ApiResponse<PageData<T>>;

// 登录响应
export interface LoginData {
  token: string;
  refreshToken: string;
  userInfo: {
    id: number;
    nickname: string;
    avatar: string;
    phone?: string;
    gender?: number;
    birthday?: string;
    bio?: string;
  };
}

// 聚会（Party）数据
export interface Party {
  id: number;
  title: string;
  description: string;
  coverImage?: string;
  images?: string[];
  startTime: string;
  endTime: string;
  location: string;
  address?: string;
  maxParticipants: number;
  currentParticipants: number;
  status: number;
  category?: string;
  price?: number;
  organizer?: {
    id: number;
    nickname: string;
    avatar: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

// 订单数据
export interface Order {
  id: number;
  orderNo: string;
  partyId: number;
  partyTitle: string;
  ticketId?: number;
  ticketName?: string;
  quantity: number;
  totalAmount: number;
  status: 'pending' | 'paid' | 'completed' | 'cancelled' | 'refunded';
  createdAt: string;
  paidAt?: string;
  userId?: number;
}

// 票券数据
export interface Ticket {
  id: number;
  partyId: number;
  name: string;
  price: number;
  quantity: number;
  soldCount: number;
  status: 'valid' | 'used' | 'expired' | 'refunded';
  validStart?: string;
  validEnd?: string;
  createdAt?: string;
}

// 动态/帖子数据
export interface Post {
  id: number;
  userId: number;
  title?: string;
  userName?: string;
  userAvatar?: string;
  content: string;
  images?: string[];
  partyId?: number;
  party?: Party;
  location?: string;
  visibility?: 'public' | 'friends' | 'private';
  likeCount?: number;
  commentCount?: number;
  likes?: number;
  comments?: number;
  isLiked?: boolean;
  createdAt?: string;
  created_at?: string;
  createdAtString?: string;
  updatedAt?: string;
  tags?: string[];
  author?: {
    id: number;
    name?: string;
    nickname?: string;
    avatar?: string;
  };
}

// 聊天会话
export interface Conversation {
  id: string;
  type: 'single' | 'group';
  name: string;
  avatar?: string;
  unread_count: number;
  lastMessage?: string;
  lastMessageTime?: string;
  userId?: number;
  groupId?: string;
}

// 聊天消息
export interface Message {
  id: string;
  conversationId: string;
  userId: number;
  userName?: string;
  userAvatar?: string;
  content: string;
  contentType?: 'text' | 'image' | 'voice' | 'file';
  isSelf: boolean;
  createdAt: string;
  status?: 'sending' | 'sent' | 'delivered' | 'read';
}

// 钱包数据
export interface Wallet {
  balance: number;
  frozenBalance: number;
  availableBalance: number;
}

// 交易记录
export interface Transaction {
  id: string;
  type: 'recharge' | 'withdraw' | 'payment' | 'refund' | 'income' | 'transfer';
  amount: number;
  status: 0 | 1 | 2 | 3;
  description: string;
  createdAt: string;
  orderId?: string;
}

// VIP数据
export interface VIPInfo {
  isVip: boolean;
  is_vip: boolean;
  level: number;
  vip_level: number;
  expireAt: string;
  expire_at: string;
  benefits: string[];
}

// 用户信息
export interface UserProfile {
  id: number;
  nickname: string;
  avatar: string;
  phone?: string;
  gender?: 0 | 1 | 2;
  birthday?: string;
  bio?: string;
  tags?: string[];
  preferences?: {
    partyType?: string[];
    partyTime?: string[];
    partySize?: string[];
    budget?: string[];
  };
  statistics?: {
    totalParties: number;
    totalParticipants: number;
    totalComments: number;
    totalLikes: number;
  };
}

// 收藏数据
export interface Favorite {
  id: number;
  type: 'party' | 'post' | 'user';
  targetId: number;
  title?: string;
  image?: string;
  createdAt: string;
}

// 标签数据
export interface Tag {
  id: number;
  name: string;
  icon?: string;
  count?: number;
  isHot?: boolean;
}

// 通知数据
export interface Notification {
  id: number;
  type: string;
  title: string;
  content: string;
  isRead: boolean;
  data?: unknown;
  createdAt: string;
}

// 统计面板数据
export interface DashboardStats {
  weeklyCount: number;
  monthlyCount: number;
  totalCount: number;
}
