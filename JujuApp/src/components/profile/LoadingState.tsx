import React, { useEffect } from 'react';
import { View, ScrollView, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import { SkeletonProfile } from '../../components';
import {colors, spacing} from '../../theme';

interface LoadingStateProps {
  gradientStyle: ViewStyle;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  gradientStyle,
}) => {
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(1, {
      duration: 600,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.contentContainer, animatedStyle]}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={[colors.primary.main, colors.primary.light]}
          style={gradientStyle}
        >
          <SkeletonProfile />
        </LinearGradient>
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </Animated.View>
  );
};

LoadingState.displayName = 'LoadingState';

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  bottomSpacer: {
    height: spacing['4xl'],
  },
});

export default LoadingState;
