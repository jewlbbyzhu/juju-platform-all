import React, { useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  FadeInLeft,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useTheme } from '../../theme';
import {animation} from '../../theme';
import {BorderRadius} from '../../theme/shadows';
import {
  ProfileMenuIcon,
  getMenuIconColorScheme,
  type MenuIconColorScheme,
} from './ProfileMenuIcon';

export interface MenuItemData {
  icon: string;
  title: string;
  subtitle: string;
  route: string;
  colorScheme?: MenuIconColorScheme;
  badge?: string;
}

interface ProfileMenuItemProps {
  item: MenuItemData;
  index: number;
  isLast: boolean;
  onPress: () => void;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export const ProfileMenuItem: React.FC<ProfileMenuItemProps> = React.memo(
  ({ item, index, isLast, onPress }) => {
    const {
      colors: themeColors,
      typography,
      spacing: themeSpacing,
    } = useTheme();
    const scale = useSharedValue(1);

    const colorScheme = item.colorScheme || getMenuIconColorScheme(index);

    const handlePressIn = useCallback(() => {
      scale.value = withSpring(0.98, animation.spring.gentle);
    }, [scale]);

    const handlePressOut = useCallback(() => {
      scale.value = withSpring(1, animation.spring.gentle);
    }, [scale]);

    const animatedStyle = useAnimatedStyle(() => {
      return {
        transform: [{ scale: scale.value }],
      };
    });

    const styles = useMemo(
      () => createStyles(themeColors, typography, themeSpacing),
      [themeColors, typography, themeSpacing],
    );

    return (
      <Animated.View
        entering={FadeInLeft.duration(animation.duration.normal).delay(
          index * 60,
        )}
      >
        <AnimatedTouchable
          style={[
            styles.menuItem,
            isLast && styles.menuItemLast,
            animatedStyle,
          ]}
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={1}
        >
          <ProfileMenuIcon
            icon={item.icon}
            colorScheme={colorScheme}
            size="medium"
          />
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>{item.title}</Text>
            <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
          </View>
          {item.badge && (
            <View style={styles.menuBadge}>
              <Text style={styles.menuBadgeText}>{item.badge}</Text>
            </View>
          )}
          <Text style={styles.menuArrow}>›</Text>
        </AnimatedTouchable>
      </Animated.View>
    );
  },
);

ProfileMenuItem.displayName = 'ProfileMenuItem';

const createStyles = (
  colors: ReturnType<typeof useTheme>['colors'],
  typography: ReturnType<typeof useTheme>['typography'],
  spacing: ReturnType<typeof useTheme>['spacing'],
) =>
  StyleSheet.create({
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.gray[200] + '20',
    },
    menuItemLast: {
      borderBottomWidth: 0,
    },
    menuContent: {
      flex: 1,
      marginLeft: spacing.md,
    },
    menuTitle: {
      fontSize: typography.size.body,
      fontWeight: typography.weight.medium,
      color: colors.text.primary,
    },
    menuSubtitle: {
      fontSize: typography.size.caption,
      color: colors.text.tertiary,
      marginTop: 2,
    },
    menuBadge: {
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
      backgroundColor: colors.status.error,
      borderRadius: BorderRadius.sm,
      marginRight: spacing.sm,
    },
    menuBadgeText: {
      fontSize: typography.size.small,
      fontWeight: typography.weight.bold,
      color: colors.text.inverse,
    },
    menuArrow: {
      fontSize: 20,
      color: colors.text.tertiary,
    },
  });

export default ProfileMenuItem;
