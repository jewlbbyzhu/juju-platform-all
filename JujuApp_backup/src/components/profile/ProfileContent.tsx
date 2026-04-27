import React from 'react';
import { View, ScrollView } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useTheme, spacing, animation } from '../../theme';
import {
  ProfileHeader,
  ProfileStats,
  ProfileMenuGroup,
  type UserProfile,
  type UserStats,
} from './index';
import { VIPBanner } from './VIPBanner';
import { RefreshIndicator } from './RefreshIndicator';

import { MENU_GROUPS } from './constants';

export interface ProfileContentProps {
  profile: UserProfile | null;
  stats: UserStats;
  refreshing: boolean;
  onRefresh: () => void;
  onSettingsPress: () => void;
  onNotificationsPress: () => void;
  onVIPPress: () => void;
  onMenuItemPress: (route: string) => void;
}

export const ProfileContent: React.FC<ProfileContentProps> = React.memo(
  ({
    profile,
    stats,
    refreshing,
    onRefresh,
    onSettingsPress,
    onNotificationsPress,
    onVIPPress,
    onMenuItemPress,
  }) => {
    const { spacing: themeSpacing } = useTheme();
    const showVIPBanner = !profile?.vipLevel || profile.vipLevel === 0;

    return (
      <View style={{ flex: 1 }}>
        <RefreshIndicator refreshing={refreshing} onRefresh={onRefresh} />
        <ScrollView
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshIndicator refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <ProfileHeader
            profile={profile}
            onSettingsPress={onSettingsPress}
            onNotificationsPress={onNotificationsPress}
            onVIPPress={onVIPPress}
          />

          <Animated.View
            entering={FadeInUp.duration(animation.duration.normal).delay(
              themeSpacing.sm,
            )}
          >
            <ProfileStats stats={stats} index={0} />
          </Animated.View>

          {showVIPBanner && (
            <Animated.View
              entering={FadeInUp.duration(animation.duration.slow).delay(
                themeSpacing['2xl'],
              )}
            >
              <VIPBanner onPress={onVIPPress} />
            </Animated.View>
          )}

          {MENU_GROUPS.map((group, groupIndex) => (
            <ProfileMenuGroup
              key={group.title}
              group={group}
              groupIndex={groupIndex}
              onItemPress={onMenuItemPress}
            />
          ))}

          <View style={{ height: spacing['4xl'] }} />
        </ScrollView>
      </View>
    );
  },
);

ProfileContent.displayName = 'ProfileContent';

export default ProfileContent;
