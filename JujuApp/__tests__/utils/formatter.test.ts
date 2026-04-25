import {
  formatDate,
  formatPrice,
  formatPartyStatus,
  formatOrderStatus,
  formatTicketStatus,
  formatNumber,
  formatRelativeTime,
} from '../../src/utils/formatter';

describe('formatDate', () => {
  it('should format date with default format', () => {
    const result = formatDate('2025-03-15 14:30:00');
    expect(result).toBe('2025-03-15 14:30:00');
  });

  it('should format date with custom format', () => {
    const result = formatDate('2025-03-15 14:30:00', 'YYYY年MM月DD日');
    expect(result).toBe('2025年03月15日');
  });

  it('should format date with time only', () => {
    const result = formatDate('2025-03-15 14:30:00', 'HH:mm');
    expect(result).toBe('14:30');
  });

  it('should handle Date object input', () => {
    const date = new Date(2025, 2, 15, 14, 30, 0);
    const result = formatDate(date, 'YYYY-MM-DD');
    expect(result).toBe('2025-03-15');
  });

  it('should return empty string for null/undefined', () => {
    expect(formatDate('')).toBe('');
    expect(formatDate(null as any)).toBe('');
    expect(formatDate(undefined as any)).toBe('');
  });

  it('should return empty string for invalid date', () => {
    expect(formatDate('invalid date')).toBe('');
    expect(formatDate('2025-99-99')).toBe('');
  });

  it('should handle different format patterns', () => {
    const date = '2025-03-15 14:30:45';
    expect(formatDate(date, 'YYYY/MM/DD')).toBe('2025/03/15');
    expect(formatDate(date, 'MM-DD-YYYY')).toBe('03-15-2025');
    expect(formatDate(date, 'DD.MM.YYYY')).toBe('15.03.2025');
  });
});

describe('formatPrice', () => {
  it('should format price in yuan', () => {
    expect(formatPrice(100, 'yuan')).toBe('100.00');
    expect(formatPrice(99.9, 'yuan')).toBe('99.90');
    expect(formatPrice(0, 'yuan')).toBe('0.00');
  });

  it('should format price in cents', () => {
    expect(formatPrice(10000, 'cents')).toBe('100.00');
    expect(formatPrice(999, 'cents')).toBe('9.99');
    expect(formatPrice(0, 'cents')).toBe('0.00');
  });

  it('should handle null and undefined', () => {
    expect(formatPrice(null)).toBe('0.00');
    expect(formatPrice(undefined)).toBe('0.00');
  });

  it('should handle negative prices', () => {
    expect(formatPrice(-100, 'yuan')).toBe('-100.00');
  });

  it('should default to yuan unit', () => {
    expect(formatPrice(50)).toBe('50.00');
  });
});

describe('formatPartyStatus', () => {
  it('should format numeric status', () => {
    expect(formatPartyStatus(0)).toBe('草稿');
    expect(formatPartyStatus(1)).toBe('已发布');
    expect(formatPartyStatus(2)).toBe('已取消');
    expect(formatPartyStatus(3)).toBe('已结束');
  });

  it('should format string status', () => {
    expect(formatPartyStatus('upcoming')).toBe('即将开始');
    expect(formatPartyStatus('ongoing')).toBe('进行中');
    expect(formatPartyStatus('ended')).toBe('已结束');
    expect(formatPartyStatus('cancelled')).toBe('已取消');
  });

  it('should return unknown for invalid status', () => {
    expect(formatPartyStatus(99)).toBe('未知');
    expect(formatPartyStatus('invalid')).toBe('未知');
    expect(formatPartyStatus('')).toBe('未知');
  });
});

describe('formatOrderStatus', () => {
  it('should format numeric status', () => {
    expect(formatOrderStatus(0)).toBe('待支付');
    expect(formatOrderStatus(1)).toBe('已支付');
    expect(formatOrderStatus(2)).toBe('已取消');
    expect(formatOrderStatus(3)).toBe('已退款');
    expect(formatOrderStatus(4)).toBe('已完成');
  });

  it('should format string status', () => {
    expect(formatOrderStatus('pending')).toBe('待支付');
    expect(formatOrderStatus('paid')).toBe('已支付');
    expect(formatOrderStatus('completed')).toBe('已完成');
    expect(formatOrderStatus('cancelled')).toBe('已取消');
    expect(formatOrderStatus('refunded')).toBe('已退款');
  });

  it('should return unknown for invalid status', () => {
    expect(formatOrderStatus(99)).toBe('未知');
    expect(formatOrderStatus('unknown')).toBe('未知');
  });
});

describe('formatTicketStatus', () => {
  it('should format numeric status', () => {
    expect(formatTicketStatus(0)).toBe('未使用');
    expect(formatTicketStatus(1)).toBe('已使用');
    expect(formatTicketStatus(2)).toBe('已过期');
    expect(formatTicketStatus(3)).toBe('已退款');
  });

  it('should format string status', () => {
    expect(formatTicketStatus('unused')).toBe('未使用');
    expect(formatTicketStatus('used')).toBe('已使用');
    expect(formatTicketStatus('expired')).toBe('已过期');
    expect(formatTicketStatus('refunded')).toBe('已退款');
  });

  it('should return unknown for invalid status', () => {
    expect(formatTicketStatus(99)).toBe('未知');
    expect(formatTicketStatus('invalid')).toBe('未知');
  });
});

describe('formatNumber', () => {
  it('should format number with thousand separators', () => {
    expect(formatNumber(1000)).toBe('1,000');
    expect(formatNumber(1000000)).toBe('1,000,000');
    expect(formatNumber(1234567)).toBe('1,234,567');
  });

  it('should handle small numbers', () => {
    expect(formatNumber(0)).toBe('0');
    expect(formatNumber(999)).toBe('999');
  });

  it('should handle negative numbers', () => {
    expect(formatNumber(-1000)).toBe('-1,000');
  });

  it('should handle decimal numbers', () => {
    expect(formatNumber(1000.5)).toBe('1,000.5');
    // Note: toLocaleString may format decimals differently based on locale
    expect(formatNumber(1234.5678)).toMatch(/1,234\.567?8?/);
  });
});

describe('formatRelativeTime', () => {
  beforeEach(() => {
    // Mock current time to 2025-03-15 12:00:00
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-03-15T12:00:00'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should return "刚刚" for recent time', () => {
    const date = new Date('2025-03-15T11:59:30');
    expect(formatRelativeTime(date)).toBe('刚刚');
  });

  it('should return minutes ago', () => {
    const date = new Date('2025-03-15T11:55:00');
    expect(formatRelativeTime(date)).toBe('5分钟前');
  });

  it('should return hours ago', () => {
    const date = new Date('2025-03-15T10:00:00');
    expect(formatRelativeTime(date)).toBe('2小时前');
  });

  it('should return days ago', () => {
    const date = new Date('2025-03-13T12:00:00');
    expect(formatRelativeTime(date)).toBe('2天前');
  });

  it('should return formatted date for old dates', () => {
    const date = new Date('2025-03-01T12:00:00');
    expect(formatRelativeTime(date)).toBe('2025-03-01');
  });

  it('should handle string date input', () => {
    expect(formatRelativeTime('2025-03-15T11:55:00')).toBe('5分钟前');
  });
});
