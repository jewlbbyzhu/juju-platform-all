<template>
  <div class="role-permission-manager">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>权限配置</span>
          <div class="header-actions">
            <el-button size="small" @click="handleExpandAll">
              {{ expandAll ? '收起全部' : '展开全部' }}
            </el-button>
            <el-button size="small" @click="handleCheckAll">
              {{ checkAll ? '取消全选' : '全选' }}
            </el-button>
          </div>
        </div>
      </template>

      <div class="permission-filter">
        <el-input
          v-model="filterText"
          placeholder="搜索权限"
          clearable
          prefix-icon="Search"
          @input="handleFilter"
        />
        <el-radio-group v-model="filterType" size="small" @change="handleFilter">
          <el-radio-button value="">全部</el-radio-button>
          <el-radio-button value="menu">菜单</el-radio-button>
          <el-radio-button value="button">按钮</el-radio-button>
          <el-radio-button value="api">接口</el-radio-button>
        </el-radio-group>
      </div>

      <div class="permission-tree-container">
        <PermissionTree
          ref="permissionTreeRef"
          :permissions="filteredPermissions"
          :checked-permissions="modelValue"
          :expand-all="expandAll"
          @update:checked-permissions="handlePermissionChange"
        />
      </div>

      <div class="permission-stats">
        <el-text type="info" size="small">
          已选择 {{ selectedCount }} 个权限
        </el-text>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import PermissionTree from './PermissionTree.vue'
import type { PermissionTree as PermissionTreeType } from '@/types/system'

interface Props {
  permissions: PermissionTreeType[]
  modelValue: string[]
}

interface Emits {
  (e: 'update:modelValue', permissions: string[]): void
  (e: 'change', permissions: string[]): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const permissionTreeRef = ref<InstanceType<typeof PermissionTree>>()
const filterText = ref('')
const filterType = ref('')
const expandAll = ref(false)
const checkAll = ref(false)

const filteredPermissions = computed(() => {
  let result = props.permissions

  // Filter by type
  if (filterType.value) {
    result = filterPermissionsByType(result, filterType.value)
  }

  // Filter by text
  if (filterText.value) {
    result = filterPermissionsByText(result, filterText.value)
  }

  return result
})

const selectedCount = computed(() => {
  return props.modelValue.length
})

const filterPermissionsByType = (permissions: PermissionTreeType[], type: string): PermissionTreeType[] => {
  return permissions.reduce((acc, permission) => {
    const matchesType = permission.type === type
    const filteredChildren = permission.children 
      ? filterPermissionsByType(permission.children, type)
      : []

    if (matchesType || filteredChildren.length > 0) {
      acc.push({
        ...permission,
        children: filteredChildren.length > 0 ? filteredChildren : permission.children
      })
    }

    return acc
  }, [] as PermissionTreeType[])
}

const filterPermissionsByText = (permissions: PermissionTreeType[], text: string): PermissionTreeType[] => {
  const lowerText = text.toLowerCase()
  
  return permissions.reduce((acc, permission) => {
    const matchesText = permission.name.toLowerCase().includes(lowerText) ||
                       permission.code.toLowerCase().includes(lowerText)
    const filteredChildren = permission.children
      ? filterPermissionsByText(permission.children, text)
      : []

    if (matchesText || filteredChildren.length > 0) {
      acc.push({
        ...permission,
        children: filteredChildren.length > 0 ? filteredChildren : permission.children
      })
    }

    return acc
  }, [] as PermissionTreeType[])
}

const handlePermissionChange = (permissions: string[]) => {
  emit('update:modelValue', permissions)
  emit('change', permissions)
}

const handleFilter = () => {
  // Filter is handled by computed property
}

const handleExpandAll = () => {
  expandAll.value = !expandAll.value
}

const handleCheckAll = () => {
  if (checkAll.value) {
    // Uncheck all
    emit('update:modelValue', [])
    emit('change', [])
  } else {
    // Check all
    const allPermissions = getAllPermissionCodes(props.permissions)
    emit('update:modelValue', allPermissions)
    emit('change', allPermissions)
  }
  checkAll.value = !checkAll.value
}

const getAllPermissionCodes = (permissions: PermissionTreeType[]): string[] => {
  const codes: string[] = []
  const traverse = (nodes: PermissionTreeType[]) => {
    nodes.forEach(node => {
      codes.push(node.code)
      if (node.children) {
        traverse(node.children)
      }
    })
  }
  traverse(permissions)
  return codes
}

// Watch for external changes
watch(() => props.modelValue, (newVal) => {
  checkAll.value = newVal.length === getAllPermissionCodes(props.permissions).length
})
</script>

<style scoped lang="scss">
.role-permission-manager {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .header-actions {
      display: flex;
      gap: 8px;
    }
  }

  .permission-filter {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;

    .el-input {
      flex: 1;
    }
  }

  .permission-tree-container {
    max-height: 500px;
    overflow-y: auto;
    padding: 8px;
    border: 1px solid var(--el-border-color);
    border-radius: 4px;
  }

  .permission-stats {
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid var(--el-border-color);
  }
}
</style>
