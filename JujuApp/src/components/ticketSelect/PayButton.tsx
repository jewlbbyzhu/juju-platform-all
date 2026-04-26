import React, { memo } from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated from 'react-native-reanimated';
import { SlideInUp } from 'react-native-reanimated';
import { usePressAnimation, useTheme } from '../../theme';
import { payButtonStyles as styles } from '../../styles/ticketSelect';

interface PayButtonProps {
  totalPrice: number;
  gradient: [string, string];
  disabled: boolean;
  loading: boolean;
  onPay: () => void;
}

export const PayButton: React.FC<PayButtonProps> = memo(
  ({ totalPrice, gradient, disabled, loading, onPay }) => {
    const { animatedStyle: pulseStyle } = usePressAnimation({ scale: 1 });
    const { animation } = useTheme();

    return (
      <Animated.View
        entering={SlideInUp.duration(animation.duration.normal).delay(300)}
        style={pulseStyle}
      >
        <TouchableOpacity
          style={[styles.button, disabled && styles.buttonDisabled]}
          onPress={onPay}
          disabled={disabled}
          activeOpacity={0.9}
        >
          <LinearGradient colors={gradient} style={styles.gradient}>
            <Text style={styles.text}>
              {loading ? '处理中...' : `¥${totalPrice} 立即支付`}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  },
);

PayButton.displayName = 'PayButton';
