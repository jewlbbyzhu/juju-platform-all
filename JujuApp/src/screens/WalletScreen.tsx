/**
 * 聚聚 (JUJU) App - 钱包页面
 * 2026 设计系统重构版
 */

import React, { useEffect, useState, useCallback } from 'react';
import { View, ScrollView, RefreshControl, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { walletApi } from '../api';
import type { NavigationProp } from '../types';
import {
  useTheme,
  spacing,
  gradients,
  animation,
  BorderRadius,
  Shadows,


} from '../theme';
import { GlassButton } from '../components';
import {
  BalanceCard,
  QuickActionGrid,
  TransactionList,
} from '../components/wallet';
import type { WalletInfo, Transaction } from '../components/wallet';
import { ScreenLoadingState } from '../components/screen';

export default function WalletScreen(): React.JSX.Element {
  const navigation = useNavigation<NavigationProp>();
  const { colors } = useTheme();

  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);


  const loadWalletInfo = useCallback(async () => {
    try {
      const res = await walletApi.getWalletInfo();
      if (res.success) {
        setWalletInfo((res as unknown as { data: WalletInfo }).data);
        setWalletError(null);
      }
    } catch {
      setWalletError('加载钱包信息失败，请检查网络连接');
    }
  }, []);

  const loadTransactions = useCallback(async () => {
    try {
      const res = await walletApi.getTransactions({ page: 1, pageSize: 5 });
      if (res.success) {
        setTransactions(
          (res as unknown as { data: { list: Transaction[] } }).data?.list || [],
        );
      }
    } catch {
      // 静默失败 - 交易记录非关键数据
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      if (!isMounted) return;
      setLoading(true);
      await Promise.all([loadWalletInfo(), loadTransactions()]);
      if (isMounted) {
        setLoading(false);
      }
    };
    loadData();
    return () => { isMounted = false; };
  }, [loadWalletInfo, loadTransactions]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([loadWalletInfo(), loadTransactions()]);
    setRefreshing(false);
  }, [loadWalletInfo, loadTransactions]);

  // 使用设计系统替代硬编码样式
  const safeAreaStyle: ViewStyle = {
    flex: 1,
    backgroundColor: colors.background.secondary,
  };

  const containerStyle: ViewStyle = {
    flex: 1,
  };

  const headerStyle: ViewStyle = {
    paddingTop: spacing['3xl'],
    paddingBottom: spacing['3xl'],
    paddingHorizontal: spacing.lg,
    borderBottomLeftRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.xl,
  };

  const walletActionsStyle: ViewStyle = {
    flexDirection: 'row',
    gap: spacing.md,
    ...Shadows.medium,
  };

  const actionBtnBaseStyle: ViewStyle = {
    flex: 1,
  };

  const rechargeBtnStyle: ViewStyle = {
    ...actionBtnBaseStyle,
    backgroundColor: colors.text.inverse,
  };

  const withdrawBtnStyle: ViewStyle = {
    ...actionBtnBaseStyle,
    backgroundColor: colors.primary.main + '26',
    borderColor: colors.primary.main + '4D',
  };

  if (loading) {
    return (
      <SafeAreaView style={safeAreaStyle}>
        <ScreenLoadingState message="加载中..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={safeAreaStyle}>
      <ScrollView
        style={containerStyle}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Animated.View
          entering={FadeInUp.duration(animation.duration.normal).delay(100)}
        >
          <LinearGradient
            colors={gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={headerStyle}
          >
            <BalanceCard walletInfo={walletInfo} colors={colors} />

            <View style={walletActionsStyle}>
              <GlassButton
                title="充值"
                onPress={() => navigation.navigate('Recharge' as never)}
                variant="primary"
                size="large"
                style={rechargeBtnStyle}
              />
              <GlassButton
                title="提现"
                onPress={() => navigation.navigate('Withdraw' as never)}
                variant="secondary"
                size="large"
                style={withdrawBtnStyle}
              />
            </View>
          </LinearGradient>
        </Animated.View>

        <Animated.View
          entering={FadeInUp.duration(animation.duration.normal).delay(200)}
        >
          <QuickActionGrid colors={colors} navigation={navigation} />
        </Animated.View>

        <Animated.View
          entering={FadeInUp.duration(animation.duration.normal).delay(300)}
        >
          <TransactionList
            transactions={transactions}
            colors={colors}
            navigation={navigation}
          />
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
