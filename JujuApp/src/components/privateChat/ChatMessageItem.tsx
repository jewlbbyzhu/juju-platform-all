import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, Animated } from 'react-native';
import { useTheme, spacing, typography, animation as anim } from '../../theme';
import { GlassCard } from '../GlassCard';

export interface Message {
  id: string;
  content: string;
  is_self: boolean;
  created_at: string;
  avatar?: string;
}

interface ChatMessageItemProps {
  message: Message;
  index?: number;
  isNew?: boolean;
}

export function ChatMessageItem({
  message,
  index = 0,
  isNew = false,
}: ChatMessageItemProps) {
  const theme = useTheme();
  const colors = theme.colors;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const scaleAnim = useRef(new Animated.Value(isNew ? 0.8 : 1)).current;

  useEffect(() => {
    const entranceDelay = index * 50;
    Animated.sequence([
      Animated.delay(entranceDelay),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: anim.duration.normal,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: anim.duration.normal,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    if (isNew) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        damping: 12,
        stiffness: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [fadeAnim, slideAnim, scaleAnim, index, isNew]);

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const styles = StyleSheet.create({
    messageItem: {
      flexDirection: 'row',
      marginBottom: spacing.lg,
      alignItems: 'flex-end',
    },
    messageItemSelf: {
      flexDirection: 'row-reverse',
    },
    avatar: {
      width: 36,
      height: 36,
      borderRadius: 18,
      borderWidth: 2,
      borderColor: colors.border,
    },
    messageContent: {
      maxWidth: '70%',
      marginHorizontal: spacing.sm + 2,
    },
    bubble: {
      marginVertical: 0,
      padding: 0,
    },
    bubbleSelf: {
      backgroundColor: colors.primary.main,
      borderBottomRightRadius: 4,
    },
    bubbleOther: {
      borderBottomLeftRadius: 4,
    },
    messageText: {
      fontSize: typography.size.body,
      color: colors.text.inverse,
      lineHeight: 22,
    },
    timeText: {
      fontSize: typography.size.small,
      color: colors.text.tertiary,
      marginTop: spacing.xs,
    },
    timeTextSelf: {
      textAlign: 'right',
    },
  });

  return (
    <Animated.View
      style={[
        styles.messageItem,
        message.is_self && styles.messageItemSelf,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
        },
      ]}
    >
      {!message.is_self && (
        <Image
          source={{ uri: message.avatar || 'https://i.pravatar.cc/150?u=1' }}
          style={styles.avatar}
        />
      )}
      <View style={styles.messageContent}>
        <GlassCard
          style={[
            styles.bubble,
            message.is_self ? styles.bubbleSelf : styles.bubbleOther,
          ]}
          intensity={message.is_self ? 'medium' : 'light'}
        >
          <Text style={styles.messageText}>{message.content}</Text>
        </GlassCard>
        <Text style={[styles.timeText, message.is_self && styles.timeTextSelf]}>
          {formatTime(message.created_at)}
        </Text>
      </View>
      {message.is_self && (
        <Image
          source={{ uri: message.avatar || 'https://i.pravatar.cc/150?u=2' }}
          style={styles.avatar}
        />
      )}
    </Animated.View>
  );
}

export default ChatMessageItem;
