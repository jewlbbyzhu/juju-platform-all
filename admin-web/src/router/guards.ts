import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/modules/auth'
import { isValidToken } from '@/utils/auth'

// Route meta interface
declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    permissions?: string[]
    roles?: string[]
    requireAll?: boolean
    title?: string
    icon?: string
    hidden?: boolean
    noCache?: boolean
    breadcrumb?: boolean
  }
}

// Authentication guard
export const authGuard = async (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  const authStore = useAuthStore()
  
  // Skip auth check for routes that don't require authentication
  if (to.meta.requiresAuth === false) {
    next()
    return
  }
  
  // Check if user is authenticated
  if (!authStore.isAuthenticated) {
    // Try to initialize auth from stored token
    const storedToken = authStore.token
    if (storedToken && isValidToken(storedToken)) {
      try {
        await authStore.initializeAuth()
        if (authStore.isAuthenticated) {
          next()
          return
        }
      } catch (error) {
        console.error('Auth initialization failed:', error)
      }
    }
    
    // Redirect to login
    ElMessage.warning('请先登录')
    next({
      name: 'Login',
      query: { redirect: to.fullPath }
    })
    return
  }
  
  next()
}

// Permission guard
export const permissionGuard = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  const authStore = useAuthStore()
  
  // Skip permission check if not authenticated or no permissions required
  if (!authStore.isAuthenticated || !to.meta.permissions) {
    next()
    return
  }
  
  // Super admin bypasses permission checks
  const userRole = authStore.userInfo?.role
  if (userRole === 'super_admin') {
    next()
    return
  }

  const requiredPermissions = to.meta.permissions
  const requireAll = to.meta.requireAll || false
  
  let hasAccess = false
  
  if (requireAll) {
    // User must have ALL required permissions
    hasAccess = requiredPermissions.every(permission => 
      authStore.hasPermission(permission)
    )
  } else {
    // User must have ANY of the required permissions
    hasAccess = requiredPermissions.some(permission => 
      authStore.hasPermission(permission)
    )
  }
  
  if (!hasAccess) {
    ElMessage.error('权限不足，无法访问该页面')
    
    const user = authStore.userInfo
    if (!user) {
      next({ name: 'Dashboard' })
      return
    }
    
    if (user.role === 'super_admin') {
      next({ name: 'Dashboard' })
    } else if (user.role === 'operation_admin') {
      next({ name: 'Users' })
    } else if (user.role === 'finance_admin') {
      next({ name: 'Finance' })
    } else {
      next({ name: 'Dashboard' })
    }
    return
  }
  
  next()
}

// Role guard
export const roleGuard = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  const authStore = useAuthStore()
  
  // Skip role check if not authenticated or no roles required
  if (!authStore.isAuthenticated || !to.meta.roles) {
    next()
    return
  }
  
  const requiredRoles = to.meta.roles
  const userRole = authStore.userInfo?.role
  
  if (!userRole || !requiredRoles.includes(userRole)) {
    ElMessage.error('角色权限不足，无法访问该页面')
    next({ name: 'Dashboard' })
    return
  }
  
  next()
}

// Combined guard that checks auth, permissions, and roles
export const accessGuard = async (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  // First check authentication
  await authGuard(to, from, (result) => {
    if (typeof result === 'string' || typeof result === 'object') {
      // Auth guard wants to redirect
      next(result)
      return
    }
    
    // Then check roles
    roleGuard(to, from, (roleResult) => {
      if (typeof roleResult === 'string' || typeof roleResult === 'object') {
        // Role guard wants to redirect
        next(roleResult)
        return
      }
      
      // Finally check permissions
      permissionGuard(to, from, next)
    })
  })
}

// Title guard - sets page title
export const titleGuard = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  // Set page title
  const title = to.meta.title
  if (title) {
    document.title = `${title} - 聚聚管理后台`
  } else {
    document.title = '聚聚管理后台'
  }
  
  next()
}

// Loading guard - manages global loading state
export const loadingGuard = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  // You can add loading logic here if needed
  next()
}

// Progress guard - manages navigation progress
export const progressGuard = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  // Start progress bar (if using nprogress or similar)
  // NProgress.start()
  next()
}

// Error guard - handles navigation errors
export const errorGuard = (error: Error) => {
  console.error('Navigation error:', error)
  ElMessage.error('页面导航失败')
}

// After each guard - cleanup
export const afterEachGuard = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized
) => {
  // Finish progress bar
  // NProgress.done()
  
  // Log navigation for analytics
  console.log(`Navigated from ${from.path} to ${to.path}`)
}
