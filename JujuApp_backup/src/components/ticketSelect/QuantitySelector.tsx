import React, { memo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Animated from 'react-native-reanimated';
import { usePressAnimation } from '../../theme';
import { GlassCard } from '../GlassCard';
import { quantitySelectorStyles as styles } from '../../styles/ticketSelect';

interface QuantitySelectorProps {
  quantity: number;
  maxQuantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
}

export const QuantitySelector: React.FC<QuantitySelectorProps> = memo(
  ({ quantity, maxQuantity, onIncrease, onDecrease }) => {
    const {
      animatedStyle: minusStyle,
      handlePressIn: handleMinusIn,
      handlePressOut: handleMinusOut,
    } = usePressAnimation({ scale: 0.85 });
    const {
      animatedStyle: plusStyle,
      handlePressIn: handlePlusIn,
      handlePressOut: handlePlusOut,
    } = usePressAnimation({ scale: 0.85 });

    return (
      <GlassCard intensity="light" title="购买数量">
        <View style={styles.selector}>
          <Animated.View style={minusStyle}>
            <TouchableOpacity
              style={[styles.button, quantity <= 1 && styles.buttonDisabled]}
              onPressIn={handleMinusIn}
              onPressOut={handleMinusOut}
              onPress={onDecrease}
              disabled={quantity <= 1}
            >
              <Text
                style={[
                  styles.buttonText,
                  quantity <= 1 && styles.buttonTextDisabled,
                ]}
              >
                −
              </Text>
            </TouchableOpacity>
          </Animated.View>
          <View style={styles.display}>
            <Text style={styles.quantityText}>{quantity}</Text>
          </View>
          <Animated.View style={plusStyle}>
            <TouchableOpacity
              style={[
                styles.button,
                quantity >= maxQuantity && styles.buttonDisabled,
              ]}
              onPressIn={handlePlusIn}
              onPressOut={handlePlusOut}
              onPress={onIncrease}
              disabled={quantity >= maxQuantity}
            >
              <Text
                style={[
                  styles.buttonText,
                  quantity >= maxQuantity && styles.buttonTextDisabled,
                ]}
              >
                +
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </GlassCard>
    );
  },
);

QuantitySelector.displayName = 'QuantitySelector';
