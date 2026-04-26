import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { GlassCard } from '../../components/GlassCard';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

const { width } = Dimensions.get('window');

export interface Benefit {
  icon: string;
  title: string;
  desc: string;
  gradient: readonly [string, string, string?] | readonly [string, string];
}

interface VIPBenefitGridProps {
  benefits: Benefit[];
}

export const VIPBenefitGrid: React.FC<VIPBenefitGridProps> = ({ benefits }) => {
  return (
    <Animated.View entering={FadeIn.duration(400)}>
      <Text style={styles.sectionTitle}>会员专属权益</Text>
      <View style={styles.benefitsGrid}>
        {benefits.map((benefit, index) => (
          <Animated.View
            key={index}
            entering={FadeInDown.delay(index * 60).duration(300)}
          >
            <GlassCard style={styles.benefitItem} intensity="light">
              <LinearGradient
                colors={[...benefit.gradient] as [string, string]}
                style={styles.benefitIconContainer}
              >
                <Text style={styles.benefitIcon}>{benefit.icon}</Text>
              </LinearGradient>
              <Text style={styles.benefitTitle}>{benefit.title}</Text>
              <Text style={styles.benefitDesc}>{benefit.desc}</Text>
            </GlassCard>
          </Animated.View>
        ))}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: typography.size.h4,
    fontWeight: typography.weight.semibold,
    color: colors.text.primary,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  benefitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  benefitItem: {
    width: (width - 56) / 3,
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  benefitIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  benefitIcon: {
    fontSize: 28,
  },
  benefitTitle: {
    fontSize: typography.size.body2,
    fontWeight: typography.weight.medium,
    color: colors.text.primary,
    marginBottom: 2,
  },
  benefitDesc: {
    fontSize: typography.size.caption,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
});

export default VIPBenefitGrid;
