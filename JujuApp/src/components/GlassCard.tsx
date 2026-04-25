import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native';
import { glassmorphism, GlassIntensity } from '../theme/glassmorphism';
import { colors } from '../theme/colors';

interface GlassCardProps {
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  subtitleStyle?: StyleProp<TextStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  footer?: React.ReactNode;
  headerRight?: React.ReactNode;
  intensity?: GlassIntensity;
  glow?: boolean;
  glowColor?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({
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
  intensity = 'medium',
  glow = false,
  glowColor = colors.primary.main,
}) => {
  const getIntensityStyle = (): ViewStyle => {
    switch (intensity) {
      case 'light':
        return { backgroundColor: 'rgba(30, 41, 59, 0.5)' };
      case 'heavy':
        return { backgroundColor: 'rgba(30, 41, 59, 0.9)' };
      default:
        return { backgroundColor: 'rgba(30, 41, 59, 0.7)' };
    }
  };

  const getGlowStyle = (): ViewStyle => {
    if (!glow) return {};
    return {
      shadowColor: glowColor,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.04,
      shadowRadius: 20,
      elevation: 10,
    };
  };

  const CardWrapper = onPress ? TouchableOpacity : View;

  return (
    <CardWrapper
      style={[
        styles.container,
        glassmorphism.card,
        getIntensityStyle(),
        getGlowStyle(),
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      {(title || headerRight) && (
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            {title && (
              <Text style={[styles.title, titleStyle]}>{title}</Text>
            )}
            {subtitle && (
              <Text style={[styles.subtitle, subtitleStyle]}>{subtitle}</Text>
            )}
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
    borderRadius: 20,
    marginVertical: 8,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 4,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
});

export default GlassCard;
