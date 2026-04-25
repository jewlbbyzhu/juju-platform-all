<template>
  <div class="admin-management">
    <!-- Search and filters -->
    <el-form :inline="true" :model="searchForm" class="search-form">
      <el-form-item label="关键词">
        <el-input
          v-model="searchForm.keyword"
          placeholder="用户名/昵称/邮箱"
          clearable
          @clear="handleSearch"
        />
      </el-form-item>
      <el-form-item label="角色">
        <el-select v-model="searchForm.role" placeholder="全部" clearable>
          <el-option label="超级管理员" value="super_admin" />
          <el-option label="运营管理员" value="operation_admin" />
          <el-option label="财务管理员" value="finance_admin" />
          <el-option label="客服" value="customer_service" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="searchForm.status" placeholder="全部" clearable>
          <el-option label="正常" value="active" />
          <el-option label="禁用" value="disabled" />
          <el-option label="锁定" value="locked" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="handleReset">重置</el-button>
        <el-button type="success" @click="handleCreate">新建管理员</el-button>
      </el-form-item>
    </el-form>

    <!-- Admin list table -->
    <el-table
      v-loading="loading"
      :data="adminList"
      stripe
      style="width: 100%"
    >
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column label="管理员信息" min-width="200">
        <template #default="{ row }">
          <div class="admin-info">
            <el-avatar :src="row.avatar" :size="40">
              {{ row.nickname.charAt(0) }}
            </el-avatar>
            <div class="info-text">
              <div class="nickname">{{ row.nickname }}</div>
              <div class="username">@{{ row.username }}</div>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="角色" width="120">
        <template #default="{ row }">
          <el-tag :type="getRoleTagType(row.role)">
            {{ getRoleLabel(row.role) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="email" label="邮箱" min-width="180" />
      <el-table-column prop="phone" label="手机号" width="120" />
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="getStatusTagType(row.status)">
            {{ getStatusLabel(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="lastLoginAt" label="最后登录" width="160">
        <template #default="{ row }">
          {{ formatDateTime(row.lastLoginAt) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="240" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click="handleEdit(row)">
            编辑
          </el-button>
          <el-button
            v-if="row.status === 'active'"
            link
            type="warning"
            size="small"
            @click="handleDisable(row)"
          >
            禁用
          </el-button>
          <el-button
            v-else
            link
            type="success"
            size="small"
            @click="handleEnable(row)"
          >
            启用
          </el-button>
          <el-button link type="info" size="small" @click="handleResetPassword(row)">
            重置密码
          </el-button>
          <el-button link type="danger" size="small" @click="handleDelete(row)">
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
      @size-change="handleSearch"
      @current-change="handleSearch"
    />

    <!-- Create/Edit dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      @close="handleDialogClose"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" :disabled="isEdit" />
        </el-form-item>
        <el-form-item v-if="!isEdit" label="密码" prop="password">
          <el-input v-model="form.password" type="password" show-password />
        </el-form-item>
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="form.nickname" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="form.role" style="width: 100%">
            <el-option label="超级管理员" value="super_admin" />
            <el-option label="运营管理员" value="operation_admin" />
            <el-option label="财务管理员" value="finance_admin" />
            <el-option label="客服" value="customer_service" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { SystemAPI } from '@/api/modules/system'
import type { AdminUser, AdminRole, AdminStatus } from '@/types/system'
import { formatDateTime } from '@/utils/format'

const loading = ref(false)
const submitting = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref<FormInstance>()

const searchForm = reactive({
  keyword: '',
  role: '',
  status: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})

const adminList = ref<AdminUser[]>([])

const form = reactive({
  id: 0,
  username: '',
  password: '',
  nickname: '',
  email: '',
  phone: '',
  role: 'operation_admin' as AdminRole
})

const formRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度为3-20个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度为6-20个字符', trigger: 'blur' }
  ],
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ]
}

const dialogTitle = computed(() => isEdit.value ? '编辑管理员' : '新建管理员')

const getRoleLabel = (role: string) => {
  const roleMap: Record<string, string> = {
    super_admin: '超级管理员',
    operation_admin: '运营管理员',
    finance_admin: '财务管理员',
    customer_service: '客服'
  }
  return roleMap[role] || role
}

const getRoleTagType = (role: string) => {
  const typeMap: Record<string, any> = {
    super_admin: 'danger',
    operation_admin: 'primary',
    finance_admin: 'warning',
    customer_service: 'success'
  }
  return typeMap[role] || 'info'
}

const getStatusLabel = (status: string) => {
  const statusMap: Record<string, string> = {
    active: '正常',
    disabled: '禁用',
    locked: '锁定'
  }
  return statusMap[status] || status
}

const getStatusTagType = (status: string) => {
  const typeMap: Record<string, any> = {
    active: 'success',
    disabled: 'info',
    locked: 'danger'
  }
  return typeMap[status] || 'info'
}

const fetchAdminList = async () => {
  try {
    loading.value = true
    const response = await SystemAPI.getAdminList({
      page: pagination.page,
      pageSize: pagination.pageSize,
      keyword: searchForm.keyword || undefined,
      role: searchForm.role as AdminRole || undefined,
      status: searchForm.status as AdminStatus || undefined
    })
    adminList.value = response.list
    pagination.total = response.total
  } catch (error: any) {
    ElMessage.error(error.message || '获取管理员列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.page = 1
  fetchAdminList()
}

const handleReset = () => {
  searchForm.keyword = ''
  searchForm.role = ''
  searchForm.status = ''
  handleSearch()
}

const handleCreate = () => {
  isEdit.value = false
  dialogVisible.value = true
}

const handleEdit = (row: AdminUser) => {
  isEdit.value = true
  form.id = row.id
  form.username = row.username
  form.nickname = row.nickname
  form.email = row.email || ''
  form.phone = row.phone || ''
  form.role = row.role
  dialogVisible.value = true
}

const handleDisable = async (row: AdminUser) => {
  try {
    await ElMessageBox.confirm('确定要禁用该管理员吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await SystemAPI.disableAdmin(row.id)
    ElMessage.success('禁用成功')
    fetchAdminList()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '禁用失败')
    }
  }
}

const handleEnable = async (row: AdminUser) => {
  try {
    await SystemAPI.enableAdmin(row.id)
    ElMessage.success('启用成功')
    fetchAdminList()
  } catch (error: any) {
    ElMessage.error(error.message || '启用失败')
  }
}

const handleResetPassword = async (row: AdminUser) => {
  try {
    const { value } = await ElMessageBox.prompt('请输入新密码', '重置密码', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputPattern: /^.{6,20}$/,
      inputErrorMessage: '密码长度为6-20个字符'
    })
    await SystemAPI.resetAdminPassword(row.id, value)
    ElMessage.success('密码重置成功')
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '密码重置失败')
    }
  }
}

const handleDelete = async (row: AdminUser) => {
  try {
    await ElMessageBox.confirm('确定要删除该管理员吗？此操作不可恢复！', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'error'
    })
    await SystemAPI.deleteAdmin(row.id)
    ElMessage.success('删除成功')
    fetchAdminList()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    submitting.value = true

    if (isEdit.value) {
      await SystemAPI.updateAdmin(form.id, {
        nickname: form.nickname,
        email: form.email || undefined,
        phone: form.phone || undefined,
        role: form.role
      })
      ElMessage.success('更新成功')
    } else {
      await SystemAPI.createAdmin({
        username: form.username,
        password: form.password,
        nickname: form.nickname,
        email: form.email || undefined,
        phone: form.phone || undefined,
        role: form.role
      })
      ElMessage.success('创建成功')
    }

    dialogVisible.value = false
    fetchAdminList()
  } catch (error: any) {
    ElMessage.error(error.message || '操作失败')
  } finally {
    submitting.value = false
  }
}

const handleDialogClose = () => {
  formRef.value?.resetFields()
  form.id = 0
  form.username = ''
  form.password = ''
  form.nickname = ''
  form.email = ''
  form.phone = ''
  form.role = 'operation_admin'
}

onMounted(() => {
  fetchAdminList()
})
</script>

<style scoped lang="scss">
.admin-management {
  .search-form {
    margin-bottom: 20px;
  }

  .admin-info {
    display: flex;
    align-items: center;
    gap: 12px;

    .info-text {
      .nickname {
        font-weight: 500;
        margin-bottom: 4px;
      }

      .username {
        font-size: 12px;
        color: var(--el-text-color-secondary);
      }
    }
  }

  .el-pagination {
    margin-top: 20px;
    justify-content: flex-end;
  }
}
</style>
