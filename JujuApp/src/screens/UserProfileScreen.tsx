import React, {useEffect, useState, useMemo} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { profileApi } from '../api';
import {
  useTheme,
  spacing,
  typography,
  BorderRadius,
  Shadows,
  gradients,
} from '../theme';
import { GlassCard } from '../components/GlassCard';
import { GlassButton } from '../components/GlassButton';
import { SkeletonCard, SkeletonProfile } from '../components/Skeleton';

const { width } = Dimensions.get('window');

interface Tag {
  id: string;
  name: string;
}

interface Party {
  id: string;
  title: string;
  match_score?: number;
}

export default function UserProfileScreen() {
  const { colors } = useTheme();
  const themeGradients = gradients;
  const [userTags, setUserTags] = useState<Tag[]>([]);
  const [preferences, setPreferences] = useState<Record<string, string>>({});
  const [statistics, setStatistics] = useState<Record<string, number>>({});
  const [behavior, setBehavior] = useState<Record<string, number>>({});
  const [recommendedParties, setRecommendedParties] = useState<Party[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  const loadUserProfile = async () => {
    try {
      const res = await profileApi.getUserProfile();
      if (res.success) {
        const data = (res as any).data;
        setUserTags(data.tags || []);
        setPreferences(data.preferences || {});
        setStatistics(data.statistics || {});
        setBehavior(data.behavior || {});
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadRecommendedParties = async () => {
    try {
      const res = await profileApi.getRecommendedParties({ pageSize: 10 });
      if (res.success) setRecommendedParties((res as any).data?.list || []);
    } catch (e) {
      console.error(e);
    }
  };

  const loadData = async () => {
    setLoading(true);
    await Promise.all([loadUserProfile(), loadRecommendedParties()]);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadUserProfile(), loadRecommendedParties()]);
    setRefreshing(false);
  };
  const containerStyle = useMemo(
    (): ViewStyle => ({
      flex: 1,
      backgroundColor: colors.background.secondary,
    }),
    [],
  );

  const headerGradientStyle = useMemo(
    (): ViewStyle => ({
      paddingTop: 60,
      paddingBottom: 30,
      paddingHorizontal: spacing.lg,
    }),
    [],
  );

  const headerContentStyle = useMemo(
    (): ViewStyle => ({
      alignItems: 'center',
    }),
    [],
  );

  const headerTitleStyle = useMemo(
    (): TextStyle => ({
      fontSize: typography.size.h2,
      fontWeight: typography.weight.bold,
      color: colors.text.inverse,
      marginBottom: spacing.xs,
    }),
    [],
  );

  const headerSubtitleStyle = useMemo(
    (): TextStyle => ({
      fontSize: typography.size.body2,
      color: colors.text.secondary,
    }),
    [],
  );

  const contentStyle = useMemo(
    (): ViewStyle => ({
      padding: spacing.md,
      paddingBottom: spacing['2xl'],
    }),
    [],
  );

  const skeletonContainerStyle = useMemo(
    (): ViewStyle => ({
      padding: spacing.md,
    }),
    [],
  );

  const editLinkStyle = useMemo(
    (): TextStyle => ({
      fontSize: typography.size.body2,
      color: colors.primary.main,
      fontWeight: typography.weight.semibold,
    }),
    [],
  );

  const tagsContainerStyle = useMemo(
    (): ViewStyle => ({
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    }),
    [],
  );

  const tagItemBaseStyle = useMemo(
    (): ViewStyle => ({
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: BorderRadius.full,
      borderWidth: 1,
    }),
    [],
  );

  const tagItemStyle = useMemo(
    (): ViewStyle => ({
      ...tagItemBaseStyle,
      backgroundColor: colors.primary.light + '26',
      borderColor: colors.primary.light + '4D',
    }),
    [tagItemBaseStyle],
  );

  const addTagStyle = useMemo(
    (): ViewStyle => ({
      ...tagItemBaseStyle,
      backgroundColor: colors.background.tertiary,
      borderStyle: 'dashed',
      borderColor: colors.border,
    }),
    [tagItemBaseStyle],
  );

  const tagNameStyle = useMemo(
    (): TextStyle => ({
      fontSize: typography.size.body2,
      color: colors.text.primary,
      fontWeight: typography.weight.medium,
    }),
    [],
  );

  const preferencesGridStyle = useMemo(
    (): ViewStyle => ({
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    }),
    [],
  );

  const preferenceItemStyle = useMemo(
    (): ViewStyle => ({
      width: (width - 72) / 2,
    }),
    [],
  );

  const preferenceLabelStyle = useMemo(
    (): TextStyle => ({
      fontSize: typography.size.caption,
      color: colors.text.secondary,
      marginBottom: spacing.sm,
    }),
    [],
  );

  const preferenceValueStyle = useMemo(
    (): ViewStyle => ({
      padding: spacing.md,
      borderRadius: BorderRadius.md,
    }),
    [],
  );

  const valueTextStyle = useMemo(
    (): TextStyle => ({
      fontSize: typography.size.body2,
      color: colors.primary.main,
      fontWeight: typography.weight.semibold,
    }),
    [],
  );

  const statsGridStyle = useMemo(
    (): ViewStyle => ({
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    }),
    [],
  );

  const statCardStyle = useMemo(
    (): ViewStyle => ({
      width: (width - 72) / 2,
      padding: spacing.md,
      borderRadius: BorderRadius.lg,
      alignItems: 'center',
    }),
    [],
  );

  const statIconStyle = useMemo(
    (): TextStyle => ({
      fontSize: 24,
      marginBottom: spacing.sm,
    }),
    [],
  );

  const statValueStyle = useMemo(
    (): TextStyle => ({
      fontSize: 24,
      fontWeight: typography.weight.bold,
      color: colors.accent.gold,
      marginBottom: spacing.xs,
    }),
    [],
  );

  const statLabelStyle = useMemo(
    (): TextStyle => ({
      fontSize: typography.size.caption,
      color: colors.text.secondary,
    }),
    [],
  );

  const behaviorItemStyle = useMemo(
    (): ViewStyle => ({
      padding: spacing.xs,
    }),
    [],
  );

  const behaviorLabelStyle = useMemo(
    (): TextStyle => ({
      fontSize: typography.size.body2,
      color: colors.text.primary,
      marginBottom: spacing.md,
      fontWeight: typography.weight.semibold,
    }),
    [],
  );

  const frequencyChartStyle = useMemo(
    (): ViewStyle => ({
      flexDirection: 'row',
      gap: spacing.sm,
    }),
    [],
  );

  const frequencyItemStyle = useMemo(
    (): ViewStyle => ({
      flex: 1,
      padding: spacing.md,
      borderRadius: BorderRadius.md,
      alignItems: 'center',
    }),
    [],
  );

  const freqLabelStyle = useMemo(
    (): TextStyle => ({
      fontSize: typography.size.caption,
      color: colors.text.secondary,
      marginBottom: spacing.xs,
    }),
    [],
  );

  const freqValueStyle = useMemo(
    (): TextStyle => ({
      fontSize: typography.size.body,
      fontWeight: typography.weight.bold,
      color: colors.text.inverse,
    }),
    [],
  );

  const recommendRowStyle = useMemo(
    (): ViewStyle => ({
      flexDirection: 'row',
      gap: spacing.md,
      paddingVertical: spacing.xs,
    }),
    [],
  );

  const recommendItemStyle = useMemo(
    (): ViewStyle => ({
      width: 150,
      backgroundColor: colors.background.card,
      borderRadius: BorderRadius.lg,
      overflow: 'hidden',
      ...Shadows.medium,
    }),
    [],
  );

  const recommendImageStyle = useMemo(
    (): ViewStyle => ({
      height: 100,
      alignItems: 'center',
      justifyContent: 'center',
    }),
    [],
  );

  const placeholderImageStyle = useMemo(
    (): TextStyle => ({
      fontSize: 40,
    }),
    [],
  );

  const recommendInfoStyle = useMemo(
    (): ViewStyle => ({
      padding: spacing.md,
    }),
    [],
  );

  const recommendTitleStyle = useMemo(
    (): TextStyle => ({
      fontSize: typography.size.body2,
      color: colors.text.primary,
      marginBottom: spacing.xs,
      fontWeight: typography.weight.semibold,
    }),
    [],
  );

  const matchBadgeStyle = useMemo(
    (): ViewStyle => ({
      backgroundColor: colors.status.success + '26',
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: BorderRadius.sm,
      alignSelf: 'flex-start',
    }),
    [],
  );

  const recommendMatchStyle = useMemo(
    (): TextStyle => ({
      fontSize: 11,
      color: colors.status.success,
      fontWeight: typography.weight.semibold,
    }),
    [],
  );

  const actionSectionStyle = useMemo(
    (): ViewStyle => ({
      flexDirection: 'row',
      gap: spacing.md,
      marginTop: spacing.sm,
    }),
    [],
  );

  const actionBtnStyle = useMemo(
    (): ViewStyle => ({
      flex: 1,
    }),
    [],
  );

  const renderHeader = () => (
    <LinearGradient
      colors={themeGradients.warm}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={headerGradientStyle}
    >
      <View style={headerContentStyle}>
        <Text style={headerTitleStyle}>用户画像</Text>
        <Text style={headerSubtitleStyle}>完善信息，获得更精准推荐</Text>
      </View>
    </LinearGradient>
  );

  const renderInterestTags = () => (
    <GlassCard
      title="🏷️ 兴趣标签"
      headerRight={
        <TouchableOpacity
          onPress={() => (navigation as any).navigate('EditTags')}
        >
          <Text style={editLinkStyle}>编辑</Text>
        </TouchableOpacity>
      }
      glow
      glowColor={colors.primary.light}
    >
      <View style={tagsContainerStyle}>
        {userTags.map(tag => (
          <View key={tag.id} style={tagItemStyle}>
            <Text style={tagNameStyle}>{tag.name}</Text>
          </View>
        ))}
        <TouchableOpacity
          style={addTagStyle}
          onPress={() => (navigation as any).navigate('AddTag')}
        >
          <Text style={tagNameStyle}>+ 添加</Text>
        </TouchableOpacity>
      </View>
    </GlassCard>
  );

  const renderPreferences = () => (
    <GlassCard
      title="❤️ 偏好设置"
      headerRight={
        <TouchableOpacity
          onPress={() => (navigation as any).navigate('EditPreferences')}
        >
          <Text style={editLinkStyle}>编辑</Text>
        </TouchableOpacity>
      }
    >
      <View style={preferencesGridStyle}>
        {[
          { label: '聚会类型', value: preferences.partyType },
          { label: '活动时间', value: preferences.partyTime },
          { label: '参与人数', value: preferences.partySize },
          { label: '预算范围', value: preferences.budget },
        ].map(item => (
          <View key={item.label} style={preferenceItemStyle}>
            <Text style={preferenceLabelStyle}>{item.label}</Text>
            <LinearGradient
              colors={[colors.primary.main + '26', colors.primary.light + '1A']}
              style={preferenceValueStyle}
            >
              <Text style={valueTextStyle}>{item.value || '未设置'}</Text>
            </LinearGradient>
          </View>
        ))}
      </View>
    </GlassCard>
  );

  const renderStatistics = () => (
    <GlassCard title="📊 数据统计" glow glowColor={colors.accent.gold}>
      <View style={statsGridStyle}>
        {[
          { icon: '🎉', label: '参与聚会', value: statistics.totalParties },
          {
            icon: '👥',
            label: '认识好友',
            value: statistics.totalParticipants,
          },
          { icon: '💬', label: '发表评论', value: statistics.totalComments },
          { icon: '❤️', label: '获得点赞', value: statistics.totalLikes },
        ].map(stat => (
          <LinearGradient
            key={stat.label}
            colors={[colors.accent.gold + '26', colors.accent.gold + '0D']}
            style={statCardStyle}
          >
            <Text style={statIconStyle}>{stat.icon}</Text>
            <Text style={statValueStyle}>{stat.value || 0}</Text>
            <Text style={statLabelStyle}>{stat.label}</Text>
          </LinearGradient>
        ))}
      </View>
    </GlassCard>
  );

  const renderBehavior = () => (
    <GlassCard title="🎯 行为分析">
      <View style={behaviorItemStyle}>
        <Text style={behaviorLabelStyle}>参与频率</Text>
        <View style={frequencyChartStyle}>
          {[
            { label: '本周', value: behavior.weeklyCount || 0 },
            { label: '本月', value: behavior.monthlyCount || 0 },
            { label: '总计', value: behavior.totalCount || 0 },
          ].map(item => (
            <LinearGradient
              key={item.label}
              colors={themeGradients.primary}
              style={frequencyItemStyle}
            >
              <Text style={freqLabelStyle}>{item.label}</Text>
              <Text style={freqValueStyle}>{item.value}次</Text>
            </LinearGradient>
          ))}
        </View>
      </View>
    </GlassCard>
  );

  const renderRecommendations = () => {
    if (recommendedParties.length === 0) return null;

    return (
      <GlassCard title="✨ 智能推荐" intensity="heavy">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={recommendRowStyle}>
            {recommendedParties.map(party => (
              <TouchableOpacity
                key={party.id}
                style={recommendItemStyle}
                onPress={() =>
                  (navigation as any).navigate('PartyDetail', { id: party.id })
                }
              >
                <LinearGradient
                  colors={themeGradients.cool}
                  style={recommendImageStyle}
                >
                  <Text style={placeholderImageStyle}>🎉</Text>
                </LinearGradient>
                <View style={recommendInfoStyle}>
                  <Text style={recommendTitleStyle} numberOfLines={1}>
                    {party.title}
                  </Text>
                  <View style={matchBadgeStyle}>
                    <Text style={recommendMatchStyle}>
                      匹配度 {party.match_score || 0}%
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </GlassCard>
    );
  };

  const renderActions = () => (
    <View style={actionSectionStyle}>
      <GlassButton
        title="完善画像"
        onPress={() => (navigation as any).navigate('CompleteProfile')}
        variant="gradient"
        size="large"
        fullWidth
        style={actionBtnStyle}
      />
      <GlassButton
        title="刷新数据"
        onPress={onRefresh}
        variant="secondary"
        size="large"
        fullWidth
        style={actionBtnStyle}
      />
    </View>
  );

  if (loading) {
    return (
      <ScrollView style={containerStyle} showsVerticalScrollIndicator={false}>
        {renderHeader()}
        <View style={skeletonContainerStyle}>
          <SkeletonProfile />
          <SkeletonCard />
          <SkeletonCard />
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={containerStyle}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      showsVerticalScrollIndicator={false}
    >
      {renderHeader()}
      <View style={contentStyle}>
        {renderInterestTags()}
        {renderPreferences()}
        {renderStatistics()}
        {renderBehavior()}
        {renderRecommendations()}
        {renderActions()}
      </View>
    </ScrollView>
  );
}
