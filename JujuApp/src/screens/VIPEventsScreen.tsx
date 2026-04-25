import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { vipApi } from '../api/vip';
import {
  useTheme,
  colors,
  spacing,
  BorderRadius,

  typography,
  textStyles,
  gradients,
} from '../theme';
import { Skeleton, SkeletonList } from '../components/Skeleton';
import { GlassCard } from '../components';
import LinearGradient from 'react-native-linear-gradient';

interface VipEvent {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  location: string;
  maxParticipants: number;
  currentParticipants: number;
  status: 'upcoming' | 'ongoing' | 'ended';
  image?: string;
  benefits: string[];
  isJoined: boolean;
}

const FILTER_OPTIONS = [
  { label: '全部', value: 'all' },
  { label: '即将开始', value: 'upcoming' },
  { label: '进行中', value: 'ongoing' },
  { label: '已结束', value: 'ended' },
];

export default function VIPEventsScreen() {
  const { glassmorphism: gm, glow: gl } = useTheme();

  const STATUS_CONFIG = {
    upcoming: {
      color: colors.primary.main,
      bgColor: colors.primary.shadow,
      text: '即将开始',
    },
    ongoing: {
      color: colors.status.success,
      bgColor: colors.status.success + '33',
      text: '进行中',
    },
    ended: {
      color: colors.gray[800] + '80',
      bgColor: colors.gray[800] + '1A',
      text: '已结束',
    },
  };

  const [events, setEvents] = useState<VipEvent[]>([]);
  const [filter, setFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const containerStyle: ViewStyle = {
      flex: 1,
      backgroundColor: colors.gray[900],
  };

  const headerStyle: ViewStyle = {
      padding: spacing.lg,
      paddingTop: 60,
      backgroundColor: colors.gray[800],
      borderBottomWidth: 1,
      borderBottomColor: colors.gray[800] + '1A',
  };

  const headerContentStyle: ViewStyle = {
      alignItems: 'center',
  };

  const headerTitleStyle: TextStyle = {
      marginBottom: spacing.sm,
  };

  const headerSubtitleStyle: TextStyle = {
      fontSize: typography.size.body2,
      color: colors.gray[500],
  };

  const statsSkeletonStyle: ViewStyle = {
      margin: spacing.lg,
  };

  const statsRowStyle: ViewStyle = {
      flexDirection: 'row',
      padding: spacing.lg,
      gap: spacing.md,
  };

  const statCardStyle: ViewStyle = {
      flex: 1,
      backgroundColor: colors.gray[800],
      borderRadius: BorderRadius.lg,
      padding: spacing.lg,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.gray[800] + '1A',
      ...gm.card,
  };

  const statValueStyle: TextStyle = {
      marginBottom: spacing.xs,
  };

  const statLabelStyle: TextStyle = {
      fontSize: typography.size.caption,
      color: colors.gray[500],
  };

  const filterSectionStyle: ViewStyle = {
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.md,
  };

  const filterBtnBaseStyle: ViewStyle = {
      paddingHorizontal: spacing.lg + spacing.xs,
      paddingVertical: spacing.sm + spacing.xs,
      borderRadius: BorderRadius.full,
      backgroundColor: colors.gray[900],
      marginRight: spacing.md,
      borderWidth: 1,
      borderColor: colors.gray[800] + '1A',
  };

  const filterBtnActiveStyle: ViewStyle = {
      backgroundColor: colors.primary.main,
      borderColor: colors.primary.main,
      ...gl.primary,
  };

  const filterBtnTextStyle: TextStyle = {
      fontSize: typography.size.body2,
      color: colors.gray[700],
      fontWeight: typography.weight.medium,
  };

  const filterBtnTextActiveStyle: TextStyle = {
      color: colors.text.inverse,
      fontWeight: typography.weight.bold,
  };

  const eventsSectionStyle: ViewStyle = {
      padding: spacing.lg,
  };

  const eventCardStyle: ViewStyle = {
      backgroundColor: colors.gray[800],
      borderRadius: BorderRadius.xl,
      overflow: 'hidden',
      marginBottom: spacing.lg,
      borderWidth: 1,
      borderColor: colors.gray[800] + '1A',
      ...gm.card,
  };

  const eventImagePlaceholderStyle: ViewStyle = {
      height: 160,
      backgroundColor: colors.secondary.main + '33',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
  };

  const statusBadgeStyle: ViewStyle = {
      position: 'absolute',
      top: spacing.md,
      left: spacing.md,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: BorderRadius.full,
      borderWidth: 1,
      borderColor: colors.gray[900] + '33',
  };

  const eventContentStyle: ViewStyle = {
      padding: spacing.lg,
  };

  const eventTitleStyle: TextStyle = {
      marginBottom: spacing.sm,
  };

  const eventDescStyle: TextStyle = {
      fontSize: typography.size.body2,
      color: colors.gray[600],
      marginBottom: spacing.md,
      lineHeight: 20,
  };

  const eventMetaStyle: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.sm,
  };

  const metaTextStyle: TextStyle = {
      fontSize: 13,
      color: colors.gray[500],
  };

  const progressSectionStyle: ViewStyle = {
      marginTop: spacing.sm,
      marginBottom: spacing.md,
  };

  const progressHeaderStyle: ViewStyle = {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: spacing.sm,
  };

  const progressTextStyle: TextStyle = {
      fontSize: typography.size.caption,
      color: colors.gray[500],
  };

  const progressValueStyle: TextStyle = {
      fontSize: typography.size.caption,
      color: colors.primary.light,
      fontWeight: typography.weight.bold,
  };

  const progressBarStyle: ViewStyle = {
      height: 6,
      backgroundColor: colors.gray[200],
      borderRadius: 3,
      overflow: 'hidden',
  };

  const progressFillStyle: ViewStyle = {
      height: '100%',
      backgroundColor: colors.primary.main,
      borderRadius: 3,
  };

  const benefitsRowStyle: ViewStyle = {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
      marginBottom: spacing.lg,
  };

  const benefitTagStyle: ViewStyle = {
      backgroundColor: colors.primary.shadow + '50',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: BorderRadius.lg,
      borderWidth: 1,
      borderColor: colors.primary.shadow,
  };

  const benefitTagTextStyle: TextStyle = {
      fontSize: typography.size.caption,
      color: colors.primary.light,
  };

  const joinBtnBaseStyle: ViewStyle = {
      backgroundColor: colors.primary.main,
      paddingVertical: spacing.md + spacing.xs,
      borderRadius: BorderRadius.lg,
      alignItems: 'center',
      ...gl.primary,
  };

  const joinBtnDisabledStyle: ViewStyle = {
      backgroundColor: colors.gray[200],
      shadowOpacity: 0,
  };

  const joinBtnTextStyle: TextStyle = {
      color: colors.text.inverse,
      fontSize: typography.size.body,
      fontWeight: typography.weight.bold,
  };

  const emptyStateStyle: ViewStyle = {
      alignItems: 'center',
      padding: spacing['3xl'],
  };

  const emptyTitleStyle: TextStyle = {
      marginBottom: spacing.sm,
  };

  const emptyDescStyle: TextStyle = {
      fontSize: typography.size.body2,
      color: colors.gray[400],
  };

  const loadEvents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await vipApi.getVipEvents({ page: 1, pageSize: 20 });
      if (res.success || (res as any).code === 0) {
        const data = (res as any).data || {};
        setEvents(data.list || data.events || []);
      }
    } catch {
      console.error('加载VIP活动失败');
    } finally {
      setLoading(false);
    }
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadEvents();
    setRefreshing(false);
  };

  const handleJoin = async (eventId: string) => {
    Alert.alert('确认报名', '确定要报名参加此活动吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '确定',
        onPress: async () => {
          try {
            const res = await vipApi.joinVipEvent(eventId);
            if (res.success || (res as any).code === 0) {
              Alert.alert('报名成功', '您已成功报名此活动');
              loadEvents();
            } else {
              Alert.alert('报名失败', (res as any).message || '请重试');
            }
          } catch {
            Alert.alert('错误', '报名失败，请重试');
          }
        },
      },
    ]);
  };

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const filteredEvents = events.filter(e => {
    if (filter === 'all') return true;
    return e.status === filter;
  });

  const getStatusStyle = (status: string) => {
    return (
      STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.ended
    );
  };

  if (loading) {
    return (
      <View style={containerStyle}>
        <View style={headerStyle}>
          <Text style={[textStyles.h1, { color: colors.text.inverse }]}>
            VIP专属活动
          </Text>
        </View>
        <View style={statsSkeletonStyle}>
          <Skeleton width="100%" height={80} borderRadius={BorderRadius.lg} />
        </View>
        <SkeletonList count={2} />
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
      {/* Glass Header */}
      <LinearGradient
        colors={gradients.secondary}
        style={headerStyle}
      >
        <View style={headerContentStyle}>
          <Text style={[textStyles.h1, { color: colors.text.inverse }, headerTitleStyle]}>
            VIP专属活动
          </Text>
          <Text style={headerSubtitleStyle}>仅限VIP会员参加的专属聚会</Text>
        </View>
      </LinearGradient>

      {/* Glass Stats Row */}
      <View style={statsRowStyle}>
        <GlassCard style={statCardStyle} intensity="medium">
          <Text style={[textStyles.h2, { color: colors.accent.gold }, statValueStyle]}>
            {events.filter(e => e.status === 'upcoming').length}
          </Text>
          <Text style={statLabelStyle}>即将开始</Text>
        </GlassCard>
        <GlassCard style={statCardStyle} intensity="medium">
          <Text style={[textStyles.h2, { color: colors.accent.gold }, statValueStyle]}>
            {events.filter(e => e.isJoined).length}
          </Text>
          <Text style={statLabelStyle}>我的报名</Text>
        </GlassCard>
        <GlassCard style={statCardStyle} intensity="medium">
          <Text style={[textStyles.h2, { color: colors.accent.gold }, statValueStyle]}>
            {events.filter(e => e.status === 'ended' && e.isJoined).length}
          </Text>
          <Text style={statLabelStyle}>已参加</Text>
        </GlassCard>
      </View>

      {/* Filter Bar */}
      <View style={filterSectionStyle}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {FILTER_OPTIONS.map(opt => (
            <TouchableOpacity
              key={opt.value}
              style={[
                filterBtnBaseStyle,
                filter === opt.value && filterBtnActiveStyle,
              ]}
              onPress={() => setFilter(opt.value)}
            >
              <Text
                style={[
                  filterBtnTextStyle,
                  filter === opt.value && filterBtnTextActiveStyle,
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Events List */}
      <View style={eventsSectionStyle}>
        {filteredEvents.length > 0 ? (
          filteredEvents.map(event => {
            const statusStyle = getStatusStyle(event.status);
            const isFull = event.currentParticipants >= event.maxParticipants;
            const progressPercent =
              (event.currentParticipants / event.maxParticipants) * 100;
            return (
              <View key={event.id} style={eventCardStyle}>
                {/* Event Image Placeholder */}
                <View style={eventImagePlaceholderStyle}>
                  <Text style={{ fontSize: 60 }}>🎉</Text>
                  <View
                    style={[
                      statusBadgeStyle,
                      { backgroundColor: statusStyle.bgColor },
                    ]}
                  >
                    <Text
                      style={[
                        { fontSize: typography.size.caption, fontWeight: typography.weight.bold },
                        { color: statusStyle.color },
                      ]}
                    >
                      {statusStyle.text}
                    </Text>
                  </View>
                </View>

                <View style={eventContentStyle}>
                  <Text style={[textStyles.h3, { color: colors.text.inverse }, eventTitleStyle]}>
                    {event.title}
                  </Text>
                  <Text style={eventDescStyle} numberOfLines={2}>
                    {event.description}
                  </Text>

                  <View style={eventMetaStyle}>
                    <Text style={{ fontSize: 14, marginRight: spacing.xs }}>📍</Text>
                    <Text style={metaTextStyle}>{event.location}</Text>
                  </View>

                  <View style={eventMetaStyle}>
                    <Text style={{ fontSize: 14, marginRight: spacing.xs }}>🕐</Text>
                    <Text style={metaTextStyle}>
                      {new Date(event.startTime).toLocaleString()} -
                      {new Date(event.endTime).toLocaleString()}
                    </Text>
                  </View>

                  {/* Progress Bar */}
                  <View style={progressSectionStyle}>
                    <View style={progressHeaderStyle}>
                      <Text style={progressTextStyle}>报名人数</Text>
                      <Text style={progressValueStyle}>
                        {event.currentParticipants}/{event.maxParticipants}
                      </Text>
                    </View>
                    <View style={progressBarStyle}>
                      <View
                        style={[
                          progressFillStyle,
                          { width: `${Math.min(100, progressPercent)}%` },
                        ]}
                      />
                    </View>
                  </View>

                  {/* Benefits */}
                  {event.benefits?.length > 0 && (
                    <View style={benefitsRowStyle}>
                      {event.benefits.map((benefit, idx) => (
                        <View key={idx} style={benefitTagStyle}>
                          <Text style={benefitTagTextStyle}>
                            ✨ {benefit}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Join Button */}
                  {event.status !== 'ended' && (
                    <TouchableOpacity
                      style={[
                        joinBtnBaseStyle,
                        (event.isJoined || isFull) && joinBtnDisabledStyle,
                      ]}
                      onPress={() => handleJoin(event.id)}
                      disabled={event.isJoined || isFull}
                    >
                      <Text style={joinBtnTextStyle}>
                        {event.isJoined
                          ? '已报名'
                          : isFull
                            ? '已满员'
                            : '立即报名'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })
        ) : (
          <View style={emptyStateStyle}>
            <Text style={{ fontSize: 60, marginBottom: spacing.lg, opacity: 0.5 }}>🎭</Text>
            <Text style={[textStyles.h3, { color: colors.text.inverse }, emptyTitleStyle]}>
              暂无活动
            </Text>
            <Text style={emptyDescStyle}>敬请关注，精彩活动即将推出</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
