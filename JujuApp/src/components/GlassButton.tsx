import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  StyleProp,
  ActivityIndicator,
  View,
} from 'react-native';
import { colors } from '../theme/colors';
import { glow } from '../theme/glassmorphism';

// 简单的动画模拟 (不使用 reanimated，保持兼容性)
interface GlassButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'gradient' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  subtitle?: string;
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
  fullWidth = false,
  subtitle,
}) => {
  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: colors.primary.main,
          ...glow.primary,
        };
      case 'secondary':
        return {
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.2)',
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.2)',
        };
      case 'gradient':
        return {
          backgroundColor: colors.primary.main,
          ...glow.primary,
        };
      case 'danger':
        return {
          backgroundColor: colors.status.error,
          ...glow.error,
        };
      default:
        return { backgroundColor: colors.primary.main };
    }
  };

  const getSizeStyle = (): ViewStyle => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: 10,
          paddingHorizontal: 16,
          borderRadius: 12,
        };
      case 'large':
        return {
          paddingVertical: 18,
          paddingHorizontal: 32,
          borderRadius: 20,
        };
      default:
        return {
          paddingVertical: 14,
          paddingHorizontal: 24,
          borderRadius: 16,
        };
    }
  };

  const getTextSize = (): number => {
    switch (size) {
      case 'small':
        return 14;
      case 'large':
        return 18;
      default:
        return 16;
    }
  };

  const getTextColor = (): string => {
    if (variant === 'ghost') {
      return colors.text.primary;
    }
    return colors.text.inverse;
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        styles.button,
        getVariantStyle(),
        getSizeStyle(),
        fullWidth && styles.fullWidth,
        (disabled || loading) && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <View style={{ flexDirection: 'column', alignItems: 'center' }}>
            <Text
              style={[
                styles.text,
                { fontSize: getTextSize(), color: getTextColor() },
                textStyle,
              ]}
            >
              {title}
            </Text>
            {subtitle && (
              <Text
                style={{
                  fontSize: 12,
                  color: colors.text.secondary,
                  marginTop: 2,
                }}
              >
                {subtitle}
              </Text>
            )}
          </View>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  iconContainer: {
    marginRight: 8,
  },
});

export default GlassButton;
