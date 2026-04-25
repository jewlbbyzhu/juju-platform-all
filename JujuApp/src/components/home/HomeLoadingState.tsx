import React, { useEffect } from 'react';
import {ViewStyle} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  withSpring,
  FadeIn,
  FadeInDown,
} from 'react-native-reanimated';
import { SkeletonList } from '../Skeleton';
import HomeHeader from './HomeHeader';
import {animation} from '../../theme';
import type { AnimatedStyle } from 'react-native-reanimated';

interface HomeLoadingStateProps {
  searchQuery: string;
  onSearchChange: (text: string) => void;
  onSearchSubmit: () => void;
  titleStyle: AnimatedStyle<any>;
  searchBarStyle: AnimatedStyle<any>;
}

const HomeLoadingState: React.FC<HomeLoadingStateProps> = React.memo(
  ({
    searchQuery,
    onSearchChange,
    onSearchSubmit,
    titleStyle,
    searchBarStyle,
  }) => {
    const skeletonOpacity = useSharedValue(0);
    const skeletonScale = useSharedValue(0.95);

    useEffect(() => {
      skeletonOpacity.value = withDelay(
        300,
        withTiming(1, { duration: animation.duration.normal }),
      );
      skeletonScale.value = withDelay(
        300,
        withSpring(1, animation.spring.soft),
      );
    }, [skeletonOpacity, skeletonScale]);

    const skeletonStyle = useAnimatedStyle(() => ({
      opacity: skeletonOpacity.value,
      transform: [{ scale: skeletonScale.value }],
    }));

    // 使用设计系统替代 StyleSheet.create
    const loadingContentStyle: ViewStyle = {
      flex: 1,
    };

    const skeletonContainerStyle: ViewStyle = {
      flex: 1,
    };

    return (
      <Animated.View
        entering={FadeIn.duration(animation.duration.dramatic)}
        style={loadingContentStyle}
      >
        <HomeHeader
          titleStyle={titleStyle}
          searchBarStyle={searchBarStyle}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          onSearchSubmit={onSearchSubmit}
        />
        <Animated.View
          entering={FadeInDown.delay(300).duration(animation.duration.normal)}
          style={[skeletonContainerStyle, skeletonStyle]}
        >
          <SkeletonList count={4} />
        </Animated.View>
      </Animated.View>
    );
  },
);

export default HomeLoadingState;
