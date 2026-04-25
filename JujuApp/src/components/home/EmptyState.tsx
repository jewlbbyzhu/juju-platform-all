import React, { useEffect } from 'react';
import {Text, ViewStyle, TextStyle} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { useTheme, animation, spacing, typography } from '../../theme';

export const EmptyState: React.FC = React.memo(() => {
  const { colors } = useTheme();
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);
  const scale = useSharedValue(0.9);
  const iconScale = useSharedValue(1);

  useEffect(() => {
    opacity.value = withDelay(
      200,
      withTiming(1, { duration: animation.duration.slow }),
    );
    translateY.value = withDelay(
      200,
      withTiming(0, { duration: animation.duration.slow }),
    );
    scale.value = withDelay(
      200,
      withTiming(1, { duration: animation.duration.slow }),
    );
    iconScale.value = withRepeat(
      withTiming(1.1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [opacity, translateY, scale, iconScale]);

  const containerStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [
        { translateY: translateY.value },
        { scale: scale.value },
      ] as const,
    };
  });

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  // 使用设计系统替代 StyleSheet.create
  const emptyContainerStyle: ViewStyle = {
    alignItems: 'center',
    paddingVertical: spacing['3xl'],
  };

  const emptyIconStyle: TextStyle = {
    fontSize: 64,
    marginBottom: spacing.md,
  };

  const emptyTextStyle: TextStyle = {
    fontSize: typography.size.h3,
    fontWeight: typography.weight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  };

  const emptySubtextStyle: TextStyle = {
    fontSize: typography.size.body,
    color: colors.text.secondary,
  };

  return (
    <Animated.View style={[emptyContainerStyle, containerStyle]}>
      <Animated.Text style={[emptyIconStyle, iconStyle]}>🎉</Animated.Text>
      <Text style={emptyTextStyle}>暂无聚会活动</Text>
      <Text style={emptySubtextStyle}>去发起一个聚会吧！</Text>
    </Animated.View>
  );
});
