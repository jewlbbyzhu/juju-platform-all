import React, { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { GlassCard } from '../GlassCard';
import { ParticipantsRow } from './ParticipantsRow';
import { spacing, animation } from '../../theme';

interface ParticipantsCardProps {
  count: number;
}

export const ParticipantsCard: React.FC<ParticipantsCardProps> = React.memo(
  ({ count }) => {
    const styles = useMemo(
      () =>
        StyleSheet.create({
          card: {
            marginBottom: spacing.md,
          },
        }),
      [],
    );

    return (
      <Animated.View
        entering={FadeInUp.duration(animation.duration.normal).delay(300)}
      >
        <GlassCard
          title={`已报名 (${count})`}
          intensity="light"
          style={styles.card}
        >
          <ParticipantsRow currentJoinCount={count} />
        </GlassCard>
      </Animated.View>
    );
  },
);

ParticipantsCard.displayName = 'ParticipantsCard';
