// 2026高颜值设计 - 票务统计页
import React, { useState, useCallback } from 'react';
import type { JSX } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  Alert,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassCard } from '../components/GlassCard';
import { GlassButton } from '../components/GlassButton';
import { Skeleton } from '../components/Skeleton';
import {
  useTheme,
  spacing,
  typography,
  glassmorphism,
  gradients,
  BorderRadius,

} from '../theme';
import { AnimatedPressable } from '../components/feed/AnimatedPressable';

type TimeFilter = 'today' | 'week' | 'month';
type ChartType = 'sales' | 'revenue';

const TIME_OPTIONS: { label: string; value: TimeFilter }[] = [
  { label: '今日', value: 'today' },
  { label: '本周', value: 'week' },
  { label: '本月', value: 'month' },
];

const CHART_TYPE_OPTIONS: { label: string; value: ChartType }[] = [
  { label: '销量', value: 'sales' },
  { label: '营收', value: 'revenue' },
];

interface Stats {
  totalSales: number;
  totalRevenue: number;
  conversionRate: number;
  avgOrderValue: number;
}

export default function TicketStatsScreen(): JSX.Element {
  const { colors } = useTheme();
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('today');
  const [chartType, setChartType] = useState<ChartType>('sales');
  const [refreshing, setRefreshing] = useState(false);

    totalSales: 1256,
    totalRevenue: 56800,
    conversionRate: 24.5,
    avgOrderValue: 45.2,
  });

  // 使用设计系统替代 useMemo 样式 - 提取为命名样式对象
  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: colors.background.secondary,
  };

  const headerStyle: ViewStyle = {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    paddingTop: 60,
    paddingBottom: spacing.xl,
    borderBottomLeftRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.xl,
    ...glassmorphism.header,
  };

  const titleStyle: TextStyle = {
    fontSize: typography.size.h2,
    fontWeight: typography.weight.bold,
    color: colors.text.inverse,
    letterSpacing: 0.5,
  };

  const scrollViewStyle: ViewStyle = {
    flex: 1,
  };

  const filterCardStyle: ViewStyle = {
    margin: spacing.lg,
    marginBottom: spacing.sm,
  };

  const timeFilterStyle: ViewStyle = {
    flexDirection: 'row',
    gap: spacing.sm,
  };

  const getFilterItemStyle = useCallback(
    (isActive: boolean): ViewStyle => ({
      flex: 1,
      paddingVertical: spacing.md,
      alignItems: 'center',
      backgroundColor: isActive
        ? colors.primary.main
        : colors.background.tertiary,
      borderRadius: BorderRadius.md,
    }),
    [colors.primary.main, colors.background.tertiary],
  );

  const getFilterTextStyle = useCallback(
    (isActive: boolean): TextStyle => ({
      fontSize: typography.size.body2,
      color: isActive ? colors.text.inverse : colors.text.secondary,
      fontWeight: isActive
        ? typography.weight.bold
        : typography.weight.medium,
    }),
    [colors.text.inverse, colors.text.secondary],
  );

  const skeletonGridStyle: ViewStyle = {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    padding: spacing.lg,
    justifyContent: 'space-between',
  };

  const statsCardsStyle: ViewStyle = {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    padding: spacing.lg,
    justifyContent: 'space-between',
  };

  const statsCardStyle: ViewStyle = {
    width: '48%',
    padding: 0,
    overflow: 'hidden',
  };

  const cardGradientStyle: ViewStyle = {
    padding: spacing.lg,
    alignItems: 'center',
  };

  const cardLabelStyle: TextStyle = {
    fontSize: typography.size.caption,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    fontWeight: typography.weight.medium,
    opacity: 0.8,
  };

  const cardValueStyle: TextStyle = {
    fontSize: typography.size.h1,
    fontWeight: typography.weight.bold,
    color: colors.text.inverse,
    letterSpacing: 0.5,
  };

  const chartSectionStyle: ViewStyle = {
    margin: spacing.lg,
    marginTop: 0,
    marginBottom: spacing.xl,
  };

  const chartContainerStyle: ViewStyle = {
    paddingTop: spacing.sm,
  };

  const chartTabsStyle: ViewStyle = {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  };

  const getChartTabStyle = useCallback(
    (isActive: boolean): ViewStyle => ({
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      backgroundColor: isActive
        ? colors.primary.main
        : colors.background.tertiary,
      borderRadius: BorderRadius.xl,
    }),
    [colors.primary.main, colors.background.tertiary],
  );

  const getChartTabTextStyle = useCallback(
    (isActive: boolean): TextStyle => ({
      fontSize: typography.size.caption + 1,
      color: isActive ? colors.text.inverse : colors.text.secondary,
      fontWeight: isActive
        ? typography.weight.bold
        : typography.weight.medium,
    }),
    [colors.text.inverse, colors.text.secondary],
  );

  const chartPlaceholderStyle: ViewStyle = {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['5xl'],
    backgroundColor: colors.background.tertiary,
    borderRadius: BorderRadius.lg,
  };

  const placeholderIconStyle: TextStyle = {
    fontSize: 48,
    marginBottom: spacing.md,
    opacity: 0.6,
  };

  const placeholderTextStyle: TextStyle = {
    fontSize: typography.size.body,
    color: colors.text.secondary,
    fontWeight: typography.weight.semibold,
  };

  const placeholderSubtextStyle: TextStyle = {
    fontSize: typography.size.body2,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise<void>(resolve => setTimeout(() => resolve(), 800));
    setRefreshing(false);
  }, []);

  const handleExport = () => {
    Alert.alert('成功', '导出报表成功');
  };

  const renderStatCard = (
    label: string,
    value: string | number,
    gradient: readonly [string, string],
  ) => (
    <GlassCard
      style={statsCardStyle}
      intensity="light"
      glow
      glowColor={gradient[0]}
    >
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={cardGradientStyle}
      >
        <Text style={cardLabelStyle}>{label}</Text>
        <Text style={cardValueStyle}>{value}</Text>
      </LinearGradient>
    </GlassCard>
  );

  if (loading) {
    return (
      <View style={containerStyle}>
        <View style={headerStyle}>
          <Skeleton width={150} height={28} borderRadius={BorderRadius.sm} />
          <Skeleton width={100} height={36} borderRadius={BorderRadius.full} />
        </View>
        <View style={skeletonGridStyle}>
          <Skeleton width="48%" height={100} borderRadius={BorderRadius.lg} />
          <Skeleton width="48%" height={100} borderRadius={BorderRadius.lg} />
          <Skeleton width="48%" height={100} borderRadius={BorderRadius.lg} />
          <Skeleton width="48%" height={100} borderRadius={BorderRadius.lg} />
        </View>
      </View>
    );
  }

  return (
    <View style={containerStyle}>
      <LinearGradient
        colors={[colors.primary.main, colors.primary.dark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={headerStyle}
      >
        <Text style={titleStyle}>票型销售统计</Text>
        <GlassButton
          title="📊 导出"
          onPress={handleExport}
          variant="secondary"
          size="small"
        />
      </LinearGradient>

      <ScrollView
        style={scrollViewStyle}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary.main}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <GlassCard style={filterCardStyle} intensity="light">
          <View style={timeFilterStyle}>
            {TIME_OPTIONS.map(item => (
              <AnimatedPressable
                key={item.value}
                onPress={() => setTimeFilter(item.value)}
                style={getFilterItemStyle(timeFilter === item.value)}
              >
                <Text
                  style={getFilterTextStyle(timeFilter === item.value)}
                >
                  {item.label}
                </Text>
              </AnimatedPressable>
            ))}
          </View>
        </GlassCard>

        <View style={statsCardsStyle}>
          {renderStatCard(
            '总销量',
            stats.totalSales.toLocaleString(),
            gradients.primary,
          )}
          {renderStatCard(
            '总营收',
            `¥${stats.totalRevenue.toLocaleString()}`,
            gradients.secondary,
          )}
          {renderStatCard('转化率', `${stats.conversionRate}%`, gradients.warm)}
          {renderStatCard(
            '平均客单价',
            `¥${stats.avgOrderValue}`,
            gradients.cool,
          )}
        </View>

        <GlassCard
          title="销售趋势"
          style={chartSectionStyle}
          intensity="light"
        >
          <View style={chartContainerStyle}>
            <View style={chartTabsStyle}>
              {CHART_TYPE_OPTIONS.map(item => (
                <AnimatedPressable
                  key={item.value}
                  onPress={() => setChartType(item.value)}
                  style={getChartTabStyle(chartType === item.value)}
                >
                  <Text
                    style={getChartTabTextStyle(chartType === item.value)}
                  >
                    {item.label}
                  </Text>
                </AnimatedPressable>
              ))}
            </View>
            <View style={chartPlaceholderStyle}>
              <Text style={placeholderIconStyle}>📈</Text>
              <Text style={placeholderTextStyle}>
                {chartType === 'sales' ? '销量趋势图表' : '营收趋势图表'}
              </Text>
              <Text style={placeholderSubtextStyle}>数据可视化组件占位</Text>
            </View>
          </View>
        </GlassCard>
      </ScrollView>
    </View>
  );
}
