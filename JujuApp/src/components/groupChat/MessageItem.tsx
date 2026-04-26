import React, { memo, useMemo } from 'react';
import { View, Text, Image, ImageStyle, ViewStyle, TextStyle } from 'react-native';
import Animated, {
  SlideInLeft,
  SlideInRight,

} from 'react-native-reanimated';
import { useTheme, spacing, BorderRadius, typography } from '../../theme';
import { GlassCard } from '../GlassCard';

export interface Message {
  id: string;
  content: string;
  is_self: boolean;
  userName: string;
  created_at: string;
  avatar?: string;
}

interface MessageItemProps {
  message: Message;
  index: number;
}

export const MessageItem: React.FC<MessageItemProps> = memo(
  ({ message }) => {
    const { colors } = useTheme();
    const { is_self, userName, content, avatar, created_at } = message;

    const enteringAnimation = is_self
      ? SlideInRight.duration(300)
      : SlideInLeft.duration(300);

    const formatTime = (dateStr: string): string => {
      const date = new Date(dateStr);
      return date.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
      });
    };

    const containerBaseStyle = useMemo(
      (): ViewStyle => ({
        flexDirection: 'row',
        marginBottom: spacing.lg,
        gap: spacing.sm,
        alignItems: 'flex-end',
      }),
      [],
    );

    const avatarStyle = useMemo(
      (): ImageStyle => ({
        width: 40,
        height: 40,
        borderRadius: BorderRadius.full,
        borderWidth: 2,
        borderColor: colors.background.primary,
      }),
      [colors.background.primary],
    );

    const contentContainerStyle = useMemo(
      (): ViewStyle => ({
        maxWidth: '70%',
      }),
      [],
    );

    const userNameStyle = useMemo(
      (): TextStyle => ({
        fontSize: typography.size.caption,
        marginBottom: spacing.xs,
        marginLeft: spacing.xs,
        fontWeight: typography.weight.medium,
        color: colors.text.tertiary,
      }),
      [colors.text.tertiary],
    );

    const bubbleBaseStyle = useMemo(
      (): ViewStyle => ({
        padding: 0,
        overflow: 'hidden',
        borderBottomRightRadius: BorderRadius.sm,
        borderBottomLeftRadius: BorderRadius.sm,
      }),
      [],
    );

    const bubbleSelfStyle = useMemo(
      (): ViewStyle => ({
        borderBottomRightRadius: BorderRadius.sm,
      }),
      [],
    );

    const bubbleOtherStyle = useMemo(
      (): ViewStyle => ({
        borderBottomLeftRadius: BorderRadius.sm,
      }),
      [],
    );

    const messageTextStyle = useMemo(
      (): TextStyle => ({
        fontSize: typography.size.body,
        padding: spacing.md,
        paddingBottom: spacing.xs,
        lineHeight: typography.size.body * typography.lineHeight.normal,
        color: is_self ? colors.text.inverse : colors.text.primary,
      }),
      [is_self, colors.text.inverse, colors.text.primary],
    );

    const timeTextStyle = useMemo(
      (): TextStyle => ({
        fontSize: typography.size.small,
        paddingHorizontal: spacing.md,
        paddingBottom: spacing.sm,
        textAlign: 'right',
        color: is_self ? colors.text.inverse : colors.text.tertiary,
        opacity: 0.7,
      }),
      [is_self, colors.text.inverse, colors.text.tertiary],
    );

    return (
      <Animated.View
        entering={enteringAnimation}
        style={[
          containerBaseStyle,
          is_self ? { flexDirection: 'row-reverse' } : { flexDirection: 'row' },
        ]}
      >
        {!is_self && (
          <Image
            source={{ uri: avatar || 'https://via.placeholder.com/40' }}
            style={avatarStyle}
          />
        )}

        <View style={contentContainerStyle}>
          {!is_self && (
            <Text style={userNameStyle}>{userName}</Text>
          )}

          <GlassCard
            style={[
              bubbleBaseStyle,
              is_self ? bubbleSelfStyle : bubbleOtherStyle,
            ]}
            intensity={is_self ? 'medium' : 'light'}
          >
            <Text style={messageTextStyle}>{content}</Text>
            <Text style={timeTextStyle}>{formatTime(created_at)}</Text>
          </GlassCard>
        </View>

        {is_self && (
          <Image
            source={{ uri: avatar || 'https://via.placeholder.com/40' }}
            style={avatarStyle}
          />
        )}
      </Animated.View>
    );
  },
);

MessageItem.displayName = 'MessageItem';

export default MessageItem;
