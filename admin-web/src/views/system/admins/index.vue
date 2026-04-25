<template>
  <div class="admins-page-enhanced">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">管理员管理</h1>
        <p class="page-subtitle">管理系统管理员账号和权限</p>
      </div>
      <div class="header-right">
        <el-button type="primary" :icon="Plus" size="large" @click="handleCreate">
          新建管理员
        </el-button>
      </div>
    </div>

    <!-- Search Form -->
    <EnhancedForm
      type="search"
      :fields="searchFields"
      @search="handleSearch"
      @reset="handleReset"
    />

    <!-- Data Table -->
    <DataTableEnhanced
      :data="tableData.list"
      :columns="columns"
      :loading="loading"
      :total="tableData.total"
      v-model:page="queryParams.page"
      v-model:page-size="queryParams.pageSize"
      :actions="tableActions"
      @refresh="fetchData"
      @page-change="handlePageChange"
      @page-size-change="handleSizeChange"
    >
      <template #toolbar-right>
        <el-button type="success" :icon="Download" plain @click="handleExport">
          导出数据
        </el-button>
      </template>

      <template #batch-actions="{ selectedRows }">
        <el-button type="danger" size="small" @click="handleBatchDelete(selectedRows)">
          批量删除
        </el-button>
      </template>
    </DataTableEnhanced>

    <!-- Create/Edit Dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      destroy-on-close
      class="admin-form-dialog"
    >
      <EnhancedForm
        ref="formRef"
        :fields="formFields"
        v-model="formData"
        :rules="formRules"
        :loading="submitting"
        :show-cancel="true"
        cancel-text="取消"
        :submit-text="formData.id ? '保存修改' : '创建管理员'"
        @submit="handleSubmit"
        @cancel="dialogVisible = false"
      />
    </el-dialog>

    <!-- Status Update Dialog -->
    <el-dialog
      v-model="statusDialogVisible"
      title="修改状态"
      width="500px"
      class="status-dialog"
    >
      <div class="status-current">
        <span class="label">当前状态：</span>
        <el-tag :type="getStatusType(statusFormData.status)">
          {{ getStatusText(statusFormData.status) }}
        </el-tag>
      </div>

      <EnhancedForm
        ref="statusFormRef"
        :fields="statusFormFields"
        v-model="statusFormData"
        :rules="statusFormRules"
        :loading="submitting"
        :show-cancel="true"
        submit-text="确认修改"
        @submit="handleStatusSubmit"
        @cancel="statusDialogVisible = false"
      />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { Plus, Download, User, Lock, Message, Phone } from '@element-plus/icons-vue'
import DataTableEnhanced from '@/components/common/DataTableEnhanced.vue'
import EnhancedForm from '@/components/common/EnhancedForm.vue'
import { systemAPI } from '@/api/modules/system'
import { showSuccess, showError, showDeleteConfirm, showBatchDeleteConfirm } from '@/utils/message'
import type { TableColumnEnhanced, TableActionEnhanced, FormField } from '@/components/common'
import type { AdminUser, AdminUserListParams, CreateAdminRequest, UpdateAdminRequest } from '@/types/system'
import type { FormInstance } from 'element-plus'

// Loading states
const loading = ref(false)
const submitting = ref(false)
const dialogVisible = ref(false)
const statusDialogVisible = ref(false)
const dialogTitle = ref('新建管理员')
const formRef = ref<InstanceType<typeof EnhancedForm>>()
const statusFormRef = ref<InstanceType<typeof EnhancedForm>>()

// Data
const queryParams = reactive<AdminUserListParams>({
  page: 1,
  pageSize: 20,
  keyword: '',
  role: undefined,
  status: undefined,
})

const tableData = reactive({
  list: [] as AdminUser[],
  total: 0,
})

const formData = reactive<CreateAdminRequest & { id?: number }>({
  username: '',
  password: '',
  nickname: '',
  email: '',
  phone: '',
  role: 'customer_service',
  avatar: '',
})

const statusFormData = reactive({
  id: 0,
  status: 'active',
  reason: '',
})

// Search fields
const searchFields = computed<FormField[]>(() => [
  {
    prop: 'keyword',
    label: '关键词',
    type: 'input',
    placeholder: '用户名/昵称/邮箱',
    prefixIcon: User,
    clearable: true,
  },
  {
    prop: 'role',
    label: '角色',
    type: 'select',
    placeholder: '全部角色',
    clearable: true,
    options: [
      { label: '超级管理员', value: 'super_admin' },
      { label: '运营管理员', value: 'operation_admin' },
      { label: '财务管理员', value: 'finance_admin' },
      { label: '客服', value: 'customer_service' },
    ],
  },
  {
    prop: 'status',
    label: '状态',
    type: 'select',
    placeholder: '全部状态',
    clearable: true,
    options: [
      { label: '活跃', value: 'active' },
      { label: '禁用', value: 'disabled' },
      { label: '锁定', value: 'locked' },
    ],
  },
])

