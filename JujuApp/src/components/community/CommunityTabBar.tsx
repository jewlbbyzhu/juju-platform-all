import React, { useCallback, useMemo } from 'react';
import {

  Text,
  TouchableOpacity,
  Dimensions,
  ViewStyle,
  TextStyle,
} from 'react-native';
import Animated, {
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  Layout,
} from 'react-native-reanimated';
import { useTheme, spacing, typography, animation } from '../../theme';

type TabType = 'recommend' | 'following' | 'topics';

interface CommunityTabBarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const TABS: { key: TabType; label: string }[] = [
  { key: 'recommend', label: '推荐' },
  { key: 'following', label: '关注' },
  { key: 'topics', label: '话题' },
];

const { width } = Dimensions.get('window');

export const CommunityTabBar: React.FC<CommunityTabBarProps> = ({
  activeTab,
  onTabChange,
}) => {
  const { colors } = useTheme();
  const indicatorPosition = useSharedValue(
    TABS.findIndex(t => t.key === activeTab) * (width / 3),
  );

  const handleTabPress = useCallback(
    (tab: TabType, index: number) => {
      indicatorPosition.value = withSpring(index * (width / 3), {
        damping: 15,
        stiffness: 200,
      });
      onTabChange(tab);
    },
    [indicatorPosition, onTabChange],
  );

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorPosition.value }],
  }));

  const containerStyle = useMemo(
    (): ViewStyle => ({
      flexDirection: 'row',
      paddingHorizontal: spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: colors.gray[800],
      position: 'relative',
    }),
    [colors.gray[800]],
  );

  const indicatorBaseStyle = useMemo(
    (): ViewStyle => ({
      position: 'absolute',
      bottom: 0,
      width: width / 3,
      height: spacing.xs + 2,
      backgroundColor: colors.primary.main,
      borderRadius: spacing.xs,
      marginLeft: 0,
    }),
    [colors.primary.main],
  );

  const tabStyle = useMemo(
    (): ViewStyle => ({
      flex: 1,
      alignItems: 'center',
      paddingVertical: spacing.md,
    }),
    [],
  );

  const tabTextStyle = useMemo(
    (): TextStyle => ({
      fontSize: typography.size.body,
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
    <Animated.View
      entering={FadeIn.delay(50).duration(animation.duration.normal)}
      layout={Layout.springify()}
      style={containerStyle}
    >
      <Animated.View style={[indicatorBaseStyle, indicatorStyle]} />
      {TABS.map((tab, index) => (
        <TouchableOpacity
          key={tab.key}
          style={tabStyle}
          onPress={() => handleTabPress(tab.key, index)}
          activeOpacity={0.7}
        >
          <Text
            style={[
              tabTextStyle,
              activeTab === tab.key && activeTabTextStyle,
            ]}
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </Animated.View>
  );
};

export default CommunityTabBar;
