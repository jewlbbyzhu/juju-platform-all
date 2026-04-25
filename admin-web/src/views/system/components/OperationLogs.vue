<template>
  <div class="operation-logs">
    <!-- Search filters -->
    <el-form :inline="true" :model="searchForm" class="search-form">
      <el-form-item label="管理员">
        <el-input v-model="searchForm.adminName" placeholder="管理员名称" clearable />
      </el-form-item>
      <el-form-item label="模块">
        <el-input v-model="searchForm.module" placeholder="模块名称" clearable />
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="searchForm.status" placeholder="全部" clearable>
          <el-option label="成功" value="success" />
          <el-option label="失败" value="failed" />
        </el-select>
      </el-form-item>
      <el-form-item label="时间范围">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="YYYY-MM-DD"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="handleReset">重置</el-button>
        <el-button type="success" @click="handleExport">导出</el-button>
      </el-form-item>
    </el-form>

    <!-- Logs table -->
    <el-table v-loading="loading" :data="logList" stripe>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="adminName" label="管理员" width="120" />
      <el-table-column prop="module" label="模块" width="120" />
      <el-table-column prop="action" label="操作" width="150" />
      <el-table-column prop="method" label="请求方法" width="100" />
      <el-table-column prop="path" label="请求路径" min-width="200" show-overflow-tooltip />
      <el-table-column prop="ip" label="IP地址" width="140" />
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 'success' ? 'success' : 'danger'">
            {{ row.status === 'success' ? '成功' : '失败' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="duration" label="耗时(ms)" width="100" />
      <el-table-column prop="createdAt" label="操作时间" width="160">
        <template #default="{ row }">
          {{ formatDateTime(row.createdAt) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="100" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click="handleViewDetail(row)">
            详情
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- Pagination -->
    <el-pagination
      v-model:current-page="pagination.page"
      v-model:page-size="pagination.pageSize"
      :total="pagination.total"
      :page-sizes="[10, 20, 50, 100]"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="handleSearch"
      @current-change="handleSearch"
    />

    <!-- Detail dialog -->
    <el-dialog v-model="detailDialogVisible" title="操作日志详情" width="800px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="ID">{{ currentLog?.id }}</el-descriptions-item>
        <el-descriptions-item label="管理员">{{ currentLog?.adminName }}</el-descriptions-item>
        <el-descriptions-item label="模块">{{ currentLog?.module }}</el-descriptions-item>
        <el-descriptions-item label="操作">{{ currentLog?.action }}</el-descriptions-item>
        <el-descriptions-item label="请求方法">{{ currentLog?.method }}</el-descriptions-item>
        <el-descriptions-item label="请求路径">{{ currentLog?.path }}</el-descriptions-item>
        <el-descriptions-item label="IP地址">{{ currentLog?.ip }}</el-descriptions-item>
        <el-descriptions-item label="User Agent" :span="2">
          {{ currentLog?.userAgent }}
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="currentLog?.status === 'success' ? 'success' : 'danger'">
            {{ currentLog?.status === 'success' ? '成功' : '失败' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="耗时">{{ currentLog?.duration }}ms</el-descriptions-item>
        <el-descriptions-item label="操作时间" :span="2">
          {{ formatDateTime(currentLog?.createdAt) }}
        </el-descriptions-item>
        <el-descriptions-item v-if="currentLog?.params" label="请求参数" :span="2">
          <pre>{{ JSON.stringify(currentLog.params, null, 2) }}</pre>
        </el-descriptions-item>
        <el-descriptions-item v-if="currentLog?.errorMessage" label="错误信息" :span="2">
          <el-text type="danger">{{ currentLog.errorMessage }}</el-text>
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { SystemAPI } from '@/api/modules/system'
import type { OperationLog, LogStatus } from '@/types/system'
import { formatDateTime } from '@/utils/format'

const loading = ref(false)
const detailDialogVisible = ref(false)

const searchForm = reactive({
  adminName: '',
  module: '',
  status: ''
})

const dateRange = ref<[string, string]>()

const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})

const logList = ref<OperationLog[]>([])
const currentLog = ref<OperationLog | null>(null)

const fetchLogList = async () => {
  try {
    loading.value = true
    const response = await SystemAPI.getOperationLogs({
      page: pagination.page,
      pageSize: pagination.pageSize,
      module: searchForm.module || undefined,
      status: searchForm.status as LogStatus || undefined,
      startDate: dateRange.value?.[0],
      endDate: dateRange.value?.[1]
    })
    logList.value = response.list
    pagination.total = response.total
  } catch (error: any) {
    ElMessage.error(error.message || '获取操作日志失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.page = 1
  fetchLogList()
}

const handleReset = () => {
  searchForm.adminName = ''
  searchForm.module = ''
  searchForm.status = ''
  dateRange.value = undefined
  handleSearch()
}

const handleExport = async () => {
  try {
    const blob = await SystemAPI.exportOperationLogs({
      page: 1,
      pageSize: 10000,
      module: searchForm.module || undefined,
      status: searchForm.status as LogStatus || undefined,
      startDate: dateRange.value?.[0],
      endDate: dateRange.value?.[1]
    })
    
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `operation-logs-${Date.now()}.xlsx`
    link.click()
    setTimeout(() => window.URL.revokeObjectURL(url), 500)
    
    ElMessage.success('导出成功')
  } catch (error: any) {
    ElMessage.error(error.message || '导出失败')
  }
}

const handleViewDetail = async (row: OperationLog) => {
  try {
    currentLog.value = await SystemAPI.getOperationLogDetail(row.id)
    detailDialogVisible.value = true
  } catch (error: any) {
    ElMessage.error(error.message || '获取日志详情失败')
  }
}

onMounted(() => {
  fetchLogList()
})
</script>

<style scoped lang="scss">
.operation-logs {
  .search-form {
    margin-bottom: 20px;
  }

  .el-pagination {
    margin-top: 20px;
    justify-content: flex-end;
  }

  pre {
    background-color: var(--el-fill-color-light);
    padding: 12px;
    border-radius: 4px;
    overflow-x: auto;
  }
}
</style>
