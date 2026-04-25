import React, { useCallback } from 'react';
import { Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useTheme } from '../../theme';
import { BorderRadius, Border } from '../../theme/shadows';

interface TagOption {
  key: string;
  label: string;
  color?: string;
}

interface TagSelectorProps {
  options: TagOption[];
  selected: string;
  onSelect: (key: string) => void;
}

const AnimatedTouchable = Animated.createAnimatedComponent(
//   require('react-native').TouchableOpacity,
);

export const TagSelector: React.FC<TagSelectorProps> = ({
  options,
  selected,
  onSelect,
}) => {
  const { colors, spacing, typography } = useTheme();
  const styles = getStyles(colors, spacing, typography);

  const handlePress = useCallback(
    (key: string) => {
      onSelect(key);
    },
    [onSelect],
  );

  return (
    <Animated.View style={styles.container}>
      {options.map(option => (
        <TagItem
          key={option.key}
          option={option}
          isSelected={selected === option.key}
          onPress={() => handlePress(option.key)}
          activeColor={option.color}
        />
      ))}
    </Animated.View>
  );
};

interface TagItemProps {
  option: TagOption;
  isSelected: boolean;
  onPress: () => void;
  activeColor?: string;
}

const TagItem: React.FC<TagItemProps> = ({
  option,
  isSelected,
  onPress,
  activeColor,
}) => {
  const { colors, spacing, typography } = useTheme();
  const styles = getStyles(colors, spacing, typography);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 400 });
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  }, [scale]);

  const tagColor =
    isSelected && activeColor ? activeColor : colors.primary.main;

  return (
    <AnimatedTouchable
      style={[
        styles.tag,
        isSelected && styles.tagSelected,
        isSelected && { borderColor: tagColor },
        animatedStyle,
      ]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
    >
      <Text
        style={[
          styles.tagText,
          isSelected && styles.tagTextSelected,
          isSelected && { color: tagColor },
        ]}
      >
        {option.label}
      </Text>
    </AnimatedTouchable>
  );
};

const getStyles = (colors: any, spacing: any, typography: any) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    tag: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: BorderRadius.full,
      backgroundColor: colors.background.input,
      borderWidth: Border.width.normal,
      borderColor: colors.border,
    },
    tagSelected: {
      backgroundColor: colors.primary.light,
      borderWidth: Border.width.thick,
    },
    tagText: {
      ...typography.body2,
      color: colors.text.secondary,
    },
    tagTextSelected: {
      fontWeight: typography.weight.semibold,
    },
  });

export default TagSelector;
