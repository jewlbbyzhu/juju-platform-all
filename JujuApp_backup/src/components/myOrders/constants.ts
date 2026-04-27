import type { TabKey, OrderStatusConfig } from './types';

export const TABS: Array<{ key: TabKey; label: string }> = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待支付' },
  { key: 'paid', label: '已支付' },
  { key: 'completed', label: '已完成' },
  { key: 'cancelled', label: '已取消' },
];

export const createStatusMap = (
  colors: ReturnType<typeof import('../../theme').useTheme>['colors'],
): Record<string, OrderStatusConfig> => ({
  pending: {
    label: '待支付',
    color: colors.status.warning,
    icon: '⏳',
    gradient: [colors.status.warning, colors.accent.orange],
  },
  paid: {
    label: '已支付',
    color: colors.status.success,
    icon: '✅',
    gradient: [colors.status.success, colors.accent.cyan],
  },
  completed: {
    label: '已完成',
    color: colors.status.info,
    icon: '✨',
    gradient: [colors.status.info, colors.secondary.main],
  },
  cancelled: {
    label: '已取消',
    color: colors.status.error,
    icon: '❌',
    gradient: [colors.status.error, colors.gray[600]],
  },
  refunded: {
    label: '已退款',
    color: colors.text.tertiary,
    icon: '↩️',
    gradient: [colors.text.tertiary, colors.gray[500]],
  },
});

export type { TabKey };
