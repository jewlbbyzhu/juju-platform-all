/**
 * 聚聚 (JUJU) App - 个人中心页面
 * 2026 设计系统重构版 - 动画增强 + 代码优化
 */

import React, { useState, useEffect, useCallback } from 'react';
import {

  StatusBar,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Animated, {FadeInUp} from 'react-native-reanimated';
import {
  useTheme,
  spacing,
  layout,
  animation,
} from '../theme';
import { EnteringAnimation } from '../theme';
import type { NavigationProp } from '../types';
import {
  ProfileContent,
  LoadingState,
  type UserProfile,
  DEFAULT_STATS,
  DEFAULT_PROFILE,
} from '../components/profile';
import { ScreenErrorState } from '../components/screen';
import { profileApi } from '../api/profile';

type ApiResponse<T> = {
  code: number;
  data: T;
  message?: string;
};

export default function ProfileScreen(): React.JSX.Element {
  const { colors } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError(null);
    try {
      const res = await profileApi.getUserProfile();
      const resObj = res as unknown as ApiResponse<UserProfile>;
      if (resObj.code === 0) {
        setProfile(resObj.data);
      } else {
        setError(resObj.message || '加载失败');
        setProfile(DEFAULT_PROFILE);
      }
    } catch {
      setError('网络错误，请重试');
      setProfile(DEFAULT_PROFILE);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadProfile(false);
    } finally {
      setRefreshing(false);
    }
  }, [loadProfile]);

  const handleNavigation = useCallback(
    (route: string) => {
      const routeMap: Record<string, string> = {
        MyOrders: 'MyOrders',
        MyTickets: 'MyTickets',
        MyParties: 'MyParties',
        Favorites: 'Favorites',
        Wallet: 'Wallet',
        VIPCenter: 'VIPCenter',
        Settings: 'Settings',
        Notifications: 'Notifications',
        Following: 'Following',
        Help: 'Help',
        Points: 'VIPPoints',
      };
      const targetRoute = routeMap[route] || route;
      navigation.navigate(targetRoute as never);
    },
    [navigation],
  );

  const handleRetry = useCallback(() => {
    loadProfile();
  }, [loadProfile]);

  // 使用设计系统替代 useMemo 样式
  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: colors.background.primary,
  };

  const contentStyle: ViewStyle = {
    flex: 1,
  };

  const gradientStyle: ViewStyle = {
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.xs,
    paddingBottom: spacing['2xl'],
  };

  return (
    <SafeAreaView style={containerStyle} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background.primary} />
      <Animated.View
        style={contentStyle}
        entering={EnteringAnimation.FadeIn()}
      >
        {loading && !profile ? (
          <LoadingState gradientStyle={gradientStyle} />
        ) : error && !profile ? (
          <ScreenErrorState message={error} onRetry={handleRetry} />
        ) : (
          <Animated.View
            entering={FadeInUp.duration(animation.duration.normal).delay(100)}
          >
            <ProfileContent
              profile={profile}
              stats={DEFAULT_STATS}
              refreshing={refreshing}
              onRefresh={onRefresh}
              onSettingsPress={() => handleNavigation('Settings')}
              onNotificationsPress={() => handleNavigation('Notifications')}
              onVIPPress={() => handleNavigation('VIPCenter')}
              onMenuItemPress={handleNavigation}
            />
          </Animated.View>
        )}
      </Animated.View>
    </SafeAreaView>
  );
}
