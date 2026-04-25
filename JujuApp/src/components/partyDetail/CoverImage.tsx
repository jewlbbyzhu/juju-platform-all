import React, { useMemo } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {
  FadeIn,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
} from 'react-native-reanimated';
import {
  glassmorphism,
  colors,
  typography,
  spacing,
  animation,
} from '../../theme';
import { StatusConfig } from '../../utils/partyDetail';

const { width } = Dimensions.get('window');

interface CoverImageProps {
  imageUri: string;
  onBack: () => void;
  onShare: () => void;
  liked: boolean;
  onToggleLike: () => void;
  status: StatusConfig;
}

export const CoverImage: React.FC<CoverImageProps> = React.memo(
  ({ imageUri, onBack, onShare, liked, onToggleLike, status }) => {
    const heartScale = useSharedValue(1);

    const heartAnimatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: heartScale.value }],
    }));

    const handleLikePress = () => {
      heartScale.value = withSequence(
        withSpring(1.3, animation.spring.bouncy),
        withSpring(1, animation.spring.gentle),
      );
      onToggleLike();
    };

    const styles = useMemo(
      () =>
        StyleSheet.create({
          container: {
            width: width,
            height: width * 0.75,
            position: 'relative',
          },
          image: {
            width: '100%',
            height: '100%',
          },
          gradient: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          },
          overlay: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingHorizontal: spacing.md,
            paddingTop: spacing.xs,
          },
          button: {
            width: 40,
            height: 40,
            borderRadius: 20,
            justifyContent: 'center',
            alignItems: 'center',
          },
          buttonIcon: {
            fontSize: 20,
            color: colors.text.inverse,
          },
          actions: {
            flexDirection: 'row',
            gap: spacing.sm,
          },
          likeButton: {
            backgroundColor: colors.primary.light + '40',
            borderColor: colors.primary.main,
          },
          likeIcon: {
            color: colors.primary.main,
          },
          statusBadge: {
            position: 'absolute',
            bottom: spacing.md,
            left: spacing.md,
          },
          statusInner: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 20,
          },
          statusIcon: {
            fontSize: 12,
            marginRight: 4,
          },
          statusText: {
            fontSize: typography.size.caption,
            fontWeight: typography.weight.semibold,
          },
        }),
      [],
    );

    return (
      <Animated.View
        entering={FadeIn.duration(animation.duration.slow)}
        style={styles.container}
      >
        <Image
          source={{
            uri:
              imageUri ||
              'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800',
          }}
          style={styles.image}
        />
        <LinearGradient
          colors={[colors.overlay, 'transparent', colors.scrim]}
          style={styles.gradient}
        />

        <Animated.View style={styles.overlay}>
          <Pressable
            style={[styles.button, glassmorphism.button]}
            onPress={onBack}
          >
            <Text style={styles.buttonIcon}>←</Text>
          </Pressable>
          <View style={styles.actions}>
            <Pressable
              style={[styles.button, glassmorphism.button]}
              onPress={onShare}
            >
              <Text style={styles.buttonIcon}>↗️</Text>
            </Pressable>
            <Animated.View style={heartAnimatedStyle}>
              <Pressable
                style={[
                  styles.button,
                  glassmorphism.button,
                  liked && styles.likeButton,
                ]}
                onPress={handleLikePress}
              >
                <Text style={[styles.buttonIcon, liked && styles.likeIcon]}>
                  {liked ? '❤️' : '🤍'}
                </Text>
              </Pressable>
            </Animated.View>
          </View>
        </Animated.View>

        <Animated.View
          entering={FadeInUp.duration(animation.duration.normal).delay(200)}
          style={styles.statusBadge}
        >
          <View
            style={[
              styles.statusInner,
              { backgroundColor: status?.bgColor },
              glassmorphism.chip,
            ]}
          >
            <Text style={styles.statusIcon}>{status?.icon}</Text>
            <Text style={[styles.statusText, { color: status?.color }]}>
              {status?.text}
            </Text>
          </View>
        </Animated.View>
      </Animated.View>
    );
  },
);

CoverImage.displayName = 'CoverImage';
