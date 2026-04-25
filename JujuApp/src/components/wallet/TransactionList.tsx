import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, ViewStyle, TextStyle } from 'react-native';
import Animated, {
  FadeInLeft,
  LinearTransition,
} from 'react-native-reanimated';
import { GlassCard } from '../GlassCard';
import { EmptyState } from '../EmptyState';
import { spacing, typography } from '../../theme';
import type { NavigationProp } from '../../types';
import type { Transaction } from './types';
import { default as TransactionItem } from './TransactionItem';

type WalletColors = {
  background: { tertiary: string };
  border: string;
  status: { success: string; error: string; warning: string };
  text: { primary: string; tertiary: string };
  primary: { main: string };
};

interface TransactionListProps {
  transactions: Transaction[];
  colors: WalletColors;
  navigation: NavigationProp;
}

const TransactionList = React.memo(
  ({ transactions, colors, navigation }: TransactionListProps) => {
    // 使用设计系统替代 StyleSheet.create
    const transactionsSectionStyle = useMemo(
      (): ViewStyle => ({
        padding: spacing.lg,
        paddingTop: spacing.sm,
        paddingBottom: spacing.xl,
      }),
      [],
    );

    const viewMoreStyle = useMemo(
      (): TextStyle => ({
        fontSize: typography.size.body2,
        fontWeight: typography.weight.medium,
        color: colors.primary.main,
      }),
      [colors.primary.main],
    );

    return (
      <View style={transactionsSectionStyle}>
        <GlassCard
          title="最近交易"
          headerRight={
            <TouchableOpacity
              onPress={() => (navigation as any).navigate('Transactions')}
            >
              <Text style={viewMoreStyle}>
                查看全部 ›
              </Text>
            </TouchableOpacity>
          }
          intensity="medium"
        >
          {transactions.length > 0 ? (
            <Animated.View layout={LinearTransition.duration(300)}>
              {transactions.map((t, index) => (
                <Animated.View
                  key={t.id}
                  entering={FadeInLeft.delay(index * 60).duration(400)}
                >
                  <TransactionItem
                    transaction={t}
                    colors={colors}
                    navigation={navigation}
                  />
                </Animated.View>
              ))}
            </Animated.View>
          ) : (
            <EmptyState
              icon="📋"
              title="暂无交易记录"
              description="您的交易记录将显示在这里"
            />
          )}
        </GlassCard>
      </View>
    );
  },
);

export default TransactionList;
