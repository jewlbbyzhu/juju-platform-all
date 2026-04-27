import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,

} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, { FadeInLeft, FadeIn } from 'react-native-reanimated';
import { colors } from '../../theme/colors';
import { gradients } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';


const LEVEL_ICONS = ['🥉', '🥈', '🥇', '💎'];

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

interface VIPLevelSelectorProps {
  levels: VIPLevel[];
  selectedLevel: number;
  onSelectLevel: (level: number) => void;
}

export const VIPLevelSelector: React.FC<VIPLevelSelectorProps> = ({
  levels,
  selectedLevel,
  onSelectLevel,
}) => {
  return (
    <Animated.View entering={FadeIn.duration(400)}>
      <Text style={styles.sectionTitle}>选择会员等级</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.levelsScroll}
      >
        {levels.map((level, index) => (
          <Animated.View
            key={level.level}
            entering={FadeInLeft.delay(index * 80).duration(300)}
          >
            <TouchableOpacity
              style={[
                styles.levelCard,
                selectedLevel === level.level && styles.levelCardSelected,
                selectedLevel === level.level && { borderColor: level.color },
              ]}
              onPress={() => onSelectLevel(level.level)}
              activeOpacity={0.9}
            >
              {level.popular && (
                <LinearGradient
                  colors={[...gradients.primary] as [string, string]}
                  style={styles.popularBadge}
                >
                  <Text style={styles.popularText}>最受欢迎</Text>
                </LinearGradient>
              )}
              <LinearGradient
                colors={[...level.gradient] as [string, string]}
                style={styles.levelIcon}
              >
                <Text style={styles.levelIconText}>{LEVEL_ICONS[index]}</Text>
              </LinearGradient>
              <Text style={styles.levelName}>{level.name}</Text>
              <View style={styles.levelPriceRow}>
                <Text style={[styles.levelCurrency, { color: level.color }]}>
                  ¥
                </Text>
                <Text style={[styles.levelPrice, { color: level.color }]}>
                  {level.price}
                </Text>
              </View>
              <Text style={styles.levelDuration}>{level.duration}</Text>

              {selectedLevel === level.level && (
                <View
                  style={[
                    styles.selectedCheck,
                    { backgroundColor: level.color },
                  ]}
                >
                  <Text style={styles.selectedCheckText}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          </Animated.View>
        ))}
      </ScrollView>
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
  levelsScroll: {
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  levelCard: {
    width: 140,
    backgroundColor: colors.background.primary,
    borderRadius: 20,
    padding: spacing.md,
    marginHorizontal: spacing.xs,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
  },
  levelCardSelected: {
    borderWidth: 2,
    borderColor: colors.accent.gold,
  },
  popularBadge: {
    position: 'absolute',
    top: -8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  popularText: {
    fontSize: 10,
    fontWeight: typography.weight.bold,
    color: colors.text.inverse,
  },
  levelIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  levelIconText: {
    fontSize: 28,
  },
  levelName: {
    fontSize: typography.size.body,
    fontWeight: typography.weight.semibold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  levelPriceRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'baseline',
  },
  levelCurrency: {
    fontSize: typography.size.body,
    fontWeight: typography.weight.bold,
  },
  levelPrice: {
    fontSize: typography.size.h2,
    fontWeight: typography.weight.bold,
  },
  levelDuration: {
    fontSize: typography.size.caption,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  selectedCheck: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedCheckText: {
    color: colors.text.inverse,
    fontSize: 12,
    fontWeight: typography.weight.bold,
  },
});

export default VIPLevelSelector;
