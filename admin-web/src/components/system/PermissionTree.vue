<template>
  <div class="permission-tree">
    <el-tree
      ref="treeRef"
      :data="treeData"
      :props="treeProps"
      :default-checked-keys="defaultCheckedKeys"
      :default-expanded-keys="defaultExpandedKeys"
      show-checkbox
      node-key="id"
      :check-strictly="checkStrictly"
      @check="handleCheck"
    >
      <template #default="{ node, data }">
        <span class="custom-tree-node">
          <el-icon v-if="data.icon" class="node-icon">
            <component :is="data.icon" />
          </el-icon>
          <span class="node-label">{{ node.label }}</span>
          <el-tag v-if="data.type" :type="getTypeTagType(data.type)" size="small" class="node-type">
            {{ getTypeLabel(data.type) }}
          </el-tag>
          <el-tag v-if="data.status === 'disabled'" type="info" size="small">
            已禁用
          </el-tag>
        </span>
      </template>
    </el-tree>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { PermissionTree as PermissionTreeType } from '@/types/system'
import type { ElTree } from 'element-plus'

interface Props {
  permissions: PermissionTreeType[]
  checkedPermissions?: string[]
  checkStrictly?: boolean
  expandAll?: boolean
}

interface Emits {
  (e: 'update:checkedPermissions', permissions: string[]): void
  (e: 'change', checkedNodes: PermissionTreeType[], checkedKeys: string[]): void
}

const props = withDefaults(defineProps<Props>(), {
  checkedPermissions: () => [],
  checkStrictly: false,
  expandAll: false
})

const emit = defineEmits<Emits>()

const treeRef = ref<InstanceType<typeof ElTree>>()

const treeProps = {
  children: 'children',
  label: 'name'
}

const treeData = computed(() => props.permissions)

const defaultCheckedKeys = computed(() => {
  return props.checkedPermissions.map(code => {
    const permission = findPermissionByCode(props.permissions, code)
    return permission?.id
  }).filter(Boolean) as number[]
})

const defaultExpandedKeys = computed(() => {
  if (props.expandAll) {
    return getAllNodeIds(props.permissions)
  }
  return []
})

const findPermissionByCode = (permissions: PermissionTreeType[], code: string): PermissionTreeType | null => {
  for (const permission of permissions) {
    if (permission.code === code) {
      return permission
    }
    if (permission.children) {
      const found = findPermissionByCode(permission.children, code)
      if (found) return found
    }
  }
  return null
}

const getAllNodeIds = (permissions: PermissionTreeType[]): number[] => {
  const ids: number[] = []
  const traverse = (nodes: PermissionTreeType[]) => {
    nodes.forEach(node => {
      ids.push(node.id)
      if (node.children) {
        traverse(node.children)
      }
    })
  }
  traverse(permissions)
  return ids
}

const getTypeTagType = (type: string) => {
  const typeMap: Record<string, any> = {
    menu: 'primary',
    button: 'success',
    api: 'warning'
  }
  return typeMap[type] || 'info'
}

const getTypeLabel = (type: string) => {
  const labelMap: Record<string, string> = {
    menu: '菜单',
    button: '按钮',
    api: '接口'
  }
  return labelMap[type] || type
}

const handleCheck = (data: PermissionTreeType, checked: any) => {
  const checkedNodes = treeRef.value?.getCheckedNodes() as PermissionTreeType[]
  const checkedKeys = checkedNodes.map(node => node.code)
  
  emit('update:checkedPermissions', checkedKeys)
  emit('change', checkedNodes, checkedKeys)
}

// Public methods
const getCheckedKeys = () => {
  return treeRef.value?.getCheckedKeys() as number[]
}

const getCheckedNodes = () => {
  return treeRef.value?.getCheckedNodes() as PermissionTreeType[]
}

const setCheckedKeys = (keys: number[]) => {
  treeRef.value?.setCheckedKeys(keys)
}

const setCheckedNodes = (nodes: PermissionTreeType[]) => {
  const keys = nodes.map(node => node.id)
  setCheckedKeys(keys)
}

defineExpose({
  getCheckedKeys,
  getCheckedNodes,
  setCheckedKeys,
  setCheckedNodes
})
</script>

<style scoped lang="scss">
.permission-tree {
  :deep(.el-tree) {
    .el-tree-node__content {
      height: 36px;
      padding: 4px 0;
    }
  }

  .custom-tree-node {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1;

    .node-icon {
      font-size: 16px;
      color: var(--el-color-primary);
    }

    .node-label {
      flex: 1;
      font-size: 14px;
    }

    .node-type {
      margin-left: 8px;
    }
  }
}
</style>
