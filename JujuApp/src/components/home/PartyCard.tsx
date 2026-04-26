import React, { useEffect, useMemo } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withSpring,
  withTiming,
  FadeIn,
  Layout,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import { GlassCard } from '../GlassCard';
import { colors, gradients } from '../../theme';
import {
  animation,
  spacing,
  typography,
  BorderRadius,
  layout,
} from '../../theme';
import type { NavigationProp } from '../../types';

import { Dimensions } from 'react-native';
const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - layout.screenPadding * 2 - spacing.md) / 2;

interface Category {
  key: string;
  label: string;
  icon: string;
  color: string;
}

export const CATEGORIES: Category[] = [
  { key: 'all', label: '全部', icon: '✨', color: colors.secondary.main },
  { key: 'party', label: '派对', icon: '🎉', color: colors.secondary.light },
  { key: 'music', label: '音乐', icon: '🎵', color: colors.accent.cyan },
  { key: 'sports', label: '运动', icon: '⚽', color: colors.status.success },
  { key: 'art', label: '艺术', icon: '🎨', color: colors.accent.pink },
  { key: 'food', label: '美食', icon: '🍔', color: colors.accent.orange },
  { key: 'outdoor', label: '户外', icon: '🏕️', color: colors.secondary.light },
  { key: 'game', label: '桌游', icon: '🎲', color: colors.accent.pink },
];

const STATUS_LABELS: Record<number, string> = {
  0: '待审核',
  1: '报名中',
  2: '已满员',
  3: '已结束',
  4: '已取消',
};

const formatPrice = (price: number): string => {
  if (price === 0) return '免费';
  return `¥${price}`;
};

