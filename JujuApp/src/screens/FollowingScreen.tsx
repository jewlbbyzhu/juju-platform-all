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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { followApi } from '../api/follow';
import {
  useTheme,
  spacing,
  BorderRadius,
  typography,
  textStyles,
  animation,
} from '../theme';
import { GlassCard } from '../components/GlassCard';
import { GlassButton } from '../components/GlassButton';
import { Skeleton } from '../components/Skeleton';
import { HapticFeedback } from '../components/HapticFeedback';

interface FollowingUser {
  id: string;
  nickname: string;
  avatar?: string;
  bio?: string;
}

const skeletonCard = { marginHorizontal: spacing.lg, marginVertical: spacing.sm, borderRadius: BorderRadius.lg, overflow: 'hidden' as const };
const skeletonItem = { flexDirection: 'row' as const, alignItems: 'center' as const, padding: spacing.lg };
const skeletonInfo = { flex: 1, marginLeft: spacing.md };

const SkeletonUserItem = () => (
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

export default function FollowingScreen() {
  const navigation = useNavigation();
  const { colors, gradients } = useTheme();

  const [following, setFollowing] = useState<FollowingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchFollowing = async (pageNum = 1, isRefresh = false) => {
    try {
      const response = await followApi.getFollowing(
        JSON.stringify({ page: pageNum, limit: 20 }),
      );
      if ((response as any).data?.code === 0) {
        const newFollowing = (response as any).data.data?.list || [];
        if (isRefresh || pageNum === 1) {
          setFollowing(newFollowing);
        } else {
          setFollowing(prev => [...prev, ...newFollowing]);
        }
        setHasMore(newFollowing.length === 20);
      }
    } catch (error) {
      console.error('获取关注列表失败:', error);
      Alert.alert('错误', '获取关注列表失败');
    }
  };

  const loadFollowing = async () => {
    setLoading(true);
    await fetchFollowing(1, true);
    setLoading(false);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setPage(1);
    await fetchFollowing(1, true);
    setRefreshing(false);
  }, []);

  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchFollowing(nextPage);
    }
  };

  const handleUnfollow = async (userId: string) => {
    Alert.alert('确认取消关注', '确定要取消关注该用户吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '确定',
        style: 'destructive',
        onPress: async () => {
          try {
            const response = await followApi.unfollow(userId);
            if ((response as any).data?.code === 0) {
              setFollowing(prev => prev.filter(user => user.id !== userId));
              Alert.alert('成功', '已取消关注');
            }
          } catch (error) {
            console.error('取消关注失败:', error);
            Alert.alert('错误', '取消关注失败');
          }
        },
      },
    ]);
  };

  useEffect(() => {
    loadFollowing();
  }, [loadFollowing]);

  // 命名样式对象替代 useMemo
  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: colors.background.secondary,
  };

  const headerGradientStyle: ViewStyle = {
    paddingTop: spacing['5xl'],
    paddingBottom: spacing['2xl'],
    paddingHorizontal: spacing.xl,
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
    color: colors.text.primary + 'E6',
  };

  const listStyle: ViewStyle = {
    padding: spacing.lg,
    paddingBottom: spacing['3xl'],
  };

  const skeletonContainerStyle: ViewStyle = {
    padding: spacing.lg,
  };

  const userCardStyle: ViewStyle = {
    marginBottom: spacing.md,
  };

  const itemContentStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
  };

  const avatarStyle: any = {
    width: 50,
    height: 50,
    borderRadius: BorderRadius.full,
    marginRight: spacing.md,
    borderWidth: 2,
    borderColor: colors.primary.main + '33',
  };

  const infoStyle: ViewStyle = {
    flex: 1,
  };

  const nameStyle: TextStyle = {
    fontSize: typography.size.body,
    fontWeight: typography.weight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  };

  const descStyle: TextStyle = {
    fontSize: typography.size.body2,
    color: colors.text.secondary,
  };

  const emptyStyle: ViewStyle = {
    alignItems: 'center',
    paddingTop: spacing['5xl'],
    paddingHorizontal: spacing['3xl'],
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
    marginBottom: spacing['2xl'],
  };

  const discoverBtnStyle: ViewStyle = {
    width: 120,
  };

  const footerLoaderStyle: ViewStyle = {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  };

  const renderItem = ({ item }: { item: FollowingUser }) => (
    <Animated.View entering={FadeInUp.duration(animation.duration.fast)}>
      <GlassCard
        style={userCardStyle}
        onPress={() =>
          (navigation as any).navigate(
            'UserProfile' as never,
            {
              userId: item.id,
            } as never,
          )
        }
      >
        <View style={itemContentStyle}>
          <Image
            source={{ uri: item.avatar || 'https://via.placeholder.com/50' }}
            style={avatarStyle}
          />
          <View style={infoStyle}>
            <Text style={nameStyle}>{item.nickname || '用户'}</Text>
            <Text style={descStyle} numberOfLines={1}>
              {item.bio || '暂无简介'}
            </Text>
          </View>
          <GlassButton
            title="已关注"
            onPress={() => handleUnfollow(item.id)}
            variant="secondary"
            size="small"
          />
        </View>
      </GlassCard>
    </Animated.View>
  );

  const renderHeader = () => (
    <LinearGradient
      colors={gradients.warm}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={headerGradientStyle}
    >
      <View style={headerContentStyle}>
        <Text style={titleStyle}>我的关注</Text>
        <Text style={subtitleStyle}>共关注 {following.length} 位用户</Text>
      </View>
    </LinearGradient>
  );

  if (loading && following.length === 0) {
    return (
      <View style={containerStyle}>
        {renderHeader()}
        <View style={skeletonContainerStyle}>
          <SkeletonUserItem />
          <SkeletonUserItem />
          <SkeletonUserItem />
          <SkeletonUserItem />
        </View>
      </View>
    );
  }

  return (
    <View style={containerStyle}>
      {renderHeader()}
      <FlatList
        data={following}
        renderItem={renderItem}
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
              colors={[colors.primary.main + '1A', colors.primary.light + '0D']}
              style={emptyIconBgStyle}
            >
              <Text style={emptyIconStyle}>👤</Text>
            </LinearGradient>
            <Text style={emptyTextStyle}>暂无关注</Text>
            <Text style={emptySubtextStyle}>去发现更多有趣的人吧</Text>
            <HapticFeedback
              onPress={() => (navigation as any).navigate('Community')}
            >
              <View style={discoverBtnStyle}>
                <Text style={{ color: colors.text.inverse, fontWeight: typography.weight.semibold }}>去发现</Text>
              </View>
            </HapticFeedback>
          </View>
        }
        ListFooterComponent={
          loading && following.length > 0 ? (
            <View style={footerLoaderStyle}>
              <SkeletonUserItem />
            </View>
          ) : null
        }
      />
    </View>
  );
}
