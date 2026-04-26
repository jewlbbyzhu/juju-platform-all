import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, ViewStyle, Animated } from 'react-native';
import { colors } from '../theme/colors';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
  shimmer?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width: w = '100%',
  height = 20,
  borderRadius = 8,
  style,
  shimmer = true,
}) => {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (shimmer) {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(progress, {
            toValue: 1,
            duration: 750,
            useNativeDriver: true,
          }),
          Animated.timing(progress, {
            toValue: 0,
            duration: 750,
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();
      return () => {
        animation.stop();
      };
    }
  }, [shimmer, progress]);

  const opacity = progress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.3, 0.7, 0.3],
  });

  const widthStyle = typeof w === 'number' ? w : w;

  return (
    <Animated.View
      style={[
        styles.skeleton,
        { width: widthStyle, height, borderRadius } as ViewStyle,
        shimmer && { opacity },
        style,
      ]}
    />
  );
};

// 骨架屏卡片 - 用于列表项
export const SkeletonCard: React.FC = () => (
  <View style={styles.card}>
    <Skeleton width="100%" height={180} borderRadius={16} />
    <View style={styles.cardContent}>
      <Skeleton width="70%" height={20} />
      <Skeleton width="40%" height={14} style={{ marginTop: 8 }} />
      <View style={styles.cardFooter}>
        <Skeleton width="30%" height={18} />
        <Skeleton width="20%" height={14} />
      </View>
    </View>
  </View>
);

// 骨架屏列表
interface SkeletonListProps {
  count?: number;
}

export const SkeletonList: React.FC<SkeletonListProps> = ({ count = 3 }) => (
  <View style={styles.list}>
    {Array.from({ length: count }).map((_, index) => (
      <SkeletonCard key={index} />
    ))}
  </View>
);

// 骨架屏个人资料头部
export const SkeletonProfile: React.FC = () => (
  <View style={styles.profileContainer}>
    <View style={styles.profileHeader}>
      <Skeleton width={80} height={80} borderRadius={40} />
      <View style={styles.profileInfo}>
        <Skeleton width={120} height={24} />
        <Skeleton width={80} height={16} style={{ marginTop: 8 }} />
      </View>
    </View>
    <View style={styles.statsRow}>
      <Skeleton width="22%" height={50} borderRadius={12} />
      <Skeleton width="22%" height={50} borderRadius={12} />
      <Skeleton width="22%" height={50} borderRadius={12} />
      <Skeleton width="22%" height={50} borderRadius={12} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: colors.background.elevated,
  },
  card: {
    backgroundColor: colors.background.card,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardContent: {
    marginTop: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  list: {
    padding: 16,
  },
  profileContainer: {
    padding: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default Skeleton;
