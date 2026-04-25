import React, { useState } from 'react';
import { View, TextInput, ViewStyle, TextStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { useTheme, spacing, typography, BorderRadius } from '../../theme';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = React.memo(
  ({ value, onChangeText, onSubmit }) => {
    const { colors } = useTheme();
    const [isFocused, setIsFocused] = useState(false);
    const borderOpacity = useSharedValue(0.1);
    const scale = useSharedValue(1);

    const animatedBorderStyle = useAnimatedStyle(() => ({
      borderColor: `rgba(123, 97, 255, ${borderOpacity.value})`,
    }));

    const animatedContainerStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    const handleFocus = () => {
      setIsFocused(true);
      borderOpacity.value = withTiming(0.6, { duration: 200 });
      scale.value = withTiming(1.02, { duration: 200 });
    };

    const handleBlur = () => {
      setIsFocused(false);
      borderOpacity.value = withTiming(0.1, { duration: 200 });
      scale.value = withTiming(1, { duration: 200 });
    };

    // 使用设计系统替代 StyleSheet.create
    const searchContainerStyle: ViewStyle = {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.background.input,
      borderRadius: BorderRadius.lg,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm + 2,
      borderWidth: 1,
    };

    const iconContainerStyle: ViewStyle = {
      marginRight: spacing.sm,
    };

    const searchIconBaseStyle: TextStyle = {
      fontSize: 16,
      opacity: 0.6,
    };

    const searchIconActiveStyle: TextStyle = {
      opacity: 1,
    };

    const searchInputStyle: TextStyle = {
      flex: 1,
      fontSize: typography.size.body,
      color: colors.text.primary,
      padding: 0,
    };

    return (
      <Animated.View
        style={[
          searchContainerStyle,
          animatedBorderStyle,
          animatedContainerStyle,
        ]}
      >
        <View style={iconContainerStyle}>
          <Animated.Text
            style={[searchIconBaseStyle, isFocused && searchIconActiveStyle]}
          >
            🔍
          </Animated.Text>
        </View>
        <TextInput
          style={searchInputStyle}
          placeholder="搜索聚会、活动、地点..."
          placeholderTextColor={colors.text.tertiary}
          value={value}
          onChangeText={onChangeText}
          onSubmitEditing={onSubmit}
          onFocus={handleFocus}
          onBlur={handleBlur}
          returnKeyType="search"
        />
      </Animated.View>
    );
  },
);
