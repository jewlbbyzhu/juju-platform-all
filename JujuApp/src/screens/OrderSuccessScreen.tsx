// 支付成功页 - 2026高颜值重构
import React from 'react';
import { View, Text, ScrollView, ViewStyle, TextStyle } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import {
  useTheme,
  spacing,
  typography,
  textStyles,
  gradients,
  Shadows,
  BorderRadius,
  Border,
} from '../theme';
import { GlassCard } from '../components/GlassCard';
import { GlassButton } from '../components/GlassButton';
import { LinearGradient } from 'expo-linear-gradient';

export default function OrderSuccessScreen() {
  const { colors } = useTheme();
  const route = useRoute();
  const navigation = useNavigation();
  const { order } = (route.params as any) || {};
  useApp();

  const handleViewOrder = () => {
    (navigation as any).navigate('MyOrders');
  };

  const handleViewTickets = () => {
    (navigation as any).navigate('MyTickets');
  };

  const handleBackHome = () => {
    (navigation as any).navigate('Main', { screen: 'Home' });
  };

  // 使用设计系统替代 useMemo 样式
  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: colors.background.secondary,
  };

  const contentContainerStyle: ViewStyle = {
    alignItems: 'center',
    paddingTop: spacing['3xl'],
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['2xl'],
  };

  const successIconStyle: ViewStyle = {
    width: 90,
    height: 90,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
    ...Shadows.primary,
  };

  const checkmarkStyle: TextStyle = {
    fontSize: typography.size.display,
    color: colors.text.inverse,
    fontWeight: typography.weight.bold,
  };

  const titleStyle: TextStyle = {
    ...textStyles.display,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    letterSpacing: 1,
  };

  const subtitleStyle: TextStyle = {
    fontSize: typography.size.body,
    color: colors.text.secondary,
    marginBottom: spacing['2xl'],
    fontWeight: typography.weight.medium,
  };

  const orderCardStyle: ViewStyle = {
    width: '100%',
    marginBottom: spacing['2xl'],
    padding: 0,
    overflow: 'hidden',
  };

  const cardHeaderStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: Border.width.normal,
    borderBottomColor: colors.border,
    marginBottom: spacing.sm,
  };

  const cardHeaderLineStyle: ViewStyle = {
    flex: 1,
    height: 1,
    backgroundColor: colors.divider,
    marginHorizontal: spacing.sm,
  };

  const cardTitleStyle: TextStyle = {
    fontSize: typography.size.body,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
    letterSpacing: 2,
  };

  const infoRowStyle: ViewStyle = {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  };

  const dividerStyle: ViewStyle = {
    height: 1,
    backgroundColor: colors.divider,
    marginHorizontal: spacing.lg,
  };

  const labelStyle: TextStyle = {
    fontSize: typography.size.body2,
    color: colors.text.tertiary,
    fontWeight: typography.weight.medium,
  };

  const valueStyle: TextStyle = {
    fontSize: typography.size.body,
    color: colors.text.primary,
    flex: 1,
    textAlign: 'right',
    marginLeft: spacing.sm,
    fontWeight: typography.weight.semibold,
  };

  const amountStyle: TextStyle = {
    fontSize: typography.size.h3,
    fontWeight: typography.weight.bold,
    color: colors.primary.main,
  };

  const orderIdStyle: TextStyle = {
    fontSize: typography.size.caption,
    color: colors.text.secondary,
    fontFamily: typography.fontFamily.mono,
  };

  const buttonGroupStyle: ViewStyle = {
    width: '100%',
    gap: spacing.sm,
  };

  const secondaryButtonsStyle: ViewStyle = {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  };

  const secondaryBtnStyle: ViewStyle = {
    flex: 1,
  };

  const ghostBtnStyle: ViewStyle = {
    flex: 1,
  };

  return (
    <ScrollView
      style={containerStyle}
      contentContainerStyle={contentContainerStyle}
    >
      {/* Success Icon with Gradient */}
      <LinearGradient
        colors={gradients.primary}
        style={successIconStyle}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={checkmarkStyle}>✓</Text>
      </LinearGradient>

      {/* Title Section */}
      <Text style={titleStyle}>支付成功！</Text>
      <Text style={subtitleStyle}>您已成功报名该活动</Text>

      {/* Order Info Card */}
      <GlassCard
        style={orderCardStyle}
        intensity="medium"
        glow
        glowColor={colors.primary.main}
      >
        <View style={cardHeaderStyle}>
          <View style={cardHeaderLineStyle} />
          <Text style={cardTitleStyle}>订单信息</Text>
          <View style={cardHeaderLineStyle} />
        </View>

        <View style={infoRowStyle}>
          <Text style={labelStyle}>活动</Text>
          <Text style={valueStyle} numberOfLines={1}>
            {order?.party?.title || order?.partyTitle || '聚聚会活动'}
          </Text>
        </View>
        <View style={dividerStyle} />

        <View style={infoRowStyle}>
          <Text style={labelStyle}>票型</Text>
          <Text style={valueStyle}>
            {order?.ticket?.name || order?.ticketName || '标准票'} x {order?.quantity || 1}
          </Text>
        </View>
        <View style={dividerStyle} />

        <View style={infoRowStyle}>
          <Text style={labelStyle}>金额</Text>
          <Text style={amountStyle}>¥{order?.actual_amount || order?.total_amount || order?.totalPrice || 0}</Text>
        </View>
        <View style={dividerStyle} />

        <View style={infoRowStyle}>
          <Text style={labelStyle}>订单号</Text>
          <Text style={orderIdStyle}>{order?.order_no || order?.id}</Text>
        </View>
      </GlassCard>

      {/* Button Group */}
      <View style={buttonGroupStyle}>
        <GlassButton
          title="查看票券"
          onPress={handleViewTickets}
          variant="gradient"
          size="large"
          fullWidth
        />

        <View style={secondaryButtonsStyle}>
          <GlassButton
            title="查看订单"
            onPress={handleViewOrder}
            variant="secondary"
            size="medium"
            style={secondaryBtnStyle}
          />
          <GlassButton
            title="返回首页"
            onPress={handleBackHome}
            variant="ghost"
            size="medium"
            style={ghostBtnStyle}
          />
        </View>
      </View>
    </ScrollView>
  );
}
