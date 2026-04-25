/**
 * Order Management Types
 */

import type { User } from './user'
import type { Party } from './party'

/**
 * Order type enum
 */
export type OrderType = 'ticket' | 'service' | 'package'

/**
 * Order status enum
 * 注意：这些值必须与后端数据库中的状态值匹配
 */
export enum OrderStatus {
  PENDING = 0,    // 待支付
  PAID = 1,       // 已支付
  CANCELLED = 2,  // 已取消
  REFUNDED = 3    // 已退款
}

/**
 * Payment method enum
 */
export type PaymentMethod = 'wechat' | 'wallet'

/**
 * Package type enum
 */
export type PackageType = 'monthly' | 'quarterly' | 'yearly'

/**
 * Order name enum
 * 1=普通票, 2=早鸟票, 3=男性票, 4=女性票
 * 5=男性早鸟票, 6=女性早鸟票
 * 7=中小型聚会服务费, 8=中型聚会服务费, 9=大型聚会服务费
 * 10=月付VIP套餐, 11=季付VIP套餐, 12=年付VIP套餐
 */
export type OrderName = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12

/**
 * Ticket interface
 */
export interface Ticket {
  id: number
  ticketNo: string
  orderId: number
  userId: number
  partyId: number
  ticketType: number
  status: 'valid' | 'used' | 'refunded'
  qrCode: string
  usedAt?: string
  createdAt: string
  updatedAt: string
}

/**
 * Refund interface
 */
export interface Refund {
  id: number
  orderId: number
  userId: number
  amount: number
  status: 'pending' | 'processed' | 'rejected'
  reason?: string
  processedAt?: string
  createdAt: string
  updatedAt: string
}

/**
 * Order interface
 */
export interface Order {
  id: number
  orderNo: string
  userId: number
  orderType: OrderType
  orderName: OrderName
  partyId?: number
  packageType?: PackageType
  ticketType?: number
  quantity: number
  unitPrice: number
  amount: number
  status: OrderStatus
  paymentMethod?: PaymentMethod
  registrationAt: string
  paidAt?: string
  cancelledAt?: string
  refundedAt?: string
  
  // 关联数据
  user?: User
  party?: Party
  tickets?: Ticket[]
  refund?: Refund
}

/**
 * Order list query parameters
 */
export interface OrderListParams {
  page: number
  pageSize: number
  keyword?: string
  status?: OrderStatus
  orderType?: OrderType
  paymentMethod?: PaymentMethod
  startDate?: string
  endDate?: string
  userId?: number
  partyId?: number
}

/**
 * Order list response
 */
export interface OrderListResponse {
  list: Order[]
  total: number
  page: number
  pageSize: number
}

/**
 * Order detail
 */
export interface OrderDetail extends Order {
  user: User
  party?: Party
  tickets: Ticket[]
  refund?: Refund
}

/**
 * Order statistics
 */
export interface OrderStatsData {
  total: number
  pending: number
  paid: number
  cancelled: number
  refunded: number
  totalAmount: number
  todayOrders: number
  todayAmount: number
  trend: {
    date: string
    orders: number
    amount: number
  }[]
}

/**
 * Refund audit request
 */
export interface RefundAuditRequest {
  status: 'processed' | 'rejected'
  reason?: string
  reviewer: string
}

/**
 * Export order request
 */
export interface ExportOrderRequest {
  status?: OrderStatus
  orderType?: OrderType
  startDate?: string
  endDate?: string
}
