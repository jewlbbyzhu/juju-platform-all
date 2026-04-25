import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import {
  useTheme,
  glassmorphism,
  spacing,
  typography,
  BorderRadius,
  Border,
} from '../theme';
import { GlassCard } from '../components/GlassCard';
import { GlassButton } from '../components/GlassButton';
import { SkeletonCard } from '../components/Skeleton';
import { AnimatedPressable } from '../components/feed/AnimatedPressable';

export default function TicketStatsDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { colors } = useTheme();
  const { id } = (route.params as any) || {};

  const [ticketInfo] = useState({
    id: '1',
    name: '早鸟票',
    type: 1,
    price: 40,
    stock: 500,
    sold: 450,
    status: 0,
    totalSales: 450,
    totalRevenue: 18000,
    conversionRate: 28.5,
    avgOrderValue: 40,
  });



  const handleBack = useCallback(() => navigation.goBack(), [navigation]);
  const handleViewOrders = useCallback(
    () => (navigation as any).navigate('TicketOrders', { id }),
    [navigation, id],
  );
  const handleEditTicket = useCallback(
    () => (navigation as any).navigate('EditTicket', { id }),
    [navigation, id],
  );

  // 使用设计系统替代 useMemo 样式 - 提取为命名样式对象
  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: colors.gray[900],
  };

  const backgroundGradientStyle: ViewStyle = {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  };

  const headerStyle: ViewStyle = {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    ...glassmorphism.header,
  };

  const backButtonStyle: ViewStyle = {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: colors.text.primary + '1A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: Border.width.thin,
    borderColor: colors.text.primary + '1A',
  };

  const backIconStyle: TextStyle = {
    fontSize: typography.size.h4,
    color: colors.text.inverse,
  };

  const headerTitleStyle: TextStyle = {
    fontSize: typography.size.h3,
    fontWeight: typography.weight.bold,
    color: colors.text.inverse,
    letterSpacing: 0.5,
  };

  const shareButtonStyle: ViewStyle = {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: colors.text.primary + '1A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: Border.width.thin,
    borderColor: colors.text.primary + '1A',
  };

  const shareIconStyle: TextStyle = {
    fontSize: typography.size.h4,
  };

  const placeholderStyle: ViewStyle = {
    width: 40,
  };

  const scrollContentStyle: ViewStyle = {
    padding: spacing.lg,
  };

  const mainCardStyle: ViewStyle = {
    marginVertical: spacing.sm,
    padding: spacing.xl,
  };

  const ticketHeaderStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
  };

  const ticketBadgeStyle: ViewStyle = {
    width: 50,
    height: 50,
    borderRadius: BorderRadius.lg,
    backgroundColor: colors.primary.main + '33',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.lg,
    borderWidth: Border.width.thin,
    borderColor: colors.primary.main + '4D',
  };

  const ticketBadgeTextStyle: TextStyle = {
    fontSize: typography.size.h2,
  };

  const ticketTitleContainerStyle: ViewStyle = {
    flex: 1,
  };

  const ticketNameStyle: TextStyle = {
    fontSize: typography.size.h2,
    fontWeight: typography.weight.bold,
    color: colors.text.inverse,
    marginBottom: spacing.xs,
  };

  const ticketTypeStyle: TextStyle = {
    fontSize: typography.size.body2,
    color: colors.primary.light,
    fontWeight: typography.weight.medium,
  };

  const priceContainerStyle: ViewStyle = {
    marginBottom: spacing.xl,
  };

  const priceLabelStyle: TextStyle = {
    fontSize: typography.size.body2,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  };

  const priceRowStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'flex-start',
  };

  const currencyStyle: TextStyle = {
    fontSize: typography.size.h3,
    fontWeight: typography.weight.semibold,
    color: colors.primary.main,
    marginTop: spacing.xs,
  };

  const priceStyle: TextStyle = {
    fontSize: typography.size.display,
    fontWeight: typography.weight.bold,
    color: colors.primary.main,
  };

  const stockContainerStyle: ViewStyle = {
    marginTop: spacing.sm,
  };

  const stockHeaderStyle: ViewStyle = {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  };

  const stockLabelStyle: TextStyle = {
    fontSize: typography.size.body2,
    color: colors.text.secondary,
  };

  const stockTextStyle: TextStyle = {
    fontSize: typography.size.body2,
    fontWeight: typography.weight.semibold,
    color: colors.text.inverse,
  };

  const progressBarStyle: ViewStyle = {
    height: 8,
    backgroundColor: colors.text.primary + '1A',
    borderRadius: BorderRadius.xs,
    overflow: 'hidden',
  };

  const progressFillStyle: ViewStyle = {
    height: '100%',
    borderRadius: BorderRadius.xs,
  };

  const statsGridStyle: ViewStyle = {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.xs,
    marginTop: spacing.sm,
  };

  const statCardStyle: ViewStyle = {
    width: '48%',
    margin: '1%',
    padding: spacing.lg,
    alignItems: 'center',
  };

  const statIconStyle: TextStyle = {
    fontSize: typography.size.h2,
    marginBottom: spacing.sm,
  };

  const statValueStyle: TextStyle = {
    fontSize: typography.size.h2,
    fontWeight: typography.weight.bold,
    color: colors.text.inverse,
    marginBottom: spacing.xs,
  };

  const statLabelStyle: TextStyle = {
    fontSize: typography.size.caption,
    color: colors.text.secondary,
  };

  const actionsStyle: ViewStyle = {
    marginTop: spacing['3xl'],
    gap: spacing.md,
  };

  const actionBtnStyle: ViewStyle = {
    marginVertical: 0,
  };

  if (loading) {
    return (
      <SafeAreaView style={containerStyle} edges={['top']}>
        <LinearGradient
          colors={[colors.gray[900], colors.gray[800], colors.gray[900]]}
          style={backgroundGradientStyle}
        />
        <View style={headerStyle}>
          <AnimatedPressable onPress={handleBack} style={backButtonStyle}>
            <Text style={backIconStyle}>←</Text>
          </AnimatedPressable>
          <Text style={headerTitleStyle}>票型详情</Text>
          <View style={placeholderStyle} />
        </View>
        <SkeletonCard />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={containerStyle} edges={['top']}>
      {/* 背景渐变 */}
      <LinearGradient
        colors={[colors.gray[900], colors.gray[800], colors.gray[900]]}
        style={backgroundGradientStyle}
      />

      {/* 玻璃拟态头部 */}
      <View style={headerStyle}>
        <AnimatedPressable onPress={handleBack} style={backButtonStyle}>
          <Text style={backIconStyle}>←</Text>
        </AnimatedPressable>
        <Text style={headerTitleStyle}>票型详情</Text>
        <AnimatedPressable onPress={() => {}} style={shareButtonStyle}>
          <Text style={shareIconStyle}>📤</Text>
        </AnimatedPressable>
      </View>

      <ScrollView
        contentContainerStyle={scrollContentStyle}
        showsVerticalScrollIndicator={false}
      >
        {/* 主信息卡片 - 玻璃拟态 */}
        <GlassCard
          style={mainCardStyle}
          intensity="medium"
          glow
          glowColor={colors.primary.main}
        >
          <View style={ticketHeaderStyle}>
            <View style={ticketBadgeStyle}>
              <Text style={ticketBadgeTextStyle}>🎫</Text>
            </View>
            <View style={ticketTitleContainerStyle}>
              <Text style={ticketNameStyle}>{ticketInfo.name}</Text>
              <Text style={ticketTypeStyle}>限量发售</Text>
            </View>
          </View>

          <View style={priceContainerStyle}>
            <Text style={priceLabelStyle}>票价</Text>
            <View style={priceRowStyle}>
              <Text style={currencyStyle}>¥</Text>
              <Text style={priceStyle}>{ticketInfo.price}</Text>
            </View>
          </View>

          {/* 库存进度条 */}
          <View style={stockContainerStyle}>
            <View style={stockHeaderStyle}>
              <Text style={stockLabelStyle}>销售进度</Text>
              <Text style={stockTextStyle}>
                {ticketInfo.sold}/{ticketInfo.stock}
              </Text>
            </View>
            <View style={progressBarStyle}>
              <LinearGradient
                colors={colors.primary.gradient}
                style={[
                  progressFillStyle,
                  { width: `${(ticketInfo.sold / ticketInfo.stock) * 100}%` },
                ]}
              />
            </View>
          </View>
        </GlassCard>

        {/* 统计数据网格 - 玻璃拟态 */}
        <View style={statsGridStyle}>
          <GlassCard style={statCardStyle} intensity="light">
            <Text style={statIconStyle}>📊</Text>
            <Text style={statValueStyle}>{ticketInfo.totalSales}</Text>
            <Text style={statLabelStyle}>总销量</Text>
          </GlassCard>

          <GlassCard style={statCardStyle} intensity="light">
            <Text style={statIconStyle}>💰</Text>
            <Text style={statValueStyle}>
              ¥{(ticketInfo.totalRevenue / 1000).toFixed(1)}k
            </Text>
            <Text style={statLabelStyle}>总营收</Text>
          </GlassCard>

          <GlassCard style={statCardStyle} intensity="light">
            <Text style={statIconStyle}>📈</Text>
            <Text style={statValueStyle}>{ticketInfo.conversionRate}%</Text>
            <Text style={statLabelStyle}>转化率</Text>
          </GlassCard>

          <GlassCard style={statCardStyle} intensity="light">
            <Text style={statIconStyle}>🛒</Text>
            <Text style={statValueStyle}>¥{ticketInfo.avgOrderValue}</Text>
            <Text style={statLabelStyle}>客单价</Text>
          </GlassCard>
        </View>

        {/* 操作按钮 */}
        <View style={actionsStyle}>
          <GlassButton
            title="查看全部订单"
            onPress={handleViewOrders}
            variant="primary"
            size="large"
            fullWidth
            style={actionBtnStyle}
          />
          <GlassButton
            title="编辑票型"
            onPress={handleEditTicket}
            variant="secondary"
            size="large"
            fullWidth
            style={actionBtnStyle}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
