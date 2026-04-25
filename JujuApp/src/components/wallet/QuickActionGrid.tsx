import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, ViewStyle, TextStyle } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { GlassCard } from '../GlassCard';
import { spacing, BorderRadius, typography } from '../../theme';
import type { NavigationProp } from '../../types';
import { QUICK_ACTIONS } from './constants';

interface QuickActionGridProps {
  colors: {
    background: { tertiary: string };
    border: string;
    secondary: { main: string };
    text: { primary: string; tertiary: string };
  };
  navigation: NavigationProp;
}

const QuickActionGrid = React.memo(
  ({ colors, navigation }: QuickActionGridProps) => {
    // 使用设计系统替代 StyleSheet.create
    const quickActionsSectionStyle = useMemo(
      (): ViewStyle => ({
        paddingHorizontal: spacing.lg,
        marginTop: -20,
      }),
      [],
    );

    const quickActionsCardStyle = useMemo(
      (): ViewStyle => ({
        marginVertical: 0,
      }),
      [],
    );

    const quickActionsGridStyle = useMemo(
      (): ViewStyle => ({
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
        marginTop: spacing.sm,
      }),
      [],
    );

    const quickActionItemStyle = useMemo(
      (): ViewStyle => ({
        width: '23%',
        borderRadius: BorderRadius.md,
        padding: spacing.md,
        alignItems: 'center',
        borderWidth: 1,
        backgroundColor: colors.background.tertiary,
        borderColor: colors.border + '40',
      }),
      [colors.background.tertiary, colors.border],
    );

    const actionIconWrapperStyle = useMemo(
      (): ViewStyle => ({
        width: 40,
        height: 40,
        borderRadius: BorderRadius.sm,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.sm,
        borderWidth: 1,
        backgroundColor: colors.secondary.main + '26',
        borderColor: colors.secondary.main + '33',
      }),
      [colors.secondary.main],
    );

    const actionIconStyle = useMemo(
      (): TextStyle => ({
        fontSize: typography.size.h3,
      }),
      [],
    );

    const actionNameStyle = useMemo(
      (): TextStyle => ({
        fontSize: typography.size.small,
        marginBottom: spacing.xs,
        fontWeight: typography.weight.medium,
        color: colors.text.primary,
      }),
      [colors.text.primary],
    );

    const actionDescStyle = useMemo(
      (): TextStyle => ({
        fontSize: typography.size.small,
        textAlign: 'center',
        color: colors.text.tertiary,
      }),
      [colors.text.tertiary],
    );

    return (
      <View style={quickActionsSectionStyle}>
        <GlassCard
          title="快捷功能"
          intensity="medium"
          style={quickActionsCardStyle}
        >
          <View style={quickActionsGridStyle}>
            {QUICK_ACTIONS.map((action, index) => (
              <Animated.View
                key={action.name}
                entering={ZoomIn.delay(200 + index * 80)
                  .duration(400)
                  .springify()}
              >
                <TouchableOpacity
                  style={quickActionItemStyle}
                  onPress={() => (navigation as any).navigate(action.route)}
                  activeOpacity={0.8}
                >
                  <View style={actionIconWrapperStyle}>
                    <Text style={actionIconStyle}>{action.icon}</Text>
                  </View>
                  <Text style={actionNameStyle}>
                    {action.name}
                  </Text>
                  <Text style={actionDescStyle}>
                    {action.desc}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        </GlassCard>
      </View>
    );
  },
);

export default QuickActionGrid;
