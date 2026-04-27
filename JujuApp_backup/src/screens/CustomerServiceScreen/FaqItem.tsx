import React, { useRef, useEffect, memo } from 'react';
import { View, Text, Animated, Pressable } from 'react-native';
import { useTheme, spacing } from '../../theme';
import type { Faq } from './types';

interface FaqItemProps {
  faq: Faq;
  isExpanded: boolean;
  onToggle: () => void;
  isLast: boolean;
  animationDelay: number;
}

export const FaqItem: React.FC<FaqItemProps> = memo(
  ({
    faq,
    isExpanded,
    onToggle,
    isLast,
    animationDelay,
  }) => {
    const { colors, textStyles } = useTheme();
    const expandHeight = useRef(new Animated.Value(0)).current;
    const arrowRotation = useRef(new Animated.Value(0)).current;
    const itemOpacity = useRef(new Animated.Value(0)).current;
    const itemTranslateY = useRef(new Animated.Value(10)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
      Animated.parallel([
        Animated.timing(itemOpacity, {
          toValue: 1,
          duration: 300,
          delay: animationDelay,
          useNativeDriver: true,
        }),
        Animated.spring(itemTranslateY, {
          toValue: 0,
          tension: 65,
          friction: 8,
          delay: animationDelay,
          useNativeDriver: true,
        }),
      ]).start();
    }, [itemOpacity, itemTranslateY, animationDelay]);

    useEffect(() => {
      Animated.parallel([
        Animated.timing(expandHeight, {
          toValue: isExpanded ? 1 : 0,
          duration: 250,
          useNativeDriver: false,
        }),
        Animated.spring(arrowRotation, {
          toValue: isExpanded ? 1 : 0,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    }, [isExpanded, expandHeight, arrowRotation]);

    const arrowRotate = arrowRotation.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '90deg'],
    });

    const handlePressIn = () => {
      Animated.spring(scaleAnim, {
        toValue: 0.98,
        tension: 150,
        friction: 10,
        useNativeDriver: true,
      }).start();
    };

    const handlePressOut = () => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 150,
        friction: 10,
        useNativeDriver: true,
      }).start();
    };

    const maxHeight = expandHeight.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 80],
    });

    return (
      <Animated.View
        style={{
          overflow: 'hidden',
          opacity: itemOpacity,
          transform: [{ translateY: itemTranslateY }, { scale: scaleAnim }],
        }}
      >
        <Pressable
          onPress={onToggle}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={({ pressed }) => ({
            paddingVertical: spacing.md + 2,
            paddingHorizontal: spacing.xs,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Text
              style={[
                textStyles.body,
                {
                  flex: 1,
                  marginRight: spacing.md,
                  color: isExpanded ? colors.primary.main : colors.text.primary,
                },
              ]}
              numberOfLines={2}
            >
              {faq.question}
            </Text>
            <Animated.Text
              style={{
                fontSize: 20,
                fontWeight: '300',
                color: colors.text.tertiary,
                transform: [{ rotate: arrowRotate }],
              }}
            >
              ›
            </Animated.Text>
          </View>

          <Animated.View
            style={{
              overflow: 'hidden',
              marginTop: spacing.md,
              maxHeight,
            }}
          >
            <Text
              style={[
                textStyles.body2,
                { color: colors.text.secondary, lineHeight: 20 },
              ]}
            >
              {faq.answer}
            </Text>
          </Animated.View>
        </Pressable>

        {!isLast && (
          <View
            style={{
              height: 1,
              backgroundColor: colors.divider,
            }}
          />
        )}
      </Animated.View>
    );
  },
);

FaqItem.displayName = 'FaqItem';

export default FaqItem;
