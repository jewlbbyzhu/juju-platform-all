import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { vipApi } from '../api/vip';
import {useTheme, vipColors, glow, spacing, typography, BorderRadius} from '../theme';
import { GlassCard } from '../components/GlassCard';
import { Skeleton } from '../components/Skeleton';

interface VipLevel {
  id: string;
  level: number;
  name: string;
  minPoints: number;
  maxPoints: number;
  benefits: string[];
  color: string;
}

const VIP_LEVELS: VipLevel[] = [
  {
    id: '1',
    level: 1,
    name: '铜牌会员',
    minPoints: 0,
    maxPoints: 999,
    benefits: ['基础客服支持', '活动提醒', '积分累计'],
    color: vipColors.bronze,
  },
  {
    id: '2',
    level: 2,
    name: '银牌会员',
    minPoints: 1000,
    maxPoints: 4999,
    benefits: ['优先购票', '9.5折优惠', '专属客服', '生日礼包'],
    color: vipColors.silver,
  },
  {
    id: '3',
    level: 3,
    name: '金牌会员',
    minPoints: 5000,
    maxPoints: 14999,
    benefits: ['优先购票', '9折优惠', '专属客服', '生日礼包', '专属徽章'],
    color: vipColors.gold,
  },
  {
    id: '4',
    level: 4,
    name: '铂金会员',
    minPoints: 15000,
    maxPoints: 49999,
    benefits: [
      '优先购票',
      '8.5折优惠',
      'VIP专属活动',
      '一对一客服',
      '双倍积分',
    ],
    color: vipColors.platinum,
  },
  {
    id: '5',
    level: 5,
    name: '钻石会员',
    minPoints: 50000,
    maxPoints: 999999,
    benefits: [
      '优先购票',
      '8折优惠',
      '专属定制活动',
      '私人管家',
      '三倍积分',
      '限量周边',
    ],
    color: vipColors.diamond,
  },
];

