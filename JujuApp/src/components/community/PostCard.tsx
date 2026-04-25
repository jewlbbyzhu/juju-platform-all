import React, { useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ViewStyle,
  TextStyle,
  ImageStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withSpring,
  withTiming,
  FadeInDown,
  Layout,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { GlassCard } from '../GlassCard';
import { PostActionBar } from './PostActionBar';
import {
  useTheme,
  spacing,
  typography,
  animation,
  BorderRadius,
} from '../../theme';
import type { Post } from '../../types/api';
import type { NavigationProp } from '../../types/navigation';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface PostCardProps {
  post: Post;
  index: number;
  navigation: NavigationProp;
  onLike: (postId: number) => void;
  onShare: (post: Post) => void;
}


export const PostCard: React.FC<PostCardProps> = ({
  post,
  index,
  navigation,
  onLike,
  onShare,
}) => {
  const { colors } = useTheme();
  const scale = useSharedValue(0.95);
  const opacity = useSharedValue(0);

  useEffect(() => {
    const delay = index * 80;
    scale.value = withDelay(delay, withSpring(1, animation.spring.gentle));
    opacity.value = withDelay(
      delay,
      withTiming(1, { duration: animation.duration.normal }),
    );
  }, [index, scale, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePress = useCallback(() => {
    (navigation as any).navigate('PostDetail', { postId: post.id });
  }, [navigation, post.id]);

  const handleLike = useCallback(() => {
    onLike(post.id);
  }, [onLike, post.id]);

  const handleShare = useCallback(() => {
    onShare(post);
  }, [onShare, post]);

  const containerStyle = useMemo(
    (): ViewStyle => ({
      paddingHorizontal: spacing.lg,
      marginBottom: spacing.lg,
    }),
    [],
  );

  const cardStyle = useMemo(
    (): ViewStyle => ({
      padding: spacing.lg,
    }),
    [],
  );

  const headerStyle = useMemo(
    (): ViewStyle => ({
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.md,
    }),
    [],
  );

  const authorAvatarStyle = useMemo(
    (): ImageStyle => ({
      width: spacing['2xl'],
      height: spacing['2xl'],
      borderRadius: BorderRadius.lg,
      marginRight: spacing.md,
      borderWidth: 2,
      borderColor: colors.primary.main,
    }),
    [colors.primary.main],
  );

  const authorInfoStyle = useMemo(
    (): ViewStyle => ({
      flex: 1,
    }),
    [],
  );

  const authorNameStyle = useMemo(
    (): TextStyle => ({
      fontSize: typography.size.body,
      fontWeight: typography.weight.semibold,
      color: colors.text.inverse,
    }),
    [colors.text.inverse],
  );

  const timeStyle = useMemo(
    (): TextStyle => ({
      fontSize: typography.size.caption,
      color: colors.gray[500],
      marginTop: spacing.xs,
    }),
    [colors.gray[500]],
  );

  const titleStyle = useMemo(
    (): TextStyle => ({
      fontSize: typography.size.h3,
      fontWeight: typography.weight.bold,
      color: colors.text.inverse,
      marginBottom: spacing.sm,
      lineHeight: typography.size.h3 * typography.lineHeight.normal,
    }),
    [colors.text.inverse],
  );

  const contentStyle = useMemo(
    (): TextStyle => ({
      fontSize: typography.size.body2,
      color: colors.gray[300],
      lineHeight: typography.size.body2 * typography.lineHeight.normal,
      marginBottom: spacing.md,
    }),
    [colors.gray[300]],
  );

  const imagesScrollStyle = useMemo(
    (): ViewStyle => ({
      marginHorizontal: -spacing.xs,
    }),
    [],
  );

  const imagesContainerStyle = useMemo(
    (): ViewStyle => ({
      paddingHorizontal: spacing.xs,
    }),
    [],
  );

  const postImageStyle = useMemo(
    (): ImageStyle => ({
      width: SCREEN_WIDTH * 0.65,
      height: SCREEN_WIDTH * 0.45,
      borderRadius: BorderRadius.md,
      marginHorizontal: spacing.xs,
    }),
    [],
  );

  const tagsContainerStyle = useMemo(
    (): ViewStyle => ({
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: spacing.md,
      marginBottom: spacing.sm,
    }),
    [],
  );

  const tagBadgeStyle = useMemo(
    (): ViewStyle => ({
      backgroundColor: colors.gray[700],
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: BorderRadius.md,
      marginRight: spacing.sm,
      marginBottom: spacing.xs,
    }),
    [colors.gray[700]],
  );

  const tagTextStyle = useMemo(
    (): TextStyle => ({
      fontSize: typography.size.caption,
      color: colors.primary.main,
      fontWeight: typography.weight.medium,
    }),
    [colors.primary.main],
  );

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 80)
        .duration(animation.duration.normal)
        .springify()}
      layout={Layout.springify()}
      style={[containerStyle, animatedStyle]}
    >
      <GlassCard style={cardStyle} intensity="light">
        <TouchableOpacity activeOpacity={0.9} onPress={handlePress}>
          <View style={headerStyle}>
            <Image
              source={{ uri: post.author?.avatar || post.userAvatar || '' }}
              style={authorAvatarStyle}
            />
            <View style={authorInfoStyle}>
              <Text style={authorNameStyle}>
                {post.author?.name ||
                  post.author?.nickname ||
                  post.userName ||
                  '未知用户'}
              </Text>
              <Text style={timeStyle}>
                {post.createdAt || post.createdAtString}
              </Text>
            </View>
            <TouchableOpacity onPress={handleShare}>
              <Ionicons
                name="share-outline"
                size={20}
                color={colors.gray[400]}
              />
            </TouchableOpacity>
          </View>

          {post.title && <Text style={titleStyle}>{post.title}</Text>}
          <Text style={contentStyle} numberOfLines={3}>
            {post.content}
          </Text>

          {post.images && post.images.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={imagesScrollStyle}
              contentContainerStyle={imagesContainerStyle}
            >
              {post.images.map((img, idx) => (
                <Image
                  key={idx}
                  source={{ uri: img }}
                  style={postImageStyle}
                  resizeMode="cover"
                />
              ))}
            </ScrollView>
          )}

          {post.tags && post.tags.length > 0 && (
            <View style={tagsContainerStyle}>
              {post.tags.map((tag, idx) => (
                <View key={idx} style={tagBadgeStyle}>
                  <Text style={tagTextStyle}>#{tag}</Text>
                </View>
              ))}
            </View>
          )}
        </TouchableOpacity>

        <PostActionBar
          likes={post.likes || post.likeCount || 0}
          comments={post.comments || post.commentCount || 0}
          isLiked={post.isLiked || false}
          onLike={handleLike}
          onShare={handleShare}
        />
      </GlassCard>
    </Animated.View>
  );
};

export default PostCard;
