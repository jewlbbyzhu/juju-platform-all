<template>
  <div class="party-audit-page">
    <el-card class="filter-card" shadow="never">
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="关键词">
          <el-input
            v-model="filterForm.keyword"
            placeholder="搜索聚会标题"
            clearable
            @clear="handleSearch"
            @keyup.enter="handleSearch"
          />
        </el-form-item>

        <el-form-item label="分类">
          <el-select
            v-model="filterForm.category"
            placeholder="全部分类"
            clearable
            @change="handleSearch"
          >
            <el-option label="霓虹" :value="PartyCategory.NEON" />
            <el-option label="潮酷" :value="PartyCategory.COOL" />
            <el-option label="高级" :value="PartyCategory.PREMIUM" />
            <el-option label="未来" :value="PartyCategory.FUTURE" />
          </el-select>
        </el-form-item>

        <el-form-item label="VIP优先">
          <el-switch
            v-model="filterForm.vipOnly"
            @change="handleSearch"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">
            搜索
          </el-button>
          <el-button :icon="Refresh" @click="handleReset">
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 统计卡片 -->
    <el-row :gutter="16" class="stats-row">
      <el-col :span="6">
        <el-card shadow="hover">
          <el-statistic title="待审核聚会" :value="Number(stats.pendingParties) || 0">
            <template #prefix>
              <el-icon color="#E6A23C"><Clock /></el-icon>
            </template>
          </el-statistic>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <el-statistic title="VIP聚会" :value="Number(stats.vipParties) || 0">
            <template #prefix>
              <el-icon color="#F56C6C"><Star /></el-icon>
            </template>
          </el-statistic>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <el-statistic title="今日新增" :value="Number(stats.newPartiesToday) || 0">
            <template #prefix>
              <el-icon color="#67C23A"><Plus /></el-icon>
            </template>
          </el-statistic>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <el-statistic title="本周新增" :value="Number(stats.newPartiesThisWeek) || 0">
            <template #prefix>
              <el-icon color="#409EFF"><TrendCharts /></el-icon>
            </template>
          </el-statistic>
        </el-card>
      </el-col>
    </el-row>

    <!-- 聚会列表 -->
    <el-card class="table-card" shadow="never">
      <DataTable
        :columns="columns"
        :data="tableData.list"
        :loading="loading"
        :total="tableData.total"
        :page="tableData.page"
        :page-size="tableData.pageSize"
        @page-change="handlePageChange"
        @size-change="handleSizeChange"
      >
        <template #organizer="{ row }">
          <div class="organizer-cell">
            <el-avatar :src="row.organizer?.avatar" :size="32" />
            <div class="organizer-info">
              <div class="organizer-name">
                {{ row.organizer?.nickname }}
                <el-tag v-if="row.organizer?.is_vip" type="warning" size="small">
                  VIP
                </el-tag>
              </div>
            </div>
          </div>
        </template>

        <template #category="{ row }">
          <el-tag :type="getCategoryTagType(row.category)">
            {{ getCategoryLabel(row.category) }}
          </el-tag>
        </template>

        <template #participants="{ row }">
          <el-progress
            :percentage="getParticipantPercentage(row)"
            :color="getProgressColor(row)"
          >
            <span class="progress-text">
              {{ row.current_participants }}/{{ row.max_participants }}
            </span>
          </el-progress>
        </template>

        <template #auditStatus="{ row }">
          <el-tag :type="getAuditStatusTagType(row.audit_status)">
            {{ getAuditStatusLabel(row.audit_status) }}
          </el-tag>
        </template>

        <template #actions="{ row }">
          <el-button
            type="primary"
            size="small"
            :icon="View"
            @click="handleViewDetail(row)"
          >
            查看详情
          </el-button>
          <el-button
            v-if="row.audit_status === PartyAuditStatus.PENDING"
            type="success"
            size="small"
            :icon="CircleCheck"
            @click="handleQuickApprove(row)"
          >
            快速通过
          </el-button>
        </template>
      </DataTable>
    </el-card>

    <!-- 详情抽屉 -->
    <el-drawer
      v-model="drawerVisible"
      title="聚会审核"
      size="60%"
      :before-close="handleDrawerClose"
    >
      <div v-if="currentParty" class="drawer-content">
        <PartyDetailCard :party="currentParty" />
        
        <PartyAuditForm
          v-if="currentParty.audit_status === PartyAuditStatus.PENDING"
          :party="currentParty"
          :loading="auditLoading"
          @submit="handleAuditSubmit"
          class="audit-form"
        />

        <PartyAuditHistory
          :history="auditHistory"
          :loading="historyLoading"
          @refresh="loadAuditHistory"
          class="audit-history"
        />
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search,
  Refresh,
  View,
  CircleCheck,
  Clock,
  Star,
  Plus,
  TrendCharts
} from '@element-plus/icons-vue'
import DataTable from '@/components/common/DataTable.vue'
import PartyDetailCard from '@/components/parties/PartyDetailCard.vue'
import PartyAuditForm from '@/components/parties/PartyAuditForm.vue'
import PartyAuditHistory from '@/components/parties/PartyAuditHistory.vue'
import { PartyAPI } from '@/api'
import type {
  Party,
  PartyDetail,
  PartyListParams,
  PartyAuditRequest,
  PartyAuditHistory as AuditHistoryType,
  PartyStatsData,
  TableColumn
} from '@/types/party'
import { PartyStatus, PartyCategory, PartyAuditStatus, AuditStatus } from '@/types/party'
import { formatDateTime } from '@/utils/format'

