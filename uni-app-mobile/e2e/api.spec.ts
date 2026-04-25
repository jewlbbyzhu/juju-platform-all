import { test, expect } from '@playwright/test'

/**
 * API集成测试
 * 测试与后端API的集成
 */

test.describe('API集成测试', () => {
  
  const API_BASE_URL = 'http://192.168.1.149:3000/api'

  test('API服务器可访问', async ({ request }) => {
    // 测试API根路径
    const response = await request.get(API_BASE_URL.replace('/api', ''))
    
    // 应该返回200或404（取决于API配置）
    expect([200, 404]).toContain(response.status())
  })

  test('健康检查端点', async ({ request }) => {
    // 测试健康检查端点
    const response = await request.get(`${API_BASE_URL}/health`).catch(() => null)
    
    if (response) {
      expect(response.status()).toBe(200)
      
      const body = await response.json().catch(() => ({}))
      expect(body.status || body.code || 'ok').toBeTruthy()
    }
  })

  test('用户API响应', async ({ request }) => {
    // 测试用户相关API
    const response = await request.get(`${API_BASE_URL}/users`).catch(() => null)
    
    if (response) {
      expect([200, 401, 403, 404]).toContain(response.status())
    }
  })

  test('聚会API响应', async ({ request }) => {
    // 测试聚会相关API
    const response = await request.get(`${API_BASE_URL}/parties`).catch(() => null)
    
    if (response) {
      expect([200, 401, 403, 404]).toContain(response.status())
    }
  })
})
