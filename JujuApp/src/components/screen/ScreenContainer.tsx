import React, { useEffect } from 'react';
import { View, StyleSheet, StatusBar, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '../../theme';
import { animation } from '../../theme';

export interface ScreenContainerProps {
  children: React.ReactNode;
  backgroundColor?: string;
  statusBarStyle?: 'light-content' | 'dark-content';
  edges?: Array<'top' | 'bottom' | 'left' | 'right'>;
  animated?: boolean;
  style?: ViewStyle;
}

export function ScreenContainer({
  children,
  backgroundColor,
  statusBarStyle = 'light-content',
  edges = ['top'],
  animated = true,
  style,
}: ScreenContainerProps): React.JSX.Element {
  const { colors } = useTheme();
  const screenOpacity = useSharedValue(animated ? 0 : 1);
  const screenTranslateY = useSharedValue(animated ? 20 : 0);

  useEffect(() => {
    if (animated) {
      screenOpacity.value = withTiming(1, {
        duration: animation.duration.dramatic,
        easing: Easing.out(Easing.quad),
      });
      screenTranslateY.value = withSpring(0, animation.spring.soft);
    }
  }, [animated, screenOpacity, screenTranslateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: screenOpacity.value,
    transform: [{ translateY: screenTranslateY.value }],
  }));

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: backgroundColor || colors.gray[900] },
        style,
      ]}
      edges={edges}
    >
      <StatusBar
        barStyle={statusBarStyle}
        backgroundColor={backgroundColor || colors.gray[900]}
        translucent
      />
      <Animated.View style={[styles.content, animatedStyle]}>
        {children}
      </Animated.View>
    </SafeAreaView>
  );
}

export interface ScreenHeaderProps {
  title: string;
  onBack?: () => void;
  rightElement?: React.ReactNode;
  variant?: 'transparent' | 'solid' | 'glass';
}

export function ScreenHeader({
  title,
  onBack,
  rightElement,
  variant = 'transparent',
}: ScreenHeaderProps): React.JSX.Element {
  const { colors } = useTheme();

  return (
    <Animated.View
      entering={FadeIn.duration(animation.duration.normal)}
      style={[
        styles.header,
        variant === 'solid' && { backgroundColor: colors.background.primary },
        variant === 'glass' && styles.glassHeader,
      ]}
    >
      {onBack && (
        <Animated.View style={styles.backButtonContainer}>
          <Animated.Text onPress={onBack} style={styles.backIcon}>
            ←
          </Animated.Text>
        </Animated.View>
      )}
      <Animated.Text style={styles.headerTitle}>{title}</Animated.Text>
      {rightElement && <View style={styles.rightElement}>{rightElement}</View>}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 44,
  },
  glassHeader: {
    backgroundColor: 'rgba(30, 41, 59, 0.85)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButtonContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
  rightElement: {
    minWidth: 40,
    alignItems: 'flex-end',
  },
});

export default ScreenContainer;
