import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Alert,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import Animated, { FadeInUp, FadeIn } from 'react-native-reanimated';
import { paymentApi } from '../api/order';
import {
  useTheme,
  spacing,
  typography,
  BorderRadius,
  textStyles,
  animation,
} from '../theme';
import { GlassCard } from '../components/GlassCard';
import { GlassButton } from '../components/GlassButton';
import LinearGradient from 'react-native-linear-gradient';

interface PaymentMethod {
  key: string;
  label: string;
  icon: string;
  desc: string;
  disabled?: boolean;
}

const PAYMENT_METHODS: PaymentMethod[] = [
  { key: 'wechat', label: '微信支付', icon: '💚', desc: '推荐使用' },
  { key: 'alipay', label: '支付宝', icon: '🔵', desc: '快捷支付' },
  { key: 'wallet', label: '钱包余额', icon: '👛', desc: '余额支付', disabled: true },
];

// 2026高颜值设计 - 支付页面 (设计系统重构版)
export default function PaymentScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { colors } = useTheme();

  const { order, party, ticket } = (route.params as any) || {};
  const [paymentMethod, setPaymentMethod] = useState('wechat');
  const [paying, setPaying] = useState(false);
  const [countdown, setCountdown] = useState(1800); // 30分钟倒计时

  useEffect(() => {
    if (!order?.created_at) return;
    const createdTime = new Date(order.created_at).getTime();
    const deadline = createdTime + 30 * 60 * 1000; // 30分钟后
    const updateCountdown = () => {
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((deadline - now) / 1000));
      setCountdown(remaining);
    };
    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [order?.created_at]);

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePay = useCallback(async () => {
    if (!order?.id) {
      Alert.alert('错误', '订单信息不完整');
      return;
    }
    setPaying(true);
    try {
      const res = await paymentApi.createPayment(order.id, {
        paymentMethod: paymentMethod,
      });
      if ((res as any).code === 0) {
        // 支付成功，导航到成功页面
        (navigation as any).navigate('OrderSuccess', {
          order: (res as any).data || order,
          party,
          ticket,
        });
      } else {
        Alert.alert('支付失败', (res as any).message || '请重试', [
          { text: '确定', style: 'cancel' },
          {
            text: '重试',
            onPress: () => {
              setTimeout(() => handlePay(), 0);
            },
          },
        ]);
      }
    } catch {
      Alert.alert('错误', '网络错误');
    } finally {
      setPaying(false);
    }
  }, [order, paymentMethod, navigation, party, ticket]);

  // 使用设计系统替代 useMemo 样式
  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: colors.background.secondary,
  };

  const loadingContainerStyle: ViewStyle = {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
  };

  const loadingTextStyle: TextStyle = {
    color: colors.text.secondary,
    fontSize: typography.size.body,
  };

  const orderSummaryStyle: ViewStyle = {
    padding: spacing.lg,
    margin: spacing.md,
    borderRadius: BorderRadius.xl,
  };

  const orderSummaryWrapperStyle: ViewStyle = {
    marginBottom: spacing.md,
  };

  const countdownWrapperStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.sm,
    backgroundColor: colors.status.warning + '15',
    borderRadius: BorderRadius.md,
    marginTop: spacing.sm,
  };

  const countdownIconStyle: TextStyle = {
    fontSize: 14,
    marginRight: spacing.xs,
  };

  const countdownTextStyle: TextStyle = {
    fontSize: typography.size.caption,
    color: colors.status.warning,
    fontWeight: typography.weight.medium,
  };

  const partyTitleStyle: TextStyle = {
    ...textStyles.h3,
    color: colors.text.inverse,
    marginBottom: spacing.sm,
  };

  const ticketInfoStyle: TextStyle = {
    fontSize: typography.size.body,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  };

  const orderNameStyle: TextStyle = {
    fontSize: typography.size.body2,
    color: colors.text.secondary,
  };

  const sectionStyle: ViewStyle = {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
  };

  const sectionTitleStyle: TextStyle = {
    ...textStyles.h3,
    color: colors.text.primary,
    marginBottom: spacing.md,
  };

  const methodItemBaseStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.background.tertiary,
    borderRadius: BorderRadius.lg,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  };

  const methodDisabledStyle: ViewStyle = {
    opacity: 0.5,
  };

  const methodSelectedStyle: ViewStyle = {
    backgroundColor: colors.primary.light + '14',
    borderColor: colors.primary.main,
  };

  const methodLabelStyle: TextStyle = {
    flex: 1,
    fontSize: typography.size.body,
    color: colors.text.primary,
    fontWeight: typography.weight.medium,
  };

  const amountRowStyle: ViewStyle = {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  };

  const amountLabelStyle: TextStyle = {
    fontSize: typography.size.body,
    color: colors.text.secondary,
  };

  const amountValueStyle: TextStyle = {
    fontSize: typography.size.body,
    color: colors.text.primary,
    fontWeight: typography.weight.medium,
  };

  const discountStyle: TextStyle = {
    color: colors.status.success,
  };

  const dividerStyle: ViewStyle = {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: spacing.md,
  };

  const totalRowStyle: ViewStyle = {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

  const totalLabelStyle: TextStyle = {
    fontSize: typography.size.body,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
  };

  const totalValueStyle: TextStyle = {
    fontSize: typography.size.h2,
    fontWeight: typography.weight.bold,
    color: colors.primary.main,
  };

  const payBtnWrapStyle: ViewStyle = {
    margin: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing['2xl'],
  };

  if (!order) {
    return (
      <SafeAreaView style={loadingContainerStyle}>
        <Text style={loadingTextStyle}>订单信息缺失</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={containerStyle} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 订单概览 */}
        <Animated.View entering={FadeInUp.duration(animation.duration.normal)} style={orderSummaryWrapperStyle}>
          <LinearGradient
            colors={colors.primary.gradient}
            style={orderSummaryStyle}
          >
            <Text style={partyTitleStyle}>{party?.title}</Text>
            <Text style={ticketInfoStyle}>
              {ticket?.name} x {order?.quantity || 1}
            </Text>
            <Text style={orderNameStyle}>报名人: {order?.name}</Text>
            {countdown > 0 && (
              <View style={countdownWrapperStyle}>
                <Text style={countdownIconStyle}>⏱️</Text>
                <Text style={countdownTextStyle}>
                  支付截止: {formatCountdown(countdown)}
                </Text>
              </View>
            )}
          </LinearGradient>
        </Animated.View>

        {/* 支付方式 */}
        <Animated.View entering={FadeInUp.duration(animation.duration.normal).delay(100)}>
          <GlassCard style={sectionStyle} intensity="medium">
            <Text style={sectionTitleStyle}>支付方式</Text>
            {PAYMENT_METHODS.map(method => (
              <GlassButton
                key={method.key}
                title={`${method.icon}  ${method.label}`}
                subtitle={method.desc}
                onPress={() => !method.disabled && setPaymentMethod(method.key)}
                variant={paymentMethod === method.key ? 'primary' : 'ghost'}
                size="medium"
                fullWidth
                disabled={method.disabled}
                style={[
                  methodItemBaseStyle,
                  paymentMethod === method.key && methodSelectedStyle,
                  method.disabled && methodDisabledStyle,
                ]}
                textStyle={methodLabelStyle}
              />
            ))}
          </GlassCard>
        </Animated.View>

        {/* 订单信息 */}
        <Animated.View entering={FadeInUp.duration(animation.duration.normal).delay(150)}>
          <GlassCard style={sectionStyle} intensity="light">
            <Text style={sectionTitleStyle}>订单信息</Text>
            <View style={amountRowStyle}>
              <Text style={amountLabelStyle}>票型</Text>
              <Text style={amountValueStyle}>
                {ticket?.name || '标准票'} x {order?.quantity || 1}
              </Text>
            </View>
            <View style={amountRowStyle}>
              <Text style={amountLabelStyle}>单价</Text>
              <Text style={amountValueStyle}>¥{order?.unit_price || ticket?.price || 0}</Text>
            </View>
            <View style={amountRowStyle}>
              <Text style={amountLabelStyle}>数量</Text>
              <Text style={amountValueStyle}>{order?.quantity || 1} 张</Text>
            </View>
          </GlassCard>
        </Animated.View>

        {/* 支付金额 */}
        <Animated.View entering={FadeInUp.duration(animation.duration.normal).delay(200)}>
          <GlassCard style={sectionStyle} intensity="light">
            <Text style={sectionTitleStyle}>支付金额</Text>
            <View style={amountRowStyle}>
              <Text style={amountLabelStyle}>票款</Text>
              <Text style={amountValueStyle}>¥{order?.total_amount || 0}</Text>
            </View>
            {order?.discount_amount > 0 && (
              <View style={amountRowStyle}>
                <Text style={amountLabelStyle}>优惠</Text>
                <Text style={[amountValueStyle, discountStyle]}>
                  -¥{order.discount_amount}
                </Text>
              </View>
            )}
            <View style={dividerStyle} />
            <View style={totalRowStyle}>
              <Text style={totalLabelStyle}>合计</Text>
              <Text style={totalValueStyle}>
                ¥{order?.actual_amount || order?.total_amount || 0}
              </Text>
            </View>
          </GlassCard>
        </Animated.View>

        {/* 支付按钮 */}
        <Animated.View entering={FadeIn.duration(animation.duration.normal).delay(300)}>
          <View style={payBtnWrapStyle}>
            <GlassButton
              title={
                paying
                  ? '支付中...'
                  : `确认支付 ¥${order?.actual_amount || order?.total_amount || 0}`
              }
              onPress={handlePay}
              disabled={paying}
              loading={paying}
              size="large"
              variant="primary"
              fullWidth
            />
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
