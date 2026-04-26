import React, {useMemo} from 'react';
import {Text, Pressable, ViewStyle, TextStyle} from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useTheme, spacing, BorderRadius, typography } from '../../theme';

interface NotificationsHeaderProps {
  onSettingsPress?: () => void;
}

export const NotificationsHeader: React.FC<NotificationsHeaderProps> = ({
  onSettingsPress,
}) => {
  const { colors } = useTheme();

  const containerStyle = useMemo(
    (): ViewStyle => ({
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
    }),
    [],
  );

  const titleStyle = useMemo(
    (): TextStyle => ({
      fontSize: typography.size.h1,
      fontWeight: typography.weight.bold,
      color: colors.text.primary,
    }),
    [colors.text.primary],
  );

  const settingsButtonStyle = useMemo(
    (): ViewStyle => ({
      width: 44,
      height: 44,
      borderRadius: BorderRadius.full,
      backgroundColor: colors.gray[800],
      alignItems: 'center',
      justifyContent: 'center',
    }),
    [colors.gray[800]],
  );

  const settingsIconStyle = useMemo(
    (): TextStyle => ({
      fontSize: 20,
    }),
    [],
  );

  return (
    <Animated.View style={containerStyle} entering={FadeIn.duration(400)}>
      <Text style={titleStyle}>通知</Text>
      <Pressable style={settingsButtonStyle} onPress={onSettingsPress}>
        <Text style={settingsIconStyle}>⚙️</Text>
      </Pressable>
    </Animated.View>
  );
};

export default NotificationsHeader;
