// 日期格式化
export function formatDate(date: string | Date, format: string = 'YYYY-MM-DD HH:mm:ss'): string {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hour = String(d.getHours()).padStart(2, '0');
  const minute = String(d.getMinutes()).padStart(2, '0');
  const second = String(d.getSeconds()).padStart(2, '0');

  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hour)
    .replace('mm', minute)
    .replace('ss', second);
}

// 价格格式化
export function formatPrice(price: number | null | undefined, unit: 'yuan' | 'cents' = 'yuan'): string {
  if (price === null || price === undefined) return '0.00';
  const priceInYuan = unit === 'cents' ? price / 100 : price;
  return priceInYuan.toFixed(2);
}

// 聚会状态格式化
export function formatPartyStatus(status: number | string): string {
  const statusMap: Record<number | string, string> = {
    0: '草稿',
    1: '已发布',
    2: '已取消',
    3: '已结束',
    upcoming: '即将开始',
    ongoing: '进行中',
    ended: '已结束',
    cancelled: '已取消',
  };
  return statusMap[status] || '未知';
}

// 订单状态格式化
export function formatOrderStatus(status: number | string): string {
  const statusMap: Record<number | string, string> = {
    0: '待支付',
    1: '已支付',
    2: '已取消',
    3: '已退款',
    4: '已完成',
    pending: '待支付',
    paid: '已支付',
    completed: '已完成',
    cancelled: '已取消',
    refunded: '已退款',
  };
  return statusMap[status] || '未知';
}

// 票券状态格式化
export function formatTicketStatus(status: number | string): string {
  const statusMap: Record<number | string, string> = {
    0: '未使用',
    1: '已使用',
    2: '已过期',
    3: '已退款',
    unused: '未使用',
    used: '已使用',
    expired: '已过期',
    refunded: '已退款',
  };
  return statusMap[status] || '未知';
}

// 数字千分位格式化
export function formatNumber(num: number): string {
  return num.toLocaleString('zh-CN');
}

// 相对时间
export function formatRelativeTime(date: string | Date): string {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  
  if (diff < minute) return '刚刚';
  if (diff < hour) return `${Math.floor(diff / minute)}分钟前`;
  if (diff < day) return `${Math.floor(diff / hour)}小时前`;
  if (diff < 7 * day) return `${Math.floor(diff / day)}天前`;
  
  return formatDate(date, 'YYYY-MM-DD');
}
