import React, { useEffect, useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  Dimensions,
  ViewStyle,
  TextStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme, spacing, BorderRadius, typography } from '../../theme';

const { width } = Dimensions.get('window');
const TAB_WIDTH = (width - spacing.lg * 2) / 2;

type TabType = 'all' | 'unread';

interface NotificationTabSwitcherProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const NotificationTabSwitcher: React.FC<
  NotificationTabSwitcherProps
> = ({ currentTab, onTabChange }) => {
  const { colors } = useTheme();
  const indicatorPosition = useSharedValue(currentTab === 'all' ? 0 : 1);

  useEffect(() => {
    indicatorPosition.value = withSpring(currentTab === 'all' ? 0 : 1, {
      damping: 15,
      stiffness: 200,
    });
  }, [currentTab, indicatorPosition]);

  const indicatorStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      indicatorPosition.value,
      [0, 1],
      [0, TAB_WIDTH],
    );
    return {
      transform: [{ translateX }],
    };
  });

  const containerStyle = useMemo(
    (): ViewStyle => ({
      flexDirection: 'row',
      marginBottom: spacing.md,
      backgroundColor: colors.gray[800],
      borderRadius: BorderRadius.md,
      padding: spacing.xs,
    }),
    [colors.gray[800]],
  );

  const indicatorContainerStyle = useMemo(
    (): ViewStyle => ({
      position: 'absolute',
      top: spacing.xs,
      left: spacing.xs,
      width: TAB_WIDTH - spacing.xs,
    }),
    [],
  );

  const indicatorGradientStyle = useMemo(
    (): ViewStyle => ({
      height: 32,
      borderRadius: BorderRadius.sm,
    }),
    [],
  );

  const tabStyle = useMemo(
    (): ViewStyle => ({
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      height: 32,
      zIndex: 1,
    }),
    [],
  );

  const tabTextStyle = useMemo(
    (): TextStyle => ({
      fontSize: typography.size.body2,
      fontWeight: typography.weight.medium,
      color: colors.gray[400],
    }),
    [colors.gray[400]],
  );

  const activeTabTextStyle = useMemo(
    (): TextStyle => ({
      color: colors.text.inverse,
      fontWeight: typography.weight.semibold,
    }),
    [colors.text.inverse],
  );

  return (
    <View style={containerStyle}>
      <Animated.View style={[indicatorContainerStyle, indicatorStyle]}>
        <LinearGradient
          colors={[colors.primary.main, colors.primary.light]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={indicatorGradientStyle}
        />
      </Animated.View>

      {(['all', 'unread'] as TabType[]).map(tab => (
        <Pressable
          key={tab}
          style={tabStyle}
          onPress={() => onTabChange(tab)}
        >
          <Text
            style={[
              tabTextStyle,
              currentTab === tab && activeTabTextStyle,
            ]}
          >
            {tab === 'all' ? '全部' : '未读'}
          </Text>
        </Pressable>
      ))}
    </View>
  );
};

export default NotificationTabSwitcher;
