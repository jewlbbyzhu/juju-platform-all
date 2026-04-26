import React, { useRef, useCallback, useState } from 'react';
import {
  TextInput,
  TouchableOpacity,
  Animated,
  StyleSheet,
} from 'react-native';
import { GlassCard } from '../GlassCard';
import { GlassButton } from '../GlassButton';
import {
  colors,
  spacing,
  typography,
  BorderRadius,
} from '../../theme';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onSearch: () => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = React.memo(
  ({ value, onChangeText, onSearch, placeholder = '搜索地点...' }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const [isFocused, setIsFocused] = useState(false);

    const handleFocus = useCallback(() => {
      setIsFocused(true);
    }, []);

    const handleBlur = useCallback(() => {
      setIsFocused(false);
    }, []);

    const handlePressIn = useCallback(() => {
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        useNativeDriver: true,
      }).start();
    }, [scaleAnim]);

    const handlePressOut = useCallback(() => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    }, [scaleAnim]);

    const inputBorderColor = isFocused
      ? colors.primary.main + '4D'
      : colors.primary.main + '1A';

    const styles = useCallback(
      () =>
        StyleSheet.create({
          container: {
            marginHorizontal: spacing.md,
            marginTop: -10,
            marginBottom: spacing.sm,
            zIndex: 10,
          },
          searchBar: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.sm,
            padding: 4,
          },
          searchInput: {
            flex: 1,
            backgroundColor: colors.background.input,
            borderRadius: BorderRadius.md,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm + 2,
            color: colors.text.primary,
            fontSize: typography.size.body,
            borderWidth: 1,
            borderColor: inputBorderColor,
          },
        }),
      [inputBorderColor],
    )();

    return (
      <Animated.View
        style={[styles.container, { transform: [{ scale: scaleAnim }] }]}
      >
        <GlassCard style={styles.searchBar} intensity="light">
          <TextInput
            style={styles.searchInput}
            placeholder={placeholder}
            placeholderTextColor={colors.text.tertiary}
            value={value}
            onChangeText={onChangeText}
            onSubmitEditing={onSearch}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
          <TouchableOpacity
            onPress={onSearch}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            activeOpacity={1}
          >
            <GlassButton
              title="搜索"
              onPress={onSearch}
              variant="primary"
              size="small"
            />
          </TouchableOpacity>
        </GlassCard>
      </Animated.View>
    );
  },
);

SearchBar.displayName = 'SearchBar';
