import React, {useState, useCallback} from 'react';
import type { JSX } from 'react';
import {
  View,
  Text,
  FlatList,
  ViewStyle,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassCard } from '../components/GlassCard';
import { GlassButton } from '../components/GlassButton';
import { Skeleton, SkeletonList } from '../components/Skeleton';
import {useTheme, spacing, BorderRadius, textStyles, typography} from '../theme';

// Mock API - replace with actual import
const favoriteApi = {
  getFavorites: async (_params: { type: string }) => ({
    data: {
      list: [
        {
          id: '1',
          targetTitle: '周末桌游聚会',
          type: 'party',
          createdAt: '2026-04-10',
        },
        {
          id: '2',
          targetTitle: ' hiking 活动招募',
          type: 'party',
          createdAt: '2026-04-09',
        },
      ],
    },
  }),
};

type TabType = 'party' | 'post' | 'user';

interface Favorite {
  id: string;
  targetTitle: string;
  type: TabType;
  createdAt: string;
  targetId?: string;
}

const TAB_CONFIG: { key: TabType; label: string }[] = [
  { key: 'party', label: '聚会' },
  { key: 'post', label: '帖子' },
  { key: 'user', label: '用户' },
];

export default function FavoritesScreen(): JSX.Element {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('party');

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const res = await favoriteApi.getFavorites({ type: activeTab });
      if (res.data) {
        const items = (res.data.list || []).map(
          (item: {
            id: string;
            targetTitle: string;
            type: string;
            createdAt: string;
          }) => ({
            ...item,
            type: item.type as TabType,
          }),
        );
        setFavorites(items);
      }
    } catch (error) {
      console.error('Fetch favorites error:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchFavorites();
    }, [activeTab]),
  );

  const handleItemPress = (item: Favorite) => {
    switch (item.type) {
      case 'party':
        (navigation as any).navigate('PartyDetail', { partyId: item.targetId });
        break;
      case 'post':
        (navigation as any).navigate('PostDetail', { postId: item.targetId });
        break;
      case 'user':
        (navigation as any).navigate('UserProfile', { userId: item.targetId });
        break;
    }
  };

  // 命名样式对象（替代 useMemo 样式）
  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: colors.background.secondary,
  };

  const headerStyle: ViewStyle = {
    padding: spacing.lg,
    paddingTop: spacing['3xl'],
    paddingBottom: spacing.xl,
    borderBottomLeftRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.xl,
  };

  const tabContainerStyle: ViewStyle = {
    flexDirection: 'row',
    padding: spacing.lg,
    gap: spacing.md,
  };

  // getTabStyle removed - was unused

  const listContainerStyle: ViewStyle = {
    padding: spacing.lg,
    paddingTop: 0,
    flexGrow: 1,
  };

  const itemStyle: ViewStyle = {
    padding: spacing.lg,
    marginBottom: spacing.md,
  };

  const emptyStateStyle: ViewStyle = {
    alignItems: 'center',
    paddingTop: spacing['5xl'],
  };

  const emptyBtnStyle: ViewStyle = {
    minWidth: 120,
  };

  const renderItem = ({ item }: { item: Favorite }) => (
    <GlassCard
      style={itemStyle}
      onPress={() => handleItemPress(item)}
      intensity="light"
    >
      <Text
        style={{
          ...textStyles.h3,
          color: colors.text.primary,
          marginBottom: spacing.xs,
        }}
      >
        {item.targetTitle}
      </Text>
      <Text
        style={{
          ...textStyles.caption,
          color: colors.text.secondary,
        }}
      >
        {item.createdAt}
      </Text>
    </GlassCard>
  );

  const renderEmptyState = () => (
    <View style={emptyStateStyle}>
      <Text style={{ fontSize: typography.size.display, marginBottom: spacing.lg }}>⭐</Text>
      <Text
        style={{
          ...textStyles.body,
          color: colors.text.secondary,
          marginBottom: spacing.xl,
        }}
      >
        暂无
        {activeTab === 'party'
          ? '聚会'
          : activeTab === 'post'
            ? '帖子'
            : '用户'}
        收藏
      </Text>
      <GlassButton
        title="去发现"
        variant="primary"
        size="medium"
        onPress={() => (navigation as any).navigate('Home')}
        style={emptyBtnStyle}
      />
    </View>
  );

  if (loading) {
    return (
      <View style={containerStyle}>
        <View style={headerStyle}>
          <Skeleton width={120} height={32} borderRadius={BorderRadius.sm} />
        </View>
        <View style={tabContainerStyle}>
          {TAB_CONFIG.map((_, idx) => (
            <Skeleton
              key={idx}
              width={80}
              height={40}
              borderRadius={BorderRadius.xl}
            />
          ))}
        </View>
        <SkeletonList count={2} />
      </View>
    );
  }

  return (
    <View style={containerStyle}>
      <LinearGradient
        colors={[colors.primary.main, colors.primary.dark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={headerStyle}
      >
        <Text
          style={{
            ...textStyles.h1,
            color: colors.text.inverse,
            letterSpacing: 0.5,
          }}
        >
          我的收藏
        </Text>
      </LinearGradient>

      <View style={tabContainerStyle}>
        {TAB_CONFIG.map(tab => (
          <GlassButton
            key={tab.key}
            title={tab.label}
            onPress={() => setActiveTab(tab.key)}
            variant={activeTab === tab.key ? 'gradient' : 'secondary'}
            size="small"
            style={{ flex: 1 }}
          />
        ))}
      </View>

      <FlatList
        data={favorites}
        renderItem={renderItem}
        keyExtractor={(item: Favorite) => item.id}
        contentContainerStyle={listContainerStyle}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
