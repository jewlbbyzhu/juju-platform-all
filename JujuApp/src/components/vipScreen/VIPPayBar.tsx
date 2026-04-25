import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, { FadeIn } from 'react-native-reanimated';
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

interface VIPPayBarProps {
  selectedPlan: VIPLevel | undefined;
  currentLevel: number;
  onPay: () => void;
}

export const VIPPayBar: React.FC<VIPPayBarProps> = ({
  selectedPlan,
  currentLevel,
  onPay,
}) => {
  const buttonGradient = selectedPlan?.gradient || ['#FF4D6D', '#FF8FA3'];

  return (
    <Animated.View
      entering={FadeIn.duration(400)}
      style={[styles.bottomBar, glassmorphism.navbar]}
    >
      <View style={styles.priceInfo}>
        <View style={styles.priceRow}>
          <Text style={[styles.priceCurrency, { color: selectedPlan?.color }]}>
            ¥
          </Text>
          <Text style={[styles.priceValue, { color: selectedPlan?.color }]}>
            {selectedPlan?.price}
          </Text>
          <Text style={styles.priceDuration}>
            /{selectedPlan?.duration.replace('卡', '')}
          </Text>
        </View>
        <Text style={styles.priceSave}>预计可省 ¥299</Text>
      </View>
      <TouchableOpacity style={styles.payButton} onPress={onPay}>
        <LinearGradient
          colors={[...buttonGradient] as [string, string]}
          style={styles.payButtonGradient}
        >
          <Text style={styles.payButtonText}>
            {currentLevel > 0 ? '续费会员' : '立即开通'}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    paddingBottom: spacing['2xl'],
  },
  priceInfo: {
    flex: 1,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceCurrency: {
    fontSize: typography.size.body,
    fontWeight: typography.weight.bold,
  },
  priceValue: {
    fontSize: typography.size.h2,
    fontWeight: typography.weight.bold,
  },
  priceDuration: {
    fontSize: typography.size.caption,
    color: colors.text.secondary,
  },
  priceSave: {
    fontSize: typography.size.caption,
    color: colors.status.success,
    marginTop: spacing.xs,
  },
  payButton: {
    width: 140,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
  },
  payButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  payButtonText: {
    fontSize: typography.size.body,
    fontWeight: typography.weight.bold,
    color: colors.text.inverse,
  },
});

export default VIPPayBar;
