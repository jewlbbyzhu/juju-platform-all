import React, { useMemo, memo } from 'react';
import { View, Text, Image, Pressable, ViewStyle, TextStyle, ImageStyle } from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import { GlassCard } from '../GlassCard';
import {
  useTheme,
  gradients,
  animation,
  spacing,
  BorderRadius,
  typography,
} from '../../theme';
import type { Conversation } from '../../types';

interface ChatListItemProps {
  item: Conversation;
  index: number;
  onPress: (item: Conversation) => void;
}

const formatTime = (timeStr?: string): string => {
  if (!timeStr) return '';
  const date = new Date(timeStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) {
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } else if (days === 1) {
    return '昨天';
  } else if (days < 7) {
    return ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][
      date.getDay()
    ];
  } else {
    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
    });
  }
};

export const ChatListItem: React.FC<ChatListItemProps> = memo(
  ({ item, index, onPress }) => {
    const { colors } = useTheme();
    const isGroup = item.type === 'group';
    const hasUnread = (item.unread_count || 0) > 0;
    const avatarUri = useMemo(
      () =>
        item.avatar ||
        `https://i.pravatar.cc/150?img=${(Number(item.id) % 70) + 1}`,
      [item.avatar, item.id],
    );

    // 使用设计系统替代 StyleSheet
    const containerStyle: ViewStyle = {
      marginBottom: spacing.sm + 4,
    };

    const cardStyle: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing.md,
    };

    const avatarContainerStyle: ViewStyle = {
      position: 'relative',
      marginRight: spacing.md,
    };

    const avatarStyle: ImageStyle = {
      width: 56,
      height: 56,
      borderRadius: BorderRadius.full,
      borderWidth: 2,
      borderColor: colors.gray[700],
    };

    const badgeStyle: ViewStyle = {
      position: 'absolute',
      top: -4,
      right: -4,
      minWidth: 20,
      height: 20,
      borderRadius: BorderRadius.full,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: spacing.xs,
    };

    const badgeTextStyle: TextStyle = {
      fontSize: typography.size.small + 1,
      fontWeight: typography.weight.bold,
      color: colors.text.inverse,
    };

    const groupIndicatorStyle: ViewStyle = {
      position: 'absolute',
      bottom: -2,
      right: -2,
      width: 20,
      height: 20,
      borderRadius: BorderRadius.full,
      backgroundColor: colors.secondary.main,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: colors.gray[900],
    };

    const groupIndicatorTextStyle: TextStyle = {
      fontSize: typography.size.small,
    };

    const contentContainerStyle: ViewStyle = {
      flex: 1,
    };

    const headerRowStyle: ViewStyle = {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.xs + 2,
    };

    const nameStyle: TextStyle = {
      fontSize: typography.size.body,
      fontWeight: typography.weight.semibold,
      color: colors.text.primary,
      flex: 1,
      marginRight: spacing.sm,
    };

    const timeStyle: TextStyle = {
      fontSize: typography.size.caption,
      color: colors.gray[500],
    };

    const messageStyle: TextStyle = {
      fontSize: typography.size.body2,
      color: colors.gray[400],
    };

    const unreadMessageStyle: TextStyle = {
      color: colors.text.primary,
      fontWeight: typography.weight.medium,
    };

    return (
      <Animated.View
        entering={FadeInRight.delay(index * 50).duration(
          animation.duration.normal,
        )}
      >
        <Pressable
          onPress={() => onPress(item)}
          style={containerStyle}
        >
          <GlassCard style={cardStyle} intensity="light">
            <View style={avatarContainerStyle}>
              <Image source={{ uri: avatarUri }} style={avatarStyle} />
              {hasUnread && (
                <LinearGradient colors={gradients.primary} style={badgeStyle}>
                  <Text style={badgeTextStyle}>
                    {item.unread_count! > 99 ? '99+' : item.unread_count}
                  </Text>
                </LinearGradient>
              )}
              {isGroup && (
                <View style={groupIndicatorStyle}>
                  <Text style={groupIndicatorTextStyle}>👥</Text>
                </View>
              )}
            </View>

            <View style={contentContainerStyle}>
              <View style={headerRowStyle}>
                <Text style={nameStyle} numberOfLines={1}>
                  {item.name || '未知用户'}
                </Text>
                <Text style={timeStyle}>
                  {formatTime(item.last_message_time)}
                </Text>
              </View>

              <Text
                style={[messageStyle, hasUnread && unreadMessageStyle]}
                numberOfLines={1}
              >
                {item.last_message || '暂无消息'}
              </Text>
            </View>
          </GlassCard>
        </Pressable>
      </Animated.View>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.item.id === nextProps.item.id &&
      prevProps.item.unread_count === nextProps.item.unread_count &&
      prevProps.item.last_message === nextProps.item.last_message &&
      prevProps.item.last_message_time === nextProps.item.last_message_time
    );
  },
);

export default ChatListItem;
