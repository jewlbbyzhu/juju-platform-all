import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  RefreshControl,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { vipApi } from '../api/vip';
import {
  useTheme,
  spacing,
  typography,
  textStyles,
  BorderRadius,
  Shadows,
  Border,
  animation,
} from '../theme';
import { GlassCard } from '../components/GlassCard';
import { GlassButton } from '../components/GlassButton';
import { Skeleton, SkeletonList } from '../components/Skeleton';

interface SubscriptionRecord {
  id: string;
  packageName: string;
  duration: number;
  price: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'expired' | 'cancelled';
  paymentMethod: string;
}

const FILTER_OPTIONS = [
  { label: '全部', value: 'all' },
  { label: '生效中', value: 'active' },
  { label: '已过期', value: 'expired' },
  { label: '已取消', value: 'cancelled' },
];

export default function VIPHistoryScreen(): React.JSX.Element {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const [records, setRecords] = useState<SubscriptionRecord[]>([]);
  const [filter, setFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSubscriptions: 0,
    totalSpent: 0,
    totalDays: 0,
  });

  const STATUS_CONFIG = useMemo(
    () => ({
      active: {
        color: colors.status.success,
        bgColor: colors.status.success + '26',
        text: '生效中',
      },
      expired: {
        color: colors.text.tertiary,
        bgColor: colors.gray[200],
        text: '已过期',
      },
      cancelled: {
        color: colors.status.error,
        bgColor: colors.status.error + '26',
        text: '已取消',
      },
    }),
    [colors],
  );

  const loadHistory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await vipApi.getSubscriptionHistory({
        page: 1,
        pageSize: 50,
      });
      if (res.success || (res as any).code === 0) {
        const data = (res as any).data || {};
        const list = data.list || data.history || [];
        setRecords(list);

        const totalSpent = list.reduce(
          (sum: number, r: SubscriptionRecord) => sum + r.price,
          0,
        );
        const totalDays = list.reduce(
          (sum: number, r: SubscriptionRecord) => sum + r.duration * 30,
          0,
        );
        setStats({
          totalSubscriptions: list.length,
          totalSpent,
          totalDays,
        });
      }
    } catch (error) {
      console.error('加载订阅历史失败:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHistory();
    setRefreshing(false);
  };

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const filteredRecords = records.filter(r => {
    if (filter === 'all') return true;
    return r.status === filter;
  });

  const getStatusStyle = (status: string) => {
    return (
      STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] ||
      STATUS_CONFIG.expired
    );
  };
  const containerStyle = useMemo(
    (): ViewStyle => ({
      flex: 1,
      backgroundColor: colors.background.secondary,
    }),
    [colors.background.secondary],
  );

  const headerStyle = useMemo(
    (): ViewStyle => ({
      padding: spacing.lg,
      paddingTop: spacing['3xl'],
      backgroundColor: colors.background.primary,
      borderBottomWidth: Border.width.normal,
      borderBottomColor: colors.border,
    }),
    [colors.background.primary, colors.border],
  );

  const headerSubtitleStyle = useMemo(
    (): TextStyle => ({
      fontSize: typography.size.body2,
      color: colors.text.secondary,
      marginTop: spacing.xs,
    }),
    [colors.text.secondary],
  );

  const statsSkeletonStyle = useMemo(
    (): ViewStyle => ({
      margin: spacing.lg,
    }),
    [],
  );

  const statsCardStyle = useMemo(
    (): ViewStyle => ({
      margin: spacing.lg,
      padding: 0,
    }),
    [],
  );

  const statsRowStyle = useMemo(
    (): ViewStyle => ({
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingVertical: spacing.xl,
    }),
    [],
  );

  const statItemStyle = useMemo(
    (): ViewStyle => ({
      alignItems: 'center',
    }),
    [],
  );

  const statValueStyle = useMemo(
    (): TextStyle => ({
      fontSize: typography.size.h1,
      fontWeight: typography.weight.bold,
      color: colors.text.primary,
    }),
    [colors.text.primary],
  );

  const statLabelStyle = useMemo(
    (): TextStyle => ({
      fontSize: typography.size.body2,
      color: colors.text.secondary,
      marginTop: spacing.xs,
    }),
    [colors.text.secondary],
  );

  const statDividerStyle = useMemo(
    (): ViewStyle => ({
      width: Border.width.normal,
      backgroundColor: colors.divider,
    }),
    [colors.divider],
  );

  const filterSectionStyle = useMemo(
    (): ViewStyle => ({
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.md,
    }),
    [],
  );

  const filterBtnBaseStyle = useMemo(
    (): ViewStyle => ({
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      borderRadius: BorderRadius.full,
      backgroundColor: colors.background.secondary,
      marginRight: spacing.sm,
      borderWidth: Border.width.normal,
      borderColor: colors.border,
    }),
    [colors.background.secondary, colors.border],
  );

  const filterBtnActiveStyle = useMemo(
    (): ViewStyle => ({
      backgroundColor: colors.primary.main,
      borderColor: colors.primary.main,
      ...Shadows.primary,
    }),
    [colors.primary.main],
  );

  const filterBtnTextBaseStyle = useMemo(
    (): TextStyle => ({
      fontSize: typography.size.body2,
      color: colors.text.secondary,
      fontWeight: typography.weight.medium,
    }),
    [colors.text.secondary],
  );

  const filterBtnTextActiveStyle = useMemo(
    (): TextStyle => ({
      color: colors.text.inverse,
      fontWeight: typography.weight.bold,
    }),
    [colors.text.inverse],
  );

  const recordsSectionStyle = useMemo(
    (): ViewStyle => ({
      padding: spacing.lg,
    }),
    [],
  );

  const recordCardStyle = useMemo(
    (): ViewStyle => ({
      marginBottom: spacing.md,
      padding: 0,
    }),
    [],
  );

  const recordHeaderStyle = useMemo(
    (): ViewStyle => ({
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      padding: spacing.lg,
      borderBottomWidth: Border.width.normal,
      borderBottomColor: colors.divider,
    }),
    [colors.divider],
  );

  const packageNameStyle = useMemo(
    (): TextStyle => ({
      fontSize: typography.size.h4,
      fontWeight: typography.weight.bold,
      color: colors.text.primary,
      marginBottom: spacing.xs,
    }),
    [colors.text.primary],
  );

  const durationStyle = useMemo(
    (): TextStyle => ({
      fontSize: typography.size.body2,
      color: colors.text.secondary,
    }),
    [colors.text.secondary],
  );

  const statusBadgeBaseStyle = useMemo(
    (): ViewStyle => ({
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: BorderRadius.full,
      borderWidth: Border.width.normal,
      borderColor: colors.border,
    }),
    [colors.border],
  );

  const statusTextBaseStyle = useMemo(
    (): TextStyle => ({
      fontSize: typography.size.caption,
      fontWeight: typography.weight.bold,
    }),
    [],
  );

  const recordDetailsStyle = useMemo(
    (): ViewStyle => ({
      backgroundColor: colors.background.secondary,
      borderRadius: BorderRadius.md,
      padding: spacing.md,
      margin: spacing.lg,
    }),
    [colors.background.secondary],
  );

  const detailRowStyle = useMemo(
    (): ViewStyle => ({
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: spacing.xs,
    }),
    [],
  );

  const detailLabelStyle = useMemo(
    (): TextStyle => ({
      fontSize: typography.size.body2,
      color: colors.text.secondary,
    }),
    [colors.text.secondary],
  );

  const detailValueStyle = useMemo(
    (): TextStyle => ({
      fontSize: typography.size.body2,
      color: colors.text.primary,
    }),
    [colors.text.primary],
  );

  const recordFooterStyle = useMemo(
    (): ViewStyle => ({
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.lg,
    }),
    [],
  );

  const priceStyle = useMemo(
    (): TextStyle => ({
      fontSize: typography.size.h1,
      fontWeight: typography.weight.bold,
      color: colors.accent.gold,
    }),
    [colors.accent.gold],
  );

  const detailBtnTextStyle = useMemo(
    (): TextStyle => ({
      fontSize: typography.size.body2,
      color: colors.primary.main,
      fontWeight: typography.weight.semibold,
    }),
    [colors.primary.main],
  );

  const emptyStateStyle = useMemo(
    (): ViewStyle => ({
      alignItems: 'center',
      padding: spacing['3xl'],
      paddingTop: spacing['3xl'] + spacing.sm,
    }),
    [],
  );

  const emptyIconStyle = useMemo(
    (): TextStyle => ({
      fontSize: typography.size.display,
      marginBottom: spacing.lg,
      opacity: 0.5,
    }),
    [],
  );

  const emptyTitleStyle = useMemo(
    (): TextStyle => ({
      ...textStyles.h3,
      color: colors.text.primary,
      marginBottom: spacing.sm,
    }),
    [colors.text.primary, textStyles.h3],
  );

  const emptyDescStyle = useMemo(
    (): TextStyle => ({
      fontSize: typography.size.body2,
      color: colors.text.secondary,
      marginBottom: spacing.xl,
    }),
    [colors.text.secondary],
  );

  const footerStyle = useMemo(
    (): ViewStyle => ({
      padding: spacing.lg,
      alignItems: 'center',
    }),
    [],
  );

  const footerTextStyle = useMemo(
    (): TextStyle => ({
      fontSize: typography.size.caption,
      color: colors.text.tertiary,
    }),
    [colors.text.tertiary],
  );

  if (loading) {
    return (
      <View style={containerStyle}>
        <View style={headerStyle}>
          <Text style={[textStyles.h1, { color: colors.text.primary }]}>
            订阅历史
          </Text>
        </View>
        <View style={statsSkeletonStyle}>
          <Skeleton
            width="100%"
            height={120}
            borderRadius={BorderRadius.xl}
          />
        </View>
        <SkeletonList count={3} />
      </View>
    );
  }

  return (
    <ScrollView
      style={containerStyle}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary.main}
        />
      }
    >
      <View style={headerStyle}>
        <Text style={[textStyles.h1, { color: colors.text.primary }]}>
          订阅历史
        </Text>
        <Text style={headerSubtitleStyle}>查看您的VIP订阅记录</Text>
      </View>

      <Animated.View
        entering={FadeInUp.duration(animation.duration.normal).delay(100)}
      >
        <GlassCard style={statsCardStyle} intensity="medium">
          <View style={statsRowStyle}>
            <View style={statItemStyle}>
              <Text style={statValueStyle}>{stats.totalSubscriptions}</Text>
              <Text style={statLabelStyle}>累计订阅</Text>
            </View>
            <View style={statDividerStyle} />
            <View style={statItemStyle}>
              <Text style={statValueStyle}>
                ¥{stats.totalSpent.toLocaleString()}
              </Text>
              <Text style={statLabelStyle}>累计消费</Text>
            </View>
            <View style={statDividerStyle} />
            <View style={statItemStyle}>
              <Text style={statValueStyle}>{stats.totalDays}</Text>
              <Text style={statLabelStyle}>累计天数</Text>
            </View>
          </View>
        </GlassCard>
      </Animated.View>

      <Animated.View
        entering={FadeInUp.duration(animation.duration.normal).delay(200)}
        style={filterSectionStyle}
      >
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {FILTER_OPTIONS.map(opt => (
            <Pressable
              key={opt.value}
              onPress={() => setFilter(opt.value)}
              style={({ pressed }) => ({
                ...(filter === opt.value
                  ? filterBtnActiveStyle
                  : filterBtnBaseStyle),
                opacity: pressed ? 0.8 : 1,
              })}
            >
              <Text
                style={
                  filter === opt.value
                    ? filterBtnTextActiveStyle
                    : filterBtnTextBaseStyle
                }
              >
                {opt.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </Animated.View>

      <Animated.View
        entering={FadeInUp.duration(animation.duration.normal).delay(300)}
        style={recordsSectionStyle}
      >
        {filteredRecords.length > 0 ? (
          filteredRecords.map(record => {
            const statusStyle = getStatusStyle(record.status);
            return (
              <GlassCard
                key={record.id}
                style={recordCardStyle}
                intensity="light"
              >
                <View style={recordHeaderStyle}>
                  <View>
                    <Text style={packageNameStyle}>{record.packageName}</Text>
                    <Text style={durationStyle}>
                      {record.duration} 个月
                    </Text>
                  </View>
                  <View
                    style={[
                      statusBadgeBaseStyle,
                      { backgroundColor: statusStyle.bgColor },
                    ]}
                  >
                    <Text
                      style={[
                        statusTextBaseStyle,
                        { color: statusStyle.color },
                      ]}
                    >
                      {statusStyle.text}
                    </Text>
                  </View>
                </View>

                <View style={recordDetailsStyle}>
                  <View style={detailRowStyle}>
                    <Text style={detailLabelStyle}>订阅时间</Text>
                    <Text style={detailValueStyle}>
                      {new Date(record.startDate).toLocaleDateString()}
                    </Text>
                  </View>
                  <View style={detailRowStyle}>
                    <Text style={detailLabelStyle}>到期时间</Text>
                    <Text style={detailValueStyle}>
                      {new Date(record.endDate).toLocaleDateString()}
                    </Text>
                  </View>
                  <View style={detailRowStyle}>
                    <Text style={detailLabelStyle}>支付方式</Text>
                    <Text style={detailValueStyle}>
                      {record.paymentMethod}
                    </Text>
                  </View>
                </View>

                <View style={recordFooterStyle}>
                  <Text style={priceStyle}>¥{record.price}</Text>
                  <Pressable
                    onPress={() =>
                      (navigation as any).navigate('SubscriptionDetail', {
                        id: record.id,
                      })
                    }
                  >
                    <Text style={detailBtnTextStyle}>查看详情 ›</Text>
                  </Pressable>
                </View>
              </GlassCard>
            );
          })
        ) : (
          <View style={emptyStateStyle}>
            <Text style={emptyIconStyle}>📜</Text>
            <Text style={emptyTitleStyle}>暂无订阅记录</Text>
            <Text style={emptyDescStyle}>
              开通VIP会员后将显示在此
            </Text>
            <GlassButton
              title="去开通VIP"
              onPress={() => (navigation as any).navigate('VIPCenter')}
              variant="primary"
              size="medium"
            />
          </View>
        )}
      </Animated.View>

      <View style={footerStyle}>
        <Text style={footerTextStyle}>仅显示最近50条记录</Text>
      </View>
    </ScrollView>
  );
}
