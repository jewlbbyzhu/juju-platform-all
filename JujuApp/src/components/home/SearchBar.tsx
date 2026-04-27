/**
 * 禁用动画版本 - SearchBar
 * 解决 Worklets 循环引用崩溃问题
 */
import React, { useState } from 'react';
import { View, TextInput, ViewStyle, TextStyle } from 'react-native';
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

    const searchContainerStyle: ViewStyle = {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.background.input,
      borderRadius: BorderRadius.lg,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm + 2,
      borderWidth: 1,
      borderColor: isFocused ? 'rgba(123, 97, 255, 0.6)' : 'rgba(123, 97, 255, 0.1)',
      transform: [{ scale: isFocused ? 1.02 : 1 }],
    };

    const iconContainerStyle: ViewStyle = {
      marginRight: spacing.sm,
    };

    const searchIconBaseStyle: TextStyle = {
      fontSize: 16,
      opacity: isFocused ? 1 : 0.6,
    };

    const searchInputStyle: TextStyle = {
      flex: 1,
      fontSize: typography.size.body,
      color: colors.text.primary,
      padding: 0,
    };

    return (
      <View style={searchContainerStyle}>
        <View style={iconContainerStyle}>
          <View style={searchIconBaseStyle}>
            <TextStyle>🔍</TextStyle>
          </View>
        </View>
        <TextInput
          style={searchInputStyle}
          placeholder="搜索聚会、活动、地点..."
          placeholderTextColor={colors.text.tertiary}
          value={value}
          onChangeText={onChangeText}
          onSubmitEditing={onSubmit}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          returnKeyType="search"
        />
      </View>
    );
  },
);
SearchBar.displayName = 'SearchBar';
