/**
 * 聚聚 (JUJU) App - 首页
 * 2026 设计系统重构版 - 动画增强 + 代码优化
 */

import React, {
  useCallback,
  useRef,
  useTransition,
  useEffect,
  memo,
} from 'react';
import { View, StatusBar, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,


  LinearTransition,
  useAnimatedScrollHandler,
} from 'react-native-reanimated';
import { useTheme, animation, colors } from '../theme';
import {
  HomeBackground,
  HomeHeader,
  CategoryFilter,
  PartyListContainer,
  HomeLoadingState,
  usePartyList,
  useScrollAnimation,
} from '../components/home';
import {
  useScreenEnterAnimation,
  EnteringAnimation,
} from '../theme';
import type { NavigationProp } from '../types';
import type { Party as PartyType } from '../types/api';

interface HomeScreenProps {
  navigation: NavigationProp;
}

interface ScreenContentProps {
  activeCategory: string;
  onCategoryChange: (key: string) => void;
  searchQuery: string;
  onSearchChange: (text: string) => void;
  onSearchSubmit: () => void;
  parties: PartyType[];
  navigation: NavigationProp;
  refreshing: boolean;
  onRefresh: () => void;
  loadMore: () => void;
  isPending: boolean;
  scrollHandler: ReturnType<typeof useAnimatedScrollHandler>;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  titleStyle: ReturnType<typeof useAnimatedStyle>;
  searchBarStyle: ReturnType<typeof useAnimatedStyle>;
}

// 命名样式对象替代 useMemo
const contentWrapperStyle: ViewStyle = {
  flex: 1,
};

const containerStyle: ViewStyle = {
  flex: 1,
  backgroundColor: colors.gray[900],
};

const screenWrapperStyle: ViewStyle = {
  flex: 1,
};

const ScreenContent: React.FC<ScreenContentProps> = memo(
  ({
    activeCategory,
    onCategoryChange,
    searchQuery,
    onSearchChange,
    onSearchSubmit,
    parties,
    navigation,
    refreshing,
    onRefresh,
    loadMore,
    isPending,
    scrollHandler,
    loading,
    error,
    onRetry,
    titleStyle,
    searchBarStyle,
  }) => {
    return (
      <View style={contentWrapperStyle}>
        <HomeHeader
          titleStyle={titleStyle}
          searchBarStyle={searchBarStyle}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          onSearchSubmit={onSearchSubmit}
        />
        <CategoryFilter
          activeCategory={activeCategory}
          onCategoryChange={onCategoryChange}
        />
        <PartyListContainer
          parties={parties}
          navigation={navigation}
          refreshing={refreshing}
          onRefresh={onRefresh}
          loadMore={loadMore}
          isPending={isPending}
          scrollHandler={scrollHandler}
          loading={loading}
          error={error}
          onRetry={onRetry}
        />
      </View>
    );
  },
  (prev, next) =>
    prev.activeCategory === next.activeCategory &&
    prev.searchQuery === next.searchQuery &&
    prev.parties === next.parties &&
    prev.refreshing === next.refreshing &&
    prev.loading === next.loading &&
    prev.error === next.error &&
    prev.isPending === next.isPending,
);

ScreenContent.displayName = 'ScreenContent';

export default function HomeScreen({
  navigation,
}: HomeScreenProps): React.JSX.Element {
  const { colors: themeColors } = useTheme();

  const [activeCategory, setActiveCategory] = React.useState<string>('all');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isPending, startTransition] = useTransition();
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { scrollY, scrollHandler, titleStyle, searchBarStyle, isScrolling } =
    useScrollAnimation();

  const { animatedStyle: screenAnimatedStyle, play: playScreenAnimation } =
    useScreenEnterAnimation();

  const {
    parties,
    refreshing,
    initialLoading,
    onRefresh,
    loadMore,
    reset,
    error,
  } = usePartyList(activeCategory, searchQuery);

  const handleCategoryChange = useCallback((key: string) => {
    startTransition(() => {
      setActiveCategory(key);
    });
  }, []);

  const handleSearchChange = useCallback(
    (text: string) => {
      setSearchQuery(text);

      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }

      searchDebounceRef.current = setTimeout(() => {
        reset();
      }, 500);
    },
    [reset],
  );

  const handleSearchSubmit = useCallback(() => {
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
      searchDebounceRef.current = null;
    }
    reset();
  }, [reset]);

  const handleRetry = useCallback(() => {
    reset();
  }, [reset]);

  useEffect(() => {
    playScreenAnimation();
  }, [playScreenAnimation]);

  useEffect(() => {
    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
    };
  }, []);

  if (initialLoading) {
    return (
      <SafeAreaView style={containerStyle} edges={['top']}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={themeColors.gray[900]}
          translucent={true}
        />
        <HomeBackground scrollY={scrollY} isScrolling={isScrolling} />
        <HomeLoadingState
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          onSearchSubmit={handleSearchSubmit}
          titleStyle={titleStyle}
          searchBarStyle={searchBarStyle}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={containerStyle} edges={['top']}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={themeColors.gray[900]}
        translucent={true}
      />
      <HomeBackground scrollY={scrollY} isScrolling={isScrolling} />
      <Animated.View
        style={[screenWrapperStyle, screenAnimatedStyle]}
        entering={EnteringAnimation.FadeIn()}
        layout={LinearTransition.springify()
          .damping(animation.spring.gentle.damping)
          .stiffness(animation.spring.gentle.stiffness)}
      >
        <ScreenContent
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          onSearchSubmit={handleSearchSubmit}
          parties={parties}
          navigation={navigation}
          refreshing={refreshing}
          onRefresh={onRefresh}
          loadMore={loadMore}
          isPending={isPending}
          scrollHandler={scrollHandler}
          loading={false}
          error={error}
          onRetry={handleRetry}
          titleStyle={titleStyle}
          searchBarStyle={searchBarStyle}
        />
      </Animated.View>
    </SafeAreaView>
  );
}
