import { describe, test, expect, vi, beforeEach } from 'vitest'

vi.mock('@/api/request', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  }
}))

import request from '@/api/request'
import { AuthAPI } from '@/api/modules/auth'
import { UserAPI } from '@/api/modules/user'
import { PartyAPI } from '@/api/modules/party'
import { OrderAPI } from '@/api/modules/order'
import { FinanceAPI } from '@/api/modules/finance'
import { SystemAPI } from '@/api/modules/system'

describe('API Modules', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('AuthAPI', () => {
    test('should call login endpoint with correct data', async () => {
      const loginData = { username: 'admin', password: 'password123' }
      // Mock拦截器处理后的响应（只返回data.data部分）
      const mockResponse = {
        token: 'token123',
        refreshToken: 'refresh123',
        user: { id: 1, username: 'admin' },
        permissions: ['dashboard:view'],
        expiresIn: 7200
      }

      vi.mocked(request.post).mockResolvedValue(mockResponse)

      const result = await AuthAPI.login(loginData)

      expect(request.post).toHaveBeenCalledWith('/admin/login', loginData)
      expect(result).toEqual(mockResponse)
      expect(result.token).toBe('token123')
      expect(result.user).toEqual({ id: 1, username: 'admin' })
    })

    test('should call logout endpoint', async () => {
      vi.mocked(request.post).mockResolvedValue(undefined)

      await AuthAPI.logout()

      expect(request.post).toHaveBeenCalledWith('/auth/logout')
    })

    test('should get user info', async () => {
      const mockUser = {
        id: 1,
        username: 'admin',
        nickname: 'Admin',
        avatar: '',
        email: 'admin@example.com',
        role: 'super_admin',
        status: 'active'
      }
      vi.mocked(request.get).mockResolvedValue(mockUser)

      const result = await AuthAPI.getUserInfo()

      expect(request.get).toHaveBeenCalledWith('/auth/user')
      expect(result).toEqual(mockUser)
    })

    test('should refresh token', async () => {
      const refreshToken = 'refresh_token_123'
      const mockResponse = {
        token: 'new_token',
        refreshToken: 'new_refresh',
        expiresIn: 7200
      }

      vi.mocked(request.post).mockResolvedValue(mockResponse)

      const result = await AuthAPI.refreshToken(refreshToken)

      expect(request.post).toHaveBeenCalledWith('/auth/refresh', { refreshToken })
      expect(result).toEqual(mockResponse)
    })

    test('should get permissions', async () => {
      const mockPermissions = [
        { id: 1, name: 'Dashboard View', code: 'dashboard:view', type: 'api' }
      ]
      vi.mocked(request.get).mockResolvedValue(mockPermissions)

      const result = await AuthAPI.getPermissions()

      expect(request.get).toHaveBeenCalledWith('/auth/permissions')
      expect(result).toEqual(mockPermissions)
    })

    test('should change password', async () => {
      const passwordData = { oldPassword: 'old123', newPassword: 'new123' }
      vi.mocked(request.post).mockResolvedValue(undefined)

      await AuthAPI.changePassword(passwordData)

      expect(request.post).toHaveBeenCalledWith('/auth/change-password', passwordData)
    })

    test('should get captcha', async () => {
      const mockCaptcha = {
        captcha: 'data:image/svg+xml;utf8,abc123',
        key: 'key123'
      }
      vi.mocked(request.get).mockResolvedValue(mockCaptcha)

      const result = await AuthAPI.getCaptcha()

      expect(request.get).toHaveBeenCalledWith('/auth/captcha')
      expect(result).toEqual(mockCaptcha)
    })
  })

  describe('UserAPI', () => {
    test('should get users with params', async () => {
      const params = { page: 1, pageSize: 20, keyword: 'test' }
      const mockResponse = {
        list: [{ id: 1, username: 'test' }],
        total: 1
      }

      vi.mocked(request.get).mockResolvedValue(mockResponse)

      const result = await UserAPI.getUsers(params)

      expect(request.get).toHaveBeenCalledWith('/users', { params })
      expect(result).toEqual(mockResponse)
    })

    test('should get user detail', async () => {
      const userId = 123
      const mockUser = {
        id: userId,
        username: 'test',
        nickname: 'Test User',
        email: 'test@example.com'
      }

      vi.mocked(request.get).mockResolvedValue(mockUser)

      const result = await UserAPI.getUserDetail(userId)

      expect(request.get).toHaveBeenCalledWith(`/users/${userId}`)
      expect(result).toEqual(mockUser)
    })

    test('should update user status', async () => {
      const userId = 123
      const statusData = { status: 'banned', reason: 'Violation' }

      vi.mocked(request.put).mockResolvedValue(undefined)

      await UserAPI.updateUserStatus(userId, statusData)

      expect(request.put).toHaveBeenCalledWith(`/users/${userId}/status`, statusData)
    })

    test('should get user stats', async () => {
      const mockStats = { total: 100, active: 80 }
      vi.mocked(request.get).mockResolvedValue(mockStats)

      const result = await UserAPI.getUserStats()

      expect(request.get).toHaveBeenCalledWith('/users/stats')
      expect(result).toEqual(mockStats)
    })

    test('should export users', async () => {
      const params = { format: 'xlsx' }
      const mockBlob = new Blob()

      vi.mocked(request.get).mockResolvedValue(mockBlob)

      const result = await UserAPI.exportUsers(params)

      expect(request.get).toHaveBeenCalledWith('/users/export', {
        params,
        responseType: 'blob'
      })
      expect(result).toEqual(mockBlob)
    })

    test('should search users', async () => {
      const keyword = 'test'
      const mockResponse = { list: [], total: 0 }

      vi.mocked(request.get).mockResolvedValue(mockResponse)

      const result = await UserAPI.searchUsers(keyword)

      expect(request.get).toHaveBeenCalledWith('/users/search', {
        params: { keyword, page: 1, pageSize: 20 }
      })
    })

    test('should get user activities', async () => {
      const userId = 123
      const mockResponse = { list: [], total: 0, page: 1, pageSize: 20 }

      vi.mocked(request.get).mockResolvedValue(mockResponse)

      const result = await UserAPI.getUserActivities(userId)

      expect(request.get).toHaveBeenCalledWith(`/users/${userId}/activities`, {
        params: { page: 1, pageSize: 20 }
      })
    })

    test('should batch update user status', async () => {
      const ids = [1, 2, 3]
      const statusData = { status: 'active' }

      vi.mocked(request.put).mockResolvedValue(undefined)

      await UserAPI.batchUpdateUserStatus(ids, statusData)

      expect(request.put).toHaveBeenCalledWith('/users/batch/status', { ids, ...statusData })
    })
  })

  describe('PartyAPI', () => {
    test('should get pending parties', async () => {
      const params = { page: 1, pageSize: 20 }
      const mockResponse = { list: [], total: 0 }

      vi.mocked(request.get).mockResolvedValue(mockResponse)

      const result = await PartyAPI.getPendingParties(params)

      expect(request.get).toHaveBeenCalledWith('/parties/pending', { params })
    })

    test('should get parties', async () => {
      const params = { page: 1, status: 'ongoing' }
      vi.mocked(request.get).mockResolvedValue({ list: [], total: 0 })

      await PartyAPI.getParties(params)

      expect(request.get).toHaveBeenCalledWith('/parties', { params })
    })

    test('should get party detail', async () => {
      const partyId = 456
      vi.mocked(request.get).mockResolvedValue({ id: partyId })

      await PartyAPI.getPartyDetail(partyId)

      expect(request.get).toHaveBeenCalledWith(`/parties/${partyId}`)
    })

    test('should audit party', async () => {
      const partyId = 456
      const auditData = { status: 'approved', reason: 'Looks good' }

      vi.mocked(request.post).mockResolvedValue(undefined)

      await PartyAPI.auditParty(partyId, auditData)

      expect(request.post).toHaveBeenCalledWith(`/parties/${partyId}/audit`, auditData)
    })

    test('should cancel party', async () => {
      const partyId = 456
      vi.mocked(request.post).mockResolvedValue(undefined)

      await PartyAPI.cancelParty(partyId, 'Test reason')

      expect(request.post).toHaveBeenCalledWith(`/parties/${partyId}/cancel`, { reason: 'Test reason' })
    })

    test('should complete party', async () => {
      const partyId = 456
      vi.mocked(request.post).mockResolvedValue(undefined)

      await PartyAPI.completeParty(partyId)

      expect(request.post).toHaveBeenCalledWith(`/parties/${partyId}/complete`)
    })

    test('should batch audit parties', async () => {
      const ids = [1, 2, 3]
      const auditData = { status: 'approved' }

      vi.mocked(request.post).mockResolvedValue(undefined)

      await PartyAPI.batchAuditParties(ids, auditData)

      expect(request.post).toHaveBeenCalledWith('/parties/batch/audit', { ids, ...auditData })
    })
  })

  describe('OrderAPI', () => {
    test('should get orders', async () => {
      const params = { page: 1, status: 'paid' }
      vi.mocked(request.get).mockResolvedValue({ list: [], total: 0 })

      await OrderAPI.getOrders(params)

      expect(request.get).toHaveBeenCalledWith('/orders', { params })
    })

    test('should get order detail', async () => {
      const orderId = 789
      vi.mocked(request.get).mockResolvedValue({ id: orderId })

      await OrderAPI.getOrderDetail(orderId)

      expect(request.get).toHaveBeenCalledWith(`/orders/${orderId}`)
    })

    test('should audit refund', async () => {
      const orderId = 789
      const auditData = { status: 'approved', reason: 'Valid request' }

      vi.mocked(request.post).mockResolvedValue(undefined)

      await OrderAPI.auditRefund(orderId, auditData)

      expect(request.post).toHaveBeenCalledWith(`/orders/${orderId}/refund/audit`, auditData)
    })

    test('should cancel order', async () => {
      const orderId = 789
      vi.mocked(request.post).mockResolvedValue(undefined)

      await OrderAPI.cancelOrder(orderId, 'User request')

      expect(request.post).toHaveBeenCalledWith(`/orders/${orderId}/cancel`, { reason: 'User request' })
    })
  })

  describe('FinanceAPI', () => {
    test('should get financial stats', async () => {
      const params = { startDate: '2024-01-01', endDate: '2024-01-31' }
      vi.mocked(request.get).mockResolvedValue({ revenue: 10000 })

      await FinanceAPI.getFinancialStats(params)

      expect(request.get).toHaveBeenCalledWith('/finance/stats', { params })
    })

    test('should get withdrawals', async () => {
      const params = { page: 1, status: 'pending' }
      vi.mocked(request.get).mockResolvedValue({ list: [], total: 0 })

      await FinanceAPI.getWithdrawals(params)

      expect(request.get).toHaveBeenCalledWith('/finance/withdrawals', { params })
    })

    test('should audit withdrawal', async () => {
      const withdrawalId = 111
      const auditData = { status: 'approved', reviewer: 'admin' }

      vi.mocked(request.post).mockResolvedValue(undefined)

      await FinanceAPI.auditWithdrawal(withdrawalId, auditData)

      expect(request.post).toHaveBeenCalledWith(`/finance/withdrawals/${withdrawalId}/audit`, auditData)
    })

    test('should get transactions', async () => {
      const params = { page: 1, type: 'recharge' }
      vi.mocked(request.get).mockResolvedValue({ list: [], total: 0 })

      await FinanceAPI.getTransactions(params)

      expect(request.get).toHaveBeenCalledWith('/finance/transactions', { params })
    })

    test('should export financial report', async () => {
      const params = { startDate: '2024-01-01', endDate: '2024-01-31' }
      const mockBlob = new Blob()

      vi.mocked(request.post).mockResolvedValue(mockBlob)

      await FinanceAPI.exportFinancialReport(params)

      expect(request.post).toHaveBeenCalledWith('/finance/report/export', params, {
        responseType: 'blob'
      })
    })

    test('should batch audit withdrawals', async () => {
      const ids = [1, 2, 3]
      const auditData = { status: 'approved' }

      vi.mocked(request.post).mockResolvedValue(undefined)

      await FinanceAPI.batchAuditWithdrawals(ids, auditData)

      expect(request.post).toHaveBeenCalledWith('/finance/withdrawals/batch/audit', {
        ids,
        ...auditData
      })
    })
  })

  describe('SystemAPI', () => {
    test('should get admins', async () => {
      const params = { page: 1, pageSize: 20 }
      vi.mocked(request.get).mockResolvedValue({ list: [], total: 0 })

      await SystemAPI.getAdmins(params)

      expect(request.get).toHaveBeenCalledWith('/system/admins', { params })
    })

    test('should create admin', async () => {
      const adminData = { username: 'newadmin', password: 'pass123' }
      vi.mocked(request.post).mockResolvedValue({ id: 1 })

      await SystemAPI.createAdmin(adminData)

      expect(request.post).toHaveBeenCalledWith('/system/admins', adminData)
    })

    test('should update admin', async () => {
      const adminId = 1
      const updateData = { nickname: 'Updated' }

      vi.mocked(request.put).mockResolvedValue(undefined)

      await SystemAPI.updateAdmin(adminId, updateData)

      expect(request.put).toHaveBeenCalledWith(`/system/admins/${adminId}`, updateData)
    })

    test('should delete admin', async () => {
      const adminId = 1
      vi.mocked(request.delete).mockResolvedValue(undefined)

      await SystemAPI.deleteAdmin(adminId)

      expect(request.delete).toHaveBeenCalledWith(`/system/admins/${adminId}`)
    })

    test('should get roles', async () => {
      vi.mocked(request.get).mockResolvedValue({ list: [] })

      await SystemAPI.getRoles()

      expect(request.get).toHaveBeenCalledWith('/system/roles')
    })

    test('should get permissions', async () => {
      vi.mocked(request.get).mockResolvedValue({ list: [] })

      await SystemAPI.getPermissions()

      expect(request.get).toHaveBeenCalledWith('/system/permissions')
    })

    test('should get operation logs', async () => {
      const params = { page: 1, pageSize: 20 }
      vi.mocked(request.get).mockResolvedValue({ list: [], total: 0 })

      await SystemAPI.getOperationLogs(params)

      expect(request.get).toHaveBeenCalledWith('/system/logs', { params })
    })

    test('should get configs', async () => {
      vi.mocked(request.get).mockResolvedValue({ list: [] })

      await SystemAPI.getConfigs()

      expect(request.get).toHaveBeenCalledWith('/system/configs')
    })

    test('should update config', async () => {
      const configId = 1
      const updateData = { value: 'new_value' }

      vi.mocked(request.put).mockResolvedValue(undefined)

      await SystemAPI.updateConfig(configId, updateData)

      expect(request.put).toHaveBeenCalledWith(`/system/configs/${configId}`, updateData)
    })

    test('should get statistics', async () => {
      vi.mocked(request.get).mockResolvedValue({ users: 100, parties: 50 })

      await SystemAPI.getStatistics()

      expect(request.get).toHaveBeenCalledWith('/system/stats')
    })
  })
})
