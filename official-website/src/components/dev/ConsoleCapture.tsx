"use client"
import { useEffect, useMemo, useState } from 'react'

type LogItem = { level: 'info'|'warn'|'error'|'log'; message: any[]; timestamp: number }

export default function ConsoleCapture() {
  const [open, setOpen] = useState(false)
  const [logs, setLogs] = useState<LogItem[]>([])
  const [limit, setLimit] = useState<number | null>(null)

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return
    const orig = { log: console.log, info: console.info, warn: console.warn, error: console.error }
    const push = (level: LogItem['level'], args: any[]) => setLogs(prev => [...prev, { level, message: args, timestamp: Date.now() }])
    console.log = (...a) => { push('log', a); orig.log(...a) }
    console.info = (...a) => { push('info', a); orig.info(...a) }
    console.warn = (...a) => { push('warn', a); orig.warn(...a) }
    console.error = (...a) => { push('error', a); orig.error(...a) }
    const onError = (e: ErrorEvent) => push('error', [e.message])
    const onRej = (e: PromiseRejectionEvent) => push('error', [String(e.reason)])
    window.addEventListener('error', onError)
    window.addEventListener('unhandledrejection', onRej)
    return () => {
      console.log = orig.log; console.info = orig.info; console.warn = orig.warn; console.error = orig.error
      window.removeEventListener('error', onError)
      window.removeEventListener('unhandledrejection', onRej)
    }
  }, [])

  const summary = useMemo(() => {
    const s = { info: 0, warn: 0, error: 0, log: 0 }
    for (const l of logs) s[l.level]++
    return s
  }, [logs])

  const handleExport = () => {
    const exportLogs = limit ? logs.slice(-limit) : logs
    const blob = new Blob([JSON.stringify({ summary, logs: exportLogs }, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `website-logs-${limit ?? 'all'}-${Date.now()}.json`; a.click()
    setTimeout(() => URL.revokeObjectURL(url), 500)
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('logPanel') === 'true') setOpen(true)
    const l = params.get('logsLimit'); if (l) setLimit(Number(l) || null)
    if (params.get('autoExportLogs') === 'true') {
      setTimeout(() => handleExport(), 1200)
    }
  }, [])

  return (
    <div style={{ position: 'fixed', right: 12, bottom: 12, zIndex: 9999 }}>
      <button onClick={() => setOpen(o=>!o)} style={{ padding: '8px 12px', borderRadius: 8, background: '#111', color: '#fff' }}>日志 {summary.error>0?`❗${summary.error}`:''}</button>
      {open && (
        <div style={{ marginTop: 8, width: 420, maxHeight: 320, overflow: 'auto', background: '#fff', border: '1px solid #ddd', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          <div style={{ display:'flex', justifyContent:'space-between', padding: '8px 12px', borderBottom: '1px solid #eee' }}>
            <div>info {summary.info} · warn {summary.warn} · error {summary.error} · 显示 {limit ?? '全部'}</div>
            <div style={{ display:'flex', gap: 8 }}>
              <button onClick={() => setLimit(10)} style={{ padding: '6px 10px', borderRadius: 6, background: '#4a5568', color:'#fff' }}>显示10条</button>
              <button onClick={() => setLimit(null)} style={{ padding: '6px 10px', borderRadius: 6, background: '#2d3748', color:'#fff' }}>显示全部</button>
              <button onClick={handleExport} style={{ padding: '6px 10px', borderRadius: 6, background: '#6b46c1', color:'#fff' }}>导出</button>
            </div>
          </div>
          <ul style={{ listStyle: 'none', padding: 12, margin: 0 }}>
            {(limit ? logs.slice(-limit) : logs.slice(-100)).map((l, i) => (
              <li key={i} style={{ fontSize: 12, color: l.level==='error'?'#c53030':(l.level==='warn'?'#b7791f':'#2b6cb0'), marginBottom: 6 }}>
                <strong>[{l.level}]</strong> {new Date(l.timestamp).toLocaleTimeString()} — {l.message.map(x=>typeof x==='string'?x:JSON.stringify(x)).join(' ')}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
