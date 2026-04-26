import React, { useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { GlassCard, GlassButton } from '../../components';
import { useTheme } from '../../theme';
import {colors, animation} from '../../theme';
import {BorderRadius} from '../../theme/shadows';
import { ProfileVIPBadge, getVIPInfo } from './ProfileVIPBadge';

export interface UserProfile {
  id: number;
  nickname: string;
  avatar: string;
  phone?: string;
  gender?: number;
  birthday?: string;
  bio?: string;
  vipLevel?: number;
}

interface ProfileHeaderProps {
  profile: UserProfile | null;
  onSettingsPress: () => void;
  onNotificationsPress: () => void;
  onVIPPress: () => void;
}

interface ActionButtonProps {
  icon: string;
  onPress: () => void;
  hasBadge?: boolean;
  badgeCount?: number;
}

interface ProfileVIPTagProps {
  level: number;
}


export const ProfileHeader: React.FC<ProfileHeaderProps> = React.memo(
  ({ profile, onSettingsPress, onNotificationsPress, onVIPPress }) => {
    const {
      colors: themeColors,
      typography,
      spacing: themeSpacing,
      layout,
    } = useTheme();

    const showVIPBadge = profile?.vipLevel && profile.vipLevel > 0;

    const styles = useMemo(
      () => createStyles(themeColors, typography, themeSpacing, layout),
      [themeColors, typography, themeSpacing, layout],
    );

    const ActionButton: React.FC<ActionButtonProps> = ({
      icon,
      onPress,
      hasBadge = false,
      badgeCount = 0,
    }) => {
      const scale = useSharedValue(1);

      const handlePressIn = useCallback(() => {
        scale.value = withSpring(0.9, animation.spring.gentle);
      }, [scale]);

      const handlePressOut = useCallback(() => {
        scale.value = withSpring(1, animation.spring.gentle);
      }, [scale]);

      const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
      }));

      return (
        <TouchableOpacity
          style={styles.iconButton}
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={1}
        >
          <Animated.View style={animatedStyle}>
            <Text style={styles.iconButtonText}>{icon}</Text>
            {hasBadge && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {badgeCount > 99 ? '99+' : badgeCount}
                </Text>
              </View>
            )}
          </Animated.View>
        </TouchableOpacity>
      );
    };

    const ProfileVIPTag: React.FC<ProfileVIPTagProps> = ({ level }) => {
      const vipInfo = getVIPInfo(level);
      return (
        <View style={[styles.vipTag, { backgroundColor: vipInfo.color + '30' }]}>
          <Text style={[styles.vipTagText, { color: vipInfo.color }]}>
            {vipInfo.name}
          </Text>
        </View>
      );
    };

    return (
      <LinearGradient
        colors={[...colors.primary.gradient]}
        style={styles.headerGradient}
      >
        <Animated.View entering={FadeInUp.duration(animation.duration.slow)}>
          <GlassCard
            intensity="light"
            style={styles.userCard}
            glow
            glowColor={colors.primary.main}
          >
            <View style={styles.headerActions}>
              <ActionButton icon="⚙️" onPress={onSettingsPress} />
              <ActionButton
                icon="🔔"
                onPress={onNotificationsPress}
                hasBadge
                badgeCount={3}
              />
            </View>

            <View style={styles.userInfo}>
              <View style={styles.avatarContainer}>
                <Image
                  source={{
                    uri: profile?.avatar || 'https://i.pravatar.cc/200?1',
                  }}
                  style={styles.avatar}
                />
                {showVIPBadge && (
                  <ProfileVIPBadge level={profile.vipLevel!} size="medium" />
                )}
              </View>
              <View style={styles.userMeta}>
                <Text style={styles.nickname}>
                  {profile?.nickname || '聚聚用户'}
                </Text>
                <View style={styles.userTags}>
                  {showVIPBadge ? (
                    <ProfileVIPTag level={profile.vipLevel!} />
                  ) : (
                    <GlassButton
                      title="升级VIP"
                      onPress={onVIPPress}
                      variant="gradient"
                      size="small"
                      style={styles.upgradeButton}
                    />
                  )}
                </View>
                <Text style={styles.bio} numberOfLines={2}>
                  {profile?.bio || '还没有个人简介'}
                </Text>
              </View>
            </View>
          </GlassCard>
        </Animated.View>
      </LinearGradient>
    );
  },
);

ProfileHeader.displayName = 'ProfileHeader';


const createStyles = (
  colors: ReturnType<typeof useTheme>['colors'],
  typography: ReturnType<typeof useTheme>['typography'],
  spacing: ReturnType<typeof useTheme>['spacing'],
  layout: ReturnType<typeof useTheme>['layout'],
) =>
  StyleSheet.create({
    headerGradient: {
      paddingHorizontal: layout.screenPadding,
      paddingTop: spacing.sm,
      paddingBottom: spacing['2xl'],
    },
    userCard: {
      margin: 0,
      borderRadius: BorderRadius.xl,
      overflow: 'hidden',
    },
    headerActions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: spacing.sm,
      marginBottom: spacing.md,
      paddingHorizontal: spacing.sm,
      paddingTop: spacing.sm,
    },
    iconButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.text.inverse + '33',
      justifyContent: 'center',
      alignItems: 'center',
    },
    iconButtonText: {
      fontSize: 18,
    },
    badge: {
      position: 'absolute',
      top: -4,
      right: -4,
      minWidth: 18,
      height: 18,
      borderRadius: 9,
      backgroundColor: colors.status.error,
      justifyContent: 'center',
      alignItems: 'center',
    },
    badgeText: {
      color: colors.text.inverse,
      fontSize: typography.size.small,
      fontWeight: typography.weight.bold,
    },
    userInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.lg,
      paddingHorizontal: spacing.md,
    },
    avatarContainer: {
      position: 'relative',
    },
    avatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
      borderWidth: 3,
      borderColor: colors.text.inverse + '4D',
    },
    userMeta: {
      flex: 1,
      marginLeft: spacing.md,
    },
    nickname: {
      fontSize: typography.size.h2,
      fontWeight: typography.weight.bold,
      color: colors.text.inverse,
      marginBottom: spacing.xs,
    },
    userTags: {
      flexDirection: 'row',
      marginBottom: spacing.xs,
    },
    vipTag: {
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
      borderRadius: 12,
    },
    vipTagText: {
      fontSize: typography.size.caption,
      fontWeight: typography.weight.semibold,
    },
    upgradeButton: {
      paddingHorizontal: spacing.sm,
      borderRadius: 12,
    },
    bio: {
      fontSize: typography.size.body2,
      color: colors.text.inverse + 'CC',
      lineHeight: typography.lineHeight.normal * typography.size.body2,
    },
  });

export default ProfileHeader;
