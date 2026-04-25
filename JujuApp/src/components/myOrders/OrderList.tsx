import React, { useMemo } from 'react';
import {Text, StyleSheet} from 'react-native';
import Animated, {
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '../../theme';
import type { OrderListProps } from './types';

const OrderList: React.FC<OrderListProps> = ({
  orders,
  loading,


  ListEmptyComponent,

  refreshControl,
  renderItem,
  keyExtractor,
  onEndReached,
}) => {
  const { colors } = useTheme();
  const rotateAnim = useSharedValue(0);

  const containerStyles = useMemo(
    () =>
      StyleSheet.create({
        listContent: {
          padding: 16,
          paddingBottom: 100,
        },
        loadingFooter: {
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          paddingVertical: 16,
          gap: 8,
        },
        spinner: {
          width: 20,
          height: 20,
          borderRadius: 10,
          borderWidth: 2,
          borderColor: colors.primary.light,
          borderTopColor: colors.primary.main,
          borderRightColor: colors.primary.light,
          borderBottomColor: colors.primary.light,
        },
        loadingText: {
          fontSize: 14,
          color: colors.text.tertiary,
        },
      }),
    [colors],
  );

  const spinnerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotateAnim.value}deg` }],
  }));

  React.useEffect(() => {
    if (loading && orders.length > 0) {
      rotateAnim.value = withRepeat(
        withTiming(360, { duration: 1000, easing: Easing.linear }),
        -1,
        false,
      );
    } else {
      rotateAnim.value = 0;
    }
  }, [loading, orders.length, rotateAnim]);

  const FooterComponent = useMemo(
    () =>
      loading && orders.length > 0 ? (
        <Animated.View
          entering={FadeIn.duration(300)}
          style={containerStyles.loadingFooter}
        >
          <Animated.View style={containerStyles.spinner}>
            <Animated.View style={[spinnerAnimatedStyle, {}]} />
          </Animated.View>
          <Text style={containerStyles.loadingText}>加载更多...</Text>
        </Animated.View>
      ) : null,
    [
      loading,
      orders.length,
      containerStyles.loadingFooter,
      containerStyles.spinner,
      containerStyles.loadingText,
      spinnerAnimatedStyle,
    ],
  );

  return (
    <Animated.FlatList
      data={orders}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      contentContainerStyle={containerStyles.listContent}
      refreshControl={refreshControl as any}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      ListEmptyComponent={ListEmptyComponent}
      ListFooterComponent={FooterComponent}
      showsVerticalScrollIndicator={false}
      entering={FadeIn.duration(400)}
    />
  );
};

export default React.memo(OrderList);