const formatDateTime = (date: Date | string): string => {
  const d = new Date(date);
  return `${d.getMonth() + 1}月${d.getDate()}日 ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
};

interface Party {
  id: number;
  title: string;
  description: string;
  coverImage?: string;
  images?: string[];
  startTime: string;
  endTime: string;
  location: string;
  address?: string;
  maxParticipants: number;
  currentParticipants?: number;
  status: number;
  category?: string;
  price?: number;
}

interface PartyCardProps {
  item: Party;
  index: number;
  navigation: NavigationProp;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export const PartyCard: React.FC<PartyCardProps> = React.memo(
  ({ item, index, navigation }) => {
    const isLeft = index % 2 === 0;
    const imageHeight = CARD_WIDTH * (1.1 + (index % 3) * 0.1);
    const status = item.status ?? 1;
    const statusLabel = STATUS_LABELS[status] || STATUS_LABELS[1];

    const statusColor = useMemo(() => {
      switch (status) {
        case 0:
          return colors.status.warning;
        case 1:
          return colors.status.success;
        case 2:
          return colors.status.error;
        case 3:
          return colors.gray[500];
        case 4:
          return colors.gray[400];
        default:
          return colors.status.success;
      }
    }, [status]);

    const statusBgColor = useMemo(() => {
      switch (status) {
        case 0:
          return 'rgba(245, 158, 11, 0.2)';
        case 1:
          return 'rgba(16, 185, 129, 0.2)';
        case 2:
          return 'rgba(239, 68, 68, 0.2)';
        case 3:
          return 'rgba(107, 114, 128, 0.2)';
        case 4:
          return 'rgba(156, 163, 175, 0.2)';
        default:
          return 'rgba(16, 185, 129, 0.2)';
      }
    }, [status]);

    const scale = useSharedValue(0.95);
    const opacity = useSharedValue(0);

    useEffect(() => {
      scale.value = withDelay(
        index * 50,
        withSpring(1, animation.spring.gentle),
      );
      opacity.value = withDelay(
        index * 50,
        withTiming(1, { duration: animation.duration.normal }),
      );
    }, [index, scale, opacity]);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    }));

    return (
      <AnimatedTouchable
        style={[
          styles.card,
          isLeft ? styles.cardLeft : styles.cardRight,
          animatedStyle,
        ]}
        activeOpacity={0.9}
        onPress={() =>
          navigation.navigate('PartyDetail', { partyId: String(item.id) })
        }
        entering={FadeIn.delay(index * 50).springify()}
        layout={Layout.springify()}
      >
        <GlassCard style={styles.glassCard} intensity="medium">
          <View style={[styles.imageContainer, { height: imageHeight }]}>
            <Image
              source={{
                uri:
                  item.coverImage ||
                  item.images?.[0] ||
                  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400',
              }}
              style={styles.image}
              resizeMode="cover"
            />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.3)']}
              style={styles.imageOverlay}
            />
            <View
              style={[styles.statusBadge, { backgroundColor: statusBgColor }]}
            >
              <Text style={[styles.statusText, { color: statusColor }]}>
                {statusLabel}
              </Text>
            </View>
            <LinearGradient
              colors={[gradients.secondary[0], gradients.secondary[1]]}
              style={styles.priceBadge}
            >
              <Text style={styles.priceText}>
                {formatPrice(item.price ?? 0)}
              </Text>
            </LinearGradient>
          </View>
          <View style={styles.contentContainer}>
            <Text style={styles.partyTitle} numberOfLines={2}>
              {item.title}
            </Text>
            <Text style={styles.partyLocation} numberOfLines={1}>
              📍{' '}
              {typeof item.location === 'string'
                ? item.location
                : (item.location as { name?: string })?.name || '地点待定'}
            </Text>
            <Text style={styles.partyTime}>
              🕐 {formatDateTime(item.startTime)}
            </Text>
            <View style={styles.joinInfo}>
              <View style={styles.avatarStack}>
                {[
                  'https://i.pravatar.cc/100?1',
                  'https://i.pravatar.cc/100?2',
                  'https://i.pravatar.cc/100?3',
                ].map((uri, i) => (
                  <Image
                    key={i}
                    source={{ uri }}
                    style={[styles.avatar, { marginLeft: i > 0 ? -8 : 0 }]}
                  />
                ))}
              </View>
              <Text style={styles.joinText}>
                {item.currentParticipants ?? 0}/{item.maxParticipants ?? 100}
                人已报名
              </Text>
            </View>
          </View>
        </GlassCard>
      </AnimatedTouchable>
    );
  },
);
PartyCard.displayName = 'PartyCard';

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    marginBottom: spacing.md,
  },
  cardLeft: {
    marginRight: spacing.sm,
  },
  cardRight: {
    marginLeft: spacing.sm,
  },
  glassCard: {
    marginVertical: 0,
    padding: 0,
  },
  imageContainer: {
    position: 'relative',
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  statusBadge: {
    position: 'absolute',
    top: spacing.sm + 4,
    left: spacing.sm + 4,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: BorderRadius.md,
  },
  statusText: {
    fontSize: typography.size.caption,
    fontWeight: typography.weight.semibold,
  },
  priceBadge: {
    position: 'absolute',
    bottom: spacing.sm + 4,
    right: spacing.sm + 4,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: BorderRadius.md,
  },
  priceText: {
    color: colors.text.inverse,
    fontSize: typography.size.caption,
    fontWeight: typography.weight.bold,
  },
  contentContainer: {
    padding: spacing.sm + 4,
  },
  partyTitle: {
    fontSize: typography.size.h4,
    fontWeight: typography.weight.semibold,
    color: colors.text.inverse,
    marginBottom: spacing.xs + 2,
    lineHeight: 22,
  },
  partyLocation: {
    fontSize: typography.size.body2,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: spacing.xs,
  },
  partyTime: {
    fontSize: typography.size.caption,
    color: 'rgba(255, 255, 255, 0.4)',
    marginBottom: spacing.sm,
  },
  joinInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarStack: {
    flexDirection: 'row',
    marginRight: spacing.sm,
  },
  avatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  joinText: {
    fontSize: typography.size.caption,
    color: 'rgba(255, 255, 255, 0.4)',
  },
});
