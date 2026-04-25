<template>
  <div class="user-management">
    <el-card>
      <template #header>
        <div class="card-header">
          <span class="title">用户管理</span>
        </div>
      </template>

      <!-- Search and Filter -->
      <div class="search-section">
        <el-form :inline="true" :model="searchForm">
          <el-form-item label="关键词">
            <el-input
              v-model="searchForm.keyword"
              placeholder="搜索昵称/手机号/ID"
              clearable
              @clear="handleSearch"
              @keyup.enter="handleSearch"
            />
          </el-form-item>

          <el-form-item label="用户状态">
            <el-select
              v-model="searchForm.status"
              placeholder="全部"
              clearable
              @change="handleSearch"
            >
              <el-option label="正常" :value="UserStatus.ACTIVE" />
              <el-option label="已封禁" :value="UserStatus.BANNED" />
            </el-select>
          </el-form-item>

          <el-form-item label="VIP状态">
            <el-select
              v-model="searchForm.vipStatus"
              placeholder="全部"
              clearable
              @change="handleSearch"
            >
              <el-option label="VIP用户" :value="true" />
              <el-option label="普通用户" :value="false" />
            </el-select>
          </el-form-item>

          <el-form-item label="注册时间">
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
            type="danger"
            @click="handleBatchBan"
          >
            批量封禁
          </el-button>
        </template>

        <template #avatar="{ row }">
          <el-avatar 
            :size="40" 
            :src="row.avatar || '/default-avatar.png'"
            @error="handleAvatarError"
          >
            <el-icon><UserIcon /></el-icon>
          </el-avatar>
        </template>

        <template #nickname="{ row }">
          <div class="nickname-cell">
            <span>{{ row.nickname }}</span>
            <el-tag v-if="row.is_vip" type="warning" size="small" effect="dark">
              VIP
            </el-tag>
          </div>
        </template>

        <template #status="{ row }">
          <el-tag :type="getStatusType(row.status)">
            {{ getStatusText(row.status) }}
          </el-tag>
        </template>

        <template #stats="{ row }">
          <div class="stats-cell">
            <span>参与: {{ row.stats?.joinedCount ?? 0 }}</span>
            <span>创建: {{ row.stats?.createdCount ?? 0 }}</span>
            <span>订单: {{ row.stats?.orderCount ?? 0 }}</span>
          </div>
        </template>
      </DataTable>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { View, Delete, User as UserIcon } from '@element-plus/icons-vue'
import DataTable from '@/components/common/DataTable.vue'
import { UserAPI } from '@/api'
import { useTable } from '@/composables/useTable'
import { formatDate } from '@/utils/formatters'
import type { User } from '@/types/user'
import { UserStatus } from '@/types/user'

const router = useRouter()

