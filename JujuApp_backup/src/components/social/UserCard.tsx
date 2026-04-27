import React, { memo, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
} from 'react-native';
import Animated, {
  FadeInLeft,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import {
  useTheme,
  shadows,
  BorderRadius,
  spacing,
  typography,
} from '../../theme';

export interface SocialUser {
  id: string;
  nickname: string;
  avatar?: string;
  bio?: string;
  is_vip?: boolean;
  followers_count?: number;
  following_count?: number;
  parties_count?: number;
  is_following: boolean;
}

interface UserCardProps {
  user: SocialUser;
  index: number;
  onFollow: (user: SocialUser) => void;
  onProfilePress: (userId: string) => void;
  onMorePress: (user: SocialUser) => void;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const UserCardComponent: React.FC<UserCardProps> = ({
  user,
  index,
  onFollow,
  onProfilePress,
  onMorePress,
}) => {
  const { colors } = useTheme();
  const scale = useSharedValue(1);

  const handleFollowPress = useCallback(() => {
    scale.value = withSpring(0.9, { damping: 10, stiffness: 400 }, () => {
      scale.value = withSpring(1, { damping: 15, stiffness: 200 });
    });
    onFollow(user);
  }, [onFollow, user, scale]);

  const followButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const styles = useMemo(() => createStyles(colors), [colors]);

  const cardStyle = useMemo(
    (): ViewStyle[] => [
      styles.card,
      { backgroundColor: colors.background.card },
      shadows.small,
    ],
    [colors, styles.card],
  );

  const followBtnStyle = useMemo(
    (): ViewStyle[] => [
      styles.followBtn,
      ...(user.is_following ? [styles.followingBtn] : []),
    ],
    [styles, user.is_following],
  );

  const followBtnTextStyle = useMemo(
    (): TextStyle[] => [
      styles.followBtnText,
      ...(user.is_following ? [styles.followingBtnText] : []),
    ],
    [styles, user.is_following],
  );

  return (
    <Animated.View
      style={cardStyle}
      entering={FadeInLeft.delay(index * 50)
        .duration(300)
        .springify()}
    >
      <View style={styles.content}>
        <TouchableOpacity
          onPress={() => onProfilePress(user.id)}
          activeOpacity={0.8}
        >
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: user.avatar || '' }}
              style={[
                styles.avatar,
                { borderColor: colors.primary.light + '1A' },
              ]}
            />
            {user.is_vip && (
              <View
                style={[
                  styles.vipBadge,
                  { backgroundColor: colors.accent.gold },
                ]}
              >
                <Text style={styles.vipText}>VIP</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>

        <View style={styles.info}>
          <Text
            style={[styles.nickname, { color: colors.text.primary }]}
            numberOfLines={1}
          >
            {user.nickname || '匿名用户'}
          </Text>
          <Text
            style={[styles.bio, { color: colors.text.secondary }]}
            numberOfLines={1}
          >
            {user.bio || '这个人很懒，什么都没写'}
          </Text>
          <View style={styles.stats}>
            <Text style={[styles.statItem, { color: colors.text.tertiary }]}>
              粉丝 {user.followers_count || 0}
            </Text>
            <Text style={[styles.statDot, { color: colors.text.tertiary }]}>
              ·
            </Text>
            <Text style={[styles.statItem, { color: colors.text.tertiary }]}>
              关注 {user.following_count || 0}
            </Text>
            <Text style={[styles.statDot, { color: colors.text.tertiary }]}>
              ·
            </Text>
            <Text style={[styles.statItem, { color: colors.text.tertiary }]}>
              聚会 {user.parties_count || 0}
            </Text>
          </View>
        </View>

        <View style={styles.actions}>
          <AnimatedTouchable
            style={[...followBtnStyle, followButtonStyle]}
            onPress={handleFollowPress}
            activeOpacity={0.8}
          >
            <Text style={followBtnTextStyle}>
              {user.is_following ? '已关注' : '关注'}
            </Text>
          </AnimatedTouchable>
          <TouchableOpacity
            style={[
              styles.moreBtn,
              { backgroundColor: colors.background.secondary },
            ]}
            onPress={() => onMorePress(user)}
            activeOpacity={0.7}
          >
            <Text
              style={[styles.moreBtnText, { color: colors.text.secondary }]}
            >
              ⋯
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
};

const createStyles = (colors: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    card: {
      marginBottom: spacing.md,
      borderRadius: BorderRadius.md,
      overflow: 'hidden',
    },
    content: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing.md,
    },
    avatarContainer: {
      position: 'relative',
    },
    avatar: {
      width: 56,
      height: 56,
      borderRadius: 28,
      marginRight: 14,
      borderWidth: 2,
    },
    vipBadge: {
      position: 'absolute',
      bottom: 0,
      right: 10,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: BorderRadius.xs,
      borderWidth: 2,
      borderColor: colors.background.card,
    },
    vipText: {
      fontSize: 9,
      fontWeight: 'bold',
      color: colors.text.primary,
    },
    info: {
      flex: 1,
    },
    nickname: {
      fontSize: typography.size.h4,
      fontWeight: typography.weight.bold,
      marginBottom: 4,
    },
    bio: {
      fontSize: 13,
      marginBottom: 6,
    },
    stats: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    statItem: {
      fontSize: 12,
    },
    statDot: {
      fontSize: 12,
      marginHorizontal: 6,
    },
    actions: {
      alignItems: 'flex-end',
      gap: spacing.sm,
    },
    followBtn: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      backgroundColor: colors.primary.main,
      borderRadius: BorderRadius.full,
      minWidth: 64,
      alignItems: 'center',
      ...shadows.primary,
    },
    followingBtn: {
      backgroundColor: colors.background.secondary,
      ...shadows.none,
    },
    followBtnText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.text.inverse,
    },
    followingBtnText: {
      color: colors.text.secondary,
    },
    moreBtn: {
      width: 32,
      height: 32,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: BorderRadius.full,
    },
    moreBtnText: {
      fontSize: 16,
      marginTop: -4,
    },
  });

export const UserCard = memo(UserCardComponent);
