import type { Order } from '../../api/order';

export interface OrderStatusConfig {
  label: string;
  color: string;
  icon: string;
  gradient: string[];
}

export type TabKey = 'all' | 'pending' | 'paid' | 'completed' | 'cancelled';

export interface OrderCardProps {
  item: Order;
  index: number;
  STATUS_MAP: Record<string, OrderStatusConfig>;
  colors: ReturnType<typeof import('../../theme').useTheme>['colors'];
  typography: ReturnType<typeof import('../../theme').useTheme>['typography'];
  spacing: ReturnType<typeof import('../../theme').useTheme>['spacing'];
  onPress: () => void;
  onCancel: () => void;
  onPay: () => void;
}

export interface OrderTabsProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  colors: ReturnType<typeof import('../../theme').useTheme>['colors'];
  typography: ReturnType<typeof import('../../theme').useTheme>['typography'];
  spacing: ReturnType<typeof import('../../theme').useTheme>['spacing'];
  tabs: Array<{ key: TabKey; label: string }>;
}

export interface OrderListProps {
  orders: Order[];
  loading: boolean;
  refreshing: boolean;
  hasMore: boolean;
  ListEmptyComponent: React.ReactElement | null;
  ListFooterComponent: React.ReactElement | null;
  refreshControl: React.ReactElement | null;
  renderItem: (params: { item: Order; index: number }) => React.ReactElement;
  keyExtractor: (item: Order) => string;
  onEndReached: () => void;
}

export type { Order };
