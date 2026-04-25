import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useTheme, spacing, BorderRadius, Border } from '../../theme';

interface ScannerFrameProps {
  scanning: boolean;
}

const CORNER_SIZE = 30;
const SCAN_FRAME_SIZE = 240;

export const ScannerFrame: React.FC<ScannerFrameProps> = React.memo(({ scanning }) => {
  const { colors } = useTheme();

  const scanProgress = useSharedValue(0);

  React.useEffect(() => {
    if (scanning) {
      scanProgress.value = withRepeat(
        withTiming(1, {
          duration: 1500,
          easing: Easing.linear,
        }),
        -1,
        false,
      );
    } else {
      scanProgress.value = 0;
    }
  }, [scanning, scanProgress]);

  const scanLineStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: scanProgress.value * SCAN_FRAME_SIZE }],
  }));

  const styles = getStyles(colors);

  return (
    <View style={styles.scanFrame}>
      <View style={[styles.corner, styles.cornerTL]} />
      <View style={[styles.corner, styles.cornerTR]} />
      <View style={[styles.corner, styles.cornerBL]} />
      <View style={[styles.corner, styles.cornerBR]} />

      {scanning && (
        <Animated.View style={[styles.scanLine, scanLineStyle]} />
      )}
    </View>
  );
});

ScannerFrame.displayName = 'ScannerFrame';

function getStyles(colors: any) {
  return StyleSheet.create({
    scanFrame: {
      width: SCAN_FRAME_SIZE,
      height: SCAN_FRAME_SIZE,
      borderRadius: BorderRadius.lg,
      backgroundColor: colors.text.primary + '08',
      borderWidth: Border.width.normal,
      borderColor: colors.text.primary + '1A',
      position: 'relative',
      overflow: 'hidden',
    },
    corner: {
      position: 'absolute',
      width: CORNER_SIZE,
      height: CORNER_SIZE,
      borderColor: colors.primary.main,
      borderWidth: 3,
    },
    cornerTL: {
      top: spacing.md,
      left: spacing.md,
      borderRightWidth: 0,
      borderBottomWidth: 0,
      borderTopLeftRadius: BorderRadius.md,
    },
    cornerTR: {
      top: spacing.md,
      right: spacing.md,
      borderLeftWidth: 0,
      borderBottomWidth: 0,
      borderTopRightRadius: BorderRadius.md,
    },
    cornerBL: {
      bottom: spacing.md,
      left: spacing.md,
      borderRightWidth: 0,
      borderTopWidth: 0,
      borderBottomLeftRadius: BorderRadius.md,
    },
    cornerBR: {
      bottom: spacing.md,
      right: spacing.md,
      borderLeftWidth: 0,
      borderTopWidth: 0,
      borderBottomRightRadius: BorderRadius.md,
    },
    scanLine: {
      position: 'absolute',
      left: 0,
      right: 0,
      height: 2,
      backgroundColor: colors.primary.main,
      shadowColor: colors.primary.main,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.5,
      shadowRadius: 10,
      elevation: 5,
    },
  });
}
