import React, { useEffect } from 'react';
import {ViewStyle, TextStyle} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  FadeIn,
  FadeInDown,
} from 'react-native-reanimated';
import { SearchBar, FilterButton } from './index';
import { useTheme, animation, spacing, layout, typography } from '../../theme';

interface HomeHeaderProps {
  titleStyle: ReturnType<typeof useAnimatedStyle>;
  searchBarStyle: ReturnType<typeof useAnimatedStyle>;
  searchQuery: string;
  onSearchChange: (text: string) => void;
  onSearchSubmit: () => void;
}

const HomeHeader: React.FC<HomeHeaderProps> = React.memo(
  ({
    titleStyle,
    searchBarStyle,
    searchQuery,
    onSearchChange,
    onSearchSubmit,
  }) => {
    const { colors } = useTheme();
    const titleScale = useSharedValue(0.8);
    const titleOpacity = useSharedValue(0);
    const titleTranslateY = useSharedValue(20);
    const subtitleOpacity = useSharedValue(0);
    const subtitleTranslateY = useSharedValue(20);
    const contentOpacity = useSharedValue(0);

    useEffect(() => {
      titleScale.value = withSpring(1, {
        ...animation.spring.soft,
        damping: 12,
      });
      titleTranslateY.value = withSpring(0, {
        ...animation.spring.soft,
        damping: 12,
      });
      titleOpacity.value = withTiming(1, {
        duration: animation.duration.normal,
      });
      subtitleOpacity.value = withDelay(
        100,
        withTiming(1, { duration: animation.duration.normal }),
      );
      subtitleTranslateY.value = withDelay(
        100,
        withSpring(0, animation.spring.soft),
      );
      contentOpacity.value = withDelay(
        200,
        withTiming(1, { duration: animation.duration.normal }),
      );
    }, [
      titleScale,
      titleOpacity,
      titleTranslateY,
      subtitleOpacity,
      subtitleTranslateY,
      contentOpacity,
    ]);

    const titleAnimatedStyle = useAnimatedStyle(() => ({
      transform: [
        { scale: titleScale.value },
        { translateY: titleTranslateY.value },
      ] as any,
      opacity: titleOpacity.value,
    }));

    const subtitleAnimatedStyle = useAnimatedStyle(() => ({
      opacity: subtitleOpacity.value,
      transform: [{ translateY: subtitleTranslateY.value }] as any,
    }));

    const contentAnimatedStyle = useAnimatedStyle(() => ({
      opacity: contentOpacity.value,
    }));

    // 使用设计系统替代 StyleSheet.create
    const headerContainerStyle: ViewStyle = {
      paddingTop: spacing.sm,
    };

    const headerTitleStyle: TextStyle = {
      fontSize: typography.size.h1,
      fontWeight: typography.weight.bold,
      color: colors.text.primary,
      letterSpacing: -0.8,
      marginBottom: spacing.xs,
      paddingHorizontal: layout.screenPadding,
    };

    const headerSubtitleStyle: TextStyle = {
      fontSize: typography.size.body2,
      color: colors.text.secondary,
      letterSpacing: 0.2,
      paddingHorizontal: layout.screenPadding,
      marginBottom: spacing.lg,
    };

    const searchContainerStyle: ViewStyle = {
      paddingHorizontal: layout.screenPadding,
    };

    const searchRowStyle: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    };

    return (
      <Animated.View style={headerContainerStyle}>
        <Animated.Text
          style={[headerTitleStyle, titleStyle, titleAnimatedStyle]}
          entering={FadeInDown.delay(100)
            .duration(animation.duration.dramatic)
            .springify()
            .damping(14)}
        >
          发现精彩活动
        </Animated.Text>
        <Animated.Text
          style={[headerSubtitleStyle, subtitleAnimatedStyle]}
          entering={FadeIn.delay(400)
            .duration(animation.duration.normal)
            .springify()}
        >
          探索附近的派对、聚会和社交活动
        </Animated.Text>
        <Animated.View
          style={[searchContainerStyle, searchBarStyle, contentAnimatedStyle]}
        >
          <Animated.View
            entering={FadeInDown.delay(200)
              .duration(animation.duration.dramatic)
              .springify()
              .damping(15)}
            style={searchRowStyle}
          >
            <SearchBar
              value={searchQuery}
              onChangeText={onSearchChange}
              onSubmit={onSearchSubmit}
            />
            <FilterButton />
          </Animated.View>
        </Animated.View>
      </Animated.View>
    );
  },
);

export default HomeHeader;

HomeHeader.displayName = 'HomeHeader';
