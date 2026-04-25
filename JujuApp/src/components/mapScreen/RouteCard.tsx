import React, { useMemo } from 'react';
import { View, Text, ViewStyle, TextStyle } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { GlassCard } from '../GlassCard';
import { RouteResult } from '../../api/map';
import { colors, spacing, typography, animation, BorderRadius } from '../../theme';

interface RouteCardProps {
  routeInfo: RouteResult;
  originName?: string;
  destinationName?: string;
}

export const RouteCard: React.FC<RouteCardProps> = React.memo(
  ({ routeInfo, originName = '起点', destinationName = '终点' }) => {
    // 使用设计系统替代 StyleSheet.create
    const containerStyle = useMemo(
      (): ViewStyle => ({
        marginHorizontal: spacing.md,
        marginBottom: spacing.md,
      }),
      [],
    );

    const contentStyle = useMemo(
      (): ViewStyle => ({
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.sm,
      }),
      [],
    );

    const iconContainerStyle = useMemo(
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

    const iconTextStyle = useMemo(
      (): TextStyle => ({
        fontSize: typography.size.h3,
      }),
      [],
    );

    const textContainerStyle = useMemo(
      (): ViewStyle => ({
        flex: 1,
      }),
      [],
    );

    const nameStyle = useMemo(
      (): TextStyle => ({
        color: colors.text.primary,
        fontSize: typography.size.body + 1,
        fontWeight: typography.weight.semibold,
        marginBottom: spacing.xs,
      }),
      [colors.text.primary],
    );

    const addressStyle = useMemo(
      (): TextStyle => ({
        color: colors.text.secondary,
        fontSize: typography.size.caption,
        lineHeight: 18,
      }),
      [colors.text.secondary],
    );

    const routeInfoStyle = useMemo(
      (): ViewStyle => ({
        marginTop: spacing.xs,
        paddingTop: spacing.xs,
        borderTopWidth: 1,
        borderTopColor: colors.divider,
      }),
      [colors.divider],
    );

    const routeTextStyle = useMemo(
      (): TextStyle => ({
        color: colors.text.secondary,
        fontSize: typography.size.caption,
      }),
      [colors.text.secondary],
    );

    const formatDistance = (meters: number): string => {
      if (meters >= 1000) {
        return `${(meters / 1000).toFixed(1)} km`;
      }
      return `${meters} m`;
    };

    return (
      <Animated.View entering={FadeInUp.duration(animation.duration.normal)}>
        <GlassCard style={containerStyle} intensity="medium">
          <View style={contentStyle}>
            <View style={iconContainerStyle}>
              <Text style={iconTextStyle}>📍</Text>
            </View>
            <View style={textContainerStyle}>
              <Text style={nameStyle}>{originName}</Text>
              <Text style={addressStyle}>{destinationName}</Text>
            </View>
          </View>
          {routeInfo.distance !== undefined &&
            routeInfo.duration !== undefined && (
              <View style={routeInfoStyle}>
                <Text style={routeTextStyle}>
                  距离 {formatDistance(routeInfo.distance)} · 约{' '}
                  {Math.round(routeInfo.duration / 60)} 分钟
                </Text>
              </View>
            )}
        </GlassCard>
      </Animated.View>
    );
  },
);

RouteCard.displayName = 'RouteCard';
