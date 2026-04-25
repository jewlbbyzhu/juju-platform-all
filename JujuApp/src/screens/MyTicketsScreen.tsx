/**
 * 聚聚 (JUJU) App - 我的票券
 * 2026 设计系统重构版
 */

import React, { useState, useCallback, useMemo, memo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ListRenderItem,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  Layout,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';

import { ticketApi, Ticket } from '../api/ticket';
import { OptimizedImage } from '../components/OptimizedImage';
import { GlassCard } from '../components/GlassCard';
import { GlassButton } from '../components/GlassButton';
import { SkeletonList } from '../components/Skeleton';
import {
  useTheme,
  spacing,
  typography,
  textStyles,
  glassmorphism,
  animation,
  BorderRadius,
  gradients,
} from '../theme';
import { StyleSheet } from 'react-native';
import type { NavigationProp } from '../types';

interface TicketStatusConfig {
  label: string;
  color: string;
  bgColor: string;
  icon: string;
}

const STATUS_MAP: Record<
  Ticket['status'],
  (themeColors: ReturnType<typeof useTheme>['colors']) => TicketStatusConfig
> = {
  valid: themeColors => ({
    label: '可使用',
    color: themeColors.status.success,
    bgColor: `${themeColors.status.success}20`,
    icon: '✓',
  }),
  used: themeColors => ({
    label: '已使用',
    color: themeColors.text.tertiary,
    bgColor: `${themeColors.gray[700]}40`,
    icon: '✓',
  }),
  expired: themeColors => ({
    label: '已过期',
    color: themeColors.status.error,
    bgColor: `${themeColors.status.error}20`,
    icon: '✕',
  }),
};

const TABS = [
  { key: 'valid', label: '可使用' },
  { key: 'used', label: '已使用' },
  { key: 'expired', label: '已过期' },
] as const;

type TabKey = (typeof TABS)[number]['key'];

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

// ==================== 子组件 ====================

interface TicketCardProps {
  item: Ticket;
  statusConfig: TicketStatusConfig;
  onNavigate: (partyId: number) => void;
  onViewDetail?: (ticketId: number) => void;
  index: number;
}

const TicketCard = memo(({ item, statusConfig, onNavigate, onViewDetail, index }: TicketCardProps) => {
  const { colors } = useTheme();
  const scale = useSharedValue(1);

  const formatDateTime = useCallback((dateString: string): string => {
    const d = new Date(dateString);
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    return `${month}月${day}日 ${hours}:${minutes}`;
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withTiming(0.97, { duration: animation.duration.fast });
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withTiming(1, { duration: animation.duration.fast });
  }, [scale]);

  const handlePress = useCallback(() => {
    if (onViewDetail) {
      onViewDetail(item.id);
    } else {
      onNavigate(item.party_id);
    }
  }, [onNavigate, onViewDetail, item.party_id, item.id]);
  const cardContainerStyle = useMemo(
    (): ViewStyle => ({
      marginBottom: spacing.md,
    }),
    [],
  );

  const ticketCardStyle = useMemo(
    (): ViewStyle => ({
      padding: spacing.md,
      flexDirection: 'row',
      ...glassmorphism.card,
    }),
    [],
  );

  const ticketLeftStyle = useMemo(
    (): ViewStyle => ({
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
    }),
    [],
  );

  const partyImageStyle = useMemo(
    (): ViewStyle => ({
      width: 80,
      height: 80,
      borderRadius: BorderRadius.lg,
      marginRight: spacing.md,
      backgroundColor: colors.background.tertiary,
    }),
    [colors.background.tertiary],
  );

  const ticketInfoStyle = useMemo(
    (): ViewStyle => ({
      flex: 1,
      justifyContent: 'center',
    }),
    [],
  );

  const partyTitleStyle = useMemo(
    (): TextStyle => ({
      ...textStyles.body,
      fontWeight: typography.weight.semibold,
      color: colors.text.primary,
      marginBottom: spacing.xs,
    }),
    [colors.text.primary],
  );

  const typeBadgeBaseStyle = useMemo(
    (): ViewStyle => ({
      paddingHorizontal: spacing.sm,
      paddingVertical: 3,
      borderRadius: BorderRadius.xl,
      alignSelf: 'flex-start',
      marginBottom: spacing.sm,
    }),
    [],
  );

  const typeBadgeTextStyle = useMemo(
    (): TextStyle => ({
      fontSize: typography.size.small,
      fontWeight: typography.weight.semibold,
    }),
    [],
  );

  const ticketTimeStyle = useMemo(
    (): TextStyle => ({
      ...textStyles.caption,
      color: colors.text.secondary,
      marginBottom: 2,
    }),
    [colors.text.secondary],
  );

  const ticketNoStyle = useMemo(
    (): TextStyle => ({
      fontSize: typography.size.small,
      fontFamily: typography.fontFamily.mono,
      color: colors.text.tertiary,
    }),
    [colors.text.tertiary],
  );

  const ticketRightStyle = useMemo(
    (): ViewStyle => ({
      width: 90,
      alignItems: 'center',
      justifyContent: 'center',
      borderLeftWidth: 1,
      borderStyle: 'dashed',
      borderLeftColor: colors.border,
      paddingLeft: spacing.md,
      marginLeft: spacing.sm,
    }),
    [colors.border],
  );

  const statusBadgeBaseStyle = useMemo(
    (): ViewStyle => ({
      paddingHorizontal: spacing.sm,
      paddingVertical: 3,
      borderRadius: BorderRadius.xl,
      marginBottom: spacing.sm,
    }),
    [],
  );

  const statusTextStyle = useMemo(
    (): TextStyle => ({
      fontSize: typography.size.small,
      fontWeight: typography.weight.bold,
      letterSpacing: 0.3,
    }),
    [],
  );

  const qrCodeStyle = useMemo(
    (): ViewStyle => ({
      width: 48,
      height: 48,
      borderRadius: BorderRadius.md,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      borderStyle: 'dashed',
      marginBottom: spacing.sm,
    }),
    [colors.border],
  );

  const qrIconStyle = useMemo(
    (): TextStyle => ({
      fontSize: 24,
      color: colors.text.secondary,
    }),
    [colors.text.secondary],
  );

  const useBtnStyle = useMemo(
    (): ViewStyle => ({
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs + 2,
      borderRadius: BorderRadius.xl,
      backgroundColor: colors.primary.main,
    }),
    [colors.primary.main],
  );

  const useBtnTextStyle = useMemo(
    (): TextStyle => ({
      fontSize: typography.size.small,
      fontWeight: typography.weight.bold,
      color: colors.text.inverse,
      letterSpacing: 0.3,
    }),
    [colors.text.inverse],
  );

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 60)
        .duration(animation.duration.slow)
        .springify()}
      layout={Layout.springify()}
    >
      <AnimatedTouchableOpacity
        activeOpacity={0.9}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[cardContainerStyle, animatedStyle]}
      >
        <GlassCard style={ticketCardStyle} intensity="light">
          <View style={ticketLeftStyle}>
            <OptimizedImage
              source={{
                uri: item.party?.cover_image || 'https://picsum.photos/400/300',
              }}
              style={partyImageStyle}
              resizeMode="cover"
            />
            <View style={ticketInfoStyle}>
              <Text style={partyTitleStyle} numberOfLines={1}>
                {item.party?.title || '未知活动'}
              </Text>
              <View
                style={[
                  typeBadgeBaseStyle,
                  { backgroundColor: statusConfig.bgColor },
                ]}
              >
                <Text
                  style={[
                    typeBadgeTextStyle,
                    { color: statusConfig.color },
                  ]}
                >
                  {item.ticket_type?.name || '普通票'}
                </Text>
              </View>
              <Text style={ticketTimeStyle}>
                {formatDateTime(item.party?.start_time || '')}
              </Text>
              <Text style={ticketNoStyle}>票号: {item.ticket_no}</Text>
            </View>
          </View>

          <View style={ticketRightStyle}>
            <View
              style={[
                statusBadgeBaseStyle,
                { backgroundColor: statusConfig.bgColor },
              ]}
            >
              <Text style={[statusTextStyle, { color: statusConfig.color }]}>
                {statusConfig.icon} {statusConfig.label}
              </Text>
            </View>
            <View style={qrCodeStyle}>
              <Text style={qrIconStyle}>▣</Text>
            </View>
            {item.status === 'valid' && (
              <View style={useBtnStyle}>
                <Text style={useBtnTextStyle}>查看详情</Text>
              </View>
            )}
          </View>
        </GlassCard>
      </AnimatedTouchableOpacity>
    </Animated.View>
  );
});

