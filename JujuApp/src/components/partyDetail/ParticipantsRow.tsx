import React, { useMemo } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { colors, typography, animation } from '../../theme';

interface ParticipantsRowProps {
  currentJoinCount: number;
}

export const ParticipantsRow: React.FC<ParticipantsRowProps> = React.memo(
  ({ currentJoinCount }) => {
    const styles = useMemo(
      () =>
        StyleSheet.create({
          row: {
            flexDirection: 'row',
            alignItems: 'center',
          },
          avatar: {
            width: 40,
            height: 40,
            borderRadius: 20,
            borderWidth: 2,
            borderColor: colors.background.primary,
          },
          avatarWithMargin: {
            marginLeft: -12,
          },
          more: {
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: colors.text.primary + '1A',
            justifyContent: 'center',
            alignItems: 'center',
            marginLeft: -12,
            borderWidth: 2,
            borderColor: colors.background.primary,
          },
          moreText: {
            fontSize: typography.size.caption,
            fontWeight: typography.weight.bold,
            color: colors.text.secondary,
          },
        }),
      [],
    );

    const displayCount = Math.min(currentJoinCount || 0, 5);

    return (
      <View style={styles.row}>
        {Array.from({ length: displayCount }).map((_, i) => (
          <Animated.View
            key={i}
            entering={ZoomIn.duration(animation.duration.normal).delay(i * 50)}
            style={i > 0 ? styles.avatarWithMargin : undefined}
          >
            <Image
              source={{ uri: `https://i.pravatar.cc/100?${i + 10}` }}
              style={styles.avatar}
            />
          </Animated.View>
        ))}
        {currentJoinCount > 5 && (
          <View style={styles.more}>
            <Text style={styles.moreText}>+{currentJoinCount - 5}</Text>
          </View>
        )}
      </View>
    );
  },
);

ParticipantsRow.displayName = 'ParticipantsRow';
