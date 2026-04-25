import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import type { OrderTabsProps } from './types';

const OrderTabs: React.FC<OrderTabsProps> = ({
  activeTab,
  onTabChange,
  colors,
  typography,
  spacing,
  tabs,
}) => {
  const tabScale = useSharedValue(1);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          backgroundColor: colors.background.primary,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          paddingVertical: spacing.xs,
        },
        scrollContent: {
          paddingHorizontal: spacing.md,
          gap: spacing.xs,
        },
        tab: {
          paddingVertical: spacing.sm,
          paddingHorizontal: spacing.md,
          borderRadius: 20,
          position: 'relative',
          overflow: 'hidden',
        },
        tabText: {
          fontSize: typography.size.body2,
          color: colors.text.secondary,
        },
        tabTextActive: {
          color: colors.text.inverse,
          fontWeight: typography.weight.semibold,
        },
        tabIndicator: {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: 20,
        },
      }),
    [colors, spacing, typography],
  );

  const handleTabPress = (tabKey: string) => {
    tabScale.value = withSpring(0.95, { damping: 15, stiffness: 400 }, () => {
      tabScale.value = withSpring(1, { damping: 15, stiffness: 400 });
    });
    onTabChange(tabKey as any);
  };

  const animatedTabStyle = useAnimatedStyle(() => ({
    transform: [{ scale: tabScale.value }],
  }));

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {tabs.map(tab => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.tab}
              onPress={() => handleTabPress(tab.key)}
              activeOpacity={0.7}
            >
              {isActive && (
                <Animated.View
                  entering={FadeIn.duration(200)}
                  style={animatedTabStyle}
                >
                  <LinearGradient
                    colors={[...colors.primary.gradient]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.tabIndicator}
                  />
                </Animated.View>
              )}
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </Animated.ScrollView>
    </View>
  );
};

export default React.memo(OrderTabs);
