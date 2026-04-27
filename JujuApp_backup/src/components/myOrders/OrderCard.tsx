import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { GlassCard, GlassButton } from '../../components';
import type { OrderCardProps } from './types';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const OrderCard: React.FC<OrderCardProps> = ({
  item,
  index,
  STATUS_MAP,
  colors,
  typography,
  spacing,
  onPress,
  onCancel,
  onPay,
}) => {
  const scale = useSharedValue(1);

  const status = STATUS_MAP[item.status] || {
    label: '未知',
    color: colors.text.tertiary,
    icon: '?',
    gradient: [colors.gray[400], colors.gray[500]],
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  const cardStyles = useMemo(
    () =>
      StyleSheet.create({
        card: {
          marginBottom: spacing.md,
          borderLeftWidth: 4,
          borderLeftColor: status.color,
        },
        header: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: spacing.md,
          paddingBottom: spacing.md,
          borderBottomWidth: 1,
          borderBottomColor: colors.border + '20',
        },
        orderNo: {
          fontSize: typography.size.caption,
          color: colors.text.tertiary,
        },
        statusBadge: {
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: spacing.sm,
          paddingVertical: spacing.xs,
          borderRadius: 12,
          gap: 4,
        },
        statusIcon: {
          fontSize: 12,
        },
        statusText: {
          fontSize: typography.size.caption,
          fontWeight: typography.weight.semibold,
        },
        body: {
          marginBottom: spacing.md,
        },
        partyTitle: {
          fontSize: typography.size.h4,
          fontWeight: typography.weight.semibold,
          color: colors.text.primary,
          marginBottom: spacing.xs,
        },
        ticketInfo: {
          fontSize: typography.size.body2,
          color: colors.text.secondary,
        },
        footer: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: spacing.sm,
        },
        orderTime: {
          fontSize: typography.size.caption,
          color: colors.text.tertiary,
        },
        totalPrice: {
          fontSize: typography.size.h2,
          fontWeight: typography.weight.bold,
          color: colors.primary.main,
        },
        actionRow: {
          flexDirection: 'row',
          justifyContent: 'flex-end',
          gap: spacing.sm,
          paddingTop: spacing.sm,
          borderTopWidth: 1,
          borderTopColor: colors.border + '20',
        },
        cancelBtn: {
          minWidth: 90,
        },
        payBtn: {
          minWidth: 90,
        },
      }),
    [colors, spacing, typography, status.color],
  );

  return (
    <Animated.View entering={FadeInUp.duration(400).delay(index * 80)}>
      <AnimatedTouchable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <Animated.View style={animatedStyle}>
          <GlassCard intensity="light" style={cardStyles.card}>
            <View style={cardStyles.header}>
              <Text style={cardStyles.orderNo}>订单号: {item.order_no}</Text>
              <View
                style={[
                  cardStyles.statusBadge,
                  { backgroundColor: status.color + '20' },
                ]}
              >
                <Text style={cardStyles.statusIcon}>{status.icon}</Text>
                <Text style={[cardStyles.statusText, { color: status.color }]}>
                  {status.label}
                </Text>
              </View>
            </View>

            <View style={cardStyles.body}>
              <Text style={cardStyles.partyTitle}>{item.party?.title}</Text>
              <Text style={cardStyles.ticketInfo}>
                {item.ticket?.name} x {item.quantity}
              </Text>
            </View>

            <View style={cardStyles.footer}>
              <Text style={cardStyles.orderTime}>
                {new Date(item.created_at).toLocaleDateString('zh-CN')}
              </Text>
              <Text style={cardStyles.totalPrice}>
                ¥{item.actual_amount || item.total_amount}
              </Text>
            </View>

            {item.status === 'pending' && (
              <View style={cardStyles.actionRow}>
                <GlassButton
                  title="取消订单"
                  onPress={onCancel}
                  variant="ghost"
                  size="small"
                  style={cardStyles.cancelBtn}
                />
                <GlassButton
                  title="去支付"
                  onPress={onPay}
                  variant="primary"
                  size="small"
                  style={cardStyles.payBtn}
                />
              </View>
            )}
          </GlassCard>
        </Animated.View>
      </AnimatedTouchable>
    </Animated.View>
  );
};

export default React.memo(OrderCard);
