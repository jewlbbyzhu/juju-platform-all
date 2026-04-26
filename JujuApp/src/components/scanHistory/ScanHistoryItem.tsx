import React from 'react';
import { View, Text, Pressable, ViewStyle, TextStyle } from 'react-native';
import Animated, {
  FadeInRight,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import {
  useTheme,
  spacing,
  typography,
  BorderRadius,
  animation,
} from '../../theme';
import type {
  ScanRecord,
  TypeConfigMap,
  StatusConfigMap,
} from './ScanHistoryTypes';

interface ScanHistoryItemProps {
  item: ScanRecord;
  typeConfig: TypeConfigMap;
  statusConfig: StatusConfigMap;
  index: number;
  onPress?: (item: ScanRecord) => void;
}

const ScanHistoryItem: React.FC<ScanHistoryItemProps> = ({
  item,
  typeConfig,
  statusConfig,
  index,
  onPress,
}) => {
  const { colors } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, animation.spring.gentle);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, animation.spring.gentle);
  };

  const config = typeConfig[item.type] || typeConfig.default;
  const status = item.status ? statusConfig[item.status] : null;

  const formatTime = (timeString: string): string => {
    const date = new Date(timeString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } else if (days === 1) {
      return '昨天';
    } else if (days < 7) {
      return `${days}天前`;
    } else {
      return date.toLocaleDateString('zh-CN', {
        month: 'short',
        day: 'numeric',
      });
    }
  };

  // 使用设计系统替代 StyleSheet
  const itemContainerStyle: ViewStyle = {
    marginVertical: spacing.xs,
  };

  const cardStyle: ViewStyle = {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: spacing.md,
    backgroundColor: colors.background.card,
    borderColor: colors.border,
  };

  const headerStyle: ViewStyle = {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  };

  const typeBadgeStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: config.bgColor,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: BorderRadius.full,
  };

  const typeIconStyle: TextStyle = {
    fontSize: typography.size.body2,
    marginRight: spacing.xs,
  };

  const typeLabelStyle: TextStyle = {
    fontSize: typography.size.caption,
    color: config.color,
    fontWeight: typography.weight.semibold,
  };

  const rightSectionStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
  };

  const statusBadgeStyle: ViewStyle = {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.xs,
    backgroundColor: status ? status.color + '20' : 'transparent',
    width: 20,
    height: 20,
    borderRadius: BorderRadius.full,
  };

  const statusTextStyle: TextStyle = {
    fontSize: typography.size.caption,
    color: status ? status.color : colors.text.tertiary,
    fontWeight: typography.weight.bold,
  };

  const timeTextStyle: TextStyle = {
    fontSize: typography.size.caption,
    color: colors.text.tertiary,
  };

  const contentStyle: TextStyle = {
    fontSize: typography.size.body2,
    color: colors.text.primary,
    lineHeight: typography.size.body2 * typography.lineHeight.normal,
  };

  return (
    <Animated.View
      entering={FadeInRight.delay(index * 50).springify()}
      style={[itemContainerStyle, animatedStyle]}
    >
      <Pressable
        style={cardStyle}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={() => onPress?.(item)}
      >
        <View style={headerStyle}>
          <View style={typeBadgeStyle}>
            <Text style={typeIconStyle}>{config.icon}</Text>
            <Text style={typeLabelStyle}>{config.label}</Text>
          </View>
          <View style={rightSectionStyle}>
            {status && (
              <View style={statusBadgeStyle}>
                <Text style={statusTextStyle}>{status.icon}</Text>
              </View>
            )}
            <Text style={timeTextStyle}>{formatTime(item.createdAt)}</Text>
          </View>
        </View>
        <Text style={contentStyle} numberOfLines={2}>
          {item.content}
        </Text>
      </Pressable>
    </Animated.View>
  );
};

export default ScanHistoryItem;
