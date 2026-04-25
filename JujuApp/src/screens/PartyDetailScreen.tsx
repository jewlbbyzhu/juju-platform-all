/**
 * 聚聚 (JUJU) App - 聚会详情页面
 * 2026 设计系统重构版 - 动画增强 + 代码优化
 */

import React, { useEffect, useState, useCallback } from 'react';
import { View, ScrollView, StatusBar, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { Share } from 'react-native';
import Animated, {FadeInUp} from 'react-native-reanimated';
import {
  useTheme,
  spacing,
  animation,
} from '../theme';
import { EnteringAnimation } from '../theme';
import { partyApi, Party } from '../api/party';
import {
  CoverImage,
  MainCard,
  PriceCard,
  DescriptionCard,
  ParticipantsCard,
  InfoItem,
  OrganizerSection,
  ActionBar,
} from '../components/partyDetail';
import { STATUS_CONFIG, formatDateTime } from '../utils/partyDetail';
import { ScreenLoadingState, ScreenErrorState } from '../components/screen';

type RouteParams = {
  partyId: number;
};

/* ── 复用的屏幕外壳 ── */
const ScreenWrapper: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { colors } = useTheme();
  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: colors.background.primary,
  };
  return (
    <SafeAreaView style={containerStyle} edges={['top']}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.background.primary}
      />
      {children}
    </SafeAreaView>
  );
};

/* ── 详情内容区块（带入场动画） ── */
const AnimatedSection: React.FC<{
  children: React.ReactNode;
  delay?: number;
}> = ({ children, delay = 0 }) => (
  <Animated.View
    entering={FadeInUp.duration(animation.duration.normal).delay(delay)}
    layout={
      require('react-native-reanimated').LinearTransition.springify()
        .damping(animation.spring.gentle.damping)
        .stiffness(animation.spring.gentle.stiffness)
    }
  >
    {children}
  </Animated.View>
);

