/**
 * 禁用动画版本 - HomeHeader
 * 解决 Worklets 循环引用崩溃问题
 */
import React from 'react';
import { View, Text, ViewStyle, TextStyle } from 'react-native';
import { SearchBar, FilterButton } from './index';
import { useTheme, spacing, layout, typography } from '../../theme';

interface HomeHeaderProps {
  titleStyle: any;
  searchBarStyle: any;
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
      <View style={headerContainerStyle}>
        <Text style={[headerTitleStyle, titleStyle]}>
          发现精彩活动
        </Text>
        <Text style={[headerSubtitleStyle]}>
          探索附近的派对、聚会和社交活动
        </Text>
        <View style={[searchContainerStyle, searchBarStyle]}>
          <View style={searchRowStyle}>
            <SearchBar
              value={searchQuery}
              onChangeText={onSearchChange}
              onSubmit={onSearchSubmit}
            />
            <FilterButton />
          </View>
        </View>
      </View>
    );
  },
);

export default HomeHeader;

HomeHeader.displayName = 'HomeHeader';
