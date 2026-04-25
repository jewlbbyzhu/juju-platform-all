/**
 * Calculate growth rate between two values
 * @param current - Current value
 * @param previous - Previous value
 * @returns Growth rate as a percentage
 */
export function calculateGrowthRate(current: number, previous: number): number {
  // Handle edge cases
  if (previous === 0 || !isFinite(previous)) {
    return current > 0 ? 100 : 0
  }
  
  // Handle very small numbers to avoid precision issues
  const threshold = 1e-10
  if (Math.abs(previous) < threshold) {
    return current > 0 ? 100 : 0
  }
  
  const rate = ((current - previous) / previous) * 100
  
  // Return 0 if result is NaN or not finite
  if (!isFinite(rate)) {
    return 0
  }
  
  return rate
}

/**
 * Determine trend type based on growth rate
 * @param growthRate - Growth rate percentage
 * @returns Trend type: 'up', 'down', or 'stable'
 */
export function getTrendType(growthRate: number): 'up' | 'down' | 'stable' {
  if (growthRate > 0.1) return 'up'
  if (growthRate < -0.1) return 'down'
  return 'stable'
}

/**
 * Format number with thousand separators
 * @param value - Number to format
 * @returns Formatted string
 */
export function formatNumber(value: number): string {
  return value.toLocaleString('zh-CN')
}

/**
 * Format currency value
 * @param value - Amount in cents
 * @returns Formatted currency string
 */
export function formatCurrency(value: number): string {
  const yuan = value / 100
  return `¥${yuan.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}
