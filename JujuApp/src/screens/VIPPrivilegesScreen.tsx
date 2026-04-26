import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { vipApi } from '../api/vip';
import {

  colors,
  vipColors,
  spacing,
  BorderRadius,

  typography,
  textStyles,


} from '../theme';
import { GlassCard } from '../components/GlassCard';
import { GlassButton } from '../components/GlassButton';

interface VipBenefit {
  id: string;
  icon: string;
  title: string;
  description: string;
  level: number;
  isNew?: boolean;
}

interface VipLevelBenefits {
  level: number;
  name: string;
  color: string;
  gradient: string[];
  benefits: VipBenefit[];
}

const VIP_BENEFITS: VipLevelBenefits[] = [
  {
    level: 1,
    name: '铜牌会员',
    color: vipColors.bronze,
    gradient: [vipColors.bronze, vipColors.bronzeEnd],
    benefits: [
      {
        id: '1-1',
        icon: '🔔',
        title: '活动提醒',
        description: '第一时间获取活动通知',
        level: 1,
      },
      {
        id: '1-2',
        icon: '📊',
        title: '积分累计',
        description: '消费即可累积积分',
        level: 1,
      },
      {
        id: '1-3',
        icon: '💬',
        title: '基础客服',
        description: '工作日客服支持',
        level: 1,
      },
    ],
  },
  {
    level: 2,
    name: '银牌会员',
    color: vipColors.silver,
    gradient: [vipColors.silver, vipColors.silverEnd],
    benefits: [
      {
        id: '2-1',
        icon: '⚡',
        title: '优先购票',
        description: '热门活动优先购买权',
        level: 2,
      },
      {
        id: '2-2',
        icon: '💰',
        title: '95折优惠',
        description: '全场消费95折',
        level: 2,
      },
      {
        id: '2-3',
        icon: '🎧',
        title: '专属客服',
        description: '7x12小时客服支持',
        level: 2,
      },
      {
        id: '2-4',
        icon: '🎁',
        title: '生日礼包',
        description: '生日月专属礼品',
        level: 2,
      },
    ],
  },
  {
    level: 3,
    name: '金牌会员',
    color: vipColors.gold,
    gradient: [vipColors.gold, vipColors.goldEnd],
    benefits: [
      {
        id: '3-1',
        icon: '⚡',
        title: '优先购票',
        description: '热门活动优先购买权',
        level: 3,
      },
      {
        id: '3-2',
        icon: '💰',
        title: '9折优惠',
        description: '全场消费9折',
        level: 3,
      },
      {
        id: '3-3',
        icon: '🎧',
        title: '专属客服',
        description: '7x12小时客服支持',
        level: 3,
      },
      {
        id: '3-4',
        icon: '🎁',
        title: '生日礼包',
        description: '生日月专属礼品',
        level: 3,
      },
      {
        id: '3-5',
        icon: '🏅',
        title: '专属徽章',
        description: '尊贵身份标识',
        level: 3,
      },
    ],
  },
  {
    level: 4,
    name: '铂金会员',
    color: vipColors.platinum,
    gradient: [vipColors.platinum, vipColors.platinumEnd],
    benefits: [
      {
        id: '4-1',
        icon: '⚡',
        title: '优先购票',
        description: '热门活动优先购买权',
        level: 4,
      },
      {
        id: '4-2',
        icon: '💰',
        title: '85折优惠',
        description: '全场消费85折',
        level: 4,
      },
      {
        id: '4-3',
        icon: '🎉',
        title: 'VIP专属活动',
        description: '仅限VIP参与的活动',
        level: 4,
      },
      {
        id: '4-4',
        icon: '🎧',
        title: '一对一客服',
        description: '专属客服经理',
        level: 4,
      },
      {
        id: '4-5',
        icon: '💎',
        title: '双倍积分',
        description: '消费获得双倍积分',
        level: 4,
      },
    ],
  },
  {
    level: 5,
    name: '钻石会员',
    color: vipColors.diamond,
    gradient: [vipColors.diamond, vipColors.diamondEnd],
    benefits: [
      {
        id: '5-1',
        icon: '⚡',
        title: '优先购票',
        description: '热门活动优先购买权',
        level: 5,
      },
      {
        id: '5-2',
        icon: '💰',
        title: '8折优惠',
        description: '全场消费8折',
        level: 5,
      },
      {
        id: '5-3',
        icon: '🎭',
        title: '专属定制活动',
        description: '私人定制聚会体验',
        level: 5,
      },
      {
        id: '5-4',
        icon: '👔',
        title: '私人管家',
        description: '7x24小时管家服务',
        level: 5,
      },
      {
        id: '5-5',
        icon: '💎',
        title: '三倍积分',
        description: '消费获得三倍积分',
        level: 5,
      },
      {
        id: '5-6',
        icon: '🎁',
        title: '限量周边',
        description: '专属限量礼品',
        level: 5,
      },
    ],
  },
];

