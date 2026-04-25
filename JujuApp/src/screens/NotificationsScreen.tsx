/**
 * 聚聚 (JUJU) App - 通知页面
 * 2026 设计系统重构版
 */

import React, { useState, useCallback } from 'react';
import { FlatList, RefreshControl, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import {
  NotificationsHeader,
  NotificationStatsCard,
  NotificationTabSwitcher,
  NotificationItem,
  NotificationEmptyState,
  Notification,
} from '../components/notificationsScreen';
import {
  useTheme,
  spacing,
  animation,





} from '../theme';

type TabType = 'all' | 'unread';

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    title: '聚会提醒',
    message: '您报名的"周末烧烤聚会"将在明天下午2点开始，记得准时参加哦！',
    type: 'party',
    is_read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    related_id: '101',
  },
  {
    id: '2',
    title: '订单支付成功',
    message: '您的VIP会员卡续费已成功，有效期延长至2026年12月。',
    type: 'order',
    is_read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: '3',
    title: '新粉丝关注',
    message: '小明关注了您，去看看TA的主页吧！',
    type: 'social',
    is_read: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
  {
    id: '4',
    title: '钱包到账',
    message: '您的退款￥99.00已到账，请注意查收。',
    type: 'wallet',
    is_read: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: '5',
    title: '系统维护通知',
    message: '聚聚App将于今晚凌晨2点进行系统维护，预计耗时30分钟。',
    type: 'system',
    is_read: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
];

export default function NotificationsScreen(): React.JSX.Element {
  const { colors } = useTheme();
  const [currentTab, setCurrentTab] = useState<TabType>('all');
  const [notifications, setNotifications] =
    useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [refreshing, setRefreshing] = useState(false);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const filteredNotifications =
    currentTab === 'unread'
      ? notifications.filter(n => !n.is_read)
      : notifications;

  const handleMarkAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  }, []);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const renderItem = useCallback(
    ({ item, index }: { item: Notification; index: number }) => (
      <NotificationItem item={item} index={index} />
    ),
    [],
  );

  // 使用设计系统替代内联样式
  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: colors.background.primary,
  };

  // 列表容器样式
  const listContainerStyle: ViewStyle = {
    flex: 1,
    paddingHorizontal: spacing.lg,
  };

  // 空列表样式
  const emptyListStyle: ViewStyle = {
    flex: 1,
  };

  return (
    <SafeAreaView style={containerStyle} edges={['top']}>
      <NotificationsHeader />

      <Animated.View
        style={listContainerStyle}
        entering={FadeInDown.duration(animation.duration.normal).delay(100)}
      >
        <Animated.View
          entering={FadeInUp.duration(animation.duration.normal).delay(150)}
        >
          <NotificationStatsCard
            unreadCount={unreadCount}
            onMarkAllRead={handleMarkAllRead}
          />
        </Animated.View>

        <Animated.View
          entering={FadeInUp.duration(animation.duration.normal).delay(200)}
        >
          <NotificationTabSwitcher
            currentTab={currentTab}
            onTabChange={setCurrentTab}
          />
        </Animated.View>

        <FlatList
          data={filteredNotifications}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary.main}
            />
          }
          ListEmptyComponent={
            <NotificationEmptyState isUnread={currentTab === 'unread'} />
          }
          contentContainerStyle={
            filteredNotifications.length === 0 ? emptyListStyle : undefined
          }
        />
      </Animated.View>
    </SafeAreaView>
  );
}
