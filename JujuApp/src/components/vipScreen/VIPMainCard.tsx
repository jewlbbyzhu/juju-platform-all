import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { glassmorphism } from '../../theme/glassmorphism';

export interface VIPLevel {
  level: number;
  name: string;
  price: number;
  duration: string;
  color: string;
  gradient: readonly [string, string];
  benefits: string[];
  popular?: boolean;
  vip?: boolean;
}

interface VIPMainCardProps {
  currentLevel: number;
  selectedPlan: VIPLevel | undefined;
  vipGradient: readonly [string, string];
}

export const VIPMainCard: React.FC<VIPMainCardProps> = ({
  currentLevel,
  selectedPlan,
  vipGradient,
}) => {
  const cardGradient = selectedPlan?.gradient || vipGradient;

  return (
    <Animated.View entering={FadeInUp.duration(500)}>
      <LinearGradient
        colors={[...cardGradient] as [string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.vipCard}
      >
        <View style={styles.vipHeader}>
          <View>
            <Text style={styles.vipTitle}>
              {currentLevel > 0 ? '您的会员' : '开通会员'}
            </Text>
            <Text style={styles.vipLevel}>
              {currentLevel > 0
                ? ['青铜会员', '白银会员', '黄金会员', '钻石会员'][
                    currentLevel - 1
                  ] || '未开通'
                : '未开通'}
            </Text>
          </View>
          {currentLevel > 0 && (
            <View style={[styles.vipBadge, glassmorphism.chip]}>
              <Text style={styles.vipBadgeText}>有效期至 2026.12.31</Text>
            </View>
          )}
        </View>

        <View style={styles.vipStats}>
          <View style={styles.vipStat}>
            <Text style={styles.vipStatValue}>¥128</Text>
            <Text style={styles.vipStatLabel}>已节省</Text>
          </View>
          <View style={styles.vipStatDivider} />
          <View style={styles.vipStat}>
            <Text style={styles.vipStatValue}>12</Text>
            <Text style={styles.vipStatLabel}>参加活动</Text>
          </View>
          <View style={styles.vipStatDivider} />
          <View style={styles.vipStat}>
            <Text style={styles.vipStatValue}>3</Text>
            <Text style={styles.vipStatLabel}>专属优惠</Text>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  vipCard: {
    marginHorizontal: spacing.md,
    borderRadius: 24,
    padding: spacing.lg,
  },
  vipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  vipTitle: {
    fontSize: typography.size.caption,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  vipLevel: {
    fontSize: typography.size.h2,
    fontWeight: typography.weight.bold,
    color: colors.text.inverse,
  },
  vipBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  vipBadgeText: {
    fontSize: typography.size.caption,
    color: colors.text.inverse,
  },
  vipStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  vipStat: {
    alignItems: 'center',
  },
  vipStatValue: {
    fontSize: typography.size.h2,
    fontWeight: typography.weight.bold,
    color: colors.text.inverse,
  },
  vipStatLabel: {
    fontSize: typography.size.caption,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  vipStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.divider,
  },
});

export default VIPMainCard;
