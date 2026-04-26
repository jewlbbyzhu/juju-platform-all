import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  RefreshControl,
  Alert,
  ViewStyle,
  TextStyle,
  ImageStyle,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { followApi } from '../api/follow';
import { NavigationProp } from '../types/navigation';
import { PageData } from '../types/api';
import {
  useTheme,
  spacing,
  BorderRadius,

  typography,
  textStyles,
} from '../theme';
import { GlassCard } from '../components/GlassCard';
import { GlassButton } from '../components/GlassButton';
import { Skeleton } from '../components/Skeleton';

interface Fan {
  id: string;
  nickname: string;
  avatar?: string;
  bio?: string;
  isFollowing?: boolean;
}

const skeletonCard = { marginHorizontal: spacing.lg, marginVertical: spacing.sm, borderRadius: BorderRadius.lg, overflow: 'hidden' as const };
const skeletonItem = { flexDirection: 'row' as const, alignItems: 'center' as const, padding: spacing.lg };
const skeletonInfo = { flex: 1, marginLeft: spacing.md };

const SkeletonFanItem = () => (
  <GlassCard style={skeletonCard} intensity="light">
    <View style={skeletonItem}>
      <Skeleton width={50} height={50} borderRadius={BorderRadius.full} />
      <View style={skeletonInfo}>
        <Skeleton width={120} height={16} />
        <Skeleton width={180} height={13} style={{ marginTop: spacing.sm }} />
      </View>
      <Skeleton width={70} height={32} borderRadius={BorderRadius.full} />
    </View>
  </GlassCard>
);

