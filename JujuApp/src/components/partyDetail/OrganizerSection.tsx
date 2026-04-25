import React, { useMemo } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { GlassButton } from '../GlassButton';
import { colors, typography, spacing, animation } from '../../theme';

interface OrganizerSectionProps {
  onFollow?: () => void;
}

export const OrganizerSection: React.FC<OrganizerSectionProps> = React.memo(
  ({ onFollow }) => {
    const styles = useMemo(
      () =>
        StyleSheet.create({
          section: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingTop: spacing.md,
            borderTopWidth: 1,
            borderTopColor: colors.border,
          },
          avatar: {
            width: 48,
            height: 48,
            borderRadius: 24,
            borderWidth: 2,
            borderColor: colors.primary.light + '30',
          },
          info: {
            flex: 1,
            marginLeft: 12,
          },
          name: {
            fontSize: typography.size.body,
            fontWeight: typography.weight.semibold,
            color: colors.text.primary,
          },
          sub: {
            fontSize: typography.size.caption,
            color: colors.text.secondary,
            marginTop: 2,
          },
        }),
      [],
    );

    return (
      <Animated.View
        entering={FadeInUp.duration(animation.duration.normal).delay(100)}
        style={styles.section}
      >
        <Image
          source={{ uri: 'https://i.pravatar.cc/100?1' }}
          style={styles.avatar}
        />
        <View style={styles.info}>
          <Text style={styles.name}>活动组织者</Text>
          <Text style={styles.sub}>认证主办方</Text>
        </View>
        <GlassButton
          title="+ 关注"
          onPress={onFollow || (() => {})}
          variant="secondary"
          size="small"
        />
      </Animated.View>
    );
  },
);

OrganizerSection.displayName = 'OrganizerSection';
