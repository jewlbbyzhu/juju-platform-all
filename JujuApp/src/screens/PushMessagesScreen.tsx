import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  Alert,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { pushApi } from '../api/push';
import {
  useTheme,
  spacing,
  BorderRadius,

  glow,
  typography,

} from '../theme';
import { GlassCard } from '../components/GlassCard';

interface PushMessage {
  id: string;
  title: string;
  content: string;
  type: 'party' | 'social' | 'system';
  is_read: boolean;
  created_at: string;
  action_url?: string;
}

export default function PushMessagesScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const [filterType, setFilterType] = useState<
    'all' | 'unread' | 'party' | 'social' | 'system'
  >('all');
  const [messages, setMessages] = useState<PushMessage[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const filteredMessages = messages.filter(m => {
    if (filterType === 'unread') return !m.is_read;
    if (filterType === 'party') return m.type === 'party';
    if (filterType === 'social') return m.type === 'social';
    if (filterType === 'system') return m.type === 'system';
    return true;
  });

  const loadMessages = useCallback(
    async (reset = false) => {
      const currentPage = reset ? 1 : page;
      if (loading || (!reset && !hasMore)) return;
      setLoading(true);
      try {
        const res: any = await pushApi.getPushMessages({
          page: currentPage,
          pageSize,
        });
        if ((res as any).code === 0 || (res as any).data) {
          const list = (res as any).data?.list || [];
          if (reset) setMessages(list);
          else setMessages(prev => [...prev, ...list]);
          setHasMore(list.length >= pageSize);
          setPage(currentPage + 1);
          loadUnreadCount();
        } else {
          Alert.alert('提示', '加载失败');
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [page, pageSize, loading, hasMore],
  );

  const loadMore = () => {
    if (!loading && hasMore) loadMessages(false);
  };

  const loadUnreadCount = useCallback(async () => {
    try {
      const res: any = await pushApi.getUnreadCount();
      if ((res as any).code === 0 || (res as any).data !== undefined)
        setUnreadCount((res as any).data?.count || 0);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    loadMessages(true);
  }, []);

  const handleMessageClick = async (message: PushMessage) => {
    if (!message.is_read) {
      try {
        const res: any = await pushApi.markAsRead(message.id);
        if ((res as any).code === 0) {
          setMessages(prev =>
            prev.map(m => (m.id === message.id ? { ...m, is_read: true } : m)),
          );
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      } catch {
        // ignore
      }
    }
    if (message.action_url) (navigation as any).navigate(message.action_url);
  };

  const markAsRead = async (message: PushMessage) => {
    if (message.is_read) {
      Alert.alert('提示', '已读');
      return;
    }
    try {
      const res: any = await pushApi.markAsRead(message.id);
      if ((res as any).code === 0) {
        setMessages(prev =>
          prev.map(m => (m.id === message.id ? { ...m, is_read: true } : m)),
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
        Alert.alert('提示', '已标记为已读');
      } else {
        Alert.alert('提示', '操作失败');
      }
    } catch {
      Alert.alert('提示', '操作失败');
    }
  };

  const deleteMessage = (message: PushMessage) => {
    Alert.alert('确认删除', '确定要删除这条消息吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        onPress: async () => {
          try {
            const res: any = await pushApi.deleteMessage(message.id);
            if ((res as any).code === 0) {
              setMessages(prev => prev.filter(m => m.id !== message.id));
              if (!message.is_read)
                setUnreadCount(prev => Math.max(0, prev - 1));
              Alert.alert('提示', '删除成功');
            } else {
              Alert.alert('提示', '删除失败');
            }
          } catch {
            // ignore
          }
        },
      },
    ]);
  };

  const showMessageActions = (message: PushMessage) => {
    Alert.alert('操作', '选择操作', [
      { text: '标记已读', onPress: () => markAsRead(message) },
      {
        text: '删除',
        onPress: () => deleteMessage(message),
        style: 'destructive',
      },
      { text: '取消', style: 'cancel' },
    ]);
  };

  const markAllRead = () => {
    Alert.alert('确认全部已读', '确定要将所有未读消息标记为已读吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '确定',
        onPress: async () => {
          try {
            const res: any = await pushApi.markAllAsRead();
            if ((res as any).code === 0) {
              setMessages(prev => prev.map(m => ({ ...m, is_read: true })));
              setUnreadCount(0);
              Alert.alert('提示', '已全部标记为已读');
            } else {
              Alert.alert('提示', '操作失败');
            }
          } catch {
            // ignore
          }
        },
      },
    ]);
  };

  const clearAll = () => {
    Alert.alert('确认清空', '确定要清空所有消息吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '确定',
        onPress: async () => {
          try {
            const res: any = await pushApi.clearAllMessages();
            if ((res as any).code === 0) {
              setMessages([]);
              setUnreadCount(0);
              Alert.alert('提示', '已清空');
            } else {
              Alert.alert('提示', '清空失败');
            }
          } catch {
            // ignore
          }
        },
      },
    ]);
  };

  const getIcon = (type: string) => {
    const iconMap: { [key: string]: string } = {
      party: '🎉',
      social: '💬',
      system: '🔔',
    };
    return iconMap[type] || '📢';
  };

  const formatTime = (time: string) => {
    if (!time) return '';
    const now = Date.now();
    const diff = now - new Date(time).getTime();
    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;
    if (diff < minute) return '刚刚';
    if (diff < hour) return `${Math.floor(diff / minute)}分钟前`;
    if (diff < day) return `${Math.floor(diff / hour)}小时前`;
    if (diff < day * 7) return `${Math.floor(diff / day)}天前`;
    const date = new Date(time);
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  };

  const onRefresh = () => {
    setRefreshing(true);
    setPage(1);
    setHasMore(true);
    loadMessages(true);
  };

  // === 设计系统样式 ===
  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: colors.background.secondary,
  };

  const headerStyle: ViewStyle = {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingTop: 50,
  };

  const headerTitleStyle: TextStyle = {
    fontSize: typography.size.h2,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
  };

  const headerActionsStyle: ViewStyle = {
    flexDirection: 'row',
    gap: spacing.md,
  };

  const actionTextStyle: TextStyle = {
    fontSize: typography.size.body2,
    color: colors.primary.main,
    fontWeight: typography.weight.semibold,
  };

  const filterBarStyle: ViewStyle = {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  };

  const filterBtnBaseStyle: ViewStyle = {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    position: 'relative',
  };

  const filterBtnActiveStyle: ViewStyle = {
    backgroundColor: colors.primary.shadow,
    borderColor: colors.primary.main,
  };

  const filterBtnInactiveStyle: ViewStyle = {
    backgroundColor: colors.background.secondary,
    borderColor: colors.border,
  };

  const filterBtnTextActiveStyle: TextStyle = {
    fontSize: typography.size.body2,
    color: colors.primary.main,
    fontWeight: typography.weight.semibold,
  };

  const filterBtnTextInactiveStyle: TextStyle = {
    fontSize: typography.size.body2,
    color: colors.text.secondary,
    fontWeight: typography.weight.medium,
  };

  const badgeStyle: ViewStyle = {
    position: 'absolute',
    top: 3,
    right: 5,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    backgroundColor: colors.status.error,
    borderRadius: BorderRadius.sm,
    minWidth: 18,
    alignItems: 'center',
  };

  const badgeTextStyle: TextStyle = {
    fontSize: typography.size.small,
    color: colors.text.inverse,
    fontWeight: typography.weight.bold,
  };

  const messageCardStyle: ViewStyle = {
    marginHorizontal: spacing.md,
    marginVertical: spacing.xs,
    padding: 0,
    overflow: 'hidden',
  };

  const messageCardUnreadStyle: ViewStyle = {
    borderColor: colors.primary.shadow,
  };

  const messageRowStyle: ViewStyle = {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.md,
  };

  const iconContainerStyle: ViewStyle = {
    width: 48,
    height: 48,
    backgroundColor: colors.primary.shadow,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.primary.shadow,
  };

  const iconTextStyle: TextStyle = {
    fontSize: typography.size.h2,
  };

  const messageContentStyle: ViewStyle = {
    flex: 1,
    gap: spacing.xs,
  };

  const messageHeaderStyle: ViewStyle = {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

  const messageTitleStyle: TextStyle = {
    fontSize: typography.size.h4,
    fontWeight: typography.weight.semibold,
    color: colors.text.primary,
  };

  const messageTimeStyle: TextStyle = {
    fontSize: typography.size.caption,
    color: colors.text.tertiary,
  };

  const messageBodyStyle: TextStyle = {
    fontSize: typography.size.body2,
    color: colors.text.secondary,
    lineHeight: typography.size.body2 * typography.lineHeight.normal,
  };

  const actionCardStyle: ViewStyle = {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.primary.shadow,
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
    borderWidth: 1,
    borderColor: colors.primary.shadow,
  };

  const actionCardTextStyle: TextStyle = {
    fontSize: typography.size.caption,
    color: colors.primary.main,
    fontWeight: typography.weight.semibold,
  };

  const moreBtnStyle: ViewStyle = {
    padding: spacing.sm,
    justifyContent: 'center',
  };

  const moreBtnTextStyle: TextStyle = {
    fontSize: typography.size.h3,
    color: colors.text.tertiary,
  };

  const loadingContainerStyle: ViewStyle = {
    padding: spacing.xl,
    alignItems: 'center',
  };

  const loadingTextStyle: TextStyle = {
    color: colors.text.tertiary,
    fontSize: typography.size.body2,
  };

  const emptyContainerStyle: ViewStyle = {
    alignItems: 'center',
    paddingVertical: 80,
  };

  const emptyIconStyle: TextStyle = {
    fontSize: typography.size.display,
    marginBottom: spacing.md,
    opacity: 0.5,
  };

  const emptyTitleStyle: TextStyle = {
    fontSize: typography.size.h3,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
    fontWeight: typography.weight.semibold,
  };

  const emptyDescStyle: TextStyle = {
    fontSize: typography.size.body2,
    color: colors.text.tertiary,
  };

  const FilterButton = ({
    type,
    label,
  }: {
    type: typeof filterType;
    label: string;
  }) => (
    <GlassCard
      onPress={() => setFilterType(type)}
      intensity={filterType === type ? 'medium' : 'light'}
      style={[
        filterBtnBaseStyle,
        filterType === type ? filterBtnActiveStyle : filterBtnInactiveStyle,
        filterType === type ? glow.primary : {},
      ]}
    >
      <Text
        style={
          filterType === type
            ? filterBtnTextActiveStyle
            : filterBtnTextInactiveStyle
        }
      >
        {label}
      </Text>
      {type === 'unread' && unreadCount > 0 && (
        <View style={badgeStyle}>
          <Text style={badgeTextStyle}>{unreadCount}</Text>
        </View>
      )}
    </GlassCard>
  );

  const renderMessage = (message: PushMessage) => (
    <GlassCard
      key={message.id}
      style={[
        messageCardStyle,
        !message.is_read ? messageCardUnreadStyle : {},
      ]}
      intensity="medium"
      onPress={() => handleMessageClick(message)}
    >
      <View style={messageRowStyle}>
        <View style={iconContainerStyle}>
          <Text style={iconTextStyle}>{getIcon(message.type)}</Text>
        </View>

        <View style={messageContentStyle}>
          <View style={messageHeaderStyle}>
            <Text style={messageTitleStyle}>{message.title}</Text>
            <Text style={messageTimeStyle}>
              {formatTime(message.created_at)}
            </Text>
          </View>
          <Text style={messageBodyStyle} numberOfLines={2}>
            {message.content}
          </Text>
          {message.action_url && (
            <GlassCard
              onPress={() => handleMessageClick(message)}
              intensity="light"
              style={actionCardStyle}
            >
              <Text style={actionCardTextStyle}>查看详情</Text>
            </GlassCard>
          )}
        </View>

        <GlassCard
          onPress={() => showMessageActions(message)}
          intensity="light"
          style={moreBtnStyle}
        >
          <Text style={moreBtnTextStyle}>⋯</Text>
        </GlassCard>
      </View>
    </GlassCard>
  );

  return (
    <View style={containerStyle}>
      <View style={headerStyle}>
        <Text style={headerTitleStyle}>消息通知</Text>
        <View style={headerActionsStyle}>
          {unreadCount > 0 && (
            <GlassCard onPress={markAllRead} intensity="light">
              <Text style={actionTextStyle}>全部已读</Text>
            </GlassCard>
          )}
          <GlassCard onPress={clearAll} intensity="light">
            <Text style={actionTextStyle}>清空</Text>
          </GlassCard>
        </View>
      </View>

      <View style={filterBarStyle}>
        <FilterButton type="all" label="全部" />
        <FilterButton type="unread" label="未读" />
        <FilterButton type="party" label="聚会" />
        <FilterButton type="social" label="社交" />
        <FilterButton type="system" label="系统" />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const isClose =
            layoutMeasurement.height + contentOffset.y >=
            contentSize.height - 50;
          if (isClose) loadMore();
        }}
        scrollEventThrottle={400}
      >
        {filteredMessages.map(renderMessage)}

        {loading && (
          <View style={loadingContainerStyle}>
            <Text style={loadingTextStyle}>加载中...</Text>
          </View>
        )}

        {!hasMore && filteredMessages.length > 0 && (
          <View style={loadingContainerStyle}>
            <Text style={loadingTextStyle}>没有更多了</Text>
          </View>
        )}

        {filteredMessages.length === 0 && !loading && (
          <View style={emptyContainerStyle}>
            <Text style={emptyIconStyle}>🔔</Text>
            <Text style={emptyTitleStyle}>暂无消息</Text>
            <Text style={emptyDescStyle}>
              开启推送通知，及时获取最新消息
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
