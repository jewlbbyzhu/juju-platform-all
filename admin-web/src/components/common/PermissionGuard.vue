<template>
  <div v-if="hasAccess">
    <slot />
  </div>
  <div v-else-if="showFallback">
    <slot name="fallback">
      <el-empty 
        description="权限不足" 
        :image-size="100"
      >
        <template #image>
          <el-icon :size="100" color="#c0c4cc">
            <Lock />
          </el-icon>
        </template>
        <el-button type="primary" @click="handleRequestAccess">
          申请权限
        </el-button>
      </el-empty>
    </slot>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Lock } from '@element-plus/icons-vue'
import { useAuth } from '@/composables/useAuth'

interface Props {
  permissions?: string | string[]
  roles?: string | string[]
  requireAll?: boolean
  showFallback?: boolean
  strict?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  permissions: () => [],
  roles: () => [],
  requireAll: false,
  showFallback: true,
  strict: false
})

const { 
  user, 
  hasAnyPermission, 
  hasAllPermissions 
} = useAuth()

// Normalize permissions and roles to arrays
const normalizedPermissions = computed(() => {
  if (!props.permissions) return []
  return Array.isArray(props.permissions) ? props.permissions : [props.permissions]
})

const normalizedRoles = computed(() => {
  if (!props.roles) return []
  return Array.isArray(props.roles) ? props.roles : [props.roles]
})

// Check role access
const hasRoleAccess = computed(() => {
  if (normalizedRoles.value.length === 0) return true
  if (!user.value) return false
  
  const userRole = user.value.role
  return normalizedRoles.value.includes(userRole)
})

// Check permission access
const hasPermissionAccess = computed(() => {
  if (normalizedPermissions.value.length === 0) return true
  
  if (props.requireAll) {
    return hasAllPermissions(normalizedPermissions.value)
  } else {
    return hasAnyPermission(normalizedPermissions.value)
  }
})

// Final access check
const hasAccess = computed(() => {
  // In strict mode, both role and permission must match
  if (props.strict) {
    return hasRoleAccess.value && hasPermissionAccess.value
  }
  
  // In non-strict mode, either role or permission can grant access
  // If no roles specified, only check permissions
  // If no permissions specified, only check roles
  if (normalizedRoles.value.length === 0) {
    return hasPermissionAccess.value
  }
  
  if (normalizedPermissions.value.length === 0) {
    return hasRoleAccess.value
  }
  
  return hasRoleAccess.value || hasPermissionAccess.value
})

// Handle access request
const handleRequestAccess = () => {
  ElMessage.info('权限申请功能暂未开放，请联系管理员')
}
</script>

<style scoped>
/* Add any specific styles if needed */
</style>