// Format utilities
export const formatCurrency = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '-'
  }
  return `¥${(amount / 100).toFixed(2)}`
}

export const formatDate = (date: string | Date | null | undefined, format = 'YYYY-MM-DD HH:mm:ss', fallback = '-'): string => {
  if (!date || date === 'null' || date === 'undefined' || date === 'NaN') {
    return fallback
  }

  const d = new Date(date)

  if (isNaN(d.getTime())) {
    return fallback
  }

  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')

  return format
    .replace('YYYY', year.toString())
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

export const formatFileSize = (bytes: number | null | undefined): string => {
  if (bytes === null || bytes === undefined || isNaN(bytes) || bytes === 0) return '0 B'

  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export const formatNumber = (num: number | null | undefined): string => {
  if (num === null || num === undefined || isNaN(num)) {
    return '-'
  }
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

export const formatDateTime = (date: string | Date): string => {
  return formatDate(date, 'YYYY-MM-DD HH:mm:ss')
}