import React from 'react';
import { Text, TextInput, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '../../theme';
import { BorderRadius } from '../../theme/shadows';

interface PhoneInputProps {
  value: string;
  onChangeText: (text: string) => void;
}

export const PhoneInput: React.FC<PhoneInputProps> = React.memo(
  ({ value, onChangeText }) => {
    const { colors, animation } = useTheme();
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

    return (
      <Animated.View style={[styles.inputWrapper, animatedStyle]}>
        <Text
          style={[
            styles.inputPrefix,
            { color: colors.primary.main, borderRightColor: colors.border },
          ]}
        >
          +86
        </Text>
        <TextInput
          ref={inputRef}
          style={[styles.input, { color: colors.text.primary }]}
          placeholder="请输入手机号"
          placeholderTextColor={colors.text.tertiary}
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          keyboardType="phone-pad"
          maxLength={11}
          returnKeyType="next"
        />
      </Animated.View>
    );
  },
);
PhoneInput.displayName = 'PhoneInput';

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
  inputPrefix: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 12,
    paddingRight: 12,
    borderRightWidth: 1,
  },
  input: {
    flex: 1,
    fontSize: 16,
    letterSpacing: 0.5,
  },
});
