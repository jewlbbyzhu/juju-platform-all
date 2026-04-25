<template>
  <div class="permission-management">
    <el-alert
      title="权限管理"
      type="info"
      description="管理系统权限，包括菜单、按钮和API权限"
      :closable="false"
      style="margin-bottom: 20px"
    />
    
    <el-button type="primary" @click="handleCreate" style="margin-bottom: 20px">
      新建权限
    </el-button>

    <el-table v-loading="loading" :data="permissionList" stripe row-key="id" default-expand-all>
      <el-table-column prop="name" label="权限名称" min-width="200" />
      <el-table-column prop="code" label="权限代码" min-width="150" />
      <el-table-column label="类型" width="100">
        <template #default="{ row }">
          <el-tag :type="getTypeTagType(row.type)">
            {{ getTypeLabel(row.type) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="path" label="路径" min-width="150" />
      <el-table-column prop="sort" label="排序" width="80" />
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 'active' ? 'success' : 'info'">
            {{ row.status === 'active' ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click="handleEdit(row)">
            编辑
          </el-button>
          <el-button link type="danger" size="small" @click="handleDelete(row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- Create/Edit dialog -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px">
      <el-form ref="formRef" :model="form" :rules="formRules" label-width="100px">
        <el-form-item label="权限名称" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="权限代码" prop="code">
          <el-input v-model="form.code" />
        </el-form-item>
        <el-form-item label="权限类型" prop="type">
          <el-select v-model="form.type" style="width: 100%">
            <el-option label="菜单" value="menu" />
            <el-option label="按钮" value="button" />
            <el-option label="接口" value="api" />
          </el-select>
        </el-form-item>
        <el-form-item label="路径" prop="path">
          <el-input v-model="form.path" />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="form.sort" :min="0" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="3" />
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
import type { Permission, PermissionType } from '@/types/system'

const loading = ref(false)
const submitting = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref<FormInstance>()

const permissionList = ref<Permission[]>([])

const form = reactive({
  id: 0,
  name: '',
  code: '',
  type: 'menu' as PermissionType,
  path: '',
  sort: 0,
  description: ''
})

const formRules: FormRules = {
  name: [{ required: true, message: '请输入权限名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入权限代码', trigger: 'blur' }],
  type: [{ required: true, message: '请选择权限类型', trigger: 'change' }]
}

const dialogTitle = computed(() => isEdit.value ? '编辑权限' : '新建权限')

const getTypeLabel = (type: string) => {
  const labelMap: Record<string, string> = {
    menu: '菜单',
    button: '按钮',
    api: '接口'
  }
  return labelMap[type] || type
}

const getTypeTagType = (type: string) => {
  const typeMap: Record<string, any> = {
    menu: 'primary',
    button: 'success',
    api: 'warning'
  }
  return typeMap[type] || 'info'
}

const fetchPermissionList = async () => {
  try {
    loading.value = true
    permissionList.value = await SystemAPI.getPermissionList()
  } catch (error: any) {
    ElMessage.error(error.message || '获取权限列表失败')
  } finally {
    loading.value = false
  }
}

const handleCreate = () => {
  isEdit.value = false
  dialogVisible.value = true
}

const handleEdit = (row: Permission) => {
  isEdit.value = true
  form.id = row.id
  form.name = row.name
  form.code = row.code
  form.type = row.type
  form.path = row.path || ''
  form.sort = row.sort
  form.description = row.description || ''
  dialogVisible.value = true
}

const handleDelete = async (row: Permission) => {
  try {
    await ElMessageBox.confirm('确定要删除该权限吗？', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'error'
    })
    await SystemAPI.deletePermission(row.id)
    ElMessage.success('删除成功')
    fetchPermissionList()
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
      await SystemAPI.updatePermission(form.id, {
        name: form.name,
        code: form.code,
        type: form.type,
        path: form.path || undefined,
        sort: form.sort,
        description: form.description
      })
      ElMessage.success('更新成功')
    } else {
      await SystemAPI.createPermission({
        name: form.name,
        code: form.code,
        type: form.type,
        path: form.path || undefined,
        sort: form.sort,
        description: form.description
      })
      ElMessage.success('创建成功')
    }

    dialogVisible.value = false
    fetchPermissionList()
  } catch (error: any) {
    ElMessage.error(error.message || '操作失败')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  fetchPermissionList()
})
</script>

<style scoped lang="scss">
.permission-management {
  // Styles
}
</style>
