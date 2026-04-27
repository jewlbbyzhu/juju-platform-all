import React, { useEffect, useRef, memo } from 'react';
import {Text, Animated, Easing} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme, spacing, BorderRadius, Shadows } from '../../theme';
import {
  SERVICE_AVATAR_INITIALS,
  SERVICE_NICKNAME,
  SERVICE_AVAILABLE_HOURS,
} from './types';

export const Header: React.FC = memo(() => {
  const { colors, textStyles, gradients } = useTheme();
  const avatarScale = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentTranslateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    const avatarAnimation = Animated.spring(avatarScale, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    });

    const contentAnimation = Animated.parallel([
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(contentTranslateY, {
        toValue: 0,
        duration: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]);

    Animated.sequence([avatarAnimation, contentAnimation]).start();
  }, [avatarScale, contentOpacity, contentTranslateY]);

  return (
    <LinearGradient
      colors={gradients.primary}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        padding: spacing['2xl'],
        alignItems: 'center',
        margin: spacing.lg,
        marginTop: 88,
        borderRadius: BorderRadius.xl,
        ...Shadows.large,
      }}
    >
      <Animated.View
        style={{
          width: 80,
          height: 80,
          borderRadius: BorderRadius.full,
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: spacing.md,
          backgroundColor: colors.text.inverse,
          shadowColor: colors.text.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 4,
          transform: [{ scale: avatarScale }],
        }}
      >
        <Text
          style={{
            fontSize: 28,
            fontWeight: '800',
            letterSpacing: 1,
            color: colors.primary.main,
          }}
        >
          {SERVICE_AVATAR_INITIALS}
        </Text>
      </Animated.View>

      <Animated.View
        style={{
          alignItems: 'center',
          opacity: contentOpacity,
          transform: [{ translateY: contentTranslateY }],
        }}
      >
        <Text
          style={[
            textStyles.h2,
            {
              color: colors.text.inverse,
              marginBottom: spacing.xs,
              letterSpacing: 0.5,
            },
          ]}
        >
          {SERVICE_NICKNAME}
        </Text>
        <Text
          style={[
            textStyles.caption,
            { color: colors.text.secondary },
          ]}
        >
          在线时间：{SERVICE_AVAILABLE_HOURS}
        </Text>
      </Animated.View>
    </LinearGradient>
  );
});

Header.displayName = 'CustomerServiceHeader';

export default Header;
