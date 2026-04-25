<template>
  <div class="dashboard-container-enhanced">
    <!-- Page Header -->
    <div class="dashboard-header">
      <div class="header-title">
        <h1>仪表盘</h1>
        <p class="header-subtitle">欢迎回来，{{ userStore.userInfo?.nickname || userStore.userInfo?.username || '管理员' }}</p>
      </div>
      <div class="header-actions">
        <div v-if="lastUpdated" class="last-updated">
          <el-icon><Timer /></el-icon>
          <span>更新于 {{ formatTimeAgo(lastUpdated) }}</span>
        </div>
        <el-button
          :icon="Refresh"
          :loading="isLoading"
          @click="handleRefresh"
          type="primary"
          plain
        >
          刷新数据
        </el-button>
      </div>
    </div>
    
    <!-- Stats Cards Grid -->
    <div class="stats-grid">
      <StatCard
        title="用户总数"
        :value="stats?.userTotal || 0"
        :trend="userTrend"
        :icon="User"
        type="primary"
        :formatter="formatNumber"
        @click="navigateTo('/users')"
      />
      
      <StatCard
        title="聚会总数"
        :value="stats?.partyTotal || 0"
        :trend="partyTrend"
        :icon="Calendar"
        type="success"
        :formatter="formatNumber"
        @click="navigateTo('/parties')"
      />
      
      <StatCard
        title="订单总数"
        :value="stats?.orderTotal || 0"
        :trend="orderTrend"
        :icon="ShoppingCart"
        type="warning"
        :formatter="formatNumber"
        @click="navigateTo('/orders')"
      />
      
      <StatCard
        title="收入总额"
        :value="stats?.revenueTotal || 0"
        :trend="revenueTrend"
        :icon="Money"
        type="error"
        :formatter="formatCurrency"
        @click="navigateTo('/finance')"
      />
    </div>
    
    <!-- Charts Section -->
    <div class="charts-section">
      <div class="chart-row">
        <!-- User Growth Chart -->
        <el-card class="chart-card" shadow="never">
          <template #header>
            <div class="card-header">
              <div class="card-title">
                <el-icon class="title-icon"><TrendCharts /></el-icon>
                <span>用户增长趋势</span>
              </div>
              <el-radio-group v-model="userChartPeriod" size="small">
                <el-radio-button value="week">本周</el-radio-button>
                <el-radio-button value="month">本月</el-radio-button>
                <el-radio-button value="year">全年</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <BaseChart
            :option="userTrendOption"
            :loading="isLoading"
            height="320px"
          />
        </el-card>
        
        <!-- Order Trend Chart -->
        <el-card class="chart-card" shadow="never">
          <template #header>
            <div class="card-header">
              <div class="card-title">
                <el-icon class="title-icon"><ShoppingCart /></el-icon>
                <span>订单趋势</span>
              </div>
              <el-radio-group v-model="orderChartPeriod" size="small">
                <el-radio-button value="week">本周</el-radio-button>
                <el-radio-button value="month">本月</el-radio-button>
                <el-radio-button value="year">全年</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <BaseChart
            :option="orderTrendOption"
            :loading="isLoading"
            height="320px"
          />
        </el-card>
      </div>
      
      <!-- Revenue Chart -->
      <el-card class="chart-card chart-card-full" shadow="never">
        <template #header>
          <div class="card-header">
            <div class="card-title">
              <el-icon class="title-icon"><Money /></el-icon>
              <span>收入趋势</span>
            </div>
            <el-radio-group v-model="revenueChartPeriod" size="small">
              <el-radio-button value="week">本周</el-radio-button>
              <el-radio-button value="month">本月</el-radio-button>
              <el-radio-button value="year">全年</el-radio-button>
            </el-radio-group>
          </div>
        </template>
        <BaseChart
          :option="revenueTrendOption"
          :loading="isLoading"
          height="320px"
        />
      </el-card>
    </div>
    
    <!-- Quick Actions -->
    <el-card class="quick-actions-card" shadow="never">
      <template #header>
        <div class="card-header">
          <div class="card-title">
            <el-icon class="title-icon"><Operation /></el-icon>
            <span>快捷操作</span>
          </div>
        </div>
      </template>
      
      <div class="quick-actions">
        <el-button 
          type="primary" 
          :icon="User" 
          size="large"
          @click="navigateTo('/users')"
        >
          <template #icon>
            <div class="btn-icon primary">
              <el-icon><User /></el-icon>
            </div>
          </template>
          用户管理
        </el-button>
        
        <el-button 
          type="success" 
          :icon="Calendar" 
          size="large"
          @click="navigateTo('/parties')"
        >
          <template #icon>
            <div class="btn-icon success">
              <el-icon><Calendar /></el-icon>
            </div>
          </template>
          聚会审核
        </el-button>
        
        <el-button 
          type="warning" 
          :icon="ShoppingCart" 
          size="large"
          @click="navigateTo('/orders')"
        >
          <template #icon>
            <div class="btn-icon warning">
              <el-icon><ShoppingCart /></el-icon>
            </div>
          </template>
          订单管理
        </el-button>
        
        <el-button 
          type="danger" 
          :icon="Money" 
          size="large"
          @click="navigateTo('/finance')"
        >
          <template #icon>
            <div class="btn-icon danger">
              <el-icon><Money /></el-icon>
            </div>
          </template>
          财务管理
        </el-button>
        
        <el-button 
          :icon="Document" 
          size="large"
          @click="navigateTo('/content')"
        >
          <template #icon>
            <div class="btn-icon info">
              <el-icon><Document /></el-icon>
            </div>
          </template>
          内容管理
        </el-button>
        
        <el-button 
          :icon="Setting" 
          size="large"
          @click="navigateTo('/system')"
        >
          <template #icon>
            <div class="btn-icon default">
              <el-icon><Setting /></el-icon>
            </div>
          </template>
          系统设置
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref } from 'vue'
import { useRouter } from 'vue-router'
import { 
  Refresh, 
  User, 
  Calendar, 
  ShoppingCart, 
  Money,
  Timer,
  TrendCharts,
  Operation,
  Document,
  Setting
} from '@element-plus/icons-vue'
import type { TrendData } from '@/types/dashboard'
import { useDashboardStore } from '@/stores/modules/dashboard'
import { useUserStore } from '@/stores/modules/user'
import { useChart } from '@/composables/useChart'
import { formatNumber, formatCurrency } from '@/utils/dashboard'
import BaseChart from '@/components/charts/BaseChart.vue'
import StatCard from '@/components/dashboard/StatCard.vue'
import { showSuccess, showError } from '@/utils/message'

