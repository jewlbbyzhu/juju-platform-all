import React, { useCallback } from 'react';
import { ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { animation } from '../../theme';

interface AnimatedPressableProps {
  children: React.ReactNode;
  onPress: () => void;
  onPressIn?: () => void;
  onPressOut?: () => void;
  style?: ViewStyle;
  disabled?: boolean;
}

export const AnimatedPressable: React.FC<AnimatedPressableProps> = ({
  children,
  onPress,
  onPressIn,
  onPressOut,
  style,
  disabled,
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.97, animation.spring.stiff);
    onPressIn?.();
  }, [onPressIn, scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, animation.spring.gentle);
    onPressOut?.();
  }, [onPressOut, scale]);

  return (
    <Animated.View
      style={[animatedStyle, style]}
      onTouchStart={handlePressIn}
      onTouchEnd={() => {
        if (!disabled) onPress();
        handlePressOut();
      }}
      onTouchCancel={handlePressOut}
    >
      {children}
    </Animated.View>
  );
};


export default AnimatedPressable;
