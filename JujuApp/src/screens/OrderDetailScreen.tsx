import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Alert,
  Clipboard,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import type { NavigationProp } from '../types';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {
  FadeInUp,
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { orderApi, Order } from '../api/order';
import {useTheme, BorderRadius} from '../theme';
import {
  GlassCard,
  GlassButton,
  Skeleton,
  EmptyOrder,
} from '../components';

interface OrderStatusConfig {
  label: string;
  color: string;
  gradient: string[];
  icon: string;
  desc: string;
}

type OrderStatus = Order['status'];

interface RouteParams {
  orderId: number;
}

interface InfoRowProps {
  label: string;
  value: string;
  copyable?: boolean;
  colors: any;
  typography: any;
  spacing: any;
  onCopy?: () => void;
}

const InfoRow: React.FC<InfoRowProps> = ({
  label,
  value,
  copyable,
  colors,
  typography,
  spacing,
  onCopy,
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const rowStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  };

  const labelStyle: TextStyle = {
    width: 80,
    fontSize: typography.size.body2,
    color: colors.text.tertiary,
  };

  const valueStyle: TextStyle = {
    flex: 1,
    fontSize: typography.size.body2,
    color: colors.text.primary,
  };

  const copyBtnStyle: ViewStyle = {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.primary.light + '15',
    borderRadius: BorderRadius.sm,
  };

  const copyTextStyle: TextStyle = {
    fontSize: typography.size.caption,
    color: colors.primary.main,
    fontWeight: typography.weight.medium,
  };

  if (!copyable || !onCopy) {
    return (
      <View style={rowStyle}>
        <Text style={labelStyle}>{label}</Text>
        <Text style={valueStyle} numberOfLines={1}>
          {value}
        </Text>
      </View>
    );
  }

  return (
    <View style={rowStyle}>
      <Text style={labelStyle}>{label}</Text>
      <Text style={valueStyle} numberOfLines={1}>
        {value}
      </Text>
      <Animated.View style={animatedStyle}>
        <GlassButton
          title="复制"
          onPress={onCopy}
          variant="ghost"
          size="small"
          style={copyBtnStyle}
          textStyle={copyTextStyle}
        />
      </Animated.View>
    </View>
  );
};

interface PriceRowProps {
  label: string;
  value: string;
  isTotal?: boolean;
  isDiscount?: boolean;
  colors: any;
  typography: any;
  spacing: any;
}

const PriceRow: React.FC<PriceRowProps> = ({
  label,
  value,
  isTotal,
  isDiscount,
  colors,
  typography,
  spacing,
}) => {
  const rowStyle: ViewStyle = {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  };

  const labelStyle: TextStyle = {
    fontSize: typography.size.body2,
    color: colors.text.secondary,
  };

  const valueStyle: TextStyle = {
    fontSize: typography.size.body2,
    color: colors.text.primary,
  };

  const totalRowStyle: ViewStyle = {
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    marginTop: spacing.sm,
    paddingTop: spacing.md,
  };

  const totalLabelStyle: TextStyle = {
    fontSize: typography.size.h4,
    fontWeight: typography.weight.semibold,
    color: colors.text.primary,
  };

  const totalValueStyle: TextStyle = {
    fontSize: typography.size.h1,
    fontWeight: typography.weight.bold,
    color: colors.primary.main,
  };

  const discountStyle: TextStyle = {
    color: colors.status.success,
  };

  return (
    <View style={[rowStyle, isTotal && totalRowStyle]}>
      <Text style={[labelStyle, isTotal && totalLabelStyle]}>{label}</Text>
      <Text
        style={[
          valueStyle,
          isTotal && totalValueStyle,
          isDiscount && discountStyle,
        ]}
      >
        {value}
      </Text>
    </View>
  );
};

interface StatusBadgeProps {
  status: OrderStatusConfig;
  colors: any;
  typography: any;
  spacing: any;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  colors,
  typography,
  spacing,
}) => {
  const containerStyle: ViewStyle = {
    paddingVertical: spacing['2xl'],
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  };

  const iconStyle: TextStyle = {
    fontSize: 48,
    marginBottom: spacing.sm,
  };

  const labelStyle: TextStyle = {
    fontSize: typography.size.h2,
    fontWeight: typography.weight.bold,
    color: colors.text.inverse,
  };

  const descStyle: TextStyle = {
    fontSize: typography.size.body2,
    color: colors.text.inverse + 'D9',
    marginTop: spacing.xs,
  };

  return (
    <LinearGradient
      colors={status.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={containerStyle}
    >
      <Text style={iconStyle}>{status.icon}</Text>
      <Text style={labelStyle}>{status.label}</Text>
      {status.desc && <Text style={descStyle}>{status.desc}</Text>}
    </LinearGradient>
  );
};

export default function OrderDetailScreen() {
  const route = useRoute<RouteProp<{ params: RouteParams }, 'params'>>();
  const navigation = useNavigation<NavigationProp>();
  const { colors, typography, spacing, glassmorphism } = useTheme();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const orderId = route.params?.orderId;

  const STATUS_MAP: Record<OrderStatus, OrderStatusConfig> = {
    pending: {
      label: '待支付',
      color: colors.status.warning,
      gradient: [colors.status.warning, colors.accent.orange],
      icon: '⏳',
      desc: '请在30分钟内完成支付',
    },
    paid: {
      label: '已支付',
      color: colors.status.success,
      gradient: [colors.status.success, colors.accent.cyan],
      icon: '✅',
      desc: '支付成功，请准时参加聚会',
    },
    completed: {
      label: '已完成',
      color: colors.status.info,
      gradient: [colors.status.info, colors.secondary.main],
      icon: '✨',
      desc: '活动已完成，期待您的评价',
    },
    cancelled: {
      label: '已取消',
      color: colors.gray[400],
      gradient: [colors.gray[400], colors.gray[500]],
      icon: '❌',
      desc: '订单已取消',
    },
    refunded: {
      label: '已退款',
      color: colors.text.tertiary,
      gradient: [colors.gray[500], colors.gray[600]],
      icon: '↩️',
      desc: '退款已处理完成',
    },
  };

  const fetchOrderDetail = useCallback(async () => {
    if (!orderId) return;
    setLoading(true);
    try {
      const res = await orderApi.getOrderDetail(orderId);
      if (res.success) {
        setOrder(res.data);
      } else {
        Alert.alert('错误', res.message || '获取订单详情失败');
      }
    } catch {
      Alert.alert('错误', '网络错误');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (orderId) {
      fetchOrderDetail();
    }
  }, [orderId, fetchOrderDetail]);

  const copyOrderNo = useCallback(() => {
    if (order?.order_no) {
      Clipboard.setString(order.order_no);
      Alert.alert('已复制', '订单号已复制到剪贴板');
    }
  }, [order]);

  const handleCancel = useCallback(() => {
    if (!order) return;
    Alert.alert('确认取消', '确定要取消该订单吗？取消后无法恢复', [
      { text: '再想想', style: 'cancel' },
      {
        text: '确定取消',
        style: 'destructive',
        onPress: async () => {
          try {
            const res = await orderApi.cancelOrder(order.id);
            if (res.success) {
              Alert.alert('成功', '订单已取消');
              fetchOrderDetail();
            } else {
              Alert.alert('错误', res.message);
            }
          } catch {
            Alert.alert('错误', '网络错误');
          }
        },
      },
    ]);
  }, [order, fetchOrderDetail]);

  const handlePay = useCallback(() => {
    if (!order) return;
    navigation.navigate('Payment', { order });
  }, [order, navigation]);

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: colors.background.secondary,
  };

  const headerStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  };

  const backButtonStyle: ViewStyle = {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  };

  const backIconStyle: TextStyle = {
    fontSize: 24,
    color: colors.text.primary,
  };

  const headerTitleStyle: TextStyle = {
    fontSize: typography.size.h3,
    fontWeight: typography.weight.semibold,
    color: colors.text.primary,
  };

  const headerPlaceholderStyle: ViewStyle = {
    width: 40,
  };

  const scrollViewStyle: ViewStyle = {
    flex: 1,
  };

  const statusWrapperStyle: ViewStyle = {
    marginBottom: spacing.md,
  };

  const partyCardStyle: ViewStyle = {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  };

  const partyTitleStyle: TextStyle = {
    fontSize: typography.size.h3,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  };

  const partyMetaStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  };

  const metaIconStyle: TextStyle = {
    fontSize: 16,
    marginRight: spacing.xs,
  };

  const partyTimeStyle: TextStyle = {
    fontSize: typography.size.body,
    color: colors.text.secondary,
  };

  const partyLocationStyle: TextStyle = {
    fontSize: typography.size.body,
    color: colors.text.secondary,
    flex: 1,
  };

  const sectionCardStyle: ViewStyle = {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  };

  const ticketItemStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  };

  const ticketInfoStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  };

  const ticketNameStyle: TextStyle = {
    fontSize: typography.size.body,
    color: colors.text.primary,
  };

  const ticketQuantityStyle: TextStyle = {
    fontSize: typography.size.body2,
    color: colors.text.tertiary,
  };

  const ticketPriceStyle: TextStyle = {
    fontSize: typography.size.body,
    fontWeight: typography.weight.semibold,
    color: colors.primary.main,
  };

  const bottomSpacerStyle: ViewStyle = {
    height: 120,
  };

  const actionBarStyle: ViewStyle = {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: spacing.lg,
    paddingBottom: spacing['2xl'],
    gap: spacing.md,
  };

  const cancelActionBtnStyle: ViewStyle = {
    flex: 1,
  };

  const payActionBtnStyle: ViewStyle = {
    flex: 2,
  };

  const errorContainerStyle: ViewStyle = {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  };

  const loadingContainerStyle: ViewStyle = {
    flex: 1,
    padding: spacing.lg,
  };

  const loadingCardStyle: ViewStyle = {
    marginBottom: spacing.md,
  };

  const loadingPriceRowStyle: ViewStyle = {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

  if (loading) {
    return (
      <SafeAreaView style={containerStyle} edges={['top']}>
        <View style={headerStyle}>
          <GlassButton
            title="←"
            onPress={handleBack}
            variant="ghost"
            size="small"
            style={backButtonStyle}
            textStyle={backIconStyle}
          />
          <Text style={headerTitleStyle}>订单详情</Text>
          <View style={headerPlaceholderStyle} />
        </View>
        <View style={loadingContainerStyle}>
          <GlassCard style={loadingCardStyle}>
            <Skeleton width="60%" height={24} borderRadius={8} />
            <Skeleton width="40%" height={16} borderRadius={6} style={{ marginTop: 12 }} />
            <Skeleton width="80%" height={14} borderRadius={6} style={{ marginTop: 8 }} />
          </GlassCard>
          <GlassCard style={loadingCardStyle}>
            <Skeleton width="100%" height={20} borderRadius={8} />
            <Skeleton width="100%" height={20} borderRadius={8} style={{ marginTop: 12 }} />
            <Skeleton width="70%" height={20} borderRadius={8} style={{ marginTop: 12 }} />
          </GlassCard>
          <GlassCard style={loadingCardStyle}>
            <View style={loadingPriceRowStyle}>
              <Skeleton width="30%" height={18} borderRadius={6} />
              <Skeleton width="20%" height={18} borderRadius={6} />
            </View>
            <View style={[loadingPriceRowStyle, { marginTop: 12 }]}>
              <Skeleton width="30%" height={18} borderRadius={6} />
              <Skeleton width="20%" height={18} borderRadius={6} />
            </View>
            <View style={[loadingPriceRowStyle, { marginTop: 12 }]}>
              <Skeleton width="30%" height={22} borderRadius={6} />
              <Skeleton width="25%" height={22} borderRadius={6} />
            </View>
          </GlassCard>
        </View>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={containerStyle} edges={['top']}>
        <View style={headerStyle}>
          <GlassButton
            title="←"
            onPress={handleBack}
            variant="ghost"
            size="small"
            style={backButtonStyle}
            textStyle={backIconStyle}
          />
          <Text style={headerTitleStyle}>订单详情</Text>
          <View style={headerPlaceholderStyle} />
        </View>
        <View style={errorContainerStyle}>
          <EmptyOrder actionText="返回" onAction={handleBack} />
        </View>
      </SafeAreaView>
    );
  }

  const status = STATUS_MAP[order.status] || {
    label: '未知',
    color: colors.gray[400],
    gradient: [colors.gray[400], colors.gray[500]],
    icon: '?',
    desc: '',
  };

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      weekday: 'short',
    });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-CN');
  };

  return (
    <SafeAreaView style={containerStyle} edges={['top']}>
      <View style={headerStyle}>
        <GlassButton
          title="←"
          onPress={handleBack}
          variant="ghost"
          size="small"
          style={backButtonStyle}
          textStyle={backIconStyle}
        />
        <Text style={headerTitleStyle}>订单详情</Text>
        <View style={headerPlaceholderStyle} />
      </View>

      <ScrollView
        style={scrollViewStyle}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInUp.duration(400)}>
          <View style={statusWrapperStyle}>
            <StatusBadge
              status={status}
              colors={colors}
              typography={typography}
              spacing={spacing}
            />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.duration(400).delay(100)}>
          <GlassCard style={partyCardStyle} intensity="light">
            <Text style={partyTitleStyle}>{order.party?.title}</Text>
            <View style={partyMetaStyle}>
              <Text style={metaIconStyle}>📅</Text>
              <Text style={partyTimeStyle}>
                {order.party?.start_time &&
                  formatDateTime(order.party.start_time)}
              </Text>
            </View>
            <View style={partyMetaStyle}>
              <Text style={metaIconStyle}>📍</Text>
              <Text style={partyLocationStyle}>
                {order.party?.address}
              </Text>
            </View>
          </GlassCard>
        </Animated.View>

        <Animated.View entering={FadeInUp.duration(400).delay(150)}>
          <GlassCard
            title="票型信息"
            style={sectionCardStyle}
            intensity="light"
          >
            <View style={ticketItemStyle}>
              <View style={ticketInfoStyle}>
                <Text style={ticketNameStyle}>
                  {order.ticket?.name}
                </Text>
                <Text style={ticketQuantityStyle}>
                  x{order.quantity}
                </Text>
              </View>
              <Text style={ticketPriceStyle}>
                ¥{order.unit_price}
              </Text>
            </View>
          </GlassCard>
        </Animated.View>

        <Animated.View entering={FadeInUp.duration(400).delay(200)}>
          <GlassCard
            title="订单信息"
            style={sectionCardStyle}
            intensity="light"
          >
            <InfoRow
              label="订单编号"
              value={order.order_no}
              copyable
              onCopy={copyOrderNo}
              colors={colors}
              typography={typography}
              spacing={spacing}
            />
            <InfoRow
              label="创建时间"
              value={formatDate(order.created_at)}
              colors={colors}
              typography={typography}
              spacing={spacing}
            />
            {order.paid_at && (
              <InfoRow
                label="支付时间"
                value={formatDateTime(order.paid_at)}
                colors={colors}
                typography={typography}
                spacing={spacing}
              />
            )}
            <InfoRow
              label="支付方式"
              value={order.payment_method || '未支付'}
              colors={colors}
              typography={typography}
              spacing={spacing}
            />
            <InfoRow
              label="报名人"
              value={`${order.name} ${order.phone}`}
              colors={colors}
              typography={typography}
              spacing={spacing}
            />
          </GlassCard>
        </Animated.View>

        <Animated.View entering={FadeInUp.duration(400).delay(250)}>
          <GlassCard
            title="价格明细"
            style={sectionCardStyle}
            intensity="light"
          >
            <PriceRow
              label="票款总额"
              value={`¥${order.total_amount}`}
              colors={colors}
              typography={typography}
              spacing={spacing}
            />
            {order.discount_amount > 0 && (
              <PriceRow
                label="优惠金额"
                value={`-¥${order.discount_amount}`}
                isDiscount
                colors={colors}
                typography={typography}
                spacing={spacing}
              />
            )}
            <PriceRow
              label="实付金额"
              value={`¥${order.actual_amount || order.total_amount}`}
              isTotal
              colors={colors}
              typography={typography}
              spacing={spacing}
            />
          </GlassCard>
        </Animated.View>

        <View style={bottomSpacerStyle} />
      </ScrollView>

      {order.status === 'pending' && (
        <Animated.View
          entering={FadeIn.duration(300)}
          style={[actionBarStyle, glassmorphism.navbar]}
        >
          <GlassButton
            title="取消订单"
            onPress={handleCancel}
            variant="ghost"
            size="medium"
            style={cancelActionBtnStyle}
          />
          <GlassButton
            title="立即支付"
            onPress={handlePay}
            variant="primary"
            size="medium"
            style={payActionBtnStyle}
          />
        </Animated.View>
      )}
    </SafeAreaView>
  );
}
