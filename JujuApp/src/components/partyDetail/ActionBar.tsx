import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { glassmorphism, colors, typography, animation } from '../../theme';

interface ActionBarProps {
  price: number;
  canJoin: boolean;
  isFull: boolean;
  isEnded: boolean;
  onJoin: () => void;
  priceDisplay?: string;
}

export const ActionBar: React.FC<ActionBarProps> = React.memo(
  ({ price, canJoin, isFull, isEnded, onJoin, priceDisplay }) => {
    const buttonScale = useSharedValue(1);

    const buttonAnimatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: buttonScale.value }],
    }));

    const handlePressIn = () => {
      buttonScale.value = withSpring(0.95, animation.spring.gentle);
    };

    const handlePressOut = () => {
      buttonScale.value = withSpring(1, animation.spring.gentle);
    };

    const styles = useMemo(
      () =>
        StyleSheet.create({
          bar: {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 20,
            paddingVertical: 12,
            paddingBottom: 28,
          },
          priceSection: {
            flex: 1,
          },
          priceLabel: {
            fontSize: typography.size.caption,
            color: colors.text.tertiary,
          },
          priceRow: {
            flexDirection: 'row',
            alignItems: 'baseline',
          },
          priceCurrency: {
            fontSize: typography.size.h4,
            fontWeight: typography.weight.bold,
            color: colors.primary.main,
          },
          priceValue: {
            fontSize: typography.size.h2,
            fontWeight: typography.weight.bold,
            color: colors.primary.main,
          },
          buttonWrapper: {
            width: 160,
            height: 48,
            borderRadius: 24,
            overflow: 'hidden',
          },
          buttonDisabled: {
            opacity: 0.6,
          },
          buttonInner: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          },
          buttonText: {
            fontSize: typography.size.body,
            fontWeight: typography.weight.bold,
            color: colors.text.inverse,
          },
        }),
      [],
    );

    const getButtonText = () => {
      if (isEnded) return '已结束';
      if (isFull) return '已满员';
      return '立即报名';
    };

    const getPriceLabel = () => {
      if (isEnded) return '活动已结束';
      if (isFull) return '名额已满';
      return '总价';
    };

    const displayPrice = priceDisplay || (price > 0 ? `${price}` : '免费');

    return (
      <Animated.View
        entering={FadeIn.duration(animation.duration.normal)}
        style={[styles.bar, glassmorphism.navbar]}
      >
        <View style={styles.priceSection}>
          <Text style={styles.priceLabel}>{getPriceLabel()}</Text>
          <View style={styles.priceRow}>
            {!isEnded && !isFull && <Text style={styles.priceCurrency}>¥</Text>}
            <Text style={styles.priceValue}>{displayPrice}</Text>
          </View>
        </View>
        <Animated.View style={buttonAnimatedStyle}>
          <Pressable
            style={[styles.buttonWrapper, !canJoin && styles.buttonDisabled]}
            onPress={onJoin}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={!canJoin}
          >
            <LinearGradient
              colors={
                canJoin
                  ? [colors.primary.main, colors.primary.dark]
                  : [colors.gray[400], colors.gray[300]]
              }
              style={styles.buttonInner}
            >
              <Text style={styles.buttonText}>{getButtonText()}</Text>
            </LinearGradient>
          </Pressable>
        </Animated.View>
      </Animated.View>
    );
  },
);

ActionBar.displayName = 'ActionBar';
