// 2026高颜值设计 - 群聊列表页
import React, { useState, useCallback } from 'react';
import type { JSX } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  RefreshControl,
  ViewStyle,
  TextStyle,
  ImageStyle,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme, spacing, BorderRadius, typography, glassmorphism } from '../theme';
import { GlassCard } from '../components/GlassCard';
import { GlassButton } from '../components/GlassButton';
import { Skeleton, SkeletonList } from '../components/Skeleton';

interface Group {
  id: string;
  name: string;
  avatar?: string;
  memberCount: number;
  lastMessage: string;
  unreadCount: number;
}

export default function GroupChatListScreen(): JSX.Element {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const [groups, setGroups] = useState<Group[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise<void>(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  }, []);

  const loadGroups = useCallback(async () => {
    setLoading(true);
    await new Promise<void>(resolve => setTimeout(resolve, 800));
    setGroups([
      {
        id: '1',
        name: '周末聚会群',
        memberCount: 24,
        lastMessage: '明天记得带身份证哦～',
        unreadCount: 3,
      },
      {
        id: '2',
        name: '桌游爱好者',
        memberCount: 56,
        lastMessage: '有人想玩狼人杀吗？',
        unreadCount: 0,
      },
    ]);
    setLoading(false);
  }, []);

  // 使用设计系统替代 useMemo 样式 - 提取为命名样式对象
  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: colors.background.secondary,
  };

  const headerStyle: ViewStyle = {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    paddingTop: 60,
    paddingBottom: spacing.xl,
    borderBottomLeftRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.xl,
    ...glassmorphism.header,
  };

  const titleStyle: TextStyle = {
    fontSize: typography.size.h1,
    fontWeight: typography.weight.bold,
    color: colors.text.inverse,
    letterSpacing: 0.5,
  };

  const listStyle: ViewStyle = {
    padding: spacing.lg,
    paddingTop: spacing.sm,
  };

  const groupItemStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    marginBottom: spacing.md,
  };

  const avatarContainerStyle: ViewStyle = {
    position: 'relative',
    marginRight: spacing.lg,
  };

  const avatarStyle: ImageStyle = {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.lg,
  };

  const memberBadgeStyle: ViewStyle = {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: colors.secondary.main,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.background.secondary,
  };

  const memberCountStyle: TextStyle = {
    color: colors.text.inverse,
    fontSize: typography.size.small,
    fontWeight: typography.weight.bold,
  };

  const groupInfoStyle: ViewStyle = {
    flex: 1,
  };

  const groupNameStyle: TextStyle = {
    fontSize: typography.size.h4,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
    marginBottom: 6,
  };

  const lastMessageStyle: TextStyle = {
    fontSize: typography.size.body2,
    color: colors.text.secondary,
  };

  const unreadBadgeStyle: ViewStyle = {
    backgroundColor: colors.status.error,
    borderRadius: BorderRadius.sm,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm,
  };

  const unreadTextStyle: TextStyle = {
    color: colors.text.inverse,
    fontSize: typography.size.caption,
    fontWeight: typography.weight.bold,
  };

  const emptyStateStyle: ViewStyle = {
    alignItems: 'center',
    paddingTop: 100,
    paddingHorizontal: spacing['3xl'],
  };

  const emptyIconStyle: TextStyle = {
    fontSize: typography.size.display,
    marginBottom: spacing.lg,
  };

  const emptyTextStyle: TextStyle = {
    fontSize: typography.size.h2,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  };

  const emptySubtextStyle: TextStyle = {
    fontSize: typography.size.body2,
    color: colors.text.secondary,
    marginBottom: spacing.xl,
  };

  const emptyBtnStyle: ViewStyle = {
    minWidth: 140,
  };

  const renderGroupItem = ({ item }: { item: Group }) => (
    <GlassCard
      style={groupItemStyle}
      onPress={() =>
        (navigation as any).navigate('GroupChat', { groupId: item.id })
      }
      intensity="light"
    >
      <View style={avatarContainerStyle}>
        <Image
          source={{ uri: item.avatar || 'https://via.placeholder.com/60' }}
          style={avatarStyle}
        />
        <View style={memberBadgeStyle}>
          <Text style={memberCountStyle}>{item.memberCount}</Text>
        </View>
      </View>
      <View style={groupInfoStyle}>
        <Text style={groupNameStyle}>{item.name}</Text>
        <Text style={lastMessageStyle} numberOfLines={1}>
          {item.lastMessage}
        </Text>
      </View>
      {item.unreadCount > 0 && (
        <View style={unreadBadgeStyle}>
          <Text style={unreadTextStyle}>
            {item.unreadCount > 99 ? '99+' : item.unreadCount}
          </Text>
        </View>
      )}
    </GlassCard>
  );

  const renderEmptyState = () => (
    <View style={emptyStateStyle}>
      <Text style={emptyIconStyle}>💬</Text>
      <Text style={emptyTextStyle}>暂无群聊</Text>
      <Text style={emptySubtextStyle}>创建或加入群聊开始交流</Text>
      <GlassButton
        title="创建群聊"
        variant="primary"
        size="medium"
        onPress={() => (navigation as any).navigate('CreateGroup')}
        style={emptyBtnStyle}
      />
    </View>
  );

  if (loading) {
    return (
      <View style={containerStyle}>
        <LinearGradient
          colors={[colors.primary.main, colors.primary.dark]}
          style={headerStyle}
        >
          <Text style={titleStyle}>群聊</Text>
          <Skeleton width={100} height={36} borderRadius={BorderRadius.full} />
        </LinearGradient>
        <SkeletonList count={3} />
      </View>
    );
  }

  return (
    <View style={containerStyle}>
      <LinearGradient
        colors={[colors.primary.main, colors.primary.dark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={headerStyle}
      >
        <Text style={titleStyle}>群聊</Text>
        <GlassButton
          title="+ 创建"
          onPress={() => (navigation as any).navigate('CreateGroup')}
          variant="secondary"
          size="small"
        />
      </LinearGradient>

      <FlatList
        data={groups}
        renderItem={renderGroupItem}
        keyExtractor={item => item.id}
        contentContainerStyle={listStyle}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary.main}
          />
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