// Search form
const searchForm = reactive({
  keyword: '',
  status: undefined as number | undefined,
  vipStatus: undefined as boolean | undefined,
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
} = useTable<User>({
  fetchData: async (params) => {
    return await UserAPI.getUsers({
      page: params.page,
      pageSize: params.pageSize,
      keyword: params.keyword,
      status: params.status,
      vipStatus: params.vipStatus,
      startDate: params.startDate,
      endDate: params.endDate,
      sortBy: params.sortBy,
      sortOrder: params.sortOrder,
    })
  },
})

const tablePage = computed(() => tableParams.page)
const tablePageSize = computed(() => tableParams.pageSize)

// Selection
const selectedRows = ref<User[]>([])

const handleSelectionChange = (rows: User[]) => {
  selectedRows.value = rows
}

// Methods (define before usage to avoid temporal dead zone)
const handleBanUser = async (row: User) => {
  try {
    await ElMessageBox.confirm('确定要封禁该用户吗？', '封禁用户', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    await UserAPI.updateUserStatus(row.id, {
      status: UserStatus.BANNED,
    })

    ElMessage.success('用户已封禁')
    await handleRefresh()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('Failed to ban user:', error)
      ElMessage.error('封禁用户失败')
    }
  }
}

const handleUnbanUser = async (row: User) => {
  try {
    await ElMessageBox.confirm('确定要解封该用户吗？', '解封用户', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    await UserAPI.updateUserStatus(row.id, {
      status: UserStatus.ACTIVE,
    })

    ElMessage.success('用户已解封')
    await handleRefresh()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('Failed to unban user:', error)
      ElMessage.error('解封用户失败')
    }
  }
}

// 头像加载失败处理
const handleAvatarError = (e: Event) => {
  const target = e.target as HTMLImageElement
  target.style.display = 'none'
}

// Table columns
const columns = [
  {
    prop: 'avatar',
    label: '头像',
    width: 80,
    slot: 'avatar',
  },
  {
    prop: 'id',
    label: 'ID',
    width: 80,
    sortable: 'custom',
  },
  {
    prop: 'nickname',
    label: '昵称',
    minWidth: 150,
    slot: 'nickname',
  },
  {
    prop: 'phone',
    label: '手机号',
    width: 120,
    formatter: (value: string) => value || '-',
  },
  {
    prop: 'status',
    label: '状态',
    width: 100,
    slot: 'status',
  },
  {
    prop: 'stats',
    label: '统计',
    width: 150,
    slot: 'stats',
  },
  {
    prop: 'created_at',
    label: '注册时间',
    width: 180,
    sortable: 'custom',
    formatter: (value: string) => formatDate(value),
  },
  {
    prop: 'last_login_at',
    label: '最后登录',
    width: 180,
    sortable: 'custom',
    formatter: (value: string) => formatDate(value),
  },
]

// Table actions (now after handlers are defined)
const actions = [
  {
    label: '查看',
    type: 'primary' as const,
    icon: View,
    handler: (row: User) => {
      router.push(`/users/${row.id}`)
    },
  },
  {
    label: '封禁',
    type: 'danger' as const,
    icon: Delete,
    handler: handleBanUser,
    hidden: (row: User) => row.status !== UserStatus.ACTIVE,
  },
  {
    label: '解封',
    type: 'success' as const,
    handler: handleUnbanUser,
    hidden: (row: User) => row.status !== UserStatus.BANNED,
  },
]

// Methods
const handleSearch = () => {
  performSearch({
    keyword: searchForm.keyword,
    status: searchForm.status,
    vipStatus: searchForm.vipStatus,
    startDate: dateRange.value?.[0],
    endDate: dateRange.value?.[1],
  })
}

const handleReset = () => {
  searchForm.keyword = ''
  searchForm.status = undefined
  searchForm.vipStatus = undefined
  dateRange.value = null
  performReset()
}

const handleDateChange = () => {
  handleSearch()
}

 

const handleBatchBan = async () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请选择要封禁的用户')
    return
  }

  try {
    const { value: reason } = await ElMessageBox.prompt('请输入封禁原因', '批量封禁用户', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputPattern: /.+/,
      inputErrorMessage: '请输入封禁原因',
    })

    const ids = selectedRows.value.map(row => row.id)
    await UserAPI.batchUpdateUserStatus(ids, {
      status: UserStatus.BANNED,
      reason,
    })

    ElMessage.success(`已封禁 ${ids.length} 个用户`)
    selectedRows.value = []
    await handleRefresh()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('Failed to batch ban users:', error)
      ElMessage.error('批量封禁失败')
    }
  }
}

const handleExport = async () => {
  try {
    const blob = await UserAPI.exportUsers({
      keyword: searchForm.keyword,
      status: searchForm.status,
      vipStatus: searchForm.vipStatus,
      startDate: dateRange.value?.[0],
      endDate: dateRange.value?.[1],
    })

    // Create download link
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `users_${new Date().getTime()}.xlsx`
    link.click()
    setTimeout(() => window.URL.revokeObjectURL(url), 500)

    ElMessage.success('导出成功')
  } catch (error) {
    console.error('Failed to export users:', error)
    ElMessage.error('导出失败')
  }
}

// Formatters
const getStatusType = (status: number) => {
  const typeMap: Record<number, any> = {
    [UserStatus.ACTIVE]: 'success',
    [UserStatus.BANNED]: 'danger',
  }
  return typeMap[status] || 'info'
}

const getStatusText = (status: number) => {
  const textMap: Record<number, string> = {
    [UserStatus.ACTIVE]: '正常',
    [UserStatus.BANNED]: '已封禁',
  }
  return textMap[status] || '未知'
}
</script>

<style scoped lang="scss">
.user-management {
  padding: 20px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .title {
      font-size: 18px;
      font-weight: 600;
    }
  }

  .search-section {
    margin-bottom: 20px;
  }

  .nickname-cell {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .stats-cell {
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }
}
</style>
