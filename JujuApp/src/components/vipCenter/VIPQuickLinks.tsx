import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { GlassCard } from '../../components';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

interface QuickLinkItem {
  icon: string;
  title: string;
  route: string;
  color: string;
}

const QUICK_LINKS: QuickLinkItem[] = [
  {
    icon: '📊',
    title: '等级体系',
    route: 'VIPLevels',
    color: colors.primary.main,
  },
  {
    icon: '💎',
    title: '积分中心',
    route: 'VIPPoints',
    color: colors.accent.gold,
  },
  {
    icon: '🎁',
    title: '会员权益',
    route: 'VIPPrivileges',
    color: colors.secondary.main,
  },
  {
    icon: '📜',
    title: '订阅记录',
    route: 'VIPHistory',
    color: colors.status.info,
  },
];

export const VIPQuickLinks: React.FC = React.memo(() => {
  const navigation = useNavigation<any>();

  return (
    <Animated.View entering={FadeInDown.delay(200).duration(400)}>
      <GlassCard style={styles.card} intensity="light">
        <View style={styles.grid}>
          {QUICK_LINKS.map((item, index) => (
            <Animated.View
              key={item.title}
              entering={ZoomIn.delay(300 + index * 80).duration(400)}
            >
              <TouchableOpacity
                style={styles.item}
                onPress={() => navigation.navigate(item.route)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.iconWrapper,
                    { backgroundColor: item.color + '20' },
                  ]}
                >
                  <Text style={styles.icon}>{item.icon}</Text>
                </View>
                <Text style={styles.text}>{item.title}</Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      </GlassCard>
    </Animated.View>
  );
});
VIPQuickLinks.displayName = 'VIPQuickLinks';

const styles = StyleSheet.create({
  card: {
    marginHorizontal: spacing.md,
    marginTop: -10,
    marginBottom: spacing.md,
  },
  grid: {
    flexDirection: 'row',
    padding: spacing.xs,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  iconWrapper: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  icon: {
    fontSize: 24,
  },
  text: {
    fontSize: 12,
    fontWeight: typography.weight.medium,
    color: colors.text.primary,
  },
});

export default VIPQuickLinks;
