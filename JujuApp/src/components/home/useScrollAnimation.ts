/**
 * 禁用动画版本 - useScrollAnimation
 * 解决 Worklets 循环引用崩溃问题
 */
import { useRef, useState, useCallback } from 'react';
import { ScrollView, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';

export interface UseScrollAnimationReturn {
  scrollY: { value: number };
  scrollHandler: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  headerStyle: object;
  titleStyle: object;
  searchBarStyle: object;
  isScrolling: { value: boolean };
}

// 空实现样式（禁用动画）
const noAnimStyle = {};

export const useScrollAnimation = (): UseScrollAnimationReturn => {
  const [scrollY, setScrollY] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scrollHandler = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = event.nativeEvent.contentOffset.y;
    setScrollY(y);
    setIsScrolling(true);
    
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 150);
  }, []);

  return {
    scrollY: { value: scrollY },
    scrollHandler,
    headerStyle: noAnimStyle,
    titleStyle: noAnimStyle,
    searchBarStyle: noAnimStyle,
    isScrolling: { value: isScrolling },
  };
};