export default function VIPLevelsScreen(): React.JSX.Element {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const [currentLevel, setCurrentLevel] = useState(1);
  const [currentPoints, setCurrentPoints] = useState(2500);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadVipLevels = useCallback(async () => {
    setLoading(true);
    try {
      const res = await vipApi.getVipLevels();
      if (res.success || (res as any).code === 0) {
        const data = (res as any).data || {};
        setCurrentLevel(data.currentLevel || data.current_level || 1);
        setCurrentPoints(data.currentPoints || data.current_points || 0);
      }
    } catch (error) {
      console.error('加载VIP等级失败:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadVipLevels();
    setRefreshing(false);
  };

  useEffect(() => {
    loadVipLevels();
  }, [loadVipLevels]);

  const currentLevelData =
    VIP_LEVELS.find(l => l.level === currentLevel) || VIP_LEVELS[0];
  const nextLevel = VIP_LEVELS.find(l => l.level === currentLevel + 1);
  const progress = nextLevel
    ? ((currentPoints - currentLevelData.minPoints) /
        (nextLevel.minPoints - currentLevelData.minPoints)) *
      100
    : 100;
  const containerStyle: ViewStyle = {
      flex: 1,
      backgroundColor: colors.background.secondary,
  };

  const headerStyle: ViewStyle = {
      padding: spacing.lg,
      paddingTop: 60,
      backgroundColor: colors.background.primary,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
  };

  const headerTitleStyle: TextStyle = {
      fontSize: typography.size.display,
      fontWeight: typography.weight.bold,
      color: colors.text.primary,
  };

  const headerSubtitleStyle: TextStyle = {
      fontSize: typography.size.body2,
      color: colors.text.secondary,
      marginTop: spacing.xs,
  };

  const skeletonContainerStyle: ViewStyle = {
      margin: spacing.lg,
  };

  const currentCardStyle: ViewStyle = {
      margin: spacing.lg,
      padding: 0,
      borderWidth: 2,
      borderColor: currentLevelData.color,
  };

  const currentHeaderStyle: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
  };

  const levelBadgeStyle: ViewStyle = {
      width: 60,
      height: 60,
      borderRadius: 30,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.lg,
      ...glow.gold,
  };

  const levelIconStyle: TextStyle = {
      fontSize: typography.size.h1,
  };

  const currentTitleStyle: TextStyle = {
      fontSize: typography.size.body2,
      color: colors.text.secondary,
      marginBottom: spacing.xs,
  };

  const currentLevelNameStyle: TextStyle = {
      fontSize: typography.size.h1,
      fontWeight: typography.weight.bold,
      color: currentLevelData.color,
  };

  const pointsSectionStyle: ViewStyle = {
      alignItems: 'center',
      paddingVertical: spacing.xl,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
  };

  const pointsLabelStyle: TextStyle = {
      fontSize: typography.size.body2,
      color: colors.text.secondary,
      marginBottom: spacing.sm,
  };

  const pointsValueStyle: TextStyle = {
      fontSize: 48,
      fontWeight: typography.weight.bold,
      color: colors.accent.gold,
      ...glow.gold,
  };

  const progressSectionStyle: ViewStyle = {
      padding: spacing.lg,
  };

  const progressHeaderStyle: ViewStyle = {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: spacing.md,
  };

  const progressTextStyle: TextStyle = {
      fontSize: typography.size.caption,
      color: colors.text.secondary,
  };

  const progressValueStyle: TextStyle = {
      fontSize: typography.size.caption,
      color: colors.primary.main,
      fontWeight: typography.weight.bold,
  };

  const progressBarStyle: ViewStyle = {
      height: 8,
      backgroundColor: colors.divider,
      borderRadius: BorderRadius.xs,
      overflow: 'hidden',
  };

  const progressFillBaseStyle: ViewStyle = {
      height: '100%',
      borderRadius: BorderRadius.xs,
  };

  const nextLevelHintStyle: TextStyle = {
      fontSize: typography.size.small,
      color: colors.text.tertiary,
      marginTop: spacing.md,
      textAlign: 'center',
  };

  const levelsSectionStyle: ViewStyle = {
      padding: spacing.lg,
  };

  const sectionTitleStyle: TextStyle = {
      fontSize: typography.size.h3,
      fontWeight: typography.weight.bold,
      color: colors.text.primary,
      marginBottom: spacing.lg,
  };

  const levelCardStyle: ViewStyle = {
      marginBottom: spacing.md,
      padding: 0,
  };

  const levelCardActiveStyle: ViewStyle = {
      borderWidth: 2,
      borderColor: colors.primary.main,
  };

  const levelRowStyle: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing.lg,
  };

  const levelIconWrapperStyle: ViewStyle = {
      width: 44,
      height: 44,
      borderRadius: BorderRadius.xl,
      alignItems: 'center',
      justifyContent: 'center',
  };

  const levelNumberStyle: TextStyle = {
      fontSize: typography.size.h3,
      fontWeight: typography.weight.bold,
      color: colors.gray[900],
  };

  const levelInfoStyle: ViewStyle = {
    flex: 1,
    marginLeft: spacing.md,
  };

  const levelNameStyle: TextStyle = {
      fontSize: typography.size.body,
      fontWeight: typography.weight.bold,
      color: colors.text.primary,
      marginBottom: spacing.xs,
  };

  const levelPointsStyle: TextStyle = {
      fontSize: typography.size.small,
      color: colors.text.tertiary,
  };

  const currentBadgeStyle: ViewStyle = {
      backgroundColor: colors.primary.main,
      paddingHorizontal: spacing.md,
      paddingVertical: 5,
      borderRadius: BorderRadius.full,
      ...glow.primary,
  };

  const currentBadgeTextStyle: TextStyle = {
      color: colors.text.inverse,
      fontSize: typography.size.small,
      fontWeight: typography.weight.bold,
  };

  const benefitsRowStyle: ViewStyle = {
      flexDirection: 'row',
      flexWrap: 'wrap',
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.lg,
      gap: spacing.sm,
  };

  const benefitTagStyle: ViewStyle = {
      backgroundColor: colors.primary.main + '1A',
      paddingHorizontal: spacing.md,
      paddingVertical: 6,
      borderRadius: BorderRadius.full,
      borderWidth: 1,
      borderColor: colors.primary.main + '33',
  };

  const benefitTagTextStyle: TextStyle = {
      fontSize: typography.size.small,
      color: colors.primary.main,
  };

  const levelArrowStyle: ViewStyle = {
      alignItems: 'center',
      paddingBottom: spacing.md,
  };

  const arrowTextStyle: TextStyle = {
      fontSize: 20,
      color: colors.text.tertiary,
  };

  const tipSectionStyle: ViewStyle = {
      margin: spacing.lg,
      marginTop: spacing.sm,
  };

  const tipTitleStyle: TextStyle = {
      fontSize: typography.size.body,
      fontWeight: typography.weight.bold,
      color: colors.accent.gold,
      marginBottom: spacing.lg,
  };

  const tipListStyle: ViewStyle = {
      gap: spacing.md,
  };

  const tipItemStyle: TextStyle = {
      fontSize: typography.size.body2,
      color: colors.text.secondary,
      lineHeight: typography.size.body2 * typography.lineHeight.normal,
  };

  if (loading) {
    return (
      <View style={containerStyle}>
        <View style={headerStyle}>
          <Text style={headerTitleStyle}>等级体系</Text>
        </View>
        <View style={skeletonContainerStyle}>
          <Skeleton width="100%" height={200} borderRadius={20} />
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={containerStyle}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary.main}
        />
      }
    >
      {/* Header */}
      <View style={headerStyle}>
        <Text style={headerTitleStyle}>等级体系</Text>
        <Text style={headerSubtitleStyle}>升级会员等级，解锁更多权益</Text>
      </View>

      {/* Current Level Card */}
      <GlassCard
        style={currentCardStyle}
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
            <Text style={levelIconStyle}>👑</Text>
          </View>
          <View>
            <Text style={currentTitleStyle}>当前等级</Text>
            <Text style={currentLevelNameStyle}>
              {currentLevelData.name}
            </Text>
          </View>
        </View>

        <View style={pointsSectionStyle}>
          <Text style={pointsLabelStyle}>当前积分</Text>
          <Text style={pointsValueStyle}>
            {currentPoints.toLocaleString()}
          </Text>
        </View>

        {nextLevel && (
          <View style={progressSectionStyle}>
            <View style={progressHeaderStyle}>
              <Text style={progressTextStyle}>距离下一等级还需</Text>
              <Text style={progressValueStyle}>
                {(nextLevel.minPoints - currentPoints).toLocaleString()} 积分
              </Text>
            </View>
            <View style={progressBarStyle}>
              <View
                style={[
                  progressFillBaseStyle,
                  {
                    width: `${Math.max(0, Math.min(100, progress))}%`,
                    backgroundColor: currentLevelData.color,
                  },
                ]}
              />
            </View>
            <Text style={nextLevelHintStyle}>
              升级后可享受 {nextLevel.name} 专属权益
            </Text>
          </View>
        )}
      </GlassCard>

      {/* Levels List */}
      <View style={levelsSectionStyle}>
        <Text style={sectionTitleStyle}>等级体系</Text>
        {VIP_LEVELS.map((level, index) => (
          <GlassCard
            key={level.id}
            style={[
              levelCardStyle,
              level.level === currentLevel && levelCardActiveStyle,
            ]}
            intensity={level.level === currentLevel ? 'medium' : 'light'}
            glow={level.level === currentLevel}
            glowColor={level.color}
          >
            <View style={levelRowStyle}>
              <View
                style={[
                  levelIconWrapperStyle,
                  { backgroundColor: level.color },
                ]}
              >
                <Text style={levelNumberStyle}>{level.level}</Text>
              </View>
              <View style={levelInfoStyle}>
                <Text style={levelNameStyle}>{level.name}</Text>
                <Text style={levelPointsStyle}>
                  {level.minPoints.toLocaleString()} -{' '}
                  {level.maxPoints.toLocaleString()} 积分
                </Text>
              </View>
              {level.level === currentLevel && (
                <View style={currentBadgeStyle}>
                  <Text style={currentBadgeTextStyle}>当前</Text>
                </View>
              )}
            </View>

            <View style={benefitsRowStyle}>
              {level.benefits.map((benefit, idx) => (
                <View key={idx} style={benefitTagStyle}>
                  <Text style={benefitTagTextStyle}>✓ {benefit}</Text>
                </View>
              ))}
            </View>

            {index < VIP_LEVELS.length - 1 && (
              <View style={levelArrowStyle}>
                <Text style={arrowTextStyle}>↓</Text>
              </View>
            )}
          </GlassCard>
        ))}
      </View>

      {/* Tips Section */}
      <GlassCard style={tipSectionStyle} intensity="light">
        <Text style={tipTitleStyle}>💡 升级小贴士</Text>
        <View style={tipListStyle}>
          <Text style={tipItemStyle}>• 参与活动可获得积分</Text>
          <Text style={tipItemStyle}>• 每日签到奖励积分</Text>
          <Text style={tipItemStyle}>• 邀请好友获得额外积分</Text>
          <Text style={tipItemStyle}>• 消费金额可累积积分</Text>
        </View>
      </GlassCard>
    </ScrollView>
  );
}
