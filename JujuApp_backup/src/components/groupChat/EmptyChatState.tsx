import React, { memo, useMemo } from 'react';
import {Text, ViewStyle, TextStyle} from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useTheme, spacing, typography } from '../../theme';

export const EmptyChatState: React.FC = memo(() => {
  const { colors } = useTheme();

  const containerStyle = useMemo(
    (): ViewStyle => ({
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: spacing['5xl'],
    }),
    [],
  );

  const iconStyle = useMemo(
    (): TextStyle => ({
      fontSize: 60,
      marginBottom: spacing.lg,
    }),
    [],
  );

  const textStyle = useMemo(
    (): TextStyle => ({
      fontSize: typography.size.body,
      fontWeight: typography.weight.medium,
      color: colors.text.tertiary,
    }),
    [colors.text.tertiary],
  );

  return (
    <Animated.View entering={FadeIn.duration(500)} style={containerStyle}>
      <Text style={iconStyle}>💬</Text>
      <Text style={textStyle}>暂无消息，开始聊天吧</Text>
    </Animated.View>
  );
});

EmptyChatState.displayName = 'EmptyChatState';

export default EmptyChatState;