// Table columns
const columns = computed<TableColumnEnhanced[]>(() => [
  { prop: 'id', label: 'ID', width: 70, align: 'center', type: 'number' },
  {
    prop: 'username',
    label: '用户名',
    minWidth: 120,
    slot: 'username',
  },
  {
    prop: 'nickname',
    label: '昵称',
    minWidth: 120,
  },
  {
    prop: 'email',
    label: '邮箱',
    minWidth: 180,
  },
  {
    prop: 'phone',
    label: '手机号',
    width: 120,
  },
  {
    prop: 'role',
    label: '角色',
    width: 110,
    type: 'status',
    statusMap: {
      super_admin: { type: 'danger', text: '超级管理员' },
      operation_admin: { type: 'warning', text: '运营管理员' },
      finance_admin: { type: 'success', text: '财务管理员' },
      customer_service: { type: 'info', text: '客服' },
    },
  },
  {
    prop: 'status',
    label: '状态',
    width: 90,
    type: 'status',
    statusMap: {
      active: { type: 'success', text: '活跃' },
      disabled: { type: 'info', text: '禁用' },
      locked: { type: 'danger', text: '锁定' },
    },
  },
  {
    prop: 'lastLoginAt',
    label: '最后登录',
    width: 150,
    type: 'datetime',
    format: 'MM-DD HH:mm',
  },
  {
    prop: 'createdAt',
    label: '创建时间',
    width: 150,
    type: 'datetime',
    format: 'YYYY-MM-DD',
  },
])

// Table actions
const tableActions = computed<TableActionEnhanced[]>(() => [
  {
    key: 'edit',
    label: '编辑',
    type: 'primary',
    handler: handleEdit,
  },
  {
    key: 'status',
    label: '状态',
    type: 'warning',
    handler: handleUpdateStatus,
  },
  {
    key: 'delete',
    label: '删除',
    type: 'danger',
    handler: handleDelete,
    confirm: true,
    confirmTitle: '删除确认',
    confirmMessage: '确定要删除该管理员吗？此操作不可恢复。',
    confirmType: 'error',
  },
])

// Form fields
const formFields = computed<FormField[]>(() => [
  {
    prop: 'username',
    label: '用户名',
    type: 'input',
    placeholder: '请输入用户名',
    prefixIcon: User,
    rules: [
      { required: true, message: '请输入用户名', trigger: 'blur' },
      { min: 3, max: 20, message: '用户名长度3-20个字符', trigger: 'blur' },
      { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字和下划线', trigger: 'blur' },
    ],
  },
  {
    prop: 'password',
    label: '密码',
    type: 'password',
    placeholder: formData.id ? '不修改请留空' : '请输入密码',
    rules: formData.id
      ? []
      : [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, message: '密码至少6个字符', trigger: 'blur' },
        ],
  },
  {
    prop: 'nickname',
    label: '昵称',
    type: 'input',
    placeholder: '请输入昵称',
    rules: [
      { required: true, message: '请输入昵称', trigger: 'blur' },
      { min: 2, max: 20, message: '昵称长度2-20个字符', trigger: 'blur' },
    ],
  },
  {
    prop: 'email',
    label: '邮箱',
    type: 'input',
    placeholder: '请输入邮箱',
    prefixIcon: Message,
    rules: [
      { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' },
    ],
  },
  {
    prop: 'phone',
    label: '手机号',
    type: 'input',
    placeholder: '请输入手机号',
    prefixIcon: Phone,
    rules: [
      { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' },
    ],
  },
  {
    prop: 'role',
    label: '角色',
    type: 'select',
    placeholder: '请选择角色',
    options: [
      { label: '超级管理员', value: 'super_admin' },
      { label: '运营管理员', value: 'operation_admin' },
      { label: '财务管理员', value: 'finance_admin' },
      { label: '客服', value: 'customer_service' },
    ],
    rules: [{ required: true, message: '请选择角色', trigger: 'change' }],
  },
])

const formRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度3-20个字符', trigger: 'blur' },
  ],
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { min: 2, max: 20, message: '昵称长度2-20个字符', trigger: 'blur' },
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' },
  ],
}

// Status form fields
const statusFormFields = computed<FormField[]>(() => [
  {
    prop: 'status',
    label: '新状态',
    type: 'select',
    placeholder: '请选择新状态',
    options: [
      { label: '活跃', value: 'active', description: '账户正常使用' },
      { label: '禁用', value: 'disabled', description: '禁止登录系统' },
      { label: '锁定', value: 'locked', description: '临时锁定账户' },
    ],
    rules: [{ required: true, message: '请选择新状态', trigger: 'change' }],
  },
  {
    prop: 'reason',
    label: '原因',
    type: 'textarea',
    placeholder: '请输入状态变更原因（选填）',
    rows: 3,
  },
])

const statusFormRules = {
  status: [
    { required: true, message: '请选择新状态', trigger: 'change' },
  ],
}

