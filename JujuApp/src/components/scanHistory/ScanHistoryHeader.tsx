import React from 'react';
import {Text, Pressable, ViewStyle, TextStyle} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme, spacing, typography, BorderRadius } from '../../theme';

interface ScanHistoryHeaderProps {
  title: string;
  onClear?: () => void;
  showClear?: boolean;
}

export const ScanHistoryHeader: React.FC<ScanHistoryHeaderProps> = ({
  title,
  onClear,
  showClear = false,
}) => {
  const { colors } = useTheme();

  // 使用设计系统替代 StyleSheet
  const containerStyle: ViewStyle = {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background.primary + 'F5',
    borderBottomColor: colors.border,
  };

  const titleStyle: TextStyle = {
    fontSize: typography.size.h3,
    fontWeight: typography.weight.bold,
    letterSpacing: 0.5,
    color: colors.text.primary,
  };

  const clearButtonStyle: ViewStyle = {
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.background.tertiary,
    borderRadius: BorderRadius.full,
    borderColor: colors.border,
  };

  const clearTextStyle: TextStyle = {
    fontSize: typography.size.caption,
    fontWeight: typography.weight.medium,
    color: colors.status.error,
  };

  return (
    <Animated.View
      entering={FadeInDown.duration(400).springify()}
      style={containerStyle}
    >
      <Text style={titleStyle}>{title}</Text>
      {showClear && onClear && (
        <Pressable style={clearButtonStyle} onPress={onClear}>
          <Text style={clearTextStyle}>清空</Text>
        </Pressable>
      )}
    </Animated.View>
  );
};

export default ScanHistoryHeader;
