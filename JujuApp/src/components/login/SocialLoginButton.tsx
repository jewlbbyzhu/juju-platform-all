import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useTheme } from '../../theme';
import { Shadows, BorderRadius } from '../../theme/shadows';

interface SocialLoginButtonProps {
  onPress: () => void;
}

export const SocialLoginButton: React.FC<SocialLoginButtonProps> = React.memo(
  ({ onPress }) => {
    const { colors, animation } = useTheme();
    const scaleAnim = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scaleAnim.value }],
    }));

    const handlePressIn = () => {
      scaleAnim.value = withSpring(
        0.9,
        animation?.spring?.gentle || { damping: 15 },
      );
    };

    const handlePressOut = () => {
      scaleAnim.value = withSpring(
        1,
        animation?.spring?.gentle || { damping: 15 },
      );
    };

    return (
      <View style={styles.socialIcons}>
        <TouchableOpacity
          style={[styles.socialBtn, Shadows.medium]}
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={1}
        >
          <Animated.View style={animatedStyle}>
            <LinearGradient
              colors={[colors.status.success, colors.status.success]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.socialBtnGradient}
            >
              <Text
                style={[styles.socialBtnText, { color: colors.text.inverse }]}
              >
                微
              </Text>
            </LinearGradient>
          </Animated.View>
        </TouchableOpacity>
      </View>
    );
  },
);
SocialLoginButton.displayName = 'SocialLoginButton';

const styles = StyleSheet.create({
  socialIcons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 32,
  },
  socialBtn: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  socialBtnGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  socialBtnText: {
    fontSize: 24,
    fontWeight: '700',
  },
});
