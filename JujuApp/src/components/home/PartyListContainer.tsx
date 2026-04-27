/**
 * 禁用动画版本 - PartyListContainer
 * 解决 Worklets 循环引用崩溃问题
 */
import React, { useMemo, useCallback, memo } from 'react';
import { View, FlatList, RefreshControl, ListRenderItem, ViewStyle, ActivityIndicator } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { EmptyState } from './EmptyState';
import { AnimatedPartyCard } from './AnimatedPartyCard';
import {gradients, spacing, layout, colors, typography, BorderRadius} from '../../theme';
import type { NavigationProp } from '../../types';
import type { Party as PartyType } from '../../types/api';

export const ListSeparator = () => <View style={styles.separator} />;

interface LoadingFooterProps {
  isLoading: boolean;
}

export const LoadingFooter: React.FC<LoadingFooterProps> = memo(
  ({ isLoading }) => {
    if (!isLoading) return null;

    const loadingFooterStyle: ViewStyle = {
      paddingVertical: spacing.xl,
      alignItems: 'center',
      justifyContent: 'center',
    };

    return (
      <View style={[loadingFooterStyle]}>
        <ActivityIndicator size="small" color={colors.primary.main} />
      </View>
    );
  },
);
LoadingFooter.displayName = 'LoadingFooter';

interface ErrorBannerProps {
  error: string | null;
  onRetry: () => void;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = memo(
  ({ error, onRetry }) => {
    if (!error) return null;

    const errorBannerStyle: ViewStyle = {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100,
      paddingHorizontal: layout.screenPadding,
      paddingTop: spacing.md,
    };

    const errorContentStyle: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.status.error + 'E6',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: BorderRadius.md,
      gap: spacing.sm,
    };

    const errorTextStyle: ViewStyle = {
      flex: 1,
    };

    const retryButtonStyle: ViewStyle = {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      backgroundColor: colors.text.inverse + '33',
      borderRadius: BorderRadius.xs,
    };

    return (
      <View style={[errorBannerStyle]}>
        <View style={errorContentStyle}>
          <View style={errorTextStyle}>
            <View style={{ color: colors.text.inverse, fontSize: typography.size.body2 }} />
          </View>
          <View style={retryButtonStyle}>
            <View style={{ color: colors.text.inverse, fontSize: typography.size.caption }} onTouchEnd={onRetry}>
              <View><View style={{ color: colors.text.inverse }}>重试</View></View>
            </View>
          </View>
        </View>
      </View>
    );
  },
);
ErrorBanner.displayName = 'ErrorBanner';

interface PartyListContainerProps {
  parties: PartyType[];
  navigation: NavigationProp;
  refreshing: boolean;
  onRefresh: () => void;
  loadMore: () => void;
  isPending: boolean;
  scrollHandler: (event: any) => void;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

export const PartyListContainer: React.FC<PartyListContainerProps> = memo(
  ({
    parties,
    navigation,
    refreshing,
    onRefresh,
    loadMore,
    isPending,
    scrollHandler,
    loading,
    error,
    onRetry,
  }) => {
    const refreshControl = useMemo(
      () => (
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[colors.primary.main]}
          tintColor={colors.primary.light}
          progressViewOffset={100}
        />
      ),
      [refreshing, onRefresh],
    );

    const renderItem: ListRenderItem<PartyType> = useCallback(
      ({ item, index }) => (
        <AnimatedPartyCard item={item} index={index} navigation={navigation} />
      ),
      [navigation],
    );

    const keyExtractor = useCallback(
      (item: PartyType) => `party-${item.id}`,
      [],
    );

    const ListEmptyComponent = useMemo(
      () => (
        <View style={styles.emptyContainer}>
          <EmptyState />
        </View>
      ),
      [],
    );

    const ListFooterComponent = useMemo(
      () => <LoadingFooter isLoading={loading && parties.length > 0} />,
      [loading, parties.length],
    );

    return (
      <View style={styles.listWrapper}>
        <ErrorBanner error={error} onRetry={onRetry} />
        <FlatList
          data={parties}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          numColumns={2}
          contentContainerStyle={styles.listContainer}
          refreshControl={refreshControl}
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          ListEmptyComponent={ListEmptyComponent}
          ListFooterComponent={ListFooterComponent}
          showsVerticalScrollIndicator={false}
          initialNumToRender={8}
          maxToRenderPerBatch={6}
          windowSize={6}
          removeClippedSubviews={true}
          ItemSeparatorComponent={ListSeparator}
        />
      </View>
    );
  },
);
PartyListContainer.displayName = 'PartyListContainer';

// 保留简单的静态样式
const styles = {
  separator: {
    height: spacing.xs,
  } as ViewStyle,
  listWrapper: {
    flex: 1,
  } as ViewStyle,
  listContainer: {
    padding: layout.screenPadding,
    paddingTop: spacing.sm,
    flexGrow: 1,
  } as ViewStyle,
  emptyContainer: {
    paddingTop: spacing['3xl'],
    alignItems: 'center',
  } as ViewStyle,
};
