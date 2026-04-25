import React, { useEffect, memo } from 'react';
import { ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  withSpring,
  SlideInRight,
  SlideOutLeft,
} from 'react-native-reanimated';
import { CategoryButton } from './CategoryButton';
import { CATEGORIES } from './PartyCard';
import { useTheme, animation, spacing, layout, BorderRadius } from '../../theme';

interface CategoryItemProps {
  category: (typeof CATEGORIES)[0];
  isActive: boolean;
  onPress: () => void;
  index: number;
}

const CategoryItem: React.FC<CategoryItemProps> = memo(
  ({ category, isActive, onPress, index }) => {
    const { colors } = useTheme();
    const itemScale = useSharedValue(1);
    const itemOpacity = useSharedValue(isActive ? 1 : 0.7);
    const glowOpacity = useSharedValue(isActive ? 0.5 : 0);

    useEffect(() => {
      if (isActive) {
        itemScale.value = withSpring(1.05, animation.spring.bouncy);
        itemOpacity.value = withTiming(1, {
          duration: animation.duration.fast,
        });
        glowOpacity.value = withTiming(0.5, {
          duration: animation.duration.fast,
        });
      } else {
        itemScale.value = withSpring(1, animation.spring.gentle);
        itemOpacity.value = withTiming(0.7, {
          duration: animation.duration.fast,
        });
        glowOpacity.value = withTiming(0, {
          duration: animation.duration.fast,
        });
      }
    }, [isActive, itemScale, itemOpacity, glowOpacity]);

    const itemAnimatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: itemScale.value }],
      opacity: itemOpacity.value,
    }));

    const glowStyle = useAnimatedStyle(() => ({
      opacity: glowOpacity.value,
    }));

    // 使用设计系统替代 StyleSheet.create
    const categoryItemWrapperStyle: ViewStyle = {
      position: 'relative',
    };

    const categoryGlowStyle: ViewStyle = {
      position: 'absolute',
      top: -4,
      left: -4,
      right: -4,
      bottom: -4,
      borderRadius: BorderRadius.full,
      backgroundColor: colors.secondary.main,
      opacity: 0.3,
    };

    return (
      <Animated.View
        entering={SlideInRight.delay(index * 50 + 200)
          .duration(animation.duration.normal)
          .springify()
          .damping(18)}
        exiting={SlideOutLeft.duration(animation.duration.fast)}
        style={[categoryItemWrapperStyle, itemAnimatedStyle]}
      >
        <Animated.View style={[categoryGlowStyle, glowStyle]} />
        <CategoryButton
          category={category}
          isActive={isActive}
          onPress={onPress}
        />
      </Animated.View>
    );
  },
);

interface CategoryFilterProps {
  activeCategory: string;
  onCategoryChange: (key: string) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = memo(
  ({ activeCategory, onCategoryChange }) => {
    const containerOpacity = useSharedValue(0);
    const containerTranslateY = useSharedValue(30);

    useEffect(() => {
      containerOpacity.value = withDelay(
        150,
        withTiming(1, { duration: animation.duration.normal }),
      );
      containerTranslateY.value = withDelay(
        150,
        withSpring(0, { ...animation.spring.soft, damping: 16 }),
      );
    }, [containerOpacity, containerTranslateY]);

    const containerAnimatedStyle = useAnimatedStyle(() => ({
      opacity: containerOpacity.value,
      transform: [{ translateY: containerTranslateY.value }],
    }));

    // 使用设计系统替代 StyleSheet.create
    const categoryContainerStyle: ViewStyle = {
      paddingVertical: spacing.md,
    };

    const categoryScrollStyle: ViewStyle = {
      flexDirection: 'row',
      paddingHorizontal: layout.screenPadding - spacing.sm,
      gap: spacing.sm,
    };

    return (
      <Animated.View style={[categoryContainerStyle, containerAnimatedStyle]}>
        <Animated.ScrollView
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
        </Animated.ScrollView>
      </Animated.View>
    );
  },
);

export default CategoryFilter;
