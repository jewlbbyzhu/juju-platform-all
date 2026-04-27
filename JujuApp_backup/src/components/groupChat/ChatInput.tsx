import React, { memo, useState, useMemo } from 'react';
import {
  View,
  TextInput,
  Pressable,
  Text,
  ViewStyle,
  TextStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useTheme, spacing, BorderRadius, typography } from '../../theme';

interface ChatInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const ChatInput: React.FC<ChatInputProps> = memo(
  ({ value, onChangeText, onSend }) => {
    const { colors } = useTheme();
    const [isFocused, setIsFocused] = useState(false);
    const scale = useSharedValue(1);
    const translateY = useSharedValue(0);

    const handleFocus = () => {
      setIsFocused(true);
      translateY.value = withSpring(-4, { damping: 15, stiffness: 150 });
    };

    const handleBlur = () => {
      setIsFocused(false);
      translateY.value = withSpring(0, { damping: 15, stiffness: 150 });
    };

    const handlePressIn = () => {
      scale.value = withSpring(0.92, { damping: 15, stiffness: 400 });
    };

    const handlePressOut = () => {
      scale.value = withSpring(1, { damping: 15, stiffness: 400 });
    };

    const handleSend = () => {
      if (value.trim()) {
        onSend();
      }
    };

    const animatedContainerStyle = useAnimatedStyle(() => ({
      transform: [{ translateY: translateY.value }],
    }));

    const animatedButtonStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    const isDisabled = !value.trim();

    const containerStyle = useMemo(
      (): ViewStyle => ({
        flexDirection: 'row',
        padding: spacing.md,
        borderTopWidth: 1,
        gap: spacing.sm,
        alignItems: 'center',
        backgroundColor: colors.background.primary,
        borderTopColor: colors.border,
      }),
      [colors.background.primary, colors.border],
    );

    const inputWrapperStyle = useMemo(
      (): ViewStyle => ({
        flex: 1,
      }),
      [],
    );

    const inputContainerStyle = useMemo(
      (): ViewStyle => ({
        backgroundColor: colors.background.secondary,
        borderRadius: BorderRadius.full,
        borderWidth: 1,
        paddingHorizontal: spacing.xs,
        borderColor: isFocused ? colors.primary.main : colors.border,
      }),
      [isFocused, colors.primary.main, colors.border, colors.background.secondary],
    );

    const inputStyle = useMemo(
      (): TextStyle => ({
        flex: 1,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        fontSize: typography.size.body,
        maxHeight: 100,
        color: colors.text.primary,
      }),
      [colors.text.primary],
    );

    const sendBtnStyle = useMemo(
      (): ViewStyle => ({
        minWidth: 70,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.lg,
        borderRadius: BorderRadius.lg,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: isDisabled
          ? colors.background.secondary
          : colors.primary.main,
        opacity: isDisabled ? 0.6 : 1,
      }),
      [isDisabled, colors.background.secondary, colors.primary.main],
    );

    const sendBtnTextStyle = useMemo(
      (): TextStyle => ({
        fontSize: typography.size.body2,
        fontWeight: typography.weight.semibold,
        color: isDisabled ? colors.text.tertiary : colors.text.inverse,
      }),
      [isDisabled, colors.text.tertiary, colors.text.inverse],
    );

    return (
      <View style={containerStyle}>
        <Animated.View style={[inputWrapperStyle, animatedContainerStyle]}>
          <View style={inputContainerStyle}>
            <TextInput
              style={inputStyle}
              value={value}
              onChangeText={onChangeText}
              placeholder="输入消息..."
              placeholderTextColor={colors.text.tertiary}
              multiline
              maxLength={500}
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
          </View>
        </Animated.View>

        <AnimatedPressable
          onPress={handleSend}
          disabled={isDisabled}
          style={[sendBtnStyle, animatedButtonStyle]}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
        >
          <Text style={sendBtnTextStyle}>发送</Text>
        </AnimatedPressable>
      </View>
    );
  },
);

ChatInput.displayName = 'ChatInput';

export default ChatInput;
