import React, { useState, useCallback } from 'react';
import {

  FlatList,
  RefreshControl,
  ListRenderItem,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { scanApi } from '../api/scan';
import {
  useTheme,
  spacing,
  gradients,
  animation,





} from '../theme';
import {
  ScanHistoryHeader,
  ScanHistoryItem,
  ScanHistoryEmpty,
  ScanHistorySkeleton,
} from '../components/scanHistory';
import type {
  ScanRecord,
  TypeConfigMap,
  StatusConfigMap,
} from '../components/scanHistory';

export default function ScanHistoryScreen(): React.JSX.Element {
  const { colors } = useTheme();

  const [records, setRecords] = useState<ScanRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const TYPE_CONFIG: TypeConfigMap = {
    ticket: {
      icon: '🎫',
      label: '票券',
      color: colors.primary.main,
      bgColor: colors.primary.main + '20',
    },
    invite: {
      icon: '🔗',
      label: '邀请码',
      color: colors.secondary.main,
      bgColor: colors.secondary.main + '20',
    },
    payment: {
      icon: '💳',
      label: '支付',
      color: colors.status.success,
      bgColor: colors.status.success + '20',
    },
    qrcode: {
      icon: '📱',
      label: '扫码',
      color: colors.accent.cyan,
      bgColor: colors.accent.cyan + '20',
    },
    default: {
      icon: '📱',
      label: '扫码',
      color: colors.accent.cyan,
      bgColor: colors.accent.cyan + '20',
    },
  };

  const STATUS_CONFIG: StatusConfigMap = {
    success: { icon: '✓', color: colors.status.success },
    failed: { icon: '✗', color: colors.status.error },
    pending: { icon: '⏳', color: colors.status.warning },
  };

  const fetchHistory = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const response = await scanApi.getScanHistory();
      const data = response as unknown as { data?: { list: ScanRecord[] } };
      if (data?.data?.list) {
        setRecords(data.data.list);
      }
    } catch (error) {
      console.error('Fetch scan history error:', error);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchHistory();
    }, [fetchHistory]),
  );

  const handleClear = useCallback(async (): Promise<void> => {
    try {
      await scanApi.clearScanHistory();
      setRecords([]);
    } catch (error) {
      console.error('Clear history error:', error);
    }
  }, []);

  const handleItemPress = useCallback((_item: ScanRecord): void => {
    // TODO: Navigate to detail or handle item tap
  }, []);

  const renderItem: ListRenderItem<ScanRecord> = useCallback(
    ({ item, index }) => (
      <ScanHistoryItem
        item={item}
        typeConfig={TYPE_CONFIG}
        statusConfig={STATUS_CONFIG}
        index={index}
        onPress={handleItemPress}
      />
    ),
    [TYPE_CONFIG, STATUS_CONFIG, handleItemPress],
  );

  const keyExtractor = useCallback(
    (item: ScanRecord): string => String(item.id),
    [],
  );

  // 使用设计系统替代内联样式
  const safeAreaStyle: ViewStyle = {
    flex: 1,
    backgroundColor: colors.background.primary,
  };

  const gradientStyle: ViewStyle = {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  };

  const listContentStyle: ViewStyle = {
    padding: spacing.md,
    paddingBottom: spacing['3xl'],
    flexGrow: 1,
  };

  if (initialLoading) {
    return (
      <SafeAreaView style={safeAreaStyle} edges={['top']}>
        <LinearGradient
          colors={gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={gradientStyle}
        />
        <ScanHistoryHeader title="扫码历史" />
        <ScanHistorySkeleton count={4} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={safeAreaStyle} edges={['top']}>
      <LinearGradient
        colors={gradients.primary}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={gradientStyle}
      />

      <ScanHistoryHeader
        title="扫码历史"
        onClear={handleClear}
        showClear={records.length > 0}
      />

      <Animated.View
        entering={FadeInUp.duration(animation.duration.normal).delay(100)}
        style={{ flex: 1 }}
      >
        <FlatList
          data={records}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={fetchHistory}
              colors={[colors.primary.main]}
              tintColor={colors.primary.main}
            />
          }
          contentContainerStyle={listContentStyle}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={ScanHistoryEmpty}
        />
      </Animated.View>
    </SafeAreaView>
  );
}