const router = useRouter()
const dashboardStore = useDashboardStore()
const userStore = useUserStore()
const { createLineChartOption, createAreaChartOption } = useChart()

// Chart period states
const userChartPeriod = ref('week')
const orderChartPeriod = ref('week')
const revenueChartPeriod = ref('week')

// Computed properties
const stats = computed(() => dashboardStore.stats)
const trends = computed(() => dashboardStore.trends)
const lastUpdated = computed(() => dashboardStore.lastUpdated)
const isLoading = computed(() => dashboardStore.isLoading)
const userTrend = computed(() => dashboardStore.userTrend)
const partyTrend = computed(() => dashboardStore.partyTrend)
const orderTrend = computed(() => dashboardStore.orderTrend)
const revenueTrend = computed(() => dashboardStore.revenueTrend)

// Chart options
const userTrendOption = computed(() => {
  if (!trends.value.length) return {}
  
  return createLineChartOption({
    labels: trends.value.map((t: TrendData) => t.date),
    values: trends.value.map((t: TrendData) => t.userCount),
    color: '#F04E0C',
    area: true
  })
})

const orderTrendOption = computed(() => {
  if (!trends.value.length) return {}
  
  return createLineChartOption({
    labels: trends.value.map((t: TrendData) => t.date),
    values: trends.value.map((t: TrendData) => t.orderCount),
    color: '#FFC107',
    area: true
  })
})

const revenueTrendOption = computed(() => {
  if (!trends.value.length) return {}
  
  return createAreaChartOption({
    labels: trends.value.map((t: TrendData) => t.date),
    values: trends.value.map((t: TrendData) => t.revenue / 100),
    color: '#F44336'
  })
})

// Methods
const handleRefresh = async () => {
  try {
    await dashboardStore.refreshDashboard()
    showSuccess('数据已刷新')
  } catch (error) {
    showError('刷新失败，请稍后重试')
  }
}

const navigateTo = (path: string) => {
  router.push(path)
}

const formatTimeAgo = (dateStr: string): string => {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 30) return `${days}天前`
  
  return date.toLocaleDateString('zh-CN')
}

// Lifecycle
onMounted(async () => {
  try {
    await dashboardStore.fetchDashboardData()
    // Start auto-refresh every 5 minutes
    dashboardStore.startAutoRefresh(300000)
  } catch (error) {
    showError('加载仪表盘数据失败')
  }
})

onBeforeUnmount(() => {
  dashboardStore.stopAutoRefresh()
})
</script>

