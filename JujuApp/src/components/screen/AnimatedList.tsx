import React, { useMemo } from 'react';
import { ViewStyle } from 'react-native';
import Animated, {
  FadeInUp,
  FadeInDown,
  FadeInLeft,
  FadeInRight,
  SlideInUp,
  ZoomIn,
} from 'react-native-reanimated';
import { animation } from '../../theme';

export type StaggerDirection = 'up' | 'down' | 'left' | 'right';
export type AnimationType = 'fade' | 'slide' | 'zoom';

export interface AnimatedItemProps {
  children: React.ReactNode;
  index: number;
  delay?: number;
  direction?: StaggerDirection;
  animationType?: AnimationType;
  style?: ViewStyle;
}

export function AnimatedItem({
  children,
  index,
  delay = 50,
  direction = 'up',
  animationType = 'fade',
  style,
}: AnimatedItemProps): React.JSX.Element {
  const baseDelay = index * delay;

  const entering = useMemo(() => {
    const config = {
      duration: animation.duration.normal,
      damping: 15,
    };

    switch (animationType) {
      case 'slide':
        return SlideInUp.delay(baseDelay).damping(15);
      case 'zoom':
        return ZoomIn.delay(baseDelay).damping(15);
      case 'fade':
      default:
        switch (direction) {
          case 'down':
            return FadeInDown.delay(baseDelay)
              .springify()
              .damping(config.damping);
          case 'left':
            return FadeInLeft.delay(baseDelay)
              .springify()
              .damping(config.damping);
          case 'right':
            return FadeInRight.delay(baseDelay)
              .springify()
              .damping(config.damping);
          case 'up':
          default:
            return FadeInUp.delay(baseDelay)
              .springify()
              .damping(config.damping);
        }
    }
  }, [baseDelay, animationType, direction]);

  return (
    <Animated.View entering={entering} style={style}>
      {children}
    </Animated.View>
  );
}

export interface AnimatedListProps {
  children: React.ReactNode[];
  staggerDelay?: number;
  direction?: StaggerDirection;
  animationType?: AnimationType;
  containerStyle?: ViewStyle;
}

export function AnimatedList({
  children,
  staggerDelay = 50,
  direction = 'up',
  animationType = 'fade',
  containerStyle,
}: AnimatedListProps): React.JSX.Element {
  return (
    <>
      {children.map((child, index) => (
        <AnimatedItem
          key={`animated-item-${index}`}
          index={index}
          delay={staggerDelay}
          direction={direction}
          animationType={animationType}
          style={containerStyle}
        >
          {child}
        </AnimatedItem>
      ))}
    </>
  );
}

export default AnimatedItem;
