import React, { useEffect } from 'react';
import { View, Text, StyleSheet, RefreshControl } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { colors, spacing, animation } from '../../theme';

interface RefreshIndicatorProps {
  refreshing: boolean;
  onRefresh: () => void;
}

export interface RefreshAnimationOverlay {
  isRefreshing: boolean;
}

interface PulsingDotProps {
  isActive: boolean;
}

const PulsingDot: React.FC<PulsingDotProps> = ({ isActive }) => {
  const scale = useSharedValue(0.5);
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    if (isActive) {
      scale.value = withRepeat(
        withSequence(
          withTiming(1, {
            duration: animation.duration.slow,
            easing: Easing.bezier(0.4, 0, 0.2, 1),
          }),
          withTiming(0.5, {
            duration: animation.duration.slow,
            easing: Easing.bezier(0.4, 0, 0.2, 1),
          }),
        ),
        -1,
        false,
      );
      opacity.value = withRepeat(
        withSequence(
          withTiming(1, {
            duration: animation.duration.slow,
            easing: Easing.bezier(0.4, 0, 0.2, 1),
          }),
          withTiming(0.3, {
            duration: animation.duration.slow,
            easing: Easing.bezier(0.4, 0, 0.2, 1),
          }),
        ),
        -1,
        false,
      );
    } else {
      scale.value = withTiming(0.5, { duration: animation.duration.fast });
      opacity.value = withTiming(0.3, { duration: animation.duration.fast });
    }
  }, [isActive, scale, opacity]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  return (
    <Animated.View
      style={[
        styles.dot,
        { backgroundColor: colors.primary.main },
        animatedStyle,
      ]}
    />
  );
};

export const RefreshIndicator: React.FC<RefreshIndicatorProps> = ({
  refreshing,
  onRefresh,
}) => {
  return (
    <View style={styles.container}>
      <RefreshControl
        refreshing={refreshing}
        onRefresh={onRefresh}
        tintColor={colors.primary.main}
        colors={[colors.primary.main]}
      />
      <View style={styles.indicatorRow}>
        <PulsingDot isActive={refreshing} />
        <PulsingDot isActive={refreshing} />
        <PulsingDot isActive={refreshing} />
      </View>
      <Text style={styles.text}>
        {refreshing ? '刷新中...' : '下拉刷新'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  indicatorRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  spinner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderTopColor: 'transparent',
  },
  text: {
    marginTop: spacing.xs,
    fontSize: 12,
    color: colors.text.tertiary,
  },
});

export default RefreshIndicator;