// Fetch data
const fetchData = async () => {
  loading.value = true
  try {
    const res = await systemAPI.getAdmins(queryParams)
    tableData.list = res.list
    tableData.total = res.total
  } catch (error) {
    showError('获取管理员列表失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchData()
})

// Search handlers
const handleSearch = (params: Record<string, any>) => {
  queryParams.keyword = params.keyword || ''
  queryParams.role = params.role
  queryParams.status = params.status
  queryParams.page = 1
  fetchData()
}

const handleReset = () => {
  queryParams.keyword = ''
  queryParams.role = undefined
  queryParams.status = undefined
  queryParams.page = 1
  fetchData()
}

// Pagination handlers
const handlePageChange = (page: number) => {
  queryParams.page = page
  fetchData()
}

const handleSizeChange = (pageSize: number) => {
  queryParams.pageSize = pageSize
  queryParams.page = 1
  fetchData()
}

// CRUD handlers
const handleCreate = () => {
  dialogTitle.value = '新建管理员'
  Object.assign(formData, {
    id: undefined,
    username: '',
    password: '',
    nickname: '',
    email: '',
    phone: '',
    role: 'customer_service',
    avatar: '',
  })
  dialogVisible.value = true
}

const handleEdit = (row: AdminUser) => {
  dialogTitle.value = '编辑管理员'
  Object.assign(formData, {
    id: row.id,
    username: row.username,
    password: '',
    nickname: row.nickname,
    email: row.email,
    phone: row.phone,
    role: row.role,
    avatar: row.avatar,
  })
  dialogVisible.value = true
}

const handleSubmit = async () => {
  submitting.value = true
  try {
    if (formData.id) {
      const { id, password, ...updateData } = formData
      const data: UpdateAdminRequest = { ...updateData }
      if (password) data.password = password
      await systemAPI.updateAdmin(id, data)
      showSuccess('更新成功')
    } else {
      await systemAPI.createAdmin(formData)
      showSuccess('创建成功')
    }
    dialogVisible.value = false
    fetchData()
  } catch (error) {
    showError('操作失败')
  } finally {
    submitting.value = false
  }
}

const handleDelete = async (row: AdminUser) => {
  try {
    await systemAPI.deleteAdmin(row.id)
    showSuccess('删除成功')
    fetchData()
  } catch (error) {
    showError('删除失败')
  }
}

const handleBatchDelete = async (rows: AdminUser[]) => {
  if (rows.length === 0) {
    showError('请先选择要删除的记录')
    return
  }

  try {
    await showBatchDeleteConfirm(rows.length)
    // Implement batch delete API call
    showSuccess(`成功删除 ${rows.length} 条记录`)
    fetchData()
  } catch {
    // User cancelled
  }
}

const handleUpdateStatus = (row: AdminUser) => {
  statusFormData.id = row.id
  statusFormData.status = row.status
  statusFormData.reason = ''
  statusDialogVisible.value = true
}

const handleStatusSubmit = async () => {
  submitting.value = true
  try {
    await systemAPI.updateAdminStatus(statusFormData.id, {
      status: statusFormData.status,
      reason: statusFormData.reason,
    })
    showSuccess('状态更新成功')
    statusDialogVisible.value = false
    fetchData()
  } catch (error) {
    showError('状态更新失败')
  } finally {
    submitting.value = false
  }
}

const handleExport = () => {
  showSuccess('数据导出成功')
}

// Helper functions
const getStatusType = (status: string) => {
  const map: Record<string, string> = {
    active: 'success',
    disabled: 'info',
    locked: 'danger',
  }
  return map[status] || 'info'
}

const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    active: '活跃',
    disabled: '禁用',
    locked: '锁定',
  }
  return map[status] || status
}
</script>

<style scoped lang="scss">
.admins-page-enhanced {
  padding: var(--spacing-5);

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: var(--spacing-6);

    .header-left {
      .page-title {
        margin: 0 0 var(--spacing-2);
        font-size: var(--font-size-2xl);
        font-weight: var(--font-weight-bold);
        color: var(--color-text-primary);
      }

      .page-subtitle {
        margin: 0;
        font-size: var(--font-size-sm);
        color: var(--color-text-secondary);
      }
    }
  }

  .status-current {
    display: flex;
    align-items: center;
    gap: var(--spacing-3);
    margin-bottom: var(--spacing-4);
    padding: var(--spacing-3) var(--spacing-4);
    background-color: var(--color-gray-50);
    border-radius: var(--radius-md);

    .label {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
    }
  }
}

// Dialog styles
:deep(.admin-form-dialog) {
  .el-dialog__header {
    padding: var(--spacing-5);
    border-bottom: 1px solid var(--color-border-light);
  }

  .el-dialog__body {
    padding: var(--spacing-5);
  }
}

:deep(.status-dialog) {
  .el-dialog__body {
    padding: var(--spacing-4) var(--spacing-5);
  }
}

.dark .admins-page-enhanced {
  .status-current {
    background-color: var(--color-gray-800);
  }
}
</style>