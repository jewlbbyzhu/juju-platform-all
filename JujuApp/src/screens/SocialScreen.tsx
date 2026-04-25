/**
 * 聚聚 (JUJU) App - 社交页面
 * 2026 设计系统重构版
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FlatList, Alert, RefreshControl, ViewStyle } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { followApi } from '../api/follow';
import {
  useTheme,
  spacing,





} from '../theme';
import {
  SocialHeader,
  SocialTabs,
  UserCard,
  EmptySocialState,
  SocialUser,
} from '../components/social';

type TabType = 'followers' | 'following';

type RootStackParamList = {
  Social: { userId?: string };
  UserProfile: { userId: string };
  PrivateChat: { conversationId: string; userInfo: string };
};

type SocialScreenRouteProp = RouteProp<RootStackParamList, 'Social'>;


  code: number;
  data?: {
    list: T[];
    total?: number;
  };
}

export default function SocialScreen(): React.JSX.Element {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const route = useRoute<SocialScreenRouteProp>();
  const { userId } = route.params || {};

  const [currentTab, setCurrentTab] = useState<TabType>('followers');
  const [userList, setUserList] = useState<SocialUser[]>([]);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  // 使用设计系统替代内联样式
  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: colors.background.secondary,
  };

  const listContentStyle: ViewStyle = {
    padding: spacing.lg,
    paddingTop: spacing.sm,
    flexGrow: 1,
  };

  const pageSize = 20;
  const isLoadingRef = useRef(false);

  const loadUsers = useCallback(
    async (reset = false) => {
      if (isLoadingRef.current || (!reset && !hasMore)) return;

      if (reset) {
        setPage(1);
        setHasMore(true);
      }

      isLoadingRef.current = true;
      setLoading(true);

      try {
        const api =
          currentTab === 'followers'
            ? followApi.getFollowers
            : followApi.getFollowing;

        const res = (await api(userId, {
          page,
          pageSize,
        })) as unknown as { success: boolean; data?: { list: SocialUser[]; total: number } };

        if (res.success) {
          const newUsers = res.data?.list || [];

          setUserList(prev => (reset ? newUsers : [...prev, ...newUsers]));
          setHasMore(newUsers.length >= pageSize);
          setPage(prev => prev + 1);

          if (currentTab === 'followers') {
            setFollowersCount(res.data?.total || 0);
          } else {
            setFollowingCount(res.data?.total || 0);
          }
        }
      } catch {
        Alert.alert('错误', '加载失败');
      } finally {
        isLoadingRef.current = false;
        setLoading(false);
        setRefreshing(false);
      }
    },
    [currentTab, hasMore, page, userId],
  );

  useEffect(() => {
    let isMounted = true;
    const doLoad = async () => {
      if (isMounted) {
        await loadUsers(true);
      }
    };
    doLoad();
    return () => { isMounted = false; };
  }, [currentTab]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadUsers(true);
  }, [loadUsers]);

  const handleFollow = useCallback(async (user: SocialUser) => {
    try {
      if (user.is_following) {
        await followApi.unfollow(user.id);
        setUserList(prev =>
          prev.map(u => (u.id === user.id ? { ...u, is_following: false } : u)),
        );
        setFollowingCount(prev => Math.max(0, prev - 1));
      } else {
        await followApi.follow(user.id);
        setUserList(prev =>
          prev.map(u => (u.id === user.id ? { ...u, is_following: true } : u)),
        );
        setFollowingCount(prev => prev + 1);
      }
    } catch {
      // Silently fail
    }
  }, []);

  const handleProfilePress = useCallback(
    (profileUserId: string) => {
      (
        navigation as { navigate: (screen: string, params?: object) => void }
      ).navigate('UserProfile', { userId: profileUserId });
    },
    [navigation],
  );

  const handleMorePress = useCallback(
    (user: SocialUser) => {
      Alert.alert('更多操作', '', [
        { text: '查看主页', onPress: () => handleProfilePress(user.id) },
        {
          text: '私信',
          onPress: () =>
            (
              navigation as {
                navigate: (screen: string, params?: object) => void;
              }
            ).navigate('PrivateChat', {
              conversationId: user.id,
              userInfo: encodeURIComponent(JSON.stringify(user)),
            }),
        },
        { text: '举报', onPress: () => Alert.alert('提示', '举报功能开发中') },
        { text: '取消', style: 'cancel' },
      ]);
    },
    [handleProfilePress, navigation],
  );

  const handleTabChange = useCallback((tab: TabType) => {
    setCurrentTab(tab);
  }, []);

  const renderItem = useCallback(
    ({ item, index }: { item: SocialUser; index: number }) => (
      <UserCard
        user={item}
        index={index}
        onFollow={handleFollow}
        onProfilePress={handleProfilePress}
        onMorePress={handleMorePress}
      />
    ),
    [handleFollow, handleProfilePress, handleMorePress],
  );

  const keyExtractor = useCallback((item: SocialUser) => item.id, []);

  const ListEmptyComponent = useCallback(
    () => (!loading ? <EmptySocialState tab={currentTab} /> : null),
    [currentTab, loading],
  );

  return (
    <SafeAreaView style={containerStyle} edges={['bottom']}>
      <SocialHeader />
      <SocialTabs
        currentTab={currentTab}
        followersCount={followersCount}
        followingCount={followingCount}
        onTabChange={handleTabChange}
      />
      <FlatList
        data={userList}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        onEndReached={() => loadUsers(false)}
        onEndReachedThreshold={0.1}
        contentContainerStyle={listContentStyle}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={ListEmptyComponent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary.main]}
            tintColor={colors.primary.main}
          />
        }
      />
    </SafeAreaView>
  );
}
