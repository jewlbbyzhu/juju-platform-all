import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, { FadeIn } from 'react-native-reanimated';
import { GlassCard } from '../../components/GlassCard';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

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

interface VIPPlanDetailProps {
  selectedPlan: VIPLevel | undefined;
}

export const VIPPlanDetail: React.FC<VIPPlanDetailProps> = ({
  selectedPlan,
}) => {
  if (!selectedPlan) return null;

  return (
    <Animated.View entering={FadeIn.duration(400)}>
      <GlassCard
        style={styles.container}
        intensity="light"
        title={`${selectedPlan.name}专享`}
        titleStyle={{ color: selectedPlan.color }}
      >
        <View style={styles.planBenefits}>
          {selectedPlan.benefits.map((benefit, index) => (
            <View key={index} style={styles.planBenefitItem}>
              <LinearGradient
                colors={[...selectedPlan.gradient] as [string, string]}
                style={styles.checkIcon}
              >
                <Text style={styles.checkIconText}>✓</Text>
              </LinearGradient>
              <Text style={styles.planBenefitText}>{benefit}</Text>
            </View>
          ))}
        </View>
      </GlassCard>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.xl,
  },
  planBenefits: {
    gap: spacing.md,
  },
  planBenefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  checkIconText: {
    fontSize: 14,
    fontWeight: typography.weight.bold,
    color: colors.text.inverse,
  },
  planBenefitText: {
    fontSize: typography.size.body,
    color: colors.text.primary,
  },
});

export default VIPPlanDetail;