interface TicketsEmptyStateProps {
  onNavigateHome: () => void;
}

const TicketsEmptyState = memo(({ onNavigateHome }: TicketsEmptyStateProps) => {
  const { colors } = useTheme();

  const emptyContainerStyle = useMemo(
    (): ViewStyle => ({
      alignItems: 'center',
      paddingTop: 80,
      flex: 1,
    }),
    [],
  );

  const emptyIconWrapperStyle = useMemo(
    (): ViewStyle => ({
      width: 96,
      height: 96,
      borderRadius: 48,
      backgroundColor: colors.background.tertiary,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.lg,
    }),
    [colors.background.tertiary],
  );

  const emptyIconStyle = useMemo(
    (): TextStyle => ({
      fontSize: 48,
    }),
    [],
  );

  const emptyTitleStyle = useMemo(
    (): TextStyle => ({
      ...textStyles.h3,
      color: colors.text.primary,
      marginBottom: spacing.xs,
    }),
    [colors.text.primary],
  );

  const emptySubtitleStyle = useMemo(
    (): TextStyle => ({
      ...textStyles.body2,
      color: colors.text.secondary,
      marginBottom: spacing.xl,
      textAlign: 'center',
      paddingHorizontal: spacing.xl,
    }),
    [colors.text.secondary],
  );

  const emptyBtnStyle = useMemo(
    (): ViewStyle => ({
      minWidth: 140,
    }),
    [],
  );

  return (
    <Animated.View
      style={emptyContainerStyle}
      entering={FadeInUp.delay(200).duration(animation.duration.slow).springify()}
    >
      <View style={emptyIconWrapperStyle}>
        <Text style={emptyIconStyle}>🎫</Text>
      </View>
      <Text style={emptyTitleStyle}>暂无票券</Text>
      <Text style={emptySubtitleStyle}>去探索精彩活动，获取你的第一张票券</Text>
      <GlassButton
        title="去发现"
        variant="primary"
        size="medium"
        onPress={onNavigateHome}
        style={emptyBtnStyle}
      />
    </Animated.View>
  );
});

