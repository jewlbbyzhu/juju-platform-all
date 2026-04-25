import { test, expect } from '@playwright/test'

test.describe('SSO Authentication', () => {
  test('redirects to admin web for admin users', async ({ page, context }) => {
    await context.addInitScript(() => {
      localStorage.setItem('token', 'admin-token')
      localStorage.setItem('user', JSON.stringify({
        id: 1,
        email: 'admin@example.com',
        nickname: 'Admin',
        role: 'admin'
      }))
    })

    await page.goto('/login')
    
    await expect(page).toHaveURL(/.*admin-web/)
  })

  test('handles successful SSO callback', async ({ page }) => {
    await page.goto('/sso/callback?token=test-token')
    
    await expect(page.getByText('登录成功')).toBeVisible()
    await expect(page.getByText('正在跳转...')).toBeVisible()
  })

  test('handles failed SSO callback', async ({ page }) => {
    await page.goto('/sso/callback?error=Authentication%20failed')
    
    await expect(page.getByText('登录失败')).toBeVisible()
    await expect(page.getByText('Authentication failed')).toBeVisible()
  })

  test('shows retry button on SSO failure', async ({ page }) => {
    await page.goto('/sso/callback?error=Authentication%20failed')
    
    const retryButton = page.getByText('返回登录')
    await expect(retryButton).toBeVisible()
    await retryButton.click()
    
    await expect(page).toHaveURL(/.*login/)
  })
})
