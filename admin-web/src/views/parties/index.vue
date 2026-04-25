<template>
  <div class="parties-page">
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

        <el-form-item label="状态">
          <el-select
            v-model="filterForm.status"
            placeholder="全部状态"
            clearable
            @change="handleSearch"
          >
            <el-option label="草稿" :value="PartyStatus.DRAFT" />
            <el-option label="已发布" :value="PartyStatus.PUBLISHED" />
            <el-option label="已结束" :value="PartyStatus.ENDED" />
            <el-option label="已取消" :value="PartyStatus.CANCELLED" />
          </el-select>
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

        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">
            搜索
          </el-button>
          <el-button :icon="Refresh" @click="handleReset">
            重置
          </el-button>
          <el-button type="success" :icon="Download" @click="handleExport">
            导出
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

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

        <template #status="{ row }">
          <el-tag :type="getStatusTagType(row.status)">
            {{ getStatusLabel(row.status) }}
          </el-tag>
        </template>

        <template #actions="{ row }">
          <el-button
            type="primary"
            size="small"
            :icon="View"
            @click="handleViewDetail(row)"
          >
            查看
          </el-button>
          <el-button
            v-if="row.status === PartyStatus.PUBLISHED"
            type="success"
            size="small"
            @click="handleComplete(row)"
          >
            完成
          </el-button>
          <el-button
            v-if="[PartyStatus.DRAFT, PartyStatus.PUBLISHED].includes(row.status)"
            type="danger"
            size="small"
            @click="handleCancel(row)"
          >
            取消
          </el-button>
        </template>
      </DataTable>
    </el-card>

    <!-- 详情抽屉 -->
    <el-drawer
      v-model="drawerVisible"
      title="聚会详情"
      size="60%"
      :before-close="handleDrawerClose"
    >
      <div v-if="currentParty" class="drawer-content">
        <PartyDetailCard :party="currentParty" />
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
  Download,
  View
} from '@element-plus/icons-vue'
import DataTable from '@/components/common/DataTable.vue'
import PartyDetailCard from '@/components/parties/PartyDetailCard.vue'
import { PartyAPI } from '@/api'
import type {
  Party,
  PartyDetail,
  PartyListParams
} from '@/types/party'
import { PartyStatus, PartyCategory } from '@/types/party'
import { formatDateTime } from '@/utils/format'

// 筛选表单
const filterForm = reactive<{
  keyword?: string
  status?: PartyStatus
  category?: PartyCategory
}>({
  keyword: '',
  status: undefined,
  category: undefined
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

// 加载状态
const loading = ref(false)

// 抽屉
const drawerVisible = ref(false)
const currentParty = ref<PartyDetail | null>(null)

// 表格列配置
const columns = [
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
    prop: 'status',
    label: '状态',
    width: 100,
    slot: 'status'
  },
  {
    prop: 'actions',
    label: '操作',
    width: 220,
    fixed: 'right',
    slot: 'actions'
  }
]

// 加载聚会列表
const loadParties = async () => {
  loading.value = true
  try {
    const params: PartyListParams = {
      page: tableData.page,
      pageSize: tableData.pageSize,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    }

    // 只添加有值的参数
    if (filterForm.keyword?.trim()) {
      params.keyword = filterForm.keyword.trim()
    }
    if (filterForm.status !== undefined) {
      params.status = filterForm.status
    }
    if (filterForm.category !== undefined) {
      params.category = filterForm.category
    }

    const response = await PartyAPI.getParties(params)
    tableData.list = response?.list || []
    tableData.total = response?.total || 0
  } catch (error) {
    console.error('加载聚会列表失败:', error)
    ElMessage.error('加载聚会列表失败')
  } finally {
    loading.value = false
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

// 查看详情
const handleViewDetail = async (row: Party) => {
  await loadPartyDetail(row.id)
  drawerVisible.value = true
}

// 完成聚会
const handleComplete = async (row: Party) => {
  try {
    await ElMessageBox.confirm(
      '确认完成该聚会吗？',
      '完成聚会',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await PartyAPI.completeParty(row.id)
    ElMessage.success('聚会已完成')
    await loadParties()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('完成聚会失败:', error)
      ElMessage.error('完成聚会失败')
    }
  }
}

// 取消聚会
const handleCancel = async (row: Party) => {
  try {
    const { value: reason } = await ElMessageBox.prompt(
      '请输入取消原因',
      '取消聚会',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        inputPattern: /.+/,
        inputErrorMessage: '请输入取消原因'
      }
    )

    await PartyAPI.cancelParty(row.id, reason)
    ElMessage.success('聚会已取消')
    await loadParties()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('取消聚会失败:', error)
      ElMessage.error('取消聚会失败')
    }
  }
}

// 导出
const handleExport = async () => {
  try {
    const exportParams: any = {}
    if (filterForm.keyword?.trim()) {
      exportParams.keyword = filterForm.keyword.trim()
    }
    if (filterForm.status) {
      exportParams.status = filterForm.status
    }
    if (filterForm.category !== undefined) {
      exportParams.category = filterForm.category
    }

    const blob = await PartyAPI.exportParties(exportParams)

    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `聚会列表_${new Date().getTime()}.xlsx`
    link.click()
    window.URL.revokeObjectURL(url)

    ElMessage.success('导出成功')
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败')
  }
}

// 关闭抽屉
const handleDrawerClose = (done: () => void) => {
  currentParty.value = null
  done()
}

// 搜索
const handleSearch = () => {
  tableData.page = 1
  loadParties()
}

// 重置
const handleReset = () => {
  filterForm.keyword = ''
  filterForm.status = undefined
  filterForm.category = undefined
  handleSearch()
}

// 分页
const handlePageChange = (page: number) => {
  tableData.page = page
  loadParties()
}

const handleSizeChange = (size: number) => {
  tableData.pageSize = size
  tableData.page = 1
  loadParties()
}

// 工具函数
const getCategoryLabel = (category: PartyCategory) => {
  const labels = {
    [PartyCategory.NEON]: '霓虹',
    [PartyCategory.COOL]: '潮酷',
    [PartyCategory.PREMIUM]: '高级',
    [PartyCategory.FUTURE]: '未来'
  }
  return labels[category] || '未知'
}

const getCategoryTagType = (category: PartyCategory) => {
  const types = {
    [PartyCategory.NEON]: 'danger',
    [PartyCategory.COOL]: 'info',
    [PartyCategory.PREMIUM]: 'warning',
    [PartyCategory.FUTURE]: 'success'
  }
  return types[category] || 'info'
}

const getStatusLabel = (status: PartyStatus) => {
  const labels = {
    [PartyStatus.DRAFT]: '草稿',
    [PartyStatus.PUBLISHED]: '已发布',
    [PartyStatus.ENDED]: '已结束',
    [PartyStatus.CANCELLED]: '已取消'
  }
  return labels[status] || '未知'
}

const getStatusTagType = (status: PartyStatus) => {
  const types = {
    [PartyStatus.DRAFT]: 'info',
    [PartyStatus.PUBLISHED]: 'success',
    [PartyStatus.ENDED]: 'success',
    [PartyStatus.CANCELLED]: 'info'
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
  loadParties()
})
</script>

<style scoped lang="scss">
.parties-page {
  .filter-card {
    margin-bottom: 16px;

    .filter-form {
      margin-bottom: 0;
    }
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
}
</style>
