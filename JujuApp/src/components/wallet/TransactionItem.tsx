import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, ViewStyle, TextStyle } from 'react-native';
import { spacing, BorderRadius, typography } from '../../theme';
import type { NavigationProp } from '../../types';
import type { Transaction } from './types';
import { getTransactionIcon, getStatusText } from './constants';

type WalletColors = {
  background: { tertiary: string };
  border: string;
  status: { success: string; error: string; warning: string };
  text: { primary: string; tertiary: string };
  primary: { main: string };
};

interface TransactionItemProps {
  transaction: Transaction;
  colors: WalletColors;
  navigation: NavigationProp;
}

const TransactionItem = React.memo(
  ({ transaction: t, colors, navigation }: TransactionItemProps) => {
    const isPositive =
      t.type === 'income' || t.type === 'recharge' || t.type === 'refund';
    const statusColor =
      t.status === 1 ? colors.status.success : colors.status.warning;

    // 使用设计系统替代 StyleSheet.create
    const transactionItemStyle = useMemo(
      (): ViewStyle => ({
        flexDirection: 'row',
        borderRadius: BorderRadius.md,
        padding: spacing.md,
        marginBottom: spacing.sm,
        borderWidth: 1,
        backgroundColor: colors.background.tertiary,
        borderColor: colors.border + '40',
      }),
      [colors.background.tertiary, colors.border],
    );

    const transactionIconStyle = useMemo(
      (): ViewStyle => ({
        width: 40,
        height: 40,
        borderRadius: BorderRadius.full,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
        backgroundColor: isPositive
          ? colors.status.success + '20'
          : colors.status.error + '20',
      }),
      [isPositive, colors.status.success, colors.status.error],
    );

    const transactionIconTextStyle = useMemo(
      (): TextStyle => ({
        fontSize: typography.size.h3,
      }),
      [],
    );

    const transactionContentStyle = useMemo(
      (): ViewStyle => ({
        flex: 1,
      }),
      [],
    );

    const transactionMainStyle = useMemo(
      (): ViewStyle => ({
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.xs,
        alignItems: 'center',
      }),
      [],
    );

    const transactionTitleStyle = useMemo(
      (): TextStyle => ({
        fontSize: typography.size.body2,
        fontWeight: typography.weight.medium,
        flex: 1,
        marginRight: spacing.sm,
        color: colors.text.primary,
      }),
      [colors.text.primary],
    );

    const transactionAmountStyle = useMemo(
      (): TextStyle => ({
        fontSize: typography.size.h4,
        fontWeight: typography.weight.bold,
        color: isPositive ? colors.status.success : colors.text.primary,
      }),
      [isPositive, colors.status.success, colors.text.primary],
    );

    const transactionMetaStyle = useMemo(
      (): ViewStyle => ({
        flexDirection: 'row',
        justifyContent: 'space-between',
      }),
      [],
    );

    const transactionTimeStyle = useMemo(
      (): TextStyle => ({
        fontSize: typography.size.caption,
        color: colors.text.tertiary,
      }),
      [colors.text.tertiary],
    );

    const transactionStatusStyle = useMemo(
      (): TextStyle => ({
        fontSize: typography.size.caption,
        fontWeight: typography.weight.medium,
        color: statusColor,
      }),
      [statusColor],
    );

    return (
      <TouchableOpacity
        style={transactionItemStyle}
        onPress={() =>
          (navigation as any).navigate('TransactionDetail', { id: t.id })
        }
        activeOpacity={0.8}
      >
        <View style={transactionIconStyle}>
          <Text style={transactionIconTextStyle}>
            {getTransactionIcon(t.type)}
          </Text>
        </View>
        <View style={transactionContentStyle}>
          <View style={transactionMainStyle}>
            <Text style={transactionTitleStyle} numberOfLines={1}>
              {t.description}
            </Text>
            <Text style={transactionAmountStyle}>
              {isPositive ? '+' : '-'}¥{t.amount}
            </Text>
          </View>
          <View style={transactionMetaStyle}>
            <Text style={transactionTimeStyle}>
              {t.created_at}
            </Text>
            <Text style={transactionStatusStyle}>
              {getStatusText(t.status)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  },
);

export default TransactionItem;

TransactionItem.displayName = 'TransactionItem';
