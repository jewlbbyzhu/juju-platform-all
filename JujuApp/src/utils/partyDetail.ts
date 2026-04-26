import { colors } from '../theme/colors';

export interface StatusConfig {
  text: string;
  color: string;
  bgColor: string;
  icon: string;
}

export const STATUS_CONFIG: Record<number, StatusConfig> = {
  0: {
    text: '待审核',
    color: colors.status.warning,
    bgColor: colors.status.warning + '33',
    icon: '⏳',
  },
  1: {
    text: '报名中',
    color: colors.status.success,
    bgColor: colors.status.success + '33',
    icon: '✅',
  },
  2: {
    text: '已满员',
    color: colors.status.error,
    bgColor: colors.status.error + '33',
    icon: '🔴',
  },
  3: {
    text: '已结束',
    color: colors.gray[500],
    bgColor: colors.gray[500] + '33',
    icon: '✓',
  },
  4: {
    text: '已取消',
    color: colors.gray[400],
    bgColor: colors.gray[400] + '33',
    icon: '✕',
  },
};

export const formatDateTime = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString('zh-CN', {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
};
