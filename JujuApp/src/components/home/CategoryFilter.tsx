/**
 * 禁用动画版本 - CategoryFilter
 * 解决 Worklets 循环引用崩溃问题
 */
import React, { memo } from 'react';
import { View, ScrollView, ViewStyle } from 'react-native';
import { CategoryButton } from './CategoryButton';
import { CATEGORIES } from './PartyCard';
import { useTheme, spacing, layout } from '../../theme';

interface CategoryItemProps {
  category: (typeof CATEGORIES)[0];
  isActive: boolean;
  onPress: () => void;
  index: number;
}

const CategoryItem: React.FC<CategoryItemProps> = memo(
  ({ category, isActive, onPress, index }) => {
    const categoryItemWrapperStyle: ViewStyle = {
      position: 'relative',
    };

    const categoryGlowStyle: ViewStyle = {
      position: 'absolute',
      top: -4,
      left: -4,
      right: -4,
      bottom: -4,
      borderRadius: 999,
      backgroundColor: 'transparent',
      opacity: 0,
    };

    return (
      <View style={[categoryItemWrapperStyle]}>
        <View style={[categoryGlowStyle]} />
        <CategoryButton
          category={category}
          isActive={isActive}
          onPress={onPress}
        />
      </View>
    );
  },
);

interface CategoryFilterProps {
  activeCategory: string;
  onCategoryChange: (key: string) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = memo(
  ({ activeCategory, onCategoryChange }) => {
    const categoryContainerStyle: ViewStyle = {
      paddingVertical: spacing.md,
    };

    const categoryScrollStyle: ViewStyle = {
      flexDirection: 'row',
      paddingHorizontal: layout.screenPadding - spacing.sm,
      gap: spacing.sm,
    };

    return (
      <View style={[categoryContainerStyle]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={categoryScrollStyle}
          decelerationRate="fast"
          snapToInterval={spacing.md + 80}
        >
          {CATEGORIES.map((cat, index) => (
            <CategoryItem
              key={cat.key}
              category={cat}
              isActive={activeCategory === cat.key}
              onPress={() => onCategoryChange(cat.key)}
              index={index}
            />
          ))}
        </ScrollView>
      </View>
    );
  },
);

export default CategoryFilter;

CategoryItem.displayName = 'CategoryItem';

CategoryFilter.displayName = 'CategoryFilter';
