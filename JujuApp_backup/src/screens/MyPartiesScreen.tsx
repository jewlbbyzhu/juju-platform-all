import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  Alert,
  Image,
  ListRenderItem,
  ViewStyle,
  TextStyle,
  ImageStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';
import { useTheme, spacing, BorderRadius } from '../theme';
import { partyApi } from '../api';
import { GlassCard } from '../components/GlassCard';
import { GlassButton } from '../components/GlassButton';
import { SkeletonList } from '../components/Skeleton';
import { EmptyState } from '../components/EmptyState';

type PartyRole = 'organizer' | 'participant';
type PartyStatus = 'pending' | 'active' | 'ended' | 'cancelled';

interface Party {
  id: number;
  title: string;
  cover_image?: string;
  start_time: string;
  location?: { name?: string };
  address?: string;
  current_participants?: number;
  max_participants?: number;
  price?: number;
  status: PartyStatus;
}

interface StatusConfig {
  text: string;
  color: string;
  bgColor: string;
}

const STATUS_CONFIG: Record<PartyStatus, StatusConfig> = {
  pending: {
    text: '待审核',
    color: '',
    bgColor: '',
  },
  active: {
    text: '进行中',
    color: '',
    bgColor: '',
  },
  ended: {
    text: '已结束',
    color: '',
    bgColor: '',
  },
  cancelled: {
    text: '已取消',
    color: '',
    bgColor: '',
  },
};

interface PartyListItemProps {
  item: Party;
  index: number;
  colors: ReturnType<typeof useTheme>['colors'];
  typography: ReturnType<typeof useTheme>['typography'];
  onPress: (id: number) => void;
}

const PartyListItem: React.FC<PartyListItemProps> = React.memo(
  ({ item, index, colors, typography, onPress }) => {
    const statusConfig = STATUS_CONFIG[item.status] || STATUS_CONFIG.active;
    const statusColor =
      statusConfig.color ||
      (item.status === 'pending'
        ? colors.status.warning
        : item.status === 'active'
          ? colors.status.success
          : item.status === 'cancelled'
            ? colors.gray[400]
            : colors.gray[500]);
    const statusBgColor =
      statusConfig.bgColor ||
      (item.status === 'pending'
        ? `${colors.status.warning}33`
        : item.status === 'active'
          ? `${colors.status.success}33`
          : item.status === 'cancelled'
            ? `${colors.gray[400]}33`
            : `${colors.gray[500]}33`);

    const formattedDate = (() => {
      const date = new Date(item.start_time);
      return date.toLocaleDateString('zh-CN', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    })();

    // Party card styles using design system
    const partyCardStyle: ViewStyle = {
      marginBottom: spacing.md,
      overflow: 'hidden',
      padding: 0,
    };

    const partyImageStyle: ImageStyle = {
      width: '100%',
      height: 140,
      borderTopLeftRadius: BorderRadius.lg,
      borderTopRightRadius: BorderRadius.lg,
    };

    const partyContentStyle: ViewStyle = {
      padding: spacing.md,
    };

    const partyHeaderStyle: ViewStyle = {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.sm,
    };

    const partyTitleStyle: TextStyle = {
      fontWeight: typography.weight.semibold,
      flex: 1,
      marginRight: spacing.sm,
      color: colors.text.primary,
      fontSize: typography.size.h4,
    };

    const statusBadgeStyle: ViewStyle = {
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: BorderRadius.sm,
      backgroundColor: statusBgColor,
    };

    const statusTextStyle: TextStyle = {
      fontWeight: typography.weight.medium,
      color: statusColor,
      fontSize: typography.size.caption,
    };

    const partyMetaStyle: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.xs,
    };

    const metaIconStyle: TextStyle = {
      fontSize: typography.size.body2,
      marginRight: spacing.xs,
    };

    const partyTimeStyle: TextStyle = {
      color: colors.text.secondary,
      fontSize: typography.size.body2,
    };

    const partyLocationStyle: TextStyle = {
      flex: 1,
      color: colors.text.tertiary,
      fontSize: typography.size.body2,
    };

    const partyFooterStyle: ViewStyle = {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: spacing.sm,
      paddingTop: spacing.sm,
      borderTopWidth: 1,
      borderTopColor: `${colors.gray[900]}1A`,
    };

    const participantCountStyle: TextStyle = {
      color: colors.text.tertiary,
      fontSize: typography.size.caption,
    };

    const partyPriceStyle: TextStyle = {
      fontWeight: typography.weight.bold,
      color: colors.primary.main,
      fontSize: typography.size.h4,
    };

    return (
      <Animated.View entering={FadeInUp.delay(index * 80).springify()}>
        <GlassCard
          style={partyCardStyle}
          onPress={() => onPress(item.id)}
          intensity="light"
        >
          {item.cover_image && (
            <Image
              source={{ uri: item.cover_image }}
              style={partyImageStyle}
              resizeMode="cover"
            />
          )}
          <View style={partyContentStyle}>
            <View style={partyHeaderStyle}>
              <Text style={partyTitleStyle} numberOfLines={1}>
                {item.title}
              </Text>
              <View style={statusBadgeStyle}>
                <Text style={statusTextStyle}>
                  {statusConfig.text}
                </Text>
              </View>
            </View>

            <View style={partyMetaStyle}>
              <Text style={metaIconStyle}>📅</Text>
              <Text style={partyTimeStyle}>
                {formattedDate}
              </Text>
            </View>

            <View style={partyMetaStyle}>
              <Text style={metaIconStyle}>📍</Text>
              <Text style={partyLocationStyle} numberOfLines={1}>
                {item.location?.name || item.address || '地点待定'}
              </Text>
            </View>

            <View style={partyFooterStyle}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={participantCountStyle}>
                  {item.current_participants || 0}/{item.max_participants || 50} 人
                </Text>
              </View>
              <Text style={partyPriceStyle}>
                ¥{item.price || 0} 起
              </Text>
            </View>
          </View>
        </GlassCard>
      </Animated.View>
    );
  },
);

