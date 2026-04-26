import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,

} from 'react-native-reanimated';
import { colors, spacing } from '../../theme';
import { BorderRadius, typography } from '../../theme';
import { vipColors } from '../../theme/colors';

export interface VIPLevelInfo {
  level: number;
  name: string;
  color: string;
}

export const VIP_LEVELS: VIPLevelInfo[] = [
  { level: 0, name: '普通用户', color: '' },
  { level: 1, name: '青铜会员', color: vipColors.bronze },
  { level: 2, name: '白银会员', color: vipColors.silver },
  { level: 3, name: '黄金会员', color: vipColors.gold },
  { level: 4, name: '铂金会员', color: vipColors.platinum },
  { level: 5, name: '钻石会员', color: vipColors.diamond },
];

export const getVIPInfo = (level: number): VIPLevelInfo => {
  return VIP_LEVELS[Math.min(level, VIP_LEVELS.length - 1)];
};

interface ProfileVIPBadgeProps {
  level: number;
  size?: 'small' | 'medium' | 'large';
}

interface SizeConfig {
  container: ViewStyle;
  text: { fontSize: number };
}

const SIZE_CONFIGS: Record<'small' | 'medium' | 'large', SizeConfig> = {
  small: {
    container: {
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: BorderRadius.xs,
    },
    text: { fontSize: 8 },
  },
  medium: {
    container: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: BorderRadius.sm,
    },
    text: { fontSize: 10 },
  },
  large: {
    container: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: BorderRadius.md,
    },
    text: { fontSize: 12 },
  },
};

const AnimatedView = Animated.createAnimatedComponent(View);

export const ProfileVIPBadge: React.FC<ProfileVIPBadgeProps> = React.memo(
  ({ level, size = 'medium' }) => {
    const vipInfo = getVIPInfo(level);
    const scale = useSharedValue(1);

    if (level <= 0) return null;

    const sizeConfig = SIZE_CONFIGS[size];

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    return (
      <AnimatedView
        style={[
          styles.badge,
          sizeConfig.container,
          { backgroundColor: vipInfo.color },
          animatedStyle,
        ]}
      >
        <Text style={[styles.badgeText, sizeConfig.text]}>VIP</Text>
      </AnimatedView>
    );
  },
);

ProfileVIPBadge.displayName = 'ProfileVIPBadge';

interface ProfileVIPTagProps {
  level: number;
}

export const ProfileVIPTag: React.FC<ProfileVIPTagProps> = React.memo(
  ({ level }) => {
    const vipInfo = getVIPInfo(level);

    if (level <= 0) return null;

    return (
      <View style={[styles.tag, { backgroundColor: vipInfo.color + '30' }]}>
        <Text style={[styles.tagText, { color: vipInfo.color }]}>
          {vipInfo.name}
        </Text>
      </View>
    );
  },
);

ProfileVIPTag.displayName = 'ProfileVIPTag';

interface VIPLevelCardProps {
  level: number;
}

export const VIPLevelCard: React.FC<VIPLevelCardProps> = React.memo(
  ({ level }) => {
    const vipInfo = getVIPInfo(level);

    return (
      <View style={[styles.levelCard, { borderColor: vipInfo.color }]}>
        <View style={[styles.levelIcon, { backgroundColor: vipInfo.color }]}>
          <Text style={styles.levelIconText}>★</Text>
        </View>
        <View style={styles.levelInfo}>
          <Text style={[styles.levelName, { color: vipInfo.color }]}>
            {vipInfo.name}
          </Text>
          <Text style={styles.levelDesc}>享受专属特权</Text>
        </View>
      </View>
    );
  },
);

VIPLevelCard.displayName = 'VIPLevelCard';

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    borderWidth: 2,
    borderColor: colors.text.inverse + '4D',
  },
  badgeText: {
    color: colors.text.inverse,
    fontWeight: typography.weight.bold,
  },
  tag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.md,
  },
  tagText: {
    fontSize: typography.size.caption,
    fontWeight: typography.weight.semibold,
  },
  levelCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    backgroundColor: colors.gray[900] + '80',
  },
  levelIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelIconText: {
    fontSize: 18,
    color: colors.text.inverse,
  },
  levelInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  levelName: {
    fontSize: typography.size.h4,
    fontWeight: typography.weight.bold,
  },
  levelDesc: {
    fontSize: typography.size.caption,
    color: colors.text.tertiary,
    marginTop: 2,
  },
});

export default ProfileVIPBadge;
