export function formatDate(date, format = 'YYYY-MM-DD HH:mm:ss') {
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
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hour)
    .replace('mm', minute)
    .replace('ss', second);
}

export function formatPrice(price, unit = 'yuan') {
  if (price === null || price === undefined) return '0.00';
  const priceInYuan = unit === 'cents' ? price / 100 : price;
  return priceInYuan.toFixed(2);
}

export function formatPartyStatus(status) {
  const statusMap = {
    0: '草稿',
    1: '已发布',
    2: '已取消',
    3: '已结束'
  };
  return statusMap[status] || '未知';
}

export function formatOrderStatus(status) {
  const statusMap = {
    0: '待支付',
    1: '已支付',
    2: '已取消',
    3: '已退款',
    4: '已完成'
  };
  return statusMap[status] || '未知';
}
