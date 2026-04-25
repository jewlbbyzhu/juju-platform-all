/**
 * Analytics Types
 * Data analysis and reporting types
 */

/**
 * Time range for analytics queries
 */
export type TimeRange = 'day' | 'week' | 'month' | 'year' | 'custom'

/**
 * Analytics dimension
 */
export type AnalyticsDimension = 
  | 'user' 
  | 'party' 
  | 'order' 
  | 'revenue' 
  | 'region'
  | 'category'

/**
 * Chart type
 */
export type ChartType = 'line' | 'bar' | 'pie' | 'area' | 'scatter'

/**
 * Export format
 */
export type ExportFormat = 'pdf' | 'excel' | 'csv'

/**
 * User analytics data
 */
export interface UserAnalytics {
  // Growth metrics
  newUsers: number
  totalUsers: number
  growthRate: number
  
  // Activity metrics
  activeUsers: {
    daily: number
    weekly: number
    monthly: number
  }
  
  // Retention metrics
  retention: {
    day1: number  // Next day retention rate
    day7: number  // 7-day retention rate
    day30: number // 30-day retention rate
  }
  
  // Behavior metrics
  avgSessionDuration: number // Average session duration in seconds
  avgSessionsPerUser: number
  
  // Trend data
  trends: {
    date: string
    newUsers: number
    activeUsers: number
    totalUsers: number
  }[]
  
  // Regional distribution
  regionDistribution: {
    region: string
    count: number
    percentage: number
  }[]
}

/**
 * Party analytics data
 */
export interface PartyAnalytics {
  // Creation metrics
  totalParties: number
  newParties: number
  growthRate: number
  
  // Participation metrics
  totalParticipants: number
  avgParticipantsPerParty: number
  participationRate: number // Percentage of users who joined parties
  
  // Category distribution
  categoryDistribution: {
    category: number // 0=霓虹, 1=潮酷, 2=高级, 3=未来
    categoryName: string
    count: number
    percentage: number
  }[]
  
  // Status distribution
  statusDistribution: {
    status: string
    count: number
    percentage: number
  }[]
  
  // Trend data
  trends: {
    date: string
    created: number
    completed: number
    participants: number
  }[]
  
  // Regional distribution
  regionDistribution: {
    region: string
    count: number
    percentage: number
  }[]
  
  // Popular parties
  topParties: {
    id: number
    title: string
    participants: number
    category: number
    revenue: number
  }[]
}

/**
 * Revenue analytics data
 */
export interface RevenueAnalytics {
  // Total revenue
  totalRevenue: number
  growthRate: number
  
  // Revenue by source
  revenueBySource: {
    ticket: number      // Ticket sales revenue
    service: number     // Service fee revenue
    vip: number        // VIP package revenue
    commission: number  // Transaction commission
  }
  
  // Revenue by source percentage
  revenueSourcePercentage: {
    source: string
    amount: number
    percentage: number
  }[]
  
  // Trend data
  trends: {
    date: string
    revenue: number
    orders: number
    avgOrderValue: number
  }[]
  
  // Regional revenue
  regionRevenue: {
    region: string
    revenue: number
    percentage: number
  }[]
  
  // VIP revenue breakdown
  vipRevenue: {
    monthly: number
    quarterly: number
    yearly: number
    total: number
  }
  
  // Commission statistics
  commissionStats: {
    totalCommission: number
    avgCommissionRate: number
    commissionByVipLevel: {
      normal: number
      monthly: number
      quarterly: number
      yearly: number
    }
  }
}

/**
 * Order analytics data
 */
export interface OrderAnalytics {
  // Order metrics
  totalOrders: number
  newOrders: number
  growthRate: number
  
  // Order status distribution
  statusDistribution: {
    status: string
    count: number
    percentage: number
  }[]
  
  // Payment method distribution
  paymentMethodDistribution: {
    method: string
    count: number
    percentage: number
  }[]
  
