/**
 * Financial Management Types
 */

/**
 * Withdrawal status enum
 */
export type WithdrawalStatus = 'pending' | 'processed' | 'rejected'

/**
 * Transaction type enum
 */
export type TransactionType = 'income' | 'expense'

/**
 * Revenue source enum
 */
export type RevenueSource = 'ticket' | 'service' | 'vip' | 'commission'

/**
 * Package type enum
 */
export type PackageType = 'monthly' | 'quarterly' | 'yearly'

/**
 * Withdrawal interface - 匹配后端实际返回结构
 */
export interface Withdrawal {
  id: number
  user_id: number
  // 后端返回的金额是元，需要转换为分
  amount: number
  bankCardId?: number
  status: WithdrawalStatus
  reason?: string
  processedAt?: string
  created_at: string
  updated_at: string

  // 关联数据 - 后端返回的用户信息
  user?: {
    id: number
    nickname: string
    avatar: string
    phone?: string
  }
  // 注意：后端目前不返回 bankCard 信息
  bankCard?: {
    id: number
    bankName: string
    cardNumber: string
    holderName: string
  }
}

/**
 * VIP Application interface
 */
export interface VipApplication {
  id: number
  userId: number
  orderId?: number
  realName: string
  idCard: string
  phone: string
  packageType: PackageType
  duration: number
  amount: number
  status: 'pending' | 'processed' | 'rejected'
  createdAt: string
  updatedAt: string
  expiredAt?: string
  
  // 关联数据
  user?: {
    id: number
    nickname: string
    avatar: string
  }
}

/**
 * VIP Application list query parameters
 */
export interface VipApplicationListParams {
  page: number
  pageSize: number
  status?: 'pending' | 'processed' | 'rejected'
  userId?: number
  startDate?: string
  endDate?: string
}

/**
 * VIP Application list response
 */
export interface VipApplicationListResponse {
  list: VipApplication[]
  total: number
  page: number
  pageSize: number
}

/**
 * VIP Audit request
 */
export interface VipAuditRequest {
  status: 'processed' | 'rejected'
  reason?: string
  reviewer: string
}

/**
 * Party Settlement interface
 */
export interface PartySettlement {
  id: number
  partyId: number
  organizerId?: number
  totalAmount: number
  serviceFee: number
  organizerIncome: number
  status: 'pending' | 'processed' | 'rejected'
  createdAt: string
  settledAt?: string
  
  // 关联数据
  organizer?: {
    id: number
    nickname: string
    avatar: string
  }
}

/**
 * Party Settlement list query parameters
 */
export interface PartySettlementListParams {
  page: number
  pageSize: number
  status?: 'pending' | 'processed' | 'rejected'
  organizerId?: number
  startDate?: string
  endDate?: string
}

/**
 * Party Settlement list response
 */
export interface PartySettlementListResponse {
  list: PartySettlement[]
  total: number
  page: number
  pageSize: number
}

/**
 * Settlement audit request
 */
export interface SettlementAuditRequest {
  status: 'processed' | 'rejected'
  reason?: string
  reviewer: string
}

/**
 * Wallet interface
 */
export interface Wallet {
  id: number
  userId: number
  balance: number
  frozenBalance: number
  hasBankCard: boolean
  cardCount: number
  totalIncome: number
  totalExpense: number
  
  // 关联数据
  user?: {
    id: number
    nickname: string
    avatar: string
  }
}

/**
 * Wallet statistics
 */
export interface WalletStats {
  totalBalance: number
  frozenBalance: number
  totalIncome: number
  totalExpense: number
  userCount: number
  vipUserCount: number
}

/**
 * Transaction interface
 */
export interface Transaction {
  id: number
  userId: number
  type: TransactionType
  amount: number
  balance: number
  description: string
  relatedId?: number
  relatedType?: string
  createdAt: string
  
  // 关联数据
  user?: {
    id: number
    nickname: string
    avatar: string
  }
}

/**
 * Revenue statistics
 */
export interface RevenueStats {
  total: number
  ticket: number
  service: number
  vip: number
  commission: number
}

/**
 * Financial statistics - 匹配后端实际返回结构
 * 注意：revenue 和 trends 字段后端目前返回空值，需要后端实现
 */
export interface FinancialStats {
  revenue: RevenueStats
  trends: {
    date: string
    revenue: number
    orders: number
    users: number
  }[]
  withdrawal: {
    pending: number
    approved: number
    rejected: number
    processed: number
  }
}

/**
 * Withdrawal list query parameters
 */
export interface WithdrawalListParams {
  page: number
  pageSize: number
  keyword?: string
  status?: WithdrawalStatus
  startDate?: string
  endDate?: string
  userId?: number
}

/**
 * Withdrawal list response
 */
export interface WithdrawalListResponse {
  list: Withdrawal[]
  total: number
  page: number
  pageSize: number
}

/**
 * Transaction list query parameters
 */
export interface TransactionListParams {
  page: number
  pageSize: number
  keyword?: string
  type?: TransactionType
  startDate?: string
  endDate?: string
  userId?: number
}

/**
 * Transaction list response
 */
export interface TransactionListResponse {
  list: Transaction[]
  total: number
  page: number
  pageSize: number
}

/**
 * Withdrawal audit request
 */
export interface WithdrawalAuditRequest {
  status: 'processed' | 'rejected'
  reason?: string
  reviewer: string
}

/**
 * Financial report export request
 */
export interface FinancialReportExportRequest {
  startDate: string
  endDate: string
  includeRevenue?: boolean
  includeWithdrawals?: boolean
  includeTransactions?: boolean
}

/**
 * Financial statistics query parameters
 */
export interface FinancialStatsParams {
  startDate?: string
  endDate?: string
}
