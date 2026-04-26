import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  RefreshControl,
  Alert,
  SafeAreaView,


} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { vipApi } from '../api/vip';
import {
  useTheme,
  spacing,
  typography,
  animation,
  BorderRadius,
  Border,
  Shadows,
  textStyles,
} from '../theme';
import { GlassCard } from '../components/GlassCard';
import { GlassButton } from '../components/GlassButton';

interface VipPoints {
  total: number;
  available: number;
  frozen: number;
  expiringSoon: number;
}

interface PointsHistory {
  id: string;
  type: 'earn' | 'spend';
  amount: number;
  description: string;
  createdAt: string;
}

interface Reward {
  id: string;
  name: string;
  points: number;
  icon: string;
  stock: number;
  color: string;
}

// ===== 静态样式常量 =====
const STATIC_STYLES = {
  pointsHeader: { flexDirection: 'row' as const, justifyContent: 'space-between' as const, alignItems: 'center' as const, marginBottom: spacing.md },
  detailItem: { alignItems: 'center' as const },
  section: { padding: spacing.xl },
  sectionHeader: { flexDirection: 'row' as const, justifyContent: 'space-between' as const, alignItems: 'center' as const, marginBottom: spacing.lg },
  earnGrid: { flexDirection: 'row' as const, flexWrap: 'wrap' as const, gap: spacing.sm },
  earnIconWrapper: { width: 48, height: 48, borderRadius: BorderRadius.md, alignItems: 'center' as const, justifyContent: 'center' as const, marginBottom: spacing.sm },
  earnIcon: { fontSize: 24 },
  earnPoints: { fontSize: 11, fontWeight: typography.weight.bold },
  rewardsList: { gap: spacing.md },
  rewardCard: { flexDirection: 'row' as const, justifyContent: 'space-between' as const, alignItems: 'center' as const, padding: spacing.lg },
  rewardLeft: { flexDirection: 'row' as const, alignItems: 'center' as const },
  rewardIconWrapper: { width: 48, height: 48, borderRadius: BorderRadius.md, alignItems: 'center' as const, justifyContent: 'center' as const, marginRight: spacing.md },
  rewardIcon: { fontSize: 24 },
  historyCard: { padding: spacing.lg },
  historyItem: { flexDirection: 'row' as const, justifyContent: 'space-between' as const, alignItems: 'center' as const, paddingVertical: spacing.md },
  historyLeft: { flexDirection: 'row' as const, alignItems: 'center' as const },
  historyIconWrapper: { width: 40, height: 40, borderRadius: BorderRadius.sm, alignItems: 'center' as const, justifyContent: 'center' as const, marginRight: spacing.md },
  historyIcon: { fontSize: 18 },
  historyAmount: { fontSize: typography.size.h4, fontWeight: typography.weight.bold },
  emptyState: { alignItems: 'center' as const, padding: spacing['3xl'] },
  emptyIcon: { fontSize: 40, marginBottom: spacing.sm },
};

