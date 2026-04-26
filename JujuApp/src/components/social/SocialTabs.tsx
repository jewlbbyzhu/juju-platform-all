import React, { memo, useCallback } from 'react';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  FadeIn,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useTheme, shadows, BorderRadius, spacing } from '../../theme';

type TabType = 'followers' | 'following';

interface SocialTabsProps {
  currentTab: TabType;
  followersCount: number;
  followingCount: number;
  onTabChange: (tab: TabType) => void;
}

const TAB_CONFIG = {
  followers: { label: '粉丝', key: 'followers' as TabType },
  following: { label: '关注', key: 'following' as TabType },
};

const SocialTabsComponent: React.FC<SocialTabsProps> = ({
  currentTab,
  followersCount,
  followingCount,
  onTabChange,
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const indicatorPos = useSharedValue<number>(
    currentTab === 'followers' ? 0 : 1,
  );

  const handleTabPress = useCallback(
    (tab: TabType) => {
      indicatorPos.value = withSpring(tab === 'followers' ? 0 : 1, {
        damping: 15,
        stiffness: 200,
      });
      onTabChange(tab);
    },
    [onTabChange, indicatorPos],
  );

  const renderTab = useCallback(
    (tab: TabType, count: number) => {
      const isActive = currentTab === tab;
      return (
        <TouchableOpacity
          key={tab}
          style={styles.tabItem}
          onPress={() => handleTabPress(tab)}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, isActive && styles.tabActiveText]}>
            {TAB_CONFIG[tab].label}
          </Text>
          <Text style={[styles.tabCount, isActive && styles.tabActiveCount]}>
            {count}
          </Text>
        </TouchableOpacity>
      );
    },
    [currentTab, handleTabPress, styles],
  );

  return (
    <Animated.View
      style={[styles.container, { backgroundColor: colors.background.card }]}
      entering={FadeIn.delay(100).duration(300)}
    >
      {renderTab('followers', followersCount)}
      {renderTab('following', followingCount)}
    </Animated.View>
  );
};

const createStyles = (colors: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      marginHorizontal: spacing.lg,
      marginTop: spacing.lg,
      marginBottom: spacing.sm,
      borderRadius: BorderRadius.lg,
      padding: 4,
      ...shadows.medium,
    },
    tabItem: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: spacing.md,
      position: 'relative',
      borderRadius: BorderRadius.md,
    },
    tabText: {
      fontSize: 15,
      fontWeight: '500',
      color: colors.text.secondary,
      marginBottom: 4,
    },
    tabActiveText: {
      color: colors.text.inverse,
      fontWeight: '600',
    },
    tabCount: {
      fontSize: 13,
      color: colors.text.tertiary,
      fontWeight: '600',
    },
    tabActiveCount: {
      color: colors.gray[900],
    },
  });

export const SocialTabs = memo(SocialTabsComponent);
