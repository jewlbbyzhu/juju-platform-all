/**
 * 聚聚 (JUJU) App - 票务选择页面
 * 2026 设计系统重构版
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import Animated, {FadeIn} from 'react-native-reanimated';
import {
  useTheme,
  spacing,
  typography,
  animation,
  BorderRadius,


} from '../theme';
import { usePressAnimation } from '../theme';
import { orderApi } from '../api/order';
import { partyApi } from '../api/party';
import { OptimizedImage } from '../components/OptimizedImage';

interface Ticket {
  id: number;
  name: string;
  description?: string;
  price: number;
  current_stock?: number;
  available_count?: number;
  max_per_user?: number;
  original_price?: number;
}

type RouteParams = {
  partyId?: number;
  party?: {
    id: number;
    title: string;
    cover_image?: string;
    images?: string[];
    start_time: string;
    address?: string;
    ticket_types?: Array<{
      id: number;
      name: string;
      description?: string;
      price: number;
      current_stock?: number;
      available_count?: number;
      original_price?: number;
    }>;
  };
  selectedTicket?: Ticket | null;
};

export default function TicketSelectionScreen(): React.JSX.Element {
  const { colors } = useTheme();
  const route = useRoute<RouteProp<{ params: RouteParams }, 'params'>>();
  const navigation = useNavigation();
  const [party, setParty] = useState<RouteParams['party']>(route.params?.party);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(route.params?.selectedTicket || null);
  const [quantity, setQuantity] = useState(1);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [remark, setRemark] = useState('');


  const loadParty = useCallback(async () => {
    if (route.params?.party) {
      setParty(route.params.party);
      return;
    }
    if (!party && route.params?.partyId) {
      try {
        const res = await partyApi.getPartyDetail(route.params.partyId) as unknown as { code: number; data?: RouteParams['party'] };
        if (res.code === 0 && res.data) {
          setParty(res.data);
        }
      } catch {
        // Silently fail
      }
    }
  }, [party, route.params]);

  useEffect(() => {
    loadParty();
  }, [loadParty]);

  const handleTicketSelect = useCallback((ticket: Ticket) => {
    setSelectedTicket(prev => (prev?.id === ticket.id ? null : ticket));
    setQuantity(1);
  }, []);

  const decreaseQuantity = useCallback(() => {
    setQuantity(q => (q > 1 ? q - 1 : 1));
  }, []);

  const increaseQuantity = useCallback(() => {
    const maxPerUser = selectedTicket?.max_per_user ?? 10;
    setQuantity(q => (q < maxPerUser ? q + 1 : maxPerUser));
  }, [selectedTicket]);

  const handleQuantityChange = useCallback((text: string) => {
    const num = parseInt(text, 10) || 0;
    const maxPerUser = selectedTicket?.max_per_user ?? 10;
    setQuantity(num > 0 ? (num <= maxPerUser ? num : maxPerUser) : 1);
  }, [selectedTicket]);

  const handleSubmit = useCallback(async () => {
    if (!selectedTicket) {
      Alert.alert('提示', '请选择票型');
      return;
    }
    if (!name.trim()) {
      Alert.alert('提示', '请输入姓名');
      return;
    }
    if (!phone.trim()) {
      Alert.alert('提示', '请输入手机号');
      return;
    }
    // 手机号格式验证
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(phone.trim())) {
      Alert.alert('提示', '请输入正确的手机号');
      return;
    }
    // 姓名长度验证
    if (name.trim().length < 2 || name.trim().length > 20) {
      Alert.alert('提示', '姓名长度需在2-20个字符之间');
      return;
    }

    if (!party) return;

    try {
      const res = await orderApi.createOrder({
        party_id: party.id,
        ticket_id: selectedTicket.id,
        name: name.trim(),
        phone: phone.trim(),
        gender: 0,
        remark: remark.trim(),
        quantity: quantity || 1,
      });

      if ((res as { code: number }).code === 0) {
        (
          navigation as { navigate: (screen: string, params?: object) => void }
        ).navigate('Payment', {
          order: (res as { data: object }).data,
          party,
          ticket: selectedTicket,
        });
      } else {
        Alert.alert(
          '错误',
          (res as { message?: string }).message || '创建订单失败',
        );
      }
    } catch {
      Alert.alert('错误', '网络错误');
    }
  }, [selectedTicket, party, name, phone, remark, quantity, navigation]);

  const totalPrice = (selectedTicket?.price || 0) * quantity;

  const {
    animatedStyle: minusBtnStyle,
    handlePressIn: handleMinusIn,
    handlePressOut: handleMinusOut,
  } = usePressAnimation({ scale: 0.9 });
  const {
    animatedStyle: plusBtnStyle,
    handlePressIn: handlePlusIn,
    handlePressOut: handlePlusOut,
  } = usePressAnimation({ scale: 0.9 });
  const containerStyleMemo = useMemo(
    (): ViewStyle => ({
      flex: 1,
      backgroundColor: colors.background.secondary,
    }),
    [colors.background.secondary],
  );

  const scrollViewStyle = useMemo(
    (): ViewStyle => ({
      flex: 1,
    }),
    [],
  );

  const loadingContainerStyle = useMemo(
    (): ViewStyle => ({
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background.secondary,
    }),
    [colors.background.secondary],
  );

  const loadingTextStyle = useMemo(
    (): TextStyle => ({
      fontSize: typography.size.body,
      color: colors.text.secondary,
    }),
    [colors.text.secondary],
  );

  const partyCardStyle = useMemo(
    (): ViewStyle => ({
      backgroundColor: colors.text.inverse,
      marginBottom: spacing.md,
    }),
    [colors.text.inverse],
  );

  const partyImageStyle = useMemo(
    (): ViewStyle => ({
      width: '100%',
      height: 180,
      backgroundColor: colors.divider,
    }),
    [colors.divider],
  );

  const partyInfoStyle = useMemo(
    (): ViewStyle => ({
      padding: spacing.lg,
    }),
    [],
  );

  const partyTitleStyle = useMemo(
    (): TextStyle => ({
      fontSize: typography.size.h3,
      fontWeight: typography.weight.bold,
      color: colors.text.primary,
      marginBottom: spacing.md,
      lineHeight: typography.size.h3 * typography.lineHeight.normal,
    }),
    [colors.text.primary],
  );

  const partyMetaStyle = useMemo(
    (): ViewStyle => ({
      gap: spacing.xs,
    }),
    [],
  );

  const partyMetaTextStyle = useMemo(
    (): TextStyle => ({
      fontSize: typography.size.body2,
      color: colors.text.secondary,
    }),
    [colors.text.secondary],
  );

  const sectionStyle = useMemo(
    (): ViewStyle => ({
      backgroundColor: colors.text.inverse,
      padding: spacing['2xl'],
      marginBottom: spacing.md,
    }),
    [colors.text.inverse],
  );

  const sectionTitleStyle = useMemo(
    (): TextStyle => ({
      fontSize: typography.size.h4,
      fontWeight: typography.weight.bold,
      color: colors.text.primary,
      marginBottom: spacing.lg,
    }),
    [colors.text.primary],
  );

  const ticketItemStyle = useMemo(
    (): ViewStyle => ({
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: spacing.lg,
      borderWidth: 1,
      borderColor: colors.divider,
      borderRadius: BorderRadius.md,
      marginBottom: spacing.md,
      backgroundColor: colors.gray[50],
    }),
    [colors.divider, colors.gray],
  );

  const ticketSelectedStyle = useMemo(
    (): ViewStyle => ({
      borderColor: colors.primary.main,
      backgroundColor: colors.background.secondary,
    }),
    [colors.primary.main, colors.background.secondary],
  );

  const ticketLeftStyle = useMemo(
    (): ViewStyle => ({
      flex: 1,
    }),
    [],
  );

  const ticketNameStyle = useMemo(
    (): TextStyle => ({
      fontSize: typography.size.body,
      fontWeight: typography.weight.semibold,
      color: colors.text.primary,
      marginBottom: spacing.xs,
    }),
    [colors.text.primary],
  );

  const ticketDescStyle = useMemo(
    (): TextStyle => ({
      fontSize: typography.size.body2,
      color: colors.text.secondary,
      marginBottom: spacing.xs,
    }),
    [colors.text.secondary],
  );

  const ticketStockStyle = useMemo(
    (): TextStyle => ({
      fontSize: typography.size.caption,
      color: colors.status.success,
      fontWeight: typography.weight.medium,
    }),
    [colors.status.success],
  );

  const ticketRightStyle = useMemo(
    (): ViewStyle => ({
      alignItems: 'flex-end',
      marginLeft: spacing.md,
    }),
    [],
  );

  const ticketPriceStyle = useMemo(
    (): TextStyle => ({
      fontSize: typography.size.h2,
      fontWeight: typography.weight.bold,
      color: colors.primary.main,
      marginBottom: spacing.sm,
    }),
    [colors.primary.main],
  );

  const checkIconStyle = useMemo(
    (): ViewStyle => ({
      width: 24,
      height: 24,
      borderRadius: BorderRadius.full,
      backgroundColor: colors.primary.main,
      alignItems: 'center',
      justifyContent: 'center',
    }),
    [colors.primary.main],
  );

  const checkIconTextStyle = useMemo(
    (): TextStyle => ({
      color: colors.text.inverse,
      fontSize: 14,
      fontWeight: typography.weight.bold,
    }),
    [colors.text.inverse],
  );

  const formItemStyle = useMemo(
    (): ViewStyle => ({
      marginBottom: spacing.xl,
    }),
    [],
  );

  const formLabelStyle = useMemo(
    (): TextStyle => ({
      fontSize: typography.size.body2,
      color: colors.text.primary,
      marginBottom: spacing.sm,
      fontWeight: typography.weight.medium,
    }),
    [colors.text.primary],
  );

  const requiredStyle = useMemo(
    (): TextStyle => ({
      color: colors.primary.main,
    }),
    [colors.primary.main],
  );

  const formInputStyle = useMemo(
    (): TextStyle => ({
      backgroundColor: colors.background.secondary,
      padding: spacing.md,
      borderRadius: BorderRadius.md,
      fontSize: typography.size.body,
      color: colors.text.primary,
      borderWidth: 1,
      borderColor: colors.divider,
    }),
    [colors.background.secondary, colors.text.primary, colors.divider],
  );

  const formInputMultilineStyle = useMemo(
    (): TextStyle => ({
      height: 80,
      paddingTop: spacing.md,
    }),
    [],
  );

  const quantityRowStyle = useMemo(
    (): ViewStyle => ({
      flexDirection: 'row',
      alignItems: 'center',
    }),
    [],
  );

  const quantityBtnStyle = useMemo(
    (): ViewStyle => ({
      width: 44,
      height: 44,
      backgroundColor: colors.background.secondary,
      borderRadius: BorderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.divider,
    }),
    [colors.background.secondary, colors.divider],
  );

  const quantityBtnDisabledStyle = useMemo(
    (): ViewStyle => ({
      opacity: 0.5,
    }),
    [],
  );

  const quantityBtnTextStyle = useMemo(
    (): TextStyle => ({
      fontSize: 20,
      color: colors.text.primary,
      fontWeight: typography.weight.medium,
    }),
    [colors.text.primary],
  );

  const quantityInputStyle = useMemo(
    (): TextStyle => ({
      width: 70,
      textAlign: 'center',
      fontSize: typography.size.h3,
      fontWeight: typography.weight.semibold,
      color: colors.text.primary,
    }),
    [colors.text.primary],
  );

  const bottomPaddingStyle = useMemo(
    (): ViewStyle => ({
      height: 100,
    }),
    [],
  );

  const bottomBarStyle = useMemo(
    (): ViewStyle => ({
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: colors.text.inverse,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing['2xl'],
      paddingVertical: spacing.md,
      paddingBottom: 30,
      borderTopWidth: 1,
      borderTopColor: colors.divider,
    }),
    [colors.text.inverse, colors.divider],
  );

  const priceSectionStyle = useMemo(
    (): ViewStyle => ({
      flex: 1,
    }),
    [],
  );

  const priceLabelStyle = useMemo(
    (): TextStyle => ({
      fontSize: typography.size.caption,
      color: colors.text.secondary,
      marginBottom: 2,
    }),
    [colors.text.secondary],
  );

  const priceValueStyle = useMemo(
    (): TextStyle => ({
      fontSize: typography.size.h1,
      fontWeight: typography.weight.bold,
      color: colors.primary.main,
    }),
    [colors.primary.main],
  );

  const submitBtnStyle = useMemo(
    (): ViewStyle => ({
      backgroundColor: colors.primary.main,
      paddingVertical: spacing.md,
      paddingHorizontal: 32,
      borderRadius: BorderRadius.full,
    }),
    [colors.primary.main],
  );

  const submitBtnDisabledStyle = useMemo(
    (): ViewStyle => ({
      backgroundColor: colors.gray[400],
    }),
    [colors.gray],
  );

  const submitBtnTextStyle = useMemo(
    (): TextStyle => ({
      color: colors.text.inverse,
      fontSize: typography.size.body,
      fontWeight: typography.weight.bold,
    }),
    [colors.text.inverse],
  );

  if (!party) {
    return (
      <View style={loadingContainerStyle}>
        <Text style={loadingTextStyle}>加载中...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={containerStyleMemo}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={scrollViewStyle}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View
          entering={FadeIn.duration(animation.duration.normal)}
          style={partyCardStyle}
        >
          <OptimizedImage
            source={{
              uri:
                party.cover_image ||
                party.images?.[0] ||
                'https://picsum.photos/400/300',
            }}
            style={partyImageStyle}
          />
          <View style={partyInfoStyle}>
            <Text style={partyTitleStyle} numberOfLines={2}>
              {party.title}
            </Text>
            <View style={partyMetaStyle}>
              <Text style={partyMetaTextStyle}>
                📅{' '}
                {new Date(party.start_time).toLocaleString('zh-CN', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
              <Text style={partyMetaTextStyle}>📍 {party.address}</Text>
            </View>
          </View>
        </Animated.View>

        <View style={sectionStyle}>
          <Text style={sectionTitleStyle}>选择票型</Text>
          {party.ticket_types?.map(ticket => {
            const stock = ticket.current_stock ?? ticket.available_count ?? 0;
            const isSoldOut = stock <= 0;
            const isSelected = selectedTicket?.id === ticket.id;
            const hasDiscount = ticket.original_price && ticket.original_price > ticket.price;
            return (
              <TouchableOpacity
                key={ticket.id}
                style={[
                  ticketItemStyle,
                  isSelected && ticketSelectedStyle,
                  isSoldOut && { opacity: 0.5, borderColor: colors.divider },
                ]}
                onPress={() => !isSoldOut && handleTicketSelect(ticket)}
                activeOpacity={0.8}
                disabled={isSoldOut}
              >
                <View style={ticketLeftStyle}>
                  <Text style={[ticketNameStyle, isSoldOut && { color: colors.text.tertiary }]}>
                    {ticket.name}
                  </Text>
                  {ticket.description && (
                    <Text style={ticketDescStyle}>{ticket.description}</Text>
                  )}
                  {isSoldOut ? (
                    <Text style={[ticketStockStyle, { color: colors.status.error }]}>
                      已售罄
                    </Text>
                  ) : (
                    <Text style={ticketStockStyle}>
                      剩余 {stock} 张
                    </Text>
                  )}
                </View>
                <View style={ticketRightStyle}>
                  <Text style={ticketPriceStyle}>
                    {ticket.price === 0 ? '免费' : `¥${ticket.price}`}
                  </Text>
                  {hasDiscount && (
                    <Text style={{
                      fontSize: 12,
                      color: colors.text.tertiary,
                      textDecorationLine: 'line-through',
                      marginTop: 2,
                    }}>
                      ¥{ticket.original_price}
                    </Text>
                  )}
                  {isSelected && !isSoldOut && (
                    <View style={checkIconStyle}>
                      <Text style={checkIconTextStyle}>✓</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
          {!selectedTicket && party.ticket_types && party.ticket_types.length > 0 && (
            <Text style={{ fontSize: 12, color: colors.status.warning, marginTop: 8, textAlign: 'center' }}>
              请选择一种票型继续
            </Text>
          )}
        </View>

        <View style={sectionStyle}>
          <Text style={sectionTitleStyle}>购票信息</Text>

          <View style={formItemStyle}>
            <Text style={formLabelStyle}>数量</Text>
            <View style={quantityRowStyle}>
              <Animated.View style={minusBtnStyle}>
                <TouchableOpacity
                  style={[
                    quantityBtnStyle,
                    quantity <= 1 && quantityBtnDisabledStyle,
                  ]}
                  onPressIn={handleMinusIn}
                  onPressOut={handleMinusOut}
                  onPress={decreaseQuantity}
                  disabled={quantity <= 1 || !selectedTicket}
                >
                  <Text style={[quantityBtnTextStyle, !selectedTicket && { opacity: 0.3 }]}>−</Text>
                </TouchableOpacity>
              </Animated.View>
              <TextInput
                style={quantityInputStyle}
                value={quantity.toString()}
                onChangeText={handleQuantityChange}
                keyboardType="numeric"
                selectTextOnFocus
                editable={!!selectedTicket}
              />
              <Animated.View style={plusBtnStyle}>
                <TouchableOpacity
                  style={[
                    quantityBtnStyle,
                    quantity >= (selectedTicket?.max_per_user ?? 10) && quantityBtnDisabledStyle,
                  ]}
                  onPressIn={handlePlusIn}
                  onPressOut={handlePlusOut}
                  onPress={increaseQuantity}
                  disabled={quantity >= (selectedTicket?.max_per_user ?? 10) || !selectedTicket}
                >
                  <Text style={[quantityBtnTextStyle, !selectedTicket && { opacity: 0.3 }]}>+</Text>
                </TouchableOpacity>
              </Animated.View>
            </View>
            {selectedTicket && (
              <Text style={{ fontSize: 12, color: colors.text.tertiary, marginTop: 4 }}>
                每人限购 {selectedTicket.max_per_user ?? 10} 张
              </Text>
            )}
          </View>

          <View style={formItemStyle}>
            <Text style={formLabelStyle}>
              姓名 <Text style={requiredStyle}>*</Text>
            </Text>
            <TextInput
              style={formInputStyle}
              value={name}
              onChangeText={setName}
              placeholder="请输入真实姓名（2-20字）"
              placeholderTextColor={colors.text.tertiary}
              maxLength={20}
              autoComplete="name"
              textContentType="name"
              editable={!!selectedTicket}
            />
          </View>

          <View style={formItemStyle}>
            <Text style={formLabelStyle}>
              手机号 <Text style={requiredStyle}>*</Text>
            </Text>
            <TextInput
              style={formInputStyle}
              value={phone}
              onChangeText={setPhone}
              placeholder="请输入11位手机号"
              keyboardType="phone-pad"
              placeholderTextColor={colors.text.tertiary}
              maxLength={11}
              autoComplete="tel"
              textContentType="telephoneNumber"
              returnKeyType="done"
              editable={!!selectedTicket}
            />
          </View>

          <View style={formItemStyle}>
            <Text style={formLabelStyle}>备注</Text>
            <TextInput
              style={[formInputStyle, formInputMultilineStyle]}
              value={remark}
              onChangeText={setRemark}
              placeholder="选填，如有特殊需求请说明"
              placeholderTextColor={colors.text.tertiary}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
        </View>

        <View style={bottomPaddingStyle} />
      </ScrollView>

      <View style={bottomBarStyle}>
        <View style={priceSectionStyle}>
          <Text style={priceLabelStyle}>合计</Text>
          <Text style={priceValueStyle}>
            {totalPrice === 0 ? '免费' : `¥${totalPrice}`}
          </Text>
        </View>
        <TouchableOpacity
          style={[
            submitBtnStyle,
            !selectedTicket && submitBtnDisabledStyle,
          ]}
          onPress={handleSubmit}
          disabled={!selectedTicket}
        >
          <Text style={submitBtnTextStyle}>确认下单</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
