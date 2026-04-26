import React, { memo } from 'react';
import { View, Text } from 'react-native';
import Animated from 'react-native-reanimated';
import { useNumberAnimation } from '../../theme';
import { priceBreakdownStyles as styles } from '../../styles/ticketSelect';

interface PriceBreakdownProps {
  totalPrice: number;
  quantity: number;
  ticketName: string;
}

export const PriceBreakdown: React.FC<PriceBreakdownProps> = memo(
  ({ totalPrice, quantity, ticketName }) => {
    const { animatedStyle: priceAnimationStyle } = useNumberAnimation(
      totalPrice,
      300,
    );

    return (
      <View style={styles.container}>
        <View style={styles.row}>
          <Text style={styles.label}>
            {ticketName} × {quantity}
          </Text>
          <Animated.Text style={[styles.value, priceAnimationStyle]}>
            ¥{totalPrice}
          </Animated.Text>
        </View>
      </View>
    );
  },
);

PriceBreakdown.displayName = 'PriceBreakdown';
