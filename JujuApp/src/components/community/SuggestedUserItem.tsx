import React, { useEffect, useMemo } from 'react';
import {View, Text, Image, ViewStyle, TextStyle, ImageStyle} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withSpring,
  withSequence,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { GlassCard } from '../GlassCard';
import { GlassButton } from '../GlassButton';
import { useTheme, spacing, typography, animation } from '../../theme';

export interface SuggestedUser {
  id: number;
  name: string;
  avatar: string;
  isVerified?: boolean;
}

interface SuggestedUserItemProps {
  user: SuggestedUser;
  index: number;
  onFollow?: (user: SuggestedUser) => void;
}

export const SuggestedUserItem: React.FC<SuggestedUserItemProps> = ({
  user,
  index,
  onFollow,
}) => {
  const { colors } = useTheme();
  const scale = useSharedValue(0.9);
  const opacity = useSharedValue(0);

  useEffect(() => {
    const delay = index * 60;
    scale.value = withDelay(delay, withSpring(1, animation.spring.bouncy));
    opacity.value = withDelay(delay, withSpring(1, animation.spring.gentle));
  }, [index, scale, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handleFollow = () => {
    scale.value = withSequence(
      withSpring(0.95, animation.spring.gentle),
      withSpring(1, animation.spring.bouncy),
    );
    onFollow?.(user);
  };

  const containerStyle = useMemo(
    (): ViewStyle => ({
      marginRight: spacing.md,
    }),
    [],
  );

  const cardStyle = useMemo(
    (): ViewStyle => ({
      width: 100,
      alignItems: 'center',
      padding: spacing.md,
    }),
    [],
  );

  const avatarContainerStyle = useMemo(
    (): ViewStyle => ({
      position: 'relative',
      marginBottom: spacing.sm,
    }),
    [],
  );

  const avatarStyle = useMemo(
    (): ImageStyle => ({
      width: spacing['3xl'],
      height: spacing['3xl'],
      borderRadius: spacing['2xl'],
      borderWidth: 2,
      borderColor: colors.primary.main,
    }),
    [colors.primary.main],
  );

  const verifiedBadgeStyle = useMemo(
    (): ViewStyle => ({
      position: 'absolute',
      bottom: -2,
      right: -2,
      width: spacing.md,
      height: spacing.md,
      borderRadius: spacing.sm,
      backgroundColor: colors.primary.main,
      alignItems: 'center',
      justifyContent: 'center',
    }),
    [colors.primary.main],
  );

  const nameStyle = useMemo(
    (): TextStyle => ({
      fontSize: typography.size.body2,
      fontWeight: typography.weight.semibold,
      color: colors.text.inverse,
      marginBottom: spacing.xs,
    }),
    [colors.text.inverse],
  );

  const followButtonStyle = useMemo(
    (): ViewStyle => ({
      marginTop: spacing.xs,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
    }),
    [],
  );

  return (
    <Animated.View style={[containerStyle, animatedStyle]}>
      <GlassCard style={cardStyle} intensity="light">
        <View style={avatarContainerStyle}>
          <Image source={{ uri: user.avatar }} style={avatarStyle} />
          {user.isVerified && (
            <View style={verifiedBadgeStyle}>
              <Ionicons
                name="checkmark"
                size={10}
                color={colors.text.inverse}
              />
            </View>
          )}
        </View>
        <Text style={nameStyle} numberOfLines={1}>
          {user.name}
        </Text>
        <GlassButton
          title="关注"
          onPress={handleFollow}
          variant="primary"
          size="small"
          style={followButtonStyle}
        />
      </GlassCard>
    </Animated.View>
  );
};

export default SuggestedUserItem;
