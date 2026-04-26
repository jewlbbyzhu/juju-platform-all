import React, { useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, ViewStyle, TextStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withSpring,
  SlideInRight,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import {
  useTheme,
  spacing,
  typography,
  animation,
  BorderRadius,
} from '../../theme';
import type { Tag } from '../../types/api';

interface TopicCardProps {
  topic: Tag;
  index: number;
  onPress?: (topic: Tag) => void;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export const TopicCard: React.FC<TopicCardProps> = ({
  topic,
  index,
  onPress,
}) => {
  const { colors } = useTheme();
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);

  useEffect(() => {
    const delay = index * 80;
    scale.value = withDelay(delay, withSpring(1, animation.spring.bouncy));
    opacity.value = withDelay(delay, withSpring(1, animation.spring.gentle));
  }, [index, scale, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePress = () => {
    onPress?.(topic);
  };

  const containerStyle = useMemo(
    (): ViewStyle => ({
      marginRight: spacing.md,
    }),
    [],
  );

  const gradientStyle = useMemo(
    (): ViewStyle => ({
      width: spacing['5xl'],
      height: spacing['5xl'],
      borderRadius: BorderRadius.lg,
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.sm,
    }),
    [],
  );

  const iconStyle = useMemo(
    (): TextStyle => ({
      fontSize: typography.size.h1,
      marginBottom: spacing.xs,
    }),
    [],
  );

  const nameStyle = useMemo(
    (): TextStyle => ({
      fontSize: typography.size.body2,
      fontWeight: typography.weight.semibold,
      color: colors.text.inverse,
      marginBottom: spacing.xs,
      textAlign: 'center',
    }),
    [colors.text.inverse],
  );

  const countStyle = useMemo(
    (): TextStyle => ({
      fontSize: typography.size.small,
      color: 'rgba(255, 255, 255, 0.6)',
    }),
    [],
  );

  const hotBadgeStyle = useMemo(
    (): ViewStyle => ({
      position: 'absolute',
      top: spacing.sm,
      right: spacing.sm,
    }),
    [],
  );

  const hotBadgeTextStyle = useMemo(
    (): TextStyle => ({
      fontSize: typography.size.body2,
    }),
    [],
  );

  return (
    <AnimatedTouchable
      entering={SlideInRight.delay(index * 80).duration(
        animation.duration.normal,
      )}
      style={[containerStyle, animatedStyle]}
      onPress={handlePress}
      activeOpacity={0.9}
    >
      <LinearGradient
        colors={
          topic.isHot
            ? colors.primary.gradient
            : [colors.gray[700], colors.gray[800]]
        }
        style={gradientStyle}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={iconStyle}>{topic.icon || '🏷️'}</Text>
        <Text style={nameStyle}>{topic.name}</Text>
        <Text style={countStyle}>{topic.count || 0}人参与</Text>
        {topic.isHot && (
          <View style={hotBadgeStyle}>
            <Text style={hotBadgeTextStyle}>🔥</Text>
          </View>
        )}
      </LinearGradient>
    </AnimatedTouchable>
  );
};

export default TopicCard;