interface TabBarProps {
  activeTab: TabKey;
  onTabChange: (key: TabKey) => void;
}

const TabBar = memo(({ activeTab, onTabChange }: TabBarProps) => {
  const { colors } = useTheme();

  const tabBarStyle = useMemo(
    (): ViewStyle => ({
      flexDirection: 'row',
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.md,
      paddingBottom: spacing.sm,
      gap: spacing.sm,
    }),
    [],
  );

  const tabBaseStyle = useMemo(
    (): ViewStyle => ({
      flex: 1,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      borderRadius: BorderRadius.xl,
      backgroundColor: colors.background.tertiary,
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    }),
    [colors.background.tertiary],
  );

  const tabTextBaseStyle = useMemo(
    (): TextStyle => ({
      ...textStyles.body2,
      color: colors.text.secondary,
      fontWeight: typography.weight.medium,
    }),
    [colors.text.secondary],
  );

  const tabTextActiveStyle = useMemo(
    (): TextStyle => ({
      color: colors.text.inverse,
      fontWeight: typography.weight.semibold,
    }),
    [colors.text.inverse],
  );

  const tabIndicatorStyle = useMemo(
    (): ViewStyle => ({
      position: 'absolute',
      bottom: 6,
      width: 12,
      height: 3,
      borderRadius: 2,
      backgroundColor: colors.text.inverse + '80',
    }),
    [colors.text.inverse],
  );

  return (
    <View style={tabBarStyle}>
      {TABS.map((tab, index) => {
        const isActive = activeTab === tab.key;
        return (
          <AnimatedTouchableOpacity
            key={tab.key}
            activeOpacity={0.8}
            onPress={() => onTabChange(tab.key)}
            style={[
              tabBaseStyle,
              isActive && { backgroundColor: colors.primary.main },
            ]}
            entering={FadeIn.delay(index * 80).duration(animation.duration.normal)}
          >
            <Text
              style={[
                tabTextBaseStyle,
                isActive && tabTextActiveStyle,
              ]}
            >
              {tab.label}
            </Text>
            {isActive && (
              <Animated.View
                entering={FadeIn.duration(animation.duration.fast)}
                style={tabIndicatorStyle}
              />
            )}
          </AnimatedTouchableOpacity>
        );
      })}
    </View>
  );
});

// ==================== 主页面 ====================