// 筛选表单
const filterForm = reactive<{
  keyword?: string
  category?: PartyCategory
  vipOnly: boolean
}>({
  keyword: '',
  category: undefined,
  vipOnly: false
})

// 表格数据
const tableData = reactive<{
  list: Party[]
  total: number
  page: number
  pageSize: number
}>({
  list: [],
  total: 0,
  page: 1,
  pageSize: 20
})

// 统计数据
const stats = reactive<PartyStatsData>({
  totalParties: 0,
  pendingParties: 0,
  ongoingParties: 0,
  completedParties: 0,
  rejectedParties: 0,
  newPartiesToday: 0,
  newPartiesThisWeek: 0,
  newPartiesThisMonth: 0,
  partyGrowthTrend: [],
  vipParties: 0,
  normalParties: 0
})

// 加载状态
const loading = ref(false)
const auditLoading = ref(false)
const historyLoading = ref(false)

// 抽屉
const drawerVisible = ref(false)
const currentParty = ref<PartyDetail | null>(null)
const auditHistory = ref<AuditHistoryType[]>([])

// 表格列配置
const columns: TableColumn[] = [
  {
    prop: 'id',
    label: 'ID',
    width: 80
  },
  {
    prop: 'title',
    label: '聚会标题',
    minWidth: 200
  },
  {
    prop: 'organizer',
    label: '组织者',
    width: 150,
    slot: 'organizer'
  },
  {
    prop: 'category',
    label: '分类',
    width: 100,
    slot: 'category'
  },
  {
    prop: 'participants',
    label: '参与人数',
    width: 150,
    slot: 'participants'
  },
  {
    prop: 'start_time',
    label: '开始时间',
    width: 180,
    formatter: (_value: string | undefined, row: Party) => row?.start_time ? formatDateTime(row.start_time) : '-'
  },
  {
    prop: 'audit_status',
    label: '审核状态',
    width: 100,
    slot: 'auditStatus'
  },
  {
    prop: 'actions',
    label: '操作',
    width: 220,
    fixed: 'right',
    slot: 'actions'
  }
]

// 加载待审核聚会列表
const loadPendingParties = async () => {
  loading.value = true
  try {
    const params: PartyListParams = {
      page: tableData.page,
      pageSize: tableData.pageSize,
      keyword: filterForm.keyword,
      category: filterForm.category,
      status: PartyStatus.DRAFT, // 草稿状态的聚会需要审核
      vipOnly: filterForm.vipOnly,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    }

    const response = await PartyAPI.getPendingParties(params)
    tableData.list = response.list
    tableData.total = response.total
  } catch (error) {
    console.error('加载待审核聚会失败:', error)
    ElMessage.error('加载待审核聚会失败')
  } finally {
    loading.value = false
  }
}

