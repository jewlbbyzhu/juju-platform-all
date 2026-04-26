import React, { memo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { usePressAnimation, useListItemAnimation } from '../../theme';
import { TicketType } from '../../hooks/useTicketSelect';
import { ticketCardStyles as styles } from '../../styles/ticketSelect';

interface TicketCardProps {
  ticket: TicketType;
  selected: boolean;
  onPress: () => void;
  index: number;
}

export const TicketCard: React.FC<TicketCardProps> = memo(
  ({ ticket, selected, onPress, index }) => {
    const {
      animatedStyle: pressStyle,
      handlePressIn,
      handlePressOut,
    } = usePressAnimation({ scale: 0.97 });
    const { animatedStyle: entranceStyle } = useListItemAnimation(index, 100);

    return (
      <Animated.View style={entranceStyle}>
        <Animated.View style={pressStyle}>
          <TouchableOpacity
            style={[
              styles.card,
              selected && styles.cardSelected,
              ticket.isVip && styles.cardVip,
            ]}
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            activeOpacity={1}
          >
            {ticket.isVip && (
              <LinearGradient colors={ticket.gradient} style={styles.vipBadge}>
                <Text style={styles.vipBadgeText}>VIP</Text>
              </LinearGradient>
            )}

            <LinearGradient
              colors={ticket.gradient}
              style={styles.gradientBar}
            />

            <View style={styles.content}>
              <View style={styles.header}>
                <View style={styles.nameSection}>
                  <Text style={styles.name}>{ticket.name}</Text>
                  <View style={styles.remainingBadge}>
                    <Text style={styles.remaining}>
                      剩余 {ticket.remaining} 张
                    </Text>
                  </View>
                </View>
                <View style={styles.priceSection}>
                  {ticket.originalPrice && (
                    <Text style={styles.originalPrice}>
                      ¥{ticket.originalPrice}
                    </Text>
                  )}
                  <View style={styles.priceRow}>
                    <LinearGradient
                      colors={ticket.gradient}
                      style={styles.priceTag}
                    >
                      <Text style={styles.currency}>¥</Text>
                      <Text style={styles.price}>{ticket.price}</Text>
                    </LinearGradient>
                  </View>
                </View>
              </View>

              <Text style={styles.description}>{ticket.description}</Text>

              <View style={styles.featuresList}>
                {ticket.features.map((feature, idx) => (
                  <View key={idx} style={styles.featureItem}>
                    <Text style={styles.featureIcon}>✓</Text>
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>

              {selected && (
                <Animated.View entering={ZoomIn.duration(200)}>
                  <LinearGradient
                    colors={ticket.gradient}
                    style={styles.selectedIndicator}
                  >
                    <Text style={styles.selectedText}>已选择</Text>
                  </LinearGradient>
                </Animated.View>
              )}
            </View>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    );
  },
);

TicketCard.displayName = 'TicketCard';
