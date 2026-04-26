import React from 'react';
import {Text, ViewStyle, TextStyle} from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useTheme, animation, spacing, typography } from '../../theme';

interface ChatListEmptyProps {
  message?: string;
  subMessage?: string;
}

export const ChatListEmpty: React.FC<ChatListEmptyProps> = ({
  message = '暂无消息',
  subMessage = '开始和朋友们聊天吧',
}) => {
  const { colors } = useTheme();

  // 使用设计系统替代 StyleSheet
  const containerStyle: ViewStyle = {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['3xl'],
  };

  const iconStyle: TextStyle = {
    fontSize: typography.size.display,
    marginBottom: spacing.md,
  };

  const textStyle: TextStyle = {
    fontSize: typography.size.h3,
    fontWeight: typography.weight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  };

  const subTextStyle: TextStyle = {
    fontSize: typography.size.body2,
    color: colors.gray[500],
  };

  return (
    <Animated.View
      entering={FadeIn.duration(animation.duration.normal)}
      style={containerStyle}
    >
      <Text style={iconStyle}>💬</Text>
      <Text style={textStyle}>{message}</Text>
      <Text style={subTextStyle}>{subMessage}</Text>
    </Animated.View>
  );
};

export default ChatListEmpty;
