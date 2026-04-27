import React from 'react';
import { TouchableOpacity, Text, ViewStyle, TextStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useTheme, spacing, BorderRadius, Border } from '../../theme';

export const FilterButton: React.FC = React.memo(() => {
  const { colors } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.9, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  // 使用设计系统替代 StyleSheet.create
  const filterButtonStyle: ViewStyle = {
    marginLeft: spacing.md,
    padding: spacing.sm + 2,
    backgroundColor: colors.background.input,
    borderRadius: BorderRadius.md,
    borderWidth: Border.width.normal,
    borderColor: colors.border,
  };

  const touchableStyle: ViewStyle = {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  };

  const filterIconStyle: TextStyle = {
    fontSize: 18,
  };

  return (
    <Animated.View style={[filterButtonStyle, animatedStyle]}>
      <TouchableOpacity
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        style={touchableStyle}
      >
        <Text style={filterIconStyle}>⚙️</Text>
      </TouchableOpacity>
    </Animated.View>
  );
});
FilterButton.displayName = 'FilterButton';
