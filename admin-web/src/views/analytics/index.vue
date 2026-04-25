<template>
  <div class="analytics-page">
    <el-card class="page-header">
      <div class="header-content">
        <h2>数据分析</h2>
        <div class="header-actions">
          <el-button :icon="Refresh" @click="handleRefresh">刷新</el-button>
          <el-button :icon="Download" @click="handleExport">导出报表</el-button>
          <el-button :icon="Setting" @click="showCustomDashboard = true">
            自定义仪表盘
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- Time Range Selector -->
    <el-card class="time-range-card">
      <div class="time-range-selector">
        <el-radio-group v-model="timeRange" @change="handleTimeRangeChange">
          <el-radio-button value="day">今日</el-radio-button>
          <el-radio-button value="week">本周</el-radio-button>
          <el-radio-button value="month">本月</el-radio-button>
          <el-radio-button value="year">本年</el-radio-button>
          <el-radio-button value="custom">自定义</el-radio-button>
        </el-radio-group>

        <el-date-picker
          v-if="timeRange === 'custom'"
          v-model="customDateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="YYYY-MM-DD"
          @change="handleCustomDateChange"
        />
      </div>
    </el-card>

    <!-- Analytics Tabs -->
    <el-card class="analytics-tabs-card">
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <!-- User Analytics -->
        <el-tab-pane label="用户分析" name="user">
          <div class="analytics-content">
            <el-row :gutter="16">
              <el-col :span="24">
                <el-card>
                  <MultiDimensionChart
                    :dimensions="userDimensions"
                    :metrics="userMetrics"
                    :data="userAnalyticsData"
                    :loading="loading"
                    :drill-down-enabled="true"
                    @dimension-change="handleDimensionChange"
                    @drill-down="handleDrillDown"
                  />
                </el-card>
              </el-col>
            </el-row>

            <el-row :gutter="16" style="margin-top: 16px">
              <el-col :span="12">
                <el-card>
                  <template #header>
                    <span>用户增长趋势</span>
                  </template>
                  <AnalyticsChart
                    title="用户增长"
                    :data="userGrowthData"
                    chart-type="line"
                    :loading="loading"
                    x-axis-key="date"
                    y-axis-key="newUsers"
                    series-name="新增用户"
                  />
                </el-card>
              </el-col>
              <el-col :span="12">
                <el-card>
                  <template #header>
                    <span>用户地域分布</span>
                  </template>
                  <AnalyticsChart
                    title="地域分布"
                    :data="userRegionData"
                    chart-type="pie"
                    :loading="loading"
                    x-axis-key="region"
                    y-axis-key="count"
                    series-name="用户数"
                  />
                </el-card>
              </el-col>
            </el-row>
          </div>
        </el-tab-pane>

        <!-- Party Analytics -->
        <el-tab-pane label="聚会分析" name="party">
          <div class="analytics-content">
            <el-row :gutter="16">
              <el-col :span="24">
                <el-card>
                  <MultiDimensionChart
                    :dimensions="partyDimensions"
                    :metrics="partyMetrics"
                    :data="partyAnalyticsData"
                    :loading="loading"
                    :drill-down-enabled="true"
                    @dimension-change="handleDimensionChange"
                    @drill-down="handleDrillDown"
                  />
                </el-card>
              </el-col>
            </el-row>

            <el-row :gutter="16" style="margin-top: 16px">
              <el-col :span="12">
                <el-card>
                  <template #header>
                    <span>聚会分类分布</span>
                  </template>
                  <AnalyticsChart
                    title="分类分布"
                    :data="partyCategoryData"
                    chart-type="bar"
                    :loading="loading"
                    x-axis-key="categoryName"
                    y-axis-key="count"
                    series-name="聚会数"
                  />
                </el-card>
              </el-col>
              <el-col :span="12">
                <el-card>
                  <template #header>
                    <span>热门聚会</span>
                  </template>
                  <el-table :data="topParties" style="width: 100%">
                    <el-table-column prop="title" label="聚会名称" />
                    <el-table-column prop="participants" label="参与人数" width="100" />
                    <el-table-column prop="revenue" label="收入" width="120">
                      <template #default="{ row }">
                        ¥{{ (row.revenue / 100).toFixed(2) }}
                      </template>
                    </el-table-column>
                  </el-table>
                </el-card>
              </el-col>
            </el-row>
          </div>
        </el-tab-pane>

        <!-- Revenue Analytics -->
        <el-tab-pane label="收入分析" name="revenue">
          <div class="analytics-content">
            <el-row :gutter="16">
              <el-col :span="24">
                <el-card>
                  <MultiDimensionChart
                    :dimensions="revenueDimensions"
                    :metrics="revenueMetrics"
                    :data="revenueAnalyticsData"
                    :loading="loading"
                    :drill-down-enabled="true"
                    @dimension-change="handleDimensionChange"
                    @drill-down="handleDrillDown"
                  />
                </el-card>
              </el-col>
            </el-row>

            <el-row :gutter="16" style="margin-top: 16px">
              <el-col :span="12">
                <el-card>
                  <template #header>
                    <span>收入来源分布</span>
                  </template>
                  <AnalyticsChart
                    title="收入来源"
                    :data="revenueSourceData"
                    chart-type="pie"
                    :loading="loading"
                    x-axis-key="source"
                    y-axis-key="amount"
                    series-name="收入"
                  />
                </el-card>
              </el-col>
              <el-col :span="12">
                <el-card>
                  <template #header>
                    <span>收入趋势</span>
                  </template>
                  <AnalyticsChart
                    title="收入趋势"
                    :data="revenueTrendData"
                    chart-type="area"
                    :loading="loading"
                    x-axis-key="date"
                    y-axis-key="revenue"
                    series-name="收入"
                  />
                </el-card>
              </el-col>
            </el-row>
          </div>
        </el-tab-pane>

        <!-- Order Analytics -->
        <el-tab-pane label="订单分析" name="order">
          <div class="analytics-content">
            <el-row :gutter="16">
              <el-col :span="24">
                <el-card>
                  <MultiDimensionChart
                    :dimensions="orderDimensions"
                    :metrics="orderMetrics"
                    :data="orderAnalyticsData"
                    :loading="loading"
                    :drill-down-enabled="true"
                    @dimension-change="handleDimensionChange"
                    @drill-down="handleDrillDown"
                  />
                </el-card>
              </el-col>
            </el-row>

            <el-row :gutter="16" style="margin-top: 16px">
              <el-col :span="12">
                <el-card>
                  <template #header>
                    <span>订单状态分布</span>
                  </template>
                  <AnalyticsChart
                    title="状态分布"
                    :data="orderStatusData"
                    chart-type="pie"
                    :loading="loading"
                    x-axis-key="status"
                    y-axis-key="count"
                    series-name="订单数"
                  />
                </el-card>
              </el-col>
              <el-col :span="12">
                <el-card>
                  <template #header>
                    <span>支付方式分布</span>
                  </template>
                  <AnalyticsChart
                    title="支付方式"
                    :data="paymentMethodData"
                    chart-type="bar"
                    :loading="loading"
                    x-axis-key="method"
                    y-axis-key="count"
                    series-name="订单数"
                  />
                </el-card>
              </el-col>
            </el-row>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- Custom Dashboard Dialog -->
    <el-dialog
      v-model="showCustomDashboard"
      title="自定义仪表盘"
      width="80%"
      :close-on-click-modal="false"
    >
      <CustomDashboardEditor
        v-if="showCustomDashboard"
        @save="handleSaveDashboard"
        @cancel="showCustomDashboard = false"
      />
    </el-dialog>

    <!-- Export Dialog -->
    <el-dialog
      v-model="showExportDialog"
      title="导出报表"
      width="500px"
    >
      <el-form :model="exportForm" label-width="100px">
        <el-form-item label="导出格式">
          <el-radio-group v-model="exportForm.format">
            <el-radio value="pdf">PDF</el-radio>
            <el-radio value="excel">Excel</el-radio>
            <el-radio value="csv">CSV</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="包含内容">
          <el-checkbox-group v-model="exportForm.includes">
            <el-checkbox value="user">用户分析</el-checkbox>
            <el-checkbox value="party">聚会分析</el-checkbox>
            <el-checkbox value="revenue">收入分析</el-checkbox>
            <el-checkbox value="order">订单分析</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showExportDialog = false">取消</el-button>
        <el-button type="primary" :loading="exporting" @click="handleConfirmExport">
          确认导出
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import {
  ElCard,
  ElButton,
  ElRadioGroup,
  ElRadioButton,
  ElDatePicker,
  ElTabs,
  ElTabPane,
  ElRow,
  ElCol,
  ElTable,
  ElTableColumn,
  ElDialog,
  ElForm,
  ElFormItem,
  ElRadio,
  ElCheckboxGroup,
  ElCheckbox,
  ElMessage
} from 'element-plus'
import { Refresh, Download, Setting } from '@element-plus/icons-vue'
import AnalyticsChart from '@/components/analytics/AnalyticsChart.vue'
import MultiDimensionChart from '@/components/analytics/MultiDimensionChart.vue'
import CustomDashboardEditor from '@/components/analytics/CustomDashboardEditor.vue'
import { AnalyticsAPI } from '@/api/modules/analytics'
import type { TimeRange, AnalyticsDimension, ExportFormat } from '@/types/analytics'

