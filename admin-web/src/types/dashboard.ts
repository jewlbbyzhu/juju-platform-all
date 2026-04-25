// Dashboard data types

export interface DashboardStats {
  userTotal: number
  partyTotal: number
  orderTotal: number
  revenueTotal: number
  userGrowth: number
  partyGrowth: number
  orderGrowth: number
  revenueGrowth: number
}

export interface TrendData {
  date: string
  userCount: number
  orderCount: number
  revenue: number
}

export interface DashboardData {
  stats: DashboardStats
  trends: TrendData[]
  lastUpdated: string
}

export interface DashboardResponse {
  success: boolean
  data: DashboardData
  message?: string
}
