import React, { useEffect, useMemo, useCallback, memo } from 'react';
import { View, RefreshControl, ListRenderItem, ViewStyle, TextStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  FadeIn,

} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import { EmptyState } from './EmptyState';
import { AnimatedPartyCard } from './AnimatedPartyCard';
import {gradients, animation, spacing, layout, colors, typography, BorderRadius} from '../../theme';
import type { NavigationProp } from '../../types';
import type { Party as PartyType } from '../../types/api';

export const ListSeparator = () => <View style={styles.separator} />;

interface LoadingFooterProps {
  isLoading: boolean;
}

export const LoadingFooter: React.FC<LoadingFooterProps> = memo(
  ({ isLoading }) => {
    const rotation = useSharedValue(0);
    const scale = useSharedValue(1);
    const opacity = useSharedValue(0);

    useEffect(() => {
      opacity.value = withTiming(isLoading ? 1 : 0, {
        duration: animation.duration.fast,
      });
    }, [isLoading, opacity]);

    useEffect(() => {
      if (isLoading) {
        rotation.value = withTiming(360, { duration: 1000 });
        scale.value = withSpring(1.1, animation.spring.bouncy);
      }
    }, [isLoading, rotation, scale]);

    const spinnerStyle = useAnimatedStyle(() => ({
      transform: [{ rotate: `${rotation.value}deg` }, { scale: scale.value }] as any,
      opacity: opacity.value,
    }));

    if (!isLoading) return null;

    // 使用设计系统替代 StyleSheet.create
    const loadingFooterStyle: ViewStyle = {
      paddingVertical: spacing.xl,
      alignItems: 'center',
      justifyContent: 'center',
    };

    const loadingSpinnerStyle: ViewStyle = {
      width: 28,
      height: 28,
      borderRadius: BorderRadius.full,
      overflow: 'hidden',
    };

    const spinnerGradientStyle: ViewStyle = {
      width: '100%',
      height: '100%',
      borderRadius: BorderRadius.full,
    };

    return (
      <Animated.View style={[loadingFooterStyle, spinnerStyle]}>
        <View style={loadingSpinnerStyle}>
          <LinearGradient
            colors={gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={spinnerGradientStyle}
          />
        </View>
      </Animated.View>
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
    const translateY = useSharedValue(-100);
    const opacity = useSharedValue(0);
    const scale = useSharedValue(0.8);

    useEffect(() => {
      if (error) {
        translateY.value = withSpring(0, animation.spring.bouncy);
        opacity.value = withTiming(1, { duration: animation.duration.fast });
        scale.value = withSpring(1, animation.spring.bouncy);
      } else {
        translateY.value = withSpring(-100, animation.spring.stiff);
        opacity.value = withTiming(0, { duration: animation.duration.fast });
        scale.value = withTiming(0.8, { duration: animation.duration.fast });
      }
    }, [error, translateY, opacity, scale]);

    const bannerStyle = useAnimatedStyle(() => ({
      transform: [{ translateY: translateY.value }, { scale: scale.value }] as any,
      opacity: opacity.value,
    }));

    // 使用设计系统替代 StyleSheet.create
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

    const errorIconStyle: ViewStyle = {
      width: 20,
      height: 20,
      borderRadius: BorderRadius.full,
      overflow: 'hidden',
    };

    const errorIconGradientStyle: ViewStyle = {
      width: '100%',
      height: '100%',
      borderRadius: BorderRadius.full,
    };

    const errorTextStyle: TextStyle = {
      flex: 1,
      color: colors.text.inverse,
      fontSize: typography.size.body2,
      fontWeight: typography.weight.medium,
    };

    const retryButtonStyle: ViewStyle = {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      backgroundColor: colors.text.inverse + '33',
      borderRadius: BorderRadius.xs,
    };

    const retryTextStyle: TextStyle = {
      color: colors.text.inverse,
      fontSize: typography.size.caption,
      fontWeight: typography.weight.semibold,
    };

    return (
      <Animated.View style={[errorBannerStyle, bannerStyle]}>
        <View style={errorContentStyle}>
          <View style={errorIconStyle}>
            <LinearGradient
              colors={gradients.warm}
              style={errorIconGradientStyle}
            />
          </View>
          <Animated.Text style={errorTextStyle}>{error}</Animated.Text>
          <View style={retryButtonStyle}>
            <Animated.Text style={retryTextStyle} onPress={onRetry}>
              重试
            </Animated.Text>
          </View>
        </View>
      </Animated.View>
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
    const listOpacity = useSharedValue(1);
    const listScale = useSharedValue(1);
    const listTranslateY = useSharedValue(0);

    useEffect(() => {
      listOpacity.value = withTiming(isPending ? 0.7 : 1, {
        duration: animation.duration.fast,
      });
      listScale.value = withSpring(
        isPending ? 0.98 : 1,
        animation.spring.gentle,
      );
      listTranslateY.value = withSpring(
        isPending ? 10 : 0,
        animation.spring.gentle,
      );
    }, [isPending, listOpacity, listScale, listTranslateY]);

    const listContainerStyle = useAnimatedStyle(() => ({
      opacity: listOpacity.value,
      transform: [
        { scale: listScale.value },
        { translateY: listTranslateY.value },
      ] as any,
    }));

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
        <Animated.View
          entering={FadeIn.duration(animation.duration.dramatic)
            .springify()
            .damping(12)}
          exiting={FadeIn.duration(animation.duration.fast)}
          style={styles.emptyContainer}
        >
          <EmptyState />
        </Animated.View>
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
        <Animated.FlatList
          data={parties}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          numColumns={2}
          contentContainerStyle={[styles.listContainer, listContainerStyle]}
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

// 保留简单的静态样式（无需重构为设计系统）
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
