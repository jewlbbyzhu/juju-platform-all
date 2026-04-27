import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme, spacing, BorderRadius, typography } from '../../theme';

interface ScanButtonProps {
  scanning: boolean;
  onPress: () => void;
}

const BUTTON_SIZE = 160;

export const ScanButton: React.FC<ScanButtonProps> = React.memo(({ scanning, onPress }) => {
  const { colors } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const styles = getStyles(colors);

  const gradientColors = scanning
    ? [colors.gray[700], colors.gray[600]]
    : colors.primary.gradient;

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={scanning}
      activeOpacity={0.8}
      style={styles.container}
    >
      <Animated.View style={[styles.button, animatedStyle]}>
        <LinearGradient colors={gradientColors} style={styles.gradient}>
          <Text style={styles.icon}>{scanning ? '⏳' : '📷'}</Text>
          <Text style={styles.text}>{scanning ? '扫描中...' : '点击扫码'}</Text>
        </LinearGradient>
      </Animated.View>
    </TouchableOpacity>
  );
});

ScanButton.displayName = 'ScanButton';

function getStyles(colors: any) {
  return StyleSheet.create({
    container: {
      marginTop: spacing['4xl'],
    },
    button: {
      width: BUTTON_SIZE,
      height: BUTTON_SIZE,
      borderRadius: BorderRadius.full,
      overflow: 'hidden',
      shadowColor: colors.primary.main,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 20,
      elevation: 10,
    },
    gradient: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    icon: {
      fontSize: 36,
      marginBottom: spacing.sm,
    },
    text: {
      fontSize: typography.size.body,
      fontWeight: typography.weight.semibold,
      color: colors.text.inverse,
    },
  });
}
