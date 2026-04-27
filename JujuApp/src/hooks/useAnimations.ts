/**
 * 禁用动画版本 - hooks/useAnimations.ts
 * 解决 Worklets 循环引用崩溃问题
 */
import { useCallback, useState } from 'react';

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
  opacity: { value: number };
  scale: { value: number };
  translateY: { value: number };
  translateX: { value: number };
  style: object;
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
  const [style] = useState({});
  
  return {
    opacity: { value: 1 },
    scale: { value: 1 },
    translateY: { value: 0 },
    translateX: { value: 0 },
    style,
    start: () => {},
    reset: () => {},
  };
}

export function useScreenAnimation() {
  return {
    opacity: { value: 1 },
    translateY: { value: 0 },
    animatedStyle: {},
    play: () => {},
  };
}

export function usePressAnimation(
  config: SpringConfig = {},
) {
  return {
    scale: { value: 1 },
    animatedStyle: {},
    onPressIn: () => {},
    onPressOut: () => {},
  };
}

export function useShimmerAnimation() {
  return {
    opacity: { value: 0 },
    animatedStyle: {},
    start: () => {},
  };
}

export function usePulseAnimation() {
  return {
    scale: { value: 1 },
    animatedStyle: {},
    start: () => {},
  };
}

export function useScrollAnimation() {
  return {
    scrollY: { value: 0 },
    headerAnimatedStyle: {},
    contentAnimatedStyle: {},
    onScroll: () => {},
  };
}

export const EnteringAnimation = {
  FadeIn: () => null,
  FadeInDown: () => null,
  FadeInUp: () => null,
  FadeInLeft: () => null,
  FadeInRight: () => null,
  SlideInDown: () => null,
  SlideInUp: () => null,
  SlideInLeft: () => null,
  SlideInRight: () => null,
  ZoomIn: () => null,
  ZoomInDown: () => null,
  ZoomInUp: () => null,
};

export const SpringConfig = {
  gentle: {},
  bouncy: {},
  stiff: {},
  soft: {},
};

export const TimingConfig = {
  instant: 0,
  fast: 100,
  normal: 300,
  slow: 500,
  dramatic: 800,
};
