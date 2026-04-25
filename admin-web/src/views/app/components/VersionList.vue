<template>
  <div class="version-list">
    <!-- Search and Filter -->
    <el-form :inline="true" :model="searchForm" class="search-form">
      <el-form-item label="平台">
        <el-select v-model="searchForm.platform" placeholder="全部平台" clearable>
          <el-option label="Android" value="android" />
          <el-option label="iOS" value="ios" />
          <el-option label="双平台" value="both" />
        </el-select>
      </el-form-item>
      
      <el-form-item label="状态">
        <el-select v-model="searchForm.status" placeholder="全部状态" clearable>
          <el-option label="草稿" value="draft" />
          <el-option label="已发布" value="published" />
          <el-option label="已归档" value="archived" />
        </el-select>
      </el-form-item>
      
      <el-form-item label="更新类型">
        <el-select v-model="searchForm.updateType" placeholder="全部类型" clearable>
          <el-option label="强制更新" value="force" />
          <el-option label="推荐更新" value="recommend" />
          <el-option label="可选更新" value="optional" />
        </el-select>
      </el-form-item>
      
      <el-form-item label="关键词">
        <el-input
          v-model="searchForm.keyword"
          placeholder="搜索版本名称或更新说明"
          clearable
          style="width: 200px"
        />
      </el-form-item>
      
      <el-form-item>
        <el-button type="primary" @click="handleSearch">
          <el-icon><Search /></el-icon>
          搜索
        </el-button>
        <el-button @click="handleReset">
          <el-icon><Refresh /></el-icon>
          重置
        </el-button>
      </el-form-item>
    </el-form>

    <!-- Action Buttons -->
    <div class="action-bar">
      <el-button type="primary" @click="handleCreate">
        <el-icon><Plus /></el-icon>
        创建版本
      </el-button>
      <el-button
        type="danger"
        :disabled="selectedIds.length === 0"
        @click="handleBatchDelete"
      >
        <el-icon><Delete /></el-icon>
        批量删除
      </el-button>
    </div>

    <!-- Data Table -->
    <el-table
      v-loading="loading"
      :data="tableData"
      @selection-change="handleSelectionChange"
      stripe
      border
    >
      <el-table-column type="selection" width="55" />
      
      <el-table-column prop="versionName" label="版本名称" width="120" />
      
      <el-table-column prop="versionCode" label="版本号" width="100" />
      
      <el-table-column prop="platform" label="平台" width="100">
        <template #default="{ row }">
          <el-tag :type="getPlatformType(row.platform)">
            {{ getPlatformText(row.platform) }}
          </el-tag>
        </template>
      </el-table-column>
      
      <el-table-column prop="updateType" label="更新类型" width="120">
        <template #default="{ row }">
          <el-tag :type="getUpdateTypeTag(row.updateType)">
            {{ getUpdateTypeText(row.updateType) }}
          </el-tag>
        </template>
      </el-table-column>
      
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)">
            {{ getStatusText(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      
      <el-table-column prop="downloadCount" label="下载次数" width="100" />
      
      <el-table-column prop="fileSize" label="文件大小" width="120">
        <template #default="{ row }">
          {{ formatFileSize(row.fileSize) }}
        </template>
      </el-table-column>
      
      <el-table-column prop="createdAt" label="创建时间" width="180">
        <template #default="{ row }">
          {{ formatDate(row.createdAt) }}
        </template>
      </el-table-column>
      
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button
            type="primary"
            size="small"
            link
            @click="handleView(row)"
          >
            查看
          </el-button>
          <el-button
            v-if="row.status === 'draft'"
            type="primary"
            size="small"
            link
            @click="handleEdit(row)"
          >
            编辑
          </el-button>
          <el-button
            v-if="row.status === 'draft'"
            type="success"
            size="small"
            link
            @click="handlePublish(row)"
          >
            发布
          </el-button>
          <el-button
            type="danger"
            size="small"
            link
            @click="handleDelete(row)"
          >
            删除
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
      @size-change="handleSizeChange"
      @current-change="handlePageChange"
      class="pagination"
    />

    <!-- Version Detail Dialog -->
    <el-dialog
      v-model="detailDialogVisible"
      title="版本详情"
      width="800px"
    >
      <version-status-manager
        v-if="currentVersion"
        :version="currentVersion"
        @refresh="loadData"
        @edit="handleEditFromDetail"
      />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search,
  Refresh,
  Plus,
  Delete
} from '@element-plus/icons-vue'
import VersionStatusManager from '@/components/app/VersionStatusManager.vue'
import { AppAPI } from '@/api'
import type { AppVersion, AppVersionListParams } from '@/types/app'

interface Emits {
  (e: 'create'): void
  (e: 'edit', version: AppVersion): void
}

const emit = defineEmits<Emits>()

const loading = ref(false)
const detailDialogVisible = ref(false)
const currentVersion = ref<AppVersion | null>(null)
const selectedIds = ref<number[]>([])

const searchForm = reactive({
  platform: '',
  status: '',
  updateType: '',
  keyword: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})

const tableData = ref<AppVersion[]>([])

const getPlatformType = (platform: string) => {
  const typeMap = {
    android: 'success',
    ios: 'primary',
    both: 'warning'
  }
  return typeMap[platform as keyof typeof typeMap] as 'success' | 'primary' | 'warning'
}

const getPlatformText = (platform: string) => {
  const textMap = {
    android: 'Android',
    ios: 'iOS',
    both: '双平台'
  }
  return textMap[platform as keyof typeof textMap]
}

const getUpdateTypeTag = (updateType: string) => {
  const typeMap = {
    force: 'danger',
    recommend: 'warning',
    optional: 'info'
  }
  return typeMap[updateType as keyof typeof typeMap] as 'danger' | 'warning' | 'info'
}

const getUpdateTypeText = (updateType: string) => {
  const textMap = {
    force: '强制更新',
    recommend: '推荐更新',
    optional: '可选更新'
  }
  return textMap[updateType as keyof typeof textMap]
}

const getStatusType = (status: string) => {
  const typeMap = {
    draft: 'info',
    published: 'success',
    archived: 'warning'
  }
  return typeMap[status as keyof typeof typeMap] as 'info' | 'success' | 'warning'
}

const getStatusText = (status: string) => {
  const textMap = {
    draft: '草稿',
    published: '已发布',
    archived: '已归档'
  }
  return textMap[status as keyof typeof textMap]
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const loadData = async () => {
  try {
    loading.value = true
    
    const params: AppVersionListParams = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      ...(searchForm.platform && { platform: searchForm.platform as 'android' | 'ios' | 'both' }),
      ...(searchForm.status && { status: searchForm.status as 'draft' | 'published' | 'archived' }),
      ...(searchForm.updateType && { updateType: searchForm.updateType as 'force' | 'recommend' | 'optional' }),
      ...(searchForm.keyword && { keyword: searchForm.keyword })
    }
    
    const response = await AppAPI.getVersions(params)
    tableData.value = response.list
    pagination.total = response.total
  } catch (error) {
    console.error('Load versions error:', error)
    ElMessage.error('加载版本列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.page = 1
  loadData()
}

const handleReset = () => {
  Object.assign(searchForm, {
    platform: '',
    status: '',
    updateType: '',
    keyword: ''
  })
  handleSearch()
}

const handleCreate = () => {
  emit('create')
}

const handleView = (row: AppVersion) => {
  currentVersion.value = row
  detailDialogVisible.value = true
}

const handleEdit = (row: AppVersion) => {
  emit('edit', row)
}

const handleEditFromDetail = () => {
  detailDialogVisible.value = false
  if (currentVersion.value) {
    emit('edit', currentVersion.value)
  }
}

const handlePublish = async (row: AppVersion) => {
  try {
    await ElMessageBox.confirm(
      '发布后，用户将能够下载此版本。确定要发布吗？',
      '确认发布',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'success'
      }
    )

    await AppAPI.publishVersion(row.id)
    ElMessage.success('版本发布成功')
    loadData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Publish version error:', error)
      ElMessage.error('版本发布失败')
    }
  }
}

const handleDelete = async (row: AppVersion) => {
  try {
    await ElMessageBox.confirm(
      '删除后将无法恢复，确定要删除此版本吗？',
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'error'
      }
    )

    await AppAPI.deleteVersion(row.id)
    ElMessage.success('版本删除成功')
    loadData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Delete version error:', error)
      ElMessage.error('版本删除失败')
    }
  }
}

const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedIds.value.length} 个版本吗？`,
      '确认批量删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'error'
      }
    )

    await AppAPI.batchDeleteVersions(selectedIds.value)
    ElMessage.success('批量删除成功')
    selectedIds.value = []
    loadData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Batch delete error:', error)
      ElMessage.error('批量删除失败')
    }
  }
}

const handleSelectionChange = (selection: AppVersion[]) => {
  selectedIds.value = selection.map(item => item.id)
}

const handleSizeChange = () => {
  loadData()
}

const handlePageChange = () => {
  loadData()
}

const refresh = () => {
  loadData()
}

onMounted(() => {
  loadData()
})

defineExpose({
  refresh
})
</script>

<style scoped lang="scss">
.version-list {
  .search-form {
    margin-bottom: 20px;
  }

  .action-bar {
    margin-bottom: 20px;
  }

  .pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>
