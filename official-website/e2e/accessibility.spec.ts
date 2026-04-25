import { test, expect } from '@playwright/test'

test.describe('Accessibility', () => {
  test('homepage has proper heading structure', async ({ page }) => {
    await page.goto('/')
    
    const h1 = page.locator('h1')
    await expect(h1).toHaveCount(1)
  })

  test('all images have alt text', async ({ page }) => {
    await page.goto('/')
    
    const images = page.locator('img')
    const count = await images.count()
    
    for (let i = 0; i < count; i++) {
      await expect(images.nth(i)).toHaveAttribute('alt')
    }
  })

  test('all links are keyboard accessible', async ({ page }) => {
    await page.goto('/')
    
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    
    const focusedElement = page.locator(':focus')
    await expect(focusedElement).toBeVisible()
  })

  test('forms have proper labels', async ({ page }) => {
    await page.goto('/login')
    
    const emailInput = page.getByPlaceholder('请输入邮箱')
    const passwordInput = page.getByPlaceholder('请输入密码')
    
    await expect(emailInput).toBeVisible()
    await expect(passwordInput).toBeVisible()
  })

  test('buttons have proper focus states', async ({ page }) => {
    await page.goto('/')
    
    const button = page.getByText('立即下载')
    await button.focus()
    
    await expect(button).toBeFocused()
  })
})

test.describe('Performance', () => {
  test('homepage loads within performance budget', async ({ page }) => {
    const startTime = Date.now()
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    const loadTime = Date.now() - startTime
    
    expect(loadTime).toBeLessThan(3000)
  })

  test('images are lazy loaded', async ({ page }) => {
    await page.goto('/')
    
    const images = page.locator('img[loading="lazy"]')
    const count = await images.count()
    
    expect(count).toBeGreaterThan(0)
  })

  test('no console errors', async ({ page }) => {
    const errors: string[] = []
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })

    await page.goto('/')
    
    expect(errors).toHaveLength(0)
  })
})

test.describe('SEO', () => {
  test('homepage has meta description', async ({ page }) => {
    await page.goto('/')
    
    const description = page.locator('meta[name="description"]')
    await expect(description).toHaveAttribute('content')
  })

  test('homepage has Open Graph tags', async ({ page }) => {
    await page.goto('/')
    
    const ogTitle = page.locator('meta[property="og:title"]')
    const ogDescription = page.locator('meta[property="og:description"]')
    
    await expect(ogTitle).toHaveAttribute('content')
    await expect(ogDescription).toHaveAttribute('content')
  })

  test('has canonical URL', async ({ page }) => {
    await page.goto('/')
    
    const canonical = page.locator('link[rel="canonical"]')
    await expect(canonical).toHaveAttribute('href')
  })

  test('has structured data', async ({ page }) => {
    await page.goto('/')
    
    const jsonLd = page.locator('script[type="application/ld+json"]')
    await expect(jsonLd).toBeVisible()
  })
})
