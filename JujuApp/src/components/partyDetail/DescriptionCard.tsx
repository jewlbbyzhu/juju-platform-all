import React, { useMemo } from 'react';
import { Text, StyleSheet } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { GlassCard } from '../GlassCard';
import { colors, typography, spacing, animation } from '../../theme';

interface DescriptionCardProps {
  description: string;
}

export const DescriptionCard: React.FC<DescriptionCardProps> = React.memo(
  ({ description }) => {
    const styles = useMemo(
      () =>
        StyleSheet.create({
          card: {
            marginBottom: spacing.md,
          },
          text: {
            fontSize: typography.size.body,
            color: colors.text.secondary,
            lineHeight: 24,
          },
        }),
      [],
    );

    return (
      <Animated.View
        entering={FadeInUp.duration(animation.duration.normal).delay(250)}
      >
        <GlassCard title="活动详情" intensity="light" style={styles.card}>
          <Text style={styles.text}>{description || '暂无活动详情描述'}</Text>
        </GlassCard>
      </Animated.View>
    );
  },
);

DescriptionCard.displayName = 'DescriptionCard';
