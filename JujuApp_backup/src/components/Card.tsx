import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle, TextStyle } from 'react-native';
import { colors, spacing, BorderRadius, typography, Shadows } from '../theme';

interface CardProps {
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  titleStyle?: TextStyle;
  subtitleStyle?: TextStyle;
  contentStyle?: ViewStyle;
  footer?: React.ReactNode;
  headerRight?: React.ReactNode;
  shadow?: keyof typeof Shadows | 'none';
  margin?: boolean;
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  children,
  onPress,
  style,
  titleStyle,
  subtitleStyle,
  contentStyle,
  footer,
  headerRight,
  shadow = 'small',
  margin = false,
}) => {
  const CardWrapper = onPress ? TouchableOpacity : View;

  const shadowStyle = shadow === 'none' ? {} : Shadows[shadow];

  return (
    <CardWrapper 
      style={[
        styles.container, 
        shadowStyle,
        margin && styles.containerMargin,
        style
      ]} 
      onPress={onPress} 
      activeOpacity={0.8}
    >
      {(title || headerRight) && (
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            {title && <Text style={[styles.title, titleStyle]}>{title}</Text>}
            {subtitle && <Text style={[styles.subtitle, subtitleStyle]}>{subtitle}</Text>}
          </View>
          {headerRight && <View>{headerRight}</View>}
        </View>
      )}
      <View style={[styles.content, contentStyle]}>{children}</View>
      {footer && <View style={styles.footer}>{footer}</View>}
    </CardWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.card,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  containerMargin: {
    marginHorizontal: spacing.lg,
    marginVertical: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: typography.size.h4,
    fontWeight: typography.weight.semibold,
    color: colors.text.primary,
  },
  subtitle: {
    fontSize: typography.size.caption,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    paddingTop: spacing.md,
  },
});

export default Card;
