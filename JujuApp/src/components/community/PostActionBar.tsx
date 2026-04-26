import React, { useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, ViewStyle, TextStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,

} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, spacing, typography, animation } from '../../theme';

interface PostActionBarProps {
  likes: number;
  comments: number;
  isLiked: boolean;
  onLike: () => void;
  onComment?: () => void;
  onShare?: () => void;
  onCollect?: () => void;
}

export const PostActionBar: React.FC<PostActionBarProps> = ({
  likes,
  comments,
  isLiked,
  onLike,
  onComment,
  onShare,
  onCollect,
}) => {
  const { colors } = useTheme();
  const likeScale = useSharedValue(1);
  const collectScale = useSharedValue(1);

  const handleLike = useCallback(() => {
    likeScale.value = withSequence(
      withSpring(1.3, animation.spring.bouncy),
      withSpring(1, animation.spring.gentle),
    );
    onLike();
  }, [likeScale, onLike]);

  const handleCollect = useCallback(() => {
    collectScale.value = withSequence(
      withSpring(1.2, animation.spring.bouncy),
      withSpring(1, animation.spring.gentle),
    );
    onCollect?.();
  }, [collectScale, onCollect]);

  const likeAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: likeScale.value }],
  }));

  const collectAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: collectScale.value }],
  }));

  const containerStyle = useMemo(
    (): ViewStyle => ({
      flexDirection: 'row',
      borderTopWidth: 1,
      borderTopColor: colors.gray[800],
      paddingTop: spacing.md,
      marginTop: spacing.md,
    }),
    [colors.gray[800]],
  );

  const actionButtonStyle = useMemo(
    (): ViewStyle => ({
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.xs,
    }),
    [],
  );

  const actionTextStyle = useMemo(
    (): TextStyle => ({
      fontSize: typography.size.body2,
      color: colors.gray[400],
    }),
    [colors.gray[400]],
  );

  const likedTextStyle = useMemo(
    (): TextStyle => ({
      color: colors.primary.main,
      fontWeight: typography.weight.semibold,
    }),
    [colors.primary.main],
  );

  return (
    <View style={containerStyle}>
      <TouchableOpacity
        style={actionButtonStyle}
        onPress={handleLike}
        activeOpacity={0.7}
      >
        <Animated.View style={likeAnimatedStyle}>
          <Ionicons
            name={isLiked ? 'heart' : 'heart-outline'}
            size={24}
            color={isLiked ? colors.primary.main : colors.gray[400]}
          />
        </Animated.View>
        <Text style={[actionTextStyle, isLiked && likedTextStyle]}>
          {likes}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={actionButtonStyle}
        onPress={onComment}
        activeOpacity={0.7}
      >
        <Ionicons
          name="chatbubble-outline"
          size={22}
          color={colors.gray[400]}
        />
        <Text style={actionTextStyle}>{comments}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={actionButtonStyle}
        onPress={handleCollect}
        activeOpacity={0.7}
      >
        <Animated.View style={collectAnimatedStyle}>
          <Ionicons name="star-outline" size={22} color={colors.gray[400]} />
        </Animated.View>
        <Text style={actionTextStyle}>收藏</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={actionButtonStyle}
        onPress={onShare}
        activeOpacity={0.7}
      >
        <Ionicons name="share-outline" size={22} color={colors.gray[400]} />
        <Text style={actionTextStyle}>分享</Text>
      </TouchableOpacity>
    </View>
  );
};

export default PostActionBar;
