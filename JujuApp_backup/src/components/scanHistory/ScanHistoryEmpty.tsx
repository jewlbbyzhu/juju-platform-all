import React from 'react';
import { View, Text, ViewStyle, TextStyle } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useTheme, spacing, typography, BorderRadius } from '../../theme';

interface ScanHistoryEmptyProps {
  icon?: string;
  title?: string;
  subtitle?: string;
}

export const ScanHistoryEmpty: React.FC<ScanHistoryEmptyProps> = ({
  icon = '📱',
  title = '暂无扫码记录',
  subtitle = '扫描二维码、票券或邀请码后将显示在这里',
}) => {
  const { colors } = useTheme();

  // 使用设计系统替代 StyleSheet
  const containerStyle: ViewStyle = {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: spacing['5xl'],
    paddingHorizontal: spacing['3xl'],
  };

  const iconContainerStyle: ViewStyle = {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
    borderWidth: 1,
    width: 100,
    height: 100,
    borderRadius: BorderRadius.full,
    backgroundColor: colors.background.tertiary,
    borderColor: colors.border,
  };

  const iconStyle: TextStyle = {
    fontSize: typography.size.display,
  };

  const titleStyle: TextStyle = {
    fontSize: typography.size.h3,
    fontWeight: typography.weight.semibold,
    textAlign: 'center',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  };

  const subtitleStyle: TextStyle = {
    fontSize: typography.size.body2,
    textAlign: 'center',
    color: colors.text.secondary,
    lineHeight: typography.size.body2 * typography.lineHeight.normal,
  };

  return (
    <Animated.View entering={FadeIn.duration(500)} style={containerStyle}>
      <View style={iconContainerStyle}>
        <Text style={iconStyle}>{icon}</Text>
      </View>
      <Text style={titleStyle}>{title}</Text>
      <Text style={subtitleStyle}>{subtitle}</Text>
    </Animated.View>
  );
};

export default ScanHistoryEmpty;
