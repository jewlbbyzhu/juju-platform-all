import { test, expect } from '@playwright/test'

test.describe('Error Handling - E2E', () => {
  test('shows 404 page for non-existent routes', async ({ page }) => {
    await page.goto('/non-existent-page')
    
    await expect(page.getByText('404')).toBeVisible()
    await expect(page.getByText(/页面不存在/)).toBeVisible()
  })

  test('shows error boundary on component error', async ({ page }) => {
    await page.goto('/')
    
    await page.evaluate(() => {
      throw new Error('Test error')
    })
    
    await expect(page.getByText(/出错了/)).toBeVisible()
  })

  test('handles network errors gracefully', async ({ page, context }) => {
    await context.setOffline(true)
    
    await page.goto('/')
    
    await expect(page.getByText(/网络/)).toBeVisible()
  })

  test('shows loading state during slow network', async ({ page, context }) => {
    await context.route('**/*', route => {
      setTimeout(() => route.continue(), 3000)
    })
    
    await page.goto('/download')
    
    await expect(page.getByText('加载中...')).toBeVisible()
  })

  test('handles API timeout', async ({ page, context }) => {
    await context.route('**/api/**', route => {
      setTimeout(() => route.fulfill({ status: 504, body: 'Gateway timeout' }), 30000)
    })
    
    await page.goto('/')
    
    await expect(page.getByText(/超时/)).toBeVisible()
  })

  test('handles API rate limiting', async ({ page, context }) => {
    await context.route('**/api/**', route => {
      route.fulfill({ status: 429, body: 'Rate limit exceeded' })
    })
    
    await page.goto('/')
    
    await expect(page.getByText(/请求过多/)).toBeVisible()
  })

  test('handles server errors', async ({ page, context }) => {
    await context.route('**/api/**', route => {
      route.fulfill({ status: 500, body: 'Internal server error' })
    })
    
    await page.goto('/')
    
    await expect(page.getByText(/服务器错误/)).toBeVisible()
  })

  test('handles malformed API responses', async ({ page, context }) => {
    await context.route('**/api/**', route => {
      route.fulfill({ 
        status: 200, 
        body: 'Invalid JSON',
        contentType: 'application/json'
      })
    })
    
    await page.goto('/')
    
    await expect(page.getByText(/数据错误/)).toBeVisible()
  })
})

test.describe('Security - E2E', () => {
  test('prevents XSS attacks', async ({ page }) => {
    await page.goto('/search')
    
    const searchInput = page.getByPlaceholder('搜索帮助文档...')
    await searchInput.fill('<script>alert("XSS")</script>')
    await page.getByText('搜索').click()
    
    await expect(page.locator('script')).not.toBeAttached()
  })

  test('sanitizes user input', async ({ page }) => {
    await page.goto('/login')
    
    const emailInput = page.getByPlaceholder('请输入邮箱')
    await emailInput.fill('<img src=x onerror=alert(1)>')
    
    const inputValue = await emailInput.inputValue()
    expect(inputValue).not.toContain('<img')
  })

  test('validates CSRF tokens', async ({ page }) => {
    await page.goto('/login')
    
    const csrfToken = await page.evaluate(() => {
      return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
    })
    
    expect(csrfToken).toBeTruthy()
  })

  test('uses secure cookies', async ({ page, context }) => {
    await page.goto('/')
    
    const cookies = await context.cookies()
    
    cookies.forEach(cookie => {
      expect(cookie.secure).toBe(true)
      expect(cookie.httpOnly).toBe(true)
      expect(cookie.sameSite).toBe('Strict')
    })
  })
})

