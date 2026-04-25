import React, { useMemo } from 'react';
import { View, Text, ViewStyle, TextStyle } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { GlassCard } from '../GlassCard';
import { GlassButton } from '../GlassButton';
import { SearchLocationResult } from '../../api/map';
import { colors, spacing, typography, animation, BorderRadius } from '../../theme';

interface SelectedLocationCardProps {
  selectedLocation: SearchLocationResult;
  mode?: 'view' | 'select';
  onConfirm: () => void;
}

export const SelectedLocationCard: React.FC<SelectedLocationCardProps> =
  React.memo(({ selectedLocation, mode = 'view', onConfirm }) => {
    // 使用设计系统替代 StyleSheet.create
    const containerStyle = useMemo(
      (): ViewStyle => ({
        marginHorizontal: spacing.md,
        marginBottom: spacing.md,
      }),
      [],
    );

    const locationInfoStyle = useMemo(
      (): ViewStyle => ({
        marginHorizontal: 0,
      }),
      [],
    );

    const locationInfoContentStyle = useMemo(
      (): ViewStyle => ({
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.sm + 4,
      }),
      [],
    );

    const locationIconStyle = useMemo(
      (): ViewStyle => ({
        width: 44,
        height: 44,
        borderRadius: BorderRadius.md,
        backgroundColor: colors.primary.main + '1A',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.sm + 4,
      }),
      [colors.primary.main],
    );

    const locationIconTextStyle = useMemo(
      (): TextStyle => ({
        fontSize: typography.size.h3,
      }),
      [],
    );

    const locationTextStyle = useMemo(
      (): ViewStyle => ({
        flex: 1,
      }),
      [],
    );

    const locationInfoNameStyle = useMemo(
      (): TextStyle => ({
        color: colors.text.primary,
        fontSize: typography.size.body + 1,
        fontWeight: typography.weight.semibold,
        marginBottom: spacing.xs,
      }),
      [colors.text.primary],
    );

    const locationInfoAddressStyle = useMemo(
      (): TextStyle => ({
        color: colors.text.secondary,
        fontSize: typography.size.caption,
        lineHeight: 18,
      }),
      [colors.text.secondary],
    );

    return (
      <Animated.View
        entering={FadeInUp.duration(animation.duration.normal)}
        style={containerStyle}
      >
        <GlassCard style={locationInfoStyle} intensity="medium">
          <View style={locationInfoContentStyle}>
            <View style={locationIconStyle}>
              <Text style={locationIconTextStyle}>📍</Text>
            </View>
            <View style={locationTextStyle}>
              <Text style={locationInfoNameStyle}>
                {selectedLocation.name}
              </Text>
              <Text style={locationInfoAddressStyle}>
                {selectedLocation.address}
              </Text>
            </View>
          </View>
          {mode === 'select' && (
            <GlassButton
              title="确认选择"
              onPress={onConfirm}
              variant="primary"
              size="medium"
            />
          )}
        </GlassCard>
      </Animated.View>
    );
  });

SelectedLocationCard.displayName = 'SelectedLocationCard';
