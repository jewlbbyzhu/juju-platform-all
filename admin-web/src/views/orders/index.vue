<template>
  <div class="order-management">
    <el-card>
      <template #header>
        <div class="card-header">
          <span class="title">订单管理</span>
          <div class="header-stats">
            <el-statistic
              title="今日订单"
              :value="Number(stats.todayOrders) || 0"
              suffix="单"
            />
            <el-statistic
              title="今日金额"
              :value="Number(stats.todayAmount / 100) || 0"
              :precision="2"
              prefix="¥"
            />
          </div>
        </div>
      </template>

      <!-- Search and Filter -->
      <div class="search-section">
        <el-form :inline="true" :model="searchForm">
          <el-form-item label="关键词">
            <el-input
              v-model="searchForm.keyword"
              placeholder="搜索订单号/用户信息"
              clearable
              @clear="handleSearch"
              @keyup.enter="handleSearch"
            />
          </el-form-item>

          <el-form-item label="订单状态">
            <el-select
              v-model="searchForm.status"
              placeholder="全部"
              clearable
              @change="handleSearch"
            >
              <el-option label="待支付" :value="OrderStatus.PENDING" />
              <el-option label="已支付" :value="OrderStatus.PAID" />
              <el-option label="已取消" :value="OrderStatus.CANCELLED" />
              <el-option label="已退款" :value="OrderStatus.REFUNDED" />
            </el-select>
          </el-form-item>

          <el-form-item label="订单类型">
            <el-select
              v-model="searchForm.orderType"
              placeholder="全部"
              clearable
              @change="handleSearch"
            >
              <el-option label="票务订单" value="ticket" />
              <el-option label="VIP套餐" value="package" />
              <el-option label="服务费" value="service_fee" />
            </el-select>
          </el-form-item>

          <el-form-item label="支付方式">
            <el-select
              v-model="searchForm.paymentMethod"
              placeholder="全部"
              clearable
              @change="handleSearch"
            >
              <el-option label="微信支付" value="wechat" />
              <el-option label="钱包支付" value="wallet" />
            </el-select>
          </el-form-item>

          <el-form-item label="创建时间">
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="YYYY-MM-DD"
              @change="handleDateChange"
            />
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="handleSearch">
              搜索
            </el-button>
            <el-button @click="handleReset">
              重置
            </el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- Data Table -->
      <DataTable
        :data="tableData"
        :columns="columns"
        :loading="tableLoading"
        :total="tableTotal"
        :page="tablePage"
        :page-size="tablePageSize"
        :selection="true"
        :show-index="true"
        :actions="actions"
        :show-export="true"
        @refresh="handleRefresh"
        @export="handleExport"
        @selection-change="handleSelectionChange"
        @sort-change="handleSortChange"
        @page-change="handlePageChange"
        @page-size-change="handlePageSizeChange"
      >
        <template #toolbar-right>
          <el-button
            v-if="selectedRows.length > 0"
            type="primary"
            @click="handleBatchExport"
          >
            批量导出
          </el-button>
        </template>

        <template #orderNo="{ row }">
          <el-link type="primary" @click="handleViewDetail(row)">
            {{ row.orderNo }}
          </el-link>
        </template>

        <template #orderType="{ row }">
          <el-tag :type="getOrderTypeTagType(row.orderType)">
            {{ getOrderTypeLabel(row.orderType) }}
          </el-tag>
        </template>

        <template #status="{ row }">
          <el-tag :type="getStatusTagType(row.status)">
            {{ getStatusLabel(row.status) }}
          </el-tag>
        </template>

        <template #amount="{ row }">
          <span class="amount">¥{{ (row.amount / 100).toFixed(2) }}</span>
        </template>

        <template #user="{ row }">
          <div class="user-cell" v-if="row.user">
            <el-avatar :size="32" :src="row.user.avatar" />
            <span>{{ row.user.nickname }}</span>
          </div>
          <span v-else>-</span>
        </template>
      </DataTable>
    </el-card>

    <!-- Refund Audit Dialog -->
    <RefundAuditDialog
      v-model:visible="refundDialogVisible"
      :order="currentOrder"
      @success="handleRefundAuditSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { View, Document } from '@element-plus/icons-vue'
import DataTable from '@/components/common/DataTable.vue'
import RefundAuditDialog from '@/components/orders/RefundAuditDialog.vue'
import { OrderAPI } from '@/api'
import { useTable } from '@/composables/useTable'
import { formatDate } from '@/utils/formatters'
import type { Order, OrderDetail, OrderStatsData } from '@/types/order'
import { OrderStatus } from '@/types/order'