export default function FansScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { colors, gradients } = useTheme();
  const [fans, setFans] = useState<Fan[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchFans = async (pageNum = 1, isRefresh = false) => {
    try {
      const response = (await followApi.getFollowers(
        JSON.stringify({ page: pageNum, limit: 20 }),
      )) as unknown as {
        data?: { code?: number; data?: PageData<Fan> };
      };
      if (response.data?.code === 0) {
        const newFans = response.data.data?.list || [];
        if (isRefresh || pageNum === 1) {
          setFans(newFans);
        } else {
          setFans(prev => [...prev, ...newFans]);
        }
        setHasMore(newFans.length === 20);
      }
    } catch (error) {
      console.error('获取粉丝列表失败:', error);
      Alert.alert('错误', '获取粉丝列表失败');
    }
  };

  const loadFans = async () => {
    setLoading(true);
    await fetchFans(1, true);
    setLoading(false);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setPage(1);
    await fetchFans(1, true);
    setRefreshing(false);
  }, []);

  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchFans(nextPage);
    }
  };

  const handleFollowBack = async (userId: string) => {
    try {
      const response = (await followApi.follow(userId)) as {
        data?: { code?: number };
      };
      if (response.data?.code === 0) {
        setFans(prev =>
          prev.map(fan =>
            fan.id === userId ? { ...fan, isFollowing: true } : fan,
          ),
        );
        Alert.alert('成功', '已关注该用户');
      }
    } catch (error) {
      console.error('关注失败:', error);
      Alert.alert('错误', '关注失败');
    }
  };

  useEffect(() => {
    loadFans();
  }, [loadFans]);

  // 命名样式对象（替代 useMemo 样式）
  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: colors.background.secondary,
  };

  const headerGradientStyle: ViewStyle = {
    paddingTop: 60,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  };

  const headerContentStyle: ViewStyle = {
    alignItems: 'center',
  };

  const titleStyle: TextStyle = {
    ...textStyles.h2,
    color: colors.text.inverse,
    marginBottom: spacing.xs,
  };

  const subtitleStyle: TextStyle = {
    fontSize: typography.size.body2,
    color: `${colors.gray[900]}E6`,
  };

  const listStyle: ViewStyle = {
    padding: spacing.lg,
    paddingBottom: spacing['3xl'],
  };

  const skeletonContainerStyle: ViewStyle = {
    padding: spacing.lg,
  };

  const fanCardStyle: ViewStyle = {
    marginBottom: spacing.md,
  };

  const itemContentStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
  };

  const avatarStyle: ImageStyle = {
    width: 50,
    height: 50,
    borderRadius: BorderRadius.full,
    marginRight: spacing.md,
    borderWidth: 2,
    borderColor: `${colors.secondary.main}33`,
  };

  const fanInfoStyle: ViewStyle = {
    flex: 1,
  };

  const fanNameStyle: TextStyle = {
    fontSize: typography.size.body,
    fontWeight: typography.weight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  };

  const fanDescStyle: TextStyle = {
    fontSize: typography.size.caption,
    color: colors.text.secondary,
  };

  const emptyStyle: ViewStyle = {
    alignItems: 'center',
    paddingTop: 100,
    paddingHorizontal: spacing['2xl'],
  };

  const emptyIconBgStyle: ViewStyle = {
    width: 100,
    height: 100,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  };

  const emptyIconStyle: TextStyle = {
    fontSize: typography.size.display,
  };

  const emptyTextStyle: TextStyle = {
    ...textStyles.h3,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  };

  const emptySubtextStyle: TextStyle = {
    fontSize: typography.size.body2,
    color: colors.text.secondary,
    marginBottom: spacing.xl,
  };

  const createBtnStyle: ViewStyle = {
    width: 120,
  };

  const footerLoaderStyle: ViewStyle = {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  };

  const renderFanItem = ({ item }: { item: Fan }) => (
    <GlassCard
      style={fanCardStyle}
      onPress={() =>
        (navigation as any).navigate('UserProfile', { userId: item.id })
      }
    >
      <View style={itemContentStyle}>
        <Image
          source={{ uri: item.avatar || 'https://via.placeholder.com/50' }}
          style={avatarStyle}
        />
        <View style={fanInfoStyle}>
          <Text style={fanNameStyle}>{item.nickname || '用户'}</Text>
          <Text style={fanDescStyle} numberOfLines={1}>
            {item.bio || '暂无简介'}
          </Text>
        </View>
        <GlassButton
          title={item.isFollowing ? '已关注' : '回关'}
          onPress={() => !item.isFollowing && handleFollowBack(item.id)}
          variant={item.isFollowing ? 'secondary' : 'gradient'}
          size="small"
          disabled={item.isFollowing}
        />
      </View>
    </GlassCard>
  );

  const renderHeader = () => (
    <LinearGradient
      colors={gradients.cool}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={headerGradientStyle}
    >
      <View style={headerContentStyle}>
        <Text style={titleStyle}>我的粉丝</Text>
        <Text style={subtitleStyle}>共 {fans.length} 位粉丝</Text>
      </View>
    </LinearGradient>
  );

  if (loading && fans.length === 0) {
    return (
      <View style={containerStyle}>
        {renderHeader()}
        <View style={skeletonContainerStyle}>
          <SkeletonFanItem />
          <SkeletonFanItem />
          <SkeletonFanItem />
          <SkeletonFanItem />
        </View>
      </View>
    );
  }

  return (
    <View style={containerStyle}>
      {renderHeader()}
      <FlatList
        data={fans}
        renderItem={renderFanItem}
        keyExtractor={item => item.id}
        contentContainerStyle={listStyle}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          <View style={emptyStyle}>
            <LinearGradient
              colors={[`${colors.secondary.main}1A`, `${colors.secondary.light}0D`]}
              style={emptyIconBgStyle}
            >
              <Text style={emptyIconStyle}>👥</Text>
            </LinearGradient>
            <Text style={emptyTextStyle}>暂无粉丝</Text>
            <Text style={emptySubtextStyle}>快去发布精彩聚会吧</Text>
            <GlassButton
              title="创建聚会"
              onPress={() => (navigation as any).navigate('CreateParty')}
              variant="gradient"
              size="medium"
              style={createBtnStyle}
            />
          </View>
        }
        ListFooterComponent={
          loading && fans.length > 0 ? (
            <View style={footerLoaderStyle}>
              <SkeletonFanItem />
            </View>
          ) : null
        }
      />
    </View>
  );
}
