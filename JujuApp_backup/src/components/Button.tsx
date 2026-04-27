import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { colors, spacing, BorderRadius, typography } from '../theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large' | 'full';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
  iconPosition = 'left',
}) => {
  const getBackgroundColor = () => {
    if (disabled) return colors.gray[300];
    switch (variant) {
      case 'primary':
        return colors.primary.main;
      case 'secondary':
        return colors.secondary.main;
      case 'outline':
      case 'ghost':
        return 'transparent';
      default:
        return colors.primary.main;
    }
  };

  const getTextColor = () => {
    if (disabled) return colors.gray[500];
    switch (variant) {
      case 'outline':
        return colors.primary.main;
      case 'ghost':
        return colors.primary.main;
      default:
        return colors.text.inverse;
    }
  };

  const getPadding = () => {
    switch (size) {
      case 'small':
        return { paddingVertical: spacing.sm, paddingHorizontal: spacing.md };
      case 'large':
        return { paddingVertical: spacing.lg, paddingHorizontal: spacing['2xl'] };
      case 'full':
        return { paddingVertical: spacing.md, paddingHorizontal: spacing.lg };
      default:
        return { paddingVertical: spacing.md, paddingHorizontal: spacing.lg };
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'small':
        return typography.size.caption;
      case 'large':
        return typography.size.h4;
      default:
        return typography.size.body;
    }
  };

  const getBorderRadius = () => {
    switch (size) {
      case 'small':
        return BorderRadius.sm;
      case 'full':
        return BorderRadius.xl;
      default:
        return BorderRadius.md;
    }
  };

  const content = (
    <>
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <>
          {icon && iconPosition === 'left' && <View style={styles.iconLeft}>{icon}</View>}
          <Text
            style={[
              styles.text,
              {
                color: getTextColor(),
                fontSize: getFontSize(),
              },
              textStyle,
            ]}
          >
            {title}
          </Text>
          {icon && iconPosition === 'right' && <View style={styles.iconRight}>{icon}</View>}
        </>
      )}
    </>
  );

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
          ...getPadding(),
          borderRadius: getBorderRadius(),
          borderWidth: variant === 'outline' ? 2 : 0,
          borderColor: disabled ? colors.gray[300] : colors.primary.main,
          width: size === 'full' ? '100%' : undefined,
        },
        style,
      ]}
    >
      {content}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: typography.weight.semibold,
  },
  iconLeft: {
    marginRight: spacing.xs,
  },
  iconRight: {
    marginLeft: spacing.xs,
  },
});

export default Button;
