/**
 * 聚聚 (JUJU) App - 选票页面
 * 2026 设计系统重构版
 */

import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import {
  useTheme,




  animation,
  gradients,
} from '../theme';
import { HapticFeedback } from '../components/HapticFeedback';
import { useTicketSelect } from '../hooks/useTicketSelect';
import {
  TicketCard,
  QuantitySelector,
  ContactForm,
  PriceBreakdown,
  PayButton,
  PartyInfoCard,
} from '../components/ticketSelect';
import {
  ticketSelectStyles as styles,
  paymentBarStyles as paymentStyles,
} from '../styles/ticketSelect';

interface RouteParams {
  partyId?: string;
}

export default function TicketSelectScreen(): React.JSX.Element {
  useTheme();
  const route = useRoute<RouteProp<{ params: RouteParams }, 'params'>>();
  const navigation = useNavigation();
  const partyId = route.params?.partyId;

  const {
    tickets,
    party,
    selectedTicket,
    quantity,
    contactName,
    contactPhone,
    loading,
    submitting,
    selectedTicketData,
    totalPrice,
    maxQuantity,
    handleTicketSelect,
    handleQuantityChange,
    handleNameChange,
    handlePhoneChange,
    handleSubmit,
  } = useTicketSelect({ partyId, onSubmitSuccess: () => {
    (navigation as any).navigate('MyOrders');
  }});

  const defaultGradient = gradients.primary as [string, string];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <HapticFeedback
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backIcon}>←</Text>
        </HapticFeedback>
        <Text style={styles.headerTitle}>选择票种</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {party && (
          <Animated.View
            entering={FadeInUp.duration(animation.duration.normal).delay(100)}
          >
            <PartyInfoCard party={party} index={0} />
          </Animated.View>
        )}

        {loading && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>加载中...</Text>
          </View>
        )}

        {!loading && tickets.length === 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>暂无可用票种</Text>
          </View>
        )}

        <Animated.View
          entering={FadeInUp.duration(animation.duration.normal).delay(150)}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>选择票种</Text>
          {tickets.map((ticket, index) => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              selected={selectedTicket === ticket.id}
              index={index}
              onPress={() => handleTicketSelect(ticket.id)}
            />
          ))}
        </Animated.View>

        {selectedTicket && (
          <Animated.View
            entering={FadeInUp.duration(animation.duration.normal).delay(200)}
          >
            <QuantitySelector
              quantity={quantity}
              maxQuantity={maxQuantity}
              onIncrease={() => handleQuantityChange(1)}
              onDecrease={() => handleQuantityChange(-1)}
            />
          </Animated.View>
        )}

        <Animated.View
          entering={FadeInUp.duration(animation.duration.normal).delay(250)}
        >
          <ContactForm
            name={contactName}
            phone={contactPhone}
            onNameChange={handleNameChange}
            onPhoneChange={handlePhoneChange}
          />
        </Animated.View>

        {selectedTicket && selectedTicketData && (
          <Animated.View
            entering={FadeInUp.duration(animation.duration.normal).delay(300)}
          >
            <PriceBreakdown
              totalPrice={totalPrice}
              quantity={quantity}
              ticketName={selectedTicketData.name}
            />
          </Animated.View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <View style={paymentStyles.container}>
        <View style={paymentStyles.totalSection}>
          <Text style={paymentStyles.totalLabel}>合计</Text>
          <View style={paymentStyles.totalPriceRow}>
            <Text style={paymentStyles.totalCurrency}>¥</Text>
            <Text style={paymentStyles.totalPrice}>{totalPrice}</Text>
          </View>
        </View>
        <PayButton
          totalPrice={totalPrice}
          gradient={selectedTicketData?.gradient || defaultGradient}
          disabled={!selectedTicket || submitting}
          loading={submitting}
          onPay={handleSubmit}
        />
      </View>
    </SafeAreaView>
  );
}
