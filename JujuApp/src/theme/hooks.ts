import { useCallback } from 'react';
import {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,

  FadeIn,
  FadeInUp,
} from 'react-native-reanimated';
import { animation } from './animation';

// 兼容 OpenCode 重构时引入的 hook
export function useEntranceAnimation(delay?: number) {

  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  // 在组件挂载时触发（通过 useEffect 不理想，但返回 style 供使用）
  // 实际效果依赖于组件渲染时即应用
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  // 返回初始值为 1/0 的 style，配合 entering 使用更佳
  // 但为兼容已有代码，返回 animatedStyle
  return { animatedStyle };
}

export function usePressAnimation({ scale = 0.97 }: { scale?: number }) {
  const pressScale = useSharedValue(1);

  const handlePressIn = useCallback(() => {
    pressScale.value = withSpring(scale, animation.spring.gentle);
  }, [pressScale, scale]);

  const handlePressOut = useCallback(() => {
    pressScale.value = withSpring(1, animation.spring.gentle);
  }, [pressScale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressScale.value }],
  }));

  return { animatedStyle, handlePressIn, handlePressOut };
}

export function useListItemAnimation(index?: number, delay?: number) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return { animatedStyle };
}

export function useNumberAnimation(value: number = 0, duration?: number) {
  const animatedValue = useSharedValue(value);

  const animatedStyle = useAnimatedStyle(() => ({
    // 这个 hook 的实际用途不明确，返回空 style 作为兼容
  }));

  return { animatedStyle, animatedValue };
}

export function useScreenEnterAnimation() {
  const animatedValue = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: animatedValue.value,
    transform: [{ translateY: (1 - animatedValue.value) * 20 }],
  }));

  const play = () => {
    animatedValue.value = withTiming(1, { duration: 400 });
  };

  return { animatedStyle, play };
}

export const EnteringAnimation = {
  FadeIn: () => FadeIn,
  FadeInUp: () => FadeInUp,
};