interface RoleTabProps {
  isActive: boolean;
  icon: string;
  label: string;
  onPress: () => void;
  colors: ReturnType<typeof useTheme>['colors'];
  typography: ReturnType<typeof useTheme>['typography'];
}

const RoleTab: React.FC<RoleTabProps> = React.memo(
  ({ isActive, icon, label, onPress, colors, typography }) => {
    const roleTabStyle: ViewStyle = {
      flex: 1,
      borderRadius: BorderRadius.lg,
      alignItems: 'center',
      borderWidth: 1,
      flexDirection: 'row',
      justifyContent: 'center',
      gap: spacing.sm,
      backgroundColor: isActive
        ? colors.primary.main
        : colors.background.secondary,
      borderColor: isActive ? colors.primary.main : colors.border,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.md,
    };

    const roleTabIconStyle: TextStyle = {
      fontSize: typography.size.h4,
    };

    const roleTabTextStyle: TextStyle = {
      color: isActive ? colors.text.inverse : colors.text.secondary,
      fontSize: typography.size.body2,
      fontWeight: isActive
        ? typography.weight.semibold
        : typography.weight.medium,
    };

    return (
      <GlassButton
        title={label}
        onPress={onPress}
        variant={isActive ? 'primary' : 'ghost'}
        size="medium"
        style={roleTabStyle}
        textStyle={roleTabTextStyle}
        icon={<Text style={roleTabIconStyle}>{icon}</Text>}
      />
    );
  },
);

const MyPartiesScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { colors, typography, spacing } = useTheme();

  const [currentRole, setCurrentRole] = useState<PartyRole>('organizer');
  const [parties, setParties] = useState<Party[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadParties = useCallback(
    async (pageNum: number = 1, reset: boolean = false) => {
      if (loading && !reset) return;
      setLoading(true);
      try {
        const params = { page: pageNum, pageSize: 10, role: currentRole };
        const res =
          currentRole === 'organizer'
            ? await partyApi.getMyParties(params)
            : await partyApi.getParticipatedParties(params);

        if (res.success) {
          const newParties: Party[] = (res as any).data?.list || [];
          if (reset) {
            setParties(newParties);
            setPage(1);
          } else {
            setParties(prev => [...prev, ...newParties]);
          }
          setHasMore(newParties.length >= 10);
        }
      } catch {
        Alert.alert('提示', '加载失败');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [currentRole, loading],
  );

  useEffect(() => {
    loadParties();
  }, [loadParties]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadParties(1, true);
  }, [loadParties]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      loadParties(page + 1, false);
      setPage(p => p + 1);
    }
  }, [loading, hasMore, page, loadParties]);

  const handlePartyPress = useCallback(
    (partyId: number) => {
      navigation.navigate('PartyDetail', { partyId });
    },
    [navigation],
  );

  const renderPartyItem: ListRenderItem<Party> = useCallback(
    ({ item, index }) => (
      <PartyListItem
        item={item}
        index={index}
        colors={colors}
        typography={typography}
        onPress={handlePartyPress}
      />
    ),
    [colors, typography, handlePartyPress],
  );

  const keyExtractor = useCallback((item: Party) => item.id.toString(), []);

  const renderEmptyState = useCallback(() => {
    if (loading) return null;
    return (
      <Animated.View entering={FadeIn.duration(400)}>
        <EmptyState
          icon="🎉"
          title={
            currentRole === 'organizer' ? '暂无创建的活动' : '暂无参与的活动'
          }
          description={
            currentRole === 'organizer'
              ? '创建您的第一个聚会，开启精彩社交'
              : '去发现有趣的聚会活动吧'
          }
          actionText={currentRole === 'organizer' ? '创建聚会' : '去探索'}
          onAction={() => {
            if (currentRole === 'organizer') {
              navigation.navigate('CreateParty');
            } else {
              navigation.navigate('Home');
            }
          }}
        />
      </Animated.View>
    );
  }, [loading, currentRole, navigation]);

  // Design system styles
  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: colors.background.secondary,
  };

  const headerStyle: ViewStyle = {
    borderBottomWidth: 1,
    backgroundColor: colors.background.primary,
    borderBottomColor: colors.divider,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  };

  const headerTitleStyle: TextStyle = {
    color: colors.text.primary,
    fontSize: typography.size.h2,
    fontWeight: typography.weight.bold,
  };

  const roleTabsStyle: ViewStyle = {
    flexDirection: 'row',
    backgroundColor: colors.background.primary,
    padding: spacing.lg,
    gap: spacing.md,
    marginBottom: spacing.sm,
  };

  const listContentStyle: ViewStyle = {
    paddingBottom: spacing['5xl'],
    padding: spacing.lg,
  };

  const footerLoaderStyle: ViewStyle = {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  };

  const footerTextStyle: TextStyle = {
    fontSize: typography.size.body2,
    color: colors.text.tertiary,
  };

  const ListFooterComponent = (() => {
    if (!loading || parties.length === 0) return null;
    return (
      <Animated.View entering={FadeIn} style={footerLoaderStyle}>
        <Text style={footerTextStyle}>
          加载中...
        </Text>
      </Animated.View>
    );
  })();

  return (
    <SafeAreaView style={containerStyle} edges={['top']}>
      <Animated.View
        entering={FadeInDown.duration(400)}
        style={headerStyle}
      >
        <Text style={headerTitleStyle}>
          我的活动
        </Text>
      </Animated.View>

      <Animated.View
        entering={FadeInDown.delay(100).duration(400)}
        style={roleTabsStyle}
      >
        <RoleTab
          isActive={currentRole === 'organizer'}
          icon="🎯"
          label="我组织的"
          onPress={() => setCurrentRole('organizer')}
          colors={colors}
          typography={typography}
        />
        <RoleTab
          isActive={currentRole === 'participant'}
          icon="🎟️"
          label="我参与的"
          onPress={() => setCurrentRole('participant')}
          colors={colors}
          typography={typography}
        />
      </Animated.View>

      {loading && parties.length === 0 ? (
        <SkeletonList count={2} />
      ) : (
        <FlatList
          data={parties}
          renderItem={renderPartyItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={listContentStyle}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary.main}
            />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={renderEmptyState}
          ListFooterComponent={ListFooterComponent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

export default MyPartiesScreen;

PartyListItem.displayName = 'PartyListItem';

RoleTab.displayName = 'RoleTab';