const router = useRouter()

// Stats
const stats = ref<OrderStatsData>({
  total: 0,
  pending: 0,
  paid: 0,
  cancelled: 0,
  refunded: 0,
  totalAmount: 0,
  todayOrders: 0,
  todayAmount: 0,
  trend: []
})

// Search form
const searchForm = reactive({
  keyword: '',
  status: undefined as OrderStatus | undefined,
  orderType: undefined as string | undefined,
  paymentMethod: undefined as string | undefined,
})

const dateRange = ref<[string, string] | null>(null)

// Table setup
const {
  loading: tableLoading,
  data: tableData,
  total: tableTotal,
  params: tableParams,
  handlePageChange,
  handlePageSizeChange,
  handleSortChange,
  handleSearch: performSearch,
  refresh: handleRefresh,
  reset: performReset,
} = useTable<Order>({
  fetchData: async (params) => {
    return await OrderAPI.getOrders({
      page: params.page,
      pageSize: params.pageSize,
      keyword: params.keyword,
      status: params.status,
      orderType: params.orderType,
      paymentMethod: params.paymentMethod,
      startDate: params.startDate,
      endDate: params.endDate,
    })
  },
})

const tablePage = computed(() => tableParams.page)
const tablePageSize = computed(() => tableParams.pageSize)

// Selection
const selectedRows = ref<Order[]>([])

const handleSelectionChange = (rows: Order[]) => {
  selectedRows.value = rows
}

// Refund dialog
const refundDialogVisible = ref(false)
const currentOrder = ref<OrderDetail>({} as OrderDetail)

// Table columns
const columns = [
  {
    prop: 'orderNo',
    label: '订单号',
    width: 200,
    slot: 'orderNo',
  },
  {
    prop: 'orderType',
    label: '订单类型',
    width: 120,
    slot: 'orderType',
  },
  {
    prop: 'orderName',
    label: '订单名称',
    width: 150,
    formatter: (value: number) => getOrderNameLabel(value),
  },
  {
    prop: 'user',
    label: '用户',
    width: 150,
    slot: 'user',
  },
  {
    prop: 'amount',
    label: '金额',
    width: 120,
    slot: 'amount',
    sortable: 'custom' as const,
  },
  {
    prop: 'status',
    label: '状态',
    width: 100,
    slot: 'status',
  },
  {
    prop: 'paymentMethod',
    label: '支付方式',
    width: 120,
    formatter: (value: string) => getPaymentMethodLabel(value),
  },
  {
    prop: 'registrationAt',
    label: '创建时间',
    width: 180,
    sortable: 'custom' as const,
    formatter: (value: string) => formatDate(value),
  },
  {
    prop: 'paidAt',
    label: '支付时间',
    width: 180,
    sortable: 'custom' as const,
    formatter: (value: string) => formatDate(value),
  },
]

// Table actions
const actions = [
  {
    label: '查看',
    type: 'primary' as const,
    icon: View,
    handler: (row: Order) => handleViewDetail(row),
  },
  {
    label: '审核退款',
    type: 'warning' as const,
    icon: Document,
    handler: (row: Order) => handleAuditRefund(row),
    hidden: (row: Order) => !row.refund || row.refund.status !== 'pending',
  },
]

// Methods
const loadStats = async () => {
  try {
    stats.value = await OrderAPI.getOrderStats()
  } catch (error) {
    console.error('Failed to load order stats:', error)
  }
}

const handleSearch = () => {
  const params: any = {}

  // 只添加有值的参数
  if (searchForm.keyword?.trim()) {
    params.keyword = searchForm.keyword.trim()
  }
  if (searchForm.status) {
    params.status = searchForm.status
  }
  if (searchForm.orderType) {
    params.orderType = searchForm.orderType
  }
  if (searchForm.paymentMethod) {
    params.paymentMethod = searchForm.paymentMethod
  }
  if (dateRange.value?.[0]) {
    params.startDate = dateRange.value[0]
  }
  if (dateRange.value?.[1]) {
    params.endDate = dateRange.value[1]
  }

  performSearch(params)
}

const handleReset = () => {
  searchForm.keyword = ''
  searchForm.status = undefined
  searchForm.orderType = undefined
  searchForm.paymentMethod = undefined
  dateRange.value = null
  performReset()
}

const handleDateChange = () => {
  handleSearch()
}

const handleViewDetail = (row: Order) => {
  router.push(`/orders/${row.id}`)
}

