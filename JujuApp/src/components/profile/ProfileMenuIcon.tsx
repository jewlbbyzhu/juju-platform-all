import React, { useMemo } from 'react';
import {View, Text, ViewStyle} from 'react-native';
import Animated, {
  useAnimatedStyle,

  useSharedValue,
} from 'react-native-reanimated';
import {colors, gradients} from '../../theme';
import {Shadows} from '../../theme/shadows';

export type MenuIconColorScheme =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'info'
  | 'gold';

interface ProfileMenuIconProps {
  icon: string;
  colorScheme?: MenuIconColorScheme;
  size?: 'small' | 'medium' | 'large';
  animated?: boolean;
}

const COLOR_SCHEMES: Record<
  MenuIconColorScheme,
  { background: string; gradient?: [string, string] }
> = {
  primary: { background: colors.primary.main + '15', gradient: gradients.warm },
  secondary: {
    background: colors.secondary.main + '15',
    gradient: gradients.secondary,
  },
  success: { background: colors.status.success + '15' },
  warning: { background: colors.accent.orange + '15' },
  info: { background: colors.status.info + '15' },
  gold: { background: colors.accent.gold + '15', gradient: gradients.vip },
};

const SIZE_CONFIG = {
  small: { container: 32, icon: 16, borderRadius: 8 },
  medium: { container: 40, icon: 20, borderRadius: 10 },
  large: { container: 48, icon: 24, borderRadius: 12 },
};

const MENU_ICON_COLORS: MenuIconColorScheme[] = [
  'primary',
  'secondary',
  'success',
  'info',
  'warning',
  'gold',
];

export const getMenuIconColorScheme = (index: number): MenuIconColorScheme => {
  return MENU_ICON_COLORS[index % MENU_ICON_COLORS.length];
};

const AnimatedView = Animated.createAnimatedComponent(View);

export const ProfileMenuIcon: React.FC<ProfileMenuIconProps> = React.memo(
  ({ icon, colorScheme = 'primary', size = 'medium', animated = false }) => {
    const scale = useSharedValue(1);
    const sizeConfig = SIZE_CONFIG[size];
    const colorConfig = COLOR_SCHEMES[colorScheme];

    const animatedStyle = useAnimatedStyle(() => {
      return {
        transform: [{ scale: scale.value }],
      };
    });

    const containerStyle = useMemo(
      (): ViewStyle => ({
        width: sizeConfig.container,
        height: sizeConfig.container,
        borderRadius: sizeConfig.borderRadius,
        backgroundColor: colorConfig.background,
        justifyContent: 'center' as const,
        alignItems: 'center' as const,
        ...Shadows.small,
      }),
      [sizeConfig, colorConfig],
    );

    const iconStyle = useMemo(
      () => ({
        fontSize: sizeConfig.icon,
      }),
      [sizeConfig],
    );

    if (animated) {
      return (
        <AnimatedView style={[containerStyle, animatedStyle]}>
          <Text style={iconStyle}>{icon}</Text>
        </AnimatedView>
      );
    }

    return (
      <View style={containerStyle}>
        <Text style={iconStyle}>{icon}</Text>
      </View>
    );
  },
);

ProfileMenuIcon.displayName = 'ProfileMenuIcon';

export default ProfileMenuIcon;
