import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withSequence,
  withTiming,
  withRepeat,
  interpolate,
  Extrapolation,
  Easing,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import { colors, gradients, BorderRadius } from '../../theme';
import type { SharedValue } from 'react-native-reanimated';

interface BackgroundDecorationProps {
  scrollY?: SharedValue<number>;
}

export const BackgroundDecoration: React.FC<BackgroundDecorationProps> = ({
  scrollY,
}) => {
  const particle1Y = useSharedValue(0);
  const particle2Y = useSharedValue(0);
  const particle3Y = useSharedValue(0);
  const backgroundScale = useSharedValue(1);

  useEffect(() => {
    particle1Y.value = withDelay(
      0,
      withRepeat(
        withSequence(
          withTiming(-30, { duration: 3000, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 3000, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        true,
      ),
    );
    particle2Y.value = withDelay(
      500,
      withRepeat(
        withSequence(
          withTiming(30, { duration: 4000, easing: Easing.inOut(Easing.sin) }),
          withTiming(-30, { duration: 4000, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        true,
      ),
    );
    particle3Y.value = withDelay(
      1000,
      withRepeat(
        withSequence(
          withTiming(-20, { duration: 3500, easing: Easing.inOut(Easing.sin) }),
          withTiming(20, { duration: 3500, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        true,
      ),
    );
  }, [particle1Y, particle2Y, particle3Y]);

  useEffect(() => {
    backgroundScale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 4000, easing: Easing.inOut(Easing.sin) }),
        withTiming(1, { duration: 4000, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
  }, [backgroundScale]);

  const particle1Style = useAnimatedStyle(() => ({
    transform: [{ translateY: particle1Y.value }],
  }));

  const particle2Style = useAnimatedStyle(() => ({
    transform: [{ translateY: particle2Y.value }],
  }));

  const particle3Style = useAnimatedStyle(() => ({
    transform: [{ translateY: particle3Y.value }],
  }));

  const backgroundStyle = useAnimatedStyle(() => {
    const scale = scrollY
      ? interpolate(scrollY.value, [0, 200], [1, 1.1], Extrapolation.CLAMP)
      : 1;

    return {
      transform: [{ scale: scale * backgroundScale.value }],
    };
  });

  return (
    <Animated.View style={[styles.backgroundContainer, backgroundStyle]}>
      <LinearGradient
        colors={gradients.secondary as [string, string, ...string[]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1.2, y: 1.2 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.2)', 'rgba(0,0,0,0.4)']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.gradientOverlay}
      />
      <Animated.View
        style={[styles.floatingParticle, styles.particle1, particle1Style]}
      >
        <LinearGradient
          colors={[colors.primary.main + '30', 'transparent']}
          style={styles.particleGradient}
        />
      </Animated.View>
      <Animated.View
        style={[styles.floatingParticle, styles.particle2, particle2Style]}
      >
        <LinearGradient
          colors={[colors.secondary.main + '30', 'transparent']}
          style={styles.particleGradient}
        />
      </Animated.View>
      <Animated.View
        style={[styles.floatingParticle, styles.particle3, particle3Style]}
      >
        <LinearGradient
          colors={[colors.accent.gold + '20', 'transparent']}
          style={styles.particleGradient}
        />
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  backgroundContainer: {
    ...StyleSheet.absoluteFill,
    overflow: 'hidden',
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFill,
  },
  floatingParticle: {
    position: 'absolute',
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  particle1: {
    width: 200,
    height: 200,
    top: '10%',
    right: -50,
  },
  particle2: {
    width: 150,
    height: 150,
    top: '30%',
    left: -30,
  },
  particle3: {
    width: 100,
    height: 100,
    bottom: '20%',
    right: '20%',
  },
  particleGradient: {
    width: '100%',
    height: '100%',
    borderRadius: BorderRadius.full,
  },
});

export default BackgroundDecoration;
