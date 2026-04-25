<template>
  <div class="finance-page">
    <!-- Statistics Cards -->
    <el-row :gutter="20" class="stats-row">
      <el-col :xs="24" :sm="12" :md="6">
        <FinancialStatsCard
          label="总收入"
          :value="stats?.revenue.total || 0"
          :icon="Money"
          icon-color="#409EFF"
          icon-bg-color="#ecf5ff"
        />
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <FinancialStatsCard
          label="票务收入"
          :value="stats?.revenue.ticket || 0"
          :icon="Ticket"
          icon-color="#67C23A"
          icon-bg-color="#f0f9ff"
        />
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <FinancialStatsCard
          label="VIP收入"
          :value="stats?.revenue.vip || 0"
          :icon="Star"
          icon-color="#E6A23C"
          icon-bg-color="#fdf6ec"
        />
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <FinancialStatsCard
          label="待审核提现"
          :value="stats?.withdrawal.pending || 0"
          :icon="Wallet"
          icon-color="#F56C6C"
          icon-bg-color="#fef0f0"
          format-type="currency"
        />
      </el-col>
    </el-row>

    <!-- Charts -->
    <el-row :gutter="20" class="charts-row">
      <el-col :xs="24" :lg="16">
        <el-card shadow="hover">
          <RevenueTrendChart
            :data="stats"
            :loading="loading"
            @date-range-change="handleDateRangeChange"
          />
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="8">
        <el-card shadow="hover">
          <RevenueSourceChart
            :data="stats"
            :loading="loading"
          />
        </el-card>
      </el-col>
    </el-row>

    <!-- Withdrawal Management -->
    <el-card shadow="hover" class="withdrawal-card">
      <template #header>
        <div class="card-header">
          <h3>提现审核</h3>
          <el-button
            type="primary"
            :icon="Download"
            @click="handleExportReport"
            :loading="exporting"
          >
            导出财务报表
          </el-button>
        </div>
      </template>

      <!-- Filters -->
      <div class="filters">
        <el-input
          v-model="filters.keyword"
          placeholder="搜索用户昵称、手机号"
          :prefix-icon="Search"
          clearable
          style="width: 240px"
          @clear="handleSearch"
          @keyup.enter="handleSearch"
        />
        <el-select
          v-model="filters.status"
          placeholder="提现状态"
          clearable
          style="width: 150px"
          @change="handleSearch"
        >
          <el-option label="待审核" value="pending" />
          <el-option label="已处理" value="processed" />
          <el-option label="已拒绝" value="rejected" />
        </el-select>
        <el-date-picker
          v-model="filters.dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          @change="handleSearch"
        />
        <el-button type="primary" :icon="Search" @click="handleSearch">
          搜索
        </el-button>
        <el-button :icon="Refresh" @click="handleReset">重置</el-button>
      </div>

      <!-- Withdrawal Table -->
      <el-table
        :data="withdrawals"
        v-loading="tableLoading"
        stripe
        style="width: 100%"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="用户信息" min-width="180">
          <template #default="{ row }">
            <div class="user-info">
              <el-avatar :size="32" :src="row.user?.avatar" />
              <div class="user-details">
                <div class="user-name">{{ row.user?.nickname }}</div>
                <div class="user-phone">{{ row.user?.phone }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="提现金额" width="120">
          <template #default="{ row }">
            <span class="amount">¥{{ (row.amount / 100).toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="银行卡" min-width="200">
          <template #default="{ row }">
            <div v-if="row.bankCard && row.bankCard.bankName && row.bankCard.cardNumber">
              <div>{{ row.bankCard.bankName }}</div>
              <div class="card-number">**** **** **** {{ row.bankCard.cardNumber.slice(-4) }}</div>
            </div>
            <div v-else-if="row.bank_card">
              <div>{{ row.bank_card.bank_name || '未知银行' }}</div>
              <div class="card-number">**** **** **** {{ (row.bank_card.card_number || '****').slice(-4) }}</div>
            </div>
            <div v-else class="text-gray">未绑定银行卡</div>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="申请时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row.status === 'pending'"
              type="success"
              size="small"
              @click="handleAudit(row, 'processed')"
            >
              通过
            </el-button>
            <el-button
              v-if="row.status === 'pending'"
              type="danger"
              size="small"
              @click="handleAudit(row, 'rejected')"
            >
              拒绝
            </el-button>
            <el-button
              v-if="row.status !== 'pending'"
              type="info"
              size="small"
              @click="handleViewDetail(row)"
            >
              查看
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- Pagination -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSearch"
          @current-change="handleSearch"
        />
      </div>
    </el-card>

    <!-- Audit Dialog -->
    <el-dialog
      v-model="auditDialogVisible"
      :title="auditDialogTitle"
      width="500px"
    >
      <el-form :model="auditForm" label-width="80px">
        <el-form-item label="审核结果">
          <el-tag :type="auditForm.status === 'processed' ? 'success' : 'danger'">
            {{ auditForm.status === 'processed' ? '通过' : '拒绝' }}
          </el-tag>
        </el-form-item>
        <el-form-item label="审核意见">
          <el-input
            v-model="auditForm.reason"
            type="textarea"
            :rows="4"
            placeholder="请输入审核意见（选填）"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="auditDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmAudit" :loading="auditing">
          确认
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Money,
  Ticket,
  Star,
  Wallet,
  Download,
  Search,
  Refresh
} from '@element-plus/icons-vue'
import { FinanceAPI } from '@/api'
import FinancialStatsCard from '@/components/finance/FinancialStatsCard.vue'
import RevenueTrendChart from '@/components/finance/RevenueTrendChart.vue'
import RevenueSourceChart from '@/components/finance/RevenueSourceChart.vue'
import { formatDate as formatDateSafe } from '@/utils/formatters'
import type { FinancialStats, Withdrawal, WithdrawalStatus } from '@/types/finance'
import { useAuthStore } from '@/stores/modules/auth'

const authStore = useAuthStore()

// State
const loading = ref(false)
const tableLoading = ref(false)
const exporting = ref(false)
const auditing = ref(false)
const stats = ref<FinancialStats>()
const withdrawals = ref<Withdrawal[]>([])

// Filters
const filters = reactive({
  keyword: '',
  status: '' as WithdrawalStatus | '',
  dateRange: null as [string, string] | null
})

// Pagination
const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})