const handleAuditRefund = async (row: Order) => {
  try {
    // Load full order detail
    const orderDetail = await OrderAPI.getOrderDetail(row.id)
    currentOrder.value = orderDetail
    refundDialogVisible.value = true
  } catch (error) {
    console.error('Failed to load order detail:', error)
    ElMessage.error('加载订单详情失败')
  }
}

const handleRefundAuditSuccess = async () => {
  try {
    // Get the audit data from the dialog
    const auditData = (refundDialogVisible.value as any).formData
    
    await OrderAPI.auditRefund(currentOrder.value.id, auditData)
    
    ElMessage.success('退款审核成功')
    await handleRefresh()
    await loadStats()
  } catch (error) {
    console.error('Failed to audit refund:', error)
    ElMessage.error('退款审核失败')
  }
}

const handleExport = async () => {
  try {
    const exportParams: any = {}

    // 只添加有值的参数
    if (searchForm.status) {
      exportParams.status = searchForm.status
    }
    if (searchForm.orderType) {
      exportParams.orderType = searchForm.orderType
    }
    if (dateRange.value?.[0]) {
      exportParams.startDate = dateRange.value[0]
    }
    if (dateRange.value?.[1]) {
      exportParams.endDate = dateRange.value[1]
    }

    const blob = await OrderAPI.exportOrders(exportParams)

    // Create download link
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `orders_${new Date().getTime()}.xlsx`
    link.click()
    setTimeout(() => window.URL.revokeObjectURL(url), 500)

    ElMessage.success('导出成功')
  } catch (error) {
    console.error('Failed to export orders:', error)
    ElMessage.error('导出失败')
  }
}

const handleBatchExport = async () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请选择要导出的订单')
    return
  }

  try {
    const ids = selectedRows.value.map(row => row.id)
    const blob = await OrderAPI.batchExportOrders(ids)

    // Create download link
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `orders_batch_${new Date().getTime()}.xlsx`
    link.click()
    setTimeout(() => window.URL.revokeObjectURL(url), 500)

    ElMessage.success('批量导出成功')
    selectedRows.value = []
  } catch (error) {
    console.error('Failed to batch export orders:', error)
    ElMessage.error('批量导出失败')
  }
}

// Formatters
const getOrderTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    ticket: '票务订单',
    package: 'VIP套餐',
    service_fee: '服务费'
  }
  return labels[type] || type
}

const getOrderTypeTagType = (type: string) => {
  const types: Record<string, any> = {
    ticket: 'primary',
    package: 'warning',
    service_fee: 'info'
  }
  return types[type] || 'info'
}

const getOrderNameLabel = (name: number) => {
  const labels: Record<number, string> = {
    1: '普通票',
    2: '早鸟票',
    3: '男性票',
    4: '女性票',
    5: '男性早鸟票',
    6: '女性早鸟票',
    7: '中小型聚会服务费',
    8: '中型聚会服务费',
    9: '大型聚会服务费',
    10: '月付VIP套餐',
    11: '季付VIP套餐',
    12: '年付VIP套餐'
  }
  return labels[name] || '未知'
}

const getStatusLabel = (status: number) => {
  const labels: Record<number, string> = {
    [OrderStatus.PENDING]: '待支付',
    [OrderStatus.PAID]: '已支付',
    [OrderStatus.CANCELLED]: '已取消',
    [OrderStatus.REFUNDED]: '已退款'
  }
  return labels[status] || '未知'
}

const getStatusTagType = (status: number) => {
  const types: Record<number, any> = {
    [OrderStatus.PENDING]: 'warning',
    [OrderStatus.PAID]: 'success',
    [OrderStatus.CANCELLED]: 'info',
    [OrderStatus.REFUNDED]: 'danger'
  }
  return types[status] || 'info'
}

const getPaymentMethodLabel = (method: string) => {
  if (!method) return '-'
  const labels: Record<string, string> = {
    wechat: '微信支付',
    wallet: '钱包支付'
  }
  return labels[method] || method
}

// Lifecycle
onMounted(() => {
  loadStats()
})
</script>

<style scoped lang="scss">
.order-management {
  padding: 20px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .title {
      font-size: 18px;
      font-weight: 600;
    }

    .header-stats {
      display: flex;
      gap: 40px;
    }
  }

  .search-section {
    margin-bottom: 20px;
  }

  .amount {
    font-weight: 600;
    color: var(--el-color-danger);
  }

  .user-cell {
    display: flex;
    align-items: center;
    gap: 8px;
  }
}
</style>
