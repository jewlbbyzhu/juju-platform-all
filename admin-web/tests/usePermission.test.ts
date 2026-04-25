import { describe, it, expect, beforeEach, vi } from 'vitest'
import { usePermission } from '@/composables/usePermission'
import { useAuth } from '@/composables/useAuth'

vi.mock('@/composables/useAuth')

describe('usePermission Composable', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should check if user is super admin', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { value: { role: 'super_admin' } },
      permissions: { value: [] },
      hasPermission: vi.fn(() => true),
      hasAnyPermission: vi.fn(() => true),
      hasAllPermissions: vi.fn(() => true)
    } as any)

    const { isSuperAdmin } = usePermission()
    
    expect(isSuperAdmin.value).toBe(true)
  })

  it('should check if user is operation admin', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { value: { role: 'operation_admin' } },
      permissions: { value: [] },
      hasPermission: vi.fn(() => true),
      hasAnyPermission: vi.fn(() => true),
      hasAllPermissions: vi.fn(() => true)
    } as any)

    const { isOperationAdmin } = usePermission()
    
    expect(isOperationAdmin.value).toBe(true)
  })

  it('should check if user is finance admin', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { value: { role: 'finance_admin' } },
      permissions: { value: [] },
      hasPermission: vi.fn(() => true),
      hasAnyPermission: vi.fn(() => true),
      hasAllPermissions: vi.fn(() => true)
    } as any)

    const { isFinanceAdmin } = usePermission()
    
    expect(isFinanceAdmin.value).toBe(true)
  })

  it('should check if user can view users', () => {
    const mockHasPermission = vi.fn(() => true)
    vi.mocked(useAuth).mockReturnValue({
      user: { value: { role: 'super_admin' } },
      permissions: { value: [] },
      hasPermission: mockHasPermission,
      hasAnyPermission: vi.fn(() => true),
      hasAllPermissions: vi.fn(() => true)
    } as any)

    const { canViewUsers } = usePermission()
    
    expect(canViewUsers.value).toBe(true)
    expect(mockHasPermission).toHaveBeenCalledWith('user:view')
  })

  it('should check if user can access finance module', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { value: { role: 'finance_admin' } },
      permissions: { value: ['finance:view'] },
      hasPermission: vi.fn(() => false),
      hasAnyPermission: vi.fn(() => true),
      hasAllPermissions: vi.fn(() => true)
    } as any)

    const { canAccessFinanceModule } = usePermission()
    
    expect(canAccessFinanceModule.value).toBe(true)
  })

  it('should check if user can access user module', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { value: { role: 'operation_admin' } },
      permissions: { value: ['user:view'] },
      hasPermission: vi.fn(() => false),
      hasAnyPermission: vi.fn(() => true),
      hasAllPermissions: vi.fn(() => true)
    } as any)

    const { canAccessUserModule } = usePermission()
    
    expect(canAccessUserModule.value).toBe(true)
  })

  it('should check if user can access system module', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { value: { role: 'super_admin' } },
      permissions: { value: [] },
      hasPermission: vi.fn(() => false),
      hasAnyPermission: vi.fn(() => false),
      hasAllPermissions: vi.fn(() => true)
    } as any)

    const { canAccessSystemModule } = usePermission()
    
    expect(canAccessSystemModule.value).toBe(true)
  })

  it('should check permissions with requireAll', () => {
    const mockHasAllPermissions = vi.fn(() => true)
    vi.mocked(useAuth).mockReturnValue({
      user: { value: { role: 'super_admin' } },
      permissions: { value: [] },
      hasPermission: vi.fn(() => false),
      hasAnyPermission: vi.fn(() => false),
      hasAllPermissions: mockHasAllPermissions
    } as any)

    const { checkPermissions } = usePermission()
    
    const result = checkPermissions(['user:view', 'user:edit'], true)
    
    expect(result).toBe(true)
    expect(mockHasAllPermissions).toHaveBeenCalledWith(['user:view', 'user:edit'])
  })

  it('should check roles', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { value: { role: 'super_admin' } },
      permissions: { value: [] },
      hasPermission: vi.fn(() => false),
      hasAnyPermission: vi.fn(() => false),
      hasAllPermissions: vi.fn(() => true)
    } as any)

    const { checkRoles } = usePermission()
    
    const result = checkRoles(['super_admin', 'operation_admin'])
    
    expect(result).toBe(true)
  })

  it('should filter visible menus', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { value: { role: 'super_admin' } },
      permissions: { value: ['user:view', 'party:view'] },
      hasPermission: vi.fn((perm) => ['user:view', 'party:view'].includes(perm)),
      hasAnyPermission: vi.fn(() => true),
      hasAllPermissions: vi.fn(() => true)
    } as any)

    const { getVisibleMenus } = usePermission()
    
    const menus = [
      { id: 'users', permissions: ['user:view'] },
      { id: 'parties', permissions: ['party:view'] },
      { id: 'finance', permissions: ['finance:view'] }
    ]
    
    const visibleMenus = getVisibleMenus(menus)
    
    expect(visibleMenus.length).toBeGreaterThanOrEqual(2)
    expect(visibleMenus.map((m: any) => m.id)).toContain('users')
    expect(visibleMenus.map((m: any) => m.id)).toContain('parties')
  })
})