<style scoped lang="scss">
.dashboard-container-enhanced {
  padding: var(--spacing-5);
  max-width: 1600px;
  margin: 0 auto;

  .dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: var(--spacing-6);
    flex-wrap: wrap;
    gap: var(--spacing-4);
    
    .header-title {
      h1 {
        margin: 0 0 var(--spacing-2);
        font-size: var(--font-size-2xl);
        font-weight: var(--font-weight-bold);
        color: var(--color-text-primary);
        line-height: var(--line-height-tight);
      }
      
      .header-subtitle {
        margin: 0;
        font-size: var(--font-size-sm);
        color: var(--color-text-secondary);
      }
    }
    
    .header-actions {
      display: flex;
      align-items: center;
      gap: var(--spacing-4);
      flex-wrap: wrap;
    }
    
    .last-updated {
      display: inline-flex;
      align-items: center;
      gap: var(--spacing-2);
      font-size: var(--font-size-sm);
      color: var(--color-text-tertiary);
      padding: var(--spacing-2) var(--spacing-3);
      background-color: var(--color-gray-100);
      border-radius: var(--radius-md);
      
      .el-icon {
        font-size: 14px;
      }
    }
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: var(--spacing-5);
    margin-bottom: var(--spacing-6);
  }

  .charts-section {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-5);
    margin-bottom: var(--spacing-6);
  }

  .chart-row {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-5);
  }

  .chart-card {
    border-radius: var(--radius-lg);
    border: 1px solid var(--color-border-light);
    transition: all var(--transition-normal);
    
    &:hover {
      box-shadow: var(--shadow-md);
    }
    
    :deep(.el-card__header) {
      padding: var(--spacing-4) var(--spacing-5);
      border-bottom: 1px solid var(--color-border-light);
    }
    
    :deep(.el-card__body) {
      padding: var(--spacing-4);
    }
  }

  .chart-card-full {
    grid-column: 1 / -1;
  }

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: var(--spacing-3);
  }

  .card-title {
    display: flex;
    align-items: center;
    gap: var(--spacing-2);
    font-size: var(--font-size-md);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
    
    .title-icon {
      font-size: 18px;
      color: var(--color-brand);
    }
  }

  .quick-actions-card {
    border-radius: var(--radius-lg);
    border: 1px solid var(--color-border-light);
    
    :deep(.el-card__header) {
      padding: var(--spacing-4) var(--spacing-5);
      border-bottom: 1px solid var(--color-border-light);
    }
    
    :deep(.el-card__body) {
      padding: var(--spacing-5);
    }
  }

  .quick-actions {
    display: flex;
    gap: var(--spacing-3);
    flex-wrap: wrap;
    
    .el-button {
      min-width: 140px;
      height: 48px;
      transition: all var(--transition-fast);
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-md);
      }
      
      .btn-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        border-radius: var(--radius-md);
        margin-right: var(--spacing-2);
        
        &.primary {
          background-color: var(--color-primary-50);
          color: var(--color-primary-500);
        }
        
        &.success {
          background-color: var(--color-success-50);
          color: var(--color-success-500);
        }
        
        &.warning {
          background-color: var(--color-warning-50);
          color: var(--color-warning-600);
        }
        
        &.danger {
          background-color: var(--color-error-50);
          color: var(--color-error-500);
        }
        
        &.info {
          background-color: var(--color-info-50);
          color: var(--color-info-500);
        }
        
        &.default {
          background-color: var(--color-gray-100);
          color: var(--color-gray-600);
        }
      }
    }
  }
}

/* Responsive Design */
@media (max-width: 1280px) {
  .dashboard-container-enhanced {
    .stats-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
}

@media (max-width: 768px) {
  .dashboard-container-enhanced {
    padding: var(--spacing-3);

    .dashboard-header {
      flex-direction: column;
      align-items: flex-start;
      
      .header-actions {
        width: 100%;
        justify-content: space-between;
      }
    }
    
    .stats-grid {
      grid-template-columns: 1fr;
    }
    
    .chart-row {
      grid-template-columns: 1fr;
    }
    
    .quick-actions {
      .el-button {
        flex: 1;
        min-width: auto;
      }
    }
  }
}

/* Dark mode adjustments */
.dark .dashboard-container-enhanced {
  .last-updated {
    background-color: var(--color-gray-800);
  }
  
  .quick-actions .el-button {
    .btn-icon {
      &.primary {
        background-color: rgba(240, 78, 12, 0.2);
      }
      
      &.success {
        background-color: rgba(76, 175, 80, 0.2);
      }
      
      &.warning {
        background-color: rgba(255, 193, 7, 0.2);
      }
      
      &.danger {
        background-color: rgba(244, 67, 54, 0.2);
      }
      
      &.info {
        background-color: rgba(33, 150, 243, 0.2);
      }
      
      &.default {
        background-color: rgba(255, 255, 255, 0.1);
      }
    }
  }
}
</style>