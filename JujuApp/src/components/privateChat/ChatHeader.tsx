import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { glassmorphism, animation, spacing, typography } from '../../theme';

interface ChatHeaderProps {
  userName: string;
  isOnline?: boolean;
  onBackPress: () => void;
  onMorePress?: () => void;
}

export function ChatHeader({
  userName,
  isOnline = true,
  onBackPress,
  onMorePress,
}: ChatHeaderProps) {
  const theme = useTheme();
  const colors = theme.colors;
  const slideAnim = useRef(new Animated.Value(-50)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        damping: 15,
        stiffness: 150,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: animation.duration.normal,
        useNativeDriver: true,
      }),
    ]).start();
  }, [slideAnim, opacityAnim]);

  const styles = StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      ...glassmorphism.header,
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.background.tertiary,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    backIcon: {
      fontSize: typography.size.h3,
      color: colors.text.inverse,
    },
    headerCenter: {
      alignItems: 'center',
    },
    headerTitle: {
      fontSize: typography.size.h4,
      fontWeight: typography.weight.bold,
      color: colors.text.inverse,
      letterSpacing: 0.5,
    },
    onlineIndicator: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: spacing.xs,
    },
    onlineDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.status.success,
      marginRight: spacing.xs,
    },
    onlineText: {
      fontSize: typography.size.small,
      color: colors.status.success,
    },
    moreButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.background.tertiary,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    moreIcon: {
      fontSize: typography.size.h3,
      color: colors.text.inverse,
    },
  });

  return (
    <Animated.View
      style={[
        styles.header,
        {
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
        <Text style={styles.backIcon}>←</Text>
      </TouchableOpacity>
      <View style={styles.headerCenter}>
        <Text style={styles.headerTitle}>{userName}</Text>
        {isOnline && (
          <View style={styles.onlineIndicator}>
            <View style={styles.onlineDot} />
            <Text style={styles.onlineText}>在线</Text>
          </View>
        )}
      </View>
      <TouchableOpacity onPress={onMorePress} style={styles.moreButton}>
        <Text style={styles.moreIcon}>⋮</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default ChatHeader;
