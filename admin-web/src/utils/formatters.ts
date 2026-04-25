/**
 * 安全的日期格式化函数
 * @param value 日期值（字符串、数字、Date对象）
 * @param fallback 当日期无效时的回退显示文本
 * @returns 格式化后的日期字符串或回退文本
 */
export function formatDate(
  value: string | number | Date | null | undefined,
  fallback: string = '-'
): string {
  if (!value || value === 'null' || value === 'undefined' || value === 'NaN') {
    return fallback
  }

  try {
    const date = new Date(value)
    if (isNaN(date.getTime())) {
      return fallback
    }
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  } catch (error) {
    return fallback
  }
}

/**
 * 安全的数字格式化函数
 * @param value 数字值
 * @param decimals 小数位数
 * @param fallback 当数字无效时的回退显示文本
 * @returns 格式化后的数字字符串或回退文本
 */
export function formatNumber(
  value: number | string | null | undefined,
  decimals: number = 2,
  fallback: string = '-'
): string {
  if (value === null || value === undefined || value === '' || value === 'null' || value === 'undefined') {
    return fallback
  }

  const num = typeof value === 'string' ? parseFloat(value) : value

  if (isNaN(num)) {
    return fallback
  }

  // 处理 0.00 的情况，如果原始值是0或空，显示 '-'
  if (num === 0 && (value === 0 || value === '0' || value === '')) {
    return fallback
  }

  return num.toFixed(decimals)
}

/**
 * 安全的货币格式化函数
 * @param value 金额值
 * @param currency 货币符号
 * @param fallback 当金额无效时的回退显示文本
 * @returns 格式化后的货币字符串或回退文本
 */
export function formatCurrency(
  value: number | string | null | undefined,
  currency: string = '¥',
  fallback: string = '-'
): string {
  const formatted = formatNumber(value, 2, fallback)
  if (formatted === fallback) {
    return fallback
  }
  return `${currency}${formatted}`
}

/**
 * 安全的状态文本格式化函数
 * @param value 状态值
 * @param statusMap 状态映射表
 * @param fallback 当状态无效时的回退显示文本
 * @returns 格式化后的状态文本或回退文本
 */
export function formatStatus<T extends string | number>(
  value: T | null | undefined,
  statusMap: Record<T, string>,
  fallback: string = '-'
): string {
  if (value === null || value === undefined || value === '' || value === 'null' || value === 'undefined') {
    return fallback
  }
  return statusMap[value as T] || fallback
}

/**
 * 安全的文本截断函数
 * @param value 文本值
 * @param maxLength 最大长度
 * @param suffix 截断后缀
 * @param fallback 当文本无效时的回退显示文本
 * @returns 截断后的文本或回退文本
 */
export function truncateText(
  value: string | null | undefined,
  maxLength: number = 50,
  suffix: string = '...',
  fallback: string = '-'
): string {
  if (!value || value === 'null' || value === 'undefined') {
    return fallback
  }

  if (value.length <= maxLength) {
    return value
  }

  return value.slice(0, maxLength) + suffix
}