// Audit dialog
const auditDialogVisible = ref(false)
const auditDialogTitle = ref('')
const auditForm = reactive({
  id: 0,
  status: 'processed' as 'processed' | 'rejected',
  reason: ''
})

// Get status type for tag
const getStatusType = (status: WithdrawalStatus) => {
  const typeMap: Record<WithdrawalStatus, any> = {
    pending: 'warning',
    processed: 'success',
    rejected: 'danger'
  }
  return typeMap[status]
}

// Get status label
const getStatusLabel = (status: WithdrawalStatus) => {
  const labelMap: Record<WithdrawalStatus, string> = {
    pending: '待审核',
    processed: '已处理',
    rejected: '已拒绝'
  }
  return labelMap[status]
}

// Format date
const formatDate = (date: string) => {
  return formatDateSafe(date)
}

// Load financial stats
const loadStats = async (startDate?: string, endDate?: string) => {
  try {
    loading.value = true
    stats.value = await FinanceAPI.getFinancialStats({ startDate, endDate })
  } catch (error) {
    console.error('Failed to load financial stats:', error)
    ElMessage.error('加载财务统计失败')
  } finally {
    loading.value = false
  }
}

// Load withdrawals
const loadWithdrawals = async () => {
  try {
    tableLoading.value = true
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      keyword: filters.keyword || undefined,
      status: filters.status || undefined,
      startDate: filters.dateRange?.[0],
      endDate: filters.dateRange?.[1]
    }
    const response = await FinanceAPI.getWithdrawals(params)
    withdrawals.value = response.list
    pagination.total = response.total
  } catch (error) {
    console.error('Failed to load withdrawals:', error)
    ElMessage.error('加载提现列表失败')
  } finally {
    tableLoading.value = false
  }
}

