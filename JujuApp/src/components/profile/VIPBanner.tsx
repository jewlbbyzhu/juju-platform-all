import React, { useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import { GlassButton } from '../../components';
import { colors, spacing, layout, animation } from '../../theme';
import { BorderRadius, Shadows } from '../../theme/shadows';

interface VIPBannerProps {
  onPress: () => void;
}

export const VIPBanner: React.FC<VIPBannerProps> = ({ onPress }) => {
  const scale = useSharedValue(0.95);

  React.useEffect(() => {
    scale.value = withSpring(1, {
      damping: 12,
      stiffness: 180,
    });
  }, [scale]);


    scale.value = withSpring(0.98, animation.spring.gentle);
  }, [scale]);


    scale.value = withSpring(1, animation.spring.gentle);
  }, [scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.vipBannerWrapper, animatedStyle]}>
      <LinearGradient
        colors={[colors.secondary.main, colors.secondary.light]}
        style={styles.vipBannerGradient}
      >
        <View style={styles.vipBannerContent}>
          <View>
            <Text style={styles.vipBannerTitle}>开通VIP会员</Text>
            <Text style={styles.vipBannerSubtitle}>享受专属特权与优惠</Text>
          </View>
          <GlassButton
            title="立即开通"
            onPress={onPress}
            variant="gradient"
            size="small"
            style={styles.vipBannerButton}
          />
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

VIPBanner.displayName = 'VIPBanner';

const styles = StyleSheet.create({
  vipBannerWrapper: {
    marginHorizontal: layout.screenPadding,
    marginTop: -spacing.xs,
    marginBottom: layout.screenPadding,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.large,
  },
  vipBannerGradient: {
    borderRadius: BorderRadius.lg,
    padding: layout.screenPadding,
  },
  vipBannerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  vipBannerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.inverse,
  },
  vipBannerSubtitle: {
    fontSize: 12,
    marginTop: 2,
    color: colors.text.inverse + 'B3',
  },
  vipBannerButton: {
    backgroundColor: colors.text.inverse,
  },
});

export default VIPBanner;
