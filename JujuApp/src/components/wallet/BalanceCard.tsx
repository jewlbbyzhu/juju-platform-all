import React, { useMemo } from 'react';
import { View, Text, ViewStyle, TextStyle } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { spacing, BorderRadius, typography } from '../../theme';
import type { WalletInfo } from './types';

interface BalanceCardProps {
  walletInfo: WalletInfo | null;
  colors: {
    text: { inverse: string };
    primary: { main: string };
  };
}

const BalanceCard = React.memo(({ walletInfo, colors }: BalanceCardProps) => {
  // 使用设计系统替代 StyleSheet.create
  const balanceCardStyle = useMemo(
    (): ViewStyle => ({
      alignItems: 'center',
      marginBottom: spacing.xl,
    }),
    [],
  );

  const balanceLabelStyle = useMemo(
    (): TextStyle => ({
      fontSize: typography.size.body2,
      marginBottom: spacing.sm,
      fontWeight: typography.weight.medium,
      color: colors.text.inverse + 'CC',
    }),
    [colors.text.inverse],
  );

  const balanceAmountStyle = useMemo(
    (): ViewStyle => ({
      flexDirection: 'row',
      alignItems: 'flex-start',
    }),
    [],
  );

  const currencyStyle = useMemo(
    (): TextStyle => ({
      fontSize: typography.size.h2,
      marginRight: spacing.xs,
      marginTop: spacing.sm,
      fontWeight: typography.weight.semibold,
      color: colors.text.inverse,
    }),
    [colors.text.inverse],
  );

  const amountStyle = useMemo(
    (): TextStyle => ({
      fontSize: typography.size.display,
      fontWeight: typography.weight.bold,
      letterSpacing: -0.5,
      color: colors.text.inverse,
    }),
    [colors.text.inverse],
  );

  const balanceInfoStyle = useMemo(
    (): ViewStyle => ({
      flexDirection: 'row',
      marginTop: spacing.lg,
      borderRadius: BorderRadius.md,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.xl,
      backgroundColor: colors.primary.main + '1A',
    }),
    [colors.primary.main],
  );

  const balanceInfoItemStyle = useMemo(
    (): ViewStyle => ({
      alignItems: 'center',
      minWidth: 80,
    }),
    [],
  );

  const balanceInfoValueStyle = useMemo(
    (): TextStyle => ({
      fontSize: typography.size.body2,
      fontWeight: typography.weight.semibold,
      color: colors.text.inverse,
    }),
    [colors.text.inverse],
  );

  const balanceInfoLabelStyle = useMemo(
    (): TextStyle => ({
      fontSize: typography.size.small,
      marginTop: spacing.xs,
      color: colors.text.inverse + '99',
    }),
    [colors.text.inverse],
  );

  const balanceInfoDividerStyle = useMemo(
    (): ViewStyle => ({
      width: 1,
      marginHorizontal: spacing.lg,
      backgroundColor: colors.text.inverse + '33',
    }),
    [colors.text.inverse],
  );

  return (
    <Animated.View
      entering={FadeInUp.duration(500).springify()}
      style={balanceCardStyle}
    >
      <Text style={balanceLabelStyle}>账户余额</Text>
      <View style={balanceAmountStyle}>
        <Text style={currencyStyle}>¥</Text>
        <Text style={amountStyle}>
          {walletInfo?.balance || '0.00'}
        </Text>
      </View>
      <View style={balanceInfoStyle}>
        <View style={balanceInfoItemStyle}>
          <Text style={balanceInfoValueStyle}>
            ¥{walletInfo?.frozen_balance || '0.00'}
          </Text>
          <Text style={balanceInfoLabelStyle}>冻结</Text>
        </View>
        <View style={balanceInfoDividerStyle} />
        <View style={balanceInfoItemStyle}>
          <Text style={balanceInfoValueStyle}>
            ¥{walletInfo?.available_balance || '0.00'}
          </Text>
          <Text style={balanceInfoLabelStyle}>可用</Text>
        </View>
      </View>
    </Animated.View>
  );
});

export default BalanceCard;

BalanceCard.displayName = 'BalanceCard';
