import React from 'react';
import { Text, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { colors, vipColors } from '../../theme/colors';
import { typography } from '../../theme/typography';

export interface VIPLevel {
  level: number;
  name: string;
  color: string;
  icon: string;
  gradient: [string, string];
}

export const getVIP_LEVELS = (): VIPLevel[] => [
  {
    level: 1,
    name: '铜牌',
    color: vipColors.bronze,
    icon: '🥉',
    gradient: [vipColors.bronze, vipColors.bronzeEnd],
  },
  {
    level: 2,
    name: '银牌',
    color: vipColors.silver,
    icon: '🥈',
    gradient: [vipColors.silver, vipColors.silverEnd],
  },
  {
    level: 3,
    name: '金牌',
    color: vipColors.gold,
    icon: '🥇',
    gradient: [vipColors.gold, vipColors.goldEnd],
  },
  {
    level: 4,
    name: '铂金',
    color: vipColors.platinum,
    icon: '💎',
    gradient: [vipColors.platinum, vipColors.platinumEnd],
  },
  {
    level: 5,
    name: '钻石',
    color: vipColors.diamond,
    icon: '💠',
    gradient: [vipColors.diamond, vipColors.diamondEnd],
  },
];

export const getVIPLevel = (level: number): VIPLevel => {
  const levels = getVIP_LEVELS();
  return levels.find(l => l.level === level) || levels[0];
};

interface VIPLevelBadgeProps {
  level: number;
  showName?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export const VIPLevelBadge: React.FC<VIPLevelBadgeProps> = React.memo(
  ({ level, showName = true, size = 'medium' }) => {
    const vipLevel = getVIPLevel(level);
    const sizeStyles = getSizeStyles(size);

    return (
      <LinearGradient
        colors={vipLevel.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.badge, sizeStyles.container]}
      >
        <Text style={[styles.icon, sizeStyles.icon]}>{vipLevel.icon}</Text>
        {showName && (
          <Text style={[styles.name, sizeStyles.text]}>{vipLevel.name}</Text>
        )}
      </LinearGradient>
    );
  },
);

const getSizeStyles = (size: 'small' | 'medium' | 'large') => {
  switch (size) {
    case 'small':
      return {
        container: {
          paddingHorizontal: 8,
          paddingVertical: 4,
          borderRadius: 12,
        },
        icon: { fontSize: 14 },
        text: { fontSize: 10 },
      };
    case 'large':
      return {
        container: {
          paddingHorizontal: 20,
          paddingVertical: 10,
          borderRadius: 24,
        },
        icon: { fontSize: 24 },
        text: { fontSize: 18 },
      };
    default:
      return {
        container: {
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 16,
        },
        icon: { fontSize: 16 },
        text: { fontSize: 12 },
      };
  }
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  icon: {},
  name: {
    color: colors.text.inverse,
    fontWeight: typography.weight.bold,
  },
});

export default VIPLevelBadge;
