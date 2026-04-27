import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Alert,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { orderApi } from '../api';
import {
  useTheme,
  spacing,
  typography,
  BorderRadius,
  animation,
  gradients,
} from '../theme';
import { GlassCard } from '../components/GlassCard';
import { GlassButton } from '../components/GlassButton';
import LinearGradient from 'react-native-linear-gradient';

interface Order {
  id: string;
  total_amount: number;
  actual_amount: number;
}

export default function RefundApplyScreen(): React.JSX.Element {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { orderId } = (route.params as any) || {};

  const [order, setOrder] = useState<Order>({
    id: '',
    total_amount: 0,
    actual_amount: 0,
  });
  const [selectedReason, setSelectedReason] = useState('');
  const [detail, setDetail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const refundReasons = [
    '计划有变，无法参加',
    '聚会时间冲突',
    '聚会地点太远',
    '对聚会内容不满意',
    '重复下单',
    '其他原因',
  ];

  useEffect(() => {
    if (orderId) fetchOrderInfo();
  }, [orderId]);

  const fetchOrderInfo = async () => {
    try {
      const res = await orderApi.getOrderDetail(orderId);
      if ((res as any).code === 0) setOrder((res as any).data);
    } catch {
      // 获取订单信息失败，保持默认空订单状态
    }
  };

  const canSubmit = () => selectedReason !== '';

  const submitRefund = async () => {
    if (!canSubmit()) {
      Alert.alert('提示', '请选择退款原因');
      return;
    }
    setSubmitting(true);
    try {
      const res = await (orderApi as any).applyRefund({
        order_id: orderId,
        reason: selectedReason,
        detail,
        amount: order.actual_amount || order.total_amount,
      });
      if ((res as any).code === 0) {
        Alert.alert('申请已提交', '退款申请已提交，我们将在1-3个工作日内处理', [
          { text: '确定', onPress: () => navigation.goBack() },
        ]);
      }
    } catch {
      Alert.alert('错误', '提交失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  const amount = order.actual_amount || order.total_amount;

  // 使用设计系统替代 useMemo 样式对象
  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: colors.background.secondary,
  };

  const amountSectionStyle: ViewStyle = {
    margin: spacing.lg,
    padding: spacing['2xl'] + spacing.xs,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
  };

  const amountLabelStyle: TextStyle = {
    fontSize: typography.size.body2,
    color: colors.text.primary,
    opacity: 0.9,
    marginBottom: spacing.sm,
  };

  const amountDisplayStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: spacing.sm,
  };

  const currencyStyle: TextStyle = {
    fontSize: typography.size.h1,
    color: colors.text.inverse,
    marginTop: spacing.sm,
    fontWeight: typography.weight.semibold,
  };

  const amountStyle: TextStyle = {
    fontSize: typography.size.display,
    fontWeight: typography.weight.bold,
    color: colors.text.inverse,
  };

  const amountTipStyle: TextStyle = {
    fontSize: typography.size.body2,
    color: colors.text.primary,
    opacity: 0.8,
  };

  const sectionStyle: ViewStyle = {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  };

  const sectionTitleStyle: TextStyle = {
    fontSize: typography.size.h4,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
    marginBottom: spacing.lg,
  };

  const textareaWrapperStyle: ViewStyle = {
    position: 'relative',
  };

  const detailTextareaStyle: TextStyle = {
    height: 120,
    backgroundColor: colors.background.input,
    borderRadius: BorderRadius.lg,
    padding: spacing.lg,
    fontSize: typography.size.body,
    color: colors.text.primary,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: colors.primary.light,
    opacity: 0.3,
  };

  const wordCountStyle: TextStyle = {
    position: 'absolute',
    bottom: spacing.lg + spacing.xs,
    right: spacing.lg,
    fontSize: typography.size.body2,
    color: colors.text.tertiary,
  };

  const tipsSectionStyle: ViewStyle = {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  };

  const tipsTitleStyle: TextStyle = {
    fontSize: typography.size.body,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  };

  const tipsItemStyle: TextStyle = {
    fontSize: typography.size.body2,
    color: colors.text.secondary,
    lineHeight: 22,
    marginBottom: spacing.sm,
  };

  const submitBtnWrapStyle: ViewStyle = {
    margin: spacing.lg,
    marginTop: spacing.sm,
    marginBottom: spacing['3xl'],
  };

  const renderReasonItem = useCallback(
    (reason: string) => {
      const isActive = selectedReason === reason;
      return (
        <GlassButton
          key={reason}
          title={reason}
          onPress={() => setSelectedReason(reason)}
          variant={isActive ? 'primary' : 'ghost'}
          size="small"
          style={{
            marginBottom: spacing.sm,
            justifyContent: 'flex-start',
            paddingHorizontal: spacing.md,
          }}
          textStyle={{
            color: isActive ? colors.text.inverse : colors.text.secondary,
            fontWeight: isActive ? typography.weight.semibold : typography.weight.regular,
          }}
        />
      );
    },
    [selectedReason, colors, spacing, typography],
  );

  return (
    <SafeAreaView style={containerStyle} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Animated.View
          entering={FadeInUp.duration(animation.duration.normal).delay(100)}
        >
          <LinearGradient
            colors={gradients.warm}
            style={amountSectionStyle}
          >
            <Text style={amountLabelStyle}>退款金额</Text>
            <View style={amountDisplayStyle}>
              <Text style={currencyStyle}>¥</Text>
              <Text style={amountStyle}>{amount}</Text>
            </View>
            <Text style={amountTipStyle}>最高可退金额 ¥{amount}</Text>
          </LinearGradient>
        </Animated.View>

        <Animated.View
          entering={FadeInUp.duration(animation.duration.normal).delay(200)}
        >
          <GlassCard style={sectionStyle} intensity="medium">
            <Text style={sectionTitleStyle}>退款原因</Text>
            <View>
              {refundReasons.map(renderReasonItem)}
            </View>
          </GlassCard>
        </Animated.View>

        <Animated.View
          entering={FadeInUp.duration(animation.duration.normal).delay(300)}
        >
          <GlassCard style={sectionStyle} intensity="light">
            <Text style={sectionTitleStyle}>详细说明（选填）</Text>
            <View style={textareaWrapperStyle}>
              <TextInput
                style={detailTextareaStyle}
                value={detail}
                onChangeText={setDetail}
                placeholder="请详细描述退款原因，有助于快速处理..."
                placeholderTextColor={colors.text.tertiary}
                multiline
                maxLength={200}
              />
              <Text style={wordCountStyle}>{detail.length}/200</Text>
            </View>
          </GlassCard>
        </Animated.View>

        <Animated.View
          entering={FadeInUp.duration(animation.duration.normal).delay(400)}
        >
          <GlassCard style={tipsSectionStyle} intensity="light">
            <Text style={tipsTitleStyle}>退款说明</Text>
            <View>
              <Text style={tipsItemStyle}>
                • 退款申请提交后，我们将在1-3个工作日内处理
              </Text>
              <Text style={tipsItemStyle}>• 退款将原路返回至您的支付账户</Text>
              <Text style={tipsItemStyle}>• 退款到账时间一般为3-7个工作日</Text>
              <Text style={tipsItemStyle}>
                • 如有疑问请联系客服：400-123-4567
              </Text>
            </View>
          </GlassCard>
        </Animated.View>

        <View style={submitBtnWrapStyle}>
          <GlassButton
            title={submitting ? '提交中...' : '提交申请'}
            onPress={submitRefund}
            disabled={!canSubmit() || submitting}
            loading={submitting}
            size="large"
            variant="primary"
            fullWidth
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
