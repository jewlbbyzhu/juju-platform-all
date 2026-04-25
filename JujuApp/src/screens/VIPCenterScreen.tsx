/**
 * 聚聚 (JUJU) App - VIP会员中心页面
 * 2026 设计系统重构版
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  Alert,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useTheme, spacing, typography, animation } from '../theme';
import { EmptyState } from '../components';
import { vipApi } from '../api/vip';
import {
  VIPHeader,
  VIPQuickLinks,
  VIPPackageCard,
  VIPBenefitsList,
} from '../components/vipCenter';
import type { VipPackage } from '../components/vipCenter';

interface VipStatus {
  isVip: boolean;
  level: number;
  expireAt: string | null;
  benefits: string[];
}

interface ApiResponse {
  success?: boolean;
  code?: number;
  message?: string;
  data?: {
    isVip?: boolean;
    is_vip?: boolean;
    level?: number;
    vip_level?: number;
    expireAt?: string;
    expire_at?: string;
    benefits?: string[];
    list?: VipPackage[];
    packages?: VipPackage[];
  };
}

export default function VIPCenterScreen(): React.JSX.Element {
  const { colors } = useTheme();
  const [vipStatus, setVipStatus] = useState<VipStatus>({
    isVip: false,
    level: 0,
    expireAt: null,
    benefits: [],
  });
  const [packages, setPackages] = useState<VipPackage[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadVipStatus = useCallback(async () => {
    try {
      const res = (await vipApi.getSubscriptionStatus()) as ApiResponse;
      if (res.success) {
        const data = res.data || {};
        setVipStatus({
          isVip: data.isVip || data.is_vip || false,
          level: data.level || data.vip_level || 0,
          expireAt: data.expireAt || data.expire_at || null,
          benefits: data.benefits || [],
        });
      }
    } catch (error) {
      console.error('加载VIP状态失败:', error);
    }
  }, []);

  const loadVipPackages = useCallback(async () => {
    try {
      const res = (await vipApi.getVipPackages()) as ApiResponse;
      if (res.success) {
        const data = res.data || {};
        setPackages(data.list || data.packages || []);
      }
    } catch (error) {
      console.error('加载VIP套餐失败:', error);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([loadVipStatus(), loadVipPackages()]);
    setRefreshing(false);
  }, [loadVipStatus, loadVipPackages]);

  const handleSelectPackage = useCallback((packageId: string) => {
    setSelectedPackage(packageId);
  }, []);

  const handleSubscribe = useCallback(
    async (packageId: string) => {
      Alert.alert('确认订阅', '确定要订阅此VIP套餐吗？', [
        { text: '取消', style: 'cancel' },
        {
          text: '确定',
          onPress: async () => {
            try {
              const res = (await vipApi.subscribe(
                packageId,
                {},
              )) as ApiResponse;
              if (res.success) {
                Alert.alert('成功', '订阅成功！');
                loadVipStatus();
              } else {
                Alert.alert('错误', res.message || '订阅失败');
              }
            } catch {
              Alert.alert('错误', '订阅失败，请重试');
            }
          },
        },
      ]);
    },
    [loadVipStatus],
  );

  useEffect(() => {
    loadVipStatus();
    loadVipPackages();
  }, [loadVipStatus, loadVipPackages]);
  const safeAreaStyle = useMemo(
    (): ViewStyle => ({
      flex: 1,
      backgroundColor: colors.background.secondary,
    }),
    [colors.background.secondary],
  );

  const containerStyle = useMemo(
    (): ViewStyle => ({
      flex: 1,
    }),
    [],
  );

  const sectionStyle = useMemo(
    (): ViewStyle => ({
      padding: spacing.md,
    }),
    [],
  );

  const sectionTitleStyle = useMemo(
    (): TextStyle => ({
      fontSize: typography.size.h2,
      fontWeight: typography.weight.bold,
      color: colors.text.primary,
      marginBottom: spacing.md,
    }),
    [colors.text.primary],
  );

  const emptyStateStyle = useMemo(
    (): ViewStyle => ({
      alignItems: 'center',
      padding: spacing['3xl'],
    }),
    [],
  );

  const footerStyle = useMemo(
    (): ViewStyle => ({
      padding: spacing.md,
      alignItems: 'center',
      paddingBottom: spacing['3xl'],
    }),
    [],
  );

  const footerTextStyle = useMemo(
    (): TextStyle => ({
      fontSize: typography.size.caption,
      color: colors.text.tertiary,
    }),
    [colors.text.tertiary],
  );

  return (
    <SafeAreaView style={safeAreaStyle}>
      <ScrollView
        style={containerStyle}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <VIPHeader vipStatus={vipStatus} />
        <VIPQuickLinks />

        <Animated.View
          entering={FadeInUp.delay(300).duration(animation.duration.normal)}
        >
          <View style={sectionStyle}>
            <Text style={sectionTitleStyle}>选择套餐</Text>
            {packages.length > 0 ? (
              packages.map((pkg, index) => (
                <VIPPackageCard
                  key={pkg.id}
                  pkg={pkg}
                  selectedPackage={selectedPackage}
                  onSelect={handleSelectPackage}
                  onSubscribe={handleSubscribe}
                  index={index}
                />
              ))
            ) : (
              <View style={emptyStateStyle}>
                <EmptyState
                  icon="📦"
                  title="暂无套餐"
                  description="暂时没有可用的VIP套餐"
                />
              </View>
            )}
          </View>
        </Animated.View>

        <VIPBenefitsList />

        <View style={footerStyle}>
          <Text style={footerTextStyle}>开通即表示同意《VIP服务协议》</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
