import React, { useMemo } from 'react';
import { Text, StyleSheet } from 'react-native';
import { GlassCard } from '../GlassCard';
import { colors, typography, spacing } from '../../theme';

interface MainCardProps {
  title: string;
  children: React.ReactNode;
}

export const MainCard: React.FC<MainCardProps> = React.memo(
  ({ title, children }) => {
    const styles = useMemo(
      () =>
        StyleSheet.create({
          card: {
            marginBottom: spacing.md,
          },
          title: {
            fontSize: typography.size.h1,
            fontWeight: typography.weight.bold,
            color: colors.text.primary,
            lineHeight: 36,
            marginBottom: spacing.md,
          },
        }),
      [],
    );

    return (
      <GlassCard intensity="light" style={styles.card}>
        <Text style={styles.title}>{title}</Text>
        {children}
      </GlassCard>
    );
  },
);

MainCard.displayName = 'MainCard';