// Handle date range change
const handleDateRangeChange = (startDate: string, endDate: string) => {
  loadStats(startDate, endDate)
}

// Handle search
const handleSearch = () => {
  pagination.page = 1
  loadWithdrawals()
}

// Handle reset
const handleReset = () => {
  filters.keyword = ''
  filters.status = ''
  filters.dateRange = null
  handleSearch()
}

// Handle audit
const handleAudit = (withdrawal: Withdrawal, status: 'processed' | 'rejected') => {
  auditForm.id = withdrawal.id
  auditForm.status = status
  auditForm.reason = ''
  auditDialogTitle.value = status === 'processed' ? '通过提现申请' : '拒绝提现申请'
  auditDialogVisible.value = true
}

// Handle confirm audit
const handleConfirmAudit = async () => {
  try {
    auditing.value = true
    const userInfo = authStore.userInfo
    await FinanceAPI.auditWithdrawal(auditForm.id, {
      status: auditForm.status,
      reason: auditForm.reason || undefined,
      reviewer: userInfo?.username || 'admin'
    })
    ElMessage.success('审核成功')
    auditDialogVisible.value = false
    loadWithdrawals()
    loadStats()
  } catch (error) {
    console.error('Failed to audit withdrawal:', error)
    ElMessage.error('审核失败')
  } finally {
    auditing.value = false
  }
}

// Handle view detail
const handleViewDetail = (withdrawal: Withdrawal) => {
  ElMessageBox.alert(
    `
      <div>
        <p><strong>用户:</strong> ${withdrawal.user?.nickname}</p>
        <p><strong>金额:</strong> ¥${(withdrawal.amount / 100).toFixed(2)}</p>
        <p><strong>银行卡:</strong> ${withdrawal.bankCard?.bankName} **** ${withdrawal.bankCard?.cardNumber.slice(-4)}</p>
        <p><strong>状态:</strong> ${getStatusLabel(withdrawal.status)}</p>
        <p><strong>申请时间:</strong> ${formatDate(withdrawal.created_at)}</p>
        ${withdrawal.processedAt ? `<p><strong>处理时间:</strong> ${formatDate(withdrawal.processedAt)}</p>` : ''}
        ${withdrawal.reason ? `<p><strong>审核意见:</strong> ${withdrawal.reason}</p>` : ''}
      </div>
    `,
    '提现详情',
    {
      dangerouslyUseHTMLString: true,
      confirmButtonText: '关闭'
    }
  )
}

// Handle export report
const handleExportReport = async () => {
  try {
    exporting.value = true
    const today = new Date()
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
    
    const formatDate = (date: Date) => {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }

    const blob = await FinanceAPI.exportFinancialReport({
      startDate: formatDate(thirtyDaysAgo),
      endDate: formatDate(today),
      includeRevenue: true,
      includeWithdrawals: true,
      includeTransactions: true
    })

    // Create download link
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `财务报表_${formatDate(today)}.xlsx`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    setTimeout(() => window.URL.revokeObjectURL(url), 500)

    ElMessage.success('导出成功')
  } catch (error) {
    console.error('Failed to export report:', error)
    ElMessage.error('导出失败')
  } finally {
    exporting.value = false
  }
}

// Initialize
onMounted(() => {
  loadStats()
  loadWithdrawals()
})
</script>

<style scoped lang="scss">
.finance-page {
  padding: 20px;

  .stats-row {
    margin-bottom: 20px;
  }

  .charts-row {
    margin-bottom: 20px;
  }

  .withdrawal-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
      }
    }

    .filters {
      display: flex;
      gap: 12px;
      margin-bottom: 20px;
      flex-wrap: wrap;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 12px;

      .user-details {
        .user-name {
          font-weight: 500;
          color: #303133;
        }

        .user-phone {
          font-size: 12px;
          color: #909399;
        }
      }
    }

    .amount {
      font-weight: 600;
      color: #409EFF;
    }

    .card-number {
      font-size: 12px;
      color: #909399;
    }

    .pagination {
      margin-top: 20px;
      display: flex;
      justify-content: flex-end;
    }
  }
}
</style>
