import React, { useState, useCallback } from 'react';
import type { JSX } from 'react';
import {
  View,
  Text,
  Share,
  Alert,
  RefreshControl,
  ScrollView,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassCard } from '../components/GlassCard';
import { GlassButton } from '../components/GlassButton';
import { Skeleton, SkeletonCard } from '../components/Skeleton';
import {
  useTheme,
  spacing,
  typography,
  BorderRadius,
  textStyles,
} from '../theme';

// Mock API - replace with actual import
const inviteApi = {
  getMyInviteCode: async () => ({ data: { code: 'JUJU2026' } }),
  getInviteRecords: async () => ({ data: { list: [] } }),
  getInviteStatistics: async () => ({
    data: { totalInvites: 12, totalReward: 360 },
  }),
};

interface InviteStats {
  totalInvites: number;
  totalReward: number;
}

interface InviteRecord {
  id: string;
  inviteeNickname: string;
  rewardAmount: number;
}

export default function InviteCodeScreen(): JSX.Element {
  const { colors, gradients } = useTheme();

  const [inviteCode, setInviteCode] = useState('');
  const [records, setRecords] = useState<InviteRecord[]>([]);
  const [stats, setStats] = useState<InviteStats>({
    totalInvites: 0,
    totalReward: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [codeRes, recordsRes, statsRes] = await Promise.all([
        inviteApi.getMyInviteCode(),
        inviteApi.getInviteRecords(),
        inviteApi.getInviteStatistics(),
      ]);
      if (codeRes.data) setInviteCode(codeRes.data.code);
      if (recordsRes.data) setRecords(recordsRes.data.list || []);
      if (statsRes.data) setStats(statsRes.data as InviteStats);
    } catch (error) {
      console.error('Fetch invite data error:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, []),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, []);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `快来使用聚聚App！我的邀请码是: ${inviteCode}`,
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const copyCode = () => {
    // Clipboard.setString(inviteCode);
    Alert.alert('已复制', '邀请码已复制到剪贴板');
  };

  // 使用设计系统替代 useMemo 样式
  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: colors.background.secondary,
  };

  const skeletonHeaderStyle: ViewStyle = {
    padding: spacing['3xl'],
    alignItems: 'center',
    backgroundColor: colors.primary.main,
    paddingTop: spacing['5xl'],
  };

  const headerGradientStyle: ViewStyle = {
    padding: spacing['3xl'],
    paddingTop: spacing['5xl'],
    paddingBottom: spacing['3xl'],
    alignItems: 'center',
  };

  const headerTitleStyle: TextStyle = {
    ...textStyles.h1,
    color: colors.text.inverse,
    letterSpacing: 0.5,
  };

  const headerSubtitleStyle: TextStyle = {
    fontSize: typography.size.body2,
    color: colors.text.primary + 'CC',
    marginTop: spacing.sm,
  };

  const codeCardStyle: ViewStyle = {
    margin: spacing.lg,
    marginTop: -spacing.lg,
    padding: 0,
    overflow: 'hidden',
  };

  const codeGradientStyle: ViewStyle = {
    padding: spacing['3xl'],
    alignItems: 'center',
  };

  const codeLabelStyle: TextStyle = {
    fontSize: typography.size.body2,
    color: colors.text.secondary,
    marginBottom: spacing.md,
    letterSpacing: 1,
  };

  const codeTextStyle: TextStyle = {
    color: colors.primary.main,
    fontSize: typography.size.display,
    fontWeight: typography.weight.bold,
    letterSpacing: 8,
    marginBottom: spacing.sm,
  };

  const codeHintStyle: TextStyle = {
    fontSize: typography.size.caption,
    color: colors.text.tertiary,
    marginBottom: spacing['2xl'],
  };

  const shareBtnStyle: ViewStyle = {
    minWidth: 160,
  };

  const statsCardStyle: ViewStyle = {
    flexDirection: 'row',
    margin: spacing.lg,
    marginTop: 0,
    padding: spacing['2xl'],
  };

  const statItemStyle: ViewStyle = {
    flex: 1,
    alignItems: 'center',
  };

  const statDividerStyle: ViewStyle = {
    width: 1,
    backgroundColor: colors.divider,
  };

  const statValueStyle: TextStyle = {
    color: colors.text.primary,
    fontSize: typography.size.display,
    fontWeight: typography.weight.bold,
    marginBottom: spacing.xs,
  };

  const statLabelStyle: TextStyle = {
    color: colors.text.secondary,
    fontSize: typography.size.body2,
  };

  const recordsCardStyle: ViewStyle = {
    margin: spacing.lg,
    marginTop: 0,
    marginBottom: spacing['3xl'],
  };

  const recordItemStyle: ViewStyle = {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  };

  const recordNameStyle: TextStyle = {
    color: colors.text.primary,
    fontSize: typography.size.body,
    fontWeight: typography.weight.medium,
  };

  const recordRewardStyle: TextStyle = {
    color: colors.status.success,
    fontSize: typography.size.body,
    fontWeight: typography.weight.bold,
  };

  const emptyStateStyle: ViewStyle = {
    alignItems: 'center',
    paddingVertical: spacing['3xl'],
  };

  const emptyIconStyle: TextStyle = {
    fontSize: typography.size.display,
    marginBottom: spacing.md,
  };

  const emptyTextStyle: TextStyle = {
    fontSize: typography.size.body,
    fontWeight: typography.weight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  };

  const emptySubtextStyle: TextStyle = {
    fontSize: typography.size.body2,
    color: colors.text.secondary,
  };

  if (loading) {
    return (
      <View style={containerStyle}>
        <View style={skeletonHeaderStyle}>
          <Skeleton width={200} height={32} borderRadius={BorderRadius.sm} />
          <Skeleton
            width={280}
            height={48}
            borderRadius={BorderRadius.sm}
            style={{ marginTop: spacing.lg }}
          />
        </View>
        <SkeletonCard />
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
      showsVerticalScrollIndicator={false}
    >
      <LinearGradient
        colors={gradients.primary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={headerGradientStyle}
      >
        <Text style={headerTitleStyle}>邀请好友</Text>
        <Text style={headerSubtitleStyle}>邀请好友加入，赚取丰厚奖励</Text>
      </LinearGradient>

      <GlassCard
        style={codeCardStyle}
        intensity="medium"
        glow
        glowColor={colors.primary.main}
      >
        <LinearGradient
          colors={[colors.gray[900] + '1A', colors.gray[900] + '0D']}
          style={codeGradientStyle}
        >
          <Text style={codeLabelStyle}>我的邀请码</Text>
          <GlassButton
            title={inviteCode || 'Loading...'}
            onPress={copyCode}
            variant="ghost"
            size="large"
            style={{ marginBottom: spacing.sm }}
            textStyle={codeTextStyle}
          />
          <Text style={codeHintStyle}>点击复制邀请码</Text>
          <GlassButton
            title="分享邀请码"
            onPress={handleShare}
            variant="gradient"
            size="medium"
            style={shareBtnStyle}
          />
        </LinearGradient>
      </GlassCard>

      <GlassCard style={statsCardStyle} intensity="light">
        <View style={statItemStyle}>
          <Text style={statValueStyle}>{stats.totalInvites}</Text>
          <Text style={statLabelStyle}>已邀请</Text>
        </View>
        <View style={statDividerStyle} />
        <View style={statItemStyle}>
          <Text style={statValueStyle}>{stats.totalReward}</Text>
          <Text style={statLabelStyle}>已获得奖励</Text>
        </View>
      </GlassCard>

      <GlassCard title="邀请记录" style={recordsCardStyle} intensity="light">
        {records.length > 0 ? (
          records.map((record: InviteRecord) => (
            <View key={record.id} style={recordItemStyle}>
              <Text style={recordNameStyle}>{record.inviteeNickname}</Text>
              <Text style={recordRewardStyle}>+{record.rewardAmount}</Text>
            </View>
          ))
        ) : (
          <View style={emptyStateStyle}>
            <Text style={emptyIconStyle}>🎁</Text>
            <Text style={emptyTextStyle}>暂无邀请记录</Text>
            <Text style={emptySubtextStyle}>快去分享邀请码吧！</Text>
          </View>
        )}
      </GlassCard>
    </ScrollView>
  );
}
