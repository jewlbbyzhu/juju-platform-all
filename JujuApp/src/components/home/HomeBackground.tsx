import React, { useEffect, useMemo } from 'react';
import { ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
  useAnimatedReaction,
  interpolate,
  Extrapolation,
  Easing,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import {gradients, BorderRadius} from '../../theme';

interface ParticleAnimation {
  initialY: number;
  amplitude: number;
  duration: number;
  delay: number;
}

interface HomeBackgroundProps {
  scrollY: any;
  isScrolling: any;
}

const HomeBackground: React.FC<HomeBackgroundProps> = React.memo(
  ({ scrollY, isScrolling }) => {
    const particle1Y = useSharedValue(0);
    const particle1Rotate = useSharedValue(0);
    const particle2Y = useSharedValue(0);
    const particle2Rotate = useSharedValue(0);
    const particle3Y = useSharedValue(0);
    const particle3Rotate = useSharedValue(0);
    const backgroundScale = useSharedValue(1);
    const blurIntensity = useSharedValue(0);

    const particleAnimations: ParticleAnimation[] = useMemo(
      () => [
        { initialY: 0, amplitude: 30, duration: 3000, delay: 0 },
        { initialY: 0, amplitude: 25, duration: 4000, delay: 500 },
        { initialY: 0, amplitude: 20, duration: 3500, delay: 1000 },
      ],
      [],
    );

    useEffect(() => {
      const startParticleAnimation = (
        particle: any,
        rotateParticle: any,
        config: ParticleAnimation,
      ) => {
        particle.value = withDelay(
          config.delay,
          withRepeat(
            withSequence(
              withTiming(config.amplitude, {
                duration: config.duration,
                easing: Easing.inOut(Easing.sin),
              }),
              withTiming(-config.amplitude, {
                duration: config.duration,
                easing: Easing.inOut(Easing.sin),
              }),
            ),
            -1,
            true,
          ),
        );
        rotateParticle.value = withDelay(
          config.delay,
          withRepeat(
            withTiming(360, { duration: 8000, easing: Easing.linear }),
            -1,
          ),
        );
      };

      startParticleAnimation(
        particle1Y,
        particle1Rotate,
        particleAnimations[0],
      );
      startParticleAnimation(
        particle2Y,
        particle2Rotate,
        particleAnimations[1],
      );
      startParticleAnimation(
        particle3Y,
        particle3Rotate,
        particleAnimations[2],
      );
    }, [particleAnimations]);

    useEffect(() => {
      const interval = setInterval(() => {
        backgroundScale.value = withSequence(
          withTiming(1.05, {
            duration: 4000,
            easing: Easing.inOut(Easing.sin),
          }),
          withTiming(1, {
            duration: 4000,
            easing: Easing.inOut(Easing.sin),
          }),
        );
      }, 8000);
      return () => clearInterval(interval);
    }, [backgroundScale]);

    useAnimatedReaction(
      () => isScrolling.value,
      scrolling => {
        blurIntensity.value = withTiming(scrolling ? 2 : 0, {
          duration: 200,
        });
      },
    );

    const particle1Style = useAnimatedStyle(() => ({
      transform: [
        { translateY: particle1Y.value },
        { rotate: `${particle1Rotate.value}deg` },
      ] as any,
    }));

    const particle2Style = useAnimatedStyle(() => ({
      transform: [
        { translateY: particle2Y.value },
        { rotate: `${particle2Rotate.value}deg` },
      ] as any,
    }));

    const particle3Style = useAnimatedStyle(() => ({
      transform: [
        { translateY: particle3Y.value },
        { rotate: `${particle3Rotate.value}deg` },
      ] as any,
    }));

    const backgroundStyle = useAnimatedStyle(() => {
      const scale = interpolate(
        scrollY.value,
        [0, 200],
        [1, 1.1],
        Extrapolation.CLAMP,
      );

      return {
        transform: [{ scale: scale * backgroundScale.value }],
      };
    });

    // 使用设计系统替代 StyleSheet.create
    const backgroundContainerStyle: ViewStyle = {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      overflow: 'hidden',
    };

    const gradientOverlayStyle: ViewStyle = {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    };

    const floatingParticleBaseStyle: ViewStyle = {
      position: 'absolute',
      borderRadius: BorderRadius.full,
      overflow: 'hidden',
    };

    const particle1StyleStatic: ViewStyle = {
      width: 200,
      height: 200,
      top: '10%',
      right: -50,
    };

    const particle2StyleStatic: ViewStyle = {
      width: 150,
      height: 150,
      top: '30%',
      left: -30,
    };

    const particle3StyleStatic: ViewStyle = {
      width: 100,
      height: 100,
      bottom: '20%',
      right: '20%',
    };

    const particleGradientStyle: ViewStyle = {
      width: '100%',
      height: '100%',
      borderRadius: BorderRadius.full,
    };

    return (
      <Animated.View
        style={[backgroundContainerStyle, backgroundStyle]}
        pointerEvents="none"
      >
        <LinearGradient
          colors={gradients.secondary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1.2, y: 1.2 }}
          style={gradientOverlayStyle}
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.2)', 'rgba(0,0,0,0.4)']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={gradientOverlayStyle}
        />
        <Animated.View
          style={[floatingParticleBaseStyle, particle1StyleStatic, particle1Style]}
        >
          <LinearGradient
            colors={['rgba(255,77,109,0.3)', 'transparent']}
            style={particleGradientStyle}
          />
        </Animated.View>
        <Animated.View
          style={[floatingParticleBaseStyle, particle2StyleStatic, particle2Style]}
        >
          <LinearGradient
            colors={['rgba(123,97,255,0.3)', 'transparent']}
            style={particleGradientStyle}
          />
        </Animated.View>
        <Animated.View
          style={[floatingParticleBaseStyle, particle3StyleStatic, particle3Style]}
        >
          <LinearGradient
            colors={['rgba(255,215,0,0.2)', 'transparent']}
            style={particleGradientStyle}
          />
        </Animated.View>
      </Animated.View>
    );
  },
);

export default HomeBackground;
