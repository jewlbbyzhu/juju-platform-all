import { useCallback } from 'react';
import {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  withSequence,
  withRepeat,
  FadeIn,
  FadeInDown,
  FadeInUp,
  FadeInLeft,
  FadeInRight,
  SlideInDown,
  SlideInUp,
  SlideInLeft,
  SlideInRight,
  ZoomIn,
  ZoomInDown,
  ZoomInUp,
  SharedValue,
} from 'react-native-reanimated';
import { Easing } from 'react-native';
import { animation } from '../theme';

export type SpringConfig = {
  damping?: number;
  stiffness?: number;
  mass?: number;
};

export type TimingConfig = {
  duration?: number;
  easing?: (value: number) => number;
};

interface UseEntranceAnimationResult {
  opacity: SharedValue<number>;
  scale: SharedValue<number>;
  translateY: SharedValue<number>;
  translateX: SharedValue<number>;
  style: ReturnType<typeof useAnimatedStyle>;
  start: () => void;
  reset: () => void;
}

export function useEntranceAnimation(
  config: {
    initialOpacity?: number;
    initialScale?: number;
    initialTranslateY?: number;
    initialTranslateX?: number;
    springConfig?: SpringConfig;
    timingConfig?: TimingConfig;
    delay?: number;
  } = {},
): UseEntranceAnimationResult {
  const {
    initialOpacity = 0,
    initialScale = 0.95,
    initialTranslateY = 20,
    initialTranslateX = 0,
    springConfig = animation.spring.soft,
    timingConfig = { duration: animation.duration.normal },
    delay = 0,
  } = config;

  const opacity = useSharedValue(initialOpacity);
  const scale = useSharedValue(initialScale);
  const translateY = useSharedValue(initialTranslateY);
  const translateX = useSharedValue(initialTranslateX);

  const animatedStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      opacity: opacity.value,
      transform: [
        { scale: scale.value as number },
        { translateY: translateY.value as number },
        { translateX: translateX.value as number },
      ] as const,
    };
  });

  const start = useCallback(() => {
    opacity.value = withDelay(
      delay,
      withTiming(1, {
        duration: timingConfig.duration || animation.duration.normal,
      }),
    );
    scale.value = withDelay(delay, withSpring(1, springConfig));
    translateY.value = withDelay(delay, withSpring(0, springConfig));
    translateX.value = withDelay(delay, withSpring(0, springConfig));
  }, [delay, springConfig, timingConfig.duration]);

  const reset = useCallback(() => {
    opacity.value = initialOpacity;
    scale.value = initialScale;
    translateY.value = initialTranslateY;
    translateX.value = initialTranslateX;
  }, [initialOpacity, initialScale, initialTranslateY, initialTranslateX]);

  return {
    opacity,
    scale,
    translateY,
    translateX,
    style: animatedStyle,
    start,
    reset,
  };
}

export function useScreenAnimation() {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(30);

  const animatedStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      opacity: opacity.value,
      transform: [{ translateY: translateY.value }],
    };
  });

  const play = useCallback(() => {
    opacity.value = withTiming(1, {
      duration: animation.duration.dramatic,
      easing: Easing.out(Easing.quad),
    });
    translateY.value = withSpring(0, animation.spring.soft);
  }, []);

  return {
    opacity,
    translateY,
    animatedStyle,
    play,
  };
}

export function usePressAnimation(
  config: SpringConfig = animation.spring.gentle,
) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const onPressIn = useCallback(() => {
    scale.value = withSpring(0.97, config);
  }, [config]);

  const onPressOut = useCallback(() => {
    scale.value = withSpring(1, config);
  }, [config]);

  return {
    scale,
    animatedStyle,
    onPressIn,
    onPressOut,
  };
}

export function useShimmerAnimation() {
  const opacity = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      opacity: 0.5 + Math.sin(opacity.value) * 0.5,
    };
  });

  const start = useCallback(() => {
    opacity.value = withRepeat(
      withTiming(Math.PI * 2, { duration: animation.loop.shimmer.duration }),
      -1,
      false,
    );
  }, []);

  return {
    opacity,
    animatedStyle,
    start,
  };
}

export function usePulseAnimation() {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const start = useCallback(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: animation.loop.pulse.duration / 2 }),
        withTiming(1, { duration: animation.loop.pulse.duration / 2 }),
      ),
      -1,
      true,
    );
  }, []);

  return {
    scale,
    animatedStyle,
    start,
  };
}

export function useScrollAnimation() {
  const scrollY = useSharedValue(0);
  const headerOpacity = useSharedValue(1);
  const headerScale = useSharedValue(1);

  const headerAnimatedStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      opacity: headerOpacity.value,
      transform: [{ scale: headerScale.value }],
    };
  });

  const contentAnimatedStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      opacity: headerOpacity.value,
    };
  });

  const onScroll = (y: number) => {
    scrollY.value = y;
    const threshold = 50;
    if (y > threshold) {
      headerOpacity.value = withTiming(0.8, { duration: 150 });
      headerScale.value = withTiming(0.95, { duration: 150 });
    } else {
      headerOpacity.value = withTiming(1, { duration: 150 });
      headerScale.value = withTiming(1, { duration: 150 });
    }
  };

  return {
    scrollY,
    headerAnimatedStyle,
    contentAnimatedStyle,
    onScroll,
  };
}

export const EnteringAnimation = {
  FadeIn: (delay = 0) =>
    FadeIn.duration(animation.duration.normal).delay(delay),
  FadeInDown: (delay = 0) =>
    FadeInDown.duration(animation.duration.normal).delay(delay).springify(),
  FadeInUp: (delay = 0) =>
    FadeInUp.duration(animation.duration.normal).delay(delay).springify(),
  FadeInLeft: (delay = 0) =>
    FadeInLeft.duration(animation.duration.normal).delay(delay).springify(),
  FadeInRight: (delay = 0) =>
    FadeInRight.duration(animation.duration.normal).delay(delay).springify(),
  SlideInDown: (delay = 0) =>
    SlideInDown.duration(animation.duration.normal).delay(delay),
  SlideInUp: (delay = 0) =>
    SlideInUp.duration(animation.duration.normal).delay(delay),
  SlideInLeft: (delay = 0) =>
    SlideInLeft.duration(animation.duration.normal).delay(delay),
  SlideInRight: (delay = 0) =>
    SlideInRight.duration(animation.duration.normal).delay(delay),
  ZoomIn: (delay = 0) =>
    ZoomIn.duration(animation.duration.normal).delay(delay),
  ZoomInDown: (delay = 0) =>
    ZoomInDown.duration(animation.duration.normal).delay(delay).springify(),
  ZoomInUp: (delay = 0) =>
    ZoomInUp.duration(animation.duration.normal).delay(delay).springify(),
};

export const SpringConfig = {
  gentle: animation.spring.gentle,
  bouncy: animation.spring.bouncy,
  stiff: animation.spring.stiff,
  soft: animation.spring.soft,
};

export const TimingConfig = {
  instant: animation.duration.instant,
  fast: animation.duration.fast,
  normal: animation.duration.normal,
  slow: animation.duration.slow,
  dramatic: animation.duration.dramatic,
};