export default function PartyDetailScreen(): React.JSX.Element {
  useTheme();
  const route = useRoute<RouteProp<{ params: RouteParams }, 'params'>>();
  const navigation = useNavigation();

  const [party, setParty] = useState<Party | null>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const partyId = route.params?.partyId;

  const { colors } = useTheme();

  // 使用设计系统替代 useMemo 样式
  const scrollViewStyle: ViewStyle = {
    flex: 1,
  };

  const contentStyle: ViewStyle = {
    padding: spacing.md,
    marginTop: -20,
  };

  const dividerStyle: ViewStyle = {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: spacing.md,
  };

  const bottomSpacerStyle: ViewStyle = {
    height: 100,
  };

  const fetchPartyDetail = useCallback(async () => {
    if (!partyId) return;
    setLoading(true);
    try {
      const res = await partyApi.getPartyDetail(partyId) as unknown as { code: number; data: Party };
      if (res.success) {
        setParty(res.data);
      }
    } catch {
      // setError('加载聚会详情失败，请检查网络连接');
    } finally {
      setLoading(false);
    }
  }, [partyId]);

  useEffect(() => {
    if (partyId) {
      fetchPartyDetail();
    }
  }, [partyId, fetchPartyDetail]);

  const handleShare = useCallback(async () => {
    if (!party) return;
    try {
      await Share.share({
        message: `快来参加「${party.title}」！时间：${new Date(party.start_time).toLocaleDateString('zh-CN')}`,
      });
    } catch (error) {
      console.error('分享失败:', error);
    }
  }, [party]);

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const [selectedTicketId, setSelectedTicketId] = useState<number | undefined>(undefined);

  const handleTicketSelect = useCallback((ticket: any) => {
    setSelectedTicketId(ticket.id);
  }, []);

  const handleJoin = useCallback(() => {
    if (!party) return;
    const types = party.ticket_types || [];

    // 如果聚会只有一个票型，直接选中
    if (types.length === 1) {
      const singleTicket = types[0];
      const stock = singleTicket.current_stock ?? singleTicket.available_count ?? 0;
      if (stock <= 0) {
        return; // 已售罄，不跳转
      }
      (
        navigation as { navigate: (screen: string, params?: unknown) => void }
      ).navigate('TicketSelection', { partyId: party.id, party, selectedTicket: singleTicket });
      return;
    }

    // 多票型时，如果已选择，带入选中票型
    if (selectedTicketId) {
      const selectedTicket = types.find((t: any) => t.id === selectedTicketId);
      if (selectedTicket) {
        const stock = selectedTicket.current_stock ?? selectedTicket.available_count ?? 0;
        if (stock > 0) {
          (
            navigation as { navigate: (screen: string, params?: unknown) => void }
          ).navigate('TicketSelection', { partyId: party.id, party, selectedTicket });
          return;
        }
      }
    }
    (
      navigation as { navigate: (screen: string, params?: unknown) => void }
    ).navigate('TicketSelection', { partyId: party.id, party });
  }, [party, navigation, selectedTicketId]);

  const toggleLike = useCallback(() => {
    setLiked(prev => !prev);
  }, []);

  if (loading) {
    return (
      <ScreenWrapper>
        <ScreenLoadingState message="加载中..." />
      </ScreenWrapper>
    );
  }

  if (!party) {
    return (
      <ScreenWrapper>
        <ScreenErrorState
          message="聚会信息加载失败"
          onRetry={fetchPartyDetail}
        />
      </ScreenWrapper>
    );
  }

  const statusConfig = STATUS_CONFIG[party.status || 1];
  const isFull = (party.attendee_count || 0) >= party.max_participants;
  const isEnded = party.status === 3;
  const canJoin = party.status === 1 && !isFull && !isEnded;
  const remainingSpots = party.max_participants - (party.attendee_count || 0);
  const ticketTypes = party.ticket_types || [];
  const ticketPrice = ticketTypes[0]?.price ?? 0;
  const minPrice = ticketTypes.length > 0
    ? Math.min(...ticketTypes.map(t => t.price))
    : ticketPrice;
  const maxPrice = ticketTypes.length > 0
    ? Math.max(...ticketTypes.map(t => t.price))
    : ticketPrice;
  const priceDisplay = ticketTypes.length > 1
    ? `¥${minPrice} - ¥${maxPrice}`
    : `¥${ticketPrice}`;

  return (
    <ScreenWrapper>
      <ScrollView
        style={scrollViewStyle}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={EnteringAnimation.FadeIn()}>
          <CoverImage
            imageUri={party.cover_image || party.images?.[0]}
            onBack={handleBack}
            onShare={handleShare}
            liked={liked}
            onToggleLike={toggleLike}
            status={statusConfig}
          />
        </Animated.View>

        <View style={contentStyle}>
          <AnimatedSection delay={100}>
            <MainCard title={party.title}>
              <OrganizerSection />
            </MainCard>
          </AnimatedSection>

          <AnimatedSection delay={200}>
            <View style={dividerStyle} />
            <InfoItem
              icon="📅"
              iconBgColor={colors.primary.main}
              label="时间"
              value={formatDateTime(party.start_time)}
              index={0}
            />
            <View style={dividerStyle} />
            <InfoItem
              icon="📍"
              iconBgColor={colors.secondary.main}
              label="地点"
              value={party.address || party.city || '地点待定'}
              index={1}
            />
          </AnimatedSection>

          <AnimatedSection delay={300}>
            <View style={{ paddingHorizontal: spacing.md }}>
              <PriceCard
                price={ticketPrice}
                remainingSpots={remainingSpots}
                priceDisplay={priceDisplay}
                ticketCount={ticketTypes.length}
                ticketTypes={ticketTypes}
                onTicketSelect={handleTicketSelect}
                selectedTicketId={selectedTicketId}
              />
            </View>
          </AnimatedSection>

          <AnimatedSection delay={400}>
            <DescriptionCard description={party.description || ''} />
          </AnimatedSection>

          <AnimatedSection delay={500}>
            <ParticipantsCard count={party.attendee_count || 0} />
          </AnimatedSection>

          <View style={bottomSpacerStyle} />
        </View>
      </ScrollView>

      <ActionBar
        price={ticketPrice}
        priceDisplay={priceDisplay}
        canJoin={canJoin}
        isFull={isFull}
        isEnded={isEnded}
        onJoin={handleJoin}
      />
    </ScreenWrapper>
  );
}
