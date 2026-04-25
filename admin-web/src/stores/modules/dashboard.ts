import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { DashboardData, DashboardStats, TrendData } from '@/types/dashboard'
import { dashboardAPI } from '@/api/modules/dashboard'
import { calculateGrowthRate, getTrendType } from '@/utils/dashboard'

export const useDashboardStore = defineStore('dashboard', () => {
  // State
  const stats = ref<DashboardStats | null>(null)
  const trends = ref<TrendData[]>([])
  const lastUpdated = ref<string>('')
  const isLoading = ref<boolean>(false)
  const autoRefreshInterval = ref<number | null>(null)
  
  // Getters
  const hasData = computed(() => !!stats.value)
  
  const userTrend = computed(() => {
    if (!stats.value) return null
    return {
      value: stats.value.userGrowth,
      type: getTrendType(stats.value.userGrowth)
    }
  })
  
  const partyTrend = computed(() => {
    if (!stats.value) return null
    return {
      value: stats.value.partyGrowth,
      type: getTrendType(stats.value.partyGrowth)
    }
  })
  
  const orderTrend = computed(() => {
    if (!stats.value) return null
    return {
      value: stats.value.orderGrowth,
      type: getTrendType(stats.value.orderGrowth)
    }
  })
  
  const revenueTrend = computed(() => {
    if (!stats.value) return null
    return {
      value: stats.value.revenueGrowth,
      type: getTrendType(stats.value.revenueGrowth)
    }
  })
  
  // Actions
  const fetchDashboardData = async (): Promise<void> => {
    try {
      isLoading.value = true
      const data = await dashboardAPI.getDashboardData()
      
      stats.value = data.stats
      trends.value = data.trends
      lastUpdated.value = data.lastUpdated
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }
  
  const fetchDashboardDataByRange = async (
    startDate: string,
    endDate: string
  ): Promise<void> => {
    try {
      isLoading.value = true
      const data = await dashboardAPI.getDashboardDataByRange(startDate, endDate)
      
      stats.value = data.stats
      trends.value = data.trends
      lastUpdated.value = data.lastUpdated
    } catch (error) {
      console.error('Failed to fetch dashboard data by range:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }
  
  const refreshDashboard = async (): Promise<void> => {
    try {
      isLoading.value = true
      const data = await dashboardAPI.refreshDashboard()
      
      stats.value = data.stats
      trends.value = data.trends
      lastUpdated.value = data.lastUpdated
    } catch (error) {
      console.error('Failed to refresh dashboard:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }
  
  const startAutoRefresh = (intervalMs: number = 300000): void => {
    // Default: 5 minutes
    stopAutoRefresh()
    
    autoRefreshInterval.value = window.setInterval(() => {
      fetchDashboardData()
    }, intervalMs)
  }
  
  const stopAutoRefresh = (): void => {
    if (autoRefreshInterval.value) {
      clearInterval(autoRefreshInterval.value)
      autoRefreshInterval.value = null
    }
  }
  
  return {
    // State
    stats,
    trends,
    lastUpdated,
    isLoading,
    
    // Getters
    hasData,
    userTrend,
    partyTrend,
    orderTrend,
    revenueTrend,
    
    // Actions
    fetchDashboardData,
    fetchDashboardDataByRange,
    refreshDashboard,
    startAutoRefresh,
    stopAutoRefresh
  }
})