// State
const loading = ref(false)
const activeTab = ref('user')
const timeRange = ref<TimeRange>('month')
const customDateRange = ref<[string, string]>()
const showCustomDashboard = ref(false)
const showExportDialog = ref(false)
const exporting = ref(false)

// Export form
const exportForm = reactive({
  format: 'excel' as ExportFormat,
  includes: ['user', 'party', 'revenue', 'order']
})

// Dimensions and metrics
const userDimensions = [
  { label: '用户', value: 'user' as AnalyticsDimension },
  { label: '地区', value: 'region' as AnalyticsDimension }
]

const userMetrics = [
  { label: '新增用户', value: 'newUsers' },
  { label: '活跃用户', value: 'activeUsers' },
  { label: '总用户数', value: 'totalUsers' }
]

const partyDimensions = [
  { label: '聚会', value: 'party' as AnalyticsDimension },
  { label: '分类', value: 'category' as AnalyticsDimension },
  { label: '地区', value: 'region' as AnalyticsDimension }
]

const partyMetrics = [
  { label: '创建数量', value: 'created' },
  { label: '完成数量', value: 'completed' },
  { label: '参与人数', value: 'participants' }
]

const revenueDimensions = [
  { label: '收入', value: 'revenue' as AnalyticsDimension },
  { label: '地区', value: 'region' as AnalyticsDimension }
]

