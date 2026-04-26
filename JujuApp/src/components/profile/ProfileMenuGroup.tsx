import React, { useMemo } from 'react';
import {Text, StyleSheet} from 'react-native';
import Animated, {
  FadeInUp,



} from 'react-native-reanimated';
import { GlassCard } from '../../components';
import { useTheme } from '../../theme';
import {spacing, animation} from '../../theme';
import { BorderRadius } from '../../theme/shadows';
import type { MenuItemData } from './ProfileMenuItem';
import { ProfileMenuItem } from './ProfileMenuItem';

export interface MenuGroupData {
  title: string;
  items: MenuItemData[];
}

interface ProfileMenuGroupProps {
  group: MenuGroupData;
  groupIndex: number;
  onItemPress: (route: string) => void;
}

export const ProfileMenuGroup: React.FC<ProfileMenuGroupProps> = React.memo(
  ({ group, groupIndex, onItemPress }) => {
    const {
      colors: themeColors,
      typography,
      spacing: themeSpacing,
      layout,
    } = useTheme();

    const styles = useMemo(
      () => createStyles(themeColors, typography, themeSpacing, layout),
      [themeColors, typography, themeSpacing, layout],
    );

    return (
      <Animated.View
        entering={FadeInUp.duration(animation.duration.normal)
          .delay(spacing.md + groupIndex * spacing.xl)
          .springify()}
        style={styles.menuGroup}
      >
        <Text style={styles.menuGroupTitle}>{group.title}</Text>
        <GlassCard intensity="medium" style={styles.menuCard}>
          {group.items.map((item, itemIndex) => (
            <ProfileMenuItem
              key={`${group.title}-${item.title}`}
              item={item}
              index={groupIndex * 10 + itemIndex}
              isLast={itemIndex === group.items.length - 1}
              onPress={() => onItemPress(item.route)}
            />
          ))}
        </GlassCard>
      </Animated.View>
    );
  },
);

ProfileMenuGroup.displayName = 'ProfileMenuGroup';

const createStyles = (
  colors: ReturnType<typeof useTheme>['colors'],
  typography: ReturnType<typeof useTheme>['typography'],
  spacing: ReturnType<typeof useTheme>['spacing'],
  layout: ReturnType<typeof useTheme>['layout'],
) =>
  StyleSheet.create({
    menuGroup: {
      marginBottom: spacing.lg,
    },
    menuGroupTitle: {
      fontSize: typography.size.body,
      fontWeight: typography.weight.semibold,
      color: colors.text.secondary,
      marginHorizontal: layout.screenPadding,
      marginBottom: spacing.sm,
      marginTop: spacing.sm,
    },
    menuCard: {
      marginHorizontal: layout.screenPadding,
      marginVertical: 0,
      borderRadius: BorderRadius.lg,
    },
  });

export default ProfileMenuGroup;
