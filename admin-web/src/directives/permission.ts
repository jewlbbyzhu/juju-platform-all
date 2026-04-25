import type { App, DirectiveBinding } from 'vue'
import { useAuthStore } from '@/stores/modules/auth'

interface PermissionBinding {
  value: string | string[]
  arg?: 'role' | 'permission' | 'any' | 'all'
  modifiers?: {
    hide?: boolean
    disable?: boolean
    readonly?: boolean
  }
}

// Permission directive
const permission = {
  mounted(el: HTMLElement, binding: DirectiveBinding<PermissionBinding['value']>) {
    checkPermission(el, binding)
  },
  
  updated(el: HTMLElement, binding: DirectiveBinding<PermissionBinding['value']>) {
    checkPermission(el, binding)
  }
}

function checkPermission(el: HTMLElement, binding: DirectiveBinding<PermissionBinding['value']>) {
  const authStore = useAuthStore()
  const { value, arg = 'permission', modifiers = {} } = binding
  
  if (!value) {
    console.warn('v-permission directive requires a value')
    return
  }
  
  // Normalize value to array
  const permissions = Array.isArray(value) ? value : [value]
  let hasAccess = false
  
  // Check access based on directive argument
  switch (arg) {
    case 'role':
      // Check if user has any of the specified roles
      const userRole = authStore.userInfo?.role
      hasAccess = userRole ? permissions.includes(userRole) : false
      break
      
    case 'permission':
      // Check if user has any of the specified permissions
      hasAccess = permissions.some(permission => authStore.hasPermission(permission))
      break
      
    case 'all':
      // Check if user has ALL of the specified permissions
      hasAccess = permissions.every(permission => authStore.hasPermission(permission))
      break
      
    case 'any':
    default:
      // Check if user has ANY of the specified permissions (default behavior)
      hasAccess = permissions.some(permission => authStore.hasPermission(permission))
      break
  }
  
  // Apply access control based on modifiers
  if (!hasAccess) {
    if (modifiers.hide) {
      // Hide element completely
      el.style.display = 'none'
    } else if (modifiers.disable) {
      // Disable element
      el.setAttribute('disabled', 'true')
      el.style.opacity = '0.5'
      el.style.cursor = 'not-allowed'
      
      // Prevent click events
      el.addEventListener('click', preventClick, true)
    } else if (modifiers.readonly) {
      // Make element readonly
      el.setAttribute('readonly', 'true')
      el.style.opacity = '0.7'
    } else {
      // Default: hide element
      el.style.display = 'none'
    }
  } else {
    // Restore element if access is granted
    el.style.display = ''
    el.style.opacity = ''
    el.style.cursor = ''
    el.removeAttribute('disabled')
    el.removeAttribute('readonly')
    el.removeEventListener('click', preventClick, true)
  }
}

function preventClick(event: Event) {
  event.preventDefault()
  event.stopPropagation()
}

// Role directive (shorthand for v-permission:role)
const role = {
  mounted(el: HTMLElement, binding: DirectiveBinding<string | string[]>) {
    checkPermission(el, { ...binding, arg: 'role' })
  },
  
  updated(el: HTMLElement, binding: DirectiveBinding<string | string[]>) {
    checkPermission(el, { ...binding, arg: 'role' })
  }
}

// Auth directive (checks if user is authenticated)
const auth = {
  mounted(el: HTMLElement, binding: DirectiveBinding<boolean>) {
    checkAuth(el, binding)
  },
  
  updated(el: HTMLElement, binding: DirectiveBinding<boolean>) {
    checkAuth(el, binding)
  }
}

function checkAuth(el: HTMLElement, binding: DirectiveBinding<boolean>) {
  const authStore = useAuthStore()
  const { value = true, modifiers = {} } = binding
  
  const isAuthenticated = authStore.isAuthenticated
  const shouldShow = value ? isAuthenticated : !isAuthenticated
  
  if (!shouldShow) {
    if (modifiers.hide) {
      el.style.display = 'none'
    } else if (modifiers.disable) {
      el.setAttribute('disabled', 'true')
      el.style.opacity = '0.5'
    } else {
      el.style.display = 'none'
    }
  } else {
    el.style.display = ''
    el.style.opacity = ''
    el.removeAttribute('disabled')
  }
}

// Install function for Vue app
export function setupPermissionDirectives(app: App) {
  app.directive('permission', permission)
  app.directive('role', role)
  app.directive('auth', auth)
}

export { permission, role, auth }