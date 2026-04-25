/**
 * 聚聚 (JUJU) App - 我的订单页面
 * 2026 设计系统重构版
 */

import React, { useState, useCallback, useRef } from 'react';
import {Text, RefreshControl, Alert, ViewStyle, TextStyle} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {FadeIn} from 'react-native-reanimated';
import { orderApi, Order } from '../api/order';
import type { NavigationProp } from '../types';
import {
  useTheme,
  animation,
  colors,
  spacing,
  typography,
  layout,
} from '../theme';
import { EmptyOrder } from '../components';
import {
  OrderCard,
  OrderTabs,
  OrderList,
  LoadingState,
  TABS,
  createStatusMap,
} from '../components/myOrders';
import type { TabKey } from '../components/myOrders';

// 命名样式对象替代 useMemo
const containerStyles: ViewStyle = {
  flex: 1,
  backgroundColor: colors.background.secondary,
};

const headerContainerStyle: ViewStyle = {
  paddingHorizontal: layout.screenPadding,
  paddingTop: spacing.sm,
  paddingBottom: spacing.xl,
};

const headerTitleStyle: TextStyle = {
  fontSize: typography.size.h2,
  fontWeight: typography.weight.bold,
  color: colors.text.inverse,
  textAlign: 'center',
};

const headerSubtitleStyle: TextStyle = {
  fontSize: typography.size.body2,
  color: colors.text.inverse,
  opacity: 0.7,
  textAlign: 'center',
  marginTop: spacing.xs,
};

export default function MyOrdersScreen(): React.JSX.Element {
  const { colors: themeColors } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchOrdersRef = useRef<
    (pageNum: number, reset: boolean) => Promise<void>
  >(undefined as unknown as (pageNum: number, reset: boolean) => Promise<void>);

  const STATUS_MAP = createStatusMap(themeColors);

  const fetchOrders = useCallback(
    async (pageNum: number = 1, reset: boolean = false) => {
      if (loading) return;
      setLoading(true);
      try {
        const params: { page: number; pageSize: number; status?: TabKey } = {
          page: pageNum,
          pageSize: 10,
        };
        if (activeTab !== 'all') {
          params.status = activeTab;
        }
        const res = await orderApi.getOrders(params);
        if (res.success) {
          const newOrders: Order[] = res.data?.list || [];
          if (reset) {
            setOrders(newOrders);
            setPage(1);
          } else {
            setOrders(prev => [...prev, ...newOrders]);
          }
          setHasMore(newOrders.length >= 10);
        }
      } catch (error) {
        console.error('加载订单失败:', error);
        Alert.alert('错误', '网络错误');
      } finally {
        setLoading(false);
        setRefreshing(false);
        setInitialLoading(false);
      }
    },
    [activeTab, loading],
  );

  fetchOrdersRef.current = fetchOrders;

  useFocusEffect(
    useCallback(() => {
      fetchOrders(1, true);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab]),
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchOrdersRef.current?.(1, true);
  }, []);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchOrdersRef.current?.(page + 1, false);
      setPage(p => p + 1);
    }
  }, [loading, hasMore, page]);

  const handleCancel = useCallback(async (order: Order) => {
    Alert.alert('确认取消', '确定要取消该订单吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '确定',
        onPress: async () => {
          try {
            const res = await orderApi.cancelOrder(order.id);
            if (res.success) {
              Alert.alert('成功', '订单已取消');
              fetchOrdersRef.current?.(1, true);
            } else {
              Alert.alert('错误', res.message);
            }
          } catch {
            Alert.alert('错误', '网络错误');
          }
        },
      },
    ]);
  }, []);

  const handlePay = useCallback(
    (order: Order) => {
      navigation.navigate('Payment', { order });
    },
    [navigation],
  );

  const handleOrderPress = useCallback(
    (orderId: number) => {
      navigation.navigate('OrderDetail', { orderId });
    },
    [navigation],
  );

  const handleTabChange = useCallback((tab: TabKey) => {
    setActiveTab(tab);
    setPage(1);
    setOrders([]);
  }, []);

  const ListEmptyComponent = !loading ? (
    <EmptyOrder
      actionText="去探索"
      onAction={() => navigation.navigate('Home')}
    />
  ) : null;

  const refreshControl = (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      colors={[themeColors.primary.main]}
      tintColor={themeColors.primary.main}
    />
  );

  const renderOrderItem = useCallback(
    ({ item, index }: { item: Order; index: number }) => (
      <OrderCard
        item={item}
        index={index}
        STATUS_MAP={STATUS_MAP}
        colors={themeColors}
        typography={typography}
        spacing={spacing}
        onPress={() => handleOrderPress(item.id)}
        onCancel={() => handleCancel(item)}
        onPay={() => handlePay(item)}
      />
    ),
    [
      STATUS_MAP,
      themeColors,
      handleOrderPress,
      handleCancel,
      handlePay,
    ],
  );

  const keyExtractor = useCallback((item: Order) => item.id.toString(), []);

  if (initialLoading) {
    return <LoadingState />;
  }

  return (
    <SafeAreaView style={containerStyles} edges={['top']}>
      <Animated.View entering={FadeIn.duration(animation.duration.normal)}>
        <LinearGradient
          colors={colors.primary.gradient as unknown as string[]}
          style={headerContainerStyle}
        >
          <Text style={headerTitleStyle}>我的订单</Text>
          <Text style={headerSubtitleStyle}>
            查看和管理您的所有订单
          </Text>
        </LinearGradient>
      </Animated.View>

      <OrderTabs
        activeTab={activeTab}
        onTabChange={handleTabChange}
        colors={themeColors}
        typography={typography}
        spacing={spacing}
        tabs={TABS}
      />

      <OrderList
        orders={orders}
        loading={loading}
        refreshing={refreshing}
        hasMore={hasMore}
        ListEmptyComponent={ListEmptyComponent}
        ListFooterComponent={null}
        refreshControl={refreshControl}
        renderItem={renderOrderItem}
        keyExtractor={keyExtractor}
        onEndReached={loadMore}
      />
    </SafeAreaView>
  );
}
