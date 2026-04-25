"use client"
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

function sleep(ms: number) { return new Promise(res => setTimeout(res, ms)) }
function visible(el: HTMLElement) {
  const style = window.getComputedStyle(el)
  const rect = el.getBoundingClientRect()
  return style.visibility !== 'hidden' && style.display !== 'none' && rect.width > 0 && rect.height > 0
}

export default function AutoTapAudit() {
  const router = useRouter()

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return
    const params = new URLSearchParams(window.location.search)
    if (params.get('autoTap') !== 'true') return

    const routesParam = params.get('routes')
    const enableProbe = params.get('probe') === 'true'
    const autoExportProbe = params.get('autoExportProbe') === 'true'
    let routes: string[]
    if (routesParam === 'all') {
      routes = ['/', '/download', '/search', '/help', '/about', '/privacy', '/terms', '/login']
    } else {
      routes = (routesParam?.split(',').filter(Boolean) as string[]) ?? ['/', '/download', '/search']
    }

    const probeResults: Array<{ endpoint: string; params: Record<string, any>; ok: boolean; info?: any; error?: string }> = []

    const exportProbe = () => {
      try {
        const summary = {
          total: probeResults.length,
          ok: probeResults.filter(r=>r.ok).length,
          fail: probeResults.filter(r=>!r.ok).length,
          timestamp: new Date().toISOString()
        }
        const blob = new Blob([JSON.stringify({ summary, results: probeResults }, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url; a.download = `website-probe-${Date.now()}.json`; a.click()
        setTimeout(()=>URL.revokeObjectURL(url), 500)
      } catch (e) { console.warn('[website autoTap] export probe failed', e) }
    }

    ;(async () => {
      for (const path of routes) {
        try {
          console.info('[website autoTap] navigate:', path)
          router.push(path)
          await sleep(800)
          await runAutoTapOnPage()
          if (path === '/download') {
            try {
              await fetch('/api/version/android')
              await fetch('/api/version/ios')
              console.info('[website autoTap] version api ping')
            } catch (e) {
              console.warn('[website autoTap] version api failed', e)
            }
          }
          if (path === '/search') {
            try {
              if (enableProbe) {
                const combos = [
                  { keyword: 'test', page: '1', pageSize: '10' },
                  { keyword: 'party', category: 'general', page: '1', pageSize: '5' },
                  { keyword: '帮助', category: 'faq', page: '2', pageSize: '5' }
                ]
                for (const p of combos) {
                  const qs = new URLSearchParams(p as unknown as Record<string,string>)
                  const res = await fetch(`/api/search?${qs.toString()}`)
                  const json = await res.json().catch(() => ({}))
                  const ok = !!(json && json.success === true)
                  probeResults.push({ endpoint: '/api/search', params: p, ok, info: ok ? { count: Array.isArray(json?.data) ? json.data.length : (json?.data?.articles?.length ?? json?.data?.list?.length ?? 0) } : undefined, error: ok ? undefined : (json?.error?.message || 'unknown') })
                }
              } else {
                const res = await fetch('/api/search?keyword=test')
                const json = await res.json().catch(() => ({}))
                const ok = (json && json.success === true)
                console[ok ? 'info' : 'warn']('[website autoTap] search api', ok ? 'ok' : 'bad response', json?.data ? 'data ok' : 'no data')
              }
            } catch (e) {
              console.warn('[website autoTap] search api failed', e)
              probeResults.push({ endpoint: '/api/search', params: { keyword: 'test' }, ok: false, error: String(e) })
            }
          }
          if (path === '/' || path === '/about') {
            try {
              if (enableProbe) {
                const combos = [
                  { limit: '5' },
                  { limit: '5', category: '1' },
                  { limit: '5', status: 'published' },
                  { limit: '5', sortBy: 'popular' },
                  { limit: '5', minPrice: '1000', maxPrice: '5000' },
                  { limit: '5', participantsMin: '10', participantsMax: '100' }
                ]
                for (const p of combos) {
                  const qs = new URLSearchParams(p as unknown as Record<string,string>)
                  const res = await fetch(`/api/parties?${qs.toString()}`)
                  const json = await res.json().catch(() => ({}))
                  const data = (json?.data ?? json)
                  const ok = Array.isArray(data?.list) || Array.isArray(data)
                  probeResults.push({ endpoint: '/api/parties', params: p, ok, info: ok ? { count: Array.isArray(data?.list) ? data.list.length : (Array.isArray(data) ? data.length : 0) } : undefined, error: ok ? undefined : (json?.error?.message || 'invalid shape') })
                }
              } else {
                const res = await fetch('/api/parties?limit=5')
                const json = await res.json().catch(() => ({}))
                const data = (json?.data ?? json)
                const shapeOk = Array.isArray(data?.list) || Array.isArray(data)
                console[shapeOk ? 'info' : 'warn']('[website autoTap] parties api', shapeOk ? 'ok' : 'shape invalid')
              }
            } catch (e) {
              console.warn('[website autoTap] parties api failed', e)
              probeResults.push({ endpoint: '/api/parties', params: { limit: 5 }, ok: false, error: String(e) })
            }
          }
          await sleep(1200)
        } catch (e) {
          console.error('[website autoTap] page error:', path, e)
        }
      }
      console.info('[website autoTap] done')
      if (enableProbe && autoExportProbe) exportProbe()
    })()
  }, [router])

  return null
}

async function runAutoTapOnPage() {
  const selectors = ['button', 'a[href]:not([href="#"])', 'input[type="text"]']
  const maxPerSelector = 3
  for (const sel of selectors) {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>(sel))
      .filter(el => visible(el))
      .slice(0, maxPerSelector)
    for (const el of nodes) {
      try {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        await sleep(120)
        if (el.tagName === 'A') {
          const href = (el as HTMLAnchorElement).getAttribute('href') || ''
          if (href.startsWith('http')) continue
        }
        el.click()
        await sleep(160)
      } catch {}
    }
  }
}
