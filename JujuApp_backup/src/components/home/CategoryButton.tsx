import React from 'react';
import { View, Text, TouchableOpacity, ViewStyle, TextStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import {useTheme, colors, animation, spacing, typography, BorderRadius} from '../../theme';

interface Category {
  key: string;
  label: string;
  icon: string;
  color: string;
}

interface CategoryButtonProps {
  category: Category;
  isActive: boolean;
  onPress: () => void;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export const CategoryButton: React.FC<CategoryButtonProps> = React.memo(
  ({ category, isActive, onPress }) => {
    const { colors: themeColors } = useTheme();
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    const handlePressIn = () => {
      scale.value = withSpring(0.95, animation.spring.stiff);
    };

    const handlePressOut = () => {
      scale.value = withSpring(1, animation.spring.gentle);
    };

    // 使用设计系统替代 StyleSheet.create
    const categoryButtonBaseStyle: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.md + 4,
      paddingVertical: spacing.sm,
      borderRadius: BorderRadius.full,
      backgroundColor: themeColors.background.input,
      marginHorizontal: spacing.xs,
      borderWidth: 1,
      borderColor: themeColors.border,
    };

    const categoryButtonActiveStyle: ViewStyle = {
      backgroundColor: colors.secondary.main + '33',
      borderColor: colors.secondary.main + '66',
    };

    const categoryIconStyle: TextStyle = {
      fontSize: 16,
      marginRight: spacing.xs + 2,
    };

    const categoryTextBaseStyle: TextStyle = {
      fontSize: typography.size.body2,
      color: themeColors.text.secondary,
      fontWeight: typography.weight.medium,
    };

    const categoryTextActiveStyle: TextStyle = {
      color: colors.secondary.light,
      fontWeight: typography.weight.semibold,
    };

    const categoryIndicatorStyle: ViewStyle = {
      position: 'absolute',
      bottom: 2,
      left: '30%',
      right: '30%',
      height: 3,
      justifyContent: 'center',
      alignItems: 'center',
    };

    const indicatorLineStyle: ViewStyle = {
      width: '100%',
      height: 3,
      borderRadius: BorderRadius.xs,
    };

    return (
      <AnimatedTouchable
        style={[
          categoryButtonBaseStyle,
          isActive && categoryButtonActiveStyle,
          animatedStyle,
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <Text style={categoryIconStyle}>{category.icon}</Text>
        <Text
          style={[categoryTextBaseStyle, isActive && categoryTextActiveStyle]}
        >
          {category.label}
        </Text>
        {isActive && (
          <View style={categoryIndicatorStyle}>
            <Animated.View
              style={[
                indicatorLineStyle,
                { backgroundColor: colors.secondary.main },
              ]}
            />
          </View>
        )}
      </AnimatedTouchable>
    );
  },
);
CategoryButton.displayName = 'CategoryButton';
