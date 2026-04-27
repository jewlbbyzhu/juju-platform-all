import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  withRepeat,
  Easing,
} from 'react-native-reanimated';
import { colors, animation, spacing, BorderRadius, layout } from '../../theme';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - layout.screenPadding * 2 - spacing.md) / 2;

interface FeedSkeletonCardProps {
  index: number;
}

const FeedSkeletonCard: React.FC<FeedSkeletonCardProps> = ({ index }) => {
  const shimmerPosition = useSharedValue(-1);
  const opacity = useSharedValue(0.5);

  useEffect(() => {
    shimmerPosition.value = withDelay(
      index * 150,
      withRepeat(
        withTiming(1, { duration: 1200, easing: Easing.linear }),
        -1,
        true,
      ),
    );
    opacity.value = withDelay(
      index * 150,
      withTiming(0.7, { duration: animation.duration.normal }),
    );
  }, [index, shimmerPosition, opacity]);

  const shimmerStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      shimmerPosition.value,
      [0, 1],
      [-CARD_WIDTH, CARD_WIDTH],
    );
    return {
      transform: [{ translateX }],
      opacity: opacity.value,
    };
  });

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.cardWrapper,
        index % 2 === 0 ? styles.cardLeft : styles.cardRight,
        containerStyle,
      ]}
    >
      <View style={styles.card}>
        <View style={styles.imageSkeleton}>
          <Animated.View style={[styles.shimmer, shimmerStyle]} />
        </View>
        <View style={styles.content}>
          <View style={styles.titleSkeleton} />
          <View style={styles.locationSkeleton} />
          <View style={styles.timeSkeleton} />
          <View style={styles.footerSkeleton}>
            <View style={styles.avatarSkeleton} />
            <View style={styles.avatarSkeleton} />
            <View style={styles.avatarSkeleton} />
          </View>
        </View>
      </View>
    </Animated.View>
  );
};

interface FeedSkeletonProps {
  count?: number;
}

export const FeedSkeleton: React.FC<FeedSkeletonProps> = ({ count = 4 }) => {
  return (
    <View style={styles.container}>
      {Array.from({ length: count }).map((_, index) => (
        <FeedSkeletonCard key={index} index={index} />
      ))}
    </View>
  );
};

const interpolate = (value: number, input: number[], output: number[]) => {
  'worklet';
  const clamped = Math.max(input[0], Math.min(input[1], value));
  const ratio = (clamped - input[0]) / (input[1] - input[0]);
  return output[0] + ratio * (output[1] - output[0]);
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: spacing.xs,
  },
  cardWrapper: {
    width: '50%',
    padding: spacing.xs,
  },
  cardLeft: {},
  cardRight: {},
  card: {
    backgroundColor: colors.gray[800],
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
  imageSkeleton: {
    height: CARD_WIDTH * 1.2,
    backgroundColor: colors.gray[700],
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: CARD_WIDTH * 0.4,
    height: '100%',
    backgroundColor: colors.primary.light,
    opacity: 0.2,
  },
  content: {
    padding: spacing.sm + 4,
  },
  titleSkeleton: {
    height: 20,
    backgroundColor: colors.gray[700],
    borderRadius: BorderRadius.sm,
    marginBottom: spacing.sm,
    width: '80%',
  },
  locationSkeleton: {
    height: 14,
    backgroundColor: colors.gray[700],
    borderRadius: BorderRadius.sm,
    marginBottom: spacing.xs,
    width: '60%',
  },
  timeSkeleton: {
    height: 12,
    backgroundColor: colors.gray[700],
    borderRadius: BorderRadius.sm,
    marginBottom: spacing.sm,
    width: '40%',
  },
  footerSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarSkeleton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.gray[700],
    marginRight: -8,
  },
});

export default FeedSkeleton;
