import type { NavigationProp, RootStackParamList } from '../../types';

export interface Transaction {
  id: string;
  type: string;
  description: string;
  amount: string;
  status: number;
  created_at: string;
}

export interface WalletInfo {
  balance: string;
  frozen_balance: string;
  available_balance: string;
}

export interface QuickAction {
  name: string;
  icon: string;
  route: keyof RootStackParamList;
  desc: string;
}

export interface BalanceCardProps {
  walletInfo: WalletInfo | null;
  colors: ReturnType<typeof import('../../theme').useTheme>['colors'];
}

export interface QuickActionGridProps {
  colors: ReturnType<typeof import('../../theme').useTheme>['colors'];
  navigation: NavigationProp;
}

export interface TransactionItemProps {
  transaction: Transaction;
  colors: ReturnType<typeof import('../../theme').useTheme>['colors'];
  navigation: NavigationProp;
}

export interface TransactionListProps {
  transactions: Transaction[];
  colors: ReturnType<typeof import('../../theme').useTheme>['colors'];
  navigation: NavigationProp;
}
