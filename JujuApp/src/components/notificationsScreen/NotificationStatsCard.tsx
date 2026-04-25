import React, {useMemo} from 'react';
import { View, Text, Pressable, ViewStyle, TextStyle } from 'react-native';
import Animated, {
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withDelay,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import { GlassCard } from '../GlassCard';
import { useTheme, spacing, BorderRadius, typography, animation } from '../../theme';

interface NotificationStatsCardProps {
  unreadCount: number;
  onMarkAllRead: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const NotificationStatsCard: React.FC<NotificationStatsCardProps> = ({
  unreadCount,
  onMarkAllRead,
}) => {
  const { colors } = useTheme();
  const scale = useSharedValue(0.95);

  React.useEffect(() => {
    scale.value = withDelay(200, withSpring(1, animation.spring.gentle));
  }, [scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSequence(
      withSpring(0.95, animation.spring.stiff),
      withSpring(1, animation.spring.gentle),
    );
  };

  const containerStyle = useMemo(
    (): ViewStyle => ({
      marginBottom: spacing.lg,
    }),
    [],
  );

  const cardStyle = useMemo(
    (): ViewStyle => ({
      marginVertical: 0,
      padding: 0,
      overflow: 'hidden',
    }),
    [],
  );

  const gradientStyle = useMemo(
    (): ViewStyle => ({
      borderRadius: BorderRadius.lg,
    }),
    [],
  );

  const contentStyle = useMemo(
    (): ViewStyle => ({
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: spacing.lg,
    }),
    [],
  );

  const unreadInfoStyle = useMemo(
    (): ViewStyle => ({
      flexDirection: 'row',
      alignItems: 'baseline',
    }),
    [],
  );

  const unreadNumberStyle = useMemo(
    (): TextStyle => ({
      fontSize: 36,
      fontWeight: typography.weight.bold,
      color: colors.primary.main,
      marginRight: spacing.sm,
    }),
    [colors.primary.main],
  );

  const unreadLabelStyle = useMemo(
    (): TextStyle => ({
      fontSize: typography.size.body,
      color: colors.gray[500],
      fontWeight: typography.weight.medium,
    }),
    [colors.gray[500]],
  );

  const readAllButtonStyle = useMemo(
    (): ViewStyle => ({
      backgroundColor: colors.primary.main + '20',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: BorderRadius.full,
      borderWidth: 1,
      borderColor: colors.primary.main + '30',
    }),
    [colors.primary.main],
  );

  const readAllTextStyle = useMemo(
    (): TextStyle => ({
      fontSize: typography.size.body2,
      fontWeight: typography.weight.semibold,
      color: colors.primary.main,
    }),
    [colors.primary.main],
  );

  return (
    <Animated.View
      style={[containerStyle, animatedStyle]}
      entering={FadeIn.duration(400).delay(100)}
    >
      <GlassCard style={cardStyle} intensity="medium">
        <LinearGradient
          colors={[colors.primary.main + '20', colors.primary.light + '10']}
          style={gradientStyle}
        >
          <View style={contentStyle}>
            <View style={unreadInfoStyle}>
              <Text style={unreadNumberStyle}>{unreadCount}</Text>
              <Text style={unreadLabelStyle}>未读消息</Text>
            </View>
            <AnimatedPressable
              style={readAllButtonStyle}
              onPress={onMarkAllRead}
              onPressIn={handlePressIn}
            >
              <Text style={readAllTextStyle}>全部已读</Text>
            </AnimatedPressable>
          </View>
        </LinearGradient>
      </GlassCard>
    </Animated.View>
  );
};

export default NotificationStatsCard;
