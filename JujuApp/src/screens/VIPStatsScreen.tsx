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
import { vipStatsApi } from '../api/vipStats';
import {
  useTheme,
  spacing,
  typography,
  textStyles,
  BorderRadius,

  animation,
} from '../theme';
import { GlassCard } from '../components/GlassCard';
import { GlassButton } from '../components/GlassButton';

interface VipStats {
  totalSavings: number;
  totalOrders: number;
  totalSpent: number;
  discountRate: number;
  avgOrderValue: number;
  joinDays: number;
  upcomingRenewal: string | null;
}

interface MonthlyStat {
  month: string;
  savings: number;
  orders: number;
  spent: number;
}

const TIME_OPTIONS = [
  { label: '本月', value: 'month' },
  { label: '本季', value: 'quarter' },
  { label: '本年', value: 'year' },
  { label: '全部', value: 'all' },
];

const METRICS_DATA = [
  { icon: '🛒', key: 'totalOrders', label: '累计订单', prefix: '', suffix: '' },
  { icon: '💰', key: 'totalSpent', label: '累计消费', prefix: '¥', suffix: '' },
  {
    icon: '📊',
    key: 'avgOrderValue',
    label: '平均客单价',
    prefix: '¥',
    suffix: '',
  },
  { icon: '📅', key: 'joinDays', label: 'VIP天数', prefix: '', suffix: '' },
];

const BENEFITS_USAGE = [
  { icon: '⚡', name: '优先购票', used: 12, total: '无限' },
  { icon: '💰', name: '专属折扣', used: '¥1,200', total: '累计节省' },
  { icon: '🎁', name: '生日礼包', used: 1, total: 1 },
  { icon: '🎉', name: '专属活动', used: 3, total: '无限' },
];

