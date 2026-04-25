import React, { useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated as RNAnimated,
} from 'react-native';
import Animated, { FadeInLeft, ZoomIn } from 'react-native-reanimated';
import { GlassCard, GlassButton } from '../../components';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

export interface VipPackage {
  id: string;
  name: string;
  price: number;
  duration: number;
  description: string;
  benefits: string[];
  isPopular?: boolean;
}

interface VIPPackageCardProps {
  pkg: VipPackage;
  selectedPackage: string | null;
  onSelect: (id: string) => void;
  onSubscribe: (id: string) => void;
  index?: number;
}

const BENEFIT_ICONS: Record<string, string> = {
  priority: '⚡',
  discount: '💰',
  exclusive: '🌟',
  support: '🎧',
  gift: '🎁',
  badge: '🏅',
  event: '🎉',
  content: '📱',
};

export const VIPPackageCard: React.FC<VIPPackageCardProps> = React.memo(
  ({ pkg, selectedPackage, onSelect, onSubscribe, index = 0 }) => {
    const isSelected = selectedPackage === pkg.id;
    const scaleAnim = useRef(new RNAnimated.Value(1)).current;

    const handlePressIn = useCallback(() => {
      RNAnimated.spring(scaleAnim, {
        toValue: 0.98,
        useNativeDriver: true,
      }).start();
    }, [scaleAnim]);

    const handlePressOut = useCallback(() => {
      RNAnimated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        damping: 15,
        stiffness: 400,
      }).start();
    }, [scaleAnim]);

    return (
      <Animated.View
        entering={FadeInLeft.delay(400 + index * 60).duration(400)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
        >
          <RNAnimated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <GlassCard
              style={[
                styles.card,
                isSelected && styles.cardSelected,
                pkg.isPopular && styles.cardPopular,
              ]}
              intensity={isSelected ? 'medium' : 'light'}
              glow={isSelected}
              glowColor={colors.accent.gold}
            >
              {pkg.isPopular && (
                <Animated.View
                  entering={ZoomIn.delay(500).duration(300)}
                  style={[
                    styles.popularBadge,
                    { backgroundColor: colors.accent.gold },
                  ]}
                >
                  <Text style={styles.popularText}>🔥 热门</Text>
                </Animated.View>
              )}
              <View style={styles.header}>
                <Text style={styles.name}>{pkg.name}</Text>
                <View style={styles.priceRow}>
                  <Text style={styles.currency}>¥</Text>
                  <Text style={styles.price}>{pkg.price}</Text>
                  <Text style={styles.duration}>/{pkg.duration}个月</Text>
                </View>
              </View>
              <Text style={styles.description}>{pkg.description}</Text>
              <View style={styles.benefits}>
                {pkg.benefits?.map((benefit, idx) => (
                  <View
                    key={idx}
                    style={[
                      styles.benefitTag,
                      { backgroundColor: colors.gray[900] + '10' },
                    ]}
                  >
                    <Text style={styles.benefitIcon}>
                      {BENEFIT_ICONS[benefit] || '✓'}
                    </Text>
                    <Text style={styles.benefitText}>{benefit}</Text>
                  </View>
                ))}
              </View>
              <GlassButton
                title={isSelected ? '立即开通' : '选择套餐'}
                onPress={() =>
                  isSelected ? onSubscribe(pkg.id) : onSelect(pkg.id)
                }
                variant={isSelected ? 'gradient' : 'secondary'}
                size="medium"
                fullWidth
                style={isSelected ? styles.btnActive : styles.btn}
              />
            </GlassCard>
          </RNAnimated.View>
        </TouchableOpacity>
      </Animated.View>
    );
  },
);
VIPPackageCard.displayName = 'VIPPackageCard';

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.sm,
  },
  cardSelected: {
    borderWidth: 2,
    borderColor: colors.accent.gold,
  },
  cardPopular: {
    borderWidth: 1,
    borderColor: colors.accent.gold,
  },
  popularBadge: {
    position: 'absolute',
    top: -2,
    right: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  popularText: {
    fontSize: 12,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  name: {
    fontSize: 18,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  currency: {
    fontSize: 16,
    fontWeight: typography.weight.bold,
    color: colors.accent.gold,
  },
  price: {
    fontSize: 28,
    fontWeight: typography.weight.bold,
    color: colors.accent.gold,
  },
  duration: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  description: {
    fontSize: 13,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  benefits: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  benefitTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  benefitIcon: {
    fontSize: 12,
  },
  benefitText: {
    fontSize: 12,
    fontWeight: typography.weight.medium,
    color: colors.text.primary,
  },
  btn: {
    marginTop: spacing.xs,
  },
  btnActive: {
    marginTop: spacing.xs,
  },
});

export default VIPPackageCard;
