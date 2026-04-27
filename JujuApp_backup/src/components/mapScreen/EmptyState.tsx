import React, { useRef, useEffect, useMemo } from 'react';
import { View, Text, Animated, ViewStyle, TextStyle } from 'react-native';
import { colors, spacing, typography } from '../../theme';

interface EmptyStateProps {
  icon?: string;
  title: string;
  message?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = React.memo(
  ({ icon = '📍', title, message }) => {
    const opacityAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;

    useEffect(() => {
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          damping: 12,
          stiffness: 100,
        }),
      ]).start();
    }, [opacityAnim, scaleAnim]);

    // 使用设计系统替代 StyleSheet.create
    const containerStyle = useMemo(
      (): ViewStyle => ({
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.xl * 2,
      }),
      [],
    );

    const iconContainerStyle = useMemo(
      (): ViewStyle => ({
        marginBottom: spacing.md,
      }),
      [],
    );

    const iconTextStyle = useMemo(
      (): TextStyle => ({
        fontSize: typography.size.display,
      }),
      [],
    );

    const titleStyle = useMemo(
      (): TextStyle => ({
        color: colors.text.primary,
        fontSize: typography.size.h3,
        fontWeight: typography.weight.semibold,
        marginBottom: spacing.xs,
        textAlign: 'center',
      }),
      [colors.text.primary],
    );

    const messageStyle = useMemo(
      (): TextStyle => ({
        color: colors.text.secondary,
        fontSize: typography.size.body,
        textAlign: 'center',
        paddingHorizontal: spacing.lg,
      }),
      [colors.text.secondary],
    );

    return (
      <Animated.View
        style={[
          containerStyle,
          {
            opacity: opacityAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View style={iconContainerStyle}>
          <Text style={iconTextStyle}>{icon}</Text>
        </View>
        <Text style={titleStyle}>{title}</Text>
        {message && <Text style={messageStyle}>{message}</Text>}
      </Animated.View>
    );
  },
);

EmptyState.displayName = 'EmptyState';
