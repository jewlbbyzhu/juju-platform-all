import React, { useMemo } from 'react';
import {Text, ViewStyle, TextStyle} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme, spacing, typography, animation } from '../../theme';

interface CommunityHeaderProps {
  title?: string;
}

export const CommunityHeader: React.FC<CommunityHeaderProps> = ({
  title = '社区',
}) => {
  const { colors } = useTheme();

  const containerStyle = useMemo(
    (): ViewStyle => ({
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
    }),
    [],
  );

  const titleStyle = useMemo(
    (): TextStyle => ({
      fontSize: typography.size.h1,
      fontWeight: typography.weight.bold,
      color: colors.text.inverse,
      marginBottom: spacing.xs,
    }),
    [colors.text.inverse],
  );

  const subtitleStyle = useMemo(
    (): TextStyle => ({
      fontSize: typography.size.body2,
      color: colors.gray[400],
    }),
    [],
  );

  return (
    <Animated.View
      entering={FadeInDown.duration(animation.duration.normal).springify()}
      style={containerStyle}
    >
      <Text style={titleStyle}>{title}</Text>
      <Text style={subtitleStyle}>发现有趣的聚会</Text>
    </Animated.View>
  );
};

export default CommunityHeader;
