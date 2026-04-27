import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Platform,
  Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {
  useTheme,
  spacing,
  typography,
  animation as anim,
  glassmorphism,
} from '../../theme';

interface ChatInputAreaProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  onAttachPress?: () => void;
}

export function ChatInputArea({
  value,
  onChangeText,
  onSend,
  onAttachPress,
}: ChatInputAreaProps) {
  const theme = useTheme();
  const colors = theme.colors;
  const [isFocused, setIsFocused] = useState(false);
  const heightAnim = useRef(
    new Animated.Value(Platform.OS === 'ios' ? 40 : 36),
  ).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const handleFocus = () => {
    setIsFocused(true);
    Animated.parallel([
      Animated.spring(heightAnim, {
        toValue: Platform.OS === 'ios' ? 50 : 44,
        damping: 15,
        stiffness: 200,
        useNativeDriver: false,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: anim.duration.fast,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleBlur = () => {
    setIsFocused(false);
    Animated.parallel([
      Animated.spring(heightAnim, {
        toValue: Platform.OS === 'ios' ? 40 : 36,
        damping: 15,
        stiffness: 200,
        useNativeDriver: false,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: anim.duration.fast,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const styles = StyleSheet.create({
    inputArea: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm + 2,
      paddingBottom: Platform.OS === 'ios' ? spacing['2xl'] : spacing.sm + 2,
      ...glassmorphism.navbar,
    },
    attachButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.background.tertiary,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      marginRight: spacing.sm,
    },
    attachIcon: {
      fontSize: 24,
      color: colors.text.inverse,
      fontWeight: '300',
    },
    inputContainer: {
      flex: 1,
      backgroundColor: colors.background.secondary,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: spacing.lg,
      maxHeight: 100,
    },
    input: {
      fontSize: typography.size.body,
      color: colors.text.inverse,
      lineHeight: 20,
      minHeight: 40,
    },
    sendBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      marginLeft: spacing.sm,
      overflow: 'hidden',
    },
    sendBtnDisabled: {
      opacity: 0.5,
    },
    sendGradient: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    sendIcon: {
      fontSize: typography.size.h3,
      color: colors.text.inverse,
      fontWeight: typography.weight.semibold,
    },
  });

  const isDisabled = !value.trim();

  return (
    <View style={styles.inputArea}>
      <TouchableOpacity onPress={onAttachPress} style={styles.attachButton}>
        <Text style={styles.attachIcon}>+</Text>
      </TouchableOpacity>
      <Animated.View
        style={[
          styles.inputContainer,
          {
            height: heightAnim,
            opacity: opacityAnim,
          },
        ]}
      >
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder="输入消息..."
          placeholderTextColor={colors.text.tertiary}
          multiline
          maxLength={500}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
      </Animated.View>
      <TouchableOpacity
        style={[styles.sendBtn, isDisabled && styles.sendBtnDisabled]}
        onPress={onSend}
        disabled={isDisabled}
      >
        <LinearGradient
          colors={
            !isDisabled
              ? colors.primary.gradient
              : [colors.background.tertiary, colors.background.tertiary]
          }
          style={styles.sendGradient}
        >
          <Text style={styles.sendIcon}>→</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

export default ChatInputArea;
