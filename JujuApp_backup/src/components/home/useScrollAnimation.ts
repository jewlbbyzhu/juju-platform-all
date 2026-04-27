import { useRef } from 'react';
import { useSharedValue } from 'react-native-reanimated';
import {
  useAnimatedStyle,
  useAnimatedScrollHandler,
  interpolate,
  Extrapolation,
  SharedValue,
} from 'react-native-reanimated';

const HEADER_MAX_HEIGHT = 200;
const HEADER_MIN_HEIGHT = 100;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

export interface UseScrollAnimationReturn {
  scrollY: SharedValue<number>;
  scrollHandler: ReturnType<typeof useAnimatedScrollHandler>;
  headerStyle: ReturnType<typeof useAnimatedStyle>;
  titleStyle: ReturnType<typeof useAnimatedStyle>;
  searchBarStyle: ReturnType<typeof useAnimatedStyle>;
  isScrolling: SharedValue<boolean>;
}

export const useScrollAnimation = (): UseScrollAnimationReturn => {
  const scrollY = useSharedValue(0);
  const isScrolling = useSharedValue(false);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: event => {
      'worklet';
      scrollY.value = event.contentOffset.y;
      if (!isScrolling.value) {
        isScrolling.value = true;
      }
    },
  });

  // Handle scroll end outside worklet
  const handleScrollEnd = () => {
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    scrollTimeoutRef.current = setTimeout(() => {
      isScrolling.value = false;
    }, 150);
  };

  const headerStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      scrollY.value,
      [-100, 0, HEADER_SCROLL_DISTANCE],
      [1.2, 1, 0.9],
      Extrapolation.CLAMP,
    );
    const translateY = interpolate(
      scrollY.value,
      [0, HEADER_SCROLL_DISTANCE],
      [0, -HEADER_SCROLL_DISTANCE * 0.5],
      Extrapolation.CLAMP,
    );
    const opacity = interpolate(
      scrollY.value,
      [0, HEADER_SCROLL_DISTANCE],
      [1, 0.6],
      Extrapolation.CLAMP,
    );

    return {
      transform: [{ scale }, { translateY }] as any,
      opacity,
    };
  }, []);

  const titleStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      scrollY.value,
      [0, HEADER_SCROLL_DISTANCE],
      [1, 0.7],
      Extrapolation.CLAMP,
    );
    const translateY = interpolate(
      scrollY.value,
      [0, HEADER_SCROLL_DISTANCE],
      [0, -30],
      Extrapolation.CLAMP,
    );
    const opacity = interpolate(
      scrollY.value,
      [0, HEADER_SCROLL_DISTANCE * 0.5, HEADER_SCROLL_DISTANCE],
      [1, 0.8, 0.3],
      Extrapolation.CLAMP,
    );

    return {
      transform: [{ scale }, { translateY }] as any,
      opacity,
    };
  }, []);

  const searchBarStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollY.value,
      [0, HEADER_SCROLL_DISTANCE],
      [0, -20],
      Extrapolation.CLAMP,
    );
    const scale = interpolate(
      scrollY.value,
      [0, HEADER_SCROLL_DISTANCE],
      [1, 0.95],
      Extrapolation.CLAMP,
    );

    return {
      transform: [{ translateY }, { scale }] as any,
    };
  }, []);

  return {
    scrollY,
    scrollHandler,
    headerStyle,
    titleStyle,
    searchBarStyle,
    isScrolling,
  };
};
