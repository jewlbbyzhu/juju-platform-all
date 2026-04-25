import React, { memo } from 'react';
import { Text, StyleSheet } from 'react-native';
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useTheme, spacing } from '../../theme';

type TabType = 'followers' | 'following';

interface EmptySocialStateProps {
  tab: TabType;
}

const EmptySocialStateComponent: React.FC<EmptySocialStateProps> = ({
  tab,
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.6);

  React.useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1500 }),
        withTiming(1, { duration: 1500 }),
      ),
      -1,
      true,
    );
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 1500 }),
        withTiming(0.6, { duration: 1500 }),
      ),
      -1,
      true,
    );
  }, [scale, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const content =
    tab === 'followers'
      ? {
          icon: '👥',
          title: '暂无粉丝',
          subtitle: '快去发布精彩聚会吧',
        }
      : {
          icon: '🔍',
          title: '暂无关注',
          subtitle: '去发现更多有趣的人',
        };

  return (
    <Animated.View
      style={styles.container}
      entering={FadeIn.delay(200).duration(400)}
    >
      <Animated.Text style={[styles.icon, animatedStyle]}>
        {content.icon}
      </Animated.Text>
      <Text style={styles.title}>{content.title}</Text>
      <Text style={styles.subtitle}>{content.subtitle}</Text>
    </Animated.View>
  );
};

const createStyles = (colors: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 60,
    },
    icon: {
      fontSize: 56,
      marginBottom: spacing.lg,
    },
    title: {
      fontSize: 17,
      fontWeight: '600',
      marginBottom: spacing.sm,
      color: colors.text.secondary,
    },
    subtitle: {
      fontSize: 14,
      color: colors.text.tertiary,
    },
  });

export const EmptySocialState = memo(EmptySocialStateComponent);