  // Trend data
  trends: {
    date: string
    orders: number
    revenue: number
    avgOrderValue: number
  }[]
  
  // Order type distribution
  typeDistribution: {
    type: string
    count: number
    percentage: number
  }[]
}

/**
 * Analytics query parameters
 */
export interface AnalyticsQueryParams {
  // Time range
  timeRange?: TimeRange
  startDate?: string // YYYY-MM-DD
  endDate?: string   // YYYY-MM-DD
  
  // Dimension
  dimension?: AnalyticsDimension
  
  // Filters
  region?: string
  category?: number
  vipLevel?: 'normal' | 'monthly' | 'quarterly' | 'yearly'
  
  // Comparison
  compareWithPrevious?: boolean // Compare with previous period
}

/**
 * Custom report configuration
 */
export interface CustomReportConfig {
  id?: number
  name: string
  description?: string
  
  // Report settings
  dimensions: AnalyticsDimension[]
  metrics: string[]
  filters: Record<string, any>
  
  // Time settings
  timeRange: TimeRange
  startDate?: string
  endDate?: string
  
  // Chart settings
  chartType: ChartType
  
  // Schedule settings
  scheduled?: boolean
  scheduleFrequency?: 'daily' | 'weekly' | 'monthly'
  scheduleTime?: string // HH:mm
  recipients?: string[] // Email addresses
  
  createdAt?: string
  updatedAt?: string
}

/**
 * Custom report list response
 */
export interface CustomReportListResponse {
  reports: CustomReportConfig[]
  total: number
}

/**
 * Report export request
 */
export interface ReportExportRequest {
  reportId?: number
  format: ExportFormat
  
  // If reportId is not provided, use these settings
  dimension?: AnalyticsDimension
  timeRange?: TimeRange
  startDate?: string
  endDate?: string
  filters?: Record<string, any>
}

/**
 * Dashboard widget configuration
 */
export interface DashboardWidget {
  id: string
  type: 'chart' | 'metric' | 'table' | 'map'
  title: string
  
  // Data source
  dimension: AnalyticsDimension
  metric: string
  
  // Display settings
  chartType?: ChartType
  size: 'small' | 'medium' | 'large'
  position: {
    x: number
    y: number
    w: number
    h: number
  }
  
  // Refresh settings
  autoRefresh?: boolean
  refreshInterval?: number // seconds
}

/**
 * Custom dashboard configuration
 */
export interface CustomDashboard {
  id?: number
  name: string
  description?: string
  widgets: DashboardWidget[]
  isDefault?: boolean
  createdAt?: string
  updatedAt?: string
}

/**
 * Analytics overview data
 */
export interface AnalyticsOverview {
  user: {
    total: number
    new: number
    active: number
    growthRate: number
  }
  party: {
    total: number
    new: number
    ongoing: number
    growthRate: number
  }
  order: {
    total: number
    new: number
    revenue: number
    growthRate: number
  }
  revenue: {
    total: number
    today: number
    growthRate: number
  }
}

/**
 * Drill-down data request
 */
export interface DrillDownRequest {
  dimension: AnalyticsDimension
  metric: string
  filters: Record<string, any>
  groupBy?: string
  timeRange?: TimeRange
  startDate?: string
  endDate?: string
}

/**
 * Drill-down data response
 */
export interface DrillDownResponse {
  dimension: AnalyticsDimension
  metric: string
  data: {
    label: string
    value: number
    percentage?: number
    children?: DrillDownResponse['data']
  }[]
  total: number
}

/**
 * Real-time analytics data
 */
export interface RealTimeAnalytics {
  timestamp: string
  activeUsers: number
  ongoingParties: number
  recentOrders: number
  recentRevenue: number
  
  // Recent activities
  recentActivities: {
    type: 'user_register' | 'party_create' | 'order_paid' | 'party_complete'
    timestamp: string
    description: string
  }[]
}
