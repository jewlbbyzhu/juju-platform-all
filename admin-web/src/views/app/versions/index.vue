<template>
  <div class="versions-page">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <h2>应用版本管理</h2>
          <el-button type="primary" :icon="Plus" @click="handleCreate">
            新建版本
          </el-button>
        </div>
      </template>

      <el-form :inline="true" :model="queryParams" @submit.prevent="handleSearch">
        <el-form-item label="平台">
          <el-select v-model="queryParams.platform" placeholder="全部" clearable>
            <el-option label="Android" value="android" />
            <el-option label="iOS" value="ios" />
            <el-option label="通用" value="both" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="全部" clearable>
            <el-option label="草稿" value="draft" />
            <el-option label="已发布" value="published" />
            <el-option label="已归档" value="archived" />
          </el-select>
        </el-form-item>
        <el-form-item label="更新类型">
          <el-select v-model="queryParams.updateType" placeholder="全部" clearable>
            <el-option label="强制更新" value="force" />
            <el-option label="推荐更新" value="recommend" />
            <el-option label="可选更新" value="optional" />
          </el-select>
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

      <el-table :data="tableData.list" :loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="versionName" label="版本名称" width="120" />
        <el-table-column prop="versionCode" label="版本号" width="100" />
        <el-table-column prop="platform" label="平台" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.platform === 'android'" type="success">Android</el-tag>
            <el-tag v-else-if="row.platform === 'ios'" type="primary">iOS</el-tag>
            <el-tag v-else type="info">通用</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="updateType" label="更新类型" width="120">
          <template #default="{ row }">
            <el-tag v-if="row.updateType === 'force'" type="danger">强制更新</el-tag>
            <el-tag v-else-if="row.updateType === 'recommend'" type="warning">推荐更新</el-tag>
            <el-tag v-else type="info">可选更新</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="fileSize" label="文件大小" width="120">
          <template #default="{ row }">
            {{ formatFileSize(row.fileSize) }}
          </template>
        </el-table-column>
        <el-table-column prop="downloadCount" label="下载次数" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.status === 'draft'" type="info">草稿</el-tag>
            <el-tag v-else-if="row.status === 'published'" type="success">已发布</el-tag>
            <el-tag v-else-if="row.status === 'archived'" type="warning">已归档</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="publishedAt" label="发布时间" width="160" />
        <el-table-column prop="createdAt" label="创建时间" width="160" />
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" link @click="handleEdit(row)">
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
            <el-button type="danger" size="small" link @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="tableData.page"
        v-model:page-size="tableData.pageSize"
        :total="tableData.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />
    </el-card>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="700px" @close="handleDialogClose">
      <el-form :model="formData" :rules="rules" ref="formRef" label-width="120px">
        <el-form-item label="版本名称" prop="versionName">
          <el-input v-model="formData.versionName" placeholder="例如：1.0.0" />
        </el-form-item>
        <el-form-item label="版本号" prop="versionCode">
          <el-input-number v-model="formData.versionCode" :min="1" :step="1" placeholder="例如：100" />
        </el-form-item>
        <el-form-item label="平台" prop="platform">
          <el-select v-model="formData.platform" placeholder="请选择平台">
            <el-option label="Android" value="android" />
            <el-option label="iOS" value="ios" />
            <el-option label="通用" value="both" />
          </el-select>
        </el-form-item>
        <el-form-item label="更新类型" prop="updateType">
          <el-select v-model="formData.updateType" placeholder="请选择更新类型">
            <el-option label="强制更新" value="force" />
            <el-option label="推荐更新" value="recommend" />
            <el-option label="可选更新" value="optional" />
          </el-select>
        </el-form-item>
        <el-form-item label="最低支持版本" prop="minSupportVersion">
          <el-input v-model="formData.minSupportVersion" placeholder="例如：0.9.0" />
        </el-form-item>
        <el-form-item label="应用文件" prop="fileUrl" required>
          <el-upload
            :action="uploadUrl"
            :on-success="handleUploadSuccess"
            :before-upload="beforeUpload"
            :show-file-list="false"
            accept=".apk,.ipa"
          >
            <el-button size="small">选择文件</el-button>
            <template #tip>
              <div class="el-upload__tip">支持 .apk 或 .ipa 文件，文件大小不超过 100MB</div>
            </template>
          </el-upload>
          <div v-if="formData.fileUrl" class="file-info">
            <el-link :href="formData.fileUrl" target="_blank" type="primary">
              {{ formData.fileName }}
            </el-link>
            <el-button type="danger" size="small" link @click="handleRemoveFile">
              删除
            </el-button>
          </div>
        </el-form-item>
        <el-form-item label="更新内容" prop="updateContent">
          <el-input v-model="formData.updateContent" type="textarea" :rows="6" placeholder="请输入更新内容" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="formData.status">
            <el-option label="草稿" value="draft" />
            <el-option label="已发布" value="published" />
            <el-option label="已归档" value="archived" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="handleDialogClose">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, Refresh } from '@element-plus/icons-vue'