const revenueMetrics = [
  { label: '总收入', value: 'revenue' },
  { label: '订单数', value: 'orders' },
  { label: '平均订单价值', value: 'avgOrderValue' }
]

const orderDimensions = [
  { label: '订单', value: 'order' as AnalyticsDimension }
]

const orderMetrics = [
  { label: '订单数', value: 'orders' },
  { label: '收入', value: 'revenue' },
  { label: '平均订单价值', value: 'avgOrderValue' }
]

// Analytics data
const userAnalyticsData = ref<Record<string, any[]>>({})
const userGrowthData = ref<any[]>([])
const userRegionData = ref<any[]>([])

const partyAnalyticsData = ref<Record<string, any[]>>({})
const partyCategoryData = ref<any[]>([])
const topParties = ref<any[]>([])

const revenueAnalyticsData = ref<Record<string, any[]>>({})
const revenueSourceData = ref<any[]>([])
const revenueTrendData = ref<any[]>([])

const orderAnalyticsData = ref<Record<string, any[]>>({})
const orderStatusData = ref<any[]>([])
const paymentMethodData = ref<any[]>([])

// Computed query params
const queryParams = computed(() => {
  const params: any = {
    timeRange: timeRange.value
  }
  
  if (timeRange.value === 'custom' && customDateRange.value) {
    params.startDate = customDateRange.value[0]
    params.endDate = customDateRange.value[1]
  }
  
  return params
})

