import type { QuickAction } from './types';
import type { RootStackParamList } from '../../types';

export const QUICK_ACTIONS: QuickAction[] = [
  {
    name: '转账',
    icon: '↗️',
    route: 'Transfer' as keyof RootStackParamList,
    desc: '向好友转账',
  },
  {
    name: '银行卡',
    icon: '💳',
    route: 'BankCards' as keyof RootStackParamList,
    desc: '管理银行卡',
  },
  { name: '交易记录', icon: '📊', route: 'Transactions', desc: '查看明细' },
  {
    name: '安全中心',
    icon: '🔒',
    route: 'Security' as keyof RootStackParamList,
    desc: '密码管理',
  },
];

export const TRANSACTION_ICONS: Record<string, string> = {
  recharge: '💰',
  withdraw: '💸',
  payment: '💳',
  refund: '↩️',
  income: '💵',
  transfer: '↗️',
};

export const STATUS_TEXT: Record<number, string> = {
  0: '处理中',
  1: '成功',
  2: '失败',
  3: '已取消',
};

export const getTransactionIcon = (type: string): string =>
  TRANSACTION_ICONS[type] || '📋';
export const getStatusText = (status: number): string =>
  STATUS_TEXT[status] || '未知';
