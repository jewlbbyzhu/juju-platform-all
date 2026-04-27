import React, { useEffect, useRef } from 'react';
import { View, Animated, ViewStyle } from 'react-native';
import AnimatedRN, { FadeInDown } from 'react-native-reanimated';
import { useTheme, spacing, BorderRadius } from '../../theme';

interface ScanHistorySkeletonItemProps {
  index: number;
}

const ScanHistorySkeletonItem: React.FC<ScanHistorySkeletonItemProps> = ({
  index,
}) => {
  const { colors } = useTheme();
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 750,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [shimmerAnim]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.3, 0.7, 0.3],
  });

  // 使用设计系统替代 StyleSheet
  const itemStyle: ViewStyle = {
    marginVertical: spacing.xs,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: spacing.md,
    backgroundColor: colors.background.card,
    borderColor: colors.border,
  };

  const headerStyle: ViewStyle = {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

  const typeBadgeStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.tertiary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: BorderRadius.full,
    opacity,
  };

  const iconSkeletonStyle: ViewStyle = {
    width: 16,
    height: 16,
    borderRadius: BorderRadius.full,
    backgroundColor: colors.gray[300],
    marginRight: spacing.xs,
    opacity,
  };

  const labelSkeletonStyle: ViewStyle = {
    width: 40,
    height: 14,
    borderRadius: BorderRadius.xs,
    backgroundColor: colors.gray[300],
    opacity,
  };

  const timeSkeletonStyle: ViewStyle = {
    width: 50,
    height: 12,
    borderRadius: BorderRadius.xs,
    backgroundColor: colors.gray[300],
    opacity,
  };

  const contentSkeletonStyle: ViewStyle = {
    borderRadius: BorderRadius.xs,
    backgroundColor: colors.gray[200],
    opacity,
  };

  return (
    <AnimatedRN.View
      entering={FadeInDown.delay(index * 100).springify()}
      style={itemStyle}
    >
      <View style={headerStyle}>
        <View style={typeBadgeStyle}>
          <Animated.View style={iconSkeletonStyle} />
          <Animated.View style={labelSkeletonStyle} />
        </View>
        <Animated.View style={timeSkeletonStyle} />
      </View>
      <Animated.View
        style={[contentSkeletonStyle, { width: '80%', height: 20, marginTop: spacing.sm }]}
      />
      <Animated.View
        style={[contentSkeletonStyle, { width: '50%', height: 20, marginTop: spacing.xs }]}
      />
    </AnimatedRN.View>
  );
};

interface ScanHistorySkeletonProps {
  count?: number;
}

export const ScanHistorySkeleton: React.FC<ScanHistorySkeletonProps> = ({
  count = 4,
}) => {

  const containerStyle: ViewStyle = {
    padding: spacing.md,
    paddingBottom: spacing['3xl'],
    flex: 1,
  };

  return (
    <View style={containerStyle}>
      {Array.from({ length: count }).map((_, index) => (
        <ScanHistorySkeletonItem key={index} index={index} />
      ))}
    </View>
  );
};

export default ScanHistorySkeleton;
