import React, { useCallback, useMemo } from 'react';
import { View, TextInput, TouchableOpacity, ViewStyle, TextStyle } from 'react-native';
import Animated, {
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme, spacing, typography, animation } from '../../theme';

interface CommunitySearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onCreatePress?: () => void;
}

export const CommunitySearchBar: React.FC<CommunitySearchBarProps> = ({
  value,
  onChangeText,
  onCreatePress,
}) => {
  const { colors } = useTheme();
  const scale = useSharedValue(1);

  const handleFocus = useCallback(() => {
    scale.value = withSpring(1.02, animation.spring.gentle);
  }, [scale]);

  const handleBlur = useCallback(() => {
    scale.value = withSpring(1, animation.spring.gentle);
  }, [scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const containerStyle = useMemo(
    (): ViewStyle => ({
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      gap: spacing.md,
    }),
    [],
  );

  const searchContainerStyle = useMemo(
    (): ViewStyle => ({
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.gray[800],
      borderRadius: spacing.lg,
      paddingHorizontal: spacing.md,
      height: spacing['4xl'],
    }),
    [colors.gray[800]],
  );

  const searchInputStyle = useMemo(
    (): TextStyle => ({
      flex: 1,
      fontSize: typography.size.body,
      color: colors.text.inverse,
      marginLeft: spacing.sm,
    }),
    [colors.text.inverse],
  );

  const createButtonStyle = useMemo(
    (): ViewStyle => ({
      width: spacing['4xl'],
      height: spacing['4xl'],
    }),
    [],
  );

  const createButtonGradientStyle = useMemo(
    (): ViewStyle => ({
      width: spacing['4xl'],
      height: spacing['4xl'],
      borderRadius: spacing.lg,
      alignItems: 'center',
      justifyContent: 'center',
    }),
    [],
  );

  return (
    <Animated.View
      entering={FadeIn.delay(100).duration(animation.duration.normal)}
      style={[containerStyle, animatedStyle]}
    >
      <View style={searchContainerStyle}>
        <Ionicons name="search" size={18} color={colors.gray[400]} />
        <TextInput
          style={searchInputStyle}
          placeholder="搜索话题、动态..."
          placeholderTextColor={colors.gray[400]}
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
      </View>
      <TouchableOpacity style={createButtonStyle} onPress={onCreatePress}>
        <LinearGradient
          colors={colors.primary.gradient}
          style={createButtonGradientStyle}
        >
          <Ionicons name="add" size={24} color={colors.text.inverse} />
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default CommunitySearchBar;
