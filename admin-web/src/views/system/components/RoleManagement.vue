<template>
  <div class="role-management">
    <el-button type="primary" @click="handleCreate" style="margin-bottom: 20px">
      新建角色
    </el-button>

    <el-table v-loading="loading" :data="roleList" stripe>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="角色名称" min-width="150" />
      <el-table-column prop="code" label="角色代码" min-width="150" />
      <el-table-column prop="description" label="描述" min-width="200" />
      <el-table-column label="权限数量" width="100">
        <template #default="{ row }">
          {{ row.permissions.length }}
        </template>
      </el-table-column>
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 'active' ? 'success' : 'info'">
            {{ row.status === 'active' ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="240" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click="handleEdit(row)">
            编辑
          </el-button>
          <el-button link type="warning" size="small" @click="handleConfigPermissions(row)">
            配置权限
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
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="角色代码" prop="code">
          <el-input v-model="form.code" :disabled="isEdit" />
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

    <!-- Permission config dialog -->
    <el-dialog v-model="permissionDialogVisible" title="配置权限" width="800px">
      <RolePermissionManager
        v-if="permissionDialogVisible"
        v-model="selectedPermissions"
        :permissions="permissionTree"
      />
      <template #footer>
        <el-button @click="permissionDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSavePermissions">
          保存
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
import type { Role, PermissionTree } from '@/types/system'
import RolePermissionManager from '@/components/system/RolePermissionManager.vue'

const loading = ref(false)
const submitting = ref(false)
const dialogVisible = ref(false)
const permissionDialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref<FormInstance>()

const roleList = ref<Role[]>([])
const permissionTree = ref<PermissionTree[]>([])
const selectedPermissions = ref<string[]>([])
const currentRole = ref<Role | null>(null)

const form = reactive({
  id: 0,
  name: '',
  code: '',
  description: ''
})

const formRules: FormRules = {
  name: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入角色代码', trigger: 'blur' }]
}

const dialogTitle = computed(() => isEdit.value ? '编辑角色' : '新建角色')

const fetchRoleList = async () => {
  try {
    loading.value = true
    const response = await SystemAPI.getRoleList()
    roleList.value = response.list
  } catch (error: any) {
    ElMessage.error(error.message || '获取角色列表失败')
  } finally {
    loading.value = false
  }
}

const fetchPermissionTree = async () => {
  try {
    permissionTree.value = await SystemAPI.getPermissionTree()
  } catch (error: any) {
    ElMessage.error(error.message || '获取权限树失败')
  }
}

const handleCreate = () => {
  isEdit.value = false
  dialogVisible.value = true
}

const handleEdit = (row: Role) => {
  isEdit.value = true
  form.id = row.id
  form.name = row.name
  form.code = row.code
  form.description = row.description || ''
  dialogVisible.value = true
}

const handleConfigPermissions = (row: Role) => {
  currentRole.value = row
  selectedPermissions.value = [...row.permissions]
  permissionDialogVisible.value = true
}

const handleDelete = async (row: Role) => {
  try {
    await ElMessageBox.confirm('确定要删除该角色吗？', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'error'
    })
    await SystemAPI.deleteRole(row.id)
    ElMessage.success('删除成功')
    fetchRoleList()
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
      await SystemAPI.updateRole(form.id, {
        name: form.name,
        description: form.description
      })
      ElMessage.success('更新成功')
    } else {
      await SystemAPI.createRole({
        name: form.name,
        code: form.code,
        description: form.description,
        permissions: []
      })
      ElMessage.success('创建成功')
    }

    dialogVisible.value = false
    fetchRoleList()
  } catch (error: any) {
    ElMessage.error(error.message || '操作失败')
  } finally {
    submitting.value = false
  }
}

const handleSavePermissions = async () => {
  if (!currentRole.value) return

  try {
    submitting.value = true
    await SystemAPI.assignRolePermissions(currentRole.value.id, selectedPermissions.value)
    ElMessage.success('权限配置成功')
    permissionDialogVisible.value = false
    fetchRoleList()
  } catch (error: any) {
    ElMessage.error(error.message || '权限配置失败')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  fetchRoleList()
  fetchPermissionTree()
})
</script>

<style scoped lang="scss">
.role-management {
  // Styles
}
</style>
