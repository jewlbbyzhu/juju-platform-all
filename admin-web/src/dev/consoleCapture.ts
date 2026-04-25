export function initConsoleCapture() {
  const original = {
    log: console.log,
    info: console.info,
    warn: console.warn,
    error: console.error
  }
  const buffer: Array<{ level: string; message: any[]; timestamp: string; url: string }> = []
  ;(window as any).__consoleLogs = buffer
  const wrap = (level: 'log' | 'info' | 'warn' | 'error') => {
    return (...args: any[]) => {
      try {
        buffer.push({ level, message: args, timestamp: new Date().toISOString(), url: location.href })
      } catch {}
      original[level](...args)
    }
  }
  console.log = wrap('log')
  console.info = wrap('info')
  console.warn = wrap('warn')
  console.error = wrap('error')
}
