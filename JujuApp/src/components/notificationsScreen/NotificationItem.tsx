import React, { useMemo } from 'react';
import { View, Text, ViewStyle, TextStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withSpring,
  FadeInDown,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import { GlassCard } from '../GlassCard';
import { useTheme, spacing, BorderRadius, typography } from '../../theme';

export type NotificationType =
  | 'order'
  | 'ticket'
  | 'party'
  | 'system'
  | 'wallet'
  | 'social';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  is_read: boolean;
  created_at: string;
  related_id?: string;
  icon?: string;
}

interface NotificationConfig {
  icon: string;
  gradient: readonly string[];
  label: string;
}

const NOTIFICATION_CONFIG: Record<NotificationType, NotificationConfig> = {
  order: { icon: '📦', gradient: ['#FF4D6D', '#FF8FA3'], label: '订单' },
  ticket: { icon: '🎫', gradient: ['#FF4D6D', '#FF8FA3'], label: '票务' },
  party: { icon: '🎉', gradient: ['#FF4D6D', '#FF8FA3'], label: '聚会' },
  system: { icon: '🔔', gradient: ['#7B61FF', '#A78BFA'], label: '系统' },
  wallet: { icon: '💰', gradient: ['#7B61FF', '#A78BFA'], label: '钱包' },
  social: { icon: '💬', gradient: ['#FF4D6D', '#FF8FA3'], label: '社交' },
};

interface NotificationItemProps {
  item: Notification;
  index: number;
}

const UnreadDot: React.FC = () => {
  const { colors } = useTheme();
  const scale = useSharedValue(1);

  React.useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withSpring(1.3, { damping: 10, stiffness: 400 }),
        withSpring(1, { damping: 10, stiffness: 400 }),
      ),
      -1,
      true,
    );
  }, [scale]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const unreadDotStyle = useMemo(
    (): ViewStyle => ({
      width: 12,
      height: 12,
      borderRadius: BorderRadius.full,
      backgroundColor: colors.primary.main,
      alignItems: 'center',
      justifyContent: 'center',
    }),
    [colors.primary.main],
  );

  const unreadDotInnerStyle = useMemo(
    (): ViewStyle => ({
      width: 6,
      height: 6,
      borderRadius: BorderRadius.full,
      backgroundColor: colors.text.inverse,
    }),
    [colors.text.inverse],
  );

  return (
    <Animated.View style={[unreadDotStyle, animatedStyle]}>
      <View style={unreadDotInnerStyle} />
    </Animated.View>
  );
};

export const NotificationItem: React.FC<NotificationItemProps> = ({
  item,
  index,
}) => {
  const { colors, gradients } = useTheme();
  const config = NOTIFICATION_CONFIG[item.type] || {
    icon: '📢',
    gradient: gradients.primary,
    label: '通知',
  };

  const timeAgo = useMemo(() => {
    const now = Date.now();
    const created = new Date(item.created_at).getTime();
    const diff = now - created;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    return `${days}天前`;
  }, [item.created_at]);

  const containerStyle = useMemo(
    (): ViewStyle => ({
      marginBottom: spacing.sm + 4,
    }),
    [],
  );

  const cardStyle = useMemo(
    (): ViewStyle => ({
      marginVertical: 0,
      padding: 0,
    }),
    [],
  );

  const unreadCardStyle = useMemo(
    (): ViewStyle => ({
      borderLeftWidth: 3,
      borderLeftColor: colors.primary.main,
    }),
    [colors.primary.main],
  );

  const contentStyle = useMemo(
    (): ViewStyle => ({
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing.md,
    }),
    [],
  );

  const iconWrapperStyle = useMemo(
    (): ViewStyle => ({
      position: 'relative',
      marginRight: spacing.sm + 4,
    }),
    [],
  );

  const iconGradientStyle = useMemo(
    (): ViewStyle => ({
      width: 48,
      height: 48,
      borderRadius: BorderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
    }),
    [],
  );

  const iconTextStyle = useMemo(
    (): TextStyle => ({
      fontSize: 24,
    }),
    [],
  );

  const unreadBadgeStyle = useMemo(
    (): ViewStyle => ({
      position: 'absolute',
      top: -2,
      right: -2,
    }),
    [],
  );

  const textContentStyle = useMemo(
    (): ViewStyle => ({
      flex: 1,
    }),
    [],
  );

  const headerRowStyle = useMemo(
    (): ViewStyle => ({
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 6,
    }),
    [],
  );

  const typeTagStyle = useMemo(
    (): ViewStyle => ({
      backgroundColor: colors.gray[700],
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
      borderRadius: BorderRadius.xs,
      marginRight: spacing.sm,
    }),
    [colors.gray[700]],
  );

  const typeTagTextStyle = useMemo(
    (): TextStyle => ({
      fontSize: typography.size.small + 1,
      fontWeight: typography.weight.semibold,
      color: colors.gray[400],
    }),
    [colors.gray[400]],
  );

  const timeStyle = useMemo(
    (): TextStyle => ({
      fontSize: typography.size.caption,
      color: colors.gray[500],
    }),
    [colors.gray[500]],
  );

  const titleStyle = useMemo(
    (): TextStyle => ({
      fontSize: typography.size.body2 + 1,
      fontWeight: typography.weight.semibold,
      color: colors.text.primary,
      marginBottom: 4,
    }),
    [colors.text.primary],
  );

  const messageStyle = useMemo(
    (): TextStyle => ({
      fontSize: typography.size.body2 - 1,
      color: colors.gray[400],
      lineHeight: 18,
    }),
    [colors.gray[400]],
  );

  return (
    <Animated.View
      style={containerStyle}
      entering={FadeInDown.delay(index * 60).springify()}
    >
      <GlassCard
        style={[cardStyle, !item.is_read && unreadCardStyle]}
        intensity="light"
      >
        <View style={contentStyle}>
          <View style={iconWrapperStyle}>
            <LinearGradient
              colors={[...config.gradient]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={iconGradientStyle}
            >
              <Text style={iconTextStyle}>{config.icon}</Text>
            </LinearGradient>
            {!item.is_read && (
              <View style={unreadBadgeStyle}>
                <UnreadDot />
              </View>
            )}
          </View>

          <View style={textContentStyle}>
            <View style={headerRowStyle}>
              <View style={typeTagStyle}>
                <Text style={typeTagTextStyle}>{config.label}</Text>
              </View>
              <Text style={timeStyle}>{timeAgo}</Text>
            </View>
            <Text style={titleStyle} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={messageStyle} numberOfLines={2}>
              {item.message}
            </Text>
          </View>
        </View>
      </GlassCard>
    </Animated.View>
  );
};

export default NotificationItem;