test.describe('Performance - E2E', () => {
  test('meets Core Web Vitals thresholds', async ({ page }) => {
    await page.goto('/')
    
    const metrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          resolve(list.getEntries())
        }).observe({ entryTypes: ['navigation', 'paint'] })
      })
    })

    const navigation = metrics.find(m => m.entryType === 'navigation')
    expect(navigation?.duration).toBeLessThan(3000)
  })

  test('has fast First Contentful Paint', async ({ page }) => {
    await page.goto('/')
    
    const fcp = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const fcp = list.getEntries().find(e => e.name === 'first-contentful-paint')
          resolve(fcp?.startTime || 0)
        }).observe({ entryTypes: ['paint'] })
      })
    })

    expect(fcp).toBeLessThan(2000)
  })

  test('has fast Largest Contentful Paint', async ({ page }) => {
    await page.goto('/')
    
    const lcp = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const lcp = list.getEntries().find(e => e.name === 'largest-contentful-paint')
          resolve(lcp?.startTime || 0)
        }).observe({ entryTypes: ['paint'] })
      })
    })

    expect(lcp).toBeLessThan(2500)
  })

  test('has low Cumulative Layout Shift', async ({ page }) => {
    await page.goto('/')
    
    const cls = await page.evaluate(() => {
      return new Promise((resolve) => {
        let clsValue = 0
        new PerformanceObserver((list) => {
          list.getEntries().forEach(entry => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value
            }
          })
          resolve(clsValue)
        }).observe({ entryTypes: ['layout-shift'] })
      })
    })

    expect(clsValue).toBeLessThan(0.1)
  })

  test('has fast Time to Interactive', async ({ page }) => {
    await page.goto('/')
    
    const tti = await page.evaluate(() => {
      return new Promise((resolve) => {
        let ttiValue = 0
        new PerformanceObserver((list) => {
          list.getEntries().forEach(entry => {
            if (entry.duration > 50) {
              ttiValue = entry.startTime + entry.duration
            }
          })
          resolve(ttiValue)
        }).observe({ entryTypes: ['longtask'] })
      })
    })

    expect(tti).toBeLessThan(4000)
  })
})

test.describe('Accessibility - E2E', () => {
  test('has proper ARIA labels', async ({ page }) => {
    await page.goto('/')
    
    const buttons = await page.locator('button').all()
    for (const button of buttons) {
      const ariaLabel = await button.getAttribute('aria-label')
      const text = await button.textContent()
      
      if (!ariaLabel) {
        expect(text).toBeTruthy()
      }
    }
  })

  test('supports keyboard navigation', async ({ page }) => {
    await page.goto('/')
    
    const focusableElements = await page.locator('button, a, input, [tabindex]').all()
    
    for (let i = 0; i < focusableElements.length; i++) {
      await page.keyboard.press('Tab')
      
      const focusedElement = page.locator(':focus')
      await expect(focusedElement).toBeVisible()
    }
  })

  test('has proper heading hierarchy', async ({ page }) => {
    await page.goto('/')
    
    const h1s = await page.locator('h1').count()
    const h2s = await page.locator('h2').count()
    const h3s = await page.locator('h3').count()
    
    expect(h1s).toBe(1)
    expect(h2s).toBeGreaterThan(0)
    expect(h3s).toBeGreaterThan(0)
  })

  test('has proper alt text for images', async ({ page }) => {
    await page.goto('/')
    
    const images = await page.locator('img').all()
    
    for (const image of images) {
      const alt = await image.getAttribute('alt')
      expect(alt).toBeTruthy()
    }
  })

  test('has proper color contrast', async ({ page }) => {
    await page.goto('/')
    
    const contrastIssues = await page.evaluate(() => {
      const elements = document.querySelectorAll('*')
      let issues = 0
      
      elements.forEach(el => {
        const styles = window.getComputedStyle(el)
        const color = styles.color
        const bgColor = styles.backgroundColor
        
        if (color && bgColor) {
          const contrast = getContrastRatio(color, bgColor)
          if (contrast < 4.5) {
            issues++
          }
        }
      })
      
      return issues
    })
    
    expect(contrastIssues).toBe(0)
  })
})