import { appAPI } from '@/api/modules/app'
import type { AppVersion, AppVersionListParams } from '@/types/app'

const loading = ref(false)
const submitting = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('新建版本')
const formRef = ref()

const queryParams = reactive<AppVersionListParams>({
  page: 1,
  pageSize: 20,
  platform: undefined,
  status: undefined,
  updateType: undefined
})

const tableData = reactive({
  list: [] as AppVersion[],
  total: 0,
  page: 1,
  pageSize: 20
})

const formData = reactive<AppVersion & { id?: number }>({
  versionName: '',
  versionCode: 1,
  platform: 'both',
  fileUrl: '',
  fileSize: 0,
  fileName: '',
  updateType: 'optional',
  updateContent: '',
  minSupportVersion: '',
  status: 'draft'
})

const rules = {
  versionName: [{ required: true, message: '请输入版本名称', trigger: 'blur' }],
  versionCode: [{ required: true, message: '请输入版本号', trigger: 'blur' }],
  platform: [{ required: true, message: '请选择平台', trigger: 'change' }],
  updateType: [{ required: true, message: '请选择更新类型', trigger: 'change' }],
  fileUrl: [{ required: true, message: '请上传应用文件', trigger: 'change' }],
  updateContent: [{ required: true, message: '请输入更新内容', trigger: 'blur' }]
}

const uploadUrl = '/api/v1/upload'

onMounted(() => {
  fetchData()
})

const fetchData = async () => {
  loading.value = true
  try {
    const res = await appAPI.getVersions(queryParams)
    tableData.list = res.list
    tableData.total = res.total
    tableData.page = res.page
    tableData.pageSize = res.pageSize
  } catch (error) {
    ElMessage.error('获取版本列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  queryParams.page = 1
  fetchData()
}

const handleReset = () => {
  queryParams.platform = undefined
  queryParams.status = undefined
  queryParams.updateType = undefined
  handleSearch()
}

const handlePageChange = (page: number) => {
  queryParams.page = page
  fetchData()
}

const handleSizeChange = (pageSize: number) => {
  queryParams.pageSize = pageSize
  queryParams.page = 1
  fetchData()
}

const handleCreate = () => {
  dialogTitle.value = '新建版本'
  Object.assign(formData, {
    versionName: '',
    versionCode: 1,
    platform: 'both',
    fileUrl: '',
    fileSize: 0,
    fileName: '',
    updateType: 'optional',
    updateContent: '',
    minSupportVersion: '',
    status: 'draft'
  })
  delete formData.id
  dialogVisible.value = true
}

const handleEdit = (row: AppVersion) => {
  dialogTitle.value = '编辑版本'
  Object.assign(formData, {
    id: row.id,
    versionName: row.versionName,
    versionCode: row.versionCode,
    platform: row.platform,
    fileUrl: row.fileUrl,
    fileSize: row.fileSize,
    fileName: row.fileName,
    updateType: row.updateType,
    updateContent: row.updateContent,
    minSupportVersion: row.minSupportVersion,
    status: row.status
  })
  dialogVisible.value = true
}

const handlePublish = async (row: AppVersion) => {
  try {
    await ElMessageBox.confirm(`确定要发布版本 "${row.versionName}" 吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await appAPI.publishVersion(row.id)
    ElMessage.success('发布成功')
    fetchData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('发布失败')
    }
  }
}

const handleDelete = async (row: AppVersion) => {
  try {
    await ElMessageBox.confirm(`确定要删除版本 "${row.versionName}" 吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await appAPI.deleteVersion(row.id)
    ElMessage.success('删除成功')
    fetchData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate()

  submitting.value = true
  try {
    if (formData.id) {
      await appAPI.updateVersion(formData.id, formData)
      ElMessage.success('更新成功')
    } else {
      await appAPI.createVersion(formData)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    fetchData()
  } catch (error) {
    ElMessage.error('操作失败')
  } finally {
    submitting.value = false
  }
}

const handleDialogClose = () => {
  dialogVisible.value = false
  formRef.value?.resetFields()
}

const beforeUpload = (file: File) => {
  const isValidType = file.name.endsWith('.apk') || file.name.endsWith('.ipa')
  const isValidSize = file.size / 1024 / 1024 < 100

  if (!isValidType) {
    ElMessage.error('只能上传 .apk 或 .ipa 文件')
    return false
  }
  if (!isValidSize) {
    ElMessage.error('文件大小不能超过 100MB')
    return false
  }
  return true
}

const handleUploadSuccess = (response: any, file: File) => {
  formData.fileUrl = response.url
  formData.fileName = file.name
  formData.fileSize = file.size
  ElMessage.success('文件上传成功')
}

const handleRemoveFile = () => {
  formData.fileUrl = ''
  formData.fileName = ''
  formData.fileSize = 0
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}
</script>

<style scoped>
.versions-page {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.el-pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.file-info {
  margin-top: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.el-upload__tip {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}
</style>
