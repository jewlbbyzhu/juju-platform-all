import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../../theme';

interface ChatBackgroundProps {
  style?: ViewStyle;
}

export function ChatBackground({ style }: ChatBackgroundProps) {
  const theme = useTheme();
  const colors = theme.colors;

  return (
    <LinearGradient
      colors={[colors.background.primary, colors.background.secondary, colors.background.primary]}
      style={[styles.background, style]}
    />
  );
}

const styles = StyleSheet.create({
  background: {
    ...StyleSheet.absoluteFill,
  },
});

export default ChatBackground;
