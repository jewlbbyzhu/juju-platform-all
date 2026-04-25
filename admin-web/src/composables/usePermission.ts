import { computed } from 'vue'
import { useAuth } from './useAuth'

export function usePermission() {
  const { user, permissions, hasPermission, hasAnyPermission, hasAllPermissions } = useAuth()

  // Role-based checks
  const isSuperAdmin = computed(() => user.value?.role === 'super_admin')
  const isOperationAdmin = computed(() => user.value?.role === 'operation_admin')
  const isFinanceAdmin = computed(() => user.value?.role === 'finance_admin')
  const isCustomerService = computed(() => user.value?.role === 'customer_service')

  // Permission-based checks for common operations
  const canViewUsers = computed(() => hasPermission('user:view'))
  const canEditUsers = computed(() => hasPermission('user:edit'))
  const canDeleteUsers = computed(() => hasPermission('user:delete'))
  
  const canViewParties = computed(() => hasPermission('party:view'))
  const canAuditParties = computed(() => hasPermission('party:audit'))
  const canDeleteParties = computed(() => hasPermission('party:delete'))
  
  const canViewOrders = computed(() => hasPermission('order:view'))
  const canRefundOrders = computed(() => hasPermission('order:refund'))
  
  const canViewFinance = computed(() => hasPermission('finance:view'))
  const canManageWithdrawals = computed(() => hasPermission('finance:withdrawal'))
  
  const canViewAnalytics = computed(() => hasPermission('analytics:view'))
  const canExportData = computed(() => hasPermission('data:export'))
  
  const canManageContent = computed(() => hasPermission('content:manage'))
  const canManageSystem = computed(() => hasPermission('system:manage'))
  const canManageAdmins = computed(() => hasPermission('admin:manage'))

  // Complex permission checks
  const canAccessFinanceModule = computed(() => {
    return isSuperAdmin.value || 
           isFinanceAdmin.value || 
           hasAnyPermission(['finance:view', 'finance:withdrawal'])
  })

  const canAccessUserModule = computed(() => {
    return isSuperAdmin.value || 
           isOperationAdmin.value || 
           hasAnyPermission(['user:view', 'user:edit'])
  })

  const canAccessSystemModule = computed(() => {
    return isSuperAdmin.value || hasPermission('system:manage')
  })

  // Helper functions
  const checkPermissions = (perms: string[], requireAll = false): boolean => {
    return requireAll ? hasAllPermissions(perms) : hasAnyPermission(perms)
  }

  const checkRoles = (roles: string[]): boolean => {
    return user.value ? roles.includes(user.value.role) : false
  }

  const checkAccess = (config: {
    permissions?: string[]
    roles?: string[]
    requireAll?: boolean
    strict?: boolean
  }): boolean => {
    const { permissions: perms = [], roles = [], requireAll = false, strict = false } = config

    const hasRoleAccess = roles.length === 0 || checkRoles(roles)
    const hasPermAccess = perms.length === 0 || checkPermissions(perms, requireAll)

    if (strict) {
      // Both role and permission must match
      return hasRoleAccess && hasPermAccess
    } else {
      // Either role or permission can grant access
      if (roles.length === 0) return hasPermAccess
      if (perms.length === 0) return hasRoleAccess
      return hasRoleAccess || hasPermAccess
    }
  }

  // Menu visibility helpers
  const getVisibleMenus = (menus: Array<{
    id: string
    permission?: string
    permissions?: string[]
    roles?: string[]
    children?: any[]
  }>) => {
    return menus.filter(menu => {
      // Check menu access - support both 'permission' (single) and 'permissions' (array)
      const menuPermissions = menu.permissions || (menu.permission ? [menu.permission] : [])
      const hasAccess = checkAccess({
        permissions: menuPermissions,
        roles: menu.roles
      })

      if (!hasAccess) return false

      // Filter children if they exist
      if (menu.children) {
        menu.children = getVisibleMenus(menu.children)
      }

      return true
    })
  }

  return {
    // Role checks
    isSuperAdmin,
    isOperationAdmin,
    isFinanceAdmin,
    isCustomerService,

    // Permission checks
    canViewUsers,
    canEditUsers,
    canDeleteUsers,
    canViewParties,
    canAuditParties,
    canDeleteParties,
    canViewOrders,
    canRefundOrders,
    canViewFinance,
    canManageWithdrawals,
    canViewAnalytics,
    canExportData,
    canManageContent,
    canManageSystem,
    canManageAdmins,

    // Module access
    canAccessFinanceModule,
    canAccessUserModule,
    canAccessSystemModule,

    // Helper functions
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    checkPermissions,
    checkRoles,
    checkAccess,
    getVisibleMenus,
  }
}