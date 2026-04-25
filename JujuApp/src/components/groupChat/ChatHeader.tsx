import React, { memo, useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  Platform,
  ViewStyle,
  TextStyle,
} from 'react-native';
import {useTheme, spacing, typography} from '../../theme';
import { glassmorphism } from '../../theme/glassmorphism';

interface ChatHeaderProps {
  groupName: string;
  memberCount: number;
  onBackPress: () => void;
  onMorePress?: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = memo(
  ({ groupName, memberCount, onBackPress, onMorePress }) => {
    const { colors } = useTheme();

    const containerStyle = useMemo(
      (): ViewStyle => ({
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        paddingTop: Platform.OS === 'ios' ? 50 : 20,
        paddingBottom: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        backgroundColor: colors.background.primary,
      }),
      [colors.background.primary, colors.border],
    );

    const backBtnStyle = useMemo(
      (): ViewStyle => ({
        padding: spacing.sm,
        width: 40,
      }),
      [],
    );

    const backTextStyle = useMemo(
      (): TextStyle => ({
        fontSize: 22,
        fontWeight: typography.weight.semibold,
        color: colors.text.primary,
      }),
      [colors.text.primary],
    );

    const headerCenterStyle = useMemo(
      (): ViewStyle => ({
        alignItems: 'center',
        flex: 1,
      }),
      [],
    );

    const headerTitleStyle = useMemo(
      (): TextStyle => ({
        fontSize: typography.size.h3,
        fontWeight: typography.weight.bold,
        color: colors.text.primary,
      }),
      [colors.text.primary],
    );

    const memberCountStyle = useMemo(
      (): TextStyle => ({
        fontSize: typography.size.caption,
        color: colors.text.tertiary,
        marginTop: spacing.xs,
      }),
      [colors.text.tertiary],
    );

    const moreBtnStyle = useMemo(
      (): ViewStyle => ({
        padding: spacing.sm,
        width: 40,
        alignItems: 'flex-end',
      }),
      [],
    );

    const moreTextStyle = useMemo(
      (): TextStyle => ({
        fontSize: typography.size.body2,
        fontWeight: typography.weight.bold,
        letterSpacing: 2,
        color: colors.text.secondary,
      }),
      [colors.text.secondary],
    );

    return (
      <View style={[containerStyle, glassmorphism.header]}>
        <Pressable onPress={onBackPress} style={backBtnStyle}>
          <Text style={backTextStyle}>←</Text>
        </Pressable>

        <View style={headerCenterStyle}>
          <Text style={headerTitleStyle} numberOfLines={1}>
            {groupName}
          </Text>
          <Text style={memberCountStyle}>
            {memberCount}人在线
          </Text>
        </View>

        <Pressable onPress={onMorePress} style={moreBtnStyle}>
          <Text style={moreTextStyle}>•••</Text>
        </Pressable>
      </View>
    );
  },
);

ChatHeader.displayName = 'ChatHeader';

export default ChatHeader;
