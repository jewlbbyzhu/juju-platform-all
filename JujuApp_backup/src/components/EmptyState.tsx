import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle, TextStyle } from 'react-native';
import { colors, spacing, BorderRadius, typography } from '../theme';

// 矢量图标映射（使用 Unicode 符号替代 emoji）
const ICON_MAP: Record<string, string> = {
  empty: '\u25A1',      // 空心方块
  order: '\u25F8',      // 购物车符号
  notification: '\u25CE', // 铃铛符号
  search: '\u25A0',     // 搜索符号
  network: '\u25A3',    // 网络符号
  error: '\u26A0',      // 警告符号
};

interface EmptyStateProps {
  icon?: string;
  iconType?: 'empty' | 'order' | 'notification' | 'search' | 'network' | 'error';
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  style?: ViewStyle;
  titleStyle?: TextStyle;
  descriptionStyle?: TextStyle;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  iconType = 'empty',
  title = '暂无数据',
  description = '这里还没有内容，去看看别的吧',
  actionText,
  onAction,
  style,
  titleStyle,
  descriptionStyle,
}) => {
  const iconSymbol = icon || ICON_MAP[iconType] || ICON_MAP.empty;

  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{iconSymbol}</Text>
      </View>
      {title && <Text style={[styles.title, titleStyle]}>{title}</Text>}
      {description && <Text style={[styles.description, descriptionStyle]}>{description}</Text>}
      {actionText && onAction && (
        <TouchableOpacity style={styles.button} onPress={onAction} activeOpacity={0.8}>
          <Text style={styles.buttonText}>{actionText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export const EmptyOrder: React.FC<Omit<EmptyStateProps, 'icon' | 'iconType' | 'title' | 'description'>> = (props) => (
  <EmptyState iconType="order" title="暂无订单" description="您还没有任何订单，去逛逛吧" {...props} />
);

export const EmptyNotification: React.FC<Omit<EmptyStateProps, 'icon' | 'iconType' | 'title' | 'description'>> = (props) => (
  <EmptyState iconType="notification" title="暂无通知" description="您还没有收到任何通知" {...props} />
);

export const EmptySearch: React.FC<Omit<EmptyStateProps, 'icon' | 'iconType' | 'title' | 'description'>> = (props) => (
  <EmptyState iconType="search" title="没有找到" description="换个关键词试试看" {...props} />
);

export const EmptyNetwork: React.FC<Omit<EmptyStateProps, 'icon' | 'iconType' | 'title' | 'description'>> = (props) => (
  <EmptyState 
    iconType="network"
    title="网络异常" 
    description="网络连接失败，请检查网络设置" 
    actionText="重新加载"
    {...props} 
  />
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing['3xl'],
    paddingVertical: spacing['4xl'],
    backgroundColor: colors.background.secondary,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius['2xl'],
    backgroundColor: colors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  icon: {
    fontSize: typography.size.display,
    color: colors.primary.main,
  },
  title: {
    fontSize: typography.size.h3,
    fontWeight: typography.weight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: typography.size.body2,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: typography.size.body2 * typography.lineHeight.normal,
  },
  button: {
    marginTop: spacing['2xl'],
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.primary.main,
    borderRadius: BorderRadius.xl,
  },
  buttonText: {
    color: colors.text.inverse,
    fontSize: typography.size.body2,
    fontWeight: typography.weight.semibold,
  },
});

export default EmptyState;