// Load analytics data
const loadAnalyticsData = async () => {
  loading.value = true
  
  try {
    switch (activeTab.value) {
      case 'user':
        await loadUserAnalytics()
        break
      case 'party':
        await loadPartyAnalytics()
        break
      case 'revenue':
        await loadRevenueAnalytics()
        break
      case 'order':
        await loadOrderAnalytics()
        break
    }
  } catch (error) {
    console.error('Failed to load analytics data:', error)
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

// Load user analytics
const loadUserAnalytics = async () => {
  const data = await AnalyticsAPI.getUserAnalytics(queryParams.value)
  
  userAnalyticsData.value = {
    user_newUsers: data.trends,
    user_activeUsers: data.trends.map(t => ({ date: t.date, value: t.activeUsers })),
    user_totalUsers: data.trends.map(t => ({ date: t.date, value: t.totalUsers })),
    region_newUsers: data.regionDistribution.map(r => ({ region: r.region, value: r.count }))
  }
  
  userGrowthData.value = data.trends
  userRegionData.value = data.regionDistribution
}

// Load party analytics
const loadPartyAnalytics = async () => {
  const data = await AnalyticsAPI.getPartyAnalytics(queryParams.value)
  
  partyAnalyticsData.value = {
    party_created: data.trends.map(t => ({ date: t.date, value: t.created })),
    party_completed: data.trends.map(t => ({ date: t.date, value: t.completed })),
    party_participants: data.trends.map(t => ({ date: t.date, value: t.participants })),
    category_created: data.categoryDistribution.map(c => ({ 
      category: c.categoryName, 
      value: c.count 
    }))
  }
  
  partyCategoryData.value = data.categoryDistribution
  topParties.value = data.topParties
}

// Load revenue analytics
const loadRevenueAnalytics = async () => {
  const data = await AnalyticsAPI.getRevenueAnalytics(queryParams.value)
  
  revenueAnalyticsData.value = {
    revenue_revenue: data.trends,
    revenue_orders: data.trends.map(t => ({ date: t.date, value: t.orders })),
    revenue_avgOrderValue: data.trends.map(t => ({ date: t.date, value: t.avgOrderValue }))
  }
  
  revenueSourceData.value = data.revenueSourcePercentage
  revenueTrendData.value = data.trends
}

// Load order analytics
const loadOrderAnalytics = async () => {
  const data = await AnalyticsAPI.getOrderAnalytics(queryParams.value)
  
  orderAnalyticsData.value = {
    order_orders: data.trends,
    order_revenue: data.trends.map(t => ({ date: t.date, value: t.revenue })),
    order_avgOrderValue: data.trends.map(t => ({ date: t.date, value: t.avgOrderValue }))
  }
  
  orderStatusData.value = data.statusDistribution
  paymentMethodData.value = data.paymentMethodDistribution
}

// Handle time range change
const handleTimeRangeChange = () => {
  if (timeRange.value !== 'custom') {
    customDateRange.value = undefined
    loadAnalyticsData()
  }
}

// Handle custom date change
const handleCustomDateChange = () => {
  if (customDateRange.value) {
    loadAnalyticsData()
  }
}

// Handle tab change
const handleTabChange = () => {
  loadAnalyticsData()
}

// Handle dimension change
const handleDimensionChange = (dimension: AnalyticsDimension) => {
  console.log('Dimension changed:', dimension)
}

// Handle drill down
const handleDrillDown = (data: any) => {
  console.log('Drill down:', data)
  ElMessage.info('钻取功能开发中')
}

// Handle refresh
const handleRefresh = () => {
  loadAnalyticsData()
}

// Handle export
const handleExport = () => {
  showExportDialog.value = true
}

// Handle confirm export
const handleConfirmExport = async () => {
  exporting.value = true
  
  try {
    const blob = await AnalyticsAPI.exportReport({
      format: exportForm.format,
      dimension: activeTab.value as any,
      ...queryParams.value
    })
    
    // Create download link
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `analytics_report_${Date.now()}.${exportForm.format}`
    link.click()
    setTimeout(() => window.URL.revokeObjectURL(url), 500)
    
    ElMessage.success('导出成功')
    showExportDialog.value = false
  } catch (error) {
    console.error('Export failed:', error)
    ElMessage.error('导出失败')
  } finally {
    exporting.value = false
  }
}

// Handle save dashboard
const handleSaveDashboard = () => {
  ElMessage.success('仪表盘保存成功')
  showCustomDashboard.value = false
}

// Lifecycle
onMounted(() => {
  loadAnalyticsData()
})
</script>

<style scoped lang="scss">
.analytics-page {
  padding: 20px;
  
  .page-header {
    margin-bottom: 20px;
    
    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      h2 {
        margin: 0;
        font-size: 24px;
        font-weight: 600;
      }
      
      .header-actions {
        display: flex;
        gap: 12px;
      }
    }
  }
  
  .time-range-card {
    margin-bottom: 20px;
    
    .time-range-selector {
      display: flex;
      gap: 16px;
      align-items: center;
    }
  }
  
  .analytics-tabs-card {
    .analytics-content {
      padding: 16px 0;
    }
  }
}
</style>
