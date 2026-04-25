import React, { useEffect, useMemo } from 'react';
import { View, Text, ViewStyle, TextStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  withDelay,
  Easing,

} from 'react-native-reanimated';
import { useTheme, spacing, typography, animation } from '../../theme';

interface EmptyCommunityStateProps {
  type?: 'posts' | 'topics' | 'following';
}

export const EmptyCommunityState: React.FC<EmptyCommunityStateProps> = ({
  type = 'posts',
}) => {
  const { colors } = useTheme();
  const scale = useSharedValue(0.5);
  const bounce = useSharedValue(0);
  const rotate = useSharedValue(0);

  useEffect(() => {
    scale.value = withDelay(200, withSpring(1, animation.spring.bouncy));
    bounce.value = withRepeat(
      withSequence(
        withTiming(-10, { duration: 600, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 600, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );
    rotate.value = withRepeat(
      withSequence(
        withTiming(-5, { duration: 400 }),
        withTiming(5, { duration: 400 }),
      ),
      -1,
      true,
    );
  }, [scale, bounce, rotate]);

  const iconAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { translateY: bounce.value },
        { rotate: `${rotate.value}deg` },
      ],
    } as any;
  });

  const getContent = () => {
    switch (type) {
      case 'topics':
        return {
          icon: '🏷️',
          title: '暂无话题',
          subtitle: '快来创建第一个话题吧',
        };
      case 'following':
        return {
          icon: '👥',
          title: '暂无关注动态',
          subtitle: '关注更多用户，发现有趣内容',
        };
      default:
        return {
          icon: '📝',
          title: '暂无内容',
          subtitle: '还没有帖子，快来发布第一条动态',
        };
    }
  };

  const content = getContent();

  const containerStyle = useMemo(
    (): ViewStyle => ({
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing['4xl'],
    }),
    [],
  );

  const iconContainerStyle = useMemo(
    (): ViewStyle => ({
      marginBottom: spacing.lg,
    }),
    [],
  );

  const iconStyle = useMemo(
    (): TextStyle => ({
      fontSize: typography.size.display * 2,
    }),
    [],
  );

  const titleStyle = useMemo(
    (): TextStyle => ({
      fontSize: typography.size.h3,
      fontWeight: typography.weight.semibold,
      color: colors.text.inverse,
      marginBottom: spacing.sm,
    }),
    [colors.text.inverse],
  );

  const subtitleStyle = useMemo(
    (): TextStyle => ({
      fontSize: typography.size.body2,
      color: colors.gray[500],
      textAlign: 'center',
    }),
    [],
  );

  return (
    <View style={containerStyle}>
      <Animated.View style={[iconContainerStyle, iconAnimatedStyle]}>
        <Text style={iconStyle}>{content.icon}</Text>
      </Animated.View>
      <Text style={titleStyle}>{content.title}</Text>
      <Text style={subtitleStyle}>{content.subtitle}</Text>
    </View>
  );
};

export default EmptyCommunityState;
