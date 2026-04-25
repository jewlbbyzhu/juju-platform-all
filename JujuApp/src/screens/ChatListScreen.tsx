import React, { useState, useEffect, useCallback } from 'react';
import {

  FlatList,
  RefreshControl,
  ActivityIndicator,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { chatApi } from '../api';
import type {
  NavigationProp,
  Conversation,
  ApiResponse,
  ListResponse,
} from '../types';
import {
  useTheme,
  spacing,




  animation,

} from '../theme';
import {
  ChatListItem,
  ChatListEmpty,
  ChatListHeader,
} from '../components/chat';

type TabType = 'all' | 'unread' | 'groups';

interface ChatListScreenProps {
  navigation: NavigationProp;
}

export default function ChatListScreen({
  navigation,
}: ChatListScreenProps): React.JSX.Element {
  const { colors } = useTheme();

  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [chatError, setChatError] = useState<string | null>(null);
  const pageSize = 20;

  const unreadCount =
    conversations.reduce(
      (total, item) => total + (item.unread_count || 0),
      0,
    );

  const filteredChats = (() => {
    let filtered = conversations;

    if (activeTab === 'unread') {
      filtered = filtered.filter(item => (item.unread_count ?? 0) > 0);
    } else if (activeTab === 'groups') {
      filtered = filtered.filter(item => item.type === 'group');
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        item =>
          (item.name || '').toLowerCase().includes(query) ||
          (item.last_message || '').toLowerCase().includes(query),
      );
    }

    return filtered;
  })();

  const loadConversations = useCallback(
    async (reset = false) => {
      if (reset) {
        setPage(1);
        setConversations([]);
        setHasMore(true);
      }
      if (loading || (!reset && !hasMore)) return;
      setLoading(true);
      try {
        const currentPage = reset ? 1 : page;
        const res = (await chatApi.getConversationList({
          page: currentPage,
          pageSize,
        })) as ApiResponse<ListResponse<Conversation>>;
        if ((res as any).code === 0) {
          const newConversations = (res as any).data?.list || [];
          if (reset) setConversations(newConversations);
          else setConversations(prev => [...prev, ...newConversations]);
          setHasMore(newConversations.length >= pageSize);
          setPage(currentPage + 1);
          setChatError(null);
        }
      } catch {
        setChatError('加载聊天列表失败，请检查网络连接');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [loading, hasMore, page],
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadConversations(true);
  }, [loadConversations]);

  const loadMore = useCallback(() => {
    loadConversations(false);
  }, [loadConversations]);

  const openChat = useCallback(
    (item: Conversation) => {
      if (item.type === 'group') {
        (navigation as any).navigate('GroupChat', { groupId: String(item.id) });
      } else {
        (navigation as any).navigate('PrivateChat', {
          conversationId: String(item.id),
          userInfo: item,
        });
      }
    },
    [navigation],
  );

  const handleAddPress = useCallback(() => {
    // TODO: 跳转到创建聊天页面
  }, []);

  useEffect(() => {
    loadConversations(true);
  }, []);

  const renderItem = useCallback(
    ({ item, index }: { item: Conversation; index: number }) => (
      <ChatListItem item={item} index={index} onPress={openChat} />
    ),
    [openChat],
  );

  const keyExtractor = useCallback((item: Conversation) => String(item.id), []);

  // 使用设计系统替代内联样式
  const safeAreaStyle: ViewStyle = {
    flex: 1,
    backgroundColor: colors.background.primary,
  };

  const listContentStyle: ViewStyle = {
    padding: spacing.lg,
    flexGrow: 1,
  };

  const footerIndicatorStyle: ViewStyle = {
    paddingVertical: spacing.xl,
  };

  const ListFooterComponent =
    loading && !refreshing ? (
      <ActivityIndicator
        style={footerIndicatorStyle}
        color={colors.primary.main}
      />
    ) : null;

  return (
    <SafeAreaView style={safeAreaStyle} edges={['top']}>
      <ChatListHeader
        unreadCount={unreadCount}
        activeTab={activeTab}
        searchQuery={searchQuery}
        onTabChange={setActiveTab}
        onSearchChange={setSearchQuery}
        onAddPress={handleAddPress}
      />

      <Animated.View
        style={{ flex: 1 }}
        entering={FadeInUp.duration(animation.duration.normal).delay(100)}
      >
        <FlatList
          data={filteredChats}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={listContentStyle}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary.main]}
              tintColor={colors.primary.main}
            />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={<ChatListEmpty />}
          ListFooterComponent={ListFooterComponent}
          showsVerticalScrollIndicator={false}
        />
      </Animated.View>
    </SafeAreaView>
  );
}
