/**
 * 聚聚 (JUJU) App - 社区页面
 * 2026 设计系统重构版
 */

import React, { useState, useCallback } from 'react';
import { ScrollView, RefreshControl, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  FadeInUp,
  FadeInDown,
  Layout,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import { Share } from 'react-native';
import {
  useTheme,
  colors,
  gradients,
  spacing,
  animation,
  layout,
  useEntranceAnimation,
} from '../theme';
import type { NavigationProp } from '../types/navigation';
import type { Post, Tag } from '../types/api';
import {
  CommunitySearchBar,
  CommunityTabBar,
  TopicCard,
  SuggestedUserItem,
  PostCard,
  EmptyCommunityState,
} from '../components/community';
import {
  MOCK_TOPICS,
  MOCK_SUGGESTED_USERS,
  MOCK_POSTS,
} from '../constants/community';

type TabType = 'recommend' | 'following' | 'topics';

interface CommunityScreenProps {
  navigation: NavigationProp;
}

// 命名样式对象替代 useMemo
const containerStyle: ViewStyle = {
  flex: 1,
  backgroundColor: colors.background.primary,
};

const backgroundStyle: ViewStyle = {
  position: 'absolute',
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
  opacity: 0.8,
};

const contentStyleMemo: ViewStyle = {
  flex: 1,
};

const topicsContainerStyle: ViewStyle = {
  paddingHorizontal: layout.screenPadding,
  paddingVertical: spacing.md,
};

const suggestedSectionStyle: ViewStyle = {
  marginBottom: spacing.md,
};

const usersContainerStyle: ViewStyle = {
  paddingHorizontal: layout.screenPadding,
};

const listContainerStyle: ViewStyle = {
  flex: 1,
};

export default function CommunityScreen({
  navigation,
}: CommunityScreenProps): React.JSX.Element {
  useTheme();
  const [activeTab, setActiveTab] = useState<TabType>('recommend');
  const [refreshing, setRefreshing] = useState(false);
  const [posts, setPosts] = useState<Post[]>(MOCK_POSTS);
  const [searchQuery, setSearchQuery] = useState('');

  const { animatedStyle: contentStyle } = useEntranceAnimation(100);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  const toggleLike = useCallback((postId: number) => {
    setPosts(prev =>
      prev.map(p =>
        p.id === postId
          ? {
              ...p,
              isLiked: !p.isLiked,
              likes: p.isLiked ? p.likes! - 1 : p.likes! + 1,
            }
          : p,
      ),
    );
  }, []);

  const handleShare = useCallback(async (post: Post) => {
    try {
      await Share.share({
        message: `${post.title || '社区动态'} - 来自聚聚App`,
        url: post.images?.[0] || '',
      });
    } catch {
      // Silently fail
    }
  }, []);

  const handleFollow = useCallback(
    (_user: (typeof MOCK_SUGGESTED_USERS)[0]) => {
      console.log('Follow user');
    },
    [],
  );

  const handleTopicPress = useCallback((_topic: Tag) => {
    console.log('Topic pressed');
  }, []);

  const handleCreatePress = useCallback(() => {
    (navigation as { navigate: (screen: string) => void }).navigate(
      'CreatePost',
    );
  }, [navigation]);

  const emptyType =
    activeTab === 'topics'
      ? 'topics'
      : activeTab === 'following'
        ? 'following'
        : 'posts';

  const isRecommend = activeTab === 'recommend';

  return (
    <SafeAreaView style={containerStyle} edges={['top']}>
      <LinearGradient
        colors={gradients.secondary as unknown as string[]}
        style={backgroundStyle}
      />
      <Animated.View
        style={[contentStyleMemo, contentStyle]}
        entering={FadeIn.duration(animation.duration.normal)}
      >
        <CommunitySearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          onCreatePress={handleCreatePress}
        />

        <CommunityTabBar activeTab={activeTab} onTabChange={setActiveTab} />

        {isRecommend && (
          <Animated.View
            entering={FadeInUp.duration(animation.duration.normal).delay(100)}
            layout={Layout.springify()}
          >
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={topicsContainerStyle}
            >
              {MOCK_TOPICS.map((topic, index) => (
                <TopicCard
                  key={topic.id}
                  topic={topic}
                  index={index}
                  onPress={handleTopicPress}
                />
              ))}
            </ScrollView>
          </Animated.View>
        )}

        {isRecommend && (
          <Animated.View
            entering={FadeInDown.duration(animation.duration.normal).delay(200)}
            layout={Layout.springify()}
            style={suggestedSectionStyle}
          >
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={usersContainerStyle}
            >
              {MOCK_SUGGESTED_USERS.map((user, index) => (
                <SuggestedUserItem
                  key={user.id}
                  user={user}
                  index={index}
                  onFollow={handleFollow}
                />
              ))}
            </ScrollView>
          </Animated.View>
        )}

        <ScrollView
          style={listContainerStyle}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary.main]}
              tintColor={colors.primary.main}
            />
          }
        >
          {posts.length > 0 ? (
            posts.map((post, index) => (
              <PostCard
                key={post.id}
                post={post}
                index={index}
                navigation={navigation}
                onLike={toggleLike}
                onShare={handleShare}
              />
            ))
          ) : (
            <EmptyCommunityState type={emptyType} />
          )}
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}