const COMPARE_BENEFITS = [
  '优先购票',
  '消费折扣',
  '专属客服',
  '生日礼包',
  '积分倍数',
];

export default function VIPPrivilegesScreen() {

  const navigation = useNavigation();
  const [currentLevel, setCurrentLevel] = useState(1);
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const containerStyle = useMemo(
    (): ViewStyle => ({
      flex: 1,
      backgroundColor: colors.background.secondary,
    }),
    [],
  );

  const headerStyle = useMemo(
    (): ViewStyle => ({
      padding: spacing.lg,
      paddingTop: 60,
      backgroundColor: colors.background.primary,
    }),
    [],
  );

  const currentCardStyle = useMemo(
    (): ViewStyle => ({
      borderWidth: 2,
    }),
    [],
  );

  const currentHeaderStyle = useMemo(
    (): ViewStyle => ({
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.md,
    }),
    [],
  );

  const levelBadgeStyle = useMemo(
    (): ViewStyle => ({
      width: 48,
      height: 48,
      borderRadius: BorderRadius.full,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.md,
    }),
    [],
  );

  const currentLabelStyle = useMemo(
    (): TextStyle => ({
      fontSize: 13,
      color: colors.text.secondary,
    }),
    [],
  );

  const currentNameStyle = useMemo(
    (): TextStyle => ({
      fontSize: typography.size.h3,
      fontWeight: typography.weight.bold,
    }),
    [],
  );

  const currentDescStyle = useMemo(
    (): TextStyle => ({
      fontSize: typography.size.body2,
      color: colors.text.secondary,
    }),
    [],
  );

  const levelTabsStyle = useMemo(
    (): ViewStyle => ({
      paddingVertical: spacing.lg,
      paddingHorizontal: spacing.md,
    }),
    [],
  );

  const levelTabBaseStyle = useMemo(
    (): ViewStyle => ({
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm + spacing.xs,
      borderRadius: BorderRadius.full,
      backgroundColor: colors.background.tertiary,
      marginRight: spacing.md,
    }),
    [],
  );

  const levelTabTextStyle = useMemo(
    (): TextStyle => ({
      fontSize: typography.size.body2,
      color: colors.text.primary,
    }),
    [],
  );

  const levelTabTextActiveStyle = useMemo(
    (): TextStyle => ({
      fontWeight: typography.weight.bold,
      color: colors.text.primary,
    }),
    [],
  );

  const unlockedBadgeStyle = useMemo(
    (): ViewStyle => ({
      marginLeft: spacing.xs,
      backgroundColor: colors.status.success,
      width: 16,
      height: 16,
      borderRadius: BorderRadius.full,
      alignItems: 'center',
      justifyContent: 'center',
    }),
    [],
  );

  const unlockedTextStyle = useMemo(
    (): TextStyle => ({
      fontSize: typography.size.small,
      color: colors.text.inverse,
      fontWeight: typography.weight.bold,
    }),
    [],
  );

  const benefitsSectionStyle = useMemo(
    (): ViewStyle => ({
      padding: spacing.lg,
    }),
    [],
  );

  const benefitsHeaderStyle = useMemo(
    (): ViewStyle => ({
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.lg,
    }),
    [],
  );

  const benefitsTitleStyle = useMemo(
    (): TextStyle => ({
      ...textStyles.h3,
      color: colors.text.primary,
    }),
    [],
  );

  const unlockedTagStyle = useMemo(
    (): ViewStyle => ({
      backgroundColor: colors.status.success,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: BorderRadius.sm,
    }),
    [],
  );

  const unlockedTagTextStyle = useMemo(
    (): TextStyle => ({
      color: colors.text.inverse,
      fontSize: typography.size.caption,
      fontWeight: typography.weight.bold,
    }),
    [],
  );

  const lockedTagStyle = useMemo(
    (): ViewStyle => ({
      backgroundColor: colors.background.tertiary,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: BorderRadius.sm,
    }),
    [],
  );

  const lockedTagTextStyle = useMemo(
    (): TextStyle => ({
      color: colors.text.secondary,
      fontSize: typography.size.caption,
    }),
    [],
  );

  const benefitsListStyle = useMemo(
    (): ViewStyle => ({
      gap: spacing.md,
    }),
    [],
  );

  const benefitCardBaseStyle = useMemo(
    (): ViewStyle => ({
      marginBottom: spacing.sm,
    }),
    [],
  );

  const benefitCardUnlockedStyle = useMemo(
    (): ViewStyle => ({
      borderLeftWidth: 4,
      borderLeftColor: colors.primary.main,
    }),
    [],
  );

  const benefitCardLockedStyle = useMemo(
    (): ViewStyle => ({
      opacity: 0.6,
    }),
    [],
  );

  const benefitHeaderStyle = useMemo(
    (): ViewStyle => ({
      flexDirection: 'row',
      alignItems: 'center',
    }),
    [],
  );

  const benefitIconWrapperStyle = useMemo(
    (): ViewStyle => ({
      width: 48,
      height: 48,
      borderRadius: BorderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.md,
    }),
    [],
  );

  const benefitInfoStyle = useMemo(
    (): ViewStyle => ({
      flex: 1,
    }),
    [],
  );

  const benefitTitleStyle = useMemo(
    (): TextStyle => ({
      fontSize: typography.size.body,
      fontWeight: typography.weight.bold,
      color: colors.text.primary,
      marginBottom: spacing.xs,
    }),
    [],
  );

  const benefitDescStyle = useMemo(
    (): TextStyle => ({
      fontSize: 13,
      color: colors.text.secondary,
    }),
    [],
  );

  const newBadgeStyle = useMemo(
    (): ViewStyle => ({
      backgroundColor: colors.primary.main,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: BorderRadius.sm,
    }),
    [],
  );

  const newBadgeTextStyle = useMemo(
    (): TextStyle => ({
      color: colors.text.inverse,
      fontSize: typography.size.small,
      fontWeight: typography.weight.bold,
    }),
    [],
  );

  const compareSectionStyle = useMemo(
    (): ViewStyle => ({
      padding: spacing.lg,
    }),
    [],
  );

  const sectionTitleStyle = useMemo(
    (): TextStyle => ({
      ...textStyles.h3,
      color: colors.text.primary,
      marginBottom: spacing.lg,
    }),
    [],
  );

  const compareTableStyle = useMemo(
    (): ViewStyle => ({
      overflow: 'hidden',
    }),
    [],
  );

  const compareHeaderStyle = useMemo(
    (): ViewStyle => ({
      flexDirection: 'row',
      backgroundColor: colors.background.tertiary,
      paddingVertical: spacing.md,
    }),
    [],
  );

  const compareHeaderCellStyle = useMemo(
    (): TextStyle => ({
      flex: 1,
      textAlign: 'center',
      fontSize: typography.size.caption,
      fontWeight: typography.weight.bold,
      color: colors.text.primary,
    }),
    [],
  );

  const compareRowStyle = useMemo(
    (): ViewStyle => ({
      flexDirection: 'row',
      borderTopWidth: 1,
      borderTopColor: colors.divider,
      paddingVertical: spacing.md,
    }),
    [],
  );

  const compareCellStyle = useMemo(
    (): TextStyle => ({
      flex: 1,
      textAlign: 'center',
      fontSize: 13,
      color: colors.text.secondary,
    }),
    [],
  );

  const checkMarkStyle = useMemo(
    (): TextStyle => ({
      color: colors.status.success,
      fontWeight: typography.weight.bold,
    }),
    [],
  );

  const crossMarkStyle = useMemo(
    (): TextStyle => ({
      color: colors.text.tertiary,
    }),
    [],
  );

  const upgradeSectionStyle = useMemo(
    (): ViewStyle => ({
      margin: spacing.lg,
      alignItems: 'center',
    }),
    [],
  );

  const upgradeTitleStyle = useMemo(
    (): TextStyle => ({
      ...textStyles.h3,
      color: colors.text.primary,
      marginBottom: spacing.sm,
    }),
    [],
  );

  const upgradeDescStyle = useMemo(
    (): TextStyle => ({
      fontSize: typography.size.body2,
      color: colors.text.secondary,
      marginBottom: spacing.lg,
      textAlign: 'center',
    }),
    [],
  );

  const loadVipStatus = useCallback(async () => {
    try {
      const res = await vipApi.getSubscriptionStatus();
      if (res.success || (res as any).code === 0) {
        const data = (res as any).data || {};
        const level = data.level || data.vip_level || 1;
        setCurrentLevel(level);
        setSelectedLevel(level);
      }
    } catch (error) {
      console.error('加载VIP状态失败:', error);
    }
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadVipStatus();
    setRefreshing(false);
  };

  useEffect(() => {
    loadVipStatus();
  }, [loadVipStatus]);

  const currentLevelData =
    VIP_BENEFITS.find(l => l.level === currentLevel) || VIP_BENEFITS[0];
  const selectedLevelData =
    VIP_BENEFITS.find(l => l.level === selectedLevel) || VIP_BENEFITS[0];

  const hasBenefit = (level: VipLevelBenefits, benefitName: string) => {
    return level.benefits.some(b =>
      benefitName === '优先购票'
        ? b.title.includes('优先')
        : benefitName === '消费折扣'
          ? b.title.includes('折')
          : benefitName === '专属客服'
            ? b.title.includes('客服')
            : benefitName === '生日礼包'
              ? b.title.includes('生日')
              : b.title.includes('积分'),
    );
  };

  return (
    <ScrollView
      style={containerStyle}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* 当前等级 */}
      <View style={headerStyle}>
        <GlassCard
          style={[currentCardStyle, { borderColor: currentLevelData.color }]}
          intensity="medium"
          glow
          glowColor={currentLevelData.color}
        >
          <View style={currentHeaderStyle}>
            <View
              style={[
                levelBadgeStyle,
                { backgroundColor: currentLevelData.color },
              ]}
            >
              <Text style={{ fontSize: 24 }}>👑</Text>
            </View>
            <View>
              <Text style={currentLabelStyle}>当前等级</Text>
              <Text
                style={[currentNameStyle, { color: currentLevelData.color }]}
              >
                {currentLevelData.name}
              </Text>
            </View>
          </View>
          <Text style={currentDescStyle}>
            您已解锁 {currentLevelData.benefits.length} 项专属权益
          </Text>
        </GlassCard>
      </View>

      {/* 等级切换 */}
      <View style={levelTabsStyle}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {VIP_BENEFITS.map(level => (
            <TouchableOpacity
              key={level.level}
              style={[
                levelTabBaseStyle,
                selectedLevel === level.level && {
                  backgroundColor: level.color,
                },
              ]}
              onPress={() => setSelectedLevel(level.level)}
            >
              <Text
                style={[
                  levelTabTextStyle,
                  selectedLevel === level.level && levelTabTextActiveStyle,
                ]}
              >
                {level.name}
              </Text>
              {level.level <= currentLevel && (
                <View style={unlockedBadgeStyle}>
                  <Text style={unlockedTextStyle}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* 权益列表 */}
      <View style={benefitsSectionStyle}>
        <View style={benefitsHeaderStyle}>
          <Text style={benefitsTitleStyle}>
            {selectedLevelData.name} 权益
          </Text>
          {selectedLevel <= currentLevel ? (
            <View style={unlockedTagStyle}>
              <Text style={unlockedTagTextStyle}>已解锁</Text>
            </View>
          ) : (
            <View style={lockedTagStyle}>
              <Text style={lockedTagTextStyle}>未解锁</Text>
            </View>
          )}
        </View>

        <View style={benefitsListStyle}>
          {selectedLevelData.benefits.map(benefit => (
            <GlassCard
              key={benefit.id}
              style={[
                benefitCardBaseStyle,
                selectedLevel <= currentLevel
                  ? benefitCardUnlockedStyle
                  : benefitCardLockedStyle,
              ]}
              intensity={selectedLevel <= currentLevel ? 'medium' : 'light'}
            >
              <View style={benefitHeaderStyle}>
                <View
                  style={[
                    benefitIconWrapperStyle,
                    { backgroundColor: `${selectedLevelData.color}20` },
                  ]}
                >
                  <Text style={{ fontSize: 24 }}>{benefit.icon}</Text>
                </View>
                <View style={benefitInfoStyle}>
                  <Text style={benefitTitleStyle}>{benefit.title}</Text>
                  <Text style={benefitDescStyle}>{benefit.description}</Text>
                </View>
                {benefit.isNew && (
                  <View style={newBadgeStyle}>
                    <Text style={newBadgeTextStyle}>NEW</Text>
                  </View>
                )}
              </View>
            </GlassCard>
          ))}
        </View>
      </View>

      {/* 权益对比 */}
      <View style={compareSectionStyle}>
        <Text style={sectionTitleStyle}>权益对比</Text>
        <GlassCard style={compareTableStyle} intensity="light">
          <View style={compareHeaderStyle}>
            <Text style={compareHeaderCellStyle}>权益</Text>
            {VIP_BENEFITS.map(level => (
              <Text
                key={level.level}
                style={[
                  compareHeaderCellStyle,
                  level.level === currentLevel && { color: level.color },
                ]}
              >
                {level.name.replace('会员', '')}
              </Text>
            ))}
          </View>
          {COMPARE_BENEFITS.map((benefit, idx) => (
            <View key={idx} style={compareRowStyle}>
              <Text style={compareCellStyle}>{benefit}</Text>
              {VIP_BENEFITS.map(level => {
                const benefitExists = hasBenefit(level, benefit);
                return (
                  <Text
                    key={level.level}
                    style={[
                      compareCellStyle,
                      benefitExists ? checkMarkStyle : crossMarkStyle,
                    ]}
                  >
                    {benefitExists ? '✓' : '✗'}
                  </Text>
                );
              })}
            </View>
          ))}
        </GlassCard>
      </View>

      {/* 升级提示 */}
      {selectedLevel > currentLevel && (
        <GlassCard
          style={upgradeSectionStyle}
          intensity="medium"
          glow
          glowColor={selectedLevelData.color}
        >
          <Text style={upgradeTitleStyle}>
            升级到 {selectedLevelData.name}
          </Text>
          <Text style={upgradeDescStyle}>
            解锁更多专属权益，享受更优质服务
          </Text>
          <GlassButton
            title="立即升级"
            onPress={() => (navigation as any).navigate('VIPCenter')}
            variant="gradient"
            size="medium"
            fullWidth
          />
        </GlassCard>
      )}
    </ScrollView>
  );
}
