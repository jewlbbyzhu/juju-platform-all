import React, { useState, useCallback } from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TextInputProps,
} from 'react-native';
import { colors, spacing, BorderRadius, typography } from '../theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  labelStyle?: TextStyle;
  inputStyle?: ViewStyle;
  errorStyle?: TextStyle;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  helperText?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  containerStyle,
  labelStyle,
  inputStyle,
  errorStyle,
  leftIcon,
  rightIcon,
  helperText,
  editable = true,
  ...textInputProps
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = useCallback((e: any) => {
    setIsFocused(true);
    textInputProps.onFocus?.(e);
  }, [textInputProps.onFocus]);

  const handleBlur = useCallback((e: any) => {
    setIsFocused(false);
    textInputProps.onBlur?.(e);
  }, [textInputProps.onBlur]);

  const getBorderColor = () => {
    if (!editable) return colors.gray[200];
    if (error) return colors.status.error;
    if (isFocused) return colors.primary.main;
    return colors.gray[300];
  };

  const getBackgroundColor = () => {
    if (!editable) return colors.gray[50];
    return colors.background.input;
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, labelStyle]}>
          {label}
        </Text>
      )}
      <View
        style={[
          styles.inputWrapper,
          {
            borderColor: getBorderColor(),
            backgroundColor: getBackgroundColor(),
          },
          !editable && styles.inputDisabled,
        ]}
      >
        {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
        <TextInput
          style={[
            styles.input,
            {
              color: editable ? colors.text.primary : colors.text.disabled,
            },
            inputStyle,
          ]}
          placeholderTextColor={colors.text.tertiary}
          onFocus={handleFocus}
          onBlur={handleBlur}
          editable={editable}
          {...textInputProps}
        />
        {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
      </View>
      {error ? (
        <Text style={[styles.error, errorStyle]}>{error}</Text>
      ) : helperText ? (
        <Text style={styles.helper}>{helperText}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: typography.size.body2,
    fontWeight: typography.weight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: BorderRadius.md,
    backgroundColor: colors.background.input,
    minHeight: 48,
  },
  input: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.size.body,
    fontWeight: typography.weight.regular,
  },
  inputDisabled: {
    opacity: 0.6,
  },
  iconLeft: {
    paddingLeft: spacing.md,
  },
  iconRight: {
    paddingRight: spacing.md,
  },
  error: {
    fontSize: typography.size.caption,
    color: colors.status.error,
    marginTop: spacing.xs,
  },
  helper: {
    fontSize: typography.size.caption,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },
});

export default Input;
