import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInUp, ZoomIn } from 'react-native-reanimated';
import { GlassCard } from '../../components';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

interface BenefitItem {
  icon: string;
  title: string;
  desc: string;
}

const BENEFITS_DATA: BenefitItem[] = [
  { icon: '⚡', title: '优先购票', desc: '热门活动优先购买' },
  { icon: '💰', title: '专属折扣', desc: '全场9折优惠' },
  { icon: '🌟', title: '专属活动', desc: 'VIP专属聚会' },
  { icon: '🎧', title: '专属客服', desc: '7x24小时服务' },
  { icon: '🎁', title: '生日礼包', desc: '专属生日惊喜' },
  { icon: '🏅', title: '专属徽章', desc: '尊贵身份标识' },
];

export const VIPBenefitsList: React.FC = React.memo(() => {
  return (
    <View style={styles.container}>
      <Animated.View entering={FadeInUp.delay(600).duration(400)}>
        <Text style={styles.title}>VIP 专属权益</Text>
      </Animated.View>
      <View style={styles.grid}>
        {BENEFITS_DATA.map((item, idx) => (
          <Animated.View
            key={item.title}
            entering={ZoomIn.delay(700 + idx * 80).duration(400)}
          >
            <GlassCard style={styles.card} intensity="light">
              <Text style={styles.cardIcon}>{item.icon}</Text>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardDesc}>{item.desc}</Text>
            </GlassCard>
          </Animated.View>
        ))}
      </View>
    </View>
  );
});
VIPBenefitsList.displayName = 'VIPBenefitsList';

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
  },
  title: {
    fontSize: 20,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  card: {
    width: '31%',
    alignItems: 'center',
    padding: spacing.md,
  },
  cardIcon: {
    fontSize: 28,
    marginBottom: spacing.xs,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: typography.weight.semibold,
    color: colors.text.primary,
    marginBottom: 4,
    textAlign: 'center',
  },
  cardDesc: {
    fontSize: 11,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});

export default VIPBenefitsList;
