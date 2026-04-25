import React from 'react';
import { Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '../../theme';
import { BorderRadius } from '../../theme/shadows';

interface VerifyCodeInputProps {
  value: string;
  onChangeText: (text: string) => void;
  countdown: number;
  isLoading: boolean;
  onSendCode: () => void;
}

export const VerifyCodeInput: React.FC<VerifyCodeInputProps> = React.memo(
  ({ value, onChangeText, countdown, isLoading, onSendCode }) => {
    const { colors, gradients, animation } = useTheme();
    const inputRef = React.useRef<TextInput>(null);
    const isFocused = useSharedValue(0);

    const animatedStyle = useAnimatedStyle(() => ({
      borderColor: isFocused.value === 1 ? colors.primary.main : colors.border,
      borderWidth: withTiming(isFocused.value === 1 ? 2 : 1, {
        duration: animation?.duration?.fast || 150,
      }),
    }));

    const handleFocus = () => {
      isFocused.value = 1;
    };

    const handleBlur = () => {
      isFocused.value = 0;
    };

    const isDisabled = countdown > 0 || isLoading;
    const gradientColors =
      countdown > 0
        ? [colors.gray[400], colors.gray[400]]
        : [...gradients.primary];

    return (
      <Animated.View style={[styles.inputWrapper, animatedStyle]}>
        <TextInput
          ref={inputRef}
          style={[
            styles.input,
            styles.codeInput,
            { color: colors.text.primary },
          ]}
          placeholder="请输入验证码"
          placeholderTextColor={colors.text.tertiary}
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          keyboardType="number-pad"
          maxLength={6}
          returnKeyType="done"
        />
        <TouchableOpacity
          style={[styles.codeBtn, isDisabled && { opacity: 0.6 }]}
          onPress={onSendCode}
          disabled={isDisabled}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.codeBtnGradient}
          >
            <Text style={[styles.codeBtnText, { color: colors.text.inverse }]}>
              {countdown > 0 ? `${countdown}s` : '获取验证码'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  },
);

const styles = StyleSheet.create({
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    backgroundColor: '#F8F9FA',
    borderRadius: BorderRadius.sm,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    fontSize: 16,
    letterSpacing: 0.5,
  },
  codeInput: {
    marginRight: 12,
  },
  codeBtn: {
    borderRadius: BorderRadius.xs,
    overflow: 'hidden',
  },
  codeBtnGradient: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BorderRadius.xs,
  },
  codeBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