export default function VIPStatsScreen(): React.JSX.Element {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const [timeFilter, setTimeFilter] = useState('month');
  const [stats, setStats] = useState<VipStats>({
    totalSavings: 0,
    totalOrders: 0,
    totalSpent: 0,
    discountRate: 0,
    avgOrderValue: 0,
    joinDays: 0,
    upcomingRenewal: null,
  });
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStat[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadStats = useCallback(async () => {
    try {
      const res = await vipStatsApi.getVipStats({ period: timeFilter });
      if (res.success || (res as any).code === 0) {
        const data = (res as any).data || {};
        setStats({
          totalSavings: data.totalSavings || data.total_savings || 0,
          totalOrders: data.totalOrders || data.total_orders || 0,
          totalSpent: data.totalSpent || data.total_spent || 0,
          discountRate: data.discountRate || data.discount_rate || 0,
          avgOrderValue: data.avgOrderValue || data.avg_order_value || 0,
          joinDays: data.joinDays || data.join_days || 0,
          upcomingRenewal:
            data.upcomingRenewal || data.upcoming_renewal || null,
        });
        setMonthlyStats(data.monthlyStats || data.monthly_stats || []);
      }
    } catch (error) {
      console.error('加载VIP统计失败:', error);
    }
  }, [timeFilter]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  };

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const maxSavings = Math.max(...monthlyStats.map(s => s.savings), 1);

  const getMetricValue = (key: string) => {
    const value = stats[key as keyof VipStats];
    if (typeof value === 'number') {
      return value.toLocaleString();
    }
    return value || '0';
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
      padding: spacing.xl,
      paddingTop: spacing['3xl'],
      backgroundColor: colors.primary.main,
    }),
    [colors.primary.main],
  );

  const headerContentStyle = useMemo(
    (): ViewStyle => ({
      alignItems: 'center',
      marginBottom: spacing.xl,
    }),
    [],
  );

  const headerTitleStyle = useMemo(
    (): TextStyle => ({
      ...textStyles.h1,
      color: colors.text.inverse,
      marginBottom: spacing.sm,
    }),
    [colors.text.inverse, textStyles.h1],
  );

  const headerSubtitleStyle = useMemo(
    (): TextStyle => ({
      fontSize: typography.size.body2,
      color: colors.text.inverse + 'CC',
    }),
    [colors.text.inverse],
  );

  const timeFilterStyle = useMemo(
    (): ViewStyle => ({
      flexDirection: 'row',
      justifyContent: 'center',
      gap: spacing.sm,
    }),
    [],
  );

  const timeBtnBaseStyle = useMemo(
    (): ViewStyle => ({
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      borderRadius: BorderRadius.full,
      backgroundColor: colors.text.inverse + '33',
    }),
    [colors.text.inverse],
  );

  const timeBtnActiveStyle = useMemo(
    (): ViewStyle => ({
      backgroundColor: colors.text.inverse,
    }),
    [colors.text.inverse],
  );

  const timeBtnTextBaseStyle = useMemo(
    (): TextStyle => ({
      fontSize: typography.size.body2,
      color: colors.text.inverse + 'E6',
    }),
    [colors.text.inverse],
  );

  const timeBtnTextActiveStyle = useMemo(
    (): TextStyle => ({
      color: colors.primary.main,
      fontWeight: typography.weight.bold,
    }),
    [colors.primary.main],
  );

  const savingsCardStyle = useMemo(
    (): ViewStyle => ({
      margin: spacing.lg,
      alignItems: 'center',
      borderWidth: BorderRadius.xs / 4,
      borderColor: colors.accent.gold,
    }),
    [colors.accent.gold],
  );

  const savingsLabelStyle = useMemo(
    (): TextStyle => ({
      fontSize: typography.size.body2,
      color: colors.text.secondary,
      marginBottom: spacing.sm,
    }),
    [colors.text.secondary],
  );

  const savingsValueStyle = useMemo(
    (): TextStyle => ({
      fontSize: typography.size.display,
      fontWeight: typography.weight.bold,
      color: colors.accent.gold,
    }),
    [colors.accent.gold],
  );

  const savingsDetailStyle = useMemo(
    (): ViewStyle => ({
      marginTop: spacing.md,
      backgroundColor: colors.accent.gold + '26',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      borderRadius: BorderRadius.full,
    }),
    [colors.accent.gold],
  );

  const savingsDetailTextStyle = useMemo(
    (): TextStyle => ({
      fontSize: typography.size.body2,
      color: colors.accent.gold,
      fontWeight: typography.weight.medium,
    }),
    [colors.accent.gold],
  );

  const metricsSectionStyle = useMemo(
    (): ViewStyle => ({
      paddingHorizontal: spacing.lg,
    }),
    [],
  );

  const metricsGridStyle = useMemo(
    (): ViewStyle => ({
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    }),
    [],
  );

  const metricCardStyle = useMemo(
    (): ViewStyle => ({
      width: '48%',
      alignItems: 'center',
      padding: spacing.xl,
    }),
    [],
  );

  const metricIconStyle = useMemo(
    (): TextStyle => ({
      fontSize: typography.size.h2,
      marginBottom: spacing.sm,
    }),
    [],
  );

  const metricValueStyle = useMemo(
    (): TextStyle => ({
      fontSize: typography.size.h3,
      fontWeight: typography.weight.bold,
      color: colors.text.primary,
      marginBottom: spacing.xs,
    }),
    [colors.text.primary],
  );

  const metricLabelStyle = useMemo(
    (): TextStyle => ({
      fontSize: typography.size.caption,
      color: colors.text.secondary,
    }),
    [colors.text.secondary],
  );

  const trendSectionStyle = useMemo(
    (): ViewStyle => ({
      padding: spacing.lg,
      marginTop: spacing.sm,
    }),
    [],
  );

  const sectionTitleStyle = useMemo(
    (): TextStyle => ({
      ...textStyles.h3,
      color: colors.text.primary,
      marginBottom: spacing.lg,
    }),
    [colors.text.primary, textStyles.h3],
  );

  const chartContainerStyle = useMemo(
    (): ViewStyle => ({
      padding: spacing.xl,
    }),
    [],
  );

  const chartStyle = useMemo(
    (): ViewStyle => ({
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'flex-end',
      height: 150,
    }),
    [],
  );

  const barContainerStyle = useMemo(
    (): ViewStyle => ({
      alignItems: 'center',
      flex: 1,
    }),
    [],
  );

  const barWrapperStyle = useMemo(
    (): ViewStyle => ({
      width: 30,
      height: 100,
      backgroundColor: colors.background.tertiary,
      borderRadius: BorderRadius.xs,
      justifyContent: 'flex-end',
      overflow: 'hidden',
    }),
    [colors.background.tertiary],
  );

  const barBaseStyle = useMemo(
    (): ViewStyle => ({
      backgroundColor: colors.primary.main,
      borderRadius: BorderRadius.xs,
      width: '100%',
    }),
    [colors.primary.main],
  );

  const barLabelStyle = useMemo(
    (): TextStyle => ({
      fontSize: typography.size.caption,
      color: colors.text.secondary,
      marginTop: spacing.sm,
    }),
    [colors.text.secondary],
  );

  const barValueStyle = useMemo(
    (): TextStyle => ({
      fontSize: typography.size.small,
      color: colors.primary.main,
      marginTop: spacing.xs,
      fontWeight: typography.weight.medium,
    }),
    [colors.primary.main],
  );

  const renewalCardStyle = useMemo(
    (): ViewStyle => ({
      margin: spacing.lg,
      borderWidth: BorderRadius.xs / 4,
      borderColor: colors.accent.gold,
    }),
    [colors.accent.gold],
  );

  const renewalHeaderStyle = useMemo(
    (): ViewStyle => ({
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.md,
    }),
    [],
  );

  const renewalIconStyle = useMemo(
    (): TextStyle => ({
      fontSize: typography.size.h3,
      marginRight: spacing.sm,
    }),
    [],
  );

  const renewalTitleStyle = useMemo(
    (): TextStyle => ({
      fontSize: typography.size.h4,
      fontWeight: typography.weight.bold,
      color: colors.accent.gold,
    }),
    [colors.accent.gold],
  );

  const renewalTextStyle = useMemo(
    (): TextStyle => ({
      fontSize: typography.size.body,
      color: colors.text.secondary,
      marginBottom: spacing.lg,
    }),
    [colors.text.secondary],
  );

  const benefitsSectionStyle = useMemo(
    (): ViewStyle => ({
      padding: spacing.lg,
    }),
    [],
  );

  const benefitsListStyle = useMemo(
    (): ViewStyle => ({
      padding: spacing.lg,
    }),
    [],
  );

  const benefitRowStyle = useMemo(
    (): ViewStyle => ({
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.md,
      borderBottomWidth: BorderRadius.xs / 4,
      borderBottomColor: colors.divider,
    }),
    [colors.divider],
  );

  const benefitIconStyle = useMemo(
    (): TextStyle => ({
      fontSize: typography.size.h4,
      marginRight: spacing.md,
    }),
    [],
  );

  const benefitNameStyle = useMemo(
    (): TextStyle => ({
      flex: 1,
      fontSize: typography.size.body,
      color: colors.text.primary,
    }),
    [colors.text.primary],
  );

  const benefitValueStyle = useMemo(
    (): TextStyle => ({
      fontSize: typography.size.body2,
      color: colors.primary.main,
      fontWeight: typography.weight.medium,
    }),
    [colors.primary.main],
  );

  const footerStyle = useMemo(
    (): ViewStyle => ({
      padding: spacing.xl,
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

  return (
    <ScrollView
      style={containerStyle}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* 头部 */}
      <View style={headerStyle}>
        <View style={headerContentStyle}>
          <Text style={headerTitleStyle}>VIP数据统计</Text>
          <Text style={headerSubtitleStyle}>您的VIP会员价值分析</Text>
        </View>

        {/* 时间筛选 */}
        <View style={timeFilterStyle}>
          {TIME_OPTIONS.map(opt => (
            <Pressable
              key={opt.value}
              onPress={() => setTimeFilter(opt.value)}
              style={({ pressed }) => ({
                ...(timeFilter === opt.value
                  ? timeBtnActiveStyle
                  : timeBtnBaseStyle),
                opacity: pressed ? 0.8 : 1,
              })}
            >
              <Text
                style={
                  timeFilter === opt.value
                    ? timeBtnTextActiveStyle
                    : timeBtnTextBaseStyle
                }
              >
                {opt.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* 省钱统计 */}
      <Animated.View
        entering={FadeInUp.duration(animation.duration.normal).delay(100)}
      >
        <GlassCard
          style={savingsCardStyle}
          intensity="medium"
          glow
          glowColor={colors.accent.gold}
        >
          <Text style={savingsLabelStyle}>累计为您节省</Text>
          <Text style={savingsValueStyle}>
            ¥{stats.totalSavings.toLocaleString()}
          </Text>
          <View style={savingsDetailStyle}>
            <Text style={savingsDetailTextStyle}>
              相当于享受了 {stats.discountRate}% 的平均折扣
            </Text>
          </View>
        </GlassCard>
      </Animated.View>

      {/* 核心指标 */}
      <Animated.View
        entering={FadeInUp.duration(animation.duration.normal).delay(200)}
        style={metricsSectionStyle}
      >
        <View style={metricsGridStyle}>
          {METRICS_DATA.map((metric, index) => (
            <GlassCard key={index} style={metricCardStyle} intensity="light">
              <Text style={metricIconStyle}>{metric.icon}</Text>
              <Text style={metricValueStyle}>
                {metric.prefix}
                {getMetricValue(metric.key)}
                {metric.suffix}
              </Text>
              <Text style={metricLabelStyle}>{metric.label}</Text>
            </GlassCard>
          ))}
        </View>
      </Animated.View>

      {/* 月度趋势 */}
      {monthlyStats.length > 0 && (
        <Animated.View
          entering={FadeInUp.duration(animation.duration.normal).delay(300)}
          style={trendSectionStyle}
        >
          <Text style={sectionTitleStyle}>月度节省趋势</Text>

          <GlassCard style={chartContainerStyle} intensity="light">
            <View style={chartStyle}>
              {monthlyStats.slice(-6).map((stat, idx) => (
                <View key={idx} style={barContainerStyle}>
                  <View style={barWrapperStyle}>
                    <View
                      style={[
                        barBaseStyle,
                        { height: `${(stat.savings / maxSavings) * 100}%` },
                      ]}
                    />
                  </View>
                  <Text style={barLabelStyle}>{stat.month}</Text>
                  <Text style={barValueStyle}>¥{stat.savings}</Text>
                </View>
              ))}
            </View>
          </GlassCard>
        </Animated.View>
      )}

      {/* 续费提醒 */}
      {stats.upcomingRenewal && (
        <Animated.View
          entering={FadeInUp.duration(animation.duration.normal).delay(400)}
        >
          <GlassCard
            style={renewalCardStyle}
            intensity="medium"
            glow
            glowColor={colors.accent.gold}
          >
            <View style={renewalHeaderStyle}>
              <Text style={renewalIconStyle}>🔔</Text>
              <Text style={renewalTitleStyle}>续费提醒</Text>
            </View>
            <Text style={renewalTextStyle}>
              您的VIP会员将于{' '}
              {new Date(stats.upcomingRenewal).toLocaleDateString()} 到期
            </Text>
            <GlassButton
              title="立即续费"
              onPress={() => (navigation as any).navigate('VIPCenter')}
              variant="gradient"
              size="medium"
              fullWidth
            />
          </GlassCard>
        </Animated.View>
      )}

      {/* 权益使用统计 */}
      <Animated.View
        entering={FadeInUp.duration(animation.duration.normal).delay(500)}
        style={benefitsSectionStyle}
      >
        <Text style={sectionTitleStyle}>权益使用统计</Text>
        <GlassCard style={benefitsListStyle} intensity="light">
          {BENEFITS_USAGE.map((benefit, idx) => (
            <View key={idx} style={benefitRowStyle}>
              <Text style={benefitIconStyle}>{benefit.icon}</Text>
              <Text style={benefitNameStyle}>{benefit.name}</Text>
              <Text style={benefitValueStyle}>
                {benefit.used} / {benefit.total}
              </Text>
            </View>
          ))}
        </GlassCard>
      </Animated.View>

      <View style={footerStyle}>
        <Text style={footerTextStyle}>数据每日更新，仅供参考</Text>
      </View>
    </ScrollView>
  );
}
