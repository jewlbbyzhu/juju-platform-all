<template>
  <div class="batch-permission-operations">
    <el-card shadow="never">
      <template #header>
        <span>批量权限操作</span>
      </template>

      <el-form :model="form" label-width="100px">
        <el-form-item label="操作类型">
          <el-radio-group v-model="form.operationType">
            <el-radio value="add">添加权限</el-radio>
            <el-radio value="remove">移除权限</el-radio>
            <el-radio value="replace">替换权限</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="目标角色">
          <el-select
            v-model="form.targetRoles"
            multiple
            placeholder="请选择角色"
            style="width: 100%"
          >
            <el-option
              v-for="role in roles"
              :key="role.id"
              :label="role.name"
              :value="role.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="权限选择">
          <PermissionTree
            ref="permissionTreeRef"
            :permissions="permissions"
            :checked-permissions="form.selectedPermissions"
            @update:checked-permissions="handlePermissionChange"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :loading="loading" @click="handleSubmit">
            执行批量操作
          </el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <el-alert
        v-if="form.targetRoles.length > 0 && form.selectedPermissions.length > 0"
        :title="getOperationSummary()"
        type="info"
        :closable="false"
        show-icon
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import PermissionTree from './PermissionTree.vue'
import type { Role, PermissionTree as PermissionTreeType } from '@/types/system'
import { SystemAPI } from '@/api/modules/system'

interface Props {
  roles: Role[]
  permissions: PermissionTreeType[]
}

interface Emits {
  (e: 'success'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const permissionTreeRef = ref<InstanceType<typeof PermissionTree>>()
const loading = ref(false)

const form = reactive({
  operationType: 'add' as 'add' | 'remove' | 'replace',
  targetRoles: [] as number[],
  selectedPermissions: [] as string[]
})

const handlePermissionChange = (permissions: string[]) => {
  form.selectedPermissions = permissions
}

const getOperationSummary = () => {
  const roleCount = form.targetRoles.length
  const permissionCount = form.selectedPermissions.length
  const operationText = {
    add: '添加',
    remove: '移除',
    replace: '替换为'
  }[form.operationType]

  return `将对 ${roleCount} 个角色${operationText} ${permissionCount} 个权限`
}

const handleSubmit = async () => {
  if (form.targetRoles.length === 0) {
    ElMessage.warning('请选择目标角色')
    return
  }

  if (form.selectedPermissions.length === 0) {
    ElMessage.warning('请选择权限')
    return
  }

  try {
    await ElMessageBox.confirm(
      getOperationSummary() + '，是否继续？',
      '确认批量操作',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    loading.value = true

    // Execute batch operation for each role
    const promises = form.targetRoles.map(async (roleId) => {
      const role = props.roles.find(r => r.id === roleId)
      if (!role) return

      let newPermissions: string[] = []

      switch (form.operationType) {
        case 'add':
          // Add permissions (union)
          newPermissions = Array.from(new Set([...role.permissions, ...form.selectedPermissions]))
          break
        case 'remove':
          // Remove permissions (difference)
          newPermissions = role.permissions.filter(p => !form.selectedPermissions.includes(p))
          break
        case 'replace':
          // Replace permissions
          newPermissions = form.selectedPermissions
          break
      }

      await SystemAPI.assignRolePermissions(roleId, newPermissions)
    })

    await Promise.all(promises)

    ElMessage.success('批量操作成功')
    emit('success')
    handleReset()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '批量操作失败')
    }
  } finally {
    loading.value = false
  }
}

const handleReset = () => {
  form.operationType = 'add'
  form.targetRoles = []
  form.selectedPermissions = []
}
</script>

<style scoped lang="scss">
.batch-permission-operations {
  .el-alert {
    margin-top: 16px;
  }
}
</style>
