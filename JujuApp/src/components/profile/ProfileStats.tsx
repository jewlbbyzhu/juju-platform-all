import React, { useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { GlassCard } from '../../components';
import { useTheme } from '../../theme';
import { colors, spacing, animation } from '../../theme';
import { BorderRadius } from '../../theme/shadows';

export interface UserStats {
  partyCount: number;
  orderCount: number;
  followingCount: number;
  followerCount: number;
}

interface ProfileStatsProps {
  stats: UserStats;
  index?: number;
}

interface StatItemData {
  key: keyof UserStats;
  label: string;
  color: string;
}

const STAT_ITEMS: StatItemData[] = [
  { key: 'partyCount', label: '参与活动', color: colors.primary.main },
  { key: 'orderCount', label: '订单', color: colors.secondary.main },
  { key: 'followingCount', label: '关注', color: colors.accent.cyan },
  { key: 'followerCount', label: '粉丝', color: colors.accent.gold },
];

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface StatItemProps {
  stat: StatItemData;
  value: number;
  index: number;
  isLast: boolean;
}

const StatItem: React.FC<StatItemProps> = ({ stat, value, index: _idx, isLast: _isLast }) => {
  const scale = useSharedValue(1);
  const { colors: themeColors, typography: themeTypography, spacing: themeSpacing } = useTheme();

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.95, animation.spring.gentle);
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, animation.spring.gentle);
  }, [scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  } as any));

  const statItemStyle: any = { alignItems: 'center', flex: 1, paddingVertical: themeSpacing.xs };
  const statNumberStyle: any = { fontSize: themeTypography.size.h2, fontWeight: themeTypography.weight.bold, color: themeColors.text.inverse };
  const statLabelStyle: any = { fontSize: themeTypography.size.caption, color: themeColors.text.inverse + 'B3', marginTop: themeSpacing.xs };
  const statIndicatorStyle: any = { position: 'absolute', bottom: -themeSpacing.xs, width: 24, height: 3, borderRadius: 1.5, opacity: 0.6 };

  return (
    <AnimatedTouchable
      style={[statItemStyle, animatedStyle]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
    >
      <Text style={statNumberStyle}>{value}</Text>
      <Text style={statLabelStyle}>{stat.label}</Text>
      <View style={[statIndicatorStyle, { backgroundColor: stat.color }]} />
    </AnimatedTouchable>
  );
};

export const ProfileStats: React.FC<ProfileStatsProps> = React.memo(
  ({ stats }) => {
    const {
      colors: themeColors,
      typography,
      spacing: themeSpacing,
      layout,
    } = useTheme();

    const styles = useMemo(
      () => createStyles(themeColors, typography, themeSpacing, layout),
      [themeColors, typography, themeSpacing, layout],
    );

    return (
      <Animated.View
        entering={FadeInUp.duration(animation.duration.normal).delay(
          spacing.sm,
        )}
        style={styles.statsContainer}
      >
        <GlassCard intensity="light" style={styles.statsCard}>
          <View style={styles.statsRow}>
            {STAT_ITEMS.map((stat, idx) => (
              <StatItem
                key={stat.key}
                stat={stat}
                value={stats[stat.key]}
                index={idx}
                isLast={idx === STAT_ITEMS.length - 1}
              />
            ))}
          </View>
        </GlassCard>
      </Animated.View>
    );
  },
);

ProfileStats.displayName = 'ProfileStats';

const createStyles = (
  colors: ReturnType<typeof useTheme>['colors'],
  typography: ReturnType<typeof useTheme>['typography'],
  spacing: ReturnType<typeof useTheme>['spacing'],
  layout: ReturnType<typeof useTheme>['layout'],
) =>
  StyleSheet.create({
    statsContainer: {
      marginHorizontal: layout.screenPadding,
      marginTop: -spacing.md,
      marginBottom: spacing.lg,
    },
    statsCard: {
      margin: 0,
      borderRadius: BorderRadius.lg,
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingVertical: spacing.sm,
    },
    statItem: {
      alignItems: 'center',
      flex: 1,
      paddingVertical: spacing.xs,
    },
    statNumber: {
      fontSize: typography.size.h2,
      fontWeight: typography.weight.bold,
      color: colors.text.inverse,
    },
    statLabel: {
      fontSize: typography.size.caption,
      color: colors.text.inverse + 'B3',
      marginTop: spacing.xs,
    },
    statIndicator: {
      position: 'absolute',
      bottom: -spacing.xs,
      width: 24,
      height: 3,
      borderRadius: 1.5,
      opacity: 0.6,
    },
  });

export default ProfileStats;
