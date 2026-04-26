import React, { useMemo } from 'react';
import { Text, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { gradients, spacing, typography, animation, BorderRadius } from '../../theme';
import { colors } from '../../theme/colors';

interface MapHeaderProps {
  title?: string;
}

export const MapHeader: React.FC<MapHeaderProps> = React.memo(
  ({ title = '📍 选择位置' }) => {
    // 使用设计系统替代 StyleSheet.create
    const headerStyle = useMemo(
      (): ViewStyle => ({
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.md + 4,
        paddingBottom: spacing.lg,
        borderBottomLeftRadius: BorderRadius['2xl'],
        borderBottomRightRadius: BorderRadius['2xl'],
      }),
      [],
    );

    const headerTitleStyle = useMemo(
      (): TextStyle => ({
        fontSize: typography.size.h2,
        fontWeight: typography.weight.bold,
        color: colors.text.inverse,
        letterSpacing: 0.5,
      }),
      [],
    );

    return (
      <Animated.View entering={FadeInUp.duration(animation.duration.normal)}>
        <LinearGradient
          colors={gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={headerStyle}
        >
          <Text style={headerTitleStyle}>{title}</Text>
        </LinearGradient>
      </Animated.View>
    );
  },
);

MapHeader.displayName = 'MapHeader';
