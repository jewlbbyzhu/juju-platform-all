import React, { memo, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  TextInput,
  ViewStyle,
  TextStyle,
} from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import {
  useTheme,
  gradients,
  animation,
  spacing,
  BorderRadius,
  typography,
} from '../../theme';

type TabType = 'all' | 'unread' | 'groups';

interface ChatListHeaderProps {
  unreadCount: number;
  activeTab: TabType;
  searchQuery: string;
  onTabChange: (tab: TabType) => void;
  onSearchChange: (query: string) => void;
  onAddPress?: () => void;
}

const TAB_LABELS: Record<TabType, string> = {
  all: '全部',
  unread: '未读',
  groups: '群聊',
};

export const ChatListHeader: React.FC<ChatListHeaderProps> = memo(
  ({
    unreadCount,
    activeTab,
    searchQuery,
    onTabChange,
    onSearchChange,
    onAddPress,
  }) => {
    const { colors } = useTheme();

    const getTabLabel = useCallback(
      (tab: TabType) => {
        const baseLabel = TAB_LABELS[tab];
        if (tab === 'unread' && unreadCount > 0) {
          return `${baseLabel} (${unreadCount})`;
        }
        return baseLabel;
      },
      [unreadCount],
    );

    // 使用设计系统替代 StyleSheet
    const headerStyle: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderBottomLeftRadius: BorderRadius['2xl'],
      borderBottomRightRadius: BorderRadius['2xl'],
    };

    const titleStyle: TextStyle = {
      fontSize: typography.size.h3,
      fontWeight: typography.weight.bold,
      color: colors.text.inverse,
    };

    const badgeStyle: ViewStyle = {
      backgroundColor: colors.text.inverse,
      borderRadius: BorderRadius.full,
      minWidth: 20,
      height: 20,
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: spacing.sm,
    };

    const badgeTextStyle: TextStyle = {
      fontSize: typography.size.caption,
      fontWeight: typography.weight.bold,
      color: colors.primary.main,
    };

    const addButtonStyle: ViewStyle = {
      position: 'absolute',
      right: spacing.lg,
      width: 36,
      height: 36,
      borderRadius: BorderRadius.full,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      alignItems: 'center',
      justifyContent: 'center',
    };

    const addButtonTextStyle: TextStyle = {
      fontSize: typography.size.h2,
      fontWeight: typography.weight.regular,
      color: colors.text.inverse,
      marginTop: -2,
    };

    const searchContainerStyle: ViewStyle = {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
    };

    const searchInputContainerStyle: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.background.tertiary,
      borderRadius: BorderRadius.md,
      paddingHorizontal: spacing.md,
      height: 44,
    };

    const searchIconStyle: TextStyle = {
      fontSize: typography.size.body,
      marginRight: spacing.sm,
    };

    const searchInputStyle: TextStyle = {
      flex: 1,
      fontSize: typography.size.body,
      color: colors.text.primary,
    };

    const tabContainerStyle: ViewStyle = {
      flexDirection: 'row',
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.background.tertiary,
    };

    const tabStyle: ViewStyle = {
      flex: 1,
      alignItems: 'center',
      paddingVertical: spacing.md,
      position: 'relative',
    };

    const tabTextStyle: TextStyle = {
      fontSize: typography.size.body,
      fontWeight: typography.weight.medium,
      color: colors.gray[400],
    };

    const activeTabTextStyle: TextStyle = {
      color: colors.primary.main,
      fontWeight: typography.weight.semibold,
    };

    const tabIndicatorStyle: ViewStyle = {
      position: 'absolute',
      bottom: -8,
      width: 40,
      height: 3,
      borderRadius: BorderRadius.xs,
    };

    return (
      <>
        <LinearGradient
          colors={gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={headerStyle}
        >
          <Text style={titleStyle}>消息</Text>
          {unreadCount > 0 && (
            <View style={badgeStyle}>
              <Text style={badgeTextStyle}>{unreadCount}</Text>
            </View>
          )}
          <Pressable style={addButtonStyle} onPress={onAddPress}>
            <Text style={addButtonTextStyle}>+</Text>
          </Pressable>
        </LinearGradient>

        <Animated.View
          entering={FadeIn.delay(50).duration(animation.duration.normal)}
        >
          <View style={searchContainerStyle}>
            <View style={searchInputContainerStyle}>
              <Text style={searchIconStyle}>🔍</Text>
              <TextInput
                style={searchInputStyle}
                placeholder="搜索聊天..."
                placeholderTextColor={colors.gray[400]}
                value={searchQuery}
                onChangeText={onSearchChange}
              />
            </View>
          </View>
        </Animated.View>

        <Animated.View
          entering={FadeIn.delay(100).duration(animation.duration.normal)}
        >
          <View style={tabContainerStyle}>
            {(['all', 'unread', 'groups'] as TabType[]).map(tab => (
              <Pressable
                key={tab}
                style={tabStyle}
                onPress={() => onTabChange(tab)}
              >
                <Text
                  style={[
                    tabTextStyle,
                    activeTab === tab && activeTabTextStyle,
                  ]}
                >
                  {getTabLabel(tab)}
                </Text>
                {activeTab === tab && (
                  <LinearGradient
                    colors={gradients.primary}
                    style={tabIndicatorStyle}
                  />
                )}
              </Pressable>
            ))}
          </View>
        </Animated.View>
      </>
    );
  },
);

export default ChatListHeader;
