import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, { FadeInUp } from 'react-native-reanimated';
import {
  glassmorphism,
  colors,
  typography,
  spacing,
  animation,
  gradients,
} from '../../theme';

interface TicketTypeItem {
  id: number;
  name: string;
  price: number;
  description?: string;
  current_stock?: number;
  available_count?: number;
  original_price?: number;
}

interface PriceCardProps {
  price: number;
  remainingSpots: number;
  priceDisplay?: string;
  ticketCount?: number;
  ticketTypes?: TicketTypeItem[];
  onTicketSelect?: (ticket: TicketTypeItem) => void;
  selectedTicketId?: number;
}

export const PriceCard: React.FC<PriceCardProps> = React.memo(
  ({ price, remainingSpots, priceDisplay, ticketCount = 1, ticketTypes, onTicketSelect, selectedTicketId }) => {
    const styles = useMemo(
      () =>
        StyleSheet.create({
          card: {
            borderRadius: 20,
            marginBottom: spacing.md,
            padding: 20,
          },
          section: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          },
          label: {
            fontSize: typography.size.caption,
            color: colors.text.inverse + 'CC',
            marginBottom: 4,
          },
          priceRow: {
            flexDirection: 'row',
            alignItems: 'baseline',
          },
          currency: {
            fontSize: typography.size.h3,
            fontWeight: typography.weight.bold,
            color: colors.text.inverse,
          },
          value: {
            fontSize: typography.size.h1,
            fontWeight: typography.weight.bold,
            color: colors.text.inverse,
          },
          unit: {
            fontSize: typography.size.body,
            color: colors.text.inverse + 'CC',
          },
          spotsBadge: {
            paddingHorizontal: 12,
            paddingVertical: 6,
            backgroundColor: colors.text.inverse + '33',
            borderRadius: 16,
          },
          spotsText: {
            fontSize: typography.size.caption,
            fontWeight: typography.weight.medium,
            color: colors.text.inverse,
          },
          ticketList: {
            marginTop: 16,
            gap: 8,
          },
          ticketItem: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 12,
            borderRadius: 12,
            backgroundColor: colors.text.inverse + '15',
            borderWidth: 1,
            borderColor: 'transparent',
          },
          ticketItemSelected: {
            borderColor: colors.text.inverse,
            backgroundColor: colors.text.inverse + '25',
          },
          ticketItemLeft: {
            flex: 1,
          },
          ticketItemName: {
            fontSize: typography.size.body,
            fontWeight: typography.weight.semibold,
            color: colors.text.inverse,
          },
          ticketItemDesc: {
            fontSize: typography.size.caption,
            color: colors.text.inverse + 'AA',
            marginTop: 2,
          },
          ticketItemStock: {
            fontSize: typography.size.caption,
            color: colors.text.inverse + '99',
            marginTop: 2,
          },
          ticketItemRight: {
            alignItems: 'flex-end',
          },
          ticketItemPrice: {
            fontSize: typography.size.h4,
            fontWeight: typography.weight.bold,
            color: colors.text.inverse,
          },
          checkIcon: {
            width: 20,
            height: 20,
            borderRadius: 10,
            backgroundColor: colors.text.inverse,
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 4,
          },
          checkIconText: {
            fontSize: 12,
            fontWeight: typography.weight.bold,
            color: colors.primary.main,
          },
          soldOutBadge: {
            paddingHorizontal: 8,
            paddingVertical: 2,
            backgroundColor: colors.status.error + '30',
            borderRadius: 8,
            marginTop: 4,
          },
          soldOutText: {
            fontSize: typography.size.caption,
            fontWeight: typography.weight.medium,
            color: colors.status.error,
          },
          originalPrice: {
            fontSize: typography.size.caption,
            color: colors.text.inverse + '60',
            textDecorationLine: 'line-through',
            marginTop: 2,
          },
          discountBadge: {
            paddingHorizontal: 6,
            paddingVertical: 2,
            backgroundColor: colors.status.warning + '30',
            borderRadius: 6,
            marginTop: 4,
          },
          discountText: {
            fontSize: typography.size.caption,
            fontWeight: typography.weight.medium,
            color: colors.status.warning,
          },
        }),
      [],
    );

    const hasMultipleTickets = (ticketTypes?.length || 0) > 1;
    const hasSingleTicket = (ticketTypes?.length || 0) === 1;

    return (
      <Animated.View
        entering={FadeInUp.duration(animation.duration.normal).delay(200)}
      >
        <LinearGradient colors={gradients.warm} style={styles.card}>
          <View style={styles.section}>
            <View>
              <Text style={styles.label}>票价</Text>
              <View style={styles.priceRow}>
                <Text style={styles.currency}>¥</Text>
                <Text style={styles.value}>{priceDisplay || price}</Text>
                {(ticketCount <= 1 || hasSingleTicket) && <Text style={styles.unit}>/人</Text>}
              </View>
              {ticketCount > 1 && !hasMultipleTickets && (
                <Text style={styles.unit}>{ticketCount} 种票型可选</Text>
              )}
            </View>
            <View style={[styles.spotsBadge, glassmorphism.chip]}>
              <Text style={styles.spotsText}>剩余 {remainingSpots} 个名额</Text>
            </View>
          </View>

          {/* 单票型也展示详细信息 */}
          {hasSingleTicket && ticketTypes?.[0] && (
            <View style={styles.ticketList}>
              {ticketTypes.map((ticket) => {
                const isSelected = selectedTicketId === ticket.id;
                const stock = ticket.current_stock ?? ticket.available_count ?? 0;
                const isSoldOut = stock <= 0;
                return (
                  <TouchableOpacity
                    key={ticket.id}
                    style={[
                      styles.ticketItem,
                      isSelected && styles.ticketItemSelected,
                      isSoldOut && { opacity: 0.6 },
                    ]}
                    onPress={() => !isSoldOut && onTicketSelect?.(ticket)}
                    activeOpacity={0.8}
                    disabled={isSoldOut}
                  >
                    <View style={styles.ticketItemLeft}>
                      <Text style={styles.ticketItemName}>{ticket.name}</Text>
                      {ticket.description ? (
                        <Text style={styles.ticketItemDesc}>{ticket.description}</Text>
                      ) : null}
                      {isSoldOut ? (
                        <View style={styles.soldOutBadge}>
                          <Text style={styles.soldOutText}>已售罄</Text>
                        </View>
                      ) : (
                        <Text style={styles.ticketItemStock}>剩余 {stock} 张</Text>
                      )}
                    </View>
                    <View style={styles.ticketItemRight}>
                      <Text style={styles.ticketItemPrice}>
                        {ticket.price === 0 ? '免费' : `¥${ticket.price}`}
                      </Text>
                      {isSelected && !isSoldOut && (
                        <View style={styles.checkIcon}>
                          <Text style={styles.checkIconText}>✓</Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* 多票型选择列表 */}
          {hasMultipleTickets && onTicketSelect && (
            <View style={styles.ticketList}>
              {ticketTypes?.map((ticket) => {
                const isSelected = selectedTicketId === ticket.id;
                const stock = ticket.current_stock ?? ticket.available_count ?? 0;
                const isSoldOut = stock <= 0;
                const hasDiscount = ticket.original_price && ticket.original_price > ticket.price;
                return (
                  <TouchableOpacity
                    key={ticket.id}
                    style={[
                      styles.ticketItem,
                      isSelected && styles.ticketItemSelected,
                      isSoldOut && { opacity: 0.6 },
                    ]}
                    onPress={() => !isSoldOut && onTicketSelect(ticket)}
                    activeOpacity={0.8}
                    disabled={isSoldOut}
                  >
                    <View style={styles.ticketItemLeft}>
                      <Text style={styles.ticketItemName}>{ticket.name}</Text>
                      {ticket.description ? (
                        <Text style={styles.ticketItemDesc}>{ticket.description}</Text>
                      ) : null}
                      {isSoldOut ? (
                        <View style={styles.soldOutBadge}>
                          <Text style={styles.soldOutText}>已售罄</Text>
                        </View>
                      ) : (
                        <Text style={styles.ticketItemStock}>剩余 {stock} 张</Text>
                      )}
                    </View>
                    <View style={styles.ticketItemRight}>
                      <Text style={styles.ticketItemPrice}>
                        {ticket.price === 0 ? '免费' : `¥${ticket.price}`}
                      </Text>
                      {hasDiscount && (
                        <Text style={styles.originalPrice}>
                          ¥{ticket.original_price}
                        </Text>
                      )}
                      {isSelected && !isSoldOut && (
                        <View style={styles.checkIcon}>
                          <Text style={styles.checkIconText}>✓</Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </LinearGradient>
      </Animated.View>
    );
  },
);

PriceCard.displayName = 'PriceCard';
