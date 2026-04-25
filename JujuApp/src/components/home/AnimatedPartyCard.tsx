import React, { useEffect, useCallback, memo } from 'react';
import {Dimensions, ViewStyle} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withSpring,
  withTiming,
  withSequence,
  interpolate,

  FadeInDown,
  SlideOutRight,

  LinearTransition,
  Easing,
} from 'react-native-reanimated';
import { PartyCard } from './PartyCard';
import { animation, spacing, BorderRadius } from '../../theme';
import type { NavigationProp } from '../../types';
import type { Party as PartyType } from '../../types/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface AnimatedPressableProps {
  children: React.ReactNode;
  onPress: () => void;
  onPressIn?: () => void;
  onPressOut?: () => void;
  style?: object;
  disabled?: boolean;
}

export const AnimatedPressable: React.FC<AnimatedPressableProps> = memo(
  ({ children, onPress, onPressIn, onPressOut, style, disabled }) => {
    const scale = useSharedValue(1);
    const opacity = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    }));

    const handlePressIn = useCallback(() => {
      scale.value = withSpring(0.96, {
        ...animation.spring.stiff,
        damping: 18,
      });
      opacity.value = withTiming(0.8, { duration: 100 });
      onPressIn?.();
    }, [onPressIn, scale, opacity]);

    const handlePressOut = useCallback(() => {
      scale.value = withSpring(1, {
        ...animation.spring.gentle,
        damping: 14,
      });
      opacity.value = withTiming(1, { duration: 100 });
      onPressOut?.();
    }, [onPressOut, scale, opacity]);

    return (
      <Animated.View
        style={[animatedStyle, style]}
        onTouchStart={handlePressIn}
        onTouchEnd={() => {
          if (!disabled) {
            onPress();
          }
          handlePressOut();
        }}
        onTouchCancel={handlePressOut}
      >
        {children}
      </Animated.View>
    );
  },
);
AnimatedPressable.displayName = 'AnimatedPressable';

interface AnimatedPartyCardProps {
  item: PartyType;
  index: number;
  navigation: NavigationProp;
}

export const AnimatedPartyCard: React.FC<AnimatedPartyCardProps> = memo(
  ({ item, index, navigation }) => {
    const scale = useSharedValue(0.8);
    const opacity = useSharedValue(0);
    const translateY = useSharedValue(40);
    const pressScale = useSharedValue(1);
    const shimmerPosition = useSharedValue(-1);
    const cardRotate = useSharedValue(0);

    useEffect(() => {
      const delay = index * 80;
      scale.value = withDelay(
        delay,
        withSpring(1, { ...animation.spring.gentle, damping: 14 }),
      );
      opacity.value = withDelay(
        delay,
        withTiming(1, { duration: animation.duration.normal }),
      );
      translateY.value = withDelay(
        delay,
        withSpring(0, { ...animation.spring.soft, damping: 16 }),
      );
    }, [index, scale, opacity, translateY]);

    useEffect(() => {
      shimmerPosition.value = withSequence(
        withTiming(1, { duration: 1500, easing: Easing.linear }),
        withTiming(-1, { duration: 0 }),
      );
    }, [shimmerPosition]);

    const animatedStyle = useAnimatedStyle(() => {
      const scaleVal = scale.value * pressScale.value;
      const translateYVal = translateY.value;
      const rotateVal = cardRotate.value;
      return {
        transform: [
          { scale: scaleVal },
          { translateY: translateYVal },
          { rotate: `${rotateVal}deg` },
        ] as any,
        opacity: opacity.value,
      };
    });

    const shimmerStyle = useAnimatedStyle(() => {
      const translateX = interpolate(
        shimmerPosition.value,
        [-1, 1],
        [-SCREEN_WIDTH * 0.5, SCREEN_WIDTH * 0.6],
      );
      return {
        transform: [{ translateX }],
      };
    });

    const handlePressIn = useCallback(() => {
      pressScale.value = withSpring(0.96, {
        ...animation.spring.stiff,
        damping: 20,
      });
      cardRotate.value = withSpring(-1, animation.spring.gentle);
    }, [pressScale, cardRotate]);

    const handlePressOut = useCallback(() => {
      pressScale.value = withSpring(1, {
        ...animation.spring.gentle,
        damping: 14,
      });
      cardRotate.value = withSpring(0, animation.spring.gentle);
    }, [pressScale, cardRotate]);

    // 使用设计系统替代 StyleSheet.create
    const gridItemWrapperStyle: ViewStyle = {
      width: '50%',
      padding: spacing.xs,
    };

    const cardWrapperStyle: ViewStyle = {
      overflow: 'hidden',
      borderRadius: BorderRadius.xl,
    };

    const shimmerViewStyle: ViewStyle = {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '50%',
      height: '100%',
      backgroundColor: 'rgba(255,255,255,0.1)',
      transform: [{ skewX: '-20deg' }],
    };

    return (
      <Animated.View
        layout={LinearTransition.springify().damping(18).stiffness(100).mass(1)}
        entering={FadeInDown.delay(index * 80)
          .duration(animation.duration.dramatic)
          .springify()
          .damping(15)}
        exiting={SlideOutRight.duration(animation.duration.fast)}
        style={gridItemWrapperStyle}
      >
        <Animated.View style={animatedStyle}>
          <AnimatedPressable
            onPress={() =>
              navigation.navigate('PartyDetail', { partyId: String(item.id) })
            }
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={cardWrapperStyle}
          >
            <PartyCard item={item} index={index} navigation={navigation} />
            <Animated.View style={[shimmerViewStyle, shimmerStyle]} />
          </AnimatedPressable>
        </Animated.View>
      </Animated.View>
    );
  },
);
AnimatedPartyCard.displayName = 'AnimatedPartyCard';
