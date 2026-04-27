/**
 * 禁用动画版本 - theme/hooks.ts
 * 解决 Worklets 循环引用崩溃问题
 */
import { useCallback, useState } from 'react';

// 兼容 OpenCode 重构时引入的 hook
export function useEntranceAnimation(_delay?: number) {
  const [animatedStyle] = useState({ opacity: 1, transform: [{ translateY: 0 }] });
  return { animatedStyle };
}

export function usePressAnimation({ scale = 0.97 }: { scale?: number }) {
  const handlePressIn = useCallback(() => {}, []);
  const handlePressOut = useCallback(() => {}, []);
  const animatedStyle = { transform: [{ scale: 1 }] };
  return { animatedStyle, handlePressIn, handlePressOut };
}

export function useListItemAnimation(_index?: number, _delay?: number) {
  const animatedStyle = { opacity: 1, transform: [{ translateY: 0 }] };
  return { animatedStyle };
}

export function useNumberAnimation(value: number = 0, _duration?: number) {
  const animatedStyle = {};
  return { animatedStyle, animatedValue: { value } };
}

export function useScreenEnterAnimation() {
  const animatedStyle = {};
  const play = () => {};
  return { animatedStyle, play };
}

export const EnteringAnimation = {
  FadeIn: () => null,
  FadeInUp: () => null,
};
