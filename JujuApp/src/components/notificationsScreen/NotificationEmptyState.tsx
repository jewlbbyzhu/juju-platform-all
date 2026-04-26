import React, {useMemo} from 'react';
import {Text, ViewStyle, TextStyle} from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useTheme, spacing, typography } from '../../theme';

interface NotificationEmptyStateProps {
  isUnread?: boolean;
}

export const NotificationEmptyState: React.FC<NotificationEmptyStateProps> = ({
  isUnread = false,
}) => {
  const { colors } = useTheme();

  const containerStyle = useMemo(
    (): ViewStyle => ({
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing['5xl'],
    }),
    [],
  );

  const iconStyle = useMemo(
    (): TextStyle => ({
      fontSize: 48,
      marginBottom: spacing.md,
    }),
    [],
  );

  const titleStyle = useMemo(
    (): TextStyle => ({
      fontSize: typography.size.h3,
      fontWeight: typography.weight.semibold,
      color: colors.text.primary,
      marginBottom: spacing.sm,
    }),
    [colors.text.primary],
  );

  const subtextStyle = useMemo(
    (): TextStyle => ({
      fontSize: typography.size.body2,
      color: colors.gray[500],
      textAlign: 'center',
    }),
    [colors.gray[500]],
  );

  return (
    <Animated.View
      style={containerStyle}
      entering={FadeIn.duration(400).delay(200)}
    >
      <Text style={iconStyle}>{isUnread ? '🎉' : '🔔'}</Text>
      <Text style={titleStyle}>{isUnread ? '暂无未读消息' : '暂无通知'}</Text>
      <Text style={subtextStyle}>
        {isUnread ? '太棒了！您已读完所有消息' : '这里会显示您的通知消息'}
      </Text>
    </Animated.View>
  );
};

export default NotificationEmptyState;