// 加载统计数据
const loadStats = async () => {
  try {
    const data = await PartyAPI.getPartyStats()
    Object.assign(stats, data)
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

// 加载聚会详情
const loadPartyDetail = async (id: number) => {
  try {
    currentParty.value = await PartyAPI.getPartyDetail(id)
  } catch (error) {
    console.error('加载聚会详情失败:', error)
    ElMessage.error('加载聚会详情失败')
  }
}

// 加载审核历史
const loadAuditHistory = async () => {
  if (!currentParty.value) return

  historyLoading.value = true
  try {
    auditHistory.value = await PartyAPI.getPartyAuditHistory(currentParty.value.id)
  } catch (error) {
    console.error('加载审核历史失败:', error)
    ElMessage.error('加载审核历史失败')
  } finally {
    historyLoading.value = false
  }
}

// 查看详情
const handleViewDetail = async (row: Party) => {
  await loadPartyDetail(row.id)
  await loadAuditHistory()
  drawerVisible.value = true
}

// 快速通过
const handleQuickApprove = async (row: Party) => {
  try {
    await ElMessageBox.confirm(
      '确认快速通过该聚会吗？',
      '快速审核',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await PartyAPI.auditParty(row.id, {
      status: AuditStatus.APPROVED
    })

    ElMessage.success('审核通过')
    await loadPendingParties()
    await loadStats()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('快速审核失败:', error)
      ElMessage.error('快速审核失败')
    }
  }
}

// 提交审核
const handleAuditSubmit = async (data: PartyAuditRequest) => {
  if (!currentParty.value) return

  auditLoading.value = true
  try {
    await PartyAPI.auditParty(currentParty.value.id, data)

    const action = data.status === AuditStatus.APPROVED ? '通过' : '拒绝'
    ElMessage.success(`审核${action}成功`)

    drawerVisible.value = false
    await loadPendingParties()
    await loadStats()
  } catch (error) {
    console.error('提交审核失败:', error)
    ElMessage.error('提交审核失败')
  } finally {
    auditLoading.value = false
  }
}

// 关闭抽屉
const handleDrawerClose = (done: () => void) => {
  currentParty.value = null
  auditHistory.value = []
  done()
}

// 搜索
const handleSearch = () => {
  tableData.page = 1
  loadPendingParties()
}

// 重置
const handleReset = () => {
  filterForm.keyword = ''
  filterForm.category = undefined
  filterForm.vipOnly = false
  handleSearch()
}

// 分页
const handlePageChange = (page: number) => {
  tableData.page = page
  loadPendingParties()
}

const handleSizeChange = (size: number) => {
  tableData.pageSize = size
  tableData.page = 1
  loadPendingParties()
}

// 工具函数
const getCategoryLabel = (category: PartyCategory) => {
  const labels: Record<PartyCategory, string> = {
    [PartyCategory.NEON]: '霓虹',
    [PartyCategory.COOL]: '潮酷',
    [PartyCategory.PREMIUM]: '高级',
    [PartyCategory.FUTURE]: '未来'
  }
  return labels[category] || '未知'
}

const getCategoryTagType = (category: PartyCategory) => {
  const types: Record<PartyCategory, string> = {
    [PartyCategory.NEON]: 'danger',
    [PartyCategory.COOL]: 'info',
    [PartyCategory.PREMIUM]: 'warning',
    [PartyCategory.FUTURE]: 'success'
  }
  return types[category] || 'info'
}

const getStatusLabel = (status: PartyStatus) => {
  const labels: Record<number, string> = {
    [PartyStatus.DRAFT]: '草稿',
    [PartyStatus.PUBLISHED]: '已发布',
    [PartyStatus.ENDED]: '已结束',
    [PartyStatus.CANCELLED]: '已取消'
  }
  return labels[status] || '未知'
}

const getStatusTagType = (status: PartyStatus) => {
  const types: Record<number, string> = {
    [PartyStatus.DRAFT]: 'info',
    [PartyStatus.PUBLISHED]: 'success',
    [PartyStatus.ENDED]: 'success',
    [PartyStatus.CANCELLED]: 'info'
  }
  return types[status] || 'info'
}

const getAuditStatusLabel = (status: PartyAuditStatus) => {
  const labels: Record<number, string> = {
    [PartyAuditStatus.PENDING]: '待审核',
    [PartyAuditStatus.APPROVED]: '已通过',
    [PartyAuditStatus.REJECTED]: '已拒绝'
  }
  return labels[status] || '未知'
}

const getAuditStatusTagType = (status: PartyAuditStatus) => {
  const types: Record<number, string> = {
    [PartyAuditStatus.PENDING]: 'warning',
    [PartyAuditStatus.APPROVED]: 'success',
    [PartyAuditStatus.REJECTED]: 'danger'
  }
  return types[status] || 'info'
}

const getParticipantPercentage = (row: Party) => {
  if (!row.max_participants || row.max_participants <= 0) return 0
  return Math.round((row.current_participants / row.max_participants) * 100)
}

const getProgressColor = (row: Party) => {
  const percentage = getParticipantPercentage(row)
  if (percentage >= 90) return '#F56C6C'
  if (percentage >= 70) return '#E6A23C'
  return '#67C23A'
}

// 初始化
onMounted(() => {
  loadPendingParties()
  loadStats()
})
</script>

<style scoped lang="scss">
.party-audit-page {
  .filter-card {
    margin-bottom: 16px;

    .filter-form {
      margin-bottom: 0;
    }
  }

  .stats-row {
    margin-bottom: 16px;
  }

  .table-card {
    .organizer-cell {
      display: flex;
      align-items: center;
      gap: 8px;

      .organizer-info {
        .organizer-name {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 14px;
        }
      }
    }

    .progress-text {
      font-size: 12px;
    }
  }

  .drawer-content {
    .audit-form,
    .audit-history {
      margin-top: 16px;
    }
  }
}
</style>