export default function VIPPointsScreen(): React.JSX.Element {
  const navigation = useNavigation();
  const { colors } = useTheme();

  const [points, setPoints] = useState<VipPoints>({
    total: 0,
    available: 0,
    frozen: 0,
    expiringSoon: 0,
  });
  const [history, setHistory] = useState<PointsHistory[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadPoints = useCallback(async () => {
    try {
      const res = await vipApi.getVipPoints();
      if (res.success || (res as any).code === 0) {
        const data = (res as any).data || {};
        setPoints({
          total: data.total || data.total_points || 0,
          available: data.available || data.available_points || 0,
          frozen: data.frozen || data.frozen_points || 0,
          expiringSoon: data.expiringSoon || data.expiring_soon || 0,
        });
      }
    } catch (_error) {
      console.error('加载积分失败:', _error);
    }
  }, []);

  const loadHistory = useCallback(async () => {
    try {
      const res = await vipApi.getVipPointsHistory({ page: 1, pageSize: 10 });
      if (res.success || (res as any).code === 0) {
        const data = (res as any).data || {};
        setHistory(data.list || data.history || []);
      }
    } catch (_error) {
      console.error('加载积分历史失败:', _error);
    }
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadPoints(), loadHistory()]);
    setRefreshing(false);
  };

  const handleRedeem = (reward: Reward) => {
    if (points.available < reward.points) {
      Alert.alert('积分不足', `您需要 ${reward.points} 积分才能兑换此奖品`);
      return;
    }
    Alert.alert(
      '确认兑换',
      `确定要消耗 ${reward.points} 积分兑换 ${reward.name} 吗？`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '确定',
          onPress: async () => {
            try {
              const res = await vipApi.redeemPoints(reward.id);
              if (res.success || (res as any).code === 0) {
                Alert.alert('兑换成功', `您已成功兑换 ${reward.name}`);
                loadPoints();
                loadHistory();
              } else {
                Alert.alert('兑换失败', (res as any).message || '请重试');
              }
            } catch {
              Alert.alert('错误', '兑换失败，请重试');
            }
          },
        },
      ],
    );
  };

  useEffect(() => {
    loadPoints();
    loadHistory();
  }, [loadPoints, loadHistory]);

  // ===== 数据定义 =====
  const REWARDS: Reward[] = [
    { id: '1', name: '10元优惠券', points: 100, icon: '🎫', stock: 100, color: colors.status.success },
    { id: '2', name: '20元优惠券', points: 180, icon: '🎟️', stock: 80, color: colors.status.info },
    { id: '3', name: 'VIP体验卡(7天)', points: 500, icon: '👑', stock: 50, color: colors.accent.gold },
    { id: '4', name: '限量周边', points: 2000, icon: '🎁', stock: 20, color: colors.secondary.main },
    { id: '5', name: '专属活动入场券', points: 3000, icon: '🎭', stock: 10, color: colors.primary.main },
  ];

  const EARN_METHODS = [
    { icon: '📅', title: '每日签到', points: '+10积分', route: 'CheckIn', color: colors.primary.main },
    { icon: '👥', title: '邀请好友', points: '+100积分', route: 'Invite', color: colors.status.success },
    { icon: '🎉', title: '发起聚会', points: '+50积分', route: 'CreateParty', color: colors.secondary.main },
    { icon: '🛒', title: '消费返利', points: '1元=1积分', route: 'Orders', color: colors.accent.gold },
  ];

  // ===== 子组件 =====
  const PointsHeader = useCallback(() => (
    <Animated.View
      entering={FadeInUp.duration(animation.duration.slow).springify()}
      style={{
        padding: spacing.xl,
        paddingTop: spacing['3xl'],
        backgroundColor: colors.primary.main,
      }}
    >
      <GlassCard
        style={{ borderWidth: Border.width.thick, borderColor: colors.accent.gold }}
        intensity="medium"
        glow
        glowColor={colors.accent.gold}
      >
        <View style={STATIC_STYLES.pointsHeader}>
          <Text style={{ fontSize: typography.size.h4, color: colors.text.secondary }}>我的积分</Text>
          <GlassButton
            title="查看明细 ›"
            onPress={() => (navigation as any).navigate('PointsHistory')}
            variant="ghost"
            size="small"
          />
        </View>
        <Text style={{
          fontSize: typography.size.display,
          fontWeight: typography.weight.bold,
          color: colors.text.primary,
          marginBottom: spacing.lg,
        }}>
          {points.available.toLocaleString()}
        </Text>
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-around',
          paddingTop: spacing.lg,
          borderTopWidth: Border.width.normal,
          borderTopColor: colors.border,
        }}>
          <View style={STATIC_STYLES.detailItem}>
            <Text style={{ fontSize: typography.size.caption, color: colors.text.secondary, marginBottom: spacing.xs }}>累计获得</Text>
            <Text style={{ fontSize: typography.size.h4, fontWeight: typography.weight.bold, color: colors.text.primary }}>{points.total.toLocaleString()}</Text>
          </View>
          <View style={{ width: Border.width.normal, backgroundColor: colors.border }} />
          <View style={STATIC_STYLES.detailItem}>
            <Text style={{ fontSize: typography.size.caption, color: colors.text.secondary, marginBottom: spacing.xs }}>冻结中</Text>
            <Text style={{ fontSize: typography.size.h4, fontWeight: typography.weight.bold, color: colors.text.primary }}>{points.frozen.toLocaleString()}</Text>
          </View>
          <View style={{ width: Border.width.normal, backgroundColor: colors.border }} />
          <View style={STATIC_STYLES.detailItem}>
            <Text style={{ fontSize: typography.size.caption, color: colors.text.secondary, marginBottom: spacing.xs }}>即将过期</Text>
            <Text style={{ fontSize: typography.size.h4, fontWeight: typography.weight.bold, color: colors.accent.gold }}>
              {points.expiringSoon.toLocaleString()}
            </Text>
          </View>
        </View>
        {points.expiringSoon > 0 && (
          <View style={{
            marginTop: spacing.md,
            backgroundColor: colors.accent.gold + '20',
            padding: spacing.sm,
            borderRadius: BorderRadius.sm,
          }}>
            <Text style={{
              color: colors.accent.gold,
              fontSize: typography.size.caption,
              textAlign: 'center',
              fontWeight: typography.weight.medium,
            }}>
              ⚠️ 有 {points.expiringSoon} 积分将在30天内过期
            </Text>
          </View>
        )}
      </GlassCard>
    </Animated.View>
  ), [points, navigation, colors, animation.duration.slow]);

  const EarnMethodsGrid = useCallback(() => (
    <Animated.View
      entering={FadeInUp.delay(100).duration(animation.duration.slow).springify()}
      style={STATIC_STYLES.section}
    >
      <Text style={{ ...textStyles.h3, color: colors.text.primary }}>获取积分</Text>
      <View style={STATIC_STYLES.earnGrid}>
        {EARN_METHODS.map((item, index) => (
          <Pressable
            key={index}
            style={({ pressed }) => [
              {
                width: '23%',
                backgroundColor: colors.background.primary,
                borderRadius: BorderRadius.lg,
                padding: spacing.lg,
                alignItems: 'center',
                ...Shadows.medium,
              },
              { opacity: pressed ? 0.8 : 1 },
            ]}
            onPress={() => (navigation as any).navigate(item.route)}
          >
            <View style={[STATIC_STYLES.earnIconWrapper, { backgroundColor: item.color + '20' }]}>
              <Text style={STATIC_STYLES.earnIcon}>{item.icon}</Text>
            </View>
            <Text style={{ fontSize: typography.size.caption, color: colors.text.primary, marginBottom: spacing.xs, fontWeight: typography.weight.medium }}>
              {item.title}
            </Text>
            <Text style={[STATIC_STYLES.earnPoints, { color: item.color }]}>{item.points}</Text>
          </Pressable>
        ))}
      </View>
    </Animated.View>
  ), [EARN_METHODS, navigation, colors, animation.duration.slow]);

  const RewardsSection = useCallback(() => (
    <Animated.View
      entering={FadeInUp.delay(200).duration(animation.duration.slow).springify()}
      style={STATIC_STYLES.section}
    >
      <Text style={{ ...textStyles.h3, color: colors.text.primary }}>积分兑换</Text>
      <View style={STATIC_STYLES.rewardsList}>
        {REWARDS.map(reward => (
          <GlassCard key={reward.id} style={STATIC_STYLES.rewardCard} intensity="light">
            <View style={STATIC_STYLES.rewardLeft}>
              <View style={[STATIC_STYLES.rewardIconWrapper, { backgroundColor: reward.color + '20' }]}>
                <Text style={STATIC_STYLES.rewardIcon}>{reward.icon}</Text>
              </View>
              <View>
                <Text style={{ fontSize: typography.size.body2, color: colors.text.primary, fontWeight: typography.weight.medium, marginBottom: spacing.xs }}>
                  {reward.name}
                </Text>
                <Text style={{ fontSize: typography.size.caption, color: colors.text.tertiary }}>剩余 {reward.stock} 件</Text>
              </View>
            </View>
            <GlassButton
              title={`${reward.points} 积分`}
              onPress={() => handleRedeem(reward)}
              variant={points.available >= reward.points ? 'primary' : 'secondary'}
              size="small"
              disabled={points.available < reward.points}
            />
          </GlassCard>
        ))}
      </View>
    </Animated.View>
  ), [REWARDS, points.available, colors, animation.duration.slow]);

  const HistorySection = useCallback(() => (
    <Animated.View
      entering={FadeInUp.delay(300).duration(animation.duration.slow).springify()}
      style={STATIC_STYLES.section}
    >
      <View style={STATIC_STYLES.sectionHeader}>
        <Text style={{ ...textStyles.h3, color: colors.text.primary }}>最近记录</Text>
        <GlassButton
          title="更多 ›"
          onPress={() => (navigation as any).navigate('PointsHistory')}
          variant="ghost"
          size="small"
        />
      </View>
      {history.length > 0 ? (
        <GlassCard style={STATIC_STYLES.historyCard} intensity="light">
          {history.slice(0, 5).map((item, index) => (
            <View
              key={item.id}
              style={[
                STATIC_STYLES.historyItem,
                index < history.slice(0, 5).length - 1 && { borderBottomWidth: Border.width.normal, borderBottomColor: colors.border },
              ]}
            >
              <View style={STATIC_STYLES.historyLeft}>
                <View
                  style={[
                    STATIC_STYLES.historyIconWrapper,
                    {
                      backgroundColor:
                        item.type === 'earn'
                          ? colors.status.success + '20'
                          : colors.primary.main + '20',
                    },
                  ]}
                >
                  <Text style={STATIC_STYLES.historyIcon}>{item.type === 'earn' ? '📥' : '📤'}</Text>
                </View>
                <View>
                  <Text style={{ fontSize: typography.size.body2, color: colors.text.primary, marginBottom: spacing.xs, fontWeight: typography.weight.medium }}>
                    {item.description}
                  </Text>
                  <Text style={{ fontSize: typography.size.caption, color: colors.text.tertiary }}>{item.createdAt}</Text>
                </View>
              </View>
              <Text
                style={[
                  STATIC_STYLES.historyAmount,
                  { color: item.type === 'earn' ? colors.status.success : colors.primary.main },
                ]}
              >
                {item.type === 'earn' ? '+' : '-'}{item.amount}
              </Text>
            </View>
          ))}
        </GlassCard>
      ) : (
        <GlassCard style={STATIC_STYLES.emptyState} intensity="light">
          <Text style={STATIC_STYLES.emptyIcon}>📋</Text>
          <Text style={{ fontSize: typography.size.body2, color: colors.text.tertiary }}>暂无记录</Text>
        </GlassCard>
      )}
    </Animated.View>
  ), [history, navigation, colors, animation.duration.slow]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.secondary }}>
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.background.secondary }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <PointsHeader />
        <EarnMethodsGrid />
        <RewardsSection />
        <HistorySection />
      </ScrollView>
    </SafeAreaView>
  );
}
