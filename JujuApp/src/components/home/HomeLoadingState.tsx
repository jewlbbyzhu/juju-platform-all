/**
 * 禁用动画版本 - HomeLoadingState
 * 解决 Worklets 循环引用崩溃问题
 */
import React from 'react';
import { View, ViewStyle } from 'react-native';
import { SkeletonList } from '../Skeleton';
import HomeHeader from './HomeHeader';

interface HomeLoadingStateProps {
  searchQuery: string;
  onSearchChange: (text: string) => void;
  onSearchSubmit: () => void;
  titleStyle: any;
  searchBarStyle: any;
}

const HomeLoadingState: React.FC<HomeLoadingStateProps> = React.memo(
  ({
    searchQuery,
    onSearchChange,
    onSearchSubmit,
    titleStyle,
    searchBarStyle,
  }) => {
    const loadingContentStyle: ViewStyle = {
      flex: 1,
    };

    const skeletonContainerStyle: ViewStyle = {
      flex: 1,
    };

    return (
      <View style={loadingContentStyle}>
        <HomeHeader
          titleStyle={titleStyle}
          searchBarStyle={searchBarStyle}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          onSearchSubmit={onSearchSubmit}
        />
        <View style={[skeletonContainerStyle]}>
          <SkeletonList count={4} />
        </View>
      </View>
    );
  },
);

export default HomeLoadingState;

HomeLoadingState.displayName = 'HomeLoadingState';