export default function MyTicketsScreen(): React.JSX.Element {
  const navigation = useNavigation<NavigationProp>();
  const { colors } = useTheme();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>('valid');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const statusMap = useMemo(
    () =>
      (Object.keys(STATUS_MAP) as Ticket['status'][]).reduce((acc, key) => {
        acc[key] = STATUS_MAP[key](colors);
        return acc;
      }, {} as Record<Ticket['status'], TicketStatusConfig>),
    [colors],
  );

  const fetchTickets = useCallback(
    async (pageNum = 1, reset = false) => {
      if (loading && !reset) return;
      setLoading(true);
      try {
        const res = await ticketApi.getTickets({
          page: pageNum,
          pageSize: 10,
          status: activeTab,
        });
        if ((res as any).code === 0) {
          const newTickets = (res as any).data?.list || [];
          if (reset) {
            setTickets(newTickets);
            setPage(1);
          } else {
            setTickets(prev => [...prev, ...newTickets]);
          }
          setHasMore(newTickets.length >= 10);
        }
      } catch {
        Alert.alert('错误', '网络错误，请稍后重试');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [activeTab, loading],
  );

  useFocusEffect(
    useCallback(() => {
      fetchTickets(1, true);
    }, [fetchTickets]),
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTickets(1, true);
  }, [fetchTickets]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchTickets(nextPage, false);
    }
  }, [loading, hasMore, page, fetchTickets]);

  const handleTabChange = useCallback((key: TabKey) => {
    setActiveTab(key);
    setTickets([]);
    setPage(1);
  }, []);

  const handleNavigateToDetail = useCallback(
    (partyId: number) => {
      navigation.navigate('PartyDetail', { partyId });
    },
    [navigation],
  );

  const handleViewTicketDetail = useCallback(
    (ticketId: number) => {
      navigation.navigate('TicketDetail', { ticketId });
    },
    [navigation],
  );

  const handleScanTicket = useCallback(() => {
    navigation.navigate('ScanTicket');
  }, [navigation]);

  const handleNavigateHome = useCallback(() => {
    navigation.navigate('Home');
  }, [navigation]);

  const renderTicketCard: ListRenderItem<Ticket> = useCallback(
    ({ item, index }) => {
      const status = statusMap[item.status] || statusMap.valid;
      return (
        <TicketCard
          item={item}
          statusConfig={status}
          onNavigate={handleNavigateToDetail}
          onViewDetail={handleViewTicketDetail}
          index={index}
        />
      );
    },
    [handleNavigateToDetail, handleViewTicketDetail, statusMap],
  );

  const keyExtractor = useCallback((item: Ticket) => `ticket-${item.id}`, []);
  const containerStyle = useMemo(
    (): ViewStyle => ({
      flex: 1,
      backgroundColor: colors.background.secondary,
    }),
    [colors.background.secondary],
  );

  const headerStyle = useMemo(
    (): ViewStyle => ({
      paddingHorizontal: spacing.lg,
      paddingTop: 16,
      paddingBottom: 24,
      overflow: 'hidden',
      borderBottomLeftRadius: BorderRadius['2xl'],
      borderBottomRightRadius: BorderRadius['2xl'],
    }),
    [],
  );

  const headerTitleStyle = useMemo(
    (): TextStyle => ({
      ...textStyles.h1,
      color: colors.text.inverse,
      fontWeight: typography.weight.bold,
    }),
    [colors.text.inverse],
  );

  const headerSubtitleStyle = useMemo(
    (): TextStyle => ({
      ...textStyles.body2,
      color: colors.text.inverse + 'BF',
      marginTop: spacing.xs,
    }),
    [colors.text.inverse],
  );

  const scanBtnStyle = useMemo(
    (): ViewStyle => ({
      position: 'absolute',
      right: spacing.lg,
      top: 16,
      width: 40,
      height: 40,
      borderRadius: BorderRadius.full,
      backgroundColor: colors.text.inverse + '20',
      alignItems: 'center',
      justifyContent: 'center',
    }),
    [colors.text.inverse],
  );

  const scanIconStyle = useMemo(
    (): TextStyle => ({
      fontSize: 20,
    }),
    [],
  );

  const listContentStyle = useMemo(
    (): ViewStyle => ({
      padding: spacing.lg,
      paddingBottom: 100,
      flexGrow: 1,
    }),
    [],
  );

  if (loading && tickets.length === 0) {
    return (
      <SafeAreaView style={containerStyle} edges={['top']}>
        <View style={headerStyle}>
          <LinearGradient
            colors={gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <Text style={headerTitleStyle}>我的票券</Text>
          <Text style={headerSubtitleStyle}>管理你的所有活动票券</Text>
        </View>
        <SkeletonList count={3} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={containerStyle} edges={['top']}>
      <View style={headerStyle}>
        <LinearGradient
          colors={gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <Text style={headerTitleStyle}>我的票券</Text>
        <Text style={headerSubtitleStyle}>管理你的所有活动票券</Text>
        <TouchableOpacity style={scanBtnStyle} onPress={handleScanTicket}>
          <Text style={scanIconStyle}>📷</Text>
        </TouchableOpacity>
      </View>

      <TabBar activeTab={activeTab} onTabChange={handleTabChange} />

      <FlatList
        data={tickets}
        renderItem={renderTicketCard}
        keyExtractor={keyExtractor}
        contentContainerStyle={listContentStyle}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary.main}
            colors={[colors.primary.main]}
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        initialNumToRender={6}
        maxToRenderPerBatch={8}
        windowSize={10}
        removeClippedSubviews={true}
        ListEmptyComponent={
          !loading ? (
            <TicketsEmptyState onNavigateHome={handleNavigateHome} />
          ) : null
        }
      />
    </SafeAreaView>
  );
}
