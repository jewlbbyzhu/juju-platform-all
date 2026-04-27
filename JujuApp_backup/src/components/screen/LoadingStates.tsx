import React from 'react';
import { View, StyleSheet, ViewStyle, DimensionValue } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '../../theme';
import { animation } from '../../theme';

export interface SkeletonProps {
  width?: number | DimensionValue;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({
  width = '100%',
  height = 20,
  borderRadius = 8,
  style,
}: SkeletonProps): React.JSX.Element {
  const { colors } = useTheme();
  const opacity = useSharedValue(0.3);

  React.useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.7, { duration: animation.loop.shimmer.duration / 2 }),
        withTiming(0.3, { duration: animation.loop.shimmer.duration / 2 }),
      ),
      -1,
      true,
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          backgroundColor: colors.gray[200],
        },
        animatedStyle,
        style,
      ]}
    />
  );
}

export interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
}

export function LoadingSpinner({
  size = 'large',
  color,
}: LoadingSpinnerProps): React.JSX.Element {
  const { colors } = useTheme();
  const spinnerColor = color || colors.primary.main;

  return (
    <View style={styles.spinnerContainer}>
      <Animated.View
        style={[
          styles.spinner,
          {
            width: size === 'small' ? 20 : 40,
            height: size === 'small' ? 20 : 40,
            borderRadius: size === 'small' ? 10 : 20,
            borderColor: spinnerColor,
            borderTopColor: 'transparent',
          },
        ]}
      />
    </View>
  );
}

export interface ScreenLoadingStateProps {
  message?: string;
}

export function ScreenLoadingState({
  message,
}: ScreenLoadingStateProps): React.JSX.Element {
  const { colors } = useTheme();

  return (
    <View style={styles.loadingContainer}>
      <LoadingSpinner color={colors.primary.main} />
      {message && (
        <Animated.Text
          style={[styles.loadingText, { color: colors.text.secondary }]}
        >
          {message}
        </Animated.Text>
      )}
    </View>
  );
}

export interface ScreenErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ScreenErrorState({
  message = '加载失败',
  onRetry,
}: ScreenErrorStateProps): React.JSX.Element {
  const { colors } = useTheme();

  return (
    <View style={styles.errorContainer}>
      <Animated.Text
        style={[styles.errorText, { color: colors.text.secondary }]}
      >
        {message}
      </Animated.Text>
      {onRetry && (
        <Animated.Text
          onPress={onRetry}
          style={[styles.retryButton, { color: colors.primary.main }]}
        >
          点击重试
        </Animated.Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    overflow: 'hidden',
  },
  spinnerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinner: {
    borderWidth: 3,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 14,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  errorText: {
    fontSize: 16,
  },
  retryButton: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default Skeleton;
