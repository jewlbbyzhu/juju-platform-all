import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { colors, typography, animation } from '../../theme';

interface InfoItemProps {
  icon: string;
  iconBgColor: string;
  label: string;
  value: string;
  index?: number;
}

export const InfoItem: React.FC<InfoItemProps> = React.memo(
  ({ icon, iconBgColor, label, value, index = 0 }) => {
    const styles = useMemo(
      () =>
        StyleSheet.create({
          item: {
            flexDirection: 'row',
            alignItems: 'center',
          },
          iconBox: {
            width: 44,
            height: 44,
            borderRadius: 12,
            justifyContent: 'center',
            alignItems: 'center',
          },
          iconText: {
            fontSize: 20,
          },
          content: {
            marginLeft: 12,
          },
          label: {
            fontSize: typography.size.caption,
            color: colors.text.tertiary,
            marginBottom: 2,
          },
          value: {
            fontSize: typography.size.body,
            fontWeight: typography.weight.medium,
            color: colors.text.primary,
          },
        }),
      [],
    );

    return (
      <Animated.View
        entering={FadeInUp.duration(animation.duration.normal).delay(
          index * animation.presets.listItem(0).delay,
        )}
      >
        <View style={styles.item}>
          <LinearGradient
            colors={[iconBgColor + '40', iconBgColor + '20']}
            style={styles.iconBox}
          >
            <Text style={styles.iconText}>{icon}</Text>
          </LinearGradient>
          <View style={styles.content}>
            <Text style={styles.label}>{label}</Text>
            <Text style={styles.value}>{value}</Text>
          </View>
        </View>
      </Animated.View>
    );
  },
);

InfoItem.displayName = 'InfoItem';